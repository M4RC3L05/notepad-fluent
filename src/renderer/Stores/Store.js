import Dispatcher from '../Dispatcher'

class Store {
    constructor() {
        this.views = []
        this._state = this.getInitialState()
        Dispatcher.subscribe(this)
    }

    static getClassName() {
        throw Error('getClassName must be implemented in child,')
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
        throw Error(`The method reduce must be implemented`)
    }

    _notify(prevState, newState) {
        this.views.forEach(v => {
            if (
                v.shouldComponentUpdate &&
                typeof v.shouldComponentUpdate === 'function'
            ) {
                if (v.shouldComponentUpdate(prevState, newState)) v.render()
            } else v.render()
        })
    }

    _onDispatch(action) {
        const newState = this.reduce(this._state, action)
        const prevState = this._state
        if (newState === this._state) return

        this._state = newState

        this._notify(prevState, newState)
    }
}

export default Store
