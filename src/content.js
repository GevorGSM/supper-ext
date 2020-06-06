import { downloadScreenShot, startPartlyScreenShotMode, updateOutlineMode } from './tools/screenShot';
import { brApi, REQUEST_TYPES, SETTING_TYPES } from './helpers/constants';
import { startScroller, stopScroller } from './tools/scroller';
import { getSettings } from './helpers/utils';

brApi.runtime.onMessage.addListener(onMessage);

function onMessage(message, sender, sendResponse) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  console.log('OnMessage', message, sender, sendResponse);

  if (message.type === REQUEST_TYPES.settingsChange) {
    const { settingName, value } = message.data;
    if (settingName === SETTING_TYPES.scroller) {
      if (value) {
        startScroller(true);
      } else {
        stopScroller();
      }
    } else if (settingName === SETTING_TYPES.partlyScreenShot) {
      updateOutlineMode(value)
    }
  } else if (message.type === REQUEST_TYPES.screenShot) {
    downloadScreenShot(document.body);
  }
}

getSettings()
  .then(settings => {
    initialize(settings);
  });

function initialize({
  [SETTING_TYPES.scroller]: scroller,
  [SETTING_TYPES.partlyScreenShot]: partlyScreenShot,
} = {}) {
  if (scroller) {
    startScroller();
  }

  startPartlyScreenShotMode(partlyScreenShot);
}
