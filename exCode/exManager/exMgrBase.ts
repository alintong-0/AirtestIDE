import Singleton from '../common/singleton'
//根update
const updateList: { [key: number]: Function } = {}
let updateIndex = 0
const updateDeltaTime = 1000
function update() {
    Object.keys(updateList).forEach((key) => {
        updateList[key]()
    })
}
setInterval(() => {
    update()
}, updateDeltaTime)

export default abstract class exMgrBase extends Singleton {
    constructor() {
        super()
        updateList[updateIndex++] = this.update.bind(this)
    }
    abstract update(): void
    public addUpdateObj(updateFunc: Function) {
        let index = updateIndex++
        updateList[index] = updateFunc.bind(this)
        return index
    }

    public removeUpdateObj(index: number) {
        delete updateList[index]
    }
}
