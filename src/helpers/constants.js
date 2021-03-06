export const brApi = (typeof chrome != 'undefined') ? chrome : (typeof browser != 'undefined' ? browser : {});

export const SETTING_TYPES = {
  scroller: 'SCROLLER',
  partlyScreenShot: 'PARTLY_SCREEN_SHOT',
  historyDetect: 'HISTORY_DETECT',
  voiceRate: 'VOICE_RATE',
  voicePitch: 'VOICE_PITCH',
  voiceVolume: 'VOICE_VOLUME',
  voiceLang: 'VOICE_LANGUAGE',
  voiceName: 'VOICE_NAME',
  recognitionLanguage: 'RECOGNITION_LANGUAGE',
  translationLanguage: 'TRANSLATION_LANGUAGE',
  clipboardData: 'CLIPBOARD_DATA'
};

export const SETTING_NAMES = [
  SETTING_TYPES.scroller,
  SETTING_TYPES.partlyScreenShot,
  SETTING_TYPES.historyDetect,
  SETTING_TYPES.voiceRate,
  SETTING_TYPES.voicePitch,
  SETTING_TYPES.voiceVolume,
  SETTING_TYPES.voiceLang,
  SETTING_TYPES.voiceName,
  SETTING_TYPES.recognitionLanguage,
  SETTING_TYPES.translationLanguage,
  SETTING_TYPES.clipboardData,
];

export const PROJECT_PREFIX = 'SUPPER_EXT';

export const HISTORY_KEY = `${PROJECT_PREFIX}_history`;

export const CLIPBOARD_DATA_KEY = `${PROJECT_PREFIX}_clipboardData`;

export const REQUEST_TYPES = {
  settingsChange: 'settings_change',
  screenShot: 'screen_shot',
  formSubmit: 'formSubmit',
  okGoogle: 'okGoogle',
  getInitialData: 'getInitialData',
  toggleSubtitleState: 'toggleSubtitleState',
  toggleVideoRecorderState: 'toggleVideoRecorderState',
  toggleCodeSandbox: 'toggleCodeSandbox',
  translate: 'translate',
};

export const openLastPagesMatcher = /open [0-9]+/gi;

export const numberMatcher = /[0-9]+/gi;

export const defaultTTSConfig = {
  serviceUrl: 'https://support.lsdsoftware.com',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  voiceName: 'Karen',
  showHighlighting: 0,
  language: 'en',
  translationLanguage: 'hy',
  recognitionLanguage: 'en-US'
};
