const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const brain = require('brain.js');
const { BagOfWords } = require('./bag-of-words');
const createGuest = require('cross-domain-storage/guest');
//const brain_text = require('./brain_text_dev');
const brain_text = require('brain-text');


class Scratch3Easyml {

    constructor(runtime) {
        this.modelFunction = null;
        this.easymodelStorage = createGuest("http://localhost:4200");
        //this.easymodelStorage = createGuest("http://easyml.juandarodriguez.es");
        this.runtime = runtime;
    }

    buildModel(modelObj) {
        console.log("entro en buildModel");
        let modelJSON = modelObj.modelJSON;

        // Atention TRICK: When serialized, if timeout=Infinity, as JSON don't 
        // understand Infinity value is saved as 0 which causes an error when 
        // building net fromJSON. So, this is fixed here (I don't like this solution)
        if (modelJSON.trainOpts.timeout != undefined) {
            modelJSON.trainOpts.timeout =
                (modelJSON.trainOpts.timeout == 0) ? Infinity : modelJSON.trainOpts.timeout;
        }

        brain_text.fromJSON(modelJSON, modelObj.dict, modelObj.classes, modelObj.traindata);

        this.modelFunction = function (entry) {
            let result = brain_text.run(entry);
            console.log(result);
            return result
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
                },
                {
                    opcode: 'retrain',
                    blockType: BlockType.COMMAND,
                    text: 'Add text [ENTRY] with label [LABEL] and wait until trained',
                    arguments: {
                        ENTRY: {
                            type: ArgumentType.STRING,
                            defaultValue: "dale a la lamparita"
                        },
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "encender_lampara"
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }

    sincroLocalModel(model) {
        console.log(this.runtime.easyml_model);
        console.log(model)

        // these conditional chain can be simplified. However I prefer keep it 
        // like this because is easier to be interpreted
        if (model && this.runtime.easyml_model) {
            // this.runtime.easyml_model has to be updated with model
            // if they are diferent
            if (model.id != this.runtime.easyml_model.id) {
                this.runtime.easyml_model = model;
                this.modelFunction = null; // force to update the modelFunction
            }
        } else if (model && !this.runtime.easyml_model) {
            // this.runtime.easyml_model has to be updated
            this.runtime.easyml_model = model;
            this.modelFunction = null; // force to update the modelFunction
        } else if (!model && this.runtime.easyml_model) {
            // nothing to do
            console.log("nothing to do");

        } else { // !model && !this.runtime.easyml_model
            // nothing to do
            console.log("nothing to do");
        }
    }

    sincroModelFunction() {
        if (this.modelFunction == null) {
            console.log("building modelFunction with this model");
            console.log(this.runtime.easyml_model);
            this.buildModel(this.runtime.easyml_model);
        }
    }

    getModelFromEasyML() {
        return new Promise((resolve, reject) => {
            this.easymodelStorage.get("easyml_model", (error, model) => {
                if (error) {
                    reject(error);
                    return;
                }
                let modelObj = JSON.parse(model);
                console.log(modelObj);
                this.sincroLocalModel(modelObj);
                if (!this.runtime.easyml_model) {
                    reject("You must train a model before using me");
                } else {
                    this.sincroModelFunction();
                    resolve(true);
                }
            })
        });
    }

    classify(args) {

        return this.getModelFromEasyML().then(
            r => {
                const text = Cast.toString(args.TEXT);
                let result = this.modelFunction(text)['label']
                return result;
            },
            e => {
                return e;
            }
        );
    }

    confidence(args) {

        return this.getModelFromEasyML().then(
            r => {
                const text = Cast.toString(args.TEXT);
                let result = this.modelFunction(text)['confidence']
                return result;
            },
            e => {
                return e;
            }
        );

    }

    retrain (args) {
        console.log(args);
        let entry = args.ENTRY;
        let label = args.LABEL;

        if(brain_text.addOneData({label: label, text: entry})){
            return brain_text.train();
        }
        
    }

}

module.exports = Scratch3Easyml;