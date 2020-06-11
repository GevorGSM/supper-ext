export class EastAsianPunctuator {
  getParagraphs = (text) => {
    return this.recombine(text.split(/((?:\r?\n\s*){2,})/));
  };

  getSentences = (text) => {
    return this.recombine(text.split(/([.!?]+[\s\u200b]+|[\u3002\uff01]+)/));
  };

  getPhrases = (sentence) => {
    return this.recombine(sentence.split(/([,;:]\s+|[\u2025\u2026\u3000\u3001\uff0c\uff1b]+)/));
  };

  getWords = (sentence) => {
    return sentence.replace(/\s+/g, '').split('');
  };

  recombine = (tokens) => {
    const result = [];
    for (let i = 0; i < tokens.length; i+=2) {
      if (i + 1 < tokens.length) {
        result.push(tokens[i] + tokens[i + 1]);
      } else if (tokens[i]) {
        result.push(tokens[i]);
      }
    }
    return result;
  }
}
