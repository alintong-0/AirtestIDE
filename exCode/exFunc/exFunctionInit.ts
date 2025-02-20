/*
 * @Description: 
 * @Author: alintong
 * @Date: 2024-03-27 16:39:27
 * @LastEditors: alintong
 */
import exFuncBase from './exFuncBase'
import exMsgFuncBase from './exFuncMsg/exMsgFuncBase'
import MsgSendGM from './exFuncMsg/msg_send_gm'
import exFuncProcessBase from './exFuncProcess/exFuncProcessBase'
import ProcessIfFunc from './exFuncProcess/process_if_func'
import exStartRecord from './exFuncRecord/exStartRecord'
import exStopRecord from './exFuncRecord/exStopRecord'
import exFuncUIBase from './exFuncUI/exFuncUIBase'
import UISetPopWindow from './exFuncUI/ui_set_pop_window'

export default class exFunctionInit {
    private static readonly allFunc = {
        //开关录制
        exStartRecord: exStartRecord,//开始录制
        exStopRecord: exStopRecord,//停止录制
        //消息方法
        exMsgFuncBase: exMsgFuncBase, //消息方法二级菜单根节点
        MsgSendGM: MsgSendGM,//发送GM消息

        //流程控制方法
        exFuncProcessBase: exFuncProcessBase, //流程控制方法二级菜单根节点
        ProcessIfFunc: ProcessIfFunc,//条件判断

        //UI方法
        exFuncUIBase: exFuncUIBase, //UI方法二级菜单根节点
        UISetPopWindow: UISetPopWindow, //屏蔽顶层UI弹窗
    }
    public readonly allFuncInst: exFuncBase[] = []
    constructor() {
        Object.keys(exFunctionInit.allFunc).forEach((key) => {
            const cls = new exFunctionInit.allFunc[key]() as exFuncBase
            this.allFuncInst.push(cls)
        })
    }
}
