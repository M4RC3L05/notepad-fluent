import Store from './Store'
import uuid from '../utils/uuid'

class TabsStore extends Store {
    constructor() {
        super()
    }

    static getClassName() {
        return 'TabsStore'
    }

    static create() {
        return new TabsStore()
    }

    getInitialState() {
        return {
            tabs: [new Tab('aaa', '/a/a/aaa', uuid(), false, false)]
        }
    }

    reduce(state, action) {
        switch (action.type) {
            default:
                return state
        }
    }
}

export class Tab {
    constructor(displayName, fullName, id, isActive, isDirty) {
        this.displayName = displayName
        this.fullName = fullName
        this.id = id
        this.isActive = isActive
        this.isDirty = isDirty
    }
}

export default TabsStore.create()
