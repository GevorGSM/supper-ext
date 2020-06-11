export class CharBreaker {
  constructor(charLimit, punctuator, paragraphCombineThreshold) {
    this.charLimit = charLimit;
    this.punctuator = punctuator;
    this.paragraphCombineThreshold = paragraphCombineThreshold;
  }

  breakText = (text) => {
    return this.merge(this.punctuator.getParagraphs(text), this.breakParagraph, this.paragraphCombineThreshold);
  };

  breakParagraph = (text) => {
    return this.merge(this.punctuator.getSentences(text), this.breakSentence);
  };

  breakSentence = (sentence) => {
    return this.merge(this.punctuator.getPhrases(sentence), this.breakPhrase);
  };

  breakPhrase = (phrase) => {
    return this.merge(this.punctuator.getWords(phrase), this.breakWord);
  };

  breakWord = (word) => {
    const result = [];
    while (word) {
      result.push(word.slice(0, this.charLimit));
      word = word.slice(this.charLimit);
    }
    return result;
  };

  merge(parts, breakPart, combineThreshold = false) {
    const result = [];
    let group = {parts: [], charCount: 0};
    const flush = () => {
      if (group.parts.length) {
        result.push(group.parts.join(''));
        group = {parts: [], charCount: 0};
      }
    };
    parts.forEach((part) => {
      const charCount = part.length;
      if (charCount > this.charLimit) {
        flush();
        const subParts = breakPart(part);

        for (let i = 0; i < subParts.length; i++) {
          result.push(subParts[i]);
        }
      } else {
        if (group.charCount + charCount > (combineThreshold || this.charLimit)) {
          flush();
        }
        group.parts.push(part);
        group.charCount += charCount;
      }
    });
    flush();
    return result;
  }
}
