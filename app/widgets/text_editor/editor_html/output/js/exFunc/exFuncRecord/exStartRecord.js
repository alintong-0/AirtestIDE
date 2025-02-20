define(["require", "exports", "../../exManager/exMsgMgr", "../exFuncBase"], function (require, exports, exMsgMgr_1, exFuncBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exStartRecord extends exFuncBase_1.default {
        get name() {
            return '开始录制';
        }
        get callback() {
            return () => {
                exMsgMgr_1.default.getInstance().isRecording = true;
                console.log('Start Record!', '开始录制!');
                return true;
            };
        }
        get disabled() {
            return false;
        }
    }
    exports.default = exStartRecord;
});
