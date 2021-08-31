"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOutputPin = exports.setInputPin = exports.isPinStateMatched = exports.setPin = exports.setPins = exports.pins = void 0;
const os = require("os");
const ack_pi_1 = require("ack-pi");
const isPiPlatform = os.platform() === "linux";
const piPins = (0, ack_pi_1.pi)(isPiPlatform);
exports.pins = {
    "0": {
        "num": 0,
        "type": "INPUT", // OUTPUT
        // "mode" : "LOW"
    },
    "1": {
        "num": 1,
        "type": "INPUT",
        // "mode" : "low"
    }
};
function setPins(data) {
    // console.log('data', typeof data, data)
    for (let x in data) {
        data[x].num = Number(x);
        // data[x].num = x as any
        setPin(data[x]);
    }
    Object.keys(exports.pins).filter(pin => !data[pin]).forEach(pin => {
        console.log('removed pin', pin);
        delete exports.pins[pin];
    });
}
exports.setPins = setPins;
const pinClasses = {};
function setPin(data) {
    const isInput = data.type === 'INPUT';
    const isOutput = data.type === 'OUTPUT';
    // apply pin type change
    if (!pinClasses[data.num] || pinClasses[data.num].type !== data.type) {
        pinClasses[data.num] = isInput ? piPins.input(data.num) : piPins.output(data.num);
    }
    const pin = exports.pins[data.num];
    const already = isPinStateMatched(data, pin);
    if (already) {
        return; // no work to do its already this way
    }
    exports.pins[data.num] = data;
    //mode change
    if (data.mode) {
        pinClasses[data.num].mode = data.mode;
    }
    if (isInput) {
        // console.log('set input pin', data)
        return setInputPin(pinClasses[data.num], data);
    }
    else if (isOutput) {
        // console.log('set output pin', data)
        return setOutputPin(pinClasses[data.num], data);
    }
    // console.log('set pin', data)
}
exports.setPin = setPin;
function isPinStateMatched(pin, matchPin) {
    return pin && matchPin && pin.type === matchPin.type && pin.mode === matchPin.mode;
}
exports.isPinStateMatched = isPinStateMatched;
function setInputPin(pinClass, data) {
    const targetPin = exports.pins[data.num];
    targetPin.state = pinClass.getState();
}
exports.setInputPin = setInputPin;
function setOutputPin(pinClass, data) {
    //mode change
    switch (data.mode) {
        case 'HIGH':
            // console.log(data.num, data.mode)
            pinClass.high();
            break;
        case 'LOW':
            // console.log(data.num, data.mode)
            pinClass.low();
            break;
    }
}
exports.setOutputPin = setOutputPin;
//# sourceMappingURL=index.pins.js.map