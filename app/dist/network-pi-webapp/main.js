(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "../package.json":
/*!***********************!*\
  !*** ../package.json ***!
  \***********************/
/*! exports provided: name, version, description, main, scripts, author, license, manualDependencies, peerDependencies, dependencies, devDependencies, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"network-pi\",\"version\":\"1.2.15\",\"description\":\"Acker testing platform for pi controlled over the network\",\"main\":\"index.js\",\"scripts\":{\"start:pi\":\"npm-run-all --parallel start:server:pi start:webapp:pi\",\"start:pi:ng\":\"npm-run-all --parallel start:server:pi start:webapp:ng\",\"start:webapp\":\"ack-reload --dir ./app/dist/network-pi-webapp/ --host 0.0.0.0\",\"start:webapp:ng\":\"cd app && npm run start -- --open --host 0.0.0.0 --disable-host-check\",\"start:webapp:pi\":\"sudo npm run start:webapp -- --port 80\",\"build\":\"npm run build:server && cd app && npm run build\",\"build:server\":\"tsc --project ./server/tsconfig.json\",\"start:server\":\"host=0.0.0.0 port=3000 ts-node server/index\",\"start:server:pi\":\"host=0.0.0.0 port=3000 npm run start:server\",\"start:server:watch\":\"ts-node-dev server/index\",\"start:server:watch:pi\":\"host=0.0.0.0 npm run start:server:watch\",\"test\":\"echo \\\"Error: no test specified\\\" && exit 1\",\"watch\":\"npm-run-all --parallel start:webapp:ng start:server:watch\",\"watch:pi\":\"npm-run-all --parallel start:webapp:pi start:server:watch:pi\",\"save\":\"npm run build && npm run save:server\",\"save:server\":\"npm --no-git-tag-version version patch && git add . && git commit -m \\\"update\\\" && git push\",\"serve:ng\":\"cd app && ng serve ./app/dist/network-pi-webapp\",\"start\":\"npm-run-all --parallel start:server start:webapp\",\"patch:version\":\"npm --no-git-tag-version version patch\",\"deploy\":\"npm run save\"},\"author\":\"Acker Apple\",\"license\":\"ISC\",\"manualDependencies\":{\"wiringpi-node\":\"^2.4.4\",\"node-wiring-pi\":\"0.0.5\"},\"peerDependencies\":{\"rxjs\":\">=7.5.5\"},\"dependencies\":{\"ack-pi\":\"git+https://github.com/ackerapple/ack-pi.git\",\"nconf\":\"^0.12.0\",\"node-static\":\"^0.7.11\",\"node-wifi\":\"^2.0.16\",\"node-wiring-pi\":\"0.0.5\",\"npm-run-all\":\"^4.1.5\",\"systeminformation\":\"^5.11.15\",\"ws\":\"^7.4.4\"},\"devDependencies\":{\"@types/nconf\":\"^0.10.2\",\"@types/node\":\"^17.0.35\",\"@types/ws\":\"^7.4.4\",\"ack-reload\":\"^4.0.0\",\"rxjs\":\"^7.3.0\",\"ts-node\":\"^10.8.0\",\"ts-node-dev\":\"^1.1.8\",\"typescript\":\"4.7.2\",\"zone.js\":\"^0.11.5\"}}");

/***/ }),

/***/ "../shared/WsEventCommunicator.class.ts":
/*!**********************************************!*\
  !*** ../shared/WsEventCommunicator.class.ts ***!
  \**********************************************/
