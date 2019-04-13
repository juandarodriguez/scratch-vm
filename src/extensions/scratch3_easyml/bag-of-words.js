export class BagOfWords {

    constructor() { }
  
    tokenize(text) {
      return text
        .replace(/'/g, '')
        .replace(/\W/g, ' ')
        .replace(/\s\s+/g, ' ')
        .split(' ').map( s => {
          return s.toLowerCase();
        });
    }
  
    extractDictionary(textArray) {
      var dict = {},
        keys = [],
        words;
      textArray = Array.isArray(textArray) ? textArray : [textArray];
      textArray.forEach((text)  => {
        words = this.tokenize(text);
        words.forEach((word) => {
          word = word.toLowerCase();
          if (!dict[word] && word !== '') {
            dict[word] = 1;
            keys.push(word);
          } else {
            dict[word] += 1;
          }
        });
      });
  
      return {
        words: keys,
        dict: dict
      };
    }
  
    bow(text, vocabulary) {
      var dict = this.extractDictionary([text]).dict,
        vector = [];
  
      vocabulary.words.forEach((word) => {
        vector.push(dict[word] || 0);
      });
      return vector;
    }
  
    tf(word, text) {
      var input = word.toLowerCase();
      var dict = this.extractDictionary(text).dict;
      return dict[input] / this.tokenize(text).length;
    }
  
    wordInDocsCount(word, textlist) {
      var sum = 0;
      textlist.forEach((text) => {
        sum += this.tokenize(text).indexOf(word) > -1 ? 1 : 0;
      });
      return sum;
    }
  
    idf(word, textlist) {
      return Math.log(textlist.length / (1 + this.wordInDocsCount(word, textlist)));
    }
  
    tfidf(word, text, textlist) {
      return this.tf(word, text) * this.idf(word, textlist);
    }
  
    vec_result(res, num_classes) {
      let vec = [];
      for (let i = 0; i < num_classes; i += 1) {
        vec.push(0);
      }
      vec[res] = 1;
      return vec;
    }
    
    maxarg(array) {
      return array.indexOf(Math.max.apply(Math, array));
    }
  }