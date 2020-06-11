export class LatinPunctuator {
  getParagraphs = (text) => {
    return this.recombine(text.split(/((?:\r?\n\s*){2,})/));
  };

  getSentences = (text) => {
    return this.recombine(text.split(/([.!?]+[\s\u200b]+)/));
  };

  getPhrases = (sentence) => {
    return this.recombine(sentence.split(/([,;:]\s+|\s-+\s+|—\s*)/));
  };

  getWords = (sentence) => {
    const tokens = sentence.trim().split(/([~@#%^*_+=<>]|[\s\-—/]+|\.(?=\w{2,})|,(?=[0-9]))/);
    const result = [];

    for (let i = 0; i < tokens.length; i += 2) {
      if (tokens[i]) {
        result.push(tokens[i]);
      }
      if (i + 1 < tokens.length) {
        if (/^[~@#%^*_+=<>]$/.test(tokens[i + 1])) {
          result.push(tokens[i + 1]);
        } else if (result.length) {
          result[result.length - 1] += tokens[i + 1];
        }
      }
    }
    return result;
  };

  recombine = (tokens) => {
    const result = [];
    for (let i = 0; i < tokens.length; i += 2) {
      if (i + 1 < tokens.length) {
        result.push(tokens[i] + tokens[i + 1]);
      } else if (tokens[i]) {
        result.push(tokens[i]);
      }
    }
    return result;
  }
}
