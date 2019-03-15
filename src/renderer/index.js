import './../assets/css/styles.css'
import Dispatcher from './Dispatcher'
import SideBarView from './Views/SideBarView'
import SideBarStore from './Stores/SideBarStore'
import EditorView from './Views/EditorView'
import EditorStore from './Stores/EditorStore'
import Container from '../common/Container'
import TitleBarStore from './Stores/TitleBarStore'
import TitleBarView from './Views/TitleBarView'

const start = () => {
    const container = Container.getInstance()

    container
        .registerSingleton('Dispatcher', () => Dispatcher.create())
        .registerSingleton('SideBarStore', () => SideBarStore.create())
        .registerSingleton('EditorStore', () => EditorStore.create())
        .registerSingleton('TitleBarStore', () => TitleBarStore.create())

    SideBarView.create({
        dispatcher: container.get('Dispatcher'),
        sideBarStore: container.get('SideBarStore'),
        editorStore: container.get('EditorStore')
    })

    EditorView.create({
        dispatcher: container.get('Dispatcher'),
        editorStore: container.get('EditorStore')
    })

    TitleBarView.create({
        dispatcher: container.get('Dispatcher'),
        titleBarStore: container.get('TitleBarStore'),
        sideBarStore: container.get('SideBarStore')
    })
}
document.addEventListener('DOMContentLoaded', start)
