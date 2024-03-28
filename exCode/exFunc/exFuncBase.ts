import { EventsType, MenuItemType, Dictionary, RootContextMenuItems } from '../common/utils'
import exMsgMgr from '../exManager/exMsgMgr'
export default abstract class exFuncBase {
    constructor() {}
    /**
     * 菜单项显示的名称
     */
    abstract get name(): string

    /**
     * 点击菜单项时触发的回调函数
     */
    get callback(): (itemKey: string, opt: any, originalEvent: MouseEvent)=>boolean {
        return () => {
            console.log('This method is not implemented!', '此方法未实现!')
            return true
        }
    }

    /**
     * 菜单项的类名
     */
    get className(): string {
        return ''
    }

    /**
     * 菜单项的图标
     */
    get icon(): string {
        return ''
    }

    /**
     * 是否禁用菜单项
     */
    get disabled(): boolean {
        return false
    }

    /**
     * 是否可见
     */
    get visible(): boolean {
        return true
    }

    /**
     * 菜单项的输入类型
     */
    get type(): MenuItemType | null {
        return null
    }

    /**
     * 事件处理函数
     */
    get events(): EventsType {
        return {}
    }

    /**
     * 输入框的值
     */
    get value(): any {
        return ''
    }

    /**
     * 是否选中
     */
    get selected(): boolean {
        return false
    }

    /**
     * 单选按钮分组名称
     */
    get radio(): string {
        return 'defaultGroup'
    }

    /**
     * 下拉列表的选项
     */
    get options(): Dictionary<string, string> {
        return {}
    }

    /**
     * 输入框的高度
     */
    get height(): string {
        return ''
    }

    /**
     * 菜单项的快捷键
     */
    get accesskey(): string {
        return ''
    }

    /**
     * 嵌套菜单项
     */
    get items(): RootContextMenuItems | null {
        return null
    }

    protected sendMsg(msg:string){
        console.warn("sendMsg:",msg)
        exMsgMgr.getInstance().sendMessage(msg)
    }

    /**
     * 回调方法模板，使用后自己改方法名以及注释
     * @param itemKey 点击的菜单项的键值
     * @param opt 有关菜单项和上下文的选项对象
     * @param originalEvent 触发菜单项的原始事件对象
     * @returns 触发事件后是否关闭菜单
     */
    protected cbDefaultFunction(itemKey: string, opt: any, originalEvent: MouseEvent):boolean{
        return false
    }
    
    /**
     * 回调方法模板，使用后自己改方法名以及注释
     * @param itemKey 点击的菜单项的键值
     * @param opt 有关菜单项和上下文的选项对象
     * @param originalEvent 触发菜单项的原始事件对象
     * @returns 触发事件后是否关闭菜单
     */
     protected eventsDefaultFunction(element: HTMLElement, e: KeyboardEvent):void{
    }
}
