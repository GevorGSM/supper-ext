import $ from 'jquery'

import { brApi, REQUEST_TYPES, SETTING_TYPES } from './helpers/constants';
import { getSettings, setI18nText, updateSettings } from './helpers/utils';

getSettings()
  .then(settings => {
    initialize(settings);
  });

function initialize(settings) {
  setI18nText();

  brApi.runtime.onMessage.addListener(onMessage);
  const currentValues = {
    currentScrollerValue: settings[SETTING_TYPES.scroller],
    currentPartlyScreenShotValue: settings[SETTING_TYPES.partlyScreenShot],
    currentHistoryDetectValue: settings[SETTING_TYPES.historyDetect],
  };

  function onMessage(message, sender, sendResponse) {
    if (message.type === REQUEST_TYPES.settingsChange) {
      const { settingName, value } = message.data;
      if (settingName === SETTING_TYPES.scroller) {
        switchToggleButton('#scroller', value);
      } else if (settingName === SETTING_TYPES.partlyScreenShot) {
        switchToggleButton('#partlyScreenShot', value);
      } else if (SETTING_TYPES.historyDetect) {
        switchToggleButton('#historyDetect', value);
      }
    }
  }

  $('#screenShot').click(() => {
    brApi.tabs.query({ active: true }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.screenShot,
        data: null,
      };
      brApi.tabs.sendMessage(tabs[0].id, message);
    });
  });

  addClickListenerForToggle('#scroller', currentValues, 'currentScrollerValue', SETTING_TYPES.scroller);
  addClickListenerForToggle('#partlyScreenShot', currentValues, 'currentPartlyScreenShotValue', SETTING_TYPES.partlyScreenShot);
  addClickListenerForToggle('#historyDetect', currentValues, 'currentHistoryDetectValue', SETTING_TYPES.historyDetect);

  switchToggleButton('#scroller', settings[SETTING_TYPES.scroller]);
  switchToggleButton('#partlyScreenShot', settings[SETTING_TYPES.partlyScreenShot]);
  switchToggleButton('#historyDetect', settings[SETTING_TYPES.historyDetect]);
}

function switchToggleButton(container, value) {
  if (value) {
    $(`${container} .toggle_off`).hide();
    $(`${container} .toggle_on`).show();
  } else {
    $(`${container} .toggle_on`).hide();
    $(`${container} .toggle_off`).show();
  }
}

function addClickListenerForToggle(selector, currentValues, key, settingType) {
  $(selector).click(() => {
    currentValues[key] = !currentValues[key];
    switchToggleButton('#historyDetect', currentValues[key]);
    updateSettings({[settingType]: currentValues[key]})
      .then(() => {
        const message = {
          type: REQUEST_TYPES.settingsChange,
          data: {
            settingName: settingType,
            value: currentValues[key],
          },
        };

        brApi.tabs.query({}, function(tabs) {
          for (let i = 0; i < tabs.length; ++i) {
            brApi.tabs.sendMessage(tabs[i].id, message);
          }
        });
      });
  });
}
