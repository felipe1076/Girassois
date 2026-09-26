// dialog.js – Sistema de Diálogo Acolhedor e Escolhas Empáticas
function ensureDialogModal() {
    let modal = document.getElementById('modal-dialog');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-dialog';
        modal.className = 'modal-screen dialog-modal-screen hidden';
        document.body.appendChild(modal);
    }
    return modal;
}

/**
 * Abre diálogo estilizado de NPC com suporte a múltiplas frases e escolhas.
 * @param {object} options
 * @param {string} options.name Nome do personagem
 * @param {string} options.title Cargo/Papel (ex: Rede de Apoio)
 * @param {string[]} options.messages Frases do diálogo
 * @param {Array<{text:string, effect?:{empathy?:number, hope?:number}}>} [options.choices]
 * @param {function} options.onComplete Callback ao finalizar
 */
function openNpcDialog(options) {
    const modal = ensureDialogModal();
    const messages = options.messages || ["Olá, que bom te encontrar!"];
    let currentMsgIndex = 0;

    const renderCurrentState = () => {
        const isLastMessage = currentMsgIndex >= messages.length - 1;
        const hasChoices = isLastMessage && options.choices && options.choices.length > 0;

        let html = `
            <div class="dialog-box-container">
                <div class="dialog-header">
                    <div class="dialog-avatar">🌻</div>
                    <div class="dialog-author">
                        <span class="dialog-name">${options.name || 'Pessoa Amiga'}</span>
                        <span class="dialog-title">${options.title || 'Rede de Afeto'}</span>
                    </div>
                </div>
                <div class="dialog-body">
                    <p class="dialog-text">${messages[currentMsgIndex]}</p>
                </div>
        `;

        if (hasChoices) {
            html += `<div class="dialog-choices-container">`;
            options.choices.forEach((c, idx) => {
                html += `<button class="btn-dialog-choice" data-choice-idx="${idx}">${c.text}</button>`;
            });
            html += `</div>`;
        } else {
            const btnText = isLastMessage ? "Acolher com Carinho 💛" : "Continuar Ouvindo 💬";
            html += `
                <div class="dialog-footer">
                    <button id="btn-dialog-advance" class="btn-primary">${btnText}</button>
                </div>
            `;
        }

        html += `</div>`;
        modal.innerHTML = html;
        modal.classList.remove('hidden');

        if (hasChoices) {
            modal.querySelectorAll('.btn-dialog-choice').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-choice-idx'), 10);
                    const selectedChoice = options.choices[idx];
                    modal.classList.add('hidden');
                    if (options.onComplete) options.onComplete(selectedChoice);
                });
            });
        } else {
            const advanceBtn = document.getElementById('btn-dialog-advance');
            if (advanceBtn) {
                advanceBtn.addEventListener('click', () => {
                    if (isLastMessage) {
                        modal.classList.add('hidden');
                        if (options.onComplete) options.onComplete(null);
                    } else {
                        currentMsgIndex++;
                        renderCurrentState();
                    }
                });
            }
        }
    };

    renderCurrentState();
}

/**
 * Função de retrocompatibilidade
 */
function openDialog(lines, onClose) {
    openNpcDialog({
        name: "Conversa de Apoio",
        title: "Setembro Amarelo",
        messages: lines,
        onComplete: () => {
            if (typeof onClose === 'function') onClose();
        }
    });
}

window.ensureDialogModal = ensureDialogModal;
window.openNpcDialog = openNpcDialog;
window.openDialog = openDialog;
