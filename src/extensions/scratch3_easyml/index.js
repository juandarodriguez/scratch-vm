const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const brain = require('brain.js');
const { BagOfWords } = require('./bag-of-words')

let allowedDomains = [
    "http://localhost:4200",
    "http://juandarodriguez.es"
]

let run = function (entry) {
    return {
        label: 'NO LABEL: you have to train your model',
        confidence: 'NO CONFIDENCE: you have to train your model'
    }
};



class Scratch3Easyml {
    constructor(runtime) {
        this.loadedFromDisk = false;
        this.runtime = runtime;
        window.addEventListener("message", () => {
            if (allowedDomains.indexOf(event.origin) != -1) {
                console.log(event);
                this.runtime.easyml_model = event.data;
                this.buildModel(event.data);
            }
        }, false);
    }

    buildModel(data) {
        let dataObj = JSON.parse(data);
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
                confidence: (parseFloat(predict[i] * 100)).toFixed(2)
            }

            return result
        }

        label = function (entry) {
            return run(entry)['label'];
        }

        confidence = function (entry) {
            return run(entry)['confidence'];
        }
    }

    getInfo() {
        return {
            id: 'easyml',
            name: 'EasyML',
            blocks: [
                {
                    opcode: 'clasify',
                    blockType: BlockType.REPORTER,
                    text: 'Clasify [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "enciende la luz"
                        }
                    }
                },
                {
                    opcode: 'confidence',
                    blockType: BlockType.REPORTER,
                    text: 'Confidence [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "enciende la luz",
                            description: 'Label for the EasyML extension category'
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }

    clasify(args) {
        if (this.runtime.easyml_model && !this.loadedFromDisk) {
            this.buildModel(this.runtime.easyml_model);
            this.loadedFromDisk = true;
        }
        const text = Cast.toString(args.TEXT);
        return run(text)['label']
    }

    confidence(args) {
        const text = Cast.toString(args.TEXT);
        return run(text)['confidence']
    }

}

module.exports = Scratch3Easyml;