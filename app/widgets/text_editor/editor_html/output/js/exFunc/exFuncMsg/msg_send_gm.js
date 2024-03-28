define(["require", "exports", "../../common/utils", "./exMsgFuncBase"], function (require, exports, utils_1, exMsgFuncBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MsgSendGM extends exMsgFuncBase_1.default {
        constructor() {
            super(...arguments);
            this.gmInputText = '';
        }
        get name() {
            return '发送GM消息';
        }
        get items() {
            const children = {};
            children['GMInput'] = {
                name: '输入gm指令',
                type: utils_1.MenuItemType.text,
                height: '20',
                events: {
                    input: this.inputFunc.bind(this)
                }
            };
            children['SendBtn'] = {
                name: '发送指令',
                callback: this.sendBtn.bind(this),
            };
            return children;
        }
        inputFunc(element, e) {
            var _a;
            this.gmInputText = (_a = element === null || element === void 0 ? void 0 : element.target) === null || _a === void 0 ? void 0 : _a.value;
            console.log(element, this.gmInputText);
        }
        sendBtn(itemKey, opt, originalEvent) {
            console.log("sendBtn", itemKey, opt, originalEvent);
            this.sendMsg(this.gmInputText);
            return false;
        }
    }
    exports.default = MsgSendGM;
});
