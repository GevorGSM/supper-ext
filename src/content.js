import { downloadScreenShot, startPartlyScreenShotMode, updateOutlineMode } from './tools/screenShot';
import { getVideoRecorderOpenState, toggleVideoRecord } from './tools/videoRecorder';
import { getCodeSandboxOpenState, toggleCodeSandbox } from './tools/codeSandbox';
import { getSubtitleOpenState, toggleRecognition } from './tools/subtitle';
import { brApi, REQUEST_TYPES, SETTING_TYPES } from './helpers/constants';
import { initRecognition, okGoogle } from './tools/speechRecognition';
import { startScroller, stopScroller } from './tools/scroller';
import { toggleClipboardData } from './tools/clipboardData';
import { getSettings } from './helpers/utils';

brApi.runtime.onMessage.addListener(onMessage);

let isSpeechInitialized = false;

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
    } else if (settingName === SETTING_TYPES.clipboardData) {
      toggleClipboardData(value);
    }
  } else if (message.type === REQUEST_TYPES.screenShot) {
    downloadScreenShot(document.body);
  } else if (message.type === REQUEST_TYPES.okGoogle) {
    if (!isSpeechInitialized) {
      initRecognition(message.data);
      isSpeechInitialized = true;
    }

    okGoogle();
  } else if (message.type === REQUEST_TYPES.getInitialData) {
    sendResponse({
      isSubtitleOpen: `${getSubtitleOpenState()}`,
      isVideoRecorderOpen: `${getVideoRecorderOpenState()}`,
      isCodeSandboxOpen: `${getCodeSandboxOpenState()}`,
    });
    return true;
    // for firefox return Promise.resolve({ isSubtitleOpen: getSubtitleOpenState() })
  } else if (message.type === REQUEST_TYPES.toggleSubtitleState) {
    toggleRecognition(message.data);
  } else if (message.type === REQUEST_TYPES.toggleVideoRecorderState) {
    toggleVideoRecord();
  } else if (message.type === REQUEST_TYPES.toggleCodeSandbox) {
    toggleCodeSandbox();
  }
}

getSettings()
  .then(settings => {
    initialize(settings);
  });

function initialize({
  [SETTING_TYPES.scroller]: scroller,
  [SETTING_TYPES.partlyScreenShot]: partlyScreenShot,
  [SETTING_TYPES.clipboardData]: clipboardData,
} = {}) {
  if (scroller) {
    startScroller();
  }

  toggleClipboardData(clipboardData);
  startPartlyScreenShotMode(partlyScreenShot);
}
