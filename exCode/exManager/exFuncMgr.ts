import {
    MenuItem,
    ContextMenuTypes,
    Dictionary,
    ErrorCode,
    exFuncBaseClassName,
    RootContextMenuItems,
} from '../common/utils'
import exFuncBase from '../exFunc/exFuncBase'
import exFunctionInit from '../exFunc/exFunctionInit'
import exMgrBase from './exMgrBase'

type FunctionItem = {
    parent: string
    children: FunctionItem[]
    inst: exFuncBase
}

export default class exFuncMgr extends exMgrBase {
    public displayList = []
    public contextMenuTypes: ContextMenuTypes = {
        EDITOR: [ErrorCode.E000002],
        LOG: [ErrorCode.E000002],
    }
    public contextMenuItems: RootContextMenuItems = { default: { name: ErrorCode.E000002 ,items : {}} }

    public init(contextMenuTypes: ContextMenuTypes, contextMenuItems: RootContextMenuItems) {
        this.contextMenuTypes = contextMenuTypes
        this.contextMenuItems = contextMenuItems
        this.initAllMenuItem()
    }

    private initAllMenuItem() {
        const functionStructure: Dictionary<string, FunctionItem> = {}
        const initCls = new exFunctionInit()
        initCls.allFuncInst.forEach((clsInst) => {
            const className = clsInst.constructor.name
            console.log(className)
            functionStructure[className] = {
                parent: (clsInst as any).__proto__.__proto__.constructor.name,
                children: [],
                inst: clsInst,
            }
        })
        const rootClassNames: string[] = []
        Object.keys(functionStructure).forEach((className) => {
            const nowCls = functionStructure[className]
            const parentClsName = nowCls.parent
            if (parentClsName != exFuncBaseClassName) {
                if (parentClsName in functionStructure) {
                    const parentItem = functionStructure[parentClsName]
                    parentItem.children.push(nowCls)
                } else {
                    console.error(ErrorCode.E000001)
                }
            } else {
                rootClassNames.push(className)
            }
        })
        ;(window as any).functionStructure = functionStructure
        console.log(functionStructure)
        for (let index = 0; index < rootClassNames.length; index++) {
            const clsInst = functionStructure[rootClassNames[index]]
            const tempItem = this.foreachBuildMenuItem(clsInst)
            console.log(tempItem)
            //这里只会有一个
            const key = Object.keys(tempItem)[0]
            this.contextMenuItems[key] = tempItem[key]
            this.contextMenuTypes.EDITOR.push(key)
        }
        
    }

    private foreachBuildMenuItem(clsInst: FunctionItem): RootContextMenuItems {
        const cls = clsInst.inst
        const nowClsName = cls.constructor.name
        const nowMenuItem: MenuItem = {
            name: cls.name,
            callback: cls.callback,
            className: cls.className,
            icon: cls.icon,
            disabled: cls.disabled,
            visible: cls.visible,
            type: cls.type,
            events: cls.events,
            value: cls.value,
            selected: cls.selected,
            radio: cls.radio,
            options: cls.options,
            height: cls.height,
            accesskey: cls.accesskey,
            items: {},
        }
        if(clsInst.children.length>0){
            for (let index = 0; index < clsInst.children.length; index++) {
                const child = clsInst.children[index];
                const tempItem = this.foreachBuildMenuItem(child)
                const key = Object.keys(tempItem)[0]
                nowMenuItem.items[key] = tempItem[key]
            }
        }
        const returnObj:RootContextMenuItems = {}
        returnObj[nowClsName] = nowMenuItem
        return returnObj
    }

    public update(): void {}
}
