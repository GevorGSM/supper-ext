import { translate } from 'google-translate-api-browser';

import { defaultTTSConfig, SETTING_TYPES } from '../helpers/constants';
import { getSettings } from '../helpers/utils';

let translationInProgress = false;

export function translateText(text) {
  if (translationInProgress) {
    return;
  }

  translationInProgress = true;

  if (text) {
    return getSettings()
      .then((settings) => {
        return translate(text, {
          to: settings[SETTING_TYPES.translationLanguage] || defaultTTSConfig.translationLanguage,
        }).then(res => {
            translationInProgress = false;

            return res.text;
          })
          .catch(err => {
            console.error(err);
            translationInProgress = false;

            return '';
          });
      });
  }

  return Promise.resolve('');
}
