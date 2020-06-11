import $ from 'jquery'

import { brApi, SETTING_NAMES } from './constants';
import { remote_tts_engine } from './ttsEngines';

export function setI18nText() {
  $('[data-i18n]').each(function() {
    const key = $(this).data('i18n');
    const text = brApi.i18n.getMessage(key);
    if ($(this).is('input')) {
      $(this).val(text);
    } else {
      $(this).text(text);
    }
  })
}

export function getSettings(names) {
  return new Promise(function(fulfill) {
    brApi.storage.local.get(names || SETTING_NAMES, fulfill);
  });
}

export function updateSettings(items) {
  return new Promise(function(fulfill) {
    brApi.storage.local.set(items, fulfill);
  });
}

export function clearSettings(names) {
  return new Promise(function(fulfill) {
    brApi.storage.local.remove(names || SETTING_NAMES, fulfill);
  });
}

export function getBrowser() {
  if (/Opera|OPR\//.test(navigator.userAgent)) return 'opera';
  if (/firefox/i.test(navigator.userAgent)) return 'firefox';
  return 'chrome';
}

export function getHotkeySettingsUrl() {
  switch (getBrowser()) {
    case 'opera': return 'opera://settings/configureCommands';
    case 'chrome': return 'chrome://extensions/configureCommands';
    default: return brApi.runtime.getURL('shortcuts.html');
  }
}

export function isGoogleNative(voiceName) {
  return /^Google\s/.test(voiceName);
}

export function isGoogleTranslate(voiceName) {
  return /^GoogleTranslate /.test(voiceName);
}

export function isAmazonPolly(voiceName) {
  return /^Amazon /.test(voiceName);
}

export function isMicrosoftCloud(voiceName) {
  return /^Microsoft /.test(voiceName) && voiceName.indexOf(' - ') === -1;
}

export function isRemoteVoice(voiceName) {
  return remote_tts_engine.hasVoice(voiceName);
}

export function isPremiumVoice(voiceName) {
  return isAmazonPolly(voiceName) || isMicrosoftCloud(voiceName);
}

export function ajaxPost(sUrl, oData, sType) {
  return new Promise(function(fulfill, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', sUrl, true);
    xhr.setRequestHeader('Content-type', sType === 'json' ? 'application/json' : 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          fulfill(xhr.responseText);
        } else {
          reject(new Error(xhr.responseText));
        }
      }
    };
    xhr.send(sType === 'json' ? JSON.stringify(oData) : urlEncode(oData));
  })
}

export function parseLang(lang) {
  const tokens = lang.toLowerCase().replace(/_/g, '-').split(/-/, 2);
  return {
    lang: tokens[0],
    rest: tokens[1]
  };
}
