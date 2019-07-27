import Dispatcher from '../Dispatcher'

class View {
    constructor(props) {
        this.getStores = this.getStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.getState = this.getState.bind(this)
        this.render = this.render.bind(this)
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this)

        this._dispatcher = Dispatcher
        this._props = props || {}

        this._stores = this.getStores()
        this._stores.forEach(s => {
            s.subscribe(this)
        })
    }

    static create(...props) {
        throw Error('static method create must be implemented')
    }

    get props() {
        return this._props
    }

    getStores() {
        throw Error(
            `method getStores must be implemented in class ${
                this.constructor.name
            }.`
        )
    }

    dispatch(action) {
        this._dispatcher.dispatch(action)
    }

    getState() {
        return this._stores.reduce(
            (acc, curr) => ({
                ...acc,
                [curr.constructor.getClassName()]: curr.getState()
            }),
            {}
        )
    }

    shouldComponentUpdate(prevState, nextState) {
        return true
    }

    onDestroy() {
        throw Error(`onDestroy method must be implemented.`)
    }

    render() {
        throw Error(`render method must be implemented.`)
    }
}

export default View
