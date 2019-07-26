import './../assets/css/styles.css'
import Dispatcher from './Dispatcher'
import SideBarView from './Views/SideBarView'
import EditorView from './Views/EditorView'
import TitleBarView from './Views/TitleBarView'
import BottomStatusBar from './Views/BottomStatusBar'

const start = () => {
    require('./config-loader')
    const then = performance.now()
    console.log('start creating')
    SideBarView.create(Dispatcher)
    EditorView.create(Dispatcher)
    TitleBarView.create(Dispatcher)
    BottomStatusBar.create(Dispatcher)
    console.log('end creating', performance.now() - then)
}
document.addEventListener('DOMContentLoaded', start)
