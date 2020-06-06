export const brApi = (typeof chrome != 'undefined') ? chrome : (typeof browser != 'undefined' ? browser : {});

export const SETTING_TYPES = {
  scroller: 'SCROLLER',
  partlyScreenShot: 'PARTLY_SCREEN_SHOT',
};

export const SETTING_NAMES = [SETTING_TYPES.scroller, SETTING_TYPES.partlyScreenShot];

export const PROJECT_PREFIX = 'SUPPER_EXT';

export const REQUEST_TYPES = {
  settingsChange: 'settings_change',
  screenShot: 'screen_shot',
};
