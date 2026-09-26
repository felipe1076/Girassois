const BOSS_IDLE_SPEED = 0.0018;
const BOSS_IDLE_BOB = 4;
const BOSS_IDLE_TILT = 0.025;
const BOSS_FLAME_SCALE = 0.04;

/**
 * Game - Loop principal, física, colisões, estados e HUD do jogo Setembro Amarelo
 * Suporta 6 Fases com Puzzles Cooperativos (Coelho no botão) e Plataformas de Luz Reveláveis.
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Dimensões virtuais
        this.canvas.width = 960;
        this.canvas.height = 540;

        // Estado do Jogo
        this.state = 'START'; // 'START', 'PLAYING', 'LEVEL_COMPLETE', 'GAME_OVER', 'VICTORY'
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.score = 0;
        this.cameraX = 0;
        this.hope = 20;
        // Persistent variables
        this.empathy = Number(localStorage.getItem('empathy')) || 0;
        this.fragmentsCollected = 0;
        this.choiceLog = [];
        this.npcs = [];

        // Habilidade Onda de Luz
        this.waveCooldown = 0;
        this.maxWaveCooldown = 2.2;
        this.phase1LightPulse = 0;
        this.phase1DarkTimer = 0;

        // Puzzles
        this.keysCollected = 0;
        this.shrinesLit = 0;
        this.pressurePlates = [];
        this.barriers = [];
        this.shrines = [];

        this.isRunner = false;
        this.runnerScore = 0;
        this.runnerScoreTimer = 0;
        this.runnerTargetScore = 1000;
        this.runnerBaseSpeed = 2.8;
        this.runnerMidSpeed = 4.1;
        this.runnerMaxSpeed = 6.2;
        this.runnerSpeed = 2.8;
        this.runnerObstacles = [];
        this.runnerSpawnTimer = 3;
        this.runnerGroundOffset = 0;
        this.runnerBgOffset = 0;
        this.lastMilestoneBeep = 0;

        this.isSurf = false;
        this.surfScore = 0;
        this.surfScoreTimer = 0;
        this.surfTargetScore = 1000;
        this.surfBaseSpeed = 4.5;
        this.surfMaxSpeed = 8.2;
        this.surfSpeed = 4.5;
        this.surfSpawnTimer = 1;
        this.surfObstacles = [];
        this.surfPlayerX = 480;
        this.surfPlayerVelocity = 0;
        this.surfWaveOffset = 0;

        // Jogador (Velocidade e física calibradas)
        this.player = {
            x: 80,
            y: 380,
            w: 46,
            h: 70,
            vx: 0,
            vy: 0,
            speed: 2.8,
            jumpForce: -11.2,
            gravity: 0.50,
            friction: 0.80,
            isGrounded: false,
            jumpCount: 0,
            maxJumps: 2,
            landingTimer: 0,
            isCrouching: false,
            facing: 1,
            hearts: 3,
            maxHearts: 3,
            isInvulnerable: false,
            invulnerableTimer: 0,
            isAttacking: false,
            attackTimer: 0
        };

        // Coelho de Apoio Emocional
        this.bunny = {
            x: 40,
            y: 390,
            w: 46,
            h: 46,
            vx: 0,
            vy: 0,
            facing: 1,
            isGrounded: false,
            eatTimer: 0,
            isWaiting: false // Tecla F: Ficar sentado no botão ou Seguir
        };

        // Entidades da fase atual
        this.platforms = [];
        this.obstacles = [];
        this.items = [];

        // Controle de Teclas
        this.keys = {
            left: false,
            right: false,
            down: false,
            jump: false,
            jumpPressed: false
        };

        this.bannerTimeout = null;

        // Modo de Controle ('pc' ou 'tablet')
        this.controlMode = this.getInitialControlMode();

        this.initControls();
        this.initTouchControls();
        this.bindUiEvents();
        this.setControlMode(this.controlMode, false);
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            const key = e.key;

            if (code === 'ArrowLeft' || key === 'ArrowLeft' || code === 'KeyA' || key === 'a' || key === 'A') {
                this.keys.left = true;
            }
            if (code === 'ArrowRight' || key === 'ArrowRight' || code === 'KeyD' || key === 'd' || key === 'D') {
                this.keys.right = true;
            }
            if (code === 'ArrowDown' || key === 'ArrowDown' || code === 'KeyS' || key === 's' || key === 'S') {
                this.keys.down = true;
            }
            if (code === 'ArrowUp' || key === 'ArrowUp' || code === 'KeyW' || key === 'w' || key === 'W' || code === 'Space' || key === ' ') {
                if (!this.keys.jumpPressed) {
                    this.keys.jump = true;
                    this.keys.jumpPressed = true;
                }
            }
            // Habilidade Onda de Luz (E ou J)
            if (code === 'KeyE' || key === 'e' || key === 'E' || code === 'KeyJ' || key === 'j' || key === 'J') {
                this.triggerLightWave();
            }
            // Comando do Coelho (F ou Q)
            if (code === 'KeyF' || key === 'f' || key === 'F' || code === 'KeyQ' || key === 'q' || key === 'Q') {
                this.toggleBunnyCommand();
            }
            // Mudo
            if (code === 'KeyM' || key === 'm' || key === 'M') {
                this.toggleAudio();
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            const key = e.key;

            if (code === 'ArrowLeft' || key === 'ArrowLeft' || code === 'KeyA' || key === 'a' || key === 'A') {
                this.keys.left = false;
            }
            if (code === 'ArrowRight' || key === 'ArrowRight' || code === 'KeyD' || key === 'd' || key === 'D') {
                this.keys.right = false;
            }
            if (code === 'ArrowDown' || key === 'ArrowDown' || code === 'KeyS' || key === 's' || key === 'S') {
                this.keys.down = false;
            }
            if (code === 'ArrowUp' || key === 'ArrowUp' || code === 'KeyW' || key === 'w' || key === 'W' || code === 'Space' || key === ' ') {
                this.keys.jump = false;
                this.keys.jumpPressed = false;
            }
        });
    }

    getInitialControlMode() {
        try {
            const saved = localStorage.getItem('girassois_control_mode');
            if (saved === 'pc' || saved === 'tablet') return saved;
        } catch (e) {}
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        return isTouch ? 'tablet' : 'pc';
    }

    setControlMode(mode, save = true) {
        this.controlMode = mode === 'tablet' ? 'tablet' : 'pc';
        if (save) {
            try { localStorage.setItem('girassois_control_mode', this.controlMode); } catch (e) {}
        }

        const touchLayer = document.getElementById('touch-controls-layer');
        const btnPc = document.getElementById('btn-select-pc');
        const btnTab = document.getElementById('btn-select-tablet');
        const hintPc = document.getElementById('hint-pc');
        const hintTab = document.getElementById('hint-tablet');
        const btnToggle = document.getElementById('btn-mode-toggle');

        if (this.controlMode === 'tablet') {
            if (touchLayer) touchLayer.classList.remove('hidden');
            if (btnPc) btnPc.classList.remove('active');
            if (btnTab) btnTab.classList.add('active');
            if (hintPc) hintPc.classList.add('hidden');
            if (hintTab) hintTab.classList.remove('hidden');
            if (btnToggle) {
                btnToggle.textContent = '💻';
                btnToggle.title = 'Modo Tablet ativo. Toque para alternar para Teclado (PC)';
            }
        } else {
            if (touchLayer) touchLayer.classList.add('hidden');
            if (btnPc) btnPc.classList.add('active');
            if (btnTab) btnTab.classList.remove('active');
            if (hintPc) hintPc.classList.remove('hidden');
            if (hintTab) hintTab.classList.add('hidden');
            if (btnToggle) {
                btnToggle.textContent = '📱';
                btnToggle.title = 'Modo Computador ativo. Toque para alternar para Tablet (Botões na tela)';
            }
        }
    }

    toggleControlMode() {
        const nextMode = this.controlMode === 'tablet' ? 'pc' : 'tablet';
        this.setControlMode(nextMode, true);
        if (this.showPhraseBanner) {
            this.showPhraseBanner(nextMode === 'tablet' ? 'Modo Tablet Ativado (Botões na tela) 📱' : 'Modo Computador Ativado (Teclado) 💻');
        }
    }

    initTouchControls() {
        const bindButton = (id, onPress, onRelease) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const handlePress = (e) => {
                if (e.cancelable) e.preventDefault();
                btn.classList.add('pressed');
                if (onPress) onPress();
            };

            const handleRelease = (e) => {
                if (e && e.cancelable) e.preventDefault();
                btn.classList.remove('pressed');
                if (onRelease) onRelease();
            };

            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('touchend', handleRelease, { passive: false });
            btn.addEventListener('touchcancel', handleRelease, { passive: false });

            btn.addEventListener('mousedown', handlePress);
            btn.addEventListener('mouseup', handleRelease);
            btn.addEventListener('mouseleave', handleRelease);
        };

        // Movimento para a Esquerda
        bindButton('touch-btn-left',
            () => { this.keys.left = true; },
            () => { this.keys.left = false; }
        );

        // Movimento para a Direita
        bindButton('touch-btn-right',
            () => { this.keys.right = true; },
            () => { this.keys.right = false; }
        );

        // Pulo / Pulo Duplo
        bindButton('touch-btn-jump',
            () => {
                if (!this.keys.jumpPressed) {
                    this.keys.jump = true;
                    this.keys.jumpPressed = true;
                }
            },
            () => {
                this.keys.jump = false;
                this.keys.jumpPressed = false;
            }
        );

        // Onda de Luz
        bindButton('touch-btn-wave',
            () => {
                this.triggerLightWave();
            },
            null
        );

        // Comando do Coelho
        bindButton('touch-btn-bunny',
            () => {
                this.toggleBunnyCommand();
            },
            null
        );
    }

    bindUiEvents() {
        const addClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };

        // Seletor de Modo na tela inicial
        addClick('btn-select-pc', () => {
            this.setControlMode('pc', true);
        });

        addClick('btn-select-tablet', () => {
            this.setControlMode('tablet', true);
        });

        // Alternância rápida no HUD
        addClick('btn-mode-toggle', () => {
            this.toggleControlMode();
        });

        addClick('btn-start', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            if (typeof achievements !== 'undefined') achievements.unlock('first_step');
            this.startLevel(0);
        });

        addClick('btn-next-level', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            this.startLevel(this.currentLevelIndex + 1);
        });

        addClick('btn-retry', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            this.startLevel(this.currentLevelIndex);
        });

        addClick('btn-restart-game', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            this.score = 0;
            this.startLevel(0);
        });

        addClick('btn-sound-toggle', () => {
            this.toggleAudio();
        });

        addClick('btn-wave-ability', () => {
            this.triggerLightWave();
        });

        addClick('btn-bunny-toggle', () => {
            this.toggleBunnyCommand();
        });

        addClick('btn-start-runner', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            this.startLevel(2);
        });

        addClick('btn-start-boss', () => {
            try { audio.init(); } catch (e) { console.warn(e); }
            this.startLevel(6); // Fase 7 (índice 6)
        });
    }

    toggleAudio() {
        const isMuted = audio.toggleMute();
        const btn = document.getElementById('btn-sound-toggle');
        btn.textContent = isMuted ? '🔇' : '🔊';
    }

    toggleBunnyCommand() {
        this.bunny.isWaiting = !this.bunny.isWaiting;
        const btn = document.getElementById('btn-bunny-toggle');
        const textSpan = document.getElementById('bunny-cmd-text');

        if (this.bunny.isWaiting) {
            btn.classList.add('waiting');
            textSpan.textContent = '🐰 Sentado [F]';
            this.bunny.vx = 0;
            particles.emitHearts(this.bunny.x + this.bunny.w / 2, this.bunny.y, 3);
            particles.emitText(this.bunny.x + this.bunny.w / 2, this.bunny.y - 12, '🐰 Coelho esperando no lugar!', '#ff80ab');
        } else {
            btn.classList.remove('waiting');
            textSpan.textContent = '🐰 Seguir [F]';
            particles.emitText(this.bunny.x + this.bunny.w / 2, this.bunny.y - 12, '🐰 Coelho te seguindo!', '#ffe082');
        }

        if (typeof achievements !== 'undefined') achievements.unlock('bunny_friend');
    }

    startLevel(index) {
        if (index >= GAME_LEVELS.length) {
            this.showVictoryScreen();
            return;
        }

        this.currentLevelIndex = index;
        const levelConfig = GAME_LEVELS[index];
        this.currentLevel = levelConfig;

        // Resetar Jogador
        this.player.x = 80;
        this.player.y = 360;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.facing = 1;
        this.player.hearts = 3;
        this.player.isInvulnerable = false;
        this.player.invulnerableTimer = 0;
        this.player.isAttacking = false;
        this.player.attackTimer = 0;
        this.player.isGrounded = false;
        this.player.landingTimer = 0;
        this.player.isCrouching = false;

        // Resetar Coelho
        this.bunny.x = 40;
        this.bunny.y = 360;
        this.bunny.vx = 0;
        this.bunny.vy = 0;
        this.bunny.facing = 1;
        this.bunny.eatTimer = 0;
        this.bunny.isWaiting = false;

        const bunnyBtn = document.getElementById('btn-bunny-toggle');
        if (bunnyBtn) bunnyBtn.classList.remove('waiting');
        const bunnyText = document.getElementById('bunny-cmd-text');
        if (bunnyText) bunnyText.textContent = '🐰 Seguir [F]';

        this.cameraX = 0;
        this.hope = 20;
        this.waveCooldown = 0;
        this.keysCollected = 0;
        this.shrinesLit = 0;

        this.isRunner = !!levelConfig.isRunnerLevel;
        this.isSurf = !!levelConfig.isSurfLevel;
        document.getElementById('game-container').classList.toggle('surf-active', this.isSurf);
        const isAutoRunner = this.isRunner || this.isSurf;
        const waveButton = document.getElementById('btn-wave-ability');
        const touchWaveButton = document.getElementById('touch-btn-wave');
        const bunnyButton = document.getElementById('btn-bunny-toggle');
        const touchBunnyButton = document.getElementById('touch-btn-bunny');
        const touchJumpButton = document.getElementById('touch-btn-jump');
        if (waveButton) waveButton.classList.toggle('hidden', isAutoRunner);
        if (touchWaveButton) touchWaveButton.classList.toggle('hidden', isAutoRunner);
        if (bunnyButton) bunnyButton.classList.toggle('hidden', isAutoRunner);
        if (touchBunnyButton) touchBunnyButton.classList.toggle('hidden', isAutoRunner);
        if (touchJumpButton) touchJumpButton.classList.toggle('hidden', this.isSurf);
        if (this.isRunner) {
            this.runnerScore = 0;
            this.runnerScoreTimer = 0;
            this.runnerTargetScore = levelConfig.targetScore || 1000;
            this.runnerBaseSpeed = levelConfig.runnerBaseSpeed || 2.8;
            this.runnerMaxSpeed = levelConfig.runnerMaxSpeed || 6.2;
            this.runnerMidSpeed = levelConfig.runnerMidSpeed || (this.runnerBaseSpeed + this.runnerMaxSpeed) / 2;
            this.runnerSpeed = this.runnerBaseSpeed;
            this.runnerObstacles = [];
            this.runnerSpawnTimer = levelConfig.runnerSpawnMin || 3;
            this.runnerGroundOffset = 0;
            this.runnerBgOffset = 0;
            this.lastMilestoneBeep = 0;

            const groundY = levelConfig.groundY || 460;
            this.player.x = 130;
            this.player.y = groundY - this.player.h;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.facing = 1;
            this.player.isGrounded = true;
            this.player.jumpCount = 0;
            this.bunny.x = 75;
            this.bunny.y = groundY - this.bunny.h;
            this.bunny.vx = 0;
            this.bunny.vy = 0;
            this.bunny.facing = 1;
            this.bunny.isGrounded = true;
        } else {
            this.runnerObstacles = [];
        }

        this.surfObstacles = [];
        if (this.isSurf) {
            this.surfScore = 0;
            this.surfScoreTimer = 0;
            this.score = this.empathy;
            this.surfTargetScore = levelConfig.surfTargetScore || 1000;
            this.surfBaseSpeed = levelConfig.surfBaseSpeed || 4.5;
            this.surfMaxSpeed = levelConfig.surfMaxSpeed || 8.2;
            this.surfSpeed = this.surfBaseSpeed;
            this.surfSpawnTimer = Math.max(2, levelConfig.surfSpawnMin || 1.05);
            this.surfPlayerX = this.canvas.width / 2;
            this.surfPlayerVelocity = 0;
            this.surfWaveOffset = 0;
            this.keys.left = false;
            this.keys.right = false;
            this.keys.down = false;
            this.keys.jump = false;
            this.keys.jumpPressed = false;
        }

        // Clonar plataformas, obstáculos, itens e puzzles
        this.platforms = JSON.parse(JSON.stringify(levelConfig.platforms));
        this.obstacles = JSON.parse(JSON.stringify(levelConfig.obstacles));
        this.items = JSON.parse(JSON.stringify(levelConfig.items));
        this.pressurePlates = levelConfig.pressurePlates ? JSON.parse(JSON.stringify(levelConfig.pressurePlates)) : [];
        this.barriers = levelConfig.barriers ? JSON.parse(JSON.stringify(levelConfig.barriers)) : [];
        this.shrines = levelConfig.shrines ? JSON.parse(JSON.stringify(levelConfig.shrines)) : [];
        this.npcs = [];

        particles.clear();

        // Configuração do Chefe (Fase 7 - Cuphead Boss)
        this.boss = null;
        this.bossProjectiles = [];
        this.bossShockwaves = [];
        this.playerProjectiles = [];
        if (levelConfig.isBossLevel && levelConfig.boss) {
            this.boss = {
                name: levelConfig.boss.name,
                title: levelConfig.boss.title,
                spriteKey: levelConfig.boss.spriteKey,
                studentSpriteKey: levelConfig.boss.studentSpriteKey,
                x: levelConfig.boss.x,
                y: levelConfig.boss.y,
                baseX: levelConfig.boss.x,
                baseY: levelConfig.boss.y,
                w: levelConfig.boss.w,
                h: levelConfig.boss.h,
                maxHp: levelConfig.boss.maxHp,
                hp: levelConfig.boss.maxHp,
                state: 'IDLE',
                attackTimer: 0,
                attackCooldown: 2.5,
                flashTimer: 0,
                shakeY: 0,
                movePhase: Math.random() * Math.PI * 2,
                moveAmplitude: 120,
                lastHitProfile: 1
            };
        }

        this.updateHud();
        this.hideAllModals();
        if (this.isSurf) {
            const banner = document.getElementById('phrase-banner');
            banner.classList.remove('show');
            if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
        } else {
            this.showPhraseBanner(`Bem-vindo à ${levelConfig.name}!`);
        }
        this.state = 'PLAYING';

    }

    triggerLightWave() {
        if (this.state !== 'PLAYING') return;
        if (this.isRunner || this.isSurf) return;
        if (this.waveCooldown > 0) return;

        this.waveCooldown = this.maxWaveCooldown;
        const p = this.player;
        p.isAttacking = true;
        p.attackTimer = 0.45;
        const waveCenterX = p.x + p.w / 2;
        const waveCenterY = p.y + p.h / 2;
        const isFinalBossPhase = !!(this.currentLevel && this.currentLevel.isBossLevel);

        audio.playWave();
        particles.emitLightWave(waveCenterX, waveCenterY);
        particles.emitSparks(waveCenterX, waveCenterY, 15, '#ffd700');
        if (this.currentLevel && this.currentLevel.id === 1) {
            this.phase1LightPulse = 1.0;
            this.phase1DarkTimer = 5.0;
        }
        if (typeof achievements !== 'undefined') achievements.unlock('inner_light');

        // Bola amarela liberada somente na última fase com boss final
        if (isFinalBossPhase) {
            this.playerProjectiles.push({
                x: p.facing === 1 ? p.x + p.w + 4 : p.x - 18,
                y: p.y + p.h * 0.45,
                vx: p.facing * 8.5,
                radius: 14,
                life: 1.4
            });

            if (this.boss && this.boss.state !== 'DEFEATED') {
                const b = this.boss;
                const dist = Math.hypot(waveCenterX - (b.x + b.w / 2), waveCenterY - (b.y + b.h / 2));
                if (dist <= 180) {
                    this.damageBoss(1);
                }
            }
        }

        // 1. Curar sintomas/obstáculos no raio de 135px
        const waveRadius = 135;
        let curedCount = 0;

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            const obsCenterX = obs.x + obs.w / 2;
            const obsCenterY = obs.y + obs.h / 2;
            const dist = Math.hypot(waveCenterX - obsCenterX, waveCenterY - obsCenterY);

            if (dist <= waveRadius) {
                audio.playHeal();
                particles.emitSunflowerBloom(obsCenterX, obs.y + obs.h);
                particles.emitText(obsCenterX, obs.y, `${obs.name} Superado! 🌻`, '#ffd54f');

                this.score += 80;
                this.addHope(15);
                this.obstacles.splice(i, 1);
                curedCount++;
            }
        }

        // 2. FASE 6: Revelar Plataformas Invisíveis no raio de 240px
        for (let plat of this.platforms) {
            if (plat.invisible) {
                const platCenterX = plat.x + plat.w / 2;
                const platCenterY = plat.y + plat.h / 2;
                const dist = Math.hypot(waveCenterX - platCenterX, waveCenterY - platCenterY);
                if (dist <= 240) {
                    plat.lightTimer = 4.8; // Revelada por 4.8 segundos
                    particles.emitSparks(platCenterX, plat.y, 8, '#ffe082');
                }
            }
        }

        // 3. FASE 6: Acender Altares da Chama da Vida
        for (let shrine of this.shrines) {
            if (!shrine.isLit) {
                const shrineCenterX = shrine.x + shrine.w / 2;
                const shrineCenterY = shrine.y + shrine.h / 2;
                const dist = Math.hypot(waveCenterX - shrineCenterX, waveCenterY - shrineCenterY);
                if (dist <= 160) {
                    shrine.isLit = true;
                    this.shrinesLit++;
                    audio.playHeartGain();
                    particles.emitSunflowerBloom(shrineCenterX, shrine.y + shrine.h);
                    particles.emitText(shrineCenterX, shrine.y - 12, `${shrine.name} Acesa! 🔥`, '#ffe082');
                    this.showPhraseBanner(`${shrine.name} iluminada com esperança!`);
                    this.addHope(25);
                    this.updateHud();
                    if (typeof achievements !== 'undefined') achievements.unlock('flame_lit');
                    if (this.shrinesLit >= 3) {
                        particles.emitSparks(shrineCenterX, shrine.y, 30, '#ffd700');
                        this.showPhraseBanner('Todas as 3 Chamas da Vida brilham! O Portal Supremo está aberto!');
                    }
                }
            }
        }

    if (curedCount > 0) {
        this.showPhraseBanner('Você transformou a dor em luz de esperança!');
        this.updateHud();
    }
}

addHope(amount) {
    this.hope = Math.min(100, this.hope + amount);
    this.updateHud();
}

addEmpathy(amount) {
    this.empathy = Math.min(100, this.empathy + amount);
    this.score = this.empathy;
    this.updateHud();
    localStorage.setItem('empathy', this.empathy);
    if (this.empathy >= 50 && typeof achievements !== 'undefined') achievements.unlock('empathy_50');
}

updateHud() {
    document.getElementById('score-display').textContent = this.score;
    const levelBadge = document.getElementById('level-name-display');
    levelBadge.classList.toggle('surf-progress', this.isSurf);
    levelBadge.textContent = this.isSurf
        ? `🌊 ${String(this.surfScore).padStart(4, '0')} / ${this.surfTargetScore}`
        : this.currentLevel ? this.currentLevel.name : '';

    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < this.player.maxHearts; i++) {
        const img = document.createElement('img');
        img.className = 'heart-icon' + (i < this.player.hearts ? '' : ' lost');
        img.src = i < this.player.hearts ? 'assets/itens/hud_coracao.png' : 'assets/itens/hud_coracao_vazio.png';
        heartsContainer.appendChild(img);
    }

    const hopeBar = document.getElementById('hope-bar-fill');
    const hopeText = document.getElementById('hope-value');
    if (hopeBar) hopeBar.style.width = `${Math.round(this.hope)}%`;
    if (hopeText) hopeText.textContent = `${Math.round(this.hope)}%`;

    const puzzleBadge = document.getElementById('puzzle-badge');
    const puzzleText = document.getElementById('puzzle-status-text');
    if (this.currentLevel && this.currentLevel.id === 5) {
        puzzleBadge.classList.remove('hidden');
        puzzleText.textContent = `🔑 Chaves da Mente: ${this.keysCollected}/3`;
    } else if (this.currentLevel && this.currentLevel.id === 6) {
        puzzleBadge.classList.remove('hidden');
        puzzleText.textContent = `🔥 Chamas da Vida: ${this.shrinesLit}/3`;
    } else {
        puzzleBadge.classList.add('hidden');
    }
}

showPhraseBanner(text) {
    const banner = document.getElementById('phrase-banner');
    banner.textContent = text;
    banner.classList.add('show');
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => banner.classList.remove('show'), 3600);
}

hideAllModals() {
    document.querySelectorAll('.modal-screen').forEach(el => el.classList.add('hidden'));
}

showLevelCompleteModal() {
    this.state = 'LEVEL_COMPLETE';
    audio.playLevelComplete();
    this.hideAllModals();
    if (this.currentLevel && this.currentLevel.id === 1 && typeof achievements !== 'undefined') {
        achievements.unlock('phase1_clear');
    }
    const modal = document.getElementById('modal-level-complete');
    document.getElementById('modal-level-title').textContent = `Parabéns! ${this.currentLevel.name} Concluída!`;
    document.getElementById('modal-level-msg').textContent = this.isRunner
        ? `Incrível! Você conquistou ${this.runnerScore} pontos na corrida e desviou dos obstáculos!`
        : this.isSurf
            ? `Você cruzou as ondas e alcançou ${this.surfScore} pontos de esperança!`
            : this.currentLevel.subtitle;
    modal.classList.remove('hidden');
}

showGameOverModal() {
    this.state = 'GAME_OVER';
    this.hideAllModals();
    const modal = document.getElementById('modal-game-over');
    const titleEl = modal.querySelector('h1');
    const subEl = modal.querySelector('h2');
    const textEl = modal.querySelector('p');

    if (this.isRunner || this.isSurf) {
        const score = this.isSurf ? this.surfScore : this.runnerScore;
        const target = this.isSurf ? this.surfTargetScore : this.runnerTargetScore;
        if (titleEl) titleEl.textContent = this.isSurf ? '🍃 A onda te alcançou' : '🍃 Fim da corrida';
        if (subEl) subEl.textContent = `Pontuação: ${score} / ${target}`;
        if (textEl) textEl.textContent = 'Respire fundo e tente novamente. Cada tentativa ajuda a encontrar o melhor caminho.';
    } else {
        if (titleEl) titleEl.textContent = '🍃 Respire Fundo...';
        if (subEl) subEl.textContent = 'Não há problema em tropeçar.';
        if (textEl) textEl.textContent = 'Às vezes os pensamentos pesam e a caminhada cansa, mas lembre-se: seu coelho e uma rede de apoio estão com você. Cada novo passo é uma oportunidade de recomeçar com calma e carinho.';
    }
    modal.classList.remove('hidden');
}

    showVictoryScreen() {
        this.state = 'VICTORY';
        audio.playLevelComplete();
        this.hideAllModals();

        if (typeof achievements !== 'undefined') {
            achievements.unlock('victory');
            const achEl = document.getElementById('victory-achievements');
            if (achEl) {
                achEl.textContent = `${achievements.getUnlockedCount()}/${achievements.getTotalCount()}`;
            }
        }

        document.getElementById('victory-score').textContent = this.score;
        const modal = document.getElementById('modal-victory');
        modal.classList.remove('hidden');
    }

    update() {
        if (this.state !== 'PLAYING') return;

        if (this.isSurf) {
            this.updateSurf();
            particles.update();
            return;
        }

        if (this.isRunner) {
            this.updateRunner();
            this.updatePlayer();
            particles.updatePetals(this.canvas.width, this.canvas.height, this.hope);
            particles.update();
            return;
        }

        // Cooldown da Onda de Luz
        if (this.waveCooldown > 0) {
            this.waveCooldown -= 0.016;
            if (this.waveCooldown < 0) this.waveCooldown = 0;
            const cooldownPct = (this.waveCooldown / this.maxWaveCooldown) * 100;
            const cdOverlay = document.getElementById('wave-cooldown-overlay');
            if (cdOverlay) cdOverlay.style.width = `${cooldownPct}%`;
        }

        if (this.phase1LightPulse > 0) {
            this.phase1LightPulse -= 0.022;
            if (this.phase1LightPulse < 0) this.phase1LightPulse = 0;
        }

        if (this.phase1DarkTimer > 0) {
            this.phase1DarkTimer -= 0.016;
            if (this.phase1DarkTimer <= 0) {
                this.phase1DarkTimer = 0;
                this.phase1LightPulse = 0;
            }
        }

        // FASE 6: Atualizar temporizadores das plataformas invisíveis reveladas
        for (let plat of this.platforms) {
            if (plat.invisible && plat.lightTimer > 0) {
                plat.lightTimer -= 0.016;
                if (plat.lightTimer < 0) plat.lightTimer = 0;
            }
        }

        this.updatePuzzles();
        if (this.boss) this.updateBoss();
        this.updatePlayer();
        this.updatePlayerProjectiles();
        this.updateBossAttacks();
        this.updateBunny();
        this.updateObstacles();
        this.checkItemCollisions();
        this.checkObstacleCollisions();
        this.checkPortalReach();
        this.updateCamera();

        const petalDensity = this.currentLevel && this.currentLevel.id > 4 ? 0.25 : 1;
        particles.updatePetals(this.canvas.width, this.canvas.height, this.hope, petalDensity);
        particles.update();
    }

    updatePuzzles() {
        // FASE 5: Atualizar Placas de Pressão e Barreiras
        if (this.currentLevel && this.currentLevel.id === 5) {
            const p = this.player;
            const b = this.bunny;

            for (let plate of this.pressurePlates) {
                const plateBox = { x: plate.x, y: plate.y - 8, w: plate.w, h: plate.h + 12 };
                const playerOn = this.checkAABB(p, plateBox);
                const bunnyOn = this.checkAABB(b, plateBox);

                const wasPressed = plate.isPressed;
                plate.isPressed = playerOn || bunnyOn;

                if (!wasPressed && plate.isPressed) {
                    audio.playCollect();
                    particles.emitSparks(plate.x + plate.w / 2, plate.y, 10, '#64b5f6');
                    if (bunnyOn && typeof achievements !== 'undefined') {
                        achievements.unlock('puzzle_master');
                    }
                }

                // Abrir ou fechar a barreira correspondente
                const barrier = this.barriers.find(bar => bar.id === plate.targetBarrier);
                if (barrier) {
                    barrier.isOpen = plate.isPressed;
                }
            }

            // Colisão com barreiras fechadas
            for (let barrier of this.barriers) {
                if (!barrier.isOpen) {
                    const barrierBox = { x: barrier.x, y: barrier.y, w: barrier.w, h: barrier.h };
                    if (this.checkAABB(p, barrierBox)) {
                        p.x = p.x < barrier.x ? barrier.x - p.w : barrier.x + barrier.w;
                        p.vx = 0;
                    }
                }
            }
        }
    }

    updatePlayer() {
        const p = this.player;
        if (p.landingTimer > 0) p.landingTimer -= 0.016;

        if (this.isRunner) {
            p.x = 130;
            p.vx = 0;
            p.facing = 1;
            if (p.isGrounded && Math.random() < 0.28) particles.emitDust(p.x + p.w / 2, p.y + p.h);

            if (this.keys.jump) {
                if (p.isGrounded || p.jumpCount < p.maxJumps) {
                    p.vy = p.jumpForce;
                    p.isGrounded = false;
                    p.jumpCount++;
                    audio.playJump();
                    particles.emitSparks(p.x + p.w / 2, p.y + p.h, 8, '#fff59d');
                    if (this.bunny.isGrounded) {
                        this.bunny.vy = p.jumpForce * 0.9;
                        this.bunny.isGrounded = false;
                    }
                }
                this.keys.jump = false;
            }

            p.vy = Math.min(11, p.vy + p.gravity);
            p.y += p.vy;
            const groundY = this.currentLevel.groundY || 460;
            if (p.y >= groundY - p.h) {
                p.y = groundY - p.h;
                p.vy = 0;
                p.isGrounded = true;
                p.jumpCount = 0;
            }

            this.bunny.x = 75;
            this.bunny.facing = 1;
            this.bunny.vy = Math.min(10, this.bunny.vy + 0.48);
            this.bunny.y += this.bunny.vy;
            if (this.bunny.y >= groundY - this.bunny.h) {
                this.bunny.y = groundY - this.bunny.h;
                this.bunny.vy = 0;
                this.bunny.isGrounded = true;
            }
            return;
        }

        const prevBottom = p.y + p.h;

        p.isCrouching = !!(p.isGrounded && this.keys.down);

        // Movimento Horizontal
        if (this.keys.left && !this.keys.right) {
            p.vx = -p.speed * (p.isCrouching ? 0.45 : 1);
            p.facing = -1;
            if (p.isGrounded && Math.random() < 0.2) {
                particles.emitDust(p.x + p.w / 2, p.y + p.h);
            }
        } else if (this.keys.right && !this.keys.left) {
            p.vx = p.speed * (p.isCrouching ? 0.45 : 1);
            p.facing = 1;
            if (p.isGrounded && Math.random() < 0.2) {
                particles.emitDust(p.x + p.w / 2, p.y + p.h);
            }
        } else {
            p.vx *= p.friction;
            if (Math.abs(p.vx) < 0.05) p.vx = 0;
        }

        if (p.isCrouching) {
            p.vy *= 0.92;
        }

        // Pulo e Pulo Duplo
        if (this.keys.jump) {
            if (p.isGrounded || p.jumpCount < p.maxJumps) {
                p.vy = p.jumpForce;
                p.isGrounded = false;
                p.jumpCount++;
                audio.playJump();
                particles.emitSparks(p.x + p.w / 2, p.y + p.h, 8, '#fff59d');
            }
            this.keys.jump = false;
        }

        // Gravidade
        p.vy += p.gravity;
        if (p.vy > 11) p.vy = 11;

        // Movimento Horizontal
        p.x += p.vx;
        if (p.x < 0) p.x = 0;
        if (p.x + p.w > this.currentLevel.width) p.x = this.currentLevel.width - p.w;

        // Movimento Vertical e Colisão com Plataformas
        p.y += p.vy;
        const currBottom = p.y + p.h;
        const wasAirborne = !p.isGrounded;
        p.isGrounded = false;

        for (let plat of this.platforms) {
            // Se for plataforma invisível e NÃO estiver iluminada, ignora colisão
            if (plat.invisible && (!plat.lightTimer || plat.lightTimer <= 0)) {
                continue;
            }

            if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
                if (p.vy >= 0 && prevBottom <= plat.y + 10 && currBottom >= plat.y) {
                    p.y = plat.y - p.h;
                    p.vy = 0;
                    p.isGrounded = true;
                    p.jumpCount = 0;
                    if (wasAirborne) p.landingTimer = 0.28;
                }
            }
        }

        // Queda fora do cenário
        if (p.y > this.canvas.height + 50) {
            this.playerTakeDamage(null);
            p.y = 300;
            p.x = Math.max(80, p.x - 200);
            p.vy = 0;
        }

        if (p.isInvulnerable) {
            p.invulnerableTimer -= 0.016;
            if (p.invulnerableTimer <= 0) {
                p.isInvulnerable = false;
            }
        }

        if (p.isAttacking) {
            p.attackTimer -= 0.016;
            if (p.attackTimer <= 0) {
                p.isAttacking = false;
            }
        }
    }

    updateBunny() {
        const b = this.bunny;
        const p = this.player;
        const prevBottom = b.y + b.h;

        // Se o coelho recebeu o comando de esperar/sentar no local (Tecla F)
        if (b.isWaiting) {
            b.vx = 0;
            b.eatTimer += 0.016;
        } else {
            // Segue o jogador
            const targetX = p.facing === 1 ? p.x - 42 : p.x + p.w + 12;
            const dist = targetX - b.x;

            if (Math.abs(dist) > 16) {
                b.facing = dist > 0 ? 1 : -1;
                b.vx = Math.sign(dist) * 2.5;
                b.eatTimer = 0;

                if (b.isGrounded && (Math.abs(dist) > 80 || p.y < b.y - 20)) {
                    b.vy = -8.5;
                    b.isGrounded = false;
                }
            } else {
                b.vx *= 0.6;
                if (Math.abs(b.vx) < 0.05) b.vx = 0;
                b.eatTimer += 0.016;
            }
        }

        b.vy += 0.48;
        if (b.vy > 10) b.vy = 10;

        b.x += b.vx;
        b.y += b.vy;
        const currBottom = b.y + b.h;
        b.isGrounded = false;

        for (let plat of this.platforms) {
            if (plat.invisible && (!plat.lightTimer || plat.lightTimer <= 0)) {
                continue;
            }

            if (b.x + b.w > plat.x && b.x < plat.x + plat.w) {
                if (b.vy >= 0 && prevBottom <= plat.y + 10 && currBottom >= plat.y) {
                    b.y = plat.y - b.h;
                    b.vy = 0;
                    b.isGrounded = true;
                }
            }
        }

        // Se o coelho cair muito longe e não estiver esperando, teletransporta com afeto
        if (!b.isWaiting && (b.y > this.canvas.height + 60 || Math.abs(b.x - p.x) > 450)) {
            b.x = p.x - 30;
            b.y = p.y;
            b.vy = 0;
        }
    }

    updateObstacles() {
        const time = Date.now() * 0.0025;
        for (let obs of this.obstacles) {
            obs.x += obs.vx;
            if (obs.x <= obs.minX) {
                obs.x = obs.minX;
                obs.vx = Math.abs(obs.vx);
            } else if (obs.x + obs.w >= obs.maxX) {
                obs.x = obs.maxX - obs.w;
                obs.vx = -Math.abs(obs.vx);
            }
            obs.hoverOffset = Math.sin(time * 0.6 + obs.x * 0.01) * 1.2;
        }
    }

    checkItemCollisions() {
        const p = this.player;
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            const itemBox = {
                x: it.x,
                y: it.y,
                w: 32,
                h: 32
            };

            if (this.checkAABB(p, itemBox)) {
                this.score += it.points;
                particles.emitSparks(it.x + 16, it.y + 16, 18, '#ffd700');
                particles.emitText(it.x + 16, it.y, `+${it.points} Empatia!`);
                this.addHope(10);

                // Chave de Puzzle (Fase 5)
                if (it.isPuzzleKey) {
                    this.keysCollected++;
                    audio.playHeartGain();
                    particles.emitText(it.x + 16, it.y - 20, `🔑 Chave da Mente Encontrada! (${this.keysCollected}/3)`, '#ffd54f');
                    if (this.keysCollected >= 3) {
                        this.showPhraseBanner("Todas as 3 Chaves da Clareza foram reunidas! O Portão se abriu!");
                    }
                } else if (it.isLife && p.hearts < p.maxHearts) {
                    p.hearts++;
                    audio.playHeartGain();
                    particles.emitText(it.x + 16, it.y - 20, '+1 Serenidade!', '#ff6b6b');
                } else {
                    audio.playCollect();
                }

                if (it.phrase) {
                    this.showPhraseBanner(it.phrase);
                }

                this.items.splice(i, 1);
                this.updateHud();
            }
        }
    }

    checkObstacleCollisions() {
        const p = this.player;
        if (p.isInvulnerable) return;

        const playerBox = {
            x: p.x + 6,
            y: p.y + 6,
            w: p.w - 12,
            h: p.h - 10
        };

        for (let obs of this.obstacles) {
            const obsBox = {
                x: obs.x + 4,
                y: obs.y + (obs.hoverOffset || 0) + 4,
                w: obs.w - 8,
                h: obs.h - 8
            };

            if (this.checkAABB(playerBox, obsBox)) {
                this.playerTakeDamage(obs);
                break;
            }
        }
    }

    playerTakeDamage(obs) {
        if (this.player.isInvulnerable) return;

        this.player.hearts = Math.max(0, this.player.hearts - 1);
        this.player.isInvulnerable = true;
        this.player.invulnerableTimer = 1.2;

        if (obs) {
            const pushDir = this.player.x < obs.x ? -1 : 1;
            this.player.vx = pushDir * 3.2;
            this.player.vy = -4.5;
        } else {
            this.player.vy = -4.0;
        }

        audio.playHurt();
        particles.emitSparks(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 14, '#9c88ff');
        particles.emitText(this.player.x + this.player.w / 2, this.player.y, '-1 Coração! Use [E] para iluminar a dor.', '#ffb8b8');

        particles.emitHearts(this.bunny.x + this.bunny.w / 2, this.bunny.y, 4);
        this.updateHud();

        if (this.player.hearts <= 0) {
            this.showGameOverModal();
        }
    }

    checkPortalReach() {
        if (!this.currentLevel) return;
        const p = this.player;
        const portalX = this.currentLevel.portalX;

        // Na Fase 5: exige as 3 chaves
        if (this.currentLevel.id === 5 && this.keysCollected < this.currentLevel.requiredKeys) {
            if (p.x + p.w >= portalX - 20 && p.x <= portalX + 80) {
                this.showPhraseBanner(`O Portão do Santuário está trancado! Encontre as 3 Chaves com seu coelho (${this.keysCollected}/3).`);
            }
            return;
        }

        // Na Fase 6: exige as 3 chamas acesas
        if (this.currentLevel.id === 6 && this.shrinesLit < this.currentLevel.requiredShrines) {
            if (p.x + p.w >= portalX - 20 && p.x <= portalX + 80) {
                this.showPhraseBanner(`O Portal Supremo aguarda que você acenda as 3 Chamas da Vida com [E] (${this.shrinesLit}/3)!`);
            }
            return;
        }

        // Na Fase 7: exige derrotar o Boss Final
        if (this.currentLevel.id === 7) {
            if (this.boss && this.boss.state !== 'DEFEATED') {
                return; // Portal só abre após transformar a Grande Sombra!
            }
            if (p.x + p.w >= portalX - 40 && p.x <= portalX + 80) {
                particles.emitSparks(portalX + 40, 380, 40, '#ffd700');
                this.showVictoryScreen();
                return;
            }
        }

        // Tocou o portal concluído!
        if (p.x + p.w >= portalX && p.x <= portalX + 80) {
            particles.emitSparks(portalX + 40, 380, 30, '#ffd700');
            this.addHope(30);

            // Se completou a Fase 7 ou superior, vitória definitiva!
            if (this.currentLevel.id >= 7) {
                this.showVictoryScreen();
            } else {
                this.showLevelCompleteModal();
            }
        }
    }

    updateCamera() {
        if (!this.currentLevel) return;
        const targetCamX = this.player.x - this.canvas.width * 0.35;
        this.cameraX += (targetCamX - this.cameraX) * 0.12;

        const maxCam = this.currentLevel.width - this.canvas.width;
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraX > maxCam) this.cameraX = maxCam;
    }

    checkAABB(r1, r2) {
        return (
            r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y
        );
    }

    // =========================================================================
    // MECÂNICAS DO MODO ENDLESS RUNNER (FASE 3 - ESTILO GOOGLE CHROME DINO)
    // =========================================================================
    calculateRunnerSpeed(score) {
        const midpoint = this.runnerTargetScore / 2;
        if (score <= midpoint) {
            const progress = Math.max(0, score / midpoint);
            return this.runnerBaseSpeed + progress * (this.runnerMidSpeed - this.runnerBaseSpeed);
        }

        const progress = Math.min(1, (score - midpoint) / midpoint);
        return this.runnerMidSpeed + progress * (this.runnerMaxSpeed - this.runnerMidSpeed);
    }

    updateSurf() {
        const frameTime = 0.016;
        const progress = Math.min(1, this.surfScore / this.surfTargetScore);
        const direction = Number(this.keys.right) - Number(this.keys.left);
        if (direction !== 0) {
            this.surfPlayerVelocity += direction * 0.72;
            this.surfPlayerVelocity = Math.max(-8.5, Math.min(8.5, this.surfPlayerVelocity));
        } else {
            this.surfPlayerVelocity *= 0.82;
            if (Math.abs(this.surfPlayerVelocity) < 0.12) this.surfPlayerVelocity = 0;
        }
        this.surfPlayerX = Math.max(35, Math.min(this.canvas.width - 35, this.surfPlayerX + this.surfPlayerVelocity));

        this.surfScoreTimer += frameTime;
        if (this.surfScoreTimer >= 0.075) {
            this.surfScore++;
            this.surfScoreTimer = 0;
            this.hope = Math.min(100, this.hope + 0.02);
            this.updateHud();
        }

        this.surfSpeed = this.surfBaseSpeed + progress * (this.surfMaxSpeed - this.surfBaseSpeed);
        this.surfWaveOffset = (this.surfWaveOffset + this.surfSpeed) % 84;

        if (this.surfScore >= this.surfTargetScore) {
            particles.emitSunflowerBloom(480, 400);
            particles.emitSparks(480, 360, 45, '#ffe082');
            this.showPhraseBanner(`Você cruzou o mar! ${this.surfTargetScore} pontos de esperança!`);
            this.showLevelCompleteModal();
            return;
        }

        this.surfSpawnTimer -= frameTime;
        if (this.surfSpawnTimer <= 0) {
            this.spawnSurfObject();
            const minDelay = Math.max(0.78, this.currentLevel.surfSpawnMin - progress * 0.22);
            const maxDelay = Math.max(minDelay + 0.2, this.currentLevel.surfSpawnMax - progress * 0.28);
            this.surfSpawnTimer = minDelay + Math.random() * (maxDelay - minDelay);
        }

        for (let index = this.surfObstacles.length - 1; index >= 0; index--) {
            const object = this.surfObstacles[index];
            object.y += this.surfSpeed * (object.type === 'hope' ? 1.08 : 1.18);
            if (object.y > this.canvas.height + 90) {
                this.surfObstacles.splice(index, 1);
                continue;
            }

            if (this.checkSurfCollision(object)) {
                if (object.type === 'hope') {
                    this.surfScore += object.points;
                    this.addEmpathy(object.empathy);
                    audio.playCollect();
                    particles.emitSparks(object.x, object.y, 18, '#ffe082');
                    particles.emitText(object.x, object.y - 12, `+${object.points} esperança`, '#fff1a8');
                    this.surfObstacles.splice(index, 1);
                } else {
                    audio.playHurt();
                    particles.emitSparks(this.surfPlayerX, 425, 24, '#ff8a65');
                    this.showGameOverModal();
                    return;
                }
            }
        }
    }

    spawnSurfObject() {
        const isHope = Math.random() < 0.28;
        const x = 55 + Math.random() * (this.canvas.width - 110);
        const type = isHope
            ? 'hope'
            : ['rock', 'buoy', 'foam'][Math.floor(Math.random() * 3)];
        const dimensions = type === 'foam'
            ? { w: 104, h: 54 }
            : type === 'hope'
                ? { w: 38, h: 38 }
                : { w: 62, h: 66 };

        this.surfObstacles.push({
            type,
            x,
            y: -dimensions.h,
            w: dimensions.w,
            h: dimensions.h,
            points: 50,
            empathy: 8
        });
    }

    checkSurfCollision(object) {
        const playerBox = { x: this.surfPlayerX - 14, y: 400, w: 28, h: 56 };
        if (object.type === 'hope') {
            const nearestX = Math.max(playerBox.x, Math.min(object.x, playerBox.x + playerBox.w));
            const nearestY = Math.max(playerBox.y, Math.min(object.y, playerBox.y + playerBox.h));
            return Math.hypot(object.x - nearestX, object.y - nearestY) <= object.w * 0.42;
        }

        const padding = object.type === 'foam' ? 0.08 : 0.12;
        const objectBox = {
            x: object.x - object.w * padding,
            y: object.y - object.h * padding,
            w: object.w * (1 - padding * 2),
            h: object.h * (1 - padding * 2)
        };

        return playerBox.x < objectBox.x + objectBox.w &&
            playerBox.x + playerBox.w > objectBox.x &&
            playerBox.y < objectBox.y + objectBox.h &&
            playerBox.y + playerBox.h > objectBox.y;
    }

    updateRunner() {
        if (this.state !== 'PLAYING') return;

        if (this.player.isInvulnerable) {
            this.player.invulnerableTimer -= 0.016;
            if (this.player.invulnerableTimer <= 0) {
                this.player.isInvulnerable = false;
                this.player.invulnerableTimer = 0;
            }
        }

        // 1. Pontuação crescente contínua conforme o tempo passa
        this.runnerScoreTimer += 0.016;
        if (this.runnerScoreTimer >= 0.075) {
            this.runnerScore += 1;
            this.runnerScoreTimer = 0;
            this.score = this.runnerScore;
            this.addHope(0.05);

            // Sinal sonoro e visual a cada 100 pontos (estilo dinossauro do Google Chrome)
            const milestone = Math.floor(this.runnerScore / 100);
            if (milestone > this.lastMilestoneBeep && this.runnerScore < this.runnerTargetScore) {
                this.lastMilestoneBeep = milestone;
                audio.playCollect();
                particles.emitSparks(this.player.x + this.player.w / 2, this.player.y - 10, 16, '#ffd700');
                particles.emitText(this.player.x + 35, this.player.y - 25, `${this.runnerScore} PONTOS! 🏃`, '#ffd700');
            }

            this.updateHud();
        }

        // 2. Dificuldade Progressiva Muito Suave (Sem acelerações bruscas)
        this.runnerSpeed = this.calculateRunnerSpeed(this.runnerScore);

        // 3. Efeito de esteira de chão e fundo noturno em rolagem contínua
        this.runnerGroundOffset = (this.runnerGroundOffset + this.runnerSpeed) % 48;
        this.runnerBgOffset = (this.runnerBgOffset + this.runnerSpeed * 0.35) % this.canvas.width;

        // 4. Meta de pontuação atingida -> Vitória da Fase e Avanço para Fase 4!
        if (this.runnerScore >= this.runnerTargetScore) {
            audio.playLevelComplete();
            particles.emitSunflowerBloom(this.player.x + this.player.w / 2, this.player.y + this.player.h);
            particles.emitSparks(this.player.x + this.player.w / 2, this.player.y, 45, '#ffd700');
            this.showPhraseBanner(`🎉 ${this.runnerTargetScore} PONTOS! Você venceu a Corrida da Superação!`);
            this.showLevelCompleteModal();
            return;
        }

        // 5. Spawning de obstáculos com intervalos amplos e progressão lenta
        this.runnerSpawnTimer -= 0.016;
        if (this.runnerSpawnTimer <= 0) {
            this.spawnRunnerObstacle();
            // No início: mínimo 3.0s, máximo 4.5s. Perto da meta: mínimo 2.2s, máximo 3.5s
            const progressTarget = Math.min(1.0, this.runnerScore / this.runnerTargetScore);
            const minInterval = (this.currentLevel.runnerSpawnMin || 3.0) - progressTarget * 0.2;
            const maxInterval = (this.currentLevel.runnerSpawnMax || 4.5) - progressTarget * 0.3;
            this.runnerSpawnTimer = minInterval + Math.random() * (maxInterval - minInterval);
        }

        // 6. Atualizar posições dos obstáculos (movem-se da direita para a esquerda)
        for (let i = this.runnerObstacles.length - 1; i >= 0; i--) {
            const obs = this.runnerObstacles[i];
            obs.x -= this.runnerSpeed;

            // Remove itens que já passaram totalmente pelo canto esquerdo da tela
            if (obs.x + obs.w < -60) {
                this.runnerObstacles.splice(i, 1);
            }
        }

        // 7. Checar colisão do personagem contra os itens
        this.checkRunnerCollisions();
    }

    spawnRunnerObstacle() {
        if (this.runnerObstacles.length > 0) {
            const lastObs = this.runnerObstacles[this.runnerObstacles.length - 1];
            const distFromEdge = (this.canvas.width + 40) - (lastObs.x + lastObs.w);
            if (distFromEdge < 380) {
                this.runnerSpawnTimer = 0.4;
                return;
            }
        }

        const groundY = (this.currentLevel && this.currentLevel.groundY) || 460;
        const types = (this.currentLevel && this.currentLevel.runnerObstacleTypes) || [
            { type: 'item_chave', name: 'Chave', w: 34, h: 34 },
            { type: 'item_disco_180', name: 'Disco 180', w: 36, h: 36 },
            { type: 'item_disco_190', name: 'Disco 190', w: 36, h: 36 },
            { type: 'item_documento_rg', name: 'Identidade', w: 36, h: 36 },
            { type: 'item_lei_maria', name: 'Lei Maria da Penha', w: 38, h: 38 },
            { type: 'item_certidao', name: 'Certidão', w: 36, h: 36 },
            { type: 'item_denuncia', name: 'Denúncia', w: 36, h: 36 },
            { type: 'item_dialogo', name: 'Diálogo', w: 36, h: 36 },
            { type: 'item_rede_apoio', name: 'Rede de Apoio', w: 38, h: 38 }
        ];

        const holeChance = this.currentLevel.runnerHoleChance ?? 0.28;
        if (Math.random() < holeChance) {
            const holeW = 70 + Math.random() * 36;
            this.runnerObstacles.push({
                type: 'hole',
                name: 'Buraco',
                x: this.canvas.width + 40,
                y: groundY,
                w: holeW,
                h: 28,
                isHole: true,
                isCollectible: false
            });
            return;
        }

        if (Math.random() < (this.currentLevel.runnerFlyingChance ?? 0.25)) {
            this.runnerObstacles.push({
                type: 'runner_bird',
                name: 'Voador',
                x: this.canvas.width + 40,
                y: groundY - 72,
                w: 44,
                h: 38,
                isFlying: true,
                isCollectible: false,
                isHole: false
            });
            return;
        }

        const chosen = types[Math.floor(Math.random() * types.length)];
        const itemChance = this.currentLevel.runnerCollectibleChance ?? 0.72;
        if (Math.random() < itemChance) {
            const pickup = {
                type: chosen.type,
                name: chosen.name,
                x: this.canvas.width + 40,
                y: groundY - chosen.h - 18,
                w: chosen.w,
                h: chosen.h,
                isCollectible: true,
                points: 25 + Math.floor(Math.random() * 35),
                color: '#ffd700'
            };
            this.runnerObstacles.push(pickup);
        } else {
            this.runnerObstacles.push({
                type: chosen.type,
                name: chosen.name,
                x: this.canvas.width + 40,
                y: groundY - chosen.h,
                w: chosen.w,
                h: chosen.h,
                isCollectible: false,
                isHole: false
            });
        }

        if (this.runnerScore >= 300) {
            let doubleChance = 0;
            if (this.runnerScore <= 500) {
                doubleChance = 0.03 + ((this.runnerScore - 300) / 200) * 0.05;
            } else {
                doubleChance = Math.min(0.15, 0.08 + ((this.runnerScore - 500) / 500) * 0.07);
            }

            if (Math.random() < doubleChance) {
                const second = types[Math.floor(Math.random() * types.length)];
                const secondItem = {
                    type: second.type,
                    name: second.name,
                    x: this.canvas.width + 40 + chosen.w + 20,
                    y: groundY - second.h - 18,
                    w: second.w,
                    h: second.h,
                    isCollectible: false,
                    isHole: false
                };
                this.runnerObstacles.push(secondItem);
            }
        }
    }

    checkRunnerCollisions() {
        const p = this.player;
        if (p.isInvulnerable) return;

        const playerBox = {
            x: p.x + 10,
            y: p.y + 8,
            w: p.w - 20,
            h: p.h - 12
        };

        for (let i = this.runnerObstacles.length - 1; i >= 0; i--) {
            const obs = this.runnerObstacles[i];
            const obsBox = {
                x: obs.x + 5,
                y: obs.y + 4,
                w: obs.w - 10,
                h: obs.h - 8
            };

            if (this.checkAABB(playerBox, obsBox)) {
                this.runnerObstacles.splice(i, 1);
                p.hearts = Math.max(0, p.hearts - 1);
                p.isInvulnerable = true;
                p.invulnerableTimer = 0.9;
                audio.playHurt();
                particles.emitSparks(p.x + p.w / 2, p.y + p.h / 2, 20, '#ff4757');
                particles.emitText(p.x + p.w / 2, p.y - 12, '-1 vida', '#ffb8b8');
                this.updateHud();

                if (p.hearts === 0) {
                    this.showGameOverModal();
                }
                return;
            }
        }
    }

    renderSurf(ctx) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ocean = ctx.createLinearGradient(0, 0, 0, height);
        ocean.addColorStop(0, '#79d8cf');
        ocean.addColorStop(0.48, '#168c9a');
        ocean.addColorStop(1, '#07566c');
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255, 231, 164, 0.75)';
        ctx.beginPath();
        ctx.arc(width - 92, 92, 25, 0, Math.PI * 2);
        ctx.fill();

        for (let band = 0; band < 12; band++) {
            const y = ((band * 62 + this.surfWaveOffset * 2.1) % (height + 62)) - 31;
            for (let trace = 0; trace < 6; trace++) {
                const x = trace * 176 + ((band % 2) * 70) + Math.sin(band + trace) * 18;
                const length = 42 + ((band * 19 + trace * 23) % 58);
                ctx.strokeStyle = `rgba(215, 255, 248, ${0.2 + ((band + trace) % 4) * 0.045})`;
                ctx.lineWidth = 1 + ((band + trace) % 3) * 0.45;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(x + length * 0.5, y - 5, x + length, y + 1);
                ctx.stroke();
            }
        }

        ctx.fillStyle = 'rgba(222, 255, 245, 0.28)';
        for (let sparkle = 0; sparkle < 18; sparkle++) {
            const x = (sparkle * 137 + (sparkle % 3) * 41) % width;
            const y = (sparkle * 83 + this.surfWaveOffset * 2.8) % height;
            ctx.beginPath();
            ctx.ellipse(x, y, 2 + sparkle % 3, 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const object of this.surfObstacles) {
            ctx.save();
            ctx.translate(object.x, object.y);

            if (object.type === 'hope') {
                ctx.shadowColor = '#ffe082';
                ctx.shadowBlur = 16;
                ctx.fillStyle = '#ffe082';
                for (let petal = 0; petal < 8; petal++) {
                    ctx.save();
                    ctx.rotate(petal * Math.PI / 4);
                    ctx.beginPath();
                    ctx.ellipse(0, -12, 5, 9, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff7d1';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (object.type === 'foam') {
                ctx.fillStyle = 'rgba(5, 78, 94, 0.2)';
                ctx.beginPath();
                ctx.ellipse(0, 5, object.w * 0.52, object.h * 0.58, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#eafff8';
                ctx.beginPath();
                ctx.moveTo(-object.w / 2, 0);
                ctx.quadraticCurveTo(-object.w * 0.36, -object.h * 0.65, -object.w * 0.15, -object.h * 0.25);
                ctx.quadraticCurveTo(0, -object.h * 0.9, object.w * 0.12, -object.h * 0.2);
                ctx.quadraticCurveTo(object.w * 0.38, -object.h * 0.65, object.w / 2, 0);
                ctx.quadraticCurveTo(object.w * 0.25, object.h * 0.55, 0, object.h * 0.38);
                ctx.quadraticCurveTo(-object.w * 0.3, object.h * 0.6, -object.w / 2, 0);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            } else if (object.type === 'buoy') {
                ctx.fillStyle = 'rgba(3, 58, 71, 0.25)';
                ctx.beginPath();
                ctx.ellipse(3, 6, object.w * 0.48, object.h * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff8a65';
                ctx.beginPath();
                ctx.arc(0, 0, object.w * 0.42, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff0c6';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(0, 0, object.w * 0.25, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#f7e5a6';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(3, 49, 62, 0.28)';
                ctx.beginPath();
                ctx.ellipse(3, 9, object.w * 0.55, object.h * 0.42, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#607d78';
                ctx.beginPath();
                ctx.moveTo(-object.w * 0.45, object.h * 0.22);
                ctx.lineTo(-object.w * 0.36, -object.h * 0.23);
                ctx.lineTo(-object.w * 0.08, -object.h * 0.48);
                ctx.lineTo(object.w * 0.24, -object.h * 0.34);
                ctx.lineTo(object.w * 0.45, object.h * 0.12);
                ctx.lineTo(object.w * 0.3, object.h * 0.43);
                ctx.lineTo(-object.w * 0.2, object.h * 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(234, 255, 248, 0.75)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();
        }

        const surferY = 426 + Math.sin(Date.now() / 130) * 2;
        ctx.save();
        ctx.translate(this.surfPlayerX, surferY);
        ctx.rotate(this.surfPlayerVelocity * 0.018);

        ctx.fillStyle = 'rgba(2, 39, 51, 0.35)';
        ctx.beginPath();
        ctx.ellipse(2, 8, 25, 48, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(235, 255, 248, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-9, 51);
        ctx.quadraticCurveTo(-16, 70, -9, 84);
        ctx.moveTo(9, 51);
        ctx.quadraticCurveTo(16, 70, 9, 84);
        ctx.stroke();

        const board = ctx.createLinearGradient(-16, 0, 16, 0);
        board.addColorStop(0, '#ff8a65');
        board.addColorStop(0.5, '#fff8df');
        board.addColorStop(1, '#ffe082');
        ctx.fillStyle = board;
        ctx.beginPath();
        ctx.moveTo(0, -43);
        ctx.quadraticCurveTo(15, -32, 15, 0);
        ctx.lineTo(11, 36);
        ctx.quadraticCurveTo(0, 47, -11, 36);
        ctx.lineTo(-15, 0);
        ctx.quadraticCurveTo(-15, -32, 0, -43);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fffef1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#174f60';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-5, 21);
        ctx.lineTo(-5, 36);
        ctx.moveTo(5, 21);
        ctx.lineTo(5, 36);
        ctx.stroke();

        ctx.fillStyle = '#f0b28e';
        ctx.beginPath();
        ctx.arc(0, -18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#263c4b';
        ctx.beginPath();
        ctx.arc(0, -20, 8, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.ellipse(0, 1, 9, 15, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f0b28e';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(-18, 8 + Math.sin(Date.now() / 120) * 3);
        ctx.moveTo(7, -4);
        ctx.lineTo(18, 8 - Math.sin(Date.now() / 120) * 3);
        ctx.stroke();
        ctx.restore();

        particles.draw(ctx, 0);
    }

    renderRunner(ctx) {
        // 1. Cenário Noturno de Fundo em parallax contínuo
        const bgImg = sprites.get(this.currentLevel.bgKey);
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            const bgX = this.runnerBgOffset;
            ctx.drawImage(bgImg, -bgX, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(bgImg, this.canvas.width - bgX, 0, this.canvas.width, this.canvas.height);
        } else {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            skyGrad.addColorStop(0, '#0f172a');
            skyGrad.addColorStop(0.7, '#1e293b');
            skyGrad.addColorStop(1, '#334155');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 2. Chão contínuo com esteira e fundo noturno em rolagem contínua
        const groundY = (this.currentLevel && this.currentLevel.groundY) || 460;
        const terrainImg = sprites.get('terreno');

        if (terrainImg && terrainImg.complete && terrainImg.naturalWidth > 0) {
            const tileW = 48;
            const tileH = 80;
            const startX = -this.runnerGroundOffset;
            for (let x = startX; x < this.canvas.width + tileW; x += tileW) {
                ctx.drawImage(terrainImg, x, groundY, tileW, tileH);
            }
        } else {
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);
        }

        // Linha superior de solo brilhante
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(this.canvas.width, groundY);
        ctx.stroke();

        // Riscos e pequenas pedrinhas correndo na esteira (estilo Chrome Dino)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 18; i++) {
            const dotX = ((i * 64 - this.runnerGroundOffset * 1.6) % this.canvas.width + this.canvas.width) % this.canvas.width;
            const dotY = groundY + 10 + ((i * 17) % 36);
            ctx.fillRect(dotX, dotY, (i % 3 === 0 ? 8 : 4), 2);
        }

        // 3. Renderizar obstáculos, buracos e itens colecionáveis
        for (let obs of this.runnerObstacles) {
            ctx.save();

            if (obs.isHole) {
                ctx.fillStyle = 'rgba(8, 10, 18, 0.92)';
                ctx.beginPath();
                ctx.ellipse(obs.x + obs.w / 2, groundY + 14, obs.w * 0.48, 12, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(35, 52, 70, 0.9)';
                ctx.beginPath();
                ctx.ellipse(obs.x + obs.w / 2, groundY + 12, obs.w * 0.37, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.fillRect(obs.x + obs.w * 0.18, groundY + 16, obs.w * 0.64, 8);
                ctx.font = 'bold 10px "Segoe UI", Arial';
                ctx.fillStyle = '#dfe6f0';
                ctx.textAlign = 'center';
                ctx.fillText('BURACO', obs.x + obs.w / 2, groundY - 6);
                ctx.restore();
                continue;
            }

            if (obs.isFlying) {
                const wingLift = Math.sin(Date.now() / 90) * 5;
                ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
                ctx.fillStyle = '#39495e';
                ctx.beginPath();
                ctx.ellipse(0, 2, 14, 9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(-3, -7 + wingLift, 12, 5, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(11, -3, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f4a261';
                ctx.beginPath();
                ctx.moveTo(17, -4);
                ctx.lineTo(24, -1);
                ctx.lineTo(17, 1);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(13, -5, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                continue;
            }

            // Sombra oval no solo sob o obstáculo
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.w / 2, groundY, obs.w * 0.45, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Brilho suave
            ctx.fillStyle = 'rgba(255, 235, 59, 0.18)';
            ctx.beginPath();
            ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w * 0.62, 0, Math.PI * 2);
            ctx.fill();

            if (obs.isCollectible) {
                sprites.draw(ctx, obs.type, obs.x, obs.y, obs.w, obs.h, false);
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 10px "Segoe UI", Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`+${obs.points}`, obs.x + obs.w / 2, obs.y - 8);
            } else {
                sprites.draw(ctx, obs.type, obs.x, obs.y, obs.w, obs.h, false);
                ctx.font = 'bold 11px "Segoe UI", Arial';
                ctx.fillStyle = '#fffae6';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText(obs.name, obs.x + obs.w / 2, obs.y - 6);
            }

            ctx.restore();
        }

        // 4. Coelho companheiro correndo ao lado do jogador
        this.renderBunny(ctx);

        // 5. Jogador correndo e saltando
        this.renderPlayer(ctx);

        // 6. Partículas e Pétalas
        particles.draw(ctx, 0);

        // 7. Placar da Corrida estilo Chrome Dino no topo
        this.renderRunnerHud(ctx);

        // 8. Atmosfera noturna
        this.renderAtmosphereFilter(ctx);
    }

    renderRunnerHud(ctx) {
        const scoreStr = String(this.runnerScore).padStart(5, '0');
        const targetStr = String(this.runnerTargetScore).padStart(5, '0');
        const speedMultiplier = (this.runnerSpeed / this.runnerBaseSpeed).toFixed(2);
        const speedStr = `${speedMultiplier}x`;

        ctx.save();
        // Painel estilo Arcade / Chrome Dino
        const hudW = 280;
        const hudH = 50;
        const hudX = this.canvas.width - hudW - 20;
        const hudY = 16;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(hudX, hudY, hudW, hudH, 8);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pontuação Digital
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(`PONTOS: ${scoreStr}`, hudX + 14, hudY + 24);

        // Meta e Velocidade
        ctx.font = 'bold 12px "Segoe UI", Arial';
        ctx.fillStyle = '#ffd54f';
        ctx.fillText(`META: ${targetStr} PTS  ⚡ ${speedStr}x`, hudX + 14, hudY + 42);

        // Barra de progresso para a meta da fase
        const barW = hudW - 28;
        const barH = 4;
        const pct = Math.min(1, this.runnerScore / this.runnerTargetScore);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(hudX + 14, hudY + hudH - 6, barW, barH);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(hudX + 14, hudY + hudH - 6, barW * pct, barH);

        ctx.restore();
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.currentLevel) return;

        if (this.isSurf) {
            this.renderSurf(ctx);
            return;
        }

        if (this.isRunner) {
            this.renderRunner(ctx);
            return;
        }

        this.renderBackground(ctx);
        this.renderPlatforms(ctx);
        this.renderPuzzleElements(ctx);
        this.renderPortal(ctx);
        this.renderItems(ctx);
        this.renderObstacles(ctx);

        if (this.boss) this.renderBoss(ctx);

        this.renderPlayerProjectiles(ctx);
        this.renderBunny(ctx);
        this.renderPlayer(ctx);
        particles.draw(ctx, this.cameraX);

        if (this.boss) this.renderBossHud(ctx);

        this.renderAtmosphereFilter(ctx);
    }

    renderBackground(ctx) {
        const bgImg = sprites.get(this.currentLevel.bgKey);
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            const parallaxX = (this.cameraX * 0.35) % this.canvas.width;
            ctx.drawImage(bgImg, -parallaxX, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(bgImg, this.canvas.width - parallaxX, 0, this.canvas.width, this.canvas.height);
        } else {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            skyGrad.addColorStop(0, '#1c3144');
            skyGrad.addColorStop(0.7, '#3f5e78');
            skyGrad.addColorStop(1, '#d0a933');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    renderAtmosphereFilter(ctx) {
        ctx.save();

        if (this.currentLevel && this.currentLevel.id === 1) {
            ctx.restore();
            return;
        }

        if (this.hope < 50) {
            const coldAlpha = (50 - this.hope) / 50 * 0.22;
            ctx.fillStyle = `rgba(40, 55, 75, ${coldAlpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            const warmAlpha = (this.hope - 50) / 50 * 0.12;
            ctx.fillStyle = `rgba(255, 220, 100, ${warmAlpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        ctx.restore();
    }

    renderPlatforms(ctx) {
        const terrainImg = sprites.get('terreno');
        const platImg = sprites.get('plataformas');

        for (let plat of this.platforms) {
            const screenX = plat.x - this.cameraX;
            if (screenX + plat.w < 0 || screenX > this.canvas.width) continue;

            ctx.save();

            // PLATAFORMA INVISÍVEL (FASE 6)
            if (plat.invisible) {
                if (plat.lightTimer > 0) {
                    // Revelada com brilho dourado etéreo
                    const alpha = Math.min(1.0, plat.lightTimer / 1.0);
                    ctx.globalAlpha = alpha * 0.9;

                    // Gradiente de luz dourada
                    const grad = ctx.createLinearGradient(screenX, plat.y, screenX, plat.y + plat.h);
                    grad.addColorStop(0, '#fff59d');
                    grad.addColorStop(1, '#fbc02d');
                    ctx.fillStyle = grad;

                    ctx.beginPath();
                    ctx.roundRect(screenX, plat.y, plat.w, plat.h, 6);
                    ctx.fill();

                    // Borda resplandecente
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#fff9c4';
                    ctx.stroke();

                    // Partículas de poeira dourada flutuando sobre a plataforma
                    ctx.fillStyle = '#fffde7';
                    ctx.fillRect(screenX + (Date.now() / 8) % plat.w, plat.y - 2, 4, 4);
                } else {
                    // Faint hint estelar sutil quando apagada
                    ctx.globalAlpha = 0.25;
                    ctx.fillStyle = '#ffe082';
                    for (let px = 10; px < plat.w; px += 25) {
                        ctx.beginPath();
                        ctx.arc(screenX + px, plat.y + 4, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
                continue;
            }

            const isGround = plat.y >= 450;

            if (isGround) {
                // CHÃO BASE — textura chao.png
                if (terrainImg && terrainImg.complete && terrainImg.naturalWidth > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(screenX, plat.y, plat.w, plat.h);
                    ctx.clip();

                    const tileW = 280;
                    const tileH = plat.h;
                    const startTile = Math.floor(plat.x / tileW);
                    const endTile = Math.ceil((plat.x + plat.w) / tileW);

                    for (let t = startTile; t <= endTile; t++) {
                        const drawTileX = t * tileW - this.cameraX;
                        ctx.drawImage(terrainImg, 0, 0, terrainImg.naturalWidth, terrainImg.naturalHeight, drawTileX, plat.y, tileW, tileH);
                    }
                    ctx.restore();
                } else {
                    // Fallback caso chao.png não carregue
                    ctx.fillStyle = '#4e342e';
                    ctx.fillRect(screenX, plat.y, plat.w, plat.h);
                }
            } else {
                // PLATAFORMAS ELEVADAS
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.beginPath();
                ctx.roundRect(screenX + 4, plat.y + 4, plat.w - 8, plat.h, 6);
                ctx.fill();

                if (platImg && platImg.complete && platImg.naturalWidth > 0) {
                    ctx.drawImage(platImg, screenX, plat.y - 2, plat.w, plat.h + 4);
                } else {
                    ctx.fillStyle = '#4e342e';
                    ctx.beginPath();
                    ctx.roundRect(screenX, plat.y, plat.w, plat.h, 6);
                    ctx.fill();

                    ctx.fillStyle = '#8bc34a';
                    ctx.fillRect(screenX + 2, plat.y, plat.w - 4, 4);
                }
                ctx.restore();
            }
            ctx.restore();
        }
    }

    renderPuzzleElements(ctx) {
        // Renderizar Placas de Pressão (Fase 5)
        for (let plate of this.pressurePlates) {
            const screenX = plate.x - this.cameraX;
            if (screenX + plate.w < 0 || screenX > this.canvas.width) continue;

            ctx.save();
            const yOffset = plate.isPressed ? 4 : 0; // Afunda suavemente quando pressionada
            ctx.fillStyle = plate.isPressed ? '#ffd54f' : '#78909c';
            ctx.strokeStyle = plate.isPressed ? '#ffecb3' : '#37474f';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(screenX, plate.y + yOffset, plate.w, plate.h - yOffset, 3);
            ctx.fill();
            ctx.stroke();

            // Brilho dourado se estiver pressionada
            if (plate.isPressed) {
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#fff9c4';
                ctx.fillRect(screenX + 6, plate.y + yOffset + 2, plate.w - 12, 3);
            }

            // Rótulo da placa
            ctx.font = '10px "Segoe UI", Arial';
            ctx.fillStyle = '#cfd8dc';
            ctx.textAlign = 'center';
            ctx.fillText(plate.label || 'Botão', screenX + plate.w / 2, plate.y - 4);
            ctx.restore();
        }

        // Renderizar Barreiras de Energia (Fase 5)
        for (let barrier of this.barriers) {
            const screenX = barrier.x - this.cameraX;
            if (screenX + barrier.w < 0 || screenX > this.canvas.width) continue;

            ctx.save();
            if (!barrier.isOpen) {
                // Fechada: feixe de laser/energia mística
                const grad = ctx.createLinearGradient(screenX, barrier.y, screenX + barrier.w, barrier.y);
                grad.addColorStop(0, barrier.color || '#9c27b0');
                grad.addColorStop(0.5, '#ffffff');
                grad.addColorStop(1, barrier.color || '#9c27b0');
                ctx.fillStyle = grad;

                ctx.shadowColor = barrier.color || '#9c27b0';
                ctx.shadowBlur = 14;
                ctx.fillRect(screenX, barrier.y, barrier.w, barrier.h);

                // Pulso de advertência
                ctx.font = 'bold 12px sans-serif';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.fillText('🔒', screenX + barrier.w / 2, barrier.y + barrier.h / 2);
            } else {
                // Aberta: linhas translúcidas de energia desativada
                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = barrier.color || '#9c27b0';
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(screenX, barrier.y, barrier.w, barrier.h);
            }
            ctx.restore();
        }

        // Renderizar Altares da Chama da Vida (Fase 6)
        for (let shrine of this.shrines) {
            const screenX = shrine.x - this.cameraX;
            if (screenX + shrine.w < 0 || screenX > this.canvas.width) continue;

            ctx.save();
            // Pedestal de pedra
            ctx.fillStyle = '#455a64';
            ctx.beginPath();
            ctx.roundRect(screenX, shrine.y + 20, shrine.w, shrine.h - 20, 4);
            ctx.fill();

            if (shrine.isLit) {
                // Chama dourada viva ardente!
                const flameY = shrine.y + Math.sin(Date.now() * 0.01) * 3;
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔥', screenX + shrine.w / 2, flameY + 15);

                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 15;
                ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
                ctx.beginPath();
                ctx.arc(screenX + shrine.w / 2, shrine.y + 10, 25, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Altar apagado aguardando luz
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🕯️', screenX + shrine.w / 2, shrine.y + 18);
            }

            ctx.font = 'bold 10px "Segoe UI", Arial';
            ctx.fillStyle = shrine.isLit ? '#ffd54f' : '#90a4ae';
            ctx.textAlign = 'center';
            ctx.fillText(shrine.name, screenX + shrine.w / 2, shrine.y + shrine.h + 12);
            ctx.restore();
        }
    }

    renderPortal(ctx) {
        if (!this.currentLevel) return;
        const screenX = this.currentLevel.portalX - this.cameraX;
        const groundY = this.currentLevel.groundY;

        ctx.save();
        const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;

        // Verificar se portal está trancado
        let isLocked = false;
        let lockText = 'PORTAL DA ESPERANÇA';

        if (this.currentLevel.id === 5 && this.keysCollected < this.currentLevel.requiredKeys) {
            isLocked = true;
            lockText = `TRANCADO (${this.keysCollected}/3)`;
        } else if (this.currentLevel.id === 6 && this.shrinesLit < this.currentLevel.requiredShrines) {
            isLocked = true;
            lockText = `ACENDA AS 3 CHAMAS (${this.shrinesLit}/3)`;
        }

        const portalColor = isLocked ? 'rgba(158, 158, 158,' : 'rgba(255, 235, 59,';
        const gradient = ctx.createRadialGradient(screenX + 35, groundY - 45, 10, screenX + 35, groundY - 45, 65);
        gradient.addColorStop(0, `${portalColor} ${0.7 + pulse * 0.3})`);
        gradient.addColorStop(0.6, `${portalColor} ${0.3 + pulse * 0.2})`);
        gradient.addColorStop(1, `${portalColor} 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX + 35, groundY - 45, 65, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isLocked ? '🔒' : '🌻', screenX + 35, groundY - 20);

        ctx.font = 'bold 12px "Segoe UI", Arial';
        ctx.fillStyle = isLocked ? '#cfd8dc' : '#fffae6';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(lockText, screenX + 35, groundY - 75);
        ctx.restore();
    }

    renderItems(ctx) {
        const time = Date.now() * 0.004;
        for (let it of this.items) {
            const screenX = it.x - this.cameraX;
            if (screenX + 40 < 0 || screenX > this.canvas.width) continue;

            const hoverY = it.y + Math.sin(time + it.x * 0.05) * 4;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 235, 59, 0.25)';
            ctx.beginPath();
            ctx.arc(screenX + 16, hoverY + 16, 20, 0, Math.PI * 2);
            ctx.fill();

            sprites.draw(ctx, it.type, screenX, hoverY, 32, 32);
            ctx.restore();
        }
    }

    renderObstacles(ctx) {
        for (let obs of this.obstacles) {
            const screenX = obs.x - this.cameraX;
            if (screenX + obs.w < 0 || screenX > this.canvas.width) continue;

            const drawY = obs.y + (obs.hoverOffset || 0);

            ctx.save();
            ctx.fillStyle = 'rgba(156, 136, 255, 0.18)';
            ctx.beginPath();
            ctx.arc(screenX + obs.w / 2, drawY + obs.h / 2, obs.w * 0.6, 0, Math.PI * 2);
            ctx.fill();

            const flip = obs.vx < 0;
            const visualScale = 0.65;
            const visualW = obs.w * visualScale;
            const visualH = obs.h * visualScale;
            const visualX = screenX + (obs.w - visualW) / 2;
            const visualY = drawY + obs.h - visualH;
            sprites.draw(ctx, obs.type, visualX, visualY, visualW, visualH, flip);

            ctx.font = 'bold 11px "Segoe UI", Arial';
            ctx.fillStyle = '#dcdde1';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 3;
            ctx.fillText(obs.name, screenX + obs.w / 2, drawY - 6);
            ctx.restore();
        }
    }


    renderBunny(ctx) {
        const b = this.bunny;
        const screenX = this.isRunner ? b.x : b.x - this.cameraX;

        ctx.save();
        let spriteKey = 'bunny_idle';
        let flip = b.facing === -1;

        const frame = (prefix, count, interval) => {
            const frameIndex = Math.floor(Date.now() / interval) % count;
            return `${prefix}${frameIndex + 1}`;
        };

        if (this.isRunner && b.isGrounded) {
            spriteKey = frame('bunny_walk', 6, 120);
        } else if (!b.isGrounded) {
            spriteKey = (Math.floor(Date.now() / 110) % 2 === 0) ? 'bunny_jump2' : 'bunny_jump3';
            flip = b.vx * b.facing <= 0 ? false : b.facing === -1;
        } else if (Math.abs(b.vx) > 0.3) {
            spriteKey = frame('bunny_walk', 6, 120);
            flip = b.facing === -1;
        } else {
            spriteKey = frame('bunny_front', 6, 170);
        }

        const drawW = 60;
        const drawH = 64;
        sprites.draw(ctx, spriteKey, screenX, b.y, drawW, drawH, flip);

        // Indicador quando está esperando no local / botão
        if (b.isWaiting) {
            ctx.font = 'bold 11px "Segoe UI", Arial';
            ctx.fillStyle = '#ff80ab';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 3;
            ctx.fillText('Esperando [F]', screenX + b.w / 2, b.y - 6);
        } else if (b.eatTimer > 2.2 && Math.floor(Date.now() / 600) % 2 === 0) {
            ctx.font = '12px sans-serif';
            ctx.fillText('💛', screenX + b.w / 2 - 6, b.y - 4);
        }

        ctx.restore();
    }

    renderPlayer(ctx) {
        const p = this.player;
        const screenX = this.isRunner ? p.x : p.x - this.cameraX;

        ctx.save();

        // Sprite de dano: pisca translúcido quando invulnerável
        const blinking = p.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0;
        if (blinking) ctx.globalAlpha = 0.4;

        let spriteKey = 'player_idle';
        let flip = false;
        const frame = (prefix, count, interval) => {
            const frameIndex = Math.floor(Date.now() / interval) % count;
            return `${prefix}${frameIndex + 1}`;
        };

        const isMoving = this.isRunner || Math.abs(p.vx) > 0.15;
        const isJumping = p.vy < -1.5;
        const isFalling = p.vy > 1.5;

        // Prioridade: game over > ataque > dano > agachar > aterrissagem > salto > corrida > parado
        if (this.state === 'GAME_OVER') {
            spriteKey = frame('player_death', 3, 180);
            flip = p.facing === -1;
        } else if (p.isAttacking) {
            spriteKey = frame('player_attack', 3, 90);
            flip = (p.facing === -1);
        } else if (p.isInvulnerable) {
            spriteKey = frame('player_damage', 3, 100);
            flip = (p.facing === -1);
        } else if (p.isCrouching && p.isGrounded) {
            spriteKey = 'player_land4';
            flip = p.facing === -1;
        } else if (p.facing === 1) {
            if (p.landingTimer > 0) {
                spriteKey = frame('player_land', 6, 55);
            } else if (isJumping || isFalling) {
                const shortJump = p.jumpCount > 1;
                spriteKey = shortJump
                    ? frame('player_short_jump', 4, 90)
                    : frame('player_jump', 5, 90);
                flip = false;
            } else if (isMoving) {
                const frameInterval = this.isRunner ? Math.max(65, 105 - (this.runnerSpeed - 3) * 8) : 105;
                spriteKey = frame('player_run_right', 8, frameInterval);
                flip = false;
            } else {
                spriteKey = frame('player_idle_front', 6, 180);
                flip = false;
            }
        } else {
            if (p.landingTimer > 0) {
                spriteKey = frame('player_land', 6, 55);
                flip = true;
            } else if (isJumping || isFalling) {
                const shortJump = p.jumpCount > 1;
                spriteKey = shortJump
                    ? frame('player_short_jump', 4, 90)
                    : frame('player_jump', 5, 90);
                flip = true;
            } else if (isMoving) {
                const frameInterval = this.isRunner ? Math.max(65, 105 - (this.runnerSpeed - 3) * 8) : 105;
                spriteKey = frame('player_run_left', 8, frameInterval);
                flip = false;
            } else {
                spriteKey = frame('player_idle_front', 6, 180);
                flip = true;
            }
        }

        const spriteOffsetY = 6;
        sprites.draw(ctx, spriteKey, screenX, p.y + spriteOffsetY, p.w, p.h, flip);
        ctx.restore();
    }

    // =========================================================================
    // MECÂNICAS DO CHEFE FINAL (FASE 7 - CUPHEAD STYLE)
    // =========================================================================
    updateBoss() {
        const boss = this.boss;
        if (!boss) return;

        // A posição do Boss permanece fixa; apenas o desenho recebe animação de idle.
        boss.x = boss.baseX;
        boss.y = boss.baseY + (boss.shakeY || 0);

        // Temporizador de flash ao ser atingido pela Onda de Luz
        if (boss.flashTimer > 0) {
            boss.flashTimer -= 0.016;
            if (boss.flashTimer < 0) boss.flashTimer = 0;
        }

        // Se o Boss foi curado / superado
        if (boss.state === 'DEFEATED') {
            if (Math.random() < 0.22) {
                particles.emitSunflowerBloom(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h);
            }
            return;
        }

        // Temporizador de ataques estilo Cuphead
        boss.attackCooldown -= 0.016;

        if (boss.state === 'TELEGRAPH_SLAM') {
            boss.attackTimer -= 0.016;
            boss.shakeY = -35; // sobe avisando o impacto
            if (boss.attackTimer <= 0) {
                // Slam no chão!
                boss.shakeY = 0;
                boss.state = 'IDLE';
                boss.attackCooldown = 3.2;
                audio.playJump();
                particles.emitSparks(boss.x + 40, 460, 25, '#9c27b0');
                this.bossShockwaves.push({
                    x: boss.x - 20,
                    y: 435,
                    w: 32,
                    h: 25,
                    vx: -4.2
                });
                this.showPhraseBanner("⚠️ Suba nas plataformas para pular a onda de choque!");
            }
            return;
        }

        if (boss.state === 'TELEGRAPH_SHOOT') {
            boss.attackTimer -= 0.016;
            if (boss.attackTimer <= 0) {
                boss.state = 'IDLE';
                boss.attackCooldown = 2.8;
                audio.playWave();
                // Dispara 2 esferas de sombra em alturas diferentes
                this.bossProjectiles.push(
                    { x: boss.x - 10, y: 390, vx: -3.8, radius: 18, color: '#7b2cbf' },
                    { x: boss.x - 30, y: 280, vx: -3.0, radius: 16, color: '#ba68c8' }
                );
                particles.emitSparks(boss.x - 10, 390, 12, '#ba68c8');
            }
            return;
        }

        if (boss.attackCooldown <= 0) {
            const roll = Math.random();
            if (roll < 0.45) {
                // Ataque 1: Disparo de Esferas de Sombra
                boss.state = 'TELEGRAPH_SHOOT';
                boss.attackTimer = 0.65;
            } else if (roll < 0.80) {
                // Ataque 2: Pancada no Chão (Slam)
                boss.state = 'TELEGRAPH_SLAM';
                boss.attackTimer = 0.85;
            } else {
                // Ataque 3: Minion da Insegurança
                boss.attackCooldown = 3.4;
                audio.playWave();
                this.obstacles.push({
                    type: 'obs_isolamento',
                    name: 'Dúvida Rastejante',
                    x: boss.x - 20,
                    y: 412,
                    w: 50,
                    h: 55,
                    vx: -0.35,
                    minX: 40,
                    maxX: boss.x - 10
                });
                particles.emitSparks(boss.x - 20, 412, 10, '#ba68c8');
            }
        }
    }

    getBossProfileKey() {
        const boss = this.boss;
        if (!boss || boss.state === 'DEFEATED') return 'boss_perfil_3';

        if (boss.hp > boss.maxHp * 0.67) return 'boss_perfil_1';
        if (boss.hp > boss.maxHp * 0.34) return 'boss_perfil_2';
        return 'boss_perfil_3';
    }

    getBossDamageKey() {
        const boss = this.boss;
        if (!boss || boss.state === 'DEFEATED') return 'boss_dano_3';

        if (boss.hp > boss.maxHp * 0.67) return 'boss_dano_1';
        if (boss.hp > boss.maxHp * 0.34) return 'boss_dano_2';
        return 'boss_dano_3';
    }

    damageBoss(amount = 1) {
        const boss = this.boss;
        if (!boss || boss.state === 'DEFEATED') return;

        boss.hp -= amount;
        boss.flashTimer = 0.25;
        boss.lastHitProfile = this.getBossDamageKey();
        audio.playHeal();
        particles.emitSunflowerBloom(boss.x + boss.w / 2, boss.y + boss.h / 2);
        particles.emitText(boss.x + boss.w / 2, boss.y - 12, '💛 Acolhimento!', '#ffd700');
        this.addHope(12);

        if (boss.hp <= 0) {
            boss.hp = 0;
            boss.state = 'DEFEATED';
            audio.playLevelComplete();
            particles.emitSparks(boss.x + boss.w / 2, boss.y + boss.h / 2, 40, '#ffd700');
            this.showPhraseBanner("✨ A Grande Sombra foi iluminada e transformada em acolhimento!");
            if (this.currentLevel) {
                this.currentLevel.portalX = 440;
            }
            if (typeof achievements !== 'undefined') {
                achievements.unlock('victory');
            }
        }
    }

    updatePlayerProjectiles() {
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const proj = this.playerProjectiles[i];
            proj.x += proj.vx;
            proj.life -= 0.016;

            if (Math.random() < 0.4) {
                particles.emitSparks(proj.x, proj.y, 2, '#fff59d');
            }

            // Acertou o Boss
            if (this.boss && this.boss.state !== 'DEFEATED') {
                const b = this.boss;
                if (proj.x > b.x && proj.x < b.x + b.w && proj.y > b.y && proj.y < b.y + b.h) {
                    this.damageBoss(1);
                    this.playerProjectiles.splice(i, 1);
                    continue;
                }
            }

            // Acertou obstáculos normais
            for (let j = this.obstacles.length - 1; j >= 0; j--) {
                const obs = this.obstacles[j];
                if (proj.x > obs.x && proj.x < obs.x + obs.w && proj.y > obs.y && proj.y < obs.y + obs.h) {
                    audio.playHeal();
                    particles.emitSunflowerBloom(obs.x + obs.w / 2, obs.y + obs.h);
                    this.obstacles.splice(j, 1);
                    this.score += 60;
                    this.playerProjectiles.splice(i, 1);
                    break;
                }
            }

            if (proj.life <= 0 || proj.x < -50 || proj.x > 1200) {
                this.playerProjectiles.splice(i, 1);
            }
        }
    }

    updateBossAttacks() {
        const p = this.player;

        // 1. Projéteis de Sombra do Boss
        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const bp = this.bossProjectiles[i];
            bp.x += bp.vx;

            if (Math.random() < 0.3) {
                particles.emitSparks(bp.x, bp.y, 2, '#7b2cbf');
            }

            // Dano no Jogador
            const dist = Math.hypot((p.x + p.w / 2) - bp.x, (p.y + p.h / 2) - bp.y);
            if (dist < bp.radius + p.w / 2) {
                this.playerTakeDamage(null);
                this.bossProjectiles.splice(i, 1);
                continue;
            }

            if (bp.x < -50) {
                this.bossProjectiles.splice(i, 1);
            }
        }

        // 2. Onda de Choque no Chão
        for (let i = this.bossShockwaves.length - 1; i >= 0; i--) {
            const sw = this.bossShockwaves[i];
            sw.x += sw.vx;

            // Dano apenas se o jogador estiver no chão
            if (p.x + p.w > sw.x && p.x < sw.x + sw.w && p.y + p.h >= sw.y) {
                this.playerTakeDamage(null);
                particles.emitSparks(p.x + p.w / 2, p.y + p.h, 10, '#d500f9');
            }

            if (sw.x < -60) {
                this.bossShockwaves.splice(i, 1);
            }
        }
    }

    renderPlayerProjectiles(ctx) {
        for (let proj of this.playerProjectiles) {
            const screenX = proj.x - this.cameraX;
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fff59d';
            ctx.beginPath();
            ctx.arc(screenX, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(screenX, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    renderBoss(ctx) {
        const boss = this.boss;
        if (!boss) return;
        const screenX = boss.x - this.cameraX;
        const idleTime = Date.now() * BOSS_IDLE_SPEED + boss.movePhase;
        const idleBob = Math.sin(idleTime * 1.7) * BOSS_IDLE_BOB;
        const idleTilt = Math.sin(idleTime) * BOSS_IDLE_TILT;
        const flamePulse = Math.sin(idleTime * 2.4) * BOSS_FLAME_SCALE;

        ctx.save();

        // Sombra no chão
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(screenX + boss.w / 2, 460, boss.w * 0.45, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Alerta de Telegrafia estilo Cuphead (!)
        if (boss.state === 'TELEGRAPH_SLAM' || boss.state === 'TELEGRAPH_SHOOT') {
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffdd00';
            ctx.shadowColor = '#d90429';
            ctx.shadowBlur = 12;
            ctx.fillText('⚠️', screenX + boss.w / 2, boss.y - 20);
        }

        if (boss.state === 'DEFEATED') {
            ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(screenX + boss.w / 2, boss.y + boss.h / 2, boss.w * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '90px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🌻', screenX + boss.w / 2, boss.y + boss.h / 2 + 35);
        } else {
            const idleFrames = ['boss_perfil_1', 'boss_perfil_2', 'boss_perfil_3'];
            const idleFrame = Math.floor((idleTime / 1.1 + flamePulse) % idleFrames.length);
            const profileKey = idleFrames[idleFrame];
            const damageKey = this.getBossDamageKey();
            const profileImg = sprites.get(profileKey);
            const damageImg = sprites.get(damageKey);

            ctx.save();
            ctx.translate(screenX + boss.w / 2, boss.y + boss.h / 2 + idleBob);
            ctx.rotate(idleTilt);

            if (damageImg && damageImg.complete && damageImg.naturalWidth > 0 && boss.flashTimer > 0) {
                sprites.draw(ctx, damageKey, -boss.w / 2, -boss.h / 2, boss.w, boss.h, false);
            } else if (profileImg && profileImg.complete && profileImg.naturalWidth > 0) {
                sprites.draw(ctx, profileKey, -boss.w / 2, -boss.h / 2, boss.w, boss.h, false);
            } else {
                const spriteToUse = 'boss_shadow';
                sprites.draw(ctx, spriteToUse, -boss.w / 2, -boss.h / 2, boss.w, boss.h, false);
            }

            if (boss.flashTimer > 0) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
                ctx.fillRect(-boss.w / 2, -boss.h / 2, boss.w, boss.h);
            }
            ctx.restore();
        }

        ctx.restore();

        // Desenhar Projéteis de Sombra do Boss
        for (let bp of this.bossProjectiles) {
            const bpX = bp.x - this.cameraX;
            ctx.save();
            ctx.shadowColor = bp.color || '#7b2cbf';
            ctx.shadowBlur = 14;
            ctx.fillStyle = bp.color || '#7b2cbf';
            ctx.beginPath();
            ctx.arc(bpX, bp.y, bp.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#e0aaff';
            ctx.beginPath();
            ctx.arc(bpX, bp.y, bp.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Desenhar Onda de Choque no Chão
        for (let sw of this.bossShockwaves) {
            const swX = sw.x - this.cameraX;
            ctx.save();
            ctx.shadowColor = '#d500f9';
            ctx.shadowBlur = 12;
            const grad = ctx.createLinearGradient(swX, sw.y, swX + sw.w, sw.y + sw.h);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#d500f9');
            grad.addColorStop(1, '#4a148c');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(swX + sw.w, sw.y + sw.h);
            ctx.lineTo(swX, sw.y + sw.h);
            ctx.lineTo(swX + sw.w / 2, sw.y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    renderBossHud(ctx) {
        const boss = this.boss;
        if (!boss) return;

        const w = this.canvas.width;
        const barW = 380;
        const barH = 18;
        const barX = w / 2 - barW / 2;
        const barY = 16;

        ctx.save();

        // Moldura do Chefe
        ctx.fillStyle = 'rgba(15, 10, 25, 0.85)';
        ctx.roundRect(barX - 12, barY - 8, barW + 24, barH + 34, 10);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        const profileKey = this.getBossProfileKey();
        const profileImg = sprites.get(profileKey);
        if (profileImg && profileImg.complete && profileImg.naturalWidth > 0) {
            ctx.drawImage(profileImg, barX - 52, barY - 4, 44, 44);
        }

        // Título e Nome do Boss
        ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffd54f';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        const statusText = boss.state === 'DEFEATED' ? '✨ Acolhida com Esperança!' : `👾 ${boss.name} (${boss.hp}/${boss.maxHp})`;
        ctx.fillText(statusText, w / 2, barY + 10);

        // Barra de Vida
        const pct = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = '#311b92';
        ctx.fillRect(barX, barY + 16, barW, barH);

        const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        hpGrad.addColorStop(0, '#d500f9');
        hpGrad.addColorStop(0.5, '#ff4081');
        hpGrad.addColorStop(1, '#ffd700');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY + 16, barW * pct, barH);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY + 16, barW, barH);

        ctx.restore();
    }

    start() {
        let lastTime = performance.now();
        const timestep = 1000 / 60; // 16.666ms fixos por atualização de física (60fps garantidos)
        let accumulator = 0;

        const loop = (currentTime) => {
            try {
                if (!currentTime) currentTime = performance.now();
                let delta = currentTime - lastTime;
                lastTime = currentTime;

                // Evitar acúmulo anormal se o navegador for pausado ou aba perder foco
                if (delta > 250) delta = 250;
                accumulator += delta;

                // Executa updates exatamente na cadência fixa de 60Hz
                // Impede que telas de 120Hz, 144Hz, 165Hz ou 240Hz multipliquem a velocidade da física!
                while (accumulator >= timestep) {
                    this.update();
                    accumulator -= timestep;
                }

                this.render();
            } catch (err) {
                console.error("Erro no loop do jogo:", err);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Gerenciador imediato de modo (PC vs Tablet) antes mesmo do jogo instanciar
function applyControlModeUI(mode) {
    const isTablet = mode === 'tablet';
    const touchLayer = document.getElementById('touch-controls-layer');
    const btnPc = document.getElementById('btn-select-pc');
    const btnTab = document.getElementById('btn-select-tablet');
    const hintPc = document.getElementById('hint-pc');
    const hintTab = document.getElementById('hint-tablet');
    const btnToggle = document.getElementById('btn-mode-toggle');

    if (isTablet) {
        if (touchLayer) touchLayer.classList.remove('hidden');
        if (btnPc) btnPc.classList.remove('active');
        if (btnTab) btnTab.classList.add('active');
        if (hintPc) hintPc.classList.add('hidden');
        if (hintTab) hintTab.classList.remove('hidden');
        if (btnToggle) {
            btnToggle.textContent = '💻';
            btnToggle.title = 'Modo Tablet ativo. Toque para alternar para Teclado (PC)';
        }
    } else {
        if (touchLayer) touchLayer.classList.add('hidden');
        if (btnPc) btnPc.classList.add('active');
        if (btnTab) btnTab.classList.remove('active');
        if (hintPc) hintPc.classList.remove('hidden');
        if (hintTab) hintTab.classList.add('hidden');
        if (btnToggle) {
            btnToggle.textContent = '📱';
            btnToggle.title = 'Modo Computador ativo. Toque para alternar para Tablet (Botões na tela)';
        }
    }
}

let activeGameInstance = null;

function initGame() {
    // Determine initial control mode
    let savedMode = 'pc';
    try {
        savedMode = localStorage.getItem('girassois_control_mode');
    } catch (e) {}
    if (!savedMode || (savedMode !== 'pc' && savedMode !== 'tablet')) {
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        savedMode = isTouch ? 'tablet' : 'pc';
    }
    applyControlModeUI(savedMode);

    const btnPc = document.getElementById('btn-select-pc');
    const btnTab = document.getElementById('btn-select-tablet');
    if (btnPc) {
        btnPc.addEventListener('click', () => {
            try { localStorage.setItem('girassois_control_mode', 'pc'); } catch (e) {}
            applyControlModeUI('pc');
            if (activeGameInstance) activeGameInstance.setControlMode('pc', false);
        });
    }
    if (btnTab) {
        btnTab.addEventListener('click', () => {
            try { localStorage.setItem('girassois_control_mode', 'tablet'); } catch (e) {}
            applyControlModeUI('tablet');
            if (activeGameInstance) activeGameInstance.setControlMode('tablet', false);
        });
    }

    const loadingScreen = document.getElementById('modal-loading');
    const loadingBar = document.getElementById('loading-bar-fill');
    const loadingText = document.getElementById('loading-text');

    let gameInitialized = false;
    const launchGame = () => {
        if (gameInitialized) return;
        gameInitialized = true;
        if (loadingScreen) loadingScreen.classList.add('hidden');
        const startModal = document.getElementById('modal-start');
        if (startModal) startModal.classList.remove('hidden');
        activeGameInstance = new Game();
        activeGameInstance.start();
    };

    // Safety timeout to avoid permanent loading screen
    setTimeout(launchGame, 2500);

    // Load assets and start when ready
    sprites.loadAll(
        () => {
            launchGame();
        },
        (loaded, total) => {
            const pct = Math.round((loaded / total) * 100);
            if (loadingBar) loadingBar.style.width = `${pct}%`;
            if (loadingText) loadingText.textContent = `Carregando coelhinho e sentimentos... ${pct}%`;
        }
    );

    // Additional fallback after 5 seconds
    setTimeout(() => {
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
            launchGame();
        }
    }, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
