define(["require", "exports", "../common/utils", "./exMgrBase"], function (require, exports, utils_1, exMgrBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exMsgMgr extends exMgrBase_1.default {
        constructor() {
            super(...arguments);
            this.waitForSocketReady = false;
            this.webSocketList = {};
            this.webSocketIndex = 0;
            this.retryList = [];
        }
        init() { }
        start(editorMode) {
            switch (editorMode) {
                case utils_1.EditorMode.EDITOR:
                    this.getNewWebSocket(utils_1.DEBUG_URL, undefined, true);
                    break;
                case utils_1.EditorMode.LOG:
                    break;
                default:
                    console.error('UNKNOW EditorMode!!', editorMode);
                    break;
            }
        }
        getNewWebSocket(url, id, isRetry = false) {
            let ws = new WebSocket(url);
            const index = id ? id : this.webSocketIndex++;
            this.webSocketList[index] = {
                ws: ws,
                url: url,
                time: Date.now(),
                isRetry: isRetry,
            };
            const self = this;
            ws.addEventListener('open', function (event) {
                exMsgMgr.getInstance().waitForSocketReady = true;
                exMsgMgr.getInstance().onOpen.bind(self);
                exMsgMgr.getInstance().onOpen(index, event);
            });
            ws.addEventListener('message', function (event) {
                exMsgMgr.getInstance().onMessage.bind(self);
                exMsgMgr.getInstance().onMessage(index, event);
            });
            ws.addEventListener('close', function (event) {
                exMsgMgr.getInstance().onClose.bind(self);
                exMsgMgr.getInstance().onClose(index, event);
            });
            return index;
        }
        onOpen(id, event) { }
        onMessage(id, event) { }
        onClose(id, event) {
            if (this.webSocketList[id].isRetry) {
                console.log('WebSocket 连接已关闭，进入重试队列...', id, event);
                exMsgMgr.getInstance().retryList.push(id);
            }
            else {
                console.log('WebSocket 连接已关闭', id, event);
                delete this.webSocketList[id];
            }
        }
        sendMessage() { }
        update() {
            if (this.retryList.length > 0) {
                this.retryList.forEach((index) => {
                    console.log('WebSocket 重试连接,id=', index);
                    this.getNewWebSocket(this.webSocketList[index].url, index, this.webSocketList[index].isRetry);
                });
                this.retryList.length = 0;
            }
        }
    }
    exports.default = exMsgMgr;
});
