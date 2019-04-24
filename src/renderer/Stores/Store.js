import Dispatcher from '../Dispatcher'

class Store {
    constructor() {
        this.views = []
        this._state = this.getInitialState()
        Dispatcher.subscribe(this)
    }

    getInitialState() {
        return {}
    }

    getState() {
        return this._state
    }

    subscribe(view) {
        if (this.views.find(v => v === view)) return
        this.views.push(view)

        return () => (this.views = this.views.filter(s => s !== view))
    }

    reduce(state, action) {
        throw Error(
            `The method reduce must be implemented on ${this.constructor.name}`
        )
    }

    _notify() {
        this.views.forEach(v => v.render())
    }

    _onDispatch(action) {
        const newState = this.reduce(this._state, action)
        if (newState === this._state) return

        this._state = newState

        this._notify()
    }
}

export default Store
