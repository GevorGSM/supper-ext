import {
  openLastPagesMatcher,
  numberMatcher,
  REQUEST_TYPES,
  SETTING_TYPES,
  HISTORY_KEY,
  brApi
} from '../helpers/constants';
import { getSettings, updateSettings } from '../helpers/utils';

brApi.commands.onCommand.addListener(function(command) {
  if (command === 'scroller') {
    settingToggleChange(SETTING_TYPES.scroller);
  } else if (command === 'partlyScreenShot') {
    settingToggleChange(SETTING_TYPES.partlyScreenShot);
  } else if (command === 'historyDetect') {
    settingToggleChange(SETTING_TYPES.historyDetect);
  }
});

brApi.omnibox.onInputEntered.addListener(function (text) {
  if (text.match(openLastPagesMatcher)) {
    const pageCount =  text.match(numberMatcher)[0];

    brApi.storage.local.get([HISTORY_KEY], function (result) {
      const history = result[HISTORY_KEY] || [];
      const urls = history.map(({ url }) => url);

      const count = Math.max(urls.length - pageCount, 0);

      for (let i = count; i < urls.length; i++) {
        brApi.tabs.create({ url: urls[i] });
      }
    });
  }
});

brApi.runtime.onMessage.addListener(onMessage);

function onMessage(message, sender, sendResponse) {
  if (message.type === REQUEST_TYPES.formSubmit) {
    const { url: path, values } = message.data;

    brApi.storage.local.get([HISTORY_KEY], function (result) {
      const history = result[HISTORY_KEY] || [];

      const currentHistory = history.find(({ url }) => url === path);
      if (currentHistory) {
        currentHistory.formData = [...(currentHistory.formData || []), values]
      } else {
        history.push({
          url: path,
          formData: [values],
        })
      }

      brApi.storage.local.set({ [HISTORY_KEY]: history })
    });
  }
}

function settingToggleChange(settingName) {
  getSettings()
    .then(function({ [settingName]: value } = {}) {
      updateSettings({[settingName]: !value})
        .then(() => {
          const message = {
            type: REQUEST_TYPES.settingsChange,
            data: {
              settingName: settingName,
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

window.isBackground = true;
