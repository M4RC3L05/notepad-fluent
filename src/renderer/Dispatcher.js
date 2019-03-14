class Dispatcher {
    constructor() {
        this.stores = []
        this.subscribe = this.subscribe.bind(this)
        this.dispatch = this.dispatch.bind(this)
    }

    static create() {
        return new Dispatcher()
    }

    subscribe(store) {
        if (this.stores.find(s => s === store)) return

        this.stores.push(store)

        return () => (this.stores = this.stores.filter(s => s !== store))
    }

    dispatch(action) {
        if (typeof action === 'function') return action(this.dispatch)

        this.stores.forEach(s => s._onDispatch(action))
    }
}

export default Dispatcher
