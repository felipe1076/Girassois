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
            'remo_1': 'assets/personagem/remo_1.png',
            'remo_2': 'assets/personagem/remo_2.png',
            'remo_3': 'assets/personagem/remo_3.png',
            'remo_4': 'assets/personagem/remo_4.png',
            'remo_5': 'assets/personagem/remo_5.png',
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
            'bunny_idle':       'assets/animais/parado_1.png',
            'bunny_idle1':      'assets/animais/parado_1.png',
            'bunny_idle2':      'assets/animais/parado_2.png',
            'bunny_idle3':      'assets/animais/parado_3.png',
            'bunny_walk1':      'assets/animais/frente_1.png',
            'bunny_walk2':      'assets/animais/frente_2.png',
            'bunny_walk3':      'assets/animais/frente_3.png',
            'bunny_front1':     'assets/animais/parado_1.png',
            'bunny_front2':     'assets/animais/parado_2.png',
            'bunny_front3':     'assets/animais/parado_3.png',
            'bunny_jump1':      'assets/animais/pulo_1.png',
            'bunny_jump2':      'assets/animais/pulo_2.png',
            'bunny_jump3':      'assets/animais/pulo_3.png',
            'bunny_jump_front': 'assets/animais/pulo_2.png',
            'bunny_jump_back':  'assets/animais/pulo_2.png',
            'bunny_eating':     'assets/animais/comendo.PNG',

            // Boss Final (Spritesheet Cuphead)
            'boss_shadow': 'assets/inimigos/boss_ciclo.png',
            'boss_aluno':  'assets/inimigos/boss_aluno.png',
            'boss_perfil_1': 'assets/inimigos/perfil boss 1.png',
            'boss_perfil_2': 'assets/inimigos/perfil boss 2.png',
            'boss_perfil_3': 'assets/inimigos/perfil boss 3.png',
            'boss_helper_1': 'assets/inimigos/ajudante_do_boss_final_1.png',
            'boss_helper_2': 'assets/inimigos/ajudante_do_boss_final_2.png',
            'boss_dano_1': 'assets/inimigos/dano boss 1.png',
            'boss_dano_2': 'assets/inimigos/dano boss 2.png',
            'boss_dano_3': 'assets/inimigos/dano boss 3.png',
            'boss_golpe_1': 'assets/inimigos/golpe boss 1.png',
            'boss_golpe_2': 'assets/inimigos/golpe boss 2.png',
            'boss_golpe_3': 'assets/inimigos/golpe boss 3.png',
            'boss_golpe_4': 'assets/inimigos/golpe boss 4.png',
            'narciso_perfil_1': 'assets/inimigos/narci_perfil_1.png',
            'narciso_perfil_2': 'assets/inimigos/narci_perfil_2.png',
            'narciso_perfil_3': 'assets/inimigos/narci_perfil_3.png',
            'narciso_perfil_4': 'assets/inimigos/narci_perfil_4.png',
            'narciso_perfil_5': 'assets/inimigos/narci_perfil_5.png',
            'narciso_perfil_6': 'assets/inimigos/narci_perfil_6.png',
            'narciso_dano_1': 'assets/inimigos/narciso_dano_1.png',
            'narciso_dano_2': 'assets/inimigos/narciso_dano_2.png',

            // Inimigos / Sintomas dos Transtornos
            'obs_isolamento':  'assets/inimigos/isolamento.png',
            'obs_humilhacao':  'assets/inimigos/humilhacao.png',
            'obs_controlador': 'assets/inimigos/controlador.png',
            'obs_financeiro':  'assets/inimigos/financeiro.png',
            'obs_abusador':    'assets/inimigos/abusador.png',
            'polvo_1': 'assets/inimigos/polvo_1.png',
            'polvo_2': 'assets/inimigos/polvo_2.png',
            'gosma_1': 'assets/inimigos/gosma_1.png',
            'gosma_2': 'assets/inimigos/gosma_2.png',
            'menina_1': 'assets/inimigos/menina_1.png',
            'menina_2': 'assets/inimigos/menina_2.png',
            'obs_fantasma_tristeza_1': 'assets/inimigos/fantasma_tristeza_1.png',
            'obs_fantasma_tristeza_2': 'assets/inimigos/fantasma_tristeza_2.png',
            'obs_fantasma_tristeza_3': 'assets/inimigos/fantasma_tristeza_3.png',
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
            'sombra_1': 'assets/inimigos/sombra1.png',
            'sombra_2': 'assets/inimigos/sombra2.png',
            'sombra_3': 'assets/inimigos/sombra3.png',
            'sombra_4': 'assets/inimigos/sombra4.png',
            'sombra_5': 'assets/inimigos/sombra5.png',
            'sombra_6': 'assets/inimigos/sombra6.png',
            'sombra_7': 'assets/inimigos/sombra7.png',
            'sombra_8': 'assets/inimigos/sombra8.png',

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
            'portal_fechado':    'assets/itens/porta_fechada.png',
            'portal_aberto':     'assets/itens/porta_aberta.png',

            // Cenários das Fases (novos — 7 fundos)
            'bg_fase1': 'assets/cenarios/fase 1.png',
            'bg_fase2': 'assets/cenarios/fase 2.png',
            'bg_fase3': 'assets/cenarios/fase 3.jfif',
            'bg_fase4': 'assets/cenarios/fase 4.jfif',
            'bg_fase5': 'assets/cenarios/fase 5.jfif',
            'bg_fase6': 'assets/cenarios/fase 6.png',
            'bg_fase7': 'assets/cenarios/fase 7.png',
            'fase_do_narcisio': 'assets/cenarios/fase_do_narcisio.png',

            // Cutscenes
            'cutscene_fase1_1': 'assets/cutscenes/fase1_1.png',
            'cutscene_fase1_2': 'assets/cutscenes/fase1_2.png',
            'cutscene_fase1_3': 'assets/cutscenes/fase1_3.png',
            'cutscene_fase3_1': 'assets/cutscenes/fase3_1.png',
            'cutscene_fase4_1': 'assets/cutscenes/fase4_1.png',
            'cutscene_fase5_1': 'assets/cutscenes/fase5_1.png',
            'cutscene_fase6_1': 'assets/cutscenes/fase6_1.png',
            'cutscene_fase9_1': 'assets/cutscenes/fase9_1.png',
            'cutscene_ending_1': 'assets/cutscenes/ending_1.png',
            'cutscene_ending_2': 'assets/cutscenes/ending_2.png',

            // Terreno e Plataformas
            'terreno':    'assets/terreno/chao.png',
            'plataformas':'assets/terreno/plataformas.png',
            'surf_water': 'assets/terreno/mar_textura.png.png',
            'lago_agua':  'assets/terreno/lago_agua.png',
            'lago_ceu':   'assets/terreno/lago_ceu.png'
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
