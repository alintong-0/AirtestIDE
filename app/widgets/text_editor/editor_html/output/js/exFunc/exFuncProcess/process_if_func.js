define(["require", "exports", "./exFuncProcessBase"], function (require, exports, exFuncProcessBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProcessIfFunc extends exFuncProcessBase_1.default {
        get name() {
            return '条件判断';
        }
    }
    exports.default = ProcessIfFunc;
});
