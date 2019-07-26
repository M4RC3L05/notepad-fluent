class Dispatcher {
    constructor() {
        this._stores = []
        this.subscribe = this.subscribe.bind(this)
        this.dispatch = this.dispatch.bind(this)
    }

    static create() {
        return new Dispatcher()
    }

    subscribe(store) {
        if (this._stores.find(s => s === store)) return

        this._stores.push(store)

        return () => (this._stores = this._stores.filter(s => s !== store))
    }

    dispatch(action) {
        // console.log('action, ', action)
        if (typeof action === 'function') return action(this.dispatch)

        this._stores.forEach(s => s._onDispatch(action))
    }
}

export default new Dispatcher()
