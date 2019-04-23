import Store from './Store'
import { TOGGLE_SIDEBAR } from '../actions/types'

class SideBarStore extends Store {
    constructor() {
        super()
    }

    static create() {
        return new SideBarStore()
    }

    getInitialState() {
        return {
            isOpen: false
        }
    }

    getState() {
        return this._state
    }

    reduce(state, action) {
        switch (action.type) {
            case TOGGLE_SIDEBAR:
                return { ...state, isOpen: !state.isOpen }
            default:
                return state
        }
    }
}

export default SideBarStore.create()
