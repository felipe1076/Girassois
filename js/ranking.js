(function () {
    const STORAGE_KEY = 'girassois_ranking_v1';
    const MAX_ENTRIES = 50;

    function safeReadStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];

            const bestByGroup = new Map();
            parsed.forEach((item) => {
                if (!item || typeof item !== 'object') return;
                const entry = normalizeEntry(item);
                const key = `${normalizeForCompare(entry.grupo)}|${normalizeForCompare(entry.turma)}`;
                const current = bestByGroup.get(key);
                if (!current || compareByScore(entry, current) < 0) bestByGroup.set(key, entry);
            });
            return [...bestByGroup.values()].sort(compareByScore);
        } catch (e) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
            return [];
        }
    }

    function safeWriteStorage(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (e) {
            return false;
        }
        return true;
    }

    function getLevelMeta(levelId) {
        const levelList = Array.isArray(window.GAME_LEVELS) ? window.GAME_LEVELS : [];
        const numericId = Number(levelId);
        const match = levelList.find(level => Number(level.id) === numericId);
        return match || { id: numericId, name: `Fase ${numericId}`, parTime: 120 };
    }

    function cleanName(value, maxLength) {
        return String(value || '')
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, maxLength);
    }

    function normalizeForCompare(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
    }

    function normalizeEntry(item) {
        return {
            grupo: cleanName(item.grupo || item.nick || 'Grupo', 24),
            turma: cleanName(item.turma || '-', 10) || '-',
            total: Number(item.total) || 0,
            tempoTotal: Number(item.tempoTotal) || 0,
            itens: Number(item.itens) || 0,
            inimigos: Number(item.inimigos) || 0,
            data: String(item.data || '')
        };
    }

    function compareByScore(a, b) {
        if ((Number(b.total) || 0) !== (Number(a.total) || 0)) {
            return (Number(b.total) || 0) - (Number(a.total) || 0);
        }
        return (Number(a.tempoTotal) || 0) - (Number(b.tempoTotal) || 0);
    }

    const ranking = {
        state: {
            run: null,
            group: null
        },

        setGroup(grupo, turma) {
            const cleanGroup = cleanName(grupo, 24);
            const cleanClass = cleanName(turma, 10);
            if (!cleanGroup || !cleanClass) return false;

            this.state.group = { grupo: cleanGroup, turma: cleanClass };
            try { localStorage.setItem('girassois_ultima_turma', cleanClass); } catch (e) {}
            return true;
        },

        getGroup() {
            return this.state.group ? { ...this.state.group } : null;
        },

        clearGroup() {
            this.state.group = null;
        },

        getLastTurma() {
            try { return localStorage.getItem('girassois_ultima_turma') || ''; } catch (e) { return ''; }
        },

        startRun(mode = 'full') {
            this.state.run = {
                mode: mode === 'single' ? 'single' : 'full',
                group: this.getGroup(),
                startedAt: Date.now(),
                tempoTotal: 0,
                itens: 0,
                inimigos: 0,
                phases: [],
                currentLevel: null,
                finalResult: null
            };
            return this.state.run;
        },

        _ensureRun() {
            return this.state.run;
        },

        startLevel(levelId) {
            const run = this._ensureRun();
            if (!run || run.mode !== 'full' || !run.group) return null;
            const levelMeta = getLevelMeta(levelId);

            run.currentLevel = {
                id: Number(levelId),
                name: levelMeta.name || `Fase ${levelId}`,
                parTime: Number(levelMeta.parTime || 120),
                tempo: 0,
                itens: 0,
                inimigos: 0,
                itemPoints: 0,
                livesLeft: 0,
                damage: false,
                bossDefeated: false,
                total: 0,
                breakdown: null
            };

            return run.currentLevel;
        },

        addFrameTime(deltaMs) {
            const run = this.state.run;
            if (!run || !run.currentLevel) return;

            const delta = Math.max(0, Number(deltaMs) || 0);
            run.tempoTotal = (Number(run.tempoTotal) || 0) + delta;
            run.currentLevel.tempo = (Number(run.currentLevel.tempo) || 0) + delta;
        },

        addItem(points) {
            const run = this.state.run;
            if (!run || !run.currentLevel) return;

            const base = Number(points) || 0;
            run.itens = Number(run.itens || 0) + 1;
            run.currentLevel.itens = Number(run.currentLevel.itens || 0) + 1;
            run.currentLevel.itemPoints = Number(run.currentLevel.itemPoints || 0) + base;
        },

        addEnemy() {
            const run = this.state.run;
            if (!run || !run.currentLevel) return;

            run.inimigos = Number(run.inimigos || 0) + 1;
            run.currentLevel.inimigos = Number(run.currentLevel.inimigos || 0) + 1;
        },

        addDamage() {
            const run = this.state.run;
            if (!run || !run.currentLevel) return;
            run.currentLevel.damage = true;
        },

        _phaseResult(levelId, phase) {
            const levelMeta = getLevelMeta(levelId);
            const tempSeconds = (Number(phase.tempo) || 0) / 1000;
            const parTime = Number(levelMeta.parTime || 120);
            const itemScore = Number(phase.itemPoints || 0) + (30 * Number(phase.itens || 0));
            const enemyScore = 40 * Number(phase.inimigos || 0);
            const timeBonus = Math.max(0, (parTime - tempSeconds) * 5);
            const lifeBonus = 100 * Number(phase.livesLeft || 0);
            const noDamageBonus = phase.damage ? 0 : 150;
            const bossBonus = phase.bossDefeated ? 500 : 0;
            const total = itemScore + enemyScore + timeBonus + lifeBonus + noDamageBonus + bossBonus;

            return {
                id: Number(levelId),
                name: phase.name || levelMeta.name || `Fase ${levelId}`,
                parTime,
                tempoTotal: Number(tempSeconds.toFixed(2)),
                itens: Number(phase.itens || 0),
                inimigos: Number(phase.inimigos || 0),
                livesLeft: Number(phase.livesLeft || 0),
                damage: Boolean(phase.damage),
                bossDefeated: Boolean(phase.bossDefeated),
                total: Number(total.toFixed(2)),
                breakdown: {
                    itemScore: Number(itemScore.toFixed(2)),
                    enemyScore: Number(enemyScore.toFixed(2)),
                    timeBonus: Number(timeBonus.toFixed(2)),
                    lifeBonus: Number(lifeBonus.toFixed(2)),
                    noDamageBonus: Number(noDamageBonus.toFixed(2)),
                    bossBonus: Number(bossBonus.toFixed(2))
                }
            };
        },

        endLevel(levelId, options = {}) {
            const run = this._ensureRun();
            if (!run || run.mode !== 'full' || !run.group) return null;
            const id = Number(levelId);
            const basePhase = run.currentLevel && Number(run.currentLevel.id) === id
                ? run.currentLevel
                : (run.phases || []).find(item => Number(item.id) === id) || { id, name: getLevelMeta(id).name || `Fase ${id}` };

            const phase = {
                ...basePhase,
                id,
                name: basePhase.name || getLevelMeta(id).name || `Fase ${id}`,
                parTime: Number(getLevelMeta(id).parTime || 120),
                tempo: Number(basePhase.tempo || 0),
                itemPoints: Number(basePhase.itemPoints || 0),
                itens: Number(basePhase.itens || 0),
                inimigos: Number(basePhase.inimigos || 0),
                livesLeft: Number(options.livesLeft ?? basePhase.livesLeft ?? 0),
                damage: Boolean(options.damage ?? basePhase.damage ?? false),
                bossDefeated: Boolean(options.bossDefeated ?? basePhase.bossDefeated ?? false)
            };

            const result = this._phaseResult(id, phase);
            const idx = run.phases.findIndex(item => Number(item.id) === id);
            if (idx >= 0) {
                run.phases[idx] = result;
            } else {
                run.phases.push(result);
            }

            if (run.currentLevel && Number(run.currentLevel.id) === id) {
                run.currentLevel = null;
            }

            return result;
        },

        finishRun() {
            const run = this._ensureRun();
            if (!run || run.mode !== 'full' || !run.group) return null;

            if (run.currentLevel) {
                const phase = this.endLevel(run.currentLevel.id, {
                    livesLeft: run.currentLevel.livesLeft,
                    bossDefeated: run.currentLevel.bossDefeated,
                    damage: run.currentLevel.damage
                });
                if (phase) {
                    run.finalResult = {
                        total: Number(phase.total || 0),
                        tempoTotal: Number(((run.tempoTotal || 0) / 1000).toFixed(2)),
                        itens: Number(run.itens || 0),
                        inimigos: Number(run.inimigos || 0),
                        fasesConcluidas: run.phases.length,
                        breakdown: run.phases.map(item => ({
                            id: item.id,
                            name: item.name,
                            total: item.total,
                            tempoTotal: item.tempoTotal
                        }))
                    };
                    return run.finalResult;
                }
            }

            const breakdown = (run.phases || []).map(item => ({
                id: item.id,
                name: item.name,
                total: Number(item.total || 0),
                tempoTotal: Number(item.tempoTotal || 0)
            }));

            const total = (run.phases || []).reduce((acc, item) => acc + (Number(item.total) || 0), 0);
            const result = {
                total: Number(total.toFixed(2)),
                tempoTotal: Number(((run.tempoTotal || 0) / 1000).toFixed(2)),
                itens: Number(run.itens || 0),
                inimigos: Number(run.inimigos || 0),
                fasesConcluidas: (run.phases || []).length,
                breakdown
            };

            run.finalResult = result;
            return result;
        },

        submit() {
            const run = this._ensureRun();
            if (!run || run.mode !== 'full' || !run.group) return null;

            const finalResult = this.finishRun();
            if (!finalResult) return null;
            const entry = {
                grupo: run.group.grupo,
                turma: run.group.turma,
                total: Number(finalResult.total || 0),
                tempoTotal: Number(finalResult.tempoTotal || 0),
                itens: Number(finalResult.itens || 0),
                inimigos: Number(finalResult.inimigos || 0),
                data: new Date().toISOString()
            };

            const entries = safeReadStorage();
            const key = `${normalizeForCompare(entry.grupo)}|${normalizeForCompare(entry.turma)}`;
            const existing = entries.find(item => `${normalizeForCompare(item.grupo)}|${normalizeForCompare(item.turma)}` === key);
            const bestEntry = existing && compareByScore(existing, entry) <= 0 ? existing : entry;
            const filtered = entries.filter(item => `${normalizeForCompare(item.grupo)}|${normalizeForCompare(item.turma)}` !== key);
            filtered.push(bestEntry);
            filtered.sort(compareByScore);

            const trimmed = filtered.slice(0, MAX_ENTRIES);
            safeWriteStorage(trimmed);
            const position = trimmed.findIndex(item => `${normalizeForCompare(item.grupo)}|${normalizeForCompare(item.turma)}` === key) + 1;
            const submitted = { ...entry, position: position || null };
            this.state.run = null;
            return submitted;
        },

        getTop(limit = 10, turmaFiltro = '') {
            const filter = normalizeForCompare(turmaFiltro);
            const entries = safeReadStorage().filter(item => !filter || normalizeForCompare(item.turma) === filter);
            entries.sort(compareByScore);
            return entries.slice(0, Math.max(0, Number(limit) || 10));
        },

        getTurmas() {
            return [...new Set(safeReadStorage().map(item => item.turma))]
                .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
        },

        getPosition(grupo, turma) {
            const groupKey = normalizeForCompare(grupo);
            const classKey = normalizeForCompare(turma);
            const index = this.getTop(Number.MAX_SAFE_INTEGER).findIndex(item =>
                normalizeForCompare(item.grupo) === groupKey && normalizeForCompare(item.turma) === classKey
            );
            return index < 0 ? null : index + 1;
        },

        exportCSV() {
            const escapeField = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
            const rows = [];
            this.getTop(Number.MAX_SAFE_INTEGER).forEach(item => rows.push([
                item.turma,
                item.grupo,
                item.total,
                item.tempoTotal,
                item.itens,
                item.inimigos,
                item.data
            ]));
            const header = 'Turma;Grupo;Pontos;Tempo;Itens;Acolhidos;Data';
            const body = rows.map(row => row.map(escapeField).join(';')).join('\r\n');
            return `\uFEFF${header}${body ? `\r\n${body}` : ''}`;
        }
    };

    window.ranking = ranking;
})();
