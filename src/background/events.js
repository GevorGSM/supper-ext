import { brApi, REQUEST_TYPES, SETTING_TYPES } from '../helpers/constants';
import { getSettings, updateSettings } from '../helpers/utils';

brApi.commands.onCommand.addListener(function(command) {
  if (command === 'scroller') {
    getSettings()
      .then(function({ [SETTING_TYPES.scroller]: scroller } = {}) {
        updateSettings({[SETTING_TYPES.scroller]: !scroller})
          .then(() => {
            brApi.tabs.query({}, function(tabs) {
              const message = {
                type: REQUEST_TYPES.settingsChange,
                data: {
                  settingName: SETTING_TYPES.scroller,
                  value: !scroller,
                },
              };
              for (let i = 0; i < tabs.length; ++i) {
                brApi.tabs.sendMessage(tabs[i].id, message);
              }
            });
          });
      })
  }
});

window.isBackground = true;
