define(["require", "exports", "./exMsgFuncBase"], function (require, exports, exMsgFuncBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MsgSendGM extends exMsgFuncBase_1.default {
        get name() {
            return '发送GM消息';
        }
    }
    exports.default = MsgSendGM;
});
