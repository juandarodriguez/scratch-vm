## scratch-vm
#### Scratch VM is a library for representing, running, and maintaining the state of computer programs written using [Scratch Blocks](https://github.com/LLK/scratch-blocks).

[![Build Status](https://travis-ci.org/LLK/scratch-vm.svg?branch=develop)](https://travis-ci.org/LLK/scratch-vm)
[![Coverage Status](https://coveralls.io/repos/github/LLK/scratch-vm/badge.svg?branch=develop)](https://coveralls.io/github/LLK/scratch-vm?branch=develop)
[![Greenkeeper badge](https://badges.greenkeeper.io/LLK/scratch-vm.svg)](https://greenkeeper.io/)

## Installation
This requires you to have Git and Node.js installed.

To install as a dependency for your own application:
```bash
npm install scratch-vm
```
To set up a development environment to edit scratch-vm yourself:
```bash
git clone https://github.com/LLK/scratch-vm.git
cd scratch-vm
npm install
```

## Development Server
This requires Node.js to be installed.

For convenience, we've included a development server with the VM. This is sometimes useful when running in an environment that's loading remote resources (e.g., SVGs from the Scratch server). If you would like to use your modified VM with the full Scratch 3.0 GUI, [follow the instructions to link the VM to the GUI](https://github.com/LLK/scratch-gui/wiki/Getting-Started).

## Running the Development Server
Open a Command Prompt or Terminal in the repository and run:
```bash
npm start
```

## Playground
To view the Playground, make sure the dev server's running and go to [http://localhost:8073/playground/](http://localhost:8073/playground/) - you will be directed to the playground, which demonstrates various tools and internal state.

![VM Playground Screenshot](https://i.imgur.com/nOCNqEc.gif)


## Standalone Build
```bash
npm run build
```

```html
<script src="/path/to/dist/web/scratch-vm.js"></script>
<script>
    var vm = new window.VirtualMachine();
    // do things
</script>
```

## How to include in a Node.js App
For an extended setup example, check out the /src/playground directory, which includes a fully running VM instance.
```js
var VirtualMachine = require('scratch-vm');
var vm = new VirtualMachine();

// Block events
Scratch.workspace.addChangeListener(vm.blockListener);

// Run threads
vm.start();
```

## Abstract Syntax Tree

#### Overview
The Virtual Machine constructs and maintains the state of an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST) by listening to events emitted by the [scratch-blocks](https://github.com/LLK/scratch-blocks) workspace via the `blockListener`. Each target (code-running object, for example, a sprite) keeps an AST for its blocks. At any time, the current state of an AST can be viewed by inspecting the `vm.runtime.targets[...].blocks` object.

#### Anatomy of a Block
The VM's block representation contains all the important information for execution and storage. Here's an example representing the "when key pressed" script on a workspace:
```json
{
  "_blocks": {
    "Q]PK~yJ@BTV8Y~FfISeo": {
      "id": "Q]PK~yJ@BTV8Y~FfISeo",
      "opcode": "event_whenkeypressed",
      "inputs": {
      },
      "fields": {
        "KEY_OPTION": {
          "name": "KEY_OPTION",
          "value": "space"
        }
      },
      "next": null,
      "topLevel": true,
      "parent": null,
      "shadow": false,
      "x": -69.333333333333,
      "y": 174
    }
  },
  "_scripts": [
    "Q]PK~yJ@BTV8Y~FfISeo"
  ]
}
```

## Testing
```bash
npm test
```

```bash
npm run coverage
```

## Publishing to GitHub Pages
```bash
npm run deploy
```

This will push the currently built playground to the gh-pages branch of the
currently tracked remote.  If you would like to change where to push to, add
a repo url argument:
```bash
npm run deploy -- -r <your repo url>
```

## Donate
We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a [donation](https://secure.donationpay.org/scratchfoundation/) to support our continued engineering, design, community, and resource development efforts. Donations of any size are appreciated. Thank you!


## Easy ML Extension

The extension EasyML provides two reporter blocks. Both of them have a
only input (a text), the first one perform a clasification of the text
and the second one gives the confidence.

These blocks use a model which is built from the attribute `easyml_model`
of runtime object. Such an attribute has been added to the runtime object 
of the vm. This attribute contains the parsed object version of the 
serialized model JSON.

The new attribute `easyml_model` is managed by the easyML extension and
updated when a new model exists in the localstorage of easyML application.
That is: the extension, before compute any result, look at the localstorage
of easyML application (by using a cross domain localstorage sharing strategy)
and if there is a new model then updates the `easyml_model`. 

This new attribute is saved and loaded in sb3 files. So when opening a 
sb3 file which has easyML blocks, a model is also loaded. This way once a scratch project (which uses a trained model of the easyml extension) is saved,it can be reloaded afterward together with the trained model and it will work fine with no need of the easyML frontend. That is, the project is autonomous.

I have modified the code which performs the scratch project downloading 
in order to save this attribute (easyml_model) in the sb3 file.

I also have modified the code which performs the scratch file sb3 loading
to take into account the easyml_model attribute.



All these change have been made in commits a053143ce0209dd1eda417c7e6033e8ef3efdf95.
5479b5b13c92cf6ad690af9002a0425ae6df7857