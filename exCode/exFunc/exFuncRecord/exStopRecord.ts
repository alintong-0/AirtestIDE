import exMsgMgr from '../../exManager/exMsgMgr'
import exFuncBase from '../exFuncBase'
export default class exStopRecord extends exFuncBase {
    get name(): string {
        return '停止录制'
    }
    override get callback(): (itemKey: string, opt: any, originalEvent: MouseEvent) => boolean {
        return () => {
            exMsgMgr.getInstance().isRecording = false
            console.log('Stop Record!', '停止录制!')
            return true
        }
    }

    override get disabled(): boolean {
        return false //!exMsgMgr.getInstance().isRecording //TODO 刷新不好做,要走通信
    }
}
