import $ from 'jquery'

import { brApi, HISTORY_KEY, REQUEST_TYPES, SETTING_TYPES } from '../helpers/constants';
import { getSettings } from '../helpers/utils';

brApi.storage.local.get(function (result) {
  if (!HISTORY_KEY in result) {
    brApi.storage.local.set({ [HISTORY_KEY]: [] })
  }
});

getSettings()
  .then(({[SETTING_TYPES.historyDetect]: historyDetect}) => {
    if (historyDetect) {
      initHistoryDetection();
    }
  });

export function initHistoryDetection() {
  brApi.storage.local.get([HISTORY_KEY], function (result) {
    const history = result[HISTORY_KEY];
    const urls = history.map(({ url }) => url);

    if (!urls.includes(window.location.href)) {
      setHistoryItem(history);
    }
  });

  $(document).ready(() => {
    setTimeout(() => {
      const passwordInput = $('input[type=password]');

      if (passwordInput.length) {
        const formTag = passwordInput.parents('form:first');
        formTag.submit(function() {
          const $inputs = $('form :input');

          const values = {};
          $inputs.each(function() {
            values[this.name] = $(this).val();
          });

          const message = {
            type: REQUEST_TYPES.formSubmit,
            data: {
              url: window.location.href,
              values: values,
            },
          };

          brApi.runtime.sendMessage(message);
        });
      }
    }, 2000);
  });
}

function setHistoryItem(arr) {
  const item = {
    url: window.location.href,
    formData: [],
  };

  brApi.storage.local.set({ [HISTORY_KEY]: [...arr, item] })
}
