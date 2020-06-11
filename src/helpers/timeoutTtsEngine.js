export class TimeoutTtsEngine {
  timer = null;
  isSpeaking = false;

  constructor(baseEngine, timeoutMillis) {
    this.baseEngine = baseEngine;
    this.timeoutMillis = timeoutMillis;
    this.isSpeaking = this.baseEngine.isSpeaking;
  }

  speak = (text, options, onEvent) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
        this.baseEngine.stop();
        onEvent({type: 'end', charIndex: text.length});
      },
      this.timeoutMillis);
    this.baseEngine.speak(text, options, (event) => {
      if (event.type === 'end' || event.type === 'error') {
        clearTimeout(this.timer);
      }
      onEvent(event);
    })
  };

  stop = () => {
    clearTimeout(this.timer);
    this.baseEngine.stop();
  };
}
