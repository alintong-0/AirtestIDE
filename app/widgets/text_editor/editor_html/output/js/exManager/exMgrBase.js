define(["require", "exports", "../common/singleton"], function (require, exports, singleton_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const updateList = {};
    let updateIndex = 0;
    const updateDeltaTime = 1000;
    function update() {
        Object.keys(updateList).forEach((key) => {
            updateList[key]();
        });
    }
    setInterval(() => {
        update();
    }, updateDeltaTime);
    class exMgrBase extends singleton_1.default {
        constructor() {
            super();
            updateList[updateIndex++] = this.update.bind(this);
        }
        addUpdateObj(updateFunc) {
            let index = updateIndex++;
            updateList[index] = updateFunc.bind(this);
            return index;
        }
        removeUpdateObj(index) {
            delete updateList[index];
        }
    }
    exports.default = exMgrBase;
});
