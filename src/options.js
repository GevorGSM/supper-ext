import $ from 'jquery'

import {
  getHotkeySettingsUrl,
  updateSettings,
  isPremiumVoice,
  clearSettings,
  isRemoteVoice,
  setI18nText,
  getSettings
} from './helpers/utils';
import { brApi, defaultTTSConfig, SETTING_TYPES } from './helpers/constants';
import { getVoices } from './tools/tts';

Promise.all([getSettings(), getVoices()])
  .then(([settings, voices]) => {
    initialize(settings, voices);
  });

function initialize(settings, voices) {
  setI18nText();
  initSpeechInputs(voices);

  const saveBtn = $('#save');
  // buttons
  saveBtn.click(function() {
    updateSettings({
      [SETTING_TYPES.scroller]: $('[name=scroller]:checked').val() === '1',
      [SETTING_TYPES.partlyScreenShot]: $('[name=partlyScreenShot]:checked').val() === '1',
      [SETTING_TYPES.historyDetect]: $('[name=historyDetect]:checked').val() === '1',
      [SETTING_TYPES.recognitionLanguage]: $('#recognitionLanguages').val(),
      [SETTING_TYPES.translationLanguage]: $('#translationLanguages').val(),
      [SETTING_TYPES.voiceRate]: Number($('#rate-input').val()),
      [SETTING_TYPES.voiceVolume]: $('#volume').val(),
      [SETTING_TYPES.voicePitch]: $('#pitch').val(),
      [SETTING_TYPES.voiceName]: $('#voices').val(),
      [SETTING_TYPES.voiceLang]: $('#languages').val(),
    }).then(function() {
        $('#save').prop('disabled', true);
        $('.status.success').show().delay(3000).fadeOut();
      });
  });
  $('#reset').click(function() {
    clearSettings().then(() => location.reload());
  });

  //hot key
  $('#hotkeys-link').click(function() {
    brApi.tabs.create({url: getHotkeySettingsUrl()});
  });

  //dirty
  $('#voices, #languages, #recognitionLanguages, #translationLanguages, input[name=partlyScreenShot], input[name=historyDetect], input[name=scroller]')
    .change(setDirty);
  $('#rate, #pitch, #volume').on('change', setDirty);
  $('#rate-input').on('input', setDirty);

  setValuesBySetting(settings);
  resetVoices();

  saveBtn.prop('disabled', true);
}

function initSpeechInputs(voices) {
  // Languages, recognitionLanguages
  const recognitionLangs = [...new Set(voices.map(function(voice) {
    return voice.lang;
  }))].sort();

  const langs = [...new Set(recognitionLangs.map(function(lng) {
    return lng.split('-', 1)[0];
  }))];

  langs.forEach((lng) => {
    $('<option>')
      .val(lng)
      .text(lng)
      .appendTo($('#languages'));
    $('<option>')
      .val(lng)
      .text(lng)
      .appendTo($('#translationLanguages'));
  });

  recognitionLangs.forEach((lng) => {
    $('<option>')
      .val(lng)
      .text(lng)
      .appendTo($('#recognitionLanguages'));
  });

  // voices
  const groups = groupVoices(voices, (v) => isPremiumVoice(v.voiceName));

  if (!groups[true]) groups[true] = [];
  if (!groups[false]) groups[false] = [];

  groups[true].sort(voiceSorter);
  groups[false].sort(voiceSorter);

  const standard = $('<optgroup>')
    .attr('label', brApi.i18n.getMessage('options_voicegroup_standard'))
    .appendTo($('#voices'));

  groups[false].forEach(function(voice) {
    $(`<option data-lng="${voice.lang.split('-', 1)[0]}">`)
      .val(voice.voiceName)
      .text(voice.voiceName)
      .appendTo(standard);
  });

  $('<optgroup>').appendTo($('#voices'));
  const premium = $('<optgroup>')
    .attr('label', brApi.i18n.getMessage('options_voicegroup_premium'))
    .appendTo($('#voices'));
  groups[true].forEach(function(voice) {
    $(`<option data-lng="${voice.lang.split('-', 1)[0]}">`)
      .val(voice.voiceName)
      .text(voice.voiceName)
      .appendTo(premium);
  });

  $('#languages').change(() => {
    $('#voices').val('');
    resetVoices();
  });

  // rate-------------
  $('#rate-edit-button').click(function() {
    $('#rate, #rate-input-div').toggle();
  });

  $('#rate').on('change', function() {
    const val = Math.pow(3, $(this).val());
    $('#rate-input').val(val.toFixed(3));
    $('#rate-warning').toggle(val > 2);
  });

  $('#rate-input').change(function() {
    const val = $(this).val().trim();
    if (isNaN(val)) $(this).val(1);
    else if (val < .1) $(this).val(.1);
    else if (val > 10) $(this).val(10);
    else $('#rate-edit-button').hide();
    $('#rate-warning').toggle(val > 2);
  });
}

function resetVoices() {
  const language = $('#languages').val();
  $('#voices [data-lng]').each(function () {
    if (language === $(this).data('lng')) {
      $(this).show();
    } else {
      $(this).hide();
    }
  })
}

function groupVoices(voices, keySelector) {
  const groups = {};

  for (let i = 0; i < voices.length; i++) {
    const key = keySelector(voices[i]);
    if (groups[key]) {
      groups[key].push(voices[i]);
    } else {
      groups[key] = [voices[i]];
    }
  }
  return groups;
}

function voiceSorter(a,b) {
  if (isRemoteVoice(a.voiceName)) {
    if (isRemoteVoice(b.voiceName)) return a.voiceName.localeCompare(b.voiceName);
    return 1;
  } else if (isRemoteVoice(b.voiceName)) {
    return -1;
  }
  return a.voiceName.localeCompare(b.voiceName);
}

function setValuesBySetting(settings) {
  $('[name=scroller], [name=partlyScreenShot], [name=historyDetect]').prop('checked', false);
  $('[name=scroller][value=' + (settings[SETTING_TYPES.scroller] ? '1' : '0') + ']').prop('checked', true);
  $('[name=historyDetect][value=' + (settings[SETTING_TYPES.historyDetect] ? '1' : '0') + ']').prop('checked', true);
  $('[name=partlyScreenShot][value=' + (settings[SETTING_TYPES.partlyScreenShot] ? '1' : '0') + ']').prop('checked', true);
  $('#recognitionLanguages').val(settings[SETTING_TYPES.recognitionLanguage] || defaultTTSConfig.recognitionLanguage);
  $('#translationLanguages').val(settings[SETTING_TYPES.translationLanguage] || defaultTTSConfig.translationLanguage);
  $('#rate').val(Math.log(settings[SETTING_TYPES.voiceRate] || defaultTTSConfig.rate) / Math.log(3));
  $('#rate-warning').toggle((settings[SETTING_TYPES.voiceRate] || defaultTTSConfig.rate) > 2);
  $('#languages').val(settings[SETTING_TYPES.voiceLang] || defaultTTSConfig.language);
  $('#voices').val(settings[SETTING_TYPES.voiceName] || defaultTTSConfig.voiceName);
  $('#rate-input').val(settings[SETTING_TYPES.voiceRate] || defaultTTSConfig.rate);
  $('#volume').val(settings[SETTING_TYPES.voiceVolume] || defaultTTSConfig.volume);
  $('#pitch').val(settings[SETTING_TYPES.voicePitch] || defaultTTSConfig.pitch);
}

function setDirty() {
  $('#save').prop('disabled', false);
}
