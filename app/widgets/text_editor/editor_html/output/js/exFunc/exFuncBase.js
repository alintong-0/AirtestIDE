define(["require", "exports", "../exManager/exMsgMgr"], function (require, exports, exMsgMgr_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exFuncBase {
        constructor() { }
        get callback() {
            return () => {
                console.log('This method is not implemented!', '此方法未实现!');
                return true;
            };
        }
        get className() {
            return '';
        }
        get icon() {
            return '';
        }
        get disabled() {
            return false;
        }
        get visible() {
            return true;
        }
        get type() {
            return null;
        }
        get events() {
            return {};
        }
        get value() {
            return '';
        }
        get selected() {
            return false;
        }
        get radio() {
            return 'defaultGroup';
        }
        get options() {
            return {};
        }
        get height() {
            return '';
        }
        get accesskey() {
            return '';
        }
        get items() {
            return null;
        }
        sendMsg(msg) {
            console.warn("sendMsg:", msg);
            exMsgMgr_1.default.getInstance().sendMessage(msg);
        }
        cbDefaultFunction(itemKey, opt, originalEvent) {
            return false;
        }
        eventsDefaultFunction(element, e) {
        }
    }
    exports.default = exFuncBase;
});