/*! exports provided: WsEventCommunicator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WsEventCommunicator", function() { return WsEventCommunicator; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "../node_modules/rxjs/dist/esm/index.js");


// const WebSocket = require('ws') // causes not for browser error
const isWsNeeded = typeof WebSocket === 'undefined';
function getWs() {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
        if (isWsNeeded) {
            const ws = yield __webpack_require__.e(/*! import() | ws */ "ws").then(__webpack_require__.t.bind(null, /*! ws */ "../node_modules/ws/browser.js", 7));
            return ws;
        }
        return WebSocket;
    });
}
class WsEventCommunicator {
    constructor(url) {
        this.url = url;
        this.loadCount = 0;
        this.promises = {};
        this.$onopen = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.$error = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.$onmessage = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.$reconnecting = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
    }
    connect() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            if (this.ws) {
                console.warn('web socket server already connected');
                return;
            }
            delete this.disconnectAsked;
            return this.initSocket();
        });
    }
    initSocket() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            try {
                const ws = new (yield getWs())(this.url);
                this.socketListen(ws);
            }
            catch (err) {
                console.error('failed to init socket', err);
            }
        });
    }
    disconnect() {
        this.disconnectAsked = true;
        if (this.ws) {
            this.ws.close();
            delete this.ws;
        }
        clearInterval(this.reconnectTimer);
        delete this.reconnectTimer;
    }
    reconnect() {
        this.disconnect();
        this.connect();
    }
    sendWaitMessageResponse(message) {
        const ws = this.ws;
        const id = Date.now() + '-' + (++this.loadCount);
        message.responseId = id;
        return new Promise((res, rej) => {
            const obj = { res, rej };
            this.promises[id] = obj; // prevent type checking `res`
            ws.send(JSON.stringify(message));
        });
    }
    keepRetryingConnect() {
        // console.log(`Trying ws connection to ${this.url}...`)
        this.reconnectTimer = setInterval(() => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            this.$reconnecting.next();
            try {
                // console.log('running connect loop')
                yield this.connect()
                    .catch((err) => console.warn(`Failed connection try to ${this.url}`, err));
                // console.log('sent connect loop')
            }
            catch (err) {
                console.warn(`Failed trying connection to ${this.url}`, err);
            }
        }), 5000);
    }
    socketListen(ws) {
        const pins = {};
        // const pin0 = {num:0, type:'OUTPUT', mode:'low'}
        ws.onerror = (event) => {
            this.$error.next(event.error);
        };
        ws.onclose = () => {
            delete this.ws;
            if (!this.reconnectTimer && !this.disconnectAsked) {
                this.keepRetryingConnect();
                return;
            }
            delete this.disconnectAsked;
        };
        ws.onopen = () => {
            clearInterval(this.reconnectTimer);
            delete this.reconnectTimer;
            this.ws = ws; // only when connected successfully do we set
            this.$onopen.next(this.ws);
        };
        ws.onmessage = ev => {
            const data = JSON.parse(ev.data.toString());
            this.lastMessage = data;
            // someone waiting for a response?
            const resId = data.responseId;
            if (resId && this.promises[resId]) {
                const handler = this.promises[resId];
                delete this.promises[resId];
                --this.loadCount;
                return handler.res(data.data);
            }
            this.$onmessage.next(data);
        };
    }
    send(eventType, data) {
        const ws = this.ws;
        ws.send(JSON.stringify({ eventType, data }));
    }
    trySend(eventType, data) {
        if (!this.ws) {
            return false;
        }
        this.send(eventType, data);
        return true;
    }
    sendWaitResponse(eventType, data) {
        const message = { eventType, data };
        return this.sendWaitMessageResponse(message);
    }
}


/***/ }),

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");




const routes = [];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../package.json */ "../package.json");
var _package_json__WEBPACK_IMPORTED_MODULE_1___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../../package.json */ "../package.json", 1);
/* harmony import */ var _shared_WsEventCommunicator_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/WsEventCommunicator.class */ "../shared/WsEventCommunicator.class.ts");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");








