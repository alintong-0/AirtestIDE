define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exFuncBase {
        constructor() { }
        get callback() {
            return () => {
                console.log('This method is not implemented!', '此方法未实现!');
            };
        }
        get className() {
            return '';
        }
        get icon() {
            return '';
        }
        get disabled() {
            return false;
        }
        get visible() {
            return true;
        }
        get type() {
            return null;
        }
        get events() {
            return {};
        }
        get value() {
            return '';
        }
        get selected() {
            return false;
        }
        get radio() {
            return 'defaultGroup';
        }
        get options() {
            return {};
        }
        get height() {
            return '';
        }
        get accesskey() {
            return '';
        }
        get items() {
            return [];
        }
    }
    exports.default = exFuncBase;
});
