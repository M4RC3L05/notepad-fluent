class Container {
    static instance

    constructor() {
        this.instances = {}

        this.registerSingleton = this.registerSingleton.bind(this)
        this.register = this.register.bind(this)
        this.get = this.get.bind(this)
    }

    static getInstance() {
        if (Container.instance) return Container.instance

        Container.instance = new Container()

        return Container.instance
    }

    registerSingleton(cls, action) {
        if (typeof action !== 'function')
            throw Error('Action must be a function.')

        this.instances[cls] = action()
        return this
    }

    register(cls, action) {
        if (typeof action !== 'function')
            throw Error('Action must be a function.')

        this.instances[cls] = action
        return this
    }

    get(cls) {
        const action = this.instances[cls]

        if (!action) return null

        if (typeof action === 'function') return action()

        return action
    }
}

export default Container
