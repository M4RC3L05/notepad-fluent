import Store from './Store'

class EditorStore extends Store {
    constructor() {
        super()
    }

    static create() {
        return new EditorStore()
    }

    getInitialState() {
        return {
            isPerformingAction: false,
            actionMessage: ''
        }
    }

    getState() {
        return this._state
    }

    reduce(state, action) {
        switch (action.type) {
            default:
                return state
        }
    }
}

export default EditorStore
