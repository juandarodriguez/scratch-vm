const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const brain = require('brain.js');
const { BagOfWords } = require('./bag-of-words');
const createGuest = require('cross-domain-storage/guest');


class Scratch3Easyml {

    constructor(runtime) {
        this.modelFunction = null;
        this.easymodelStorage = createGuest("http://localhost:4200");
        this.runtime = runtime;
    }

    buildModel(modelObj) {
        let modelJSON = modelObj.modelJSON;
        let classes = modelObj.classes;
        let dict = modelObj.dict;

        let net = new brain.NeuralNetwork();
        net.fromJSON(modelJSON);
        let bow = new BagOfWords();

        this.modelFunction = function (entry) {
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
                    opcode: 'classify',
                    blockType: BlockType.REPORTER,
                    text: 'Classify [TEXT]',
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

    sincroLocalModel(model){
        if(!this.runtime.easyml_model || model.id != this.runtime.easyml_model.id){
            this.runtime.easyml_model = model;
            this.modelFunction = null; // force to update the modelFunction
        }
    }

    sincroModelFunction(){
        if(this.modelFunction == null){
            this.buildModel(this.runtime.easyml_model);
        }
    }

    classify(args) {
        
        return new Promise((resolve, reject) => {
            this.easymodelStorage.get("easyml_model",  (error, model) => {
                if (error) {
                    reject(error);
                }
                let modelObj = JSON.parse(model);
                console.log(modelObj);
                this.sincroLocalModel(modelObj);
                this.sincroModelFunction();

                const text = Cast.toString(args.TEXT);

                result = this.modelFunction(text)['label']

                resolve(result);
            })
        });

    }

    confidence(args) {
        const text = Cast.toString(args.TEXT);
        return this.modelFunction(text)['confidence']
    }

}

module.exports = Scratch3Easyml;