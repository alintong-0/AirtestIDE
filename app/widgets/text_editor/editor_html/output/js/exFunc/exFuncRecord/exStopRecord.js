define(["require", "exports", "../../exManager/exMsgMgr", "../exFuncBase"], function (require, exports, exMsgMgr_1, exFuncBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exStopRecord extends exFuncBase_1.default {
        get name() {
            return '停止录制';
        }
        get callback() {
            return () => {
                exMsgMgr_1.default.getInstance().isRecording = false;
                console.log('Stop Record!', '停止录制!');
                return true;
            };
        }
        get disabled() {
            return false;
        }
    }
    exports.default = exStopRecord;
});
