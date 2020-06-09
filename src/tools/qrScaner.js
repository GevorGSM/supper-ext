import QrScanner from 'qr-scanner';
import QrScannerWorkerPath from '!!file-loader!../../node_modules/qr-scanner/qr-scanner-worker.min.js';
import $ from 'jquery';
QrScanner.WORKER_PATH = QrScannerWorkerPath;

let camQrResultTimestamp, fileSelector, fileQrResult, inversionModeSelect, scanner;

export function startScanning() {
  $('#qrScannerBlock').show();
  const video = document.getElementById('qr-video');
  const camHasCamera = document.getElementById('cam-has-camera');
  const camQrResult = document.getElementById('cam-qr-result');
  camQrResultTimestamp = document.getElementById('cam-qr-result-timestamp');
  fileSelector = document.getElementById('file-selector');
  fileQrResult = document.getElementById('file-qr-result');
  inversionModeSelect = document.getElementById('inversion-mode-select');

  QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = `${hasCamera}`);

  scanner = new QrScanner(video, result => setResult(camQrResult, result));
  scanner.start();

  inversionModeSelect.addEventListener('change', inversionSelectChange);

  fileSelector.addEventListener('change', onFileChange);
}

export function stopScanning() {
  $('#qrScannerBlock').hide();

  inversionModeSelect.removeEventListener('change', inversionSelectChange);
  fileSelector.removeEventListener('change', onFileChange);
  scanner.destroy();
  scanner = null;
}

function inversionSelectChange(event) {
  scanner.setInversionMode(event.target.value);
}

function onFileChange() {
  const file = fileSelector.files[0];
  if (!file) {
    return;
  }
  QrScanner.scanImage(file)
    .then(result => setResult(fileQrResult, result))
    .catch(e => setResult(fileQrResult, e || 'No QR code found.'));
}

function setResult(label, result) {
  label.textContent = result;
  camQrResultTimestamp.textContent = new Date().toString();
  label.style.color = 'teal';
  clearTimeout(label.highlightTimeout);
  label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);
}
