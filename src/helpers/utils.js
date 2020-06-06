import $ from 'jquery'

import { brApi, SETTING_NAMES } from './constants';

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
