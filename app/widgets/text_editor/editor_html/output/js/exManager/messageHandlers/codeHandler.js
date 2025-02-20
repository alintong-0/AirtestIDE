define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CodingRunningType;
    (function (CodingRunningType) {
        CodingRunningType[CodingRunningType["EnterCode"] = 0] = "EnterCode";
    })(CodingRunningType || (CodingRunningType = {}));
    class codeHandler {
        constructor(id) {
            this._id = id;
        }
        onMessage(event) {
            let msgData = event.data;
            console.log('接收到服务器消息：', msgData);
            if (msgData.startsWith("{")) {
                msgData = JSON.parse(msgData);
            }
            if (msgData.type != undefined) {
                switch (msgData.type) {
                    case CodingRunningType.EnterCode:
                        if (window.exMsgMgr && window.exMsgMgr.isRecording) {
                            ;
                            window.editorInstance.addText(msgData.codeStr);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    exports.default = codeHandler;
});
