import './../assets/css/styles.css'
import Dispatcher from './Dispatcher'
import SideBarView from './Views/SideBarView'
import EditorView from './Views/EditorView'
import TitleBarView from './Views/TitleBarView'
import BottomStatusBarView from './Views/BottomStatusBarView'
import TabsView from './Views/TabsView'

const start = () => {
    console.log('Starting...')
    const then = performance.now()
    TitleBarView.create({ dispatcher: Dispatcher })
    SideBarView.create({ dispatcher: Dispatcher })
    TabsView.create({ dispatcher: Dispatcher })
    EditorView.create({ dispatcher: Dispatcher })
    BottomStatusBarView.create({ dispatcher: Dispatcher })
    console.log('Start take: ', performance.now() - then)
}
document.addEventListener('DOMContentLoaded', start)
