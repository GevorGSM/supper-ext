import $ from 'jquery'

import { clearSettings, getHotkeySettingsUrl, getSettings, setI18nText, updateSettings } from './helpers/utils';
import { brApi, SETTING_TYPES } from './helpers/constants';

getSettings()
  .then(settings => {
    initialize(settings);
  });

function initialize(settings) {
  setI18nText();

  const saveBtn = $('#save');
  // buttons
  saveBtn.click(function() {
    updateSettings({
      [SETTING_TYPES.scroller]: $('[name=scroller]:checked').val() === '1',
      [SETTING_TYPES.partlyScreenShot]: $('[name=partlyScreenShot]:checked').val() === '1',
      [SETTING_TYPES.historyDetect]: $('[name=historyDetect]:checked').val() === '1',
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
  $('input[name=partlyScreenShot], input[name=historyDetect], input[name=scroller]').change(setDirty);

  setValuesBySetting(settings);

  saveBtn.prop('disabled', true);
}

function setValuesBySetting(settings) {
  $('[name=scroller], [name=partlyScreenShot], [name=historyDetect]').prop('checked', false);
  $('[name=scroller][value=' + (settings[SETTING_TYPES.scroller] ? '1' : '0') + ']').prop('checked', true);
  $('[name=historyDetect][value=' + (settings[SETTING_TYPES.historyDetect] ? '1' : '0') + ']').prop('checked', true);
  $('[name=partlyScreenShot][value=' + (settings[SETTING_TYPES.partlyScreenShot] ? '1' : '0') + ']').prop('checked', true);
}

function setDirty() {
  $('#save').prop('disabled', false);
}
