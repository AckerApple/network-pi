"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsPinConnectionSwitch = void 0;
const tslib_1 = require("tslib");
const { exec } = require("child_process");
const index_pins_1 = require("./index.pins");
const WsEventMessageHandler_class_1 = require("../shared/WsEventMessageHandler.class");
const systeminformation_1 = require("systeminformation");
// import * as wifi from "node-wifi"
const wifi = require('node-wifi');
class WsPinConnectionSwitch extends WsEventMessageHandler_class_1.WsEventMessageHandler {
    setPins(data) {
        (0, index_pins_1.setPins)(data.data);
        this.send('pins', index_pins_1.pins, data); // echo
        console.log('ws setPins');
    }
    getPins(data) {
        this.send('pins', index_pins_1.pins, data);
    }
    command(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.send('commandResult', yield runCommand(data.data), data);
        });
    }
    wifiNetworks(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const results = yield (0, systeminformation_1.wifiNetworks)();
            this.send('wifiNetworks', results, data);
        });
    }
    wifiConnections(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const results = yield (0, systeminformation_1.wifiConnections)();
            this.send('wifiConnections', results, data);
        });
    }
    bluetoothDevices(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                const results = yield (0, systeminformation_1.bluetoothDevices)();
                this.send('bluetoothDevices', results, data);
            }
            catch (err) {
                console.error('error fetching bluetooth devices', err);
                this.send('bluetoothDevices', [], data);
            }
        });
    }
    audioDevices(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const results = yield (0, systeminformation_1.audio)();
            this.send('audioDevices', results, data);
        });
    }
    networkInterfaces(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const results = yield (0, systeminformation_1.networkInterfaces)();
            this.send('networkInterfaces', results, data);
        });
    }
    wifiConnect(data) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { ssid, password, iface } = data.data;
            // establish wifi abilities
            wifi.init({ iface });
            const result = yield wifi.connect({ ssid, password })
                .catch((err) => {
                this.send('wifiConnections', err, data);
                return err;
            })
                .then((x) => {
                this.wifiConnections(data);
                return x;
            });
            console.log('wifi result', result);
        });
    }
}
exports.WsPinConnectionSwitch = WsPinConnectionSwitch;
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
//# sourceMappingURL=WsPinConnectionSwitch.class.js.map