define(["require", "exports", "../exFuncBase"], function (require, exports, exFuncBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exMsgFuncBase extends exFuncBase_1.default {
        get name() {
            return '消息通信方法';
        }
    }
    exports.default = exMsgFuncBase;
});
