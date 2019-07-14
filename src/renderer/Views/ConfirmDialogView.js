import View from './View'

class ConfirmDialogView extends View {
    constructor(dispatcher, confirmMessage, onConfirm, onCancel) {
        super(dispatcher)

        this.setUpUI = this.setUpUI.bind(this)
        this.setUpListeners = this.setUpListeners.bind(this)
        this.onConfirm = onConfirm
        this.onCancel = onCancel
        this.confirmMessage = confirmMessage

        this.setUpUI()
        this.setUpListeners()

        this.render()
    }

    getStores() {
        return []
    }

    static create(...props) {
        return new ConfirmDialogView(...props)
    }

    setUpUI() {
        const template = document.createElement('template')
        template.innerHTML = `<div class="confirm-dialog">
        <div class="confirm-dialog__wrapper">
            <h2 class="confirm-dialog__message">
                ${this.confirmMessage}
            </h2>
            <div class="confirm-dialog__controls">
                <button class="btn" id="confirmDialog@@btn-confirm">Sim</button>
                <button class="btn" id="confirmDialog@@btn-cancel">Cancelar</button>
            </div>
        </div>
    </div>`.trim()
        this.confirmDialog = template.content.firstChild
        document.body.prepend(this.confirmDialog)
        setTimeout(() => this.confirmDialog.classList.add('animate'), 0)
        this.confirmBtn = document.getElementById('confirmDialog@@btn-confirm')
        this.cancelBtn = document.getElementById('confirmDialog@@btn-cancel')
    }

    setUpListeners() {
        this.confirmBtn.addEventListener('click', this.onConfirm)
        this.cancelBtn.addEventListener('click', this.onCancel)
    }

    onDestroy() {
        this.confirmDialog.removeChild(
            document.querySelector('.confirm-dialog__wrapper')
        )
        this.confirmBtn.removeEventListener('click', this.onConfirm)
        this.cancelBtn.removeEventListener('click', this.onCancel)
        this.confirmDialog.classList.remove('animate')
        setTimeout(() => {
            document.body.removeChild(this.confirmDialog)
        }, 300)
    }

    render() {}
}

export default ConfirmDialogView
