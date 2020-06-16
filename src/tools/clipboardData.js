import { brApi, CLIPBOARD_DATA_KEY } from '../helpers/constants';

export function toggleClipboardData(start) {
  if (start) {
    startClipboardDataSave();
  } else {
    stopClipBoardDataSave()
  }
}

function startClipboardDataSave() {
  document.addEventListener('copy', onCopy);
  document.addEventListener('cut', onCopy);
}

function stopClipBoardDataSave() {
  document.removeEventListener('copy', onCopy);
  document.removeEventListener('cut', onCopy);
}

function onCopy(e){
  const selection = window.getSelection().toString();

  brApi.storage.local.get([CLIPBOARD_DATA_KEY], function (result) {
    const clipboardData = result[CLIPBOARD_DATA_KEY] || [];

    if (!clipboardData.includes(selection)) {
      brApi.storage.local.set({ [CLIPBOARD_DATA_KEY]: [...clipboardData, selection] })
    }
  });
}
