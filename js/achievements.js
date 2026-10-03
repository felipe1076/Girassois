/**
 * achievements.js – Sistema de Conquistas (Achievements) de Girassóis
 * Setembro Amarelo: Jornada da Empatia
 */
class AchievementManager {
    constructor() {
        this.achievements = {
            'first_step': {
                id: 'first_step',
                title: 'Primeiro Passo 🌻',
                desc: 'Iniciou a caminhada ao lado do seu coelhinho companheiro.',
                icon: '🌱'
            },
            'bunny_friend': {
                id: 'bunny_friend',
                title: 'Sintonia Afetiva 🐰',
                desc: 'Pediu para seu fiel coelho esperar ou te seguir.',
                icon: '🐇'
            },
            'inner_light': {
                id: 'inner_light',
                title: 'Luz Interior ✨',
                desc: 'Liberou uma Onda de Luz para iluminar sentimentos difíceis.',
                icon: '☀️'
            },
            'phase1_clear': {
                id: 'phase1_clear',
                title: 'Solidão Acolhida 🍃',
                desc: 'Superou a Fase 1 e compreendeu que nunca está só.',
                icon: '🌻'
            },
            'empathy_50': {
                id: 'empathy_50',
                title: 'Farol de Empatia 🌟',
                desc: 'Alcançou 50 pontos de Empatia espalhando afeto.',
                icon: '✨'
            },
            'puzzle_master': {
                id: 'puzzle_master',
                title: 'Mentes Conectadas 🧩',
                desc: 'Coordenou com seu coelho nas placas de pressão do Santuário.',
                icon: '🔑'
            },
            'flame_lit': {
                id: 'flame_lit',
                title: 'Chama da Esperança 🔥',
                desc: 'Acendeu um Altar da Vida na Fase Final.',
                icon: '🔥'
            },
            'victory': {
                id: 'victory',
                title: 'A Vida Sempre Vale a Pena 🏆',
                desc: 'Completou toda a jornada do Setembro Amarelo.',
                icon: '🌻'
            }
        };

        this.unlocked = this.loadUnlocked();
        this.ensureContainer();
    }

    loadUnlocked() {
        try {
            const saved = localStorage.getItem('girassois_achievements');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveUnlocked() {
        try {
            localStorage.setItem('girassois_achievements', JSON.stringify(this.unlocked));
        } catch (e) {
            console.warn('Não foi possível salvar conquistas:', e);
        }
    }

    isUnlocked(id) {
        return !!this.unlocked[id];
    }

    getUnlockedCount() {
        return Object.keys(this.unlocked).length;
    }

    getTotalCount() {
        return Object.keys(this.achievements).length;
    }

    ensureContainer() {
        if (!document.getElementById('achievement-toast-container')) {
            const container = document.createElement('div');
            container.id = 'achievement-toast-container';
            container.className = 'achievement-toast-container';
            document.body.appendChild(container);
        }
    }

    unlock(id) {
        const ach = this.achievements[id];
        if (!ach) return false;
        if (this.unlocked[id]) return false; // Já desbloqueada

        this.unlocked[id] = {
            unlockedAt: Date.now()
        };
        this.saveUnlocked();

        this.showToast(ach);

        if (typeof audio !== 'undefined' && audio.playHeartGain) {
            try { audio.playHeartGain(); } catch (e) {}
        }

        return true;
    }

    showToast(ach) {
        this.ensureContainer();
        const container = document.getElementById('achievement-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
                <span class="achievement-badge-tag">NOVA CONQUISTA DESBLOQUEADA!</span>
                <strong class="achievement-title">${ach.title}</strong>
                <span class="achievement-desc">${ach.desc}</span>
            </div>
        `;

        container.appendChild(toast);

        // Animação de entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 30);

        // Animação de saída
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 4200);
    }
}

window.achievements = new AchievementManager();
