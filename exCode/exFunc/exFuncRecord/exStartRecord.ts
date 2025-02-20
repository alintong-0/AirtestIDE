/*
 * @Description: 
 * @Author: alintong
 * @Date: 2025-02-20 16:32:35
 * @LastEditors: alintong
 */
import exMsgMgr from '../../exManager/exMsgMgr'
import exFuncBase from '../exFuncBase'
export default class exStartRecord extends exFuncBase {
    get name(): string {
        return '开始录制'
    }
    override get callback(): (itemKey: string, opt: any, originalEvent: MouseEvent) => boolean {
        return () => {
            exMsgMgr.getInstance().isRecording = true
            console.log('Start Record!', '开始录制!')
            return true
        }
    }

    override get disabled(): boolean {
        return false //exMsgMgr.getInstance().isRecording //TODO 刷新不好做,要走通信
    }
}
