define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Singleton {
        constructor() { }
        static getInstance() {
            if (!this._instance) {
                ;
                this._instance = new this();
            }
            return this._instance;
        }
    }
    exports.default = Singleton;
});
