"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsPinConnectionSwitch = void 0;
const tslib_1 = require("tslib");
const { exec } = require("child_process");
const index_pins_1 = require("./index.pins");
const WsEventMessageHandler_class_1 = require("../shared/WsEventMessageHandler.class");
const systeminformation_1 = require("systeminformation");
const wifi = require("node-wifi");
class WsPinConnectionSwitch extends WsEventMessageHandler_class_1.WsEventMessageHandler {
    setPins(data) {
        index_pins_1.setPins(data.data);
        this.send('pins', index_pins_1.pins, data); // echo
    }
    getPins(data) {
        this.send('pins', index_pins_1.pins, data);
    }
    command(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.send('commandResult', yield runCommand(data.data), data);
        });
    }
    wifiNetworks(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = yield systeminformation_1.wifiNetworks();
            this.send('wifiNetworks', results, data);
        });
    }
    wifiConnections(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = yield systeminformation_1.wifiConnections();
            this.send('wifiConnections', results, data);
        });
    }
    bluetoothDevices(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = yield systeminformation_1.bluetoothDevices();
            this.send('bluetoothDevices', results, data);
        });
    }
    audioDevices(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = yield systeminformation_1.audio();
            this.send('audioDevices', results, data);
        });
    }
    networkInterfaces(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = yield systeminformation_1.networkInterfaces();
            this.send('networkInterfaces', results, data);
        });
    }
    wifiConnect(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            console.log('result', result);
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