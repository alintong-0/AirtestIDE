define(["require", "exports", "./exFuncMsg/exMsgFuncBase", "./exFuncMsg/msg_send_gm", "./exFuncProcess/exFuncProcessBase", "./exFuncProcess/process_if_func", "./exFuncRecord/exStartRecord", "./exFuncRecord/exStopRecord", "./exFuncUI/exFuncUIBase", "./exFuncUI/ui_set_pop_window"], function (require, exports, exMsgFuncBase_1, msg_send_gm_1, exFuncProcessBase_1, process_if_func_1, exStartRecord_1, exStopRecord_1, exFuncUIBase_1, ui_set_pop_window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exFunctionInit {
        constructor() {
            this.allFuncInst = [];
            Object.keys(exFunctionInit.allFunc).forEach((key) => {
                const cls = new exFunctionInit.allFunc[key]();
                this.allFuncInst.push(cls);
            });
        }
    }
    exports.default = exFunctionInit;
    exFunctionInit.allFunc = {
        exStartRecord: exStartRecord_1.default,
        exStopRecord: exStopRecord_1.default,
        exMsgFuncBase: exMsgFuncBase_1.default,
        MsgSendGM: msg_send_gm_1.default,
        exFuncProcessBase: exFuncProcessBase_1.default,
        ProcessIfFunc: process_if_func_1.default,
        exFuncUIBase: exFuncUIBase_1.default,
        UISetPopWindow: ui_set_pop_window_1.default,
    };
});
