import $ from 'jquery'

import { brApi, HISTORY_KEY } from './helpers/constants';

brApi.storage.local.get([HISTORY_KEY], function (result) {
  const history = result[HISTORY_KEY];
  const urls = (history && history.length > 0)
    ? history.map(({ url, formData }) => `
          <div class="url">
              <div class="path">${url}</div>
              <div class="content">
                ${(formData || []).map(item => `<div class="block">${JSON.stringify(item)}</div>`).join(', ')}
              </div>
            </div>
      `): 'Empty Result';

  $('#content').html(urls);
});

$('#clear').click(function () {
  brApi.storage.local.set({ [HISTORY_KEY]: [] });
  window.location.href = window.location.href;
});
