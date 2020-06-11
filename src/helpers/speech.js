import {
  isGoogleTranslate,
  isGoogleNative,
  isRemoteVoice,
} from './utils';
import { EastAsianPunctuator } from '../punctuators/eastAsianPunctuator';
import { browser_tts_engine, remote_tts_engine } from './ttsEngines';
import { LatinPunctuator } from '../punctuators/latinPunctuator';
import { CharBreaker } from '../textBreackers/charBreaker';
import { WordBreaker } from '../textBreackers/wordBreaker';
import { TimeoutTtsEngine } from './timeoutTtsEngine';

const STATE_TYPES = {
  IDLE: 'IDLE',
  PAUSED: 'PAUSED',
  PLAYING: 'PLAYING',
  LOADING: 'LOADING',
};

export class Speech {
  constructor(texts, options) {
    this.options = options;
    this.texts = texts;

    options.rate = (options.rate || 1) * (isGoogleNative(options.voice.voiceName) ? 0.9
      : (isGoogleTranslate(options.voice.voiceName) ? 1.1 : 1));

    for (let i = 0; i < texts.length; i++) {
      if (/\w$/.test(texts[i])) {
        texts[i] += '.';
      }
    }
    if (texts.length) {
      this.texts = this.getChunks(texts.join('\n\n'));
    }

    this.engine = options.engine || this.pickEngine();

    this.pauseDuration = isGoogleTranslate(options.voice.voiceName) ? 0 : (650 / options.rate);
    this.state = STATE_TYPES.IDLE;
    this.index = 0;
    this.delayedPlayTimer = null;
  }

  pickEngine() {
    if (isRemoteVoice(this.options.voice.voiceName)) {
      return remote_tts_engine;
    }

    if (isGoogleNative(this.options.voice.voiceName)) {
      return new TimeoutTtsEngine(browser_tts_engine, 16*1000);
    }
    return browser_tts_engine;
  }

  getChunks(text) {
    const isEA = /^zh|ko|ja/.test(this.options.lang);
    const punctuator = isEA ? new EastAsianPunctuator() : new LatinPunctuator();

    if (isGoogleNative(this.options.voice.voiceName)) {
      const wordLimit = (/^(de|ru)/.test(this.options.lang) ? 32 : 36) * (isEA ? 2 : 1) * this.options.rate;
      return new WordBreaker(wordLimit, punctuator).breakText(text);
    }

    if (isGoogleTranslate(this.options.voice.voiceName)) {
      return new CharBreaker(200, punctuator).breakText(text);
    }

    return new CharBreaker(500, punctuator, 200).breakText(text);
  }

  getState = () => (
    new Promise((fulfill) => {
      this.engine.isSpeaking((isSpeaking) => {
        if (this.state === STATE_TYPES.PLAYING) {
          fulfill(isSpeaking ? STATE_TYPES.PLAYING : STATE_TYPES.LOADING);
        } else {
          fulfill(STATE_TYPES.PAUSED);
        }
      })
    })
  );

  getPosition() {
    return {
      index: this.index,
      texts: this.texts,
    }
  }

  play = () => {
    if (this.index >= this.texts.length) {
      this.state = STATE_TYPES.IDLE;

      if (this.options.onEnd) {
        this.options.onEnd();
      }
      return Promise.resolve();
    } else if (this.state === STATE_TYPES.PAUSED) {
      this.state = STATE_TYPES.PLAYING;
      this.engine.resume();
      return Promise.resolve();
    } else {
      this.state = STATE_TYPES.PLAYING;
      this.startTime = new Date().getTime();
      return this.speak(this.texts[this.index],
        () => {
          this.state = STATE_TYPES.IDLE;
          if (this.engine.setNextStartTime) {
            this.engine.setNextStartTime(new Date().getTime() + this.pauseDuration, this.options);
          }
          this.index++;
          this.play();
        },
        (err) => {
          this.state = STATE_TYPES.IDLE;
          if (this.options.onEnd) {
            this.options.onEnd(err);
          }
        })
        .then(() => {
          if (this.texts[this.index + 1] && this.engine.prefetch) {
            this.engine.prefetch(this.texts[this.index + 1], this.options);
          }
        })
    }
  };

  delayedPlay() {
    clearTimeout(this.delayedPlayTimer);
    this.delayedPlayTimer = setTimeout(this.play, 750);
    return Promise.resolve();
  }

  pause = () => {
    if (this.engine.pause) {
      this.engine.pause();
      this.state = STATE_TYPES.PAUSED;
      return Promise.resolve();
    }
    return stop();
  };

  stop = () => {
    this.engine.stop();
    this.state = STATE_TYPES.IDLE;
    return Promise.resolve();
  };

  forward = () => {
    if (this.index + 1 < this.texts.length) {
      this.index++;
      return this.delayedPlay();
    }
    return Promise.reject(new Error('Can`t forward, at end'));
  };

  rewind = () => {
    if (this.state === STATE_TYPES.PLAYING && new Date().getTime() - this.startTime > 3 * 1000) {
      return this.play();
    }

    if (this.index > 0) {
      this.index--;
      return this.play();
    }
    return Promise.reject(new Error('Can`t rewind, at beginning'));
  };

  gotoEnd = () => {
    this.index = this.texts.length && this.texts.length - 1;
  };

  speak = (text, onEnd, onError) => (
    new Promise((fulfill) => {
      this.engine.speak(text, this.options, (event) => {
        if (event.type === 'start') {
          fulfill();
        } else if (event.type === 'end') {
          onEnd();
        } else if (event.type === 'error') {
          onError(new Error(event.errorMessage || 'Unknown TTS error'));
        }
      })
    })
  );
}
