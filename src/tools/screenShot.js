import html2canvas from 'html2canvas';
import $ from 'jquery'

let isOutlineMode = false;

const a = document.createElement('a');
a.setAttribute('download', 'download');
a.href = '';

export function downloadScreenShot(elem) {
  html2canvas(elem).then(function(canvas) {
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
}

export function updateOutlineMode(value) {
  isOutlineMode = value;
}

export function startPartlyScreenShotMode(value) {
  isOutlineMode = value;

  $('*').hover(function () {
    if (isOutlineMode) {
      $(this).css('outline', '1px solid #44E427')
    }

    return false;
  }, function () {
    if (isOutlineMode) {
      $(this).css('outline', 'none')
    }
  });

  $('*').dblclick(function () {
    if(isOutlineMode) {
      downloadScreenShot($(this)[0]);
    }

    return false;
  })
}
