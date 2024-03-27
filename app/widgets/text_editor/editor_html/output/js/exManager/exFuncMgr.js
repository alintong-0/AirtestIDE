define(["require", "exports", "../common/utils", "../exFunc/exFunctionInit", "./exMgrBase"], function (require, exports, utils_1, exFunctionInit_1, exMgrBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class exFuncMgr extends exMgrBase_1.default {
        constructor() {
            super(...arguments);
            this.displayList = [];
            this.contextMenuTypes = {
                EDITOR: [utils_1.ErrorCode.E000002],
                LOG: [utils_1.ErrorCode.E000002],
            };
            this.contextMenuItems = { default: { name: utils_1.ErrorCode.E000002, items: {} } };
        }
        init(contextMenuTypes, contextMenuItems) {
            this.contextMenuTypes = contextMenuTypes;
            this.contextMenuItems = contextMenuItems;
            this.initAllMenuItem();
        }
        initAllMenuItem() {
            const functionStructure = {};
            const initCls = new exFunctionInit_1.default();
            initCls.allFuncInst.forEach((clsInst) => {
                const className = clsInst.constructor.name;
                console.log(className);
                functionStructure[className] = {
                    parent: clsInst.__proto__.__proto__.constructor.name,
                    children: [],
                    inst: clsInst,
                };
            });
            const rootClassNames = [];
            Object.keys(functionStructure).forEach((className) => {
                const nowCls = functionStructure[className];
                const parentClsName = nowCls.parent;
                if (parentClsName != utils_1.exFuncBaseClassName) {
                    if (parentClsName in functionStructure) {
                        const parentItem = functionStructure[parentClsName];
                        parentItem.children.push(nowCls);
                    }
                    else {
                        console.error(utils_1.ErrorCode.E000001);
                    }
                }
                else {
                    rootClassNames.push(className);
                }
            });
            window.functionStructure = functionStructure;
            console.log(functionStructure);
            for (let index = 0; index < rootClassNames.length; index++) {
                const clsInst = functionStructure[rootClassNames[index]];
                const tempItem = this.foreachBuildMenuItem(clsInst);
                console.log(tempItem);
                const key = Object.keys(tempItem)[0];
                this.contextMenuItems[key] = tempItem[key];
                this.contextMenuTypes.EDITOR.push(key);
            }
        }
        foreachBuildMenuItem(clsInst) {
            const cls = clsInst.inst;
            const nowClsName = cls.constructor.name;
            const nowMenuItem = {
                name: cls.name,
                callback: cls.callback,
                className: cls.className,
                icon: cls.icon,
                disabled: cls.disabled,
                visible: cls.visible,
                type: cls.type,
                events: cls.events,
                value: cls.value,
                selected: cls.selected,
                radio: cls.radio,
                options: cls.options,
                height: cls.height,
                accesskey: cls.accesskey,
                items: {},
            };
            if (clsInst.children.length > 0) {
                for (let index = 0; index < clsInst.children.length; index++) {
                    const child = clsInst.children[index];
                    const tempItem = this.foreachBuildMenuItem(child);
                    const key = Object.keys(tempItem)[0];
                    nowMenuItem.items[key] = tempItem[key];
                }
            }
            const returnObj = {};
            returnObj[nowClsName] = nowMenuItem;
            return returnObj;
        }
        update() { }
    }
    exports.default = exFuncMgr;
});
