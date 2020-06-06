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
  let currentScrollerValue = settings[SETTING_TYPES.scroller];
  let currentPartlyScreenShotValue = settings[SETTING_TYPES.partlyScreenShot];

  function onMessage(message, sender, sendResponse) {
    if (message.type === REQUEST_TYPES.settingsChange) {
      const { settingName, value } = message.data;
      if (settingName === SETTING_TYPES.scroller) {
        switchToggleButton('#scroller', value);
      } else if (settingName === SETTING_TYPES.partlyScreenShot) {
        switchToggleButton('#partlyScreenShot', value);
      }
    }
  }

  $('#scroller').click(() => {
    currentScrollerValue = !currentScrollerValue;
    switchToggleButton('#scroller', currentScrollerValue);
    updateSettings({[SETTING_TYPES.scroller]: currentScrollerValue})
      .then(() => {
        const message = {
          type: REQUEST_TYPES.settingsChange,
          data: {
            settingName: SETTING_TYPES.scroller,
            value: currentScrollerValue,
          },
        };

        brApi.tabs.query({}, function(tabs) {
          for (let i = 0; i < tabs.length; ++i) {
            brApi.tabs.sendMessage(tabs[i].id, message);
          }
        });
      });
  });

  $('#screenShot').click(() => {
    brApi.tabs.query({ active: true }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.screenShot,
        data: null,
      };
      brApi.tabs.sendMessage(tabs[0].id, message);
    });
  });

  $('#partlyScreenShot').click(() => {
    currentPartlyScreenShotValue = !currentPartlyScreenShotValue;
    switchToggleButton('#partlyScreenShot', currentPartlyScreenShotValue);
    updateSettings({[SETTING_TYPES.partlyScreenShot]: currentPartlyScreenShotValue})
      .then(() => {
        const message = {
          type: REQUEST_TYPES.settingsChange,
          data: {
            settingName: SETTING_TYPES.partlyScreenShot,
            value: currentPartlyScreenShotValue,
          },
        };

        brApi.tabs.query({}, function(tabs) {
          for (let i = 0; i < tabs.length; ++i) {
            brApi.tabs.sendMessage(tabs[i].id, message);
          }
        });
      });
  });

  switchToggleButton('#scroller', settings[SETTING_TYPES.scroller]);
  switchToggleButton('#partlyScreenShot', settings[SETTING_TYPES.partlyScreenShot]);
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
