/*
 * @Description: 
 * @Author: alintong
 * @Date: 2025-02-18 17:20:07
 * @LastEditors: alintong
 */

enum CodingRunningType {
    EnterCode = 0
}

export default class codeHandler {
    private _id: number//socket ID
    constructor(id: number) {
        this._id = id
    }
    public onMessage(event: MessageEvent<any>) {
        let msgData = event.data;
        console.log('接收到服务器消息：', msgData);
        if (msgData.startsWith("{")) {
            msgData = JSON.parse(msgData)
        }
        if (msgData.type != undefined) {
            switch (msgData.type) {
                case CodingRunningType.EnterCode:
                    if ((window as any).exMsgMgr && (window as any).exMsgMgr.isRecording) {
                        ; (window as any).editorInstance.addText(msgData.codeStr)
                    }
                    break;

                default:
                    break;
            }
        }
    }
}