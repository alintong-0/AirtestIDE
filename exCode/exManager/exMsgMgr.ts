import { DEBUG_URL, Dictionary, EditorMode } from '../common/utils'
import exMgrBase from './exMgrBase'

type webSocketItem = {
    ws: WebSocket
    url: string
    time: number
    isRetry: boolean
}

export default class exMsgMgr extends exMgrBase {
    public waitForSocketReady = false
    private readonly webSocketList: Dictionary<number, webSocketItem> = {}
    private webSocketIndex = 0
    private retryList: number[] = []
    public init() {}

    public start(editorMode: EditorMode) {
        switch (editorMode) {
            case EditorMode.EDITOR:
                this.getNewWebSocket(DEBUG_URL, undefined, true)
                break
            case EditorMode.LOG:
                break
            default:
                console.error('UNKNOW EditorMode!!', editorMode)
                break
        }
    }

    private getNewWebSocket(url: string, id?: number, isRetry = false): number {
        // 创建 WebSocket 连接
        let ws = new WebSocket(url)
        const index = id ? id : this.webSocketIndex++
        this.webSocketList[index] = {
            ws: ws,
            url: url,
            time: Date.now(),
            isRetry: isRetry,
        }
        const self = this
        // 监听连接打开事件
        ws.addEventListener('open', function (event) {
            exMsgMgr.getInstance().waitForSocketReady = true
            exMsgMgr.getInstance().onOpen.bind(self)
            exMsgMgr.getInstance().onOpen(index, event)
        })

        // 监听消息接收事件
        ws.addEventListener('message', function (event) {
            exMsgMgr.getInstance().onMessage.bind(self)
            exMsgMgr.getInstance().onMessage(index, event)
        })

        // 监听连接关闭事件
        ws.addEventListener('close', function (event) {
            exMsgMgr.getInstance().onClose.bind(self)
            exMsgMgr.getInstance().onClose(index, event)
        })
        return index
    }

    public onOpen(id: number, event: Event) {}

    public onMessage(id: number, event: MessageEvent<any>) {}

    public onClose(id: number, event: CloseEvent) {
        if (this.webSocketList[id].isRetry) {
            console.log('WebSocket 连接已关闭，进入重试队列...', id, event)
            exMsgMgr.getInstance().retryList.push(id)
        } else {
            console.log('WebSocket 连接已关闭', id, event)
            delete this.webSocketList[id]
        }
    }

    public sendMessage() {}
    update(): void {
        if (this.retryList.length > 0) {
            this.retryList.forEach((index) => {
                console.log('WebSocket 重试连接,id=', index)
                this.getNewWebSocket(this.webSocketList[index].url, index, this.webSocketList[index].isRetry)
            })
            this.retryList.length = 0
        }
    }
}
