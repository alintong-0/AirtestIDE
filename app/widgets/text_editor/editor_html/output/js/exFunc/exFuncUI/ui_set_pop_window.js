define(["require", "exports", "./exFuncUIBase"], function (require, exports, exFuncUIBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UISetPopWindow extends exFuncUIBase_1.default {
        get name() {
            return "屏蔽顶层UI弹窗";
        }
    }
    exports.default = UISetPopWindow;
});
