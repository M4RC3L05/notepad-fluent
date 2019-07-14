class View {
    constructor(dispatcher) {
        this.getStores = this.getStores.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.getState = this.getState.bind(this)
        this.render = this.render.bind(this)

        this._dispatcher = dispatcher

        this._stores = this.getStores()
        this._stores.forEach(s => {
            s.subscribe(this)
        })
    }

    static create(...props) {
        throw Error('static method create must be implemented')
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

    onDestroy() {
        throw Error(`onDestroy method must be implemented.`)
    }

    render() {
        throw Error(`render method must be implemented.`)
    }
}

export default View
