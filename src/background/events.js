import { brApi, REQUEST_TYPES, SETTING_TYPES } from '../helpers/constants';
import { getSettings, updateSettings } from '../helpers/utils';

brApi.commands.onCommand.addListener(function(command) {
  if (command === 'scroller') {
    getSettings()
      .then(function({ [SETTING_TYPES.scroller]: scroller } = {}) {
        updateSettings({[SETTING_TYPES.scroller]: !scroller})
          .then(() => {
            const message = {
              type: REQUEST_TYPES.settingsChange,
              data: {
                settingName: SETTING_TYPES.scroller,
                value: !scroller,
              },
            };

            brApi.tabs.query({}, function(tabs) {
              for (let i = 0; i < tabs.length; ++i) {
                brApi.tabs.sendMessage(tabs[i].id, message);
              }
            });
            brApi.runtime.sendMessage(message);
          });
      })
  } else if (command === 'partlyScreenShot') {
    getSettings()
      .then(function({ [SETTING_TYPES.partlyScreenShot]: value } = {}) {
        updateSettings({[SETTING_TYPES.partlyScreenShot]: !value})
          .then(() => {
            const message = {
              type: REQUEST_TYPES.settingsChange,
              data: {
                settingName: SETTING_TYPES.partlyScreenShot,
                value: !value,
              },
            };

            brApi.tabs.query({}, function(tabs) {
              for (let i = 0; i < tabs.length; ++i) {
                brApi.tabs.sendMessage(tabs[i].id, message);
              }
            });
            brApi.runtime.sendMessage(message);
          });
      })
  }
});

window.isBackground = true;
