import $ from 'jquery'

import { brApi, defaultTTSConfig, REQUEST_TYPES, SETTING_TYPES } from './helpers/constants';
import { getSettings, setI18nText, updateSettings } from './helpers/utils';
import { openQrGenerator, closeQrGenerator } from './tools/qrGenerator';
import { startScanning, stopScanning } from './tools/qrScaner';

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
    subtitleOpen: false,
    videoRecorderOpen: false,
  };

  initSubtitle(currentValues);
  initVideoRecorder(currentValues);
  let isQrGeneratorOpen = false;
  let isQrScannerOpen = false;
  $('#qrBlock').hide();
  $('#qrScannerBlock').hide();

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

  $('#okGoogle').click(function () {
    $('#okGoogle .shadow').toggleClass('listening');
    brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.okGoogle,
        data: settings[SETTING_TYPES.recognitionLanguage] || defaultTTSConfig.recognitionLanguage,
      };
      brApi.tabs.sendMessage(tabs[0].id, message);
    });
  });

  $('#screenShot').click(() => {
    brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.screenShot,
        data: null,
      };
      brApi.tabs.sendMessage(tabs[0].id, message);
    });
  });

  $('#qrGenerator').click(() => {
    isQrGeneratorOpen = !isQrGeneratorOpen;
    switchToggleButton('#qrGenerator', isQrGeneratorOpen);

    if (isQrGeneratorOpen) {
      openQrGenerator();
    } else {
      closeQrGenerator()
    }
  });

  $('#qrScanner').click(() => {
    isQrScannerOpen = !isQrScannerOpen;
    switchToggleButton('#qrScanner', isQrScannerOpen);

    if (isQrScannerOpen) {
      startScanning();
    } else {
      stopScanning()
    }
  });

  $('#subtitleOpen').click(() => {
    currentValues.subtitleOpen = !currentValues.subtitleOpen;
    switchToggleButton('#subtitleOpen', currentValues.subtitleOpen);

    brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.toggleSubtitleState,
        data: settings[SETTING_TYPES.recognitionLanguage] || defaultTTSConfig.recognitionLanguage,
      };
      brApi.tabs.sendMessage(tabs[0].id, message);
    });
  });

  $('#videoRecorderOpen').click(() => {
    currentValues.videoRecorderOpen = !currentValues.videoRecorderOpen;
    switchToggleButton('#videoRecorderOpen', currentValues.videoRecorderOpen);

    brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
      const message = {
        type: REQUEST_TYPES.toggleVideoRecorderState,
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
  switchToggleButton('#videoRecorderOpen', currentValues.videoRecorderOpen);
  switchToggleButton('#subtitleOpen', currentValues.subtitleOpen);
  switchToggleButton('#qrGenerator', isQrGeneratorOpen);
  switchToggleButton('#qrScanner', isQrScannerOpen);
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
    switchToggleButton(selector, currentValues[key]);
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

function initSubtitle(currentValues) {
  brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
    const message = {
      type: REQUEST_TYPES.getSubtitleState,
      data: null,
    };

    // for chrome only, with firefox we need to use promise.then
    brApi.tabs.sendMessage(tabs[0].id, message, {}, function (res) {
      if (res && res.isSubtitleOpen === 'true') {
        currentValues.subtitleOpen = true;
        switchToggleButton('#subtitleOpen', true);
      }
    });
  });
}

function initVideoRecorder(currentValues) {
  brApi.tabs.query({ active: true, windowId: brApi.windows.WINDOW_ID_CURRENT }, function(tabs) {
    const message = {
      type: REQUEST_TYPES.getVideoRecordingState,
      data: null,
    };

    // for chrome only, with firefox we need to use promise.then
    brApi.tabs.sendMessage(tabs[0].id, message, {}, function (res) {
      if (res && res.isVideoRecorderOpen === 'true') {
        currentValues.videoRecorderOpen = true;
        switchToggleButton('#videoRecorderOpen', true);
      }
    });
  });
}
