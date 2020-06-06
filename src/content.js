import { brApi } from './helpers/constants';

brApi.runtime.onMessage.addListener(onMessage);

function onMessage(message, sender, sendResponse) {
  console.log(11111, message, sender, sendResponse);
}

brApi.runtime.sendMessage({getOptions: true}, function(response) {
  console.log('Message Response', response);
});
