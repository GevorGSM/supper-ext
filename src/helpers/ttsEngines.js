import { brApi, defaultTTSConfig } from './constants';

export const browser_tts_engine = brApi.tts ? new BrowserTtsEngine() : (typeof speechSynthesis != 'undefined' ? new WebSpeechEngine() : new DummyTtsEngine());
export const remote_tts_engine = new RemoteTtsEngine(defaultTTSConfig.serviceUrl, (typeof readAloudManifest != 'undefined') ? readAloudManifest : brApi.runtime.getManifest());


function BrowserTtsEngine() {
  this.speak = function(text, options, onEvent) {
    brApi.tts.speak(text, {
      voiceName: options.voice.voiceName,
      lang: options.lang,
      rate: options.rate,
      pitch: +options.pitch,
      volume: +options.volume,
      requiredEventTypes: ['start', 'end'],
      desiredEventTypes: ['start', 'end', 'error'],
      onEvent: onEvent
    })
  };
  this.stop = brApi.tts.stop;
  this.pause = brApi.tts.pause;
  this.resume = brApi.tts.resume;
  this.isSpeaking = brApi.tts.isSpeaking;
  this.getVoices = function() {
    return new Promise(function(fulfill) {
      brApi.tts.getVoices(fulfill);
    })
  }
}

function RemoteTtsEngine(serviceUrl, manifest) {
  const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  const audio = document.createElement('AUDIO');
  const prefetchAudio = document.createElement('AUDIO');
  let isSpeaking = false;
  let nextStartTime = 0;
  const voices = manifest.tts_engine.voices.map((voice) => ({voiceName: voice.voice_name, lang: voice.lang}));
  const voiceMap = {};
  let waitTimer;

  for (let i=0; i<voices.length; i++) voiceMap[voices[i].voiceName] = voices[i];

  this.speak = function(utterance, options, onEvent) {
    if (!options.volume) {
      options.volume = 1;
    }
    if (!options.rate) {
      options.rate = 1;
    }
    audio.pause();
    if (!iOS) {
      audio.volume = +options.volume;
      audio.defaultPlaybackRate = +options.rate;
    }
    audio.src = getAudioUrl(utterance, options.lang, options.voice.voiceName);
    audio.oncanplay = function() {
      const waitTime = nextStartTime - new Date().getTime();
      if (waitTime > 0) waitTimer = setTimeout(audio.play.bind(audio), waitTime);
      else audio.play();
      isSpeaking = true;
    };
    audio.onplay = onEvent.bind(null, {type: 'start', charIndex: 0});
    audio.onended = function() {
      onEvent({type: 'end', charIndex: utterance.length});
      isSpeaking = false;
    };
    audio.onerror = function() {
      onEvent({type: 'error', errorMessage: audio.error.message});
      isSpeaking = false;
    };
    audio.load();
  };
  this.isSpeaking = function(callback) {
    callback(isSpeaking);
  };
  this.pause =
    this.stop = function() {
      clearTimeout(waitTimer);
      audio.pause();
    };
  this.resume = function() {
    audio.play();
  };
  this.prefetch = function(utterance, options) {
    if (!iOS) {
      prefetchAudio.src = getAudioUrl(utterance, options.lang, options.voice.voiceName);
      prefetchAudio.load();
    }
  };
  this.setNextStartTime = function(time, options) {
    if (!iOS)
      nextStartTime = time || 0;
  };
  this.getVoices = function() {
    return voices;
  };
  this.hasVoice = function(voiceName) {
    return voiceMap[voiceName] != null;
  };
  function getAudioUrl(utterance, lang, voiceName) {
    return serviceUrl + '/read-aloud/speak/' + lang + '/' + encodeURIComponent(voiceName) + '?q=' + encodeURIComponent(utterance);
  }
}

function WebSpeechEngine() {
  let utter;

  this.speak = function(text, options, onEvent) {
    utter = new SpeechSynthesisUtterance();
    utter.text = text;
    utter.voice = options.voice;
    if (options.lang) {
      utter.lang = options.lang;
    }
    if (options.pitch) {
      utter.pitch = +options.pitch;
    }
    if (options.rate) {
      utter.rate = options.rate;
    }
    if (options.volume) {
      utter.volume = +options.volume;
    }
    utter.onstart = onEvent.bind(null, {type: 'start', charIndex: 0});
    utter.onend = onEvent.bind(null, {type: 'end', charIndex: text.length});
    utter.onerror = function(event) {
      onEvent({type: 'error', errorMessage: event.error});
    };
    speechSynthesis.speak(utter);
  };

  this.stop = function() {
    if (utter) utter.onend = null;
    speechSynthesis.cancel();
  };

  this.pause = function() {
    speechSynthesis.pause();
  };

  this.resume = function() {
    speechSynthesis.resume();
  };

  this.isSpeaking = function(callback) {
    callback(speechSynthesis.speaking);
  };

  this.getVoices = function() {
    return new Promise(function(fulfill) {
      const voices = speechSynthesis.getVoices();
      if (voices.length) fulfill(voices);
      else speechSynthesis.onvoiceschanged = function() {
        fulfill(speechSynthesis.getVoices());
      }
    })
      .then(function(voices) {
        for (let i=0; i<voices.length; i++) voices[i].voiceName = voices[i].name;
        return voices;
      })
  }
}

function DummyTtsEngine() {
  this.getVoices = function() {
    return Promise.resolve([]);
  }
}
