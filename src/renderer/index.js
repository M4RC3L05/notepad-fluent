import './../assets/css/styles.css'
import Container from './Container'
import Dispatcher from './Dispatcher'
import SideBarView from './Views/SideBarView'
import SideBarStore from './Stores/SideBarStore'
import EditorView from './Views/EditorView'
import EditorStore from './Stores/EditorStore'

const start = () => {
    const container = Container.getInstance()

    container
        .registerSingleton('Dispatcher', () => Dispatcher.create())
        .registerSingleton('SideBarStore', () => SideBarStore.create())
        .registerSingleton('EditorStore', () => EditorStore.create())

    SideBarView.create({
        dispatcher: container.get('Dispatcher'),
        sideBarStore: container.get('SideBarStore')
    })

    EditorView.create({
        dispatcher: container.get('Dispatcher'),
        editorStore: container.get('EditorStore')
    })
}
document.addEventListener('DOMContentLoaded', start)
