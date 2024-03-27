export default class Singleton {
    protected _instance: any
    protected constructor() {}

    public static getInstance<T extends Singleton>(this: new () => T): T {
        if (!(<any>this)._instance) {
            ;(<any>this)._instance = new this()
        }
        return (<any>this)._instance
    }
}
