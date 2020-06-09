import * as QRCode from 'qrcode';
import $ from 'jquery';

import { brApi } from '../helpers/constants';

function getTagItems() {
  const canvas = $('#qrBlockCanvas ')[0];
  const inputTag = $('input[name=qrGeneratingText]');

  return {
    canvas,
    inputTag,
  }
}

export function openQrGenerator() {
  brApi.tabs.query({'active': true, 'windowId': brApi.windows.WINDOW_ID_CURRENT},
    function(tabs){
      $('#qrBlock').show();

      const { canvas, inputTag } = getTagItems();
      inputTag.val(tabs[0].url);
      showQR(canvas, inputTag);

      inputTag.change(onInputChange)
    }
  );
}

function onInputChange() {
  const { canvas, inputTag } = getTagItems();
  showQR(canvas, inputTag);
}

function showQR(canvas, input) {
  const val = input.val();

  if (val) {
    QRCode.toCanvas(canvas, val, function (error) {
      if (error) console.error(error);
      console.log('success!');
    });
  }
}

export function closeQrGenerator() {
  $('#qrBlock').hide();
  const { inputTag } = getTagItems();

  inputTag.off('change', onInputChange);
}
