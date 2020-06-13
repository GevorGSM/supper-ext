import $ from 'jquery';

import { brApi, REQUEST_TYPES } from '../helpers/constants';
import { dragElement } from '../helpers/utils';

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

const emptyStateText = 'Speak and se result in this box';
let isRecognitionInited = false;
let subtitleContainer;
let recognition;
let isStarted;

function initRecognition(lang) {
  isRecognitionInited = true;
  recognition = new SpeechRecognition();
  // recognition.continuous = true;
  // recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = function ({ results }) {
    if (results[0].isFinal) {
      const text = results[0][0].transcript;

      if (subtitleContainer.find('.recognisedTextItem').length === 0) {
        const header = subtitleContainer.find('.subtitleHeader').text('');
        const resetBtn = $('<div class="clearRecognisedBtn extBtn">').text('Clear').appendTo(header);

        resetBtn.click(() => {
          header.text(emptyStateText);
          subtitleContainer.find('.recognisedTextItem').fadeOut(300, function(){ $(this).remove();})
        });
      }

      const itemContainer = $('<div class="recognisedTextItem">');
      const itemContainerHeader = $('<div class="recognisedTextItemHeader">').appendTo(itemContainer);
      const itemContainerTranslation = $('<div class="recognisedTextTranslation">').appendTo(itemContainer);
      $('<div class="recognisedText">').text(text).appendTo(itemContainerHeader);
      const translateBtn = $('<div class="translateBtn extBtn">').text('Translate').appendTo(itemContainerHeader);

      translateBtn.click(() => {
        itemContainerTranslation.text('Translating...');

        const message = {
          type: REQUEST_TYPES.translate,
          data: text,
        };

        brApi.runtime.sendMessage(message, (res) => {
          if (res) {
            itemContainerTranslation.text(res.translation || '');

            if (res.translation) {
              translateBtn.remove();
            }
          }
        });
      });

      itemContainer.hide().appendTo(subtitleContainer).show('slow');

      if (subtitleContainer.find('.recognisedTextItem').length > 3) {
        subtitleContainer.find('.recognisedTextItem').first().fadeOut(300, function(){ $(this).remove();});
      }
    }
  };

  recognition.onerror = function (error) {
    console.log('Recognition Error->', error);
  };

  recognition.onend = function () {
    if (isStarted) {
      recognition.start();
    } else {
      recognition.stop();
    }
  }
}

export function getSubtitleOpenState() {
  return isStarted;
}

export function toggleRecognition(lang) {
  if (isStarted) {
    isStarted = false;
    closeSubtitles();
  } else {
    isStarted = true;
    openSubtitles(lang)
  }
}

function openSubtitles(lang) {
  subtitleContainer = $('<div class="subtitleContainer">').appendTo($('body'));
  $('<div class="subtitleHeader">').text(emptyStateText).appendTo(subtitleContainer);
  dragElement(subtitleContainer[0]);

  if (!isRecognitionInited) {
    initRecognition(lang)
  } else {
    recognition.lang = lang;
  }

  recognition.start();
}

function closeSubtitles() {
  if (subtitleContainer) {
    subtitleContainer.remove();
    subtitleContainer = null;
  }
}
