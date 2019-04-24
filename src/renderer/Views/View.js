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

    getStores() {
        throw Error(
            `static method getStores must be implemented in class ${
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
                [curr.constructor.name]: curr.getState()
            }),
            {}
        )
    }

    render() {
        throw Error(
            `static method getModels must be implemented in class ${this.name}.`
        )
    }
}

export default View
