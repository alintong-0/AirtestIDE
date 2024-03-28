define(["require", "exports", "./exManager/exFuncMgr", "./exManager/exMsgMgr"], function (require, exports, exFuncMgr_1, exMsgMgr_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    requirejs.config({
        baseUrl: 'js',
    });
    let global;
    (function initJsFunc() {
        ;
        window.exFuncMgr = exFuncMgr_1.default.getInstance();
        window.exMsgMgr = exMsgMgr_1.default.getInstance();
        exFuncMgr_1.default.getInstance().init(window.contextMenuTypes, window.contextMenuItems);
        exMsgMgr_1.default.getInstance().init();
        global = window;
        const callback = () => {
            return;
            console.log(window.windowMode, window.exMsgMgr, window);
            window.exMsgMgr.start(window.windowMode);
        };
        window.document.addEventListener('windowModeInit', callback);
        var script = document.createElement('script');
        script.src = 'js/editor.js';
        document.body.appendChild(script);
        script = document.createElement('script');
        script.src = 'js/init_editor_channel.js';
        document.body.appendChild(script);
    })();
});