function AppComponent_div_16_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "if not working try port 3000");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AppComponent_div_16_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "input", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function AppComponent_div_16_Template_input_change_1_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r12); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r11.updateWsUrl($event.target.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](2, AppComponent_div_16_div_2_Template, 2, 0, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", ctx_r0.config.wsUrl);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r0.config.wsUrl === "ws://localhost:4200/ws");
} }
function AppComponent_button_17_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_button_17_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r14); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r13.wsComm.disconnect(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "disconnect");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AppComponent_button_18_Template(rf, ctx) { if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_button_18_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r16); const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r15.wsComm.reconnect(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "reconnect");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AppComponent_button_19_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1, "connect");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} }
function AppComponent_ng_container_22_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainer"](0);
} }
function AppComponent_ng_container_23_ng_container_17_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainer"](0);
} }
function AppComponent_ng_container_23_ng_container_17_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AppComponent_ng_container_23_ng_container_17_ng_container_1_Template, 1, 0, "ng-container", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngTemplateOutlet", _r8);
} }
function AppComponent_ng_container_23_div_18_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("... loading ", ctx_r18.loadCount, " items ...");
} }
function AppComponent_ng_container_23_Template(rf, ctx) { if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "form", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("submit", function AppComponent_ng_container_23_Template_form_submit_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r20.submitPins(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); ctx_r22.config.debug = !ctx_r22.config.debug; return ctx_r22.saveConfig(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4, "\uD83E\uDEB2 DEBUG");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r23.reloadPins(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6, "REFRESH PINS");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_7_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r24.toggleStrobePins(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8, "STROBE PINS");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r25.addPin(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, "ADD PIN");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_11_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r26.allPinsHigh(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12, "ALL HIGH");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_container_23_Template_button_click_13_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r27 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r27.allPinsLow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](14, "ALL LOW");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16, "SAVE PINS");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](17, AppComponent_ng_container_23_ng_container_17_Template, 2, 1, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](18, AppComponent_ng_container_23_div_18_Template, 2, 1, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](19, "form", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("submit", function AppComponent_ng_container_23_Template_form_submit_19_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r28.sendTerminalCommand(ctx_r28.terminalCommand); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](20, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](21, "pre");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "input", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("keyup", function AppComponent_ng_container_23_Template_input_keyup_23_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r21); const ctx_r29 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r29.terminalCommand = $event.target.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](24, "input", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](25, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](26, "path", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", ctx_r5.config.debug ? "green" : undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", ctx_r5.strobePins ? "green" : null);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r5.config.debug);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r5.loadCount);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r5.commandResultData);
} }
function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r36 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); pin_r31.value.request.mode = "LOW"; return ctx_r34.submitPins(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "LOW");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); pin_r31.value.request.mode = "HIGH"; return ctx_r37.submitPins(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4, "HIGH");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); pin_r31.value.request.mode = "HIGH"; return ctx_r39.shortPressPin(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6, "short low");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "button", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_7_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r41 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); pin_r31.value.request.mode = "LOW"; return ctx_r41.shortPressPin(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8, "short high");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r43.blinkPin(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, "blink");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template_button_click_11_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r36); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit; const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r45.shortPressPin(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12, "short press");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", pin_r31.value.request.mode === "LOW" ? pin_r31.value.request.mode == pin_r31.value.state.mode && "green" || "blue" : undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", pin_r31.value.request.mode === "HIGH" ? pin_r31.value.request.mode == pin_r31.value.state.mode && "green" || "blue" : undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", pin_r31.value.request.mode === "LOW");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", pin_r31.value.request.mode === "HIGH");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", pin_r31.value.blink ? "green" : undefined);
} }
function AppComponent_ng_template_24_div_1_ng_container_5_Template(rf, ctx) { if (rf & 1) {
    const _r50 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("mouseup", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_mouseup_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r48 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r48.pinLow(pin_r31.value); })("mousedown", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_mousedown_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r51 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r51.pinHigh(pin_r31.value); })("touchstart", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_touchstart_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r53 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r53.pinHigh(pin_r31.value); })("touchend", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_touchend_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r55 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r55.pinLow(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "PRESS HIGH");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("mouseup", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_mouseup_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r57 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r57.pinHigh(pin_r31.value); })("mousedown", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_mousedown_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r59 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r59.pinLow(pin_r31.value); })("touchstart", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_touchstart_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r61 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r61.pinLow(pin_r31.value); })("touchend", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_touchend_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; const ctx_r63 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r63.pinHigh(pin_r31.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4, "PRESS LOW");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_ng_container_5_Template_button_click_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r50); const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit; return pin_r31.details = !pin_r31.details; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6, "\u2139\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, AppComponent_ng_template_24_div_1_ng_container_5_div_7_Template, 13, 8, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const pin_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", pin_r31.value.request.mode === "HIGH" ? pin_r31.value.request.mode == pin_r31.value.state.mode && "green" || "blue" : undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵstyleProp"]("background-color", pin_r31.value.request.mode === "LOW" ? pin_r31.value.request.mode == pin_r31.value.state.mode && "green" || "blue" : undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", pin_r31.details);
} }
function AppComponent_ng_template_24_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r70 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_Template_button_click_3_listener() { const pin_r31 = ctx.$implicit; return pin_r31.value.request.type = (pin_r31.value.request == null ? null : pin_r31.value.request.type) === "INPUT" ? "OUTPUT" : "INPUT"; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, AppComponent_ng_template_24_div_1_ng_container_5_Template, 8, 5, "ng-container", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "button", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_24_div_1_Template_button_click_6_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r70); const pin_r31 = ctx.$implicit; const ctx_r69 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r69.deletePin(pin_r31); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7, "\uD83D\uDDD1\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const pin_r31 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\u26A1 ", pin_r31.key, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"]((pin_r31.value.request == null ? null : pin_r31.value.request.type) === "INPUT" ? "INPUT" : "OUTPUT");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", (pin_r31.value.request == null ? null : pin_r31.value.request.type) === "OUTPUT");
} }
function AppComponent_ng_template_24_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AppComponent_ng_template_24_div_1_Template, 8, 3, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](2, "keyvalue");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](2, 1, ctx_r7.config.pins));
} }
function AppComponent_ng_template_26_select_42_option_1_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "option", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const wifiNetwork_r74 = ctx.$implicit;
    const index_r75 = ctx.index;
    const ctx_r73 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", index_r75)("selected", index_r75 === ctx_r73.wifi.viewNetworkIndex);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](wifiNetwork_r74.ssid);
} }
function AppComponent_ng_template_26_select_42_Template(rf, ctx) { if (rf & 1) {
    const _r77 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "select", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function AppComponent_ng_template_26_select_42_Template_select_change_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r77); const ctx_r76 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r76.wifi.viewNetworkIndex = $event.target.options[$event.target.selectedIndex].value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, AppComponent_ng_template_26_select_42_option_1_Template, 2, 3, "option", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r71 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r71.wifi.wifiNetworks);
} }
function AppComponent_ng_template_26_div_46_option_7_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "option", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r79 = ctx.$implicit;
    const ctx_r78 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("value", item_r79.iface)("selected", ctx_r78.wifi.tempIface === item_r79.iface);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"]("", item_r79.type, " - ", item_r79.iface, "");
} }
function AppComponent_ng_template_26_div_46_Template(rf, ctx) { if (rf & 1) {
    const _r81 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](4, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "select", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function AppComponent_ng_template_26_div_46_Template_select_change_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r81); const ctx_r80 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r80.wifi.tempIface = $event.target.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, AppComponent_ng_template_26_div_46_option_7_Template, 2, 4, "option", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "input", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function AppComponent_ng_template_26_div_46_Template_input_change_8_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r81); const ctx_r82 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r82.wifi.tempPassword = $event.target.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "button", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_div_46_Template_button_click_9_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r81); const ctx_r83 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2); return ctx_r83.wifiConnect(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, " connect ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r72 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](4, 2, ctx_r72.wifi.wifiNetworks[ctx_r72.wifi.viewNetworkIndex]));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngForOf", ctx_r72.wifi.networkInterfaces);
} }
function AppComponent_ng_template_26_Template(rf, ctx) { if (rf & 1) {
    const _r85 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, "PINS");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "textarea", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("keyup", function AppComponent_ng_template_26_Template_textarea_keyup_5_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r84 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r84.setPinsByString($event.target.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](7, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](9, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](10, "MESSAGES");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](14, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](16, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](17, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](18, "\uD83D\uDD0C\u00A0\u00A0Network Interfaces");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](19, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](20, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_Template_a_click_20_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r86 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r86.fetchNetworkInterfaces(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](21, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](22, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](25, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](26, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](27, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](28, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](29, "\uD83D\uDCF6\u00A0\u00A0WIFI Connections");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](30, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](31, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_Template_a_click_31_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r87 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r87.fetchWifiConnections(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](32, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](33, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](34, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](35);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](36, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](37, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](38, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](39, "h3", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](40, "\uD83D\uDCE1\u00A0\u00A0WIFI Networks");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](41, "div", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](42, AppComponent_ng_template_26_select_42_Template, 2, 1, "select", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](43, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](44, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_Template_a_click_44_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r88 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r88.fetchWifiNetworks(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](45, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](46, AppComponent_ng_template_26_div_46_Template, 11, 4, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](47, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](48, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](49, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](50, "\u2328\uFE0F\u00A0\u00A0Bluetooth Devices");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](51, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_Template_a_click_51_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r89 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r89.fetchBluetoothDevices(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](52, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](53, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](54, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](55);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](56, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](57, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](58, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](59, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](60, "\uD83C\uDFA7\u00A0\u00A0Audio Devices");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](61, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function AppComponent_ng_template_26_Template_a_click_61_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r85); const ctx_r90 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](); return ctx_r90.fetchAudioDevices(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](62, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](63, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](64, "textarea", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](65);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](66, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](7, 18, ctx_r9.config.pins));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](14, 20, ctx_r9.wsComm.lastMessage));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("opacity-half", ctx_r9.fetchStatus.networkInterfaces);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](25, 22, ctx_r9.wifi.networkInterfaces));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("opacity-half", ctx_r9.fetchStatus.wifiConnections);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](36, 24, ctx_r9.wifi.wifiConnections));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("opacity-half", ctx_r9.fetchStatus.wifiNetworks);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r9.wifi.wifiNetworks == null ? null : ctx_r9.wifi.wifiNetworks.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx_r9.wifi.viewNetworkIndex != undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("opacity-half", ctx_r9.fetchStatus.bluetoothDevices);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](56, 26, ctx_r9.bluetoothDevices));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("opacity-half", ctx_r9.fetchStatus.audioDevices);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](66, 28, ctx_r9.audioDevices));
} }
const urlParams = new URLSearchParams(window.location.search);
const forcePort = urlParams.get('port');
const forceHost = urlParams.get('host');
const port = window.location.port || forcePort || 3000;
const hostPath = window.location.hostname + ':' + port;
const wsUrl = 'ws://' + hostPath + '/ws';
class AppComponent {
    constructor() {
        this.name = _package_json__WEBPACK_IMPORTED_MODULE_1__["name"];
        this.version = _package_json__WEBPACK_IMPORTED_MODULE_1__["version"];
        this.subs = new rxjs__WEBPACK_IMPORTED_MODULE_4__["Subscription"]();
        this.fetchStatus = {
            bluetoothDevices: 0,
            audioDevices: 0,
            networkInterfaces: 0,
            wifiNetworks: 0,
            wifiConnections: 0,
        };
        this.config = this.loadLocalStorage() || {
            wsUrl, pins: {}
        };
        this.wsComm = new _shared_WsEventCommunicator_class__WEBPACK_IMPORTED_MODULE_2__["WsEventCommunicator"](this.config.wsUrl);
        this.loadCount = 0;
        this.title = 'network-pi-webapp';
        this.wifi = {};
        console.log('starting');
        if (forceHost || forcePort) {
            this.config.wsUrl = wsUrl;
        }
        this.subs.add(this.wsComm.$onopen.subscribe(() => this.wsConnected())).add(this.wsComm.$onmessage.subscribe(data => this.handleWsMessage(data)));
        this.config.pins = this.config.pins || {};
        this.wsComm.connect();
    }
    wsConnected() {
        this.reloadPins();
        this.fetchNetworkInterfaces();
        this.fetchWifiConnections();
        this.fetchWifiNetworks();
        // this.fetchBluetoothDevices()
        this.fetchAudioDevices();
    }
    updateWsUrl(url) {
        this.wsComm.url = url;
        this.config.wsUrl = url;
    }
    wifiConnect() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const index = this.wifi.viewNetworkIndex;
            const ssid = this.wifi.wifiNetworks[index].ssid;
            const password = this.wifi.tempPassword;
            const iface = this.wifi.tempIface;
            const options = { ssid, password, iface };
            console.log('options', options);
            const result = yield this.wsComm.sendWaitResponse('wifiConnect', options);
            console.log('result', result);
        });
    }
    fetchBluetoothDevices() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            ++this.fetchStatus.bluetoothDevices;
            this.bluetoothDevices = yield this.wsComm.sendWaitResponse('bluetoothDevices');
            --this.fetchStatus.bluetoothDevices;
        });
    }
    fetchAudioDevices() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            ++this.fetchStatus.audioDevices;
            this.audioDevices = yield this.wsComm.sendWaitResponse('audioDevices');
            --this.fetchStatus.audioDevices;
        });
    }
    fetchNetworkInterfaces() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            ++this.fetchStatus.networkInterfaces;
            this.wifi.networkInterfaces = yield this.wsComm.sendWaitResponse('networkInterfaces');
            --this.fetchStatus.networkInterfaces;
        });
    }
    fetchWifiNetworks() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            ++this.fetchStatus.wifiNetworks;
            this.wifi.wifiNetworks = yield this.wsComm.sendWaitResponse('wifiNetworks');
            this.paramWifiNetworkIndex();
            --this.fetchStatus.wifiNetworks;
        });
    }
    fetchWifiConnections() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            ++this.fetchStatus.wifiConnections;
            this.wifi.wifiConnections = yield this.wsComm.sendWaitResponse('wifiConnections');
            this.paramWifiNetworkIndex();
            --this.fetchStatus.wifiConnections;
        });
    }
    paramWifiNetworkIndex() {
        const networks = this.wifi.wifiNetworks;
        const connections = this.wifi.wifiConnections;
        if (!(networks === null || networks === void 0 ? void 0 : networks.length) || !(connections === null || connections === void 0 ? void 0 : connections.length) || this.wifi.viewNetworkIndex != undefined) {
            return;
        }
        networks.find((network, index) => {
            const ssid = network.ssid;
            const foundSsid = connections.find(connection => connection.ssid === ssid);
            if (!foundSsid) {
                return false;
            }
            this.wifi.viewNetworkIndex = index;
            return true;
        });
    }
    ngOnDestroy() {
        this.subs.unsubscribe();
    }
    reloadPins() {
        ++this.loadCount;
        this.sendWaitResponse('getPins')
            .then(data => {
            --this.loadCount;
            this.setPinsByResponse(data);
        });
    }
    handleWsMessage(data) {
        if (!this[data.eventType]) {
            console.warn(`unknown ws message of type ${data.eventType}`);
            return data;
        }
        this[data.eventType].call(this, data.data);
    }
    commandResult(data) {
        --this.loadCount;
        this.commandResultData = data;
    }
    pins(data) {
        --this.loadCount;
        this.setPinsByResponse(data);
    }
    setPinsByResponse(data) {
        Object.keys(data).forEach(key => {
            this.config.pins[key] = this.config.pins[key] || {
                num: key, request: {}, state: {}
            };
            Object.assign(this.config.pins[key].state, data[key]);
        });
    }
    submitPins() {
        ++this.loadCount;
        const pins = {};
        Object.keys(this.config.pins).forEach(key => {
            pins[key] = Object.assign({ num: key }, this.config.pins[key].request);
        });
        this.send('setPins', pins);
        return false;
    }
    sendWaitResponse(eventType, data) {
        return this.wsComm.sendWaitResponse(eventType, data);
    }
    saveConfig() {
        localStorage.setItem('networkPi', JSON.stringify(this.config));
    }
    loadLocalStorage() {
        try {
            const localValues = localStorage.networkPi;
            const config = JSON.parse(localValues) || this.config;
            console.log('previous localStorage loaded', config);
            Object.keys(config.pins).forEach(pinId => {
                const pin = config.pins[pinId];
                pin.request = pin.request || { type: 'INPUT' };
                pin.state = pin.state || { type: 'INPUT' };
            });
            return this.config = config;
        }
        catch (err) {
            console.error('unable to load past settings', err);
        }
    }
    setPinsByString(pins) {
        const newPins = JSON.parse(pins);
        this.config.pins = newPins;
        this.saveConfig();
    }
    blinkPin(pin) {
        if (pin.blink) {
            clearInterval(pin.blink);
            pin.request.mode = 'LOW';
            delete pin.blink;
            this.submitPins();
            return;
        }
        pin.blink = setInterval(() => {
            this.togglePin(pin);
        }, 500);
    }
    sendTerminalCommand(command) {
        ++this.loadCount;
        this.send('command', command);
    }
    pinHigh(pin) {
        pin.request.mode = "HIGH";
        this.submitPins();
    }
    pinLow(pin) {
        pin.request.mode = "LOW";
        this.submitPins();
    }
    togglePin(pin) {
        const orgMode = pin.request.mode === 'HIGH' ? 'HIGH' : 'LOW';
        const newMode = orgMode === 'HIGH' ? 'LOW' : 'HIGH';
        pin.request.mode = newMode;
        this.submitPins();
    }
    shortPressPin(pin) {
        this.togglePin(pin);
        setTimeout(() => {
            this.togglePin(pin);
        }, 250);
    }
    toggleStrobePins() {
        if (this.strobePins) {
            clearInterval(this.strobePins);
            delete this.strobePins;
            return;
        }
        this.strobePinsAction();
    }
    strobePinsAction() {
        const pinKeys = Object.keys(this.config.pins);
        const pinCount = pinKeys.length;
        let direction = 1;
        this.strobePins = setInterval(() => {
            const orderedKeys = pinKeys.sort((a, b) => Number(direction ? a : b) - Number(direction ? b : a));
            orderedKeys.forEach((key, i) => {
                setTimeout(() => {
                    this.togglePin(this.config.pins[key]);
                    setTimeout(() => {
                        this.togglePin(this.config.pins[key]);
                    }, 100);
                }, i * 100);
            });
            direction = direction ? 0 : 1;
        }, pinCount * 200);
    }
    addPin() {
        let index = -1;
        while (++index < 40) {
            const pinIndex = index.toString();
            const found = Object.keys(this.config.pins).includes(pinIndex);
            if (found) {
                continue;
            }
            this.config.pins[pinIndex] = {
                num: pinIndex,
                type: "INPUT",
                mode: "LOW",
                request: {},
            };
            break;
        }
        this.saveConfig();
    }
    deletePin(pin) {
        const pinNum = pin.value.num.toString();
        delete this.config.pins[pinNum];
        this.submitPins();
    }
    send(eventType, data) {
        this.wsComm.send(eventType, data);
    }
    allPinsHigh() {
        Object.values(this.config.pins).forEach(pin => pin.request.mode = "HIGH");
        this.submitPins();
    }
    allPinsLow() {
        Object.values(this.config.pins).forEach(pin => pin.request.mode = "LOW");
        this.submitPins();
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 29, vars: 8, consts: [["role", "banner", 1, "toolbar"], ["width", "40", "alt", "Angular Logo", "src", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=="], [1, "spacer"], ["role", "main"], [2, "display", "flex"], ["method", "post", "action", "javascript:", 3, "submit"], [2, "display", "flex", "flex-wrap", "wrap"], [4, "ngIf"], ["style", "background-color: red;", "type", "button", 3, "click", 4, "ngIf"], ["style", "background-color: orange;", "type", "button", 3, "click", 4, "ngIf"], ["type", "submit", 4, "ngIf"], [4, "ngTemplateOutlet"], ["pinPanelTemplate", ""], ["debugArea", ""], ["type", "text", "maxLength", "125", "placeholder", "Web Socket URL", 3, "value", "change"], ["type", "button", 2, "background-color", "red", 3, "click"], ["type", "button", 2, "background-color", "orange", 3, "click"], ["type", "submit"], ["action", "javascript:", 2, "display", "block", "width", "100%", 3, "submit"], [1, "flex-wrap", "child-pad-smx"], ["type", "button", 1, "flex-1", "text-2x", 3, "click"], ["type", "submit", 1, "flex-1", "text-2x"], ["method", "post", "action", "javascript:", 2, "width", "100%", 3, "submit"], [1, "terminal", 2, "width", "100%"], ["type", "text", "placeholder", "$", 2, "width", "100%", 3, "keyup"], ["type", "submit", "value", "send"], ["id", "clouds", "alt", "Gray Clouds Background", "xmlns", "http://www.w3.org/2000/svg", "width", "2611.084", "height", "485.677", "viewBox", "0 0 2611.084 485.677"], ["id", "Path_39", "data-name", "Path 39", "d", "M2379.709,863.793c10-93-77-171-168-149-52-114-225-105-264,15-75,3-140,59-152,133-30,2.83-66.725,9.829-93.5,26.25-26.771-16.421-63.5-23.42-93.5-26.25-12-74-77-130-152-133-39-120-212-129-264-15-54.084-13.075-106.753,9.173-138.488,48.9-31.734-39.726-84.4-61.974-138.487-48.9-52-114-225-105-264,15a162.027,162.027,0,0,0-103.147,43.044c-30.633-45.365-87.1-72.091-145.206-58.044-52-114-225-105-264,15-75,3-140,59-152,133-53,5-127,23-130,83-2,42,35,72,70,86,49,20,106,18,157,5a165.625,165.625,0,0,0,120,0c47,94,178,113,251,33,61.112,8.015,113.854-5.72,150.492-29.764a165.62,165.62,0,0,0,110.861-3.236c47,94,178,113,251,33,31.385,4.116,60.563,2.495,86.487-3.311,25.924,5.806,55.1,7.427,86.488,3.311,73,80,204,61,251-33a165.625,165.625,0,0,0,120,0c51,13,108,15,157-5a147.188,147.188,0,0,0,33.5-18.694,147.217,147.217,0,0,0,33.5,18.694c49,20,106,18,157,5a165.625,165.625,0,0,0,120,0c47,94,178,113,251,33C2446.709,1093.793,2554.709,922.793,2379.709,863.793Z", "transform", "translate(142.69 -634.312)", "fill", "#eee"], [1, "disable-select", "flex-wrap", "child-margin"], ["class", "flex-1 flex-wrap flex-valign-center child-margin bg-grey-3x", 4, "ngFor", "ngForOf"], [1, "flex-1", "flex-wrap", "flex-valign-center", "child-margin", "bg-grey-3x"], [2, "font-size", "1.4em"], ["type", "button", 2, "font-size", "1.4em", 3, "click"], ["type", "button", 2, "border", "1px solid black", "border-radius", "5px", "padding", "1.5em", "display", "flex", 3, "mouseup", "mousedown", "touchstart", "touchend"], ["class", "flex-1", 4, "ngIf"], [1, "flex-1"], ["type", "button", 2, "font-size", "1.4em", 3, "disabled", "click"], [1, "flex-wrap", "child-margin", "child-pad"], [1, "flex-1", "bg-grey-3x"], [1, "width-full", "flex", "min-width-300"], ["wrap", "off", "rows", "30", 2, "flex-grow", "1", 3, "keyup"], ["disabled", "", "wrap", "off", "rows", "30", 2, "flex-grow", "1"], [1, "flex-apart"], [3, "click"], [1, "margin-h"], [3, "change", 4, "ngIf"], [3, "change"], [3, "value", "selected", 4, "ngFor", "ngForOf"], [3, "value", "selected"], [1, "flex-right"], ["type", "password", "placeholder", "wifi password", 3, "change"], ["type", "button", 3, "click"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "img", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](6, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](7, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](8, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](9, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](10, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](11, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "form", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("submit", function AppComponent_Template_form_submit_14_listener() { ctx.wsComm.connect(); return ctx.saveConfig(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](16, AppComponent_div_16_Template, 3, 2, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](17, AppComponent_button_17_Template, 2, 0, "button", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](18, AppComponent_button_18_Template, 2, 0, "button", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](19, AppComponent_button_19_Template, 2, 0, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](20, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](21, "br");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](22, AppComponent_ng_container_22_Template, 1, 0, "ng-container", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](23, AppComponent_ng_container_23_Template, 27, 7, "ng-container", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](24, AppComponent_ng_template_24_Template, 3, 3, "ng-template", null, 12, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](26, AppComponent_ng_template_26_Template, 67, 30, "ng-template", null, 13, _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplateRefExtractor"]);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](28, "router-outlet");
    } if (rf & 2) {
        const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵreference"](25);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate2"]("Welcome to ", ctx.name, " v", ctx.version, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](13);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.wsComm.ws);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.wsComm.ws);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.wsComm.ws);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", !ctx.wsComm.ws);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngTemplateOutlet", _r6);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.wsComm.ws);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgTemplateOutlet"], _angular_router__WEBPACK_IMPORTED_MODULE_6__["RouterOutlet"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgForOf"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["KeyValuePipe"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["JsonPipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */", "[_nghost-%COMP%] {\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";\n    font-size: 14px;\n    \n    box-sizing: border-box;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n\n  .disable-select[_ngcontent-%COMP%] {\n    touch-action: manipulation;\n\n    user-select: none; \n    -webkit-user-select: none; \n    -khtml-user-select: none; \n    -moz-user-select: none; \n    -ms-user-select: none; \n  }\n\n  h1[_ngcontent-%COMP%], h2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%], h5[_ngcontent-%COMP%], h6[_ngcontent-%COMP%] {\n    margin: 8px 0;\n  }\n\n  p[_ngcontent-%COMP%] {\n    margin: 0;\n  }\n\n  .spacer[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n\n  .toolbar[_ngcontent-%COMP%] {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 60px;\n    display: flex;\n    align-items: center;\n    background-color: #1976d2;\n    color: white;\n    font-weight: 600;\n  }\n\n  .toolbar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n    margin: 0 16px;\n  }\n\n  svg.material-icons[_ngcontent-%COMP%] {\n    height: 24px;\n    width: auto;\n  }\n\n  svg.material-icons[_ngcontent-%COMP%]:not(:last-child) {\n    margin-right: 8px;\n  }\n\n  .card[_ngcontent-%COMP%]   svg.material-icons[_ngcontent-%COMP%]   path[_ngcontent-%COMP%] {\n    fill: #888;\n  }\n\n  .card-container[_ngcontent-%COMP%] {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: center;\n    margin-top: 16px;\n  }\n\n  .card[_ngcontent-%COMP%] {\n    border-radius: 4px;\n    border: 1px solid #eee;\n    background-color: #fafafa;\n    height: 40px;\n    width: 200px;\n    margin: 0 8px 16px;\n    padding: 16px;\n    display: flex;\n    flex-direction: row;\n    justify-content: center;\n    align-items: center;\n    transition: all 0.2s ease-in-out;\n    line-height: 24px;\n  }\n\n  .card-container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:not(:last-child) {\n    margin-right: 0;\n  }\n\n  .card.card-small[_ngcontent-%COMP%] {\n    height: 16px;\n    width: 168px;\n  }\n\n  .card-container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:not(.highlight-card) {\n    cursor: pointer;\n  }\n\n  .card-container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:not(.highlight-card):hover {\n    transform: translateY(-3px);\n    box-shadow: 0 4px 17px rgba(0, 0, 0, 0.35);\n  }\n\n  .card-container[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]:not(.highlight-card):hover   .material-icons[_ngcontent-%COMP%]   path[_ngcontent-%COMP%] {\n    fill: rgb(105, 103, 103);\n  }\n\n  .card.highlight-card[_ngcontent-%COMP%] {\n    background-color: #1976d2;\n    color: white;\n    font-weight: 600;\n    border: none;\n    width: auto;\n    min-width: 30%;\n    position: relative;\n  }\n\n  .card.card.highlight-card[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n    margin-left: 60px;\n  }\n\n  svg#rocket[_ngcontent-%COMP%] {\n    width: 80px;\n    position: absolute;\n    left: -10px;\n    top: -24px;\n  }\n\n  svg#rocket-smoke[_ngcontent-%COMP%] {\n    height: calc(100vh - 95px);\n    position: absolute;\n    top: 10px;\n    right: 180px;\n    z-index: -10;\n  }\n\n  a[_ngcontent-%COMP%], a[_ngcontent-%COMP%]:visited, a[_ngcontent-%COMP%]:hover {\n    color: #1976d2;\n    text-decoration: none;\n  }\n\n  a[_ngcontent-%COMP%]:hover {\n    color: #125699;\n  }\n\n  .terminal[_ngcontent-%COMP%] {\n    position: relative;\n    border-radius: 6px;\n    padding-top: 45px;\n    margin-top: 8px;\n    overflow: hidden;\n    background-color: rgb(15, 15, 16);\n  }\n\n  .terminal[_ngcontent-%COMP%]::before {\n    content: \"\\2022 \\2022 \\2022\";\n    position: absolute;\n    top: 0;\n    left: 0;\n    height: 4px;\n    background: rgb(58, 58, 58);\n    color: #c2c3c4;\n    width: 100%;\n    font-size: 2rem;\n    line-height: 0;\n    padding: 14px 0;\n    text-indent: 4px;\n  }\n\n  .terminal[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n    font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;\n    color: white;\n    padding: 0 1rem 1rem;\n    margin: 0;\n  }\n\n  .circle-link[_ngcontent-%COMP%] {\n    height: 40px;\n    width: 40px;\n    border-radius: 40px;\n    margin: 8px;\n    background-color: white;\n    border: 1px solid #eeeeee;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);\n    transition: 1s ease-out;\n  }\n\n  .circle-link[_ngcontent-%COMP%]:hover {\n    transform: translateY(-0.25rem);\n    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.2);\n  }\n\n  footer[_ngcontent-%COMP%] {\n    margin-top: 8px;\n    display: flex;\n    align-items: center;\n    line-height: 20px;\n  }\n\n  footer[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n    display: flex;\n    align-items: center;\n  }\n\n  .github-star-badge[_ngcontent-%COMP%] {\n    color: #24292e;\n    display: flex;\n    align-items: center;\n    font-size: 12px;\n    padding: 3px 10px;\n    border: 1px solid rgba(27,31,35,.2);\n    border-radius: 3px;\n    background-image: linear-gradient(-180deg,#fafbfc,#eff3f6 90%);\n    margin-left: 4px;\n    font-weight: 600;\n    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;\n  }\n\n  .github-star-badge[_ngcontent-%COMP%]:hover {\n    background-image: linear-gradient(-180deg,#f0f3f6,#e6ebf1 90%);\n    border-color: rgba(27,31,35,.35);\n    background-position: -.5em;\n  }\n\n  .github-star-badge[_ngcontent-%COMP%]   .material-icons[_ngcontent-%COMP%] {\n    height: 16px;\n    width: 16px;\n    margin-right: 4px;\n  }\n\n  svg#clouds[_ngcontent-%COMP%] {\n    position: fixed;\n    bottom: -160px;\n    left: -230px;\n    z-index: -10;\n    width: 1920px;\n  }\n\n\n  \n  @media screen and (max-width: 767px) {\n\n    .card-container[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:not(.circle-link), .terminal[_ngcontent-%COMP%] {\n      width: 100%;\n    }\n\n    .card[_ngcontent-%COMP%]:not(.highlight-card) {\n      height: 16px;\n      margin: 8px 0;\n    }\n\n    .card.highlight-card[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n      margin-left: 72px;\n    }\n\n    svg#rocket-smoke[_ngcontent-%COMP%] {\n      right: 120px;\n      transform: rotate(-5deg);\n    }\n  }\n\n  @media screen and (max-width: 575px) {\n    svg#rocket-smoke[_ngcontent-%COMP%] {\n      display: none;\n      visibility: hidden;\n    }\n  }"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_3__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");





class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"]
                ],
                providers: [],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/ackerapple/projects/services/network-pi/app/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map