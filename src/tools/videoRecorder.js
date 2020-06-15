import $ from 'jquery';

import { downloadFile, dragElement } from '../helpers/utils';

const constraintObj = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  },
  video: {
    facingMode: 'user',
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    cursor: 'always'
  }
};

let videoRecorderContainer,
  recorderActions,
  toggleScreenBtn,
  downloadBtn,
  videoElem,
  $videoElem,
  startRecord,
  stopRecord,
  devicesSelect,
  mediaRecorder;
let isVideoStarted = false,
  shareScreenMode = false,
  userDevices = [];
// width: 1280, height: 720  -- preference only
// facingMode: {exact: "user"}
// facingMode: "environment"

//handle older browsers that might implement getUserMedia in some way
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraintObj, resolve, reject);
    });
  }
}else{
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      userDevices = devices.filter(({ kind }) => kind.toUpperCase() === 'VIDEOINPUT');
      devices.forEach(device=>{
        console.log(device.kind.toUpperCase(), device.label, device.deviceId);
      })
    })
    .catch(err=>{
      console.log(err.name, err.message);
    })
}

/*********************************
 getUserMedia returns a Promise
 resolve - returns a MediaStream Object
 reject returns one of the following errors
 AbortError - generic unknown cause
 NotAllowedError (SecurityError) - user rejected permissions
 NotFoundError - missing media track
 NotReadableError - user permissions given but hardware/OS error
 OverconstrainedError - constraint video settings preventing
 TypeError - audio: false, video: false
 *********************************/

export function toggleVideoRecord() {
  isVideoStarted = !isVideoStarted;

  if (isVideoStarted) {
    createRecorder();
    initRecorder();
  } else {
    stopStreamedVideo();

    if (videoRecorderContainer) {
      videoRecorderContainer.remove();
      videoRecorderContainer = null;
    }
  }
}

export function getVideoRecorderOpenState() {
  return isVideoStarted;
}

function createRecorder() {
  videoRecorderContainer = $('<div class="videoRecorderContainer">').appendTo($('body'));
  const closeBtn = $('<div class="closeBtn">').text('X').appendTo(videoRecorderContainer);
  const videoContainer = $('<div class="videoContainer">').appendTo(videoRecorderContainer);
  dragElement(videoContainer[0], videoRecorderContainer[0]);
  $videoElem = $('<video class="streamVideo" controls muted>').appendTo(videoContainer);

  videoElem = $videoElem[0];
  recorderActions = $('<div class="recorderActions">').appendTo(videoRecorderContainer);
  devicesSelect = $('<select id="devices">').appendTo(recorderActions);
  $('<option>')
    .val('')
    .text('Select Video Device')
    .appendTo(devicesSelect);

  userDevices.forEach(({ deviceId, label }) => {
    $('<option>')
      .val(deviceId)
      .text(label)
      .appendTo(devicesSelect);
  });

  devicesSelect.change(() => {
    constraintObj.video.deviceId = devicesSelect.val();
    stopStreamedVideo();
    initRecorder();
  });

  toggleScreenBtn = $('<div class="toggleScreenBtn extBtn">').text('Share Screen (on/off)').appendTo(recorderActions);
  startRecord = $('<div class="btnStart extBtn">').text('Record').appendTo(recorderActions);
  stopRecord = $('<div class="btnStop extBtn">').text('Stop Recording').hide().appendTo(recorderActions);

  toggleScreenBtn.click(() => {
    shareScreenMode = !shareScreenMode;

    stopStreamedVideo();
    initRecorder();
  });

  startRecord.click(()=>{
    if (mediaRecorder) {
      startRecord.hide();
      stopRecord.show();
      mediaRecorder.start();
      console.log(mediaRecorder.state);
    }
  });

  stopRecord.click(()=>{
    if (mediaRecorder) {
      stopRecord.hide();
      startRecord.show();
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
    }
  });

  closeBtn.click(() => {
    toggleVideoRecord();
  });
}

function initRecorder() {
  const media = shareScreenMode
    ? navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: {
        ...constraintObj.video,
        width: undefined,
        height: undefined,
      }
    })
    : navigator.mediaDevices.getUserMedia(constraintObj);

  Promise.all([
    media,
    shareScreenMode ? navigator.mediaDevices.getUserMedia({ video: false, audio: shareScreenMode }) : null
  ]).then(function([desktopStream, voiceStream]) {
    let mediaStreamObj;

    if (shareScreenMode) {
      const tracks = [
        ...desktopStream.getVideoTracks(),
        ...mergeAudioStreams(desktopStream, voiceStream)
      ];

      mediaStreamObj = new MediaStream(tracks);
    } else {
      mediaStreamObj = desktopStream;
    }

    //connect the media stream to the first video element
    $videoElem.show();

    if ("srcObject" in videoElem) {
      videoElem.srcObject = mediaStreamObj;
    } else {
      //old version
      videoElem.src = window.URL.createObjectURL(mediaStreamObj);
    }

    videoElem.onloadedmetadata = function(ev) {
      //show in the video element what is being captured by the webcam
      videoElem.play();
    };

    //add listeners for saving video/audio
    mediaRecorder = new MediaRecorder(mediaStreamObj);
    let chunks = [];

    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
    };

    mediaRecorder.onstop = (ev)=>{
      if (!isVideoStarted) {
        return;
      }

      let blob = new Blob(chunks, { 'type' : 'video/webm;' });
      chunks = [];
      const videoURL = window.URL.createObjectURL(blob);

      if (downloadBtn) {
        downloadBtn.remove();
      }

      downloadBtn = $('<div class="downloadBtn extBtn">').text('Download').appendTo(recorderActions);

      downloadBtn.click(() => {
        downloadFile(videoURL, 'supperExtRecord.webm');
      });
    }
  })
    .catch(function(err) {
      console.log(err.name, err.message);
    });
}

function stopStreamedVideo() {
  const stream = videoElem.srcObject;

  if (stream) {
    const tracks = stream.getTracks();

    tracks.forEach(function(track) {
      track.stop();
    });
  }

  videoElem.srcObject = null;
  mediaRecorder = null;
  stopRecord.hide();
  startRecord.show();
}

const mergeAudioStreams = (desktopStream, voiceStream) => {
  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  let hasDesktop = false;
  let hasVoice = false;
  if (desktopStream && desktopStream.getAudioTracks().length > 0) {
    // If you don't want to share Audio from the desktop it should still work with just the voice.
    const source1 = context.createMediaStreamSource(desktopStream);
    const desktopGain = context.createGain();
    desktopGain.gain.value = 0.7;
    source1.connect(desktopGain).connect(destination);
    hasDesktop = true;
  }

  if (voiceStream && voiceStream.getAudioTracks().length > 0) {
    const source2 = context.createMediaStreamSource(voiceStream);
    const voiceGain = context.createGain();
    voiceGain.gain.value = 0.7;
    source2.connect(voiceGain).connect(destination);
    hasVoice = true;
  }

  return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
};
