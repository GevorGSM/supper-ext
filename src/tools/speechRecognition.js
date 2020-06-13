window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
let recognition;
let isStarted;

export function initRecognition(lang) {
  recognition = new SpeechRecognition();
  // recognition.continuous = true;
  // recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = function ({ results }) {
    if (results[0].isFinal) {
      window.location = `https://www.google.com/search?q=${results[0][0].transcript}`;
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

export function okGoogle() {
  if (isStarted) {
    isStarted = false;
  } else {
    isStarted = true;
    recognition.start();
  }
}
