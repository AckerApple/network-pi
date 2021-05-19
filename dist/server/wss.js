import { __awaiter } from "tslib";
import * as os from "os";
import { pi } from "ack-pi";
import { ConnectionSwitch } from "./index.utils";
const { exec } = require("child_process");
export class WsPinConnectionSwitch extends ConnectionSwitch {
    setPins(data) {
        setPins(data.data);
        this.send('pins', pins, data); // echo
    }
    getPins(data) {
        this.send('pins', pins, data);
    }
    command(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.send('commandResult', yield runCommand(data.data), data);
        });
    }
}
const isPiPlatform = os.platform() === "linux";
const piPins = pi(isPiPlatform);
const pins = {
    "0": {
        "num": 0,
        "type": "INPUT",
    },
    "1": {
        "num": 1,
        "type": "INPUT",
    }
};
const pinClasses = {};
/** browser debug any sent command */
function runCommand(command) {
    return new Promise((res, rej) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res(error);
            }
            if (stderr) {
                return res(stderr);
            }
            res(stdout);
        });
    });
}
function setPins(data) {
    // console.log('data', typeof data, data)
    for (let x in data) {
        data[x].num = Number(x);
        // data[x].num = x as any
        setPin(data[x]);
    }
    Object.keys(pins).filter(pin => !data[pin]).forEach(pin => {
        console.log('removed pin', pin);
        delete pins[pin];
    });
}
function setPin(data) {
    const isInput = data.type === 'INPUT';
    const isOutput = data.type === 'OUTPUT';
    // apply pin type change
    if (!pinClasses[data.num] || pinClasses[data.num].type !== data.type) {
        pinClasses[data.num] = isInput ? piPins.input(data.num) : piPins.output(data.num);
    }
    const pin = pins[data.num];
    const already = isPinStateMatched(data, pin);
    if (already) {
        return; // no work to do its already this way
    }
    pins[data.num] = data;
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
    console.log('set pin', data);
}
function isPinStateMatched(pin, matchPin) {
    return pin && matchPin && pin.type === matchPin.type && pin.mode === matchPin.mode;
}
function setInputPin(pinClass, data) {
    const targetPin = pins[data.num];
    targetPin.state = pinClass.getState();
}
function setOutputPin(pinClass, data) {
    //mode change
    switch (data.mode) {
        case 'HIGH':
            console.log(data.num, data.mode);
            pinClass.high();
            break;
        case 'LOW':
            console.log(data.num, data.mode);
            pinClass.low();
            break;
    }
}
//# sourceMappingURL=wss.js.map