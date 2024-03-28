import { MenuItemType, RootContextMenuItems } from '../../common/utils'
import exMsgFuncBase from './exMsgFuncBase'
export default class MsgSendGM extends exMsgFuncBase {
    private gmInputText: string = ''
    get name(): string {
        return '发送GM消息'
    }
    get items(): RootContextMenuItems | null {
        const children: RootContextMenuItems = {}
        children['GMInput'] = {
            name: '输入gm指令',
            type: MenuItemType.text,
            height: '20',
            events:{
                input:this.inputFunc.bind(this)
            }
        }
        children['SendBtn'] = {
            name: '发送指令',
            callback: this.sendBtn.bind(this),
        }
        return children
    }

    protected inputFunc(element: HTMLElement, e: KeyboardEvent): void {
        this.gmInputText = (element as any)?.target?.value
        console.log(element,this.gmInputText)
    }

    protected sendBtn(itemKey: string, opt: any, originalEvent: MouseEvent): boolean {
        console.log("sendBtn",itemKey,opt,originalEvent)
        this.sendMsg(this.gmInputText)
        return false
    }
}
