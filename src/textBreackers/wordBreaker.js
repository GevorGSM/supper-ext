export class WordBreaker {
  constructor(wordLimit, punctuator){
    this.wordLimit = wordLimit;
    this.punctuator = punctuator;
  }

  breakText = (text) => {
    return this.merge(this.punctuator.getParagraphs(text), this.breakParagraph);
  };

  breakParagraph = (text) => {
    return this.merge(this.punctuator.getSentences(text), this.breakSentence);
  };

  breakSentence = (sentence) => {
    return this.merge(this.punctuator.getPhrases(sentence), this.breakPhrase);
  };

  breakPhrase = (phrase) => {
    let words = this.punctuator.getWords(phrase);
    const splitPoint = Math.min(Math.ceil(words.length/2), this.wordLimit);
    const result = [];
    while (words.length) {
      result.push(words.slice(0, splitPoint).join(''));
      words = words.slice(splitPoint);
    }
    return result;
  };

  merge = (parts, breakPart) => {
    const result = [];
    let group = {parts: [], wordCount: 0};
    const flush = () => {
      if (group.parts.length) {
        result.push(group.parts.join(''));
        group = {parts: [], wordCount: 0};
      }
    };
    parts.forEach((part) => {
      const wordCount = this.punctuator.getWords(part).length;
      if (wordCount > this.wordLimit) {
        flush();
        const subParts = breakPart(part);
        for (let i = 0; i < subParts.length; i++) result.push(subParts[i]);
      }
      else {
        if (group.wordCount + wordCount > this.wordLimit) flush();
        group.parts.push(part);
        group.wordCount += wordCount;
      }
    });
    flush();
    return result;
  };
}
