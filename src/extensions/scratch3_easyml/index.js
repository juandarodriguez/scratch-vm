const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');


class Scratch3Easyml {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
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

    clasify (args) {
        const text = Cast.toString(args.TEXT);
        let bc = new BroadcastChannel('clasify_channel');
        bc.postMessage('This is a test message.');
        log.log(text);
    }
}

module.exports = Scratch3Easyml;