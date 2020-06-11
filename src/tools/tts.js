import {
  ajaxPost,
  getSettings,
  isGoogleNative,
  isPremiumVoice,
  isRemoteVoice,
  parseLang,
} from '../helpers/utils';
import { brApi, defaultTTSConfig, SETTING_TYPES } from '../helpers/constants';
import { browser_tts_engine, remote_tts_engine } from '../helpers/ttsEngines';
import { Speech } from '../helpers/speech';

export function getVoices() {
  return browser_tts_engine.getVoices()
    .then(function(voices) {
      // add the remote voices if browser didn't return them (i.e. because it doesn't support the ttsEngine declaration in the manifest)
      const remoteVoices = remote_tts_engine.getVoices();

      if (!voices.some(function(voice) {
        return voice.voiceName === remoteVoices[0].voiceName;
      })) {
        voices = voices.concat(remoteVoices);
      }

      return voices;
    })
}

export function getSpeechVoice(voiceName, lang) {
  return getVoices()
    .then((voices) => {
      if (voiceName) {
        return findVoiceByName(voices, voiceName);
      }
      if (lang) {
        return (
          findVoiceByLang(voices.filter((voice) => {
            return isGoogleNative(voice.voiceName)
          }), lang)
          || findVoiceByLang(voices.filter((voice) => {
            return !isRemoteVoice(voice.voiceName)
          }), lang)
          || findVoiceByLang(voices.filter((voice) => {
            return !isPremiumVoice(voice.voiceName)
          }), lang)
          || findVoiceByLang(voices, lang)
        )
      }
      return null;
    })
}

export function findVoiceByName(voices, name) {
  for (const voice of voices) {
    if (voice.voiceName === name) {
      return voice;
    }
  }
  return null;
}

export function combineTexts(output, texts, minChars) {
  for (let i = 0; i < texts.length && output.length < minChars; i++) {
    output += (texts[i] + ' ');
  }
  return output;
}

export function serverDetectLanguage(text) {
  return ajaxPost(defaultTTSConfig.serviceUrl + '/read-aloud/detect-language', {text: text}, 'json')
    .then(JSON.parse)
    .then((list) => {
      return list[0] && list[0].language
    })
}

export function browserDetectLanguage(text) {
  if (!brApi.i18n.detectLanguage) {
    return Promise.resolve(null);
  }
  return new Promise((fulfill) => {
    brApi.i18n.detectLanguage(text, fulfill);
  }).then((result) => {
    if (result) {
      const list = result.languages.filter((item) => {
        return item.language !== 'und';
      });
      list.sort((a,b) => (b.percentage-a.percentage));
      return list[0] && list[0].language;
    }
    return null;
  })
}

export function detectLanguageOf(text) {
  return browserDetectLanguage(text)
    .then(function(result) {
      return result || serverDetectLanguage(text);
    })
}

export function findVoiceByLang(voices, lang) {
  const speechLang = parseLang(lang);
  const match = {};
  voices.forEach((voice) => {
    if (voice.lang) {
      const voiceLang = parseLang(voice.lang);
      if (voiceLang.lang === speechLang.lang) {
        if (voiceLang.rest === speechLang.rest) {
          if (voice.gender === 'female') {
            match.first = match.first || voice;
          } else {
            match.second = match.second || voice;
          }
        } else if (!voiceLang.rest) {
          match.third = match.third || voice;
        } else {
          if (voiceLang.lang === 'en' && voiceLang.rest === 'us') {
            match.fourth = voice;
          } else {
            match.fourth = match.fourth || voice;
          }
        }
      }
    }
  });
  return match.first || match.second || match.third || match.fourth;
}

export function getSpeech(texts, fromTranslation = false) {
  return getSettings()
    .then(({
             [SETTING_TYPES.voiceRate]: rate,
             [SETTING_TYPES.voicePitch]: pitch,
             [SETTING_TYPES.voiceVolume]: volume,
             [SETTING_TYPES.voiceLang]: lang,
             [SETTING_TYPES.voiceName]: voiceName,
           }) => {

      const options = {
        rate: rate || defaultTTSConfig.rate,
        pitch: +pitch || defaultTTSConfig.pitch,
        volume: +volume || defaultTTSConfig.volume,
        lang: fromTranslation ? '' : (lang || defaultTTSConfig.language)
      };

      return getSpeechVoice(fromTranslation ? '' : voiceName, options.lang)
        .then((voice) => {
          if (!voice) {
            throw new Error(JSON.stringify({code: 'error_no_voice', lang: options.lang}));
          }
          options.voice = voice;
          return new Speech(texts, options);
        })
    });
}

let activeSpeech;

export function readText(text) {
  if (activeSpeech) {
    activeSpeech.stop();
  }

  getSpeech(text.split(/(?:\r?\n){2,}/))
    .then((speech) => {
      activeSpeech = speech;
      speech.play();

      activeSpeech.options.onEnd = (err) => {
        if (err) {
          console.error(error);
        } else {
          activeSpeech = null;
        }
      };
    });
}
