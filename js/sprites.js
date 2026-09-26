/**
 * SpriteManager - Carregador e Gerenciador de Recursos Visuais
 * Mapeia todos os assets relativos para fácil renderização no Canvas.
 */
class SpriteManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.isReady = false;

        // Lista de assets a carregar (caminhos relativos)
        this.assetManifest = {
            // Personagem — animações principais
            'player_idle': 'assets/personagem/idle.PNG',
            'player_idle_front1': 'assets/personagem/parado de frente 1.png',
            'player_idle_front2': 'assets/personagem/parado de frente 2.png',
            'player_idle_front3': 'assets/personagem/parado de frente 3.png',
            'player_idle_front4': 'assets/personagem/parado de frente 4.png',
            'player_idle_front5': 'assets/personagem/parado de frente 5.png',
            'player_idle_front6': 'assets/personagem/parado de frente 6.png',
            'player_run_right1': 'assets/personagem/correr para frente 1.png',
            'player_run_right2': 'assets/personagem/correr para frente 2.png',
            'player_run_right3': 'assets/personagem/correr para frente  3.png',
            'player_run_right4': 'assets/personagem/correr para frente 4.png',
            'player_run_right5': 'assets/personagem/correr para frente  5.png',
            'player_run_right6': 'assets/personagem/correr para frente 6.png',
            'player_run_right7': 'assets/personagem/correr para frente  7.png',
            'player_run_right8': 'assets/personagem/correr para frente  8.png',
            'player_run_left1': 'assets/personagem/correr para tras 1.png',
            'player_run_left2': 'assets/personagem/correr para tras 2.png',
            'player_run_left3': 'assets/personagem/correr para tras 3.png',
            'player_run_left4': 'assets/personagem/correr para tras 4.png',
            'player_run_left5': 'assets/personagem/correr para tras 5.png',
            'player_run_left6': 'assets/personagem/correr para tras 6.png',
            'player_run_left7': 'assets/personagem/correr para tras 7.png',
            'player_run_left8': 'assets/personagem/correr para tras 8.png',
            'player_jump1': 'assets/personagem/pular 1.png',
            'player_jump2': 'assets/personagem/pular 2.png',
            'player_jump3': 'assets/personagem/pular 3.png',
            'player_jump4': 'assets/personagem/pular 4.png',
            'player_jump5': 'assets/personagem/pular 5.png',
            'player_short_jump1': 'assets/personagem/pular curto 1.png',
            'player_short_jump2': 'assets/personagem/pular curto 2.png',
            'player_short_jump3': 'assets/personagem/pular curto 3.png',
            'player_short_jump4': 'assets/personagem/pular curto 4.png',
            'player_land1': 'assets/personagem/aterrisagem 1.png',
            'player_land2': 'assets/personagem/aterrisagem 2.png',
            'player_land3': 'assets/personagem/aterrisagem 3.png',
            'player_land4': 'assets/personagem/aterrisagem 4.png',
            'player_land5': 'assets/personagem/aterrisagem 5.png',
            'player_land6': 'assets/personagem/aterrisagem 6.png',
            'player_death1': 'assets/personagem/morte 1.png',
            'player_death2': 'assets/personagem/morte 2.png',
            'player_death3': 'assets/personagem/morte 3.png',
            'player_damage1': 'assets/personagem/dano 1.png',
            'player_damage2': 'assets/personagem/dano 2.png',
            'player_damage3': 'assets/personagem/dano 3.png',
            'player_attack1': 'assets/personagem/ataque 1.png',
            'player_attack2': 'assets/personagem/ataque 2.png',
            'player_attack3': 'assets/personagem/ataque 3.png',
            'player_attack4': 'assets/personagem/ataque 4.png',
            // Compatibilidade com estados antigos
            'player_walk_right': 'assets/personagem/walk_direita.PNG',
            'player_walk_left': 'assets/personagem/walk_esquerda.PNG',
            'player_walk_right2': 'assets/personagem/walk_direita 2.png',
            'player_walk_left2': 'assets/personagem/walk_esquerda2.png',
            'player_attack':      'assets/personagem/ataque.png',
            'player_damage':      'assets/personagem/dano.png',
            'player_jump':        'assets/personagem/jump.PNG',
            'player_fall':        'assets/personagem/fall.PNG',

            // Coelho de Apoio Emocional
            'bunny_idle':       'assets/animais/coelho 1.png',
            'bunny_walk1':      'assets/animais/coelho 1.png',
            'bunny_walk2':      'assets/animais/coelho 2.png',
            'bunny_walk3':      'assets/animais/coelho 3.png',
            'bunny_walk4':      'assets/animais/coelho 4.png',
            'bunny_walk5':      'assets/animais/coelho 5.png',
            'bunny_walk6':      'assets/animais/coelho 6.png',
            'bunny_front1':     'assets/animais/coelho 1.png',
            'bunny_front2':     'assets/animais/coelho 2.png',
            'bunny_front3':     'assets/animais/coelho 3.png',
            'bunny_front4':     'assets/animais/coelho 4.png',
            'bunny_front5':     'assets/animais/coelho 5.png',
            'bunny_front6':     'assets/animais/coelho 6.png',
            'bunny_jump2':      'assets/animais/coelho 2.png',
            'bunny_jump3':      'assets/animais/coelho 3.png',
            'bunny_jump_front': 'assets/animais/coelho 2.png',
            'bunny_jump_back':  'assets/animais/coelho 2.png',
            'bunny_eating':     'assets/animais/comendo.PNG',

            // Boss Final (Spritesheet Cuphead)
            'boss_shadow': 'assets/inimigos/boss_ciclo.png',
            'boss_aluno':  'assets/inimigos/boss_aluno.png',
            'boss_perfil_1': 'assets/inimigos/perfil boss 1.png',
            'boss_perfil_2': 'assets/inimigos/perfil boss 2.png',
            'boss_perfil_3': 'assets/inimigos/perfil boss 3.png',
            'boss_dano_1': 'assets/inimigos/dano boss 1.png',
            'boss_dano_2': 'assets/inimigos/dano boss 2.png',
            'boss_dano_3': 'assets/inimigos/dano boss 3.png',
            'boss_golpe_1': 'assets/inimigos/golpe boss 1.png',
            'boss_golpe_2': 'assets/inimigos/golpe boss 2.png',
            'boss_golpe_3': 'assets/inimigos/golpe boss 3.png',
            'boss_golpe_4': 'assets/inimigos/golpe boss 4.png',

            // Inimigos / Sintomas dos Transtornos
            'obs_isolamento':  'assets/inimigos/isolamento.png',
            'obs_humilhacao':  'assets/inimigos/humilhacao.png',
            'obs_controlador': 'assets/inimigos/controlador.png',
            'obs_financeiro':  'assets/inimigos/financeiro.png',
            'obs_abusador':    'assets/inimigos/abusador.png',
            'obs_boss_ciclo':  'assets/inimigos/boss_ciclo.png',
            'runner_obstacle1': 'assets/inimigos/obstaculos 1.png',
            'runner_obstacle2': 'assets/inimigos/obstaculos 2.png',
            'runner_obstacle3': 'assets/inimigos/obstaculos 3.png',
            'runner_obstacle4': 'assets/inimigos/obstaculos 4.png',
            'runner_obstacle5': 'assets/inimigos/obstaculos 5.png',
            'runner_obstacle6': 'assets/inimigos/obstaculos 6.png',
            'runner_obstacle7': 'assets/inimigos/obstaculos 7.png',
            'runner_obstacle8': 'assets/inimigos/obstaculos 8.png',
            'runner_obstacle9': 'assets/inimigos/obstaculos 9.png',

            // Itens de Empatia e Apoio
            'item_coracao':      'assets/itens/hud_coracao.png',
            'item_coracao_vazio':'assets/itens/hud_coracao_vazio.png',
            'item_dialogo':      'assets/itens/dialogo.png',
            'item_rede_apoio':   'assets/itens/rede_apoio.png',
            'item_chave':        'assets/itens/chave.png',
            'item_disco_180':    'assets/itens/disco_180.png',
            'item_disco_190':    'assets/itens/disco_190.png',
            'item_lei_maria':    'assets/itens/lei_maria_da_penha.png',
            'item_certidao':     'assets/itens/certidao.png',
            'item_documento_rg': 'assets/itens/documento_rg.png',
            'item_denuncia':     'assets/itens/denuncia.png',

            // Cenários das Fases (novos — 7 fundos)
            'bg_fase1': 'assets/cenarios/fase 1.png',
            'bg_fase2': 'assets/cenarios/fase 2.jfif',
            'bg_fase3': 'assets/cenarios/fase 3.jfif',
            'bg_fase4': 'assets/cenarios/fase 4.jfif',
            'bg_fase5': 'assets/cenarios/fase 5.jfif',
            'bg_fase6': 'assets/cenarios/fase 6.jpg',
            'bg_fase7': 'assets/cenarios/fase 7.jfif',

            // Terreno e Plataformas
            'terreno':    'assets/terreno/chao.png',
            'plataformas':'assets/terreno/plataformas.png'
        };
    }

    loadAll(onComplete, onProgress) {
        const keys = Object.keys(this.assetManifest);
        this.totalCount = keys.length;

        if (this.totalCount === 0) {
            this.isReady = true;
            if (onComplete) onComplete();
            return;
        }

        let loaded = 0;
        let completed = false;
        const finish = () => {
            if (completed) return;
            completed = true;
            this.isReady = true;
            if (onComplete) onComplete();
        };

        // Timeout de salvaguarda de 3 segundos para garantir que a tela inicial sempre abra
        setTimeout(finish, 3000);

        keys.forEach(key => {
            const img = new Image();
            const src = this.assetManifest[key];
            img.src = src;

            const markLoaded = () => {
                this.images[key] = img;
                loaded++;
                this.loadedCount = loaded;
                if (onProgress) onProgress(loaded, this.totalCount);
                if (loaded >= this.totalCount) {
                    finish();
                }
            };

            img.onload = markLoaded;
            img.onerror = () => {
                console.warn(`Aviso: Não foi possível carregar a imagem: ${src}. Usando fallback.`);
                markLoaded();
            };
        });
    }

    get(key) {
        return this.images[key];
    }

    draw(ctx, key, x, y, width, height, flipX = false) {
        const img = this.images[key];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            if (flipX) {
                ctx.translate(x + width, y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, width, height);
            } else {
                ctx.drawImage(img, x, y, width, height);
            }
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(x, y, width, height);
            ctx.restore();
        }
    }
}

const sprites = new SpriteManager();
