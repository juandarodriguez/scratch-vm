const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const brain = require('brain.js');
const { BagOfWords } = require('./bag-of-words')

let run = function(entry){
    return {
        label: 'NO LABEL: you have to train your model',
        confidence: 'NO CONFIDENCE: you have to train your model'
    }
};

function receiveMessage(event) {
    if (event.origin == "http://127.0.0.1:4200") {
        console.log(event);
        let dataObj = JSON.parse(event.data);
        let modelJSON = dataObj.modelJSON;
        let classes = dataObj.classes;
        let dict = dataObj.dict;
        
        let net = new brain.NeuralNetwork();
        net.fromJSON(modelJSON);
        let bow = new BagOfWords();
        
        run = function (entry) {
            let term = bow.bow(entry, dict);
            let predict = net.run(term);
            let i = bow.maxarg(predict);
            let flippedClasses = {};
            for (let key in classes) {
                flippedClasses[classes[key]] = key
            }

            let result = {
                label: flippedClasses[i],
                confidence: predict[i]
            }

            return result
        }

        label = function(entry){
            return run(entry)['label'];
        }

        confidence = function(entry){
            return run(entry)['confidence'];
        }
    }
}

window.addEventListener("message", receiveMessage, false);

console.log(brain);
console.log(BagOfWords);

class Scratch3Easyml {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'easyml',
            name: 'Easy Machine Learning',
            blocks: [
                {
                    opcode: 'clasify',
                    blockType: BlockType.COMMAND,
                    text: 'Clasify [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "enciende la luz"
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }

    clasify(args) {
        const text = Cast.toString(args.TEXT);
        return run(text)['label']
    }
}

module.exports = Scratch3Easyml;