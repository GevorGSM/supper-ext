import $ from 'jquery';

import { dragElement } from '../helpers/utils';

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

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
          subtitleContainer.text('');
        }

        $('<div class="recognisedTextItem">').text(text).hide().appendTo(subtitleContainer).show('slow');

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
  subtitleContainer.text('Speak and se result in this box');
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
