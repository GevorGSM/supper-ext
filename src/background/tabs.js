import { brApi } from '../helpers/constants';

let lastUrlHostName, timer;

brApi.tabs.onActivated.addListener(function(activeInfo) {
  brApi.tabs.query({active: true, windowId: brApi.windows.WINDOW_ID_CURRENT}, function(tabs){
    const url = new URL(tabs[0].url);

    if (url.hostname !== lastUrlHostName) {
      lastUrlHostName = url.hostname;
      clearTimeout(timer);
      startTimer();
    }
  });
});

function startTimer() {
  timer = setTimeout(() => {
    brApi.notifications.create('', {
      title: 'Just wanted to notify you',
      message: `You Spend more then 1 hour in ${lastUrlHostName}`,
      iconUrl: '/icon.png',
      type: 'basic'
    });
    startTimer();
  }, 3600000)
}


/***
 Type
 Values of this type are strings. Possible values are:

 "basic": the notification includes:
 a title (NotificationOptions.title)
 a message (NotificationOptions.message)
 an icon (NotificationOptions.iconUrl)Optional
 an extra message (NotificationOptions.contextMessage)Optional
 up to two buttons (NotificationOptions.buttons)Optional
 "image": everything in "basic" and also:
 an image (NotificationOptions.imageUrl)
 "list": everything in "basic" and also:
 a list of items (NotificationOptions.items)
 "progress": everything in "basic" and also:
 a progress indicator (NotificationOptions.progress)
 Currently Firefox only supports "basic" here.
 ----------

 ***/
