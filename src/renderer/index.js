import './../assets/css/styles.css'
import Dispatcher from './Dispatcher'
import SideBarView from './Views/SideBarView'
import EditorView from './Views/EditorView'
import TitleBarView from './Views/TitleBarView'

const start = () => {
    // const container = Container.getInstance()

    // container
    //     .registerSingleton('Dispatcher', () => Dispatcher.create())
    //     .registerSingleton('SideBarStore', () => SideBarStore.create())
    //     .registerSingleton('EditorStore', () => EditorStore.create())
    //     .registerSingleton('TitleBarStore', () => TitleBarStore.create())

    // TitleBarView.create({
    //     dispatcher: container.get('Dispatcher'),
    //     titleBarStore: container.get('TitleBarStore'),
    //     sideBarStore: container.get('SideBarStore')
    // })

    SideBarView.create(Dispatcher)
    EditorView.create(Dispatcher)
    TitleBarView.create(Dispatcher)
}
document.addEventListener('DOMContentLoaded', start)
