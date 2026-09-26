/**
 * LevelData - Definição das 6 fases do Setembro Amarelo
 * 
 * Fases 1 a 4: Plataforma e Superação de Sintomas
 * Fase 5: O Santuário da Mente (Puzzle Cooperativo com o Coelho - Placas de Pressão & Chaves)
 * Fase 6: Caminhos Invisíveis de Esperança (Puzzle de Revelação com a Onda de Luz [E])
 */
const GAME_LEVELS = [
    {
        id: 1,
        name: "Fase 1: A Floresta dos Sentimentos",
        subtitle: "Acolhendo os sentimentos e combatendo o primeiro sintoma: a solidão.",
        bgKey: "bg_fase1",
        width: 2400,
        groundY: 460,
        portalX: 2260,
        platforms: [
            // Chão com buracos — 2 gaps para o jogador pular
            { x: 0, y: 460, w: 680, h: 80 },
            { x: 780, y: 460, w: 680, h: 80 },
            { x: 1560, y: 460, w: 840, h: 80 },
            // Plataformas elevadas
            { x: 300, y: 360, w: 160, h: 24 },
            { x: 550, y: 280, w: 180, h: 24 },
            { x: 820, y: 350, w: 150, h: 24 },
            { x: 1080, y: 270, w: 200, h: 24 },
            { x: 1380, y: 340, w: 160, h: 24 },
            { x: 1620, y: 260, w: 180, h: 24 },
            { x: 1880, y: 350, w: 200, h: 24 }
        ],
        obstacles: [
            { type: 'obs_isolamento', name: 'Solidão', x: 420, y: 412, w: 60, h: 66, vx: 0.20, minX: 300, maxX: 600 },
            { type: 'obs_isolamento', name: 'Isolamento', x: 950, y: 412, w: 60, h: 66, vx: -0.22, minX: 820, maxX: 1100 },
            { type: 'obs_isolamento', name: 'Vazio no Peito', x: 1440, y: 292, w: 60, h: 66, vx: 0.18, minX: 1390, maxX: 1520 },
            { type: 'obs_isolamento', name: 'Desânimo', x: 1720, y: 412, w: 60, h: 66, vx: 0.25, minX: 1600, maxX: 1900 }
        ],
        items: [
            { type: 'item_dialogo', name: 'Diálogo Aberto', phrase: 'Conversar alivia o peso do coração.', x: 370, y: 310, points: 50 },
            { type: 'item_coracao', name: 'Autocuidado', phrase: 'Cuide com carinho de si mesmo.', x: 630, y: 230, points: 100, isLife: true },
            { type: 'item_chave', name: 'Chave da Compreensão', phrase: 'Entender suas emoções liberta.', x: 890, y: 300, points: 60 },
            { type: 'item_rede_apoio', name: 'Rede de Afeto', phrase: 'Você nunca precisa passar por isso só.', x: 1170, y: 220, points: 100, isLife: true },
            { type: 'item_dialogo', name: 'Palavra Gentil', phrase: 'Uma palavra amiga transforma o dia.', x: 1690, y: 210, points: 50 },
            { type: 'item_coracao', name: 'Esperança', phrase: 'Dias melhores estão por vir.', x: 1960, y: 300, points: 100, isLife: true }
        ],
    },
    {
        id: 2,
        name: "Fase 2: A Floresta da Conexão",
        subtitle: "Lutando contra a autocrítica, o julgamento e a culpa.",
        bgKey: "bg_fase2",
        width: 2600,
        groundY: 460,
        portalX: 2460,
        platforms: [
            // Chão com buracos — 3 gaps para pular
            { x: 0, y: 460, w: 580, h: 80 },
            { x: 680, y: 460, w: 480, h: 80 },
            { x: 1260, y: 460, w: 600, h: 80 },
            { x: 1960, y: 460, w: 640, h: 80 },
            // Plataformas elevadas
            { x: 260, y: 360, w: 180, h: 24 },
            { x: 500, y: 290, w: 160, h: 24 },
            { x: 740, y: 230, w: 160, h: 24 },
            { x: 970, y: 340, w: 180, h: 24 },
            { x: 1240, y: 260, w: 190, h: 24 },
            { x: 1510, y: 330, w: 160, h: 24 },
            { x: 1760, y: 250, w: 180, h: 24 },
            { x: 2040, y: 340, w: 220, h: 24 }
        ],
        obstacles: [
            { type: 'obs_humilhacao', name: 'Autocrítica', x: 330, y: 312, w: 60, h: 66, vx: 0.20, minX: 270, maxX: 430 },
            { type: 'obs_humilhacao', name: 'Sensação de Culpa', x: 800, y: 412, w: 60, h: 66, vx: -0.22, minX: 700, maxX: 1000 },
            { type: 'obs_isolamento', name: 'Exclusão', x: 1300, y: 212, w: 60, h: 66, vx: 0.18, minX: 1250, maxX: 1420 },
            { type: 'obs_humilhacao', name: 'Insegurança', x: 1600, y: 412, w: 60, h: 66, vx: 0.22, minX: 1480, maxX: 1750 },
            { type: 'obs_humilhacao', name: 'Pressão Interna', x: 2120, y: 292, w: 60, h: 66, vx: -0.20, minX: 2060, maxX: 2240 }
        ],
        items: [
            { type: 'item_documento_rg', name: 'Sua Identidade', phrase: 'Sua história e existência são únicas.', x: 340, y: 310, points: 80 },
            { type: 'item_dialogo', name: 'Escuta Atenta', phrase: 'Ouvir sem julgar acolhe a alma.', x: 570, y: 240, points: 50 },
            { type: 'item_coracao', name: 'Amor-Próprio', phrase: 'Você não precisa agradar a todos.', x: 810, y: 180, points: 100, isLife: true },
            { type: 'item_rede_apoio', name: 'Grupo de Apoio', phrase: 'Juntos somos um escudo contra a dor.', x: 1320, y: 210, points: 100, isLife: true },
            { type: 'item_chave', name: 'Compreensão', phrase: 'A empatia quebra preconceitos.', x: 1840, y: 200, points: 70 },
            { type: 'item_coracao', name: 'Abraço Seguro', phrase: 'Existe acolhimento para você.', x: 2130, y: 290, points: 100, isLife: true }
        ],
    },
    {
        id: 3,
        name: "Fase 3: Corrida da Superação",
        subtitle: "Desvie dos objetos, preserve suas vidas e alcance 1000 pontos para avançar!",
        bgKey: "bg_fase3",
        width: 960,
        groundY: 460,
        isRunnerLevel: true,
        targetScore: 1000,
        runnerBaseSpeed: 3.8,
        runnerMidSpeed: 5.5,
        runnerMaxSpeed: 8.8,
        runnerSpawnMin: 1.8,
        runnerSpawnMax: 2.8,
        runnerFlyingChance: 0.28,
        runnerCollectibleChance: 0,
        runnerHoleChance: 0,
        platforms: [
            { x: 0, y: 460, w: 960, h: 80 }
        ],
        obstacles: [],
        items: []
    },
    {
        id: 4,
        name: "Fase 4: Surf da Esperança",
        subtitle: "Desvie das ondas e boias, salte a espuma e alcance 1000 pontos sem sair da prancha.",
        bgKey: "bg_fase4",
        width: 960,
        groundY: 460,
        isSurfLevel: true,
        surfTargetScore: 1000,
        surfBaseSpeed: 4.5,
        surfMaxSpeed: 8.2,
        surfSpawnMin: 1.05,
        surfSpawnMax: 1.6,
        platforms: [
            { x: 0, y: 460, w: 960, h: 80 }
        ],
        obstacles: [],
        items: []
    },
    {
        id: 5,
        name: "Fase 5: O Santuário da Mente (Puzzle)",
        subtitle: "Use [F] para coordenar seu coelho nas placas de pressão e encontrar as 3 Chaves da Clareza.",
        bgKey: "bg_fase5",
        width: 2200,
        groundY: 460,
        portalX: 2060,
        requiredKeys: 3, // Necessário 3 chaves para abrir o portal final
        platforms: [
            // Chão base
            { x: 0, y: 460, w: 2200, h: 80 },
            // Área 1: Ala Oeste (Primeira Chave)
            { x: 180, y: 360, w: 180, h: 24 },
            { x: 400, y: 270, w: 180, h: 24 },
            // Área 2: Torre Central (Segunda Chave)
            { x: 800, y: 350, w: 160, h: 24 },
            { x: 1020, y: 250, w: 200, h: 24 },
            { x: 1260, y: 170, w: 180, h: 24 },
            // Área 3: Ala Leste (Terceira Chave)
            { x: 1540, y: 330, w: 170, h: 24 },
            { x: 1750, y: 240, w: 180, h: 24 }
        ],
        // Placas de pressão que o coelho ou o jogador podem ativar
        pressurePlates: [
            { id: 'plate1', x: 230, y: 450, w: 60, h: 10, isPressed: false, targetBarrier: 'barrier1', label: 'Placa da Paciência' },
            { id: 'plate2', x: 850, y: 450, w: 60, h: 10, isPressed: false, targetBarrier: 'barrier2', label: 'Placa da Harmonia' },
            { id: 'plate3', x: 1580, y: 450, w: 60, h: 10, isPressed: false, targetBarrier: 'barrier3', label: 'Placa da Coragem' }
        ],
        // Barreiras de energia que abrem quando a placa correspondente está pressionada
        barriers: [
            { id: 'barrier1', x: 550, y: 150, w: 18, h: 120, isOpen: false, color: '#9c27b0' },
            { id: 'barrier2', x: 1220, y: 70, w: 18, h: 100, isOpen: false, color: '#2196f3' },
            { id: 'barrier3', x: 1720, y: 140, w: 18, h: 100, isOpen: false, color: '#ff9800' }
        ],
        obstacles: [
            { type: 'obs_isolamento', name: 'Dúvida Lenta', x: 450, y: 222, w: 60, h: 66, vx: 0.25, minX: 410, maxX: 560 },
            { type: 'obs_humilhacao', name: 'Eco do Medo', x: 1070, y: 202, w: 60, h: 66, vx: 0.30, minX: 1030, maxX: 1200 }
        ],
        items: [
            // As 3 Chaves da Clareza guardadas nos puzzles
            { type: 'item_chave', name: '1ª Chave da Clareza', phrase: 'Você e seu coelho formam uma equipe incrível!', x: 480, y: 220, points: 150, isPuzzleKey: true },
            { type: 'item_chave', name: '2ª Chave da Clareza', phrase: 'Com paciência, toda mente encontra a paz.', x: 1340, y: 120, points: 150, isPuzzleKey: true },
            { type: 'item_chave', name: '3ª Chave da Clareza', phrase: 'O Santuário da Mente está desbloqueado!', x: 1820, y: 190, points: 150, isPuzzleKey: true },
            { type: 'item_coracao', name: 'Coração Sereno', phrase: 'Respire fundo, você está no controle.', x: 1090, y: 400, points: 80, isLife: true }
        ],
    },
    {
        id: 6,
        name: "Fase 6: Caminhos Invisíveis de Esperança (Puzzle Final)",
        subtitle: "Use a Onda de Luz [E] para revelar as plataformas invisíveis e acender as 3 Chamas da Vida!",
        bgKey: "bg_fase6",
        width: 2500,
        groundY: 460,
        portalX: 2360,
        requiredShrines: 3, // Necessário acender os 3 altares
        platforms: [
            // Ilhas sólidas de chão
            { x: 0, y: 460, w: 320, h: 80 },
            { x: 800, y: 460, w: 260, h: 80 },
            { x: 1500, y: 460, w: 260, h: 80 },
            { x: 2200, y: 460, w: 300, h: 80 },

            // PLATAFORMAS INVISÍVEIS (reveladas pela Onda de Luz [E])
            // Trecho 1 (Abismo da Dúvida)
            { x: 360, y: 390, w: 120, h: 20, invisible: true, lightTimer: 0 },
            { x: 520, y: 330, w: 130, h: 20, invisible: true, lightTimer: 0 },
            { x: 670, y: 270, w: 110, h: 20, invisible: true, lightTimer: 0 },

            // Trecho 2 (Subida da Fé)
            { x: 1100, y: 380, w: 120, h: 20, invisible: true, lightTimer: 0 },
            { x: 1260, y: 300, w: 130, h: 20, invisible: true, lightTimer: 0 },
            { x: 1410, y: 240, w: 110, h: 20, invisible: true, lightTimer: 0 },

            // Trecho 3 (Passarela da Vitória)
            { x: 1800, y: 390, w: 120, h: 20, invisible: true, lightTimer: 0 },
            { x: 1950, y: 320, w: 130, h: 20, invisible: true, lightTimer: 0 },
            { x: 2090, y: 260, w: 110, h: 20, invisible: true, lightTimer: 0 }
        ],
        // 3 Altares da Chama da Vida para serem acesos com [E]
        shrines: [
            { id: 'shrine1', x: 920, y: 410, w: 40, h: 50, isLit: false, name: 'Chama do Perdão' },
            { id: 'shrine2', x: 1620, y: 410, w: 40, h: 50, isLit: false, name: 'Chama do Acolhimento' },
            { id: 'shrine3', x: 2280, y: 410, w: 40, h: 50, isLit: false, name: 'Chama da Vida Eterna' }
        ],
        obstacles: [
            // Brisas suaves de pensamentos para contornar
            { type: 'obs_isolamento', name: 'Névoa Passageira', x: 530, y: 280, w: 60, h: 66, vx: 0.3, minX: 500, maxX: 630 },
            { type: 'obs_humilhacao', name: 'Sopro de Insegurança', x: 1270, y: 250, w: 60, h: 66, vx: 0.3, minX: 1240, maxX: 1380 }
        ],
        items: [
            { type: 'item_dialogo', name: 'Voz da Esperança', phrase: 'A luz que você carrega dentro de si ilumina qualquer caminho!', x: 690, y: 220, points: 100 },
            { type: 'item_rede_apoio', name: 'Mão Estendida', phrase: 'Você venceu a escuridão passo a passo.', x: 1430, y: 190, points: 100, isLife: true },
            { type: 'item_coracao', name: 'Coração de Ouro', phrase: 'A vida vale a pena ser vivida!', x: 2110, y: 210, points: 150, isLife: true }
        ]
    },
    {
        id: 7,
        name: "Fase 7: O Grande Desafio da Superação (Chefe Final)",
        subtitle: "Desvie dos ataques do Boss e use sua Onda de Luz [E] para transformar a dor em acolhimento!",
        bgKey: "bg_fase7",
        width: 960,
        groundY: 460,
        portalX: 440,
        isBossLevel: true,
        platforms: [
            // Chão base da arena
            { x: 0, y: 460, w: 960, h: 80 },
            // Plataformas elevadas para esquiva dos ataques (estilo Cuphead)
            { x: 100, y: 350, w: 150, h: 22 },
            { x: 290, y: 260, w: 160, h: 22 },
            { x: 490, y: 340, w: 140, h: 22 }
        ],
        boss: {
            name: "A Grande Sombra do Desânimo",
            title: "Desafio Final das Emoções",
            spriteKey: "boss_shadow",
            studentSpriteKey: "boss_aluno",
            x: 690,
            y: 220,
            w: 230,
            h: 240,
            maxHp: 8,
            hp: 8
        },
        obstacles: [],
        items: [
            { type: 'item_coracao', name: 'Acolhimento', phrase: 'Você tem forças para superar qualquer tempestade!', x: 370, y: 190, points: 100, isLife: true }
        ]
    }
];
