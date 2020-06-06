import { PROJECT_PREFIX } from '../helpers/constants';

export function startScroller(updateState = false) {
  const url = window.location.href;
  const pageKey = `${PROJECT_PREFIX}_scroll_${url}`;

  if (!updateState) {
    const storeValue = localStorage.getItem(pageKey);
    if (storeValue !== null) {
      scroller(0, storeValue);
    }
  }

  window.onscroll = function () {
    const Y = window.pageYOffset;
    localStorage.setItem(pageKey, `${Y}`);
  }
}


export function stopScroller() {
  window.onscroll = null;
}

function scroller(fromY, toY) {
  setTimeout(() => {
    let i = parseInt(fromY);
    i += 100;

    if (i < parseInt(toY)) {
      window.scroll(0, i);
      scroller(i, toY);
    }
  }, 10);
}
