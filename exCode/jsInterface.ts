///<reference path="./libs/require.js" />
// 配置 RequireJS
requirejs.config({
    baseUrl: 'js',
})
import exFuncMgr from './exManager/exFuncMgr'
import exMsgMgr from './exManager/exMsgMgr'
let global
;(function initJsFunc() {
    ;(window as any).exFuncMgr = exFuncMgr.getInstance()
    ;(window as any).exMsgMgr = exMsgMgr.getInstance()
    exFuncMgr.getInstance().init((window as any).contextMenuTypes, (window as any).contextMenuItems)
    exMsgMgr.getInstance().init()
    global = window
    const callback = () => {
        return
        console.log((window as any).windowMode, (window as any).exMsgMgr, window)
        ;(window as any).exMsgMgr.start((window as any).windowMode)
    }
    window.document.addEventListener('windowModeInit', callback)
    var script = document.createElement('script')
    script.src = 'js/editor.js'
    document.body.appendChild(script)
    script = document.createElement('script')
    script.src = 'js/init_editor_channel.js'
    document.body.appendChild(script)
})()
