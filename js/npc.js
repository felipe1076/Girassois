// npc.js – Sistema de NPCs de Apoio Emocional de Girassóis
class NPC {
    /**
     * @param {object} config Configuração do NPC
     */
    constructor(config) {
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.name = config.name || "Pessoa Amiga";
        this.title = config.title || "Rede de Apoio";
        this.x = config.x;
        this.y = config.y;
        this.w = config.w || 46;
        this.h = config.h || 70;
        this.spriteKey = config.spriteKey || 'player_idle';
        this.messages = config.messages || ["Lembre-se: seus sentimentos importam.", "Você nunca precisa enfrentar tudo sozinho."];
        this.choices = config.choices || null;
        this.interacted = false;
        this.empathyReward = config.empathyReward || 15;
        this.hopeReward = config.hopeReward || 15;
        this.hasGivenReward = false;
    }

    render(ctx, cameraX, player) {
        const screenX = this.x - cameraX;
        if (screenX + this.w < -60 || screenX > ctx.canvas.width + 60) return;

        ctx.save();

        // 1. Desenhar sombra no chão
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(screenX + this.w / 2, this.y + this.h - 2, this.w * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Desenhar Sprite do NPC
        const sprite = typeof sprites !== 'undefined' ? sprites.get(this.spriteKey) : null;
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            // Desenha olhando para o lado do jogador se disponível
            const flip = player && (player.x > this.x);
            if (flip) {
                ctx.translate(screenX + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, 0, 0, this.w, this.h);
            } else {
                ctx.drawImage(sprite, screenX, this.y, this.w, this.h);
            }
        } else {
            ctx.fillStyle = '#ffb300';
            ctx.beginPath();
            ctx.roundRect(screenX, this.y, this.w, this.h, 8);
            ctx.fill();
        }

        ctx.restore();

        ctx.save();
        // 3. Nome do NPC
        ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe082';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.name, screenX + this.w / 2, this.y - 12);

        // 4. Indicador de Interação quando o jogador estiver próximo
        if (player && this.isNearPlayer(player)) {
            const bounce = Math.sin(Date.now() * 0.007) * 4;
            const bubbleY = this.y - 32 + bounce;

            // Balãozinho flutuante
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            const text = '💬 Pressione [E]';
            const textWidth = ctx.measureText(text).width;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(screenX + this.w / 2 - textWidth / 2 - 8, bubbleY - 14, textWidth + 16, 22, 6);
            ctx.fill();

            // Setinha do balão
            ctx.beginPath();
            ctx.moveTo(screenX + this.w / 2 - 4, bubbleY + 8);
            ctx.lineTo(screenX + this.w / 2 + 4, bubbleY + 8);
            ctx.lineTo(screenX + this.w / 2, bubbleY + 12);
            ctx.fill();

            // Texto do balão
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#333';
            ctx.fillText(text, screenX + this.w / 2, bubbleY + 2);
        }

        ctx.restore();
    }

    isNearPlayer(player) {
        if (!player) return false;
        const dx = Math.abs((this.x + this.w / 2) - (player.x + player.w / 2));
        const dy = Math.abs((this.y + this.h / 2) - (player.y + player.h / 2));
        return dx < 75 && dy < 90;
    }

    interact(game) {
        if (this.interacted) return;
        this.interacted = true;

        const prevState = game.state;
        game.state = 'DIALOGUE';
        game.player.vx = 0; // Para o movimento do jogador durante a conversa

        // Desbloqueia conquista da primeira conversa
        if (typeof achievements !== 'undefined') {
            achievements.unlock('voice_of_care');
        }

        if (typeof openNpcDialog === 'function') {
            openNpcDialog({
                name: this.name,
                title: this.title,
                messages: this.messages,
                choices: this.choices,
                onComplete: (choice) => {
                    this._onDialogueComplete(game, prevState, choice);
                }
            });
        } else if (typeof openDialog === 'function') {
            openDialog(this.messages, () => {
                this._onDialogueComplete(game, prevState, null);
            });
        } else {
            game.state = prevState;
            this.interacted = false;
        }
    }

    _onDialogueComplete(game, prevState, choice) {
        let empGain = this.empathyReward;
        let hopeGain = this.hopeReward;

        if (choice && choice.effect) {
            if (choice.effect.empathy) empGain += choice.effect.empathy;
            if (choice.effect.hope) hopeGain += choice.effect.hope;
        }

        if (!this.hasGivenReward) {
            this.hasGivenReward = true;
            if (typeof game.addEmpathy === 'function') game.addEmpathy(empGain);
            if (typeof game.addHope === 'function') game.addHope(hopeGain);

            if (typeof particles !== 'undefined') {
                particles.emitSunflowerBloom(this.x + this.w / 2, this.y + this.h);
                particles.emitHearts(this.x + this.w / 2, this.y - 10, 5);
                particles.emitText(this.x + this.w / 2, this.y - 25, `+${empGain} Empatia & +${hopeGain} Esperança!`, '#ffe082');
            }

            if (typeof audio !== 'undefined' && audio.playHeartGain) {
                try { audio.playHeartGain(); } catch (e) {}
            }

            if (game.showPhraseBanner) {
                game.showPhraseBanner(`Você e ${this.name} compartilharam carinho e escuta! 💛`);
            }
        }

        // Checa conquista de 50 de empatia
        if (game.empathy >= 50 && typeof achievements !== 'undefined') {
            achievements.unlock('empathy_50');
        }

        game.state = 'PLAYING';
        setTimeout(() => {
            this.interacted = false;
        }, 600);
    }
}

window.NPC = NPC;
