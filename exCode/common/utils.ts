export type ContextMenuTypes = {
    EDITOR: string[]
    LOG: string[]
}

export enum MenuItemType {
    text = 'text',
    textarea = 'textarea',
    checkbox = 'checkbox',
    radio = 'radio',
    select = 'select',
}

export type ContextMenuEventCallback = (key: string, options: any, event: MouseEvent) => void;

export type EventsType = {
    build?: (triggerElement: HTMLElement, e: MouseEvent) => void;
    show?: (element: HTMLElement, e: MouseEvent) => void;
    hide?: (element: HTMLElement, all: boolean) => void;
    visible?: (element: HTMLElement, visible: boolean) => void;
    itemClick?: ContextMenuEventCallback;
    itemHover?: ContextMenuEventCallback;
    itemMouseenter?: ContextMenuEventCallback;
    itemMouseleave?: ContextMenuEventCallback;
    keypress?: (element: HTMLElement, e: KeyboardEvent) => void;
    keydown?: (element: HTMLElement, e: KeyboardEvent) => void;
    keyup?: (element: HTMLElement, e: KeyboardEvent) => void;
    input?: (element: HTMLElement, e: KeyboardEvent) => void;
}

export type RootContextMenuItems = Dictionary<string,MenuItem>

export type MenuItem = {
    name: string // 菜单项显示的名称
    callback?: (itemKey: string, opt: any, originalEvent: MouseEvent) => boolean // 点击菜单项时触发的回调函数
    className?: string // 菜单项的类名
    icon?: string // 菜单项的图标
    disabled?: boolean // 是否禁用菜单项
    visible?: boolean // 是否可见
    type?: MenuItemType | null // 菜单项的输入类型
    events?: EventsType // 事件处理函数
    value?: string // 输入框的值
    selected?: boolean // 是否选中
    radio?: string // 单选按钮分组名称
    options?: Dictionary<string, string> // 下拉列表的选项
    height?: string // 输入框的高度
    accesskey?: string // 菜单项的快捷键
    items?: RootContextMenuItems // 子菜单项
}

export enum EditorMode {
    EDITOR = 'EDITOR',
    LOG = 'LOG',
}

export enum CodingRunningType {
    EnterCode = 0,
}

export const DEBUG_URL = 'ws://localhost:9321'

export type Dictionary<K extends number | string, V> = {
    [key in K]: V
}

export enum ErrorCode{
    E000001 = "父类未在注册表中,请检查exFunctionInit.ts中是否正确注册父类!",
    E000002 = "if you see this , means some error happen!",
}

export const exFuncBaseClassName = "exFuncBase"