define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.exFuncBaseClassName = exports.ErrorCode = exports.DEBUG_URL = exports.CodingRunningType = exports.EditorMode = exports.MenuItemType = void 0;
    var MenuItemType;
    (function (MenuItemType) {
        MenuItemType["text"] = "text";
        MenuItemType["textarea"] = "textarea";
        MenuItemType["checkbox"] = "checkbox";
        MenuItemType["radio"] = "radio";
        MenuItemType["select"] = "select";
    })(MenuItemType = exports.MenuItemType || (exports.MenuItemType = {}));
    var EditorMode;
    (function (EditorMode) {
        EditorMode["EDITOR"] = "EDITOR";
        EditorMode["LOG"] = "LOG";
    })(EditorMode = exports.EditorMode || (exports.EditorMode = {}));
    var CodingRunningType;
    (function (CodingRunningType) {
        CodingRunningType[CodingRunningType["EnterCode"] = 0] = "EnterCode";
    })(CodingRunningType = exports.CodingRunningType || (exports.CodingRunningType = {}));
    exports.DEBUG_URL = 'ws://localhost:9321';
    var ErrorCode;
    (function (ErrorCode) {
        ErrorCode["E000001"] = "\u7236\u7C7B\u672A\u5728\u6CE8\u518C\u8868\u4E2D,\u8BF7\u68C0\u67E5exFunctionInit.ts\u4E2D\u662F\u5426\u6B63\u786E\u6CE8\u518C\u7236\u7C7B!";
        ErrorCode["E000002"] = "if you see this , means some error happen!";
    })(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
    exports.exFuncBaseClassName = "exFuncBase";
});
