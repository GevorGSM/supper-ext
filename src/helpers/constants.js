export const brApi = (typeof chrome != 'undefined') ? chrome : (typeof browser != 'undefined' ? browser : {});

export const SETTING_TYPES = {
  scroller: 'SCROLLER',
  partlyScreenShot: 'PARTLY_SCREEN_SHOT',
  historyDetect: 'HISTORY_DETECT',
};

export const SETTING_NAMES = [
  SETTING_TYPES.scroller,
  SETTING_TYPES.partlyScreenShot,
  SETTING_TYPES.historyDetect,
];

export const PROJECT_PREFIX = 'SUPPER_EXT';

export const HISTORY_KEY = `${PROJECT_PREFIX}_history`;

export const REQUEST_TYPES = {
  settingsChange: 'settings_change',
  screenShot: 'screen_shot',
  formSubmit: 'formSubmit',
};

export const openLastPagesMatcher = /open [0-9]+/gi;

export const numberMatcher = /[0-9]+/gi;
