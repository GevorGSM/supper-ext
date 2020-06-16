import $ from 'jquery'

import { brApi, CLIPBOARD_DATA_KEY, HISTORY_KEY } from './helpers/constants';

brApi.storage.local.get([HISTORY_KEY, CLIPBOARD_DATA_KEY], function (result) {
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

  $('.history .content').html(urls);

  const clipboardData = result[CLIPBOARD_DATA_KEY];

  const content = (clipboardData && clipboardData.length > 0) ? (
    clipboardData.map(text => `
      <div class="copiedItem">
        ${text}
      </div> 
    `)
  ) : 'You haven`t copied text yet';

  $('.clipboardData .content').html(content);
});

$('#clear').click(function () {
  brApi.storage.local.set({ [HISTORY_KEY]: [], [CLIPBOARD_DATA_KEY]: [] });
  window.location.href = window.location.href;
});
