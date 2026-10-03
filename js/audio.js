/**
 * AudioManager - Sintetizador de Áudio Procedural usando Web Audio API
 * Inclui efeitos sonoros e trilha musical acolhedora contínua.
 */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.isBgmPlaying = false;
        this.musicMode = 'procedural';
        this.musicTrack = new Audio('assets/sons/Beneath_the_Ancient_Boughs.mp3');
        this.musicTrack.loop = true;
        this.musicTrack.volume = 0.55;
        this.musicRunner = new Audio('assets/sons/Gallop_Toward_the_Podium.mp3');
        this.musicRunner.loop = true;
        this.musicRunner.volume = 0.55;
        this.musicCutsceneIntro = new Audio('assets/sons/inicio.mp3');
        this.musicCutsceneMid = new Audio('assets/sons/durante o resto.mp3');
        this.musicCutsceneEnd = new Audio('assets/sons/final.mp3');
        this.musicCutsceneIntro.loop = true;
        this.musicCutsceneMid.loop = true;
        this.musicCutsceneEnd.loop = false;
        this.musicCutsceneIntro.volume = 0.55;
        this.musicCutsceneMid.volume = 0.55;
        this.musicCutsceneEnd.volume = 0.55;
        this.activeCutsceneMusic = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.isMuted) {
            if (this.activeCutsceneMusic) {
                const playback = this.activeCutsceneMusic.play();
                if (playback && typeof playback.catch === 'function') playback.catch(() => {});
            } else if (this.musicMode === 'track') {
                this.playMusicTrack();
            } else if (this.musicMode === 'runner') {
                this.playMusicRunner();
            } else if (!this.isBgmPlaying) {
                this.startBgm();
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
            this.musicTrack.pause();
            this.musicRunner.pause();
            this.getCutsceneMusicTracks().forEach(track => track.pause());
        } else {
            this.init();
        }
        return this.isMuted;
    }

    setLevelMusic(levelId) {
        const nextMode = levelId === 3 ? 'runner' : 'track';
        if (nextMode === this.musicMode) {
            if (this.isMuted) return;
            if (nextMode === 'track') {
                this.playMusicTrack();
            } else if (nextMode === 'runner') {
                this.playMusicRunner();
            } else if (!this.isBgmPlaying) {
                this.startBgm();
            }
            return;
        }

        this.stopBgm();
        this.musicTrack.pause();
        this.musicRunner.pause();
        if (nextMode === 'track') this.musicTrack.currentTime = 0;
        if (nextMode === 'runner') this.musicRunner.currentTime = 0;
        this.musicMode = nextMode;

        if (this.isMuted) return;
        if (nextMode === 'track') {
            this.playMusicTrack();
        } else if (nextMode === 'runner') {
            this.playMusicRunner();
        } else {
            this.startBgm();
        }
    }

    playMusicTrack() {
        if (this.isMuted || !this.musicTrack.paused) return;
        const playback = this.musicTrack.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(() => {
                if (this.musicMode === 'track' && !this.isMuted) {
                    this.musicMode = 'procedural';
                    this.startBgm();
                }
            });
        }
    }

    playMusicRunner() {
        if (this.isMuted || !this.musicRunner.paused) return;
        const playback = this.musicRunner.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(() => {
                if (this.musicMode === 'runner' && !this.isMuted) {
                    this.musicMode = 'procedural';
                    this.startBgm();
                }
            });
        }
    }

    getCutsceneMusicTracks() {
        return [this.musicCutsceneIntro, this.musicCutsceneMid, this.musicCutsceneEnd];
    }

    playCutsceneMusic(type) {
        this.init();
        const tracks = {
            intro: this.musicCutsceneIntro,
            mid: this.musicCutsceneMid,
            end: this.musicCutsceneEnd
        };
        const track = tracks[type];
        if (!track || this.isMuted) return;

        this.stopBgm();
        this.musicTrack.pause();
        this.musicRunner.pause();
        this.getCutsceneMusicTracks().forEach(cutsceneTrack => cutsceneTrack.pause());
        track.currentTime = 0;
        this.activeCutsceneMusic = track;
        const playback = track.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(error => console.warn('Cutscene music blocked:', error));
        }
    }

    stopCutsceneMusic() {
        this.getCutsceneMusicTracks().forEach(track => {
            track.pause();
            track.currentTime = 0;
        });
        this.activeCutsceneMusic = null;
    }

    startBgm() {
        if (this.isMuted || this.isBgmPlaying || this.musicMode === 'track' || this.musicMode === 'runner') return;
        this.isBgmPlaying = true;
        this.scheduleBgmLoop();
    }

    stopBgm() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleBgmLoop() {
        if (!this.isBgmPlaying || this.isMuted) return;

        // Progressão emocional suave: Cmaj7 -> Am7 -> Fmaj7 -> Gsus4 (calor e acolhimento)
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 261.63, 293.66, 392.00]  // Gsus4
        ];

        const currentChord = chords[this.bgmStep % chords.length];
        this.bgmStep++;

        if (this.ctx && this.ctx.state === 'running') {
            const now = this.ctx.currentTime;
            currentChord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                // Ataque suave, sustentação aconchegante e decaimento lento
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.025, now + 0.6 + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 3.5);
            });
        }

        // Cada acorde dura 3.2 segundos
        this.bgmTimer = setTimeout(() => {
            this.scheduleBgmLoop();
        }, 3200);
    }

    playJump() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.14);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playWave() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        // Som radiante de sino / expansão de luz
        const now = this.ctx.currentTime;
        const freqs = [587.33, 880.00, 1174.66]; // D5, A5, D6
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.10, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + 0.46);
        });
    }

    playHeal() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        // Som de florescer / cura do sintoma
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            const t = now + idx * 0.05;
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.36);
        });
    }

    playCollect() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const noteStart = now + (idx * 0.05);
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.11, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.23);
        });
    }

    playHeartGain() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const noteStart = now + (idx * 0.05);
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.14, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.29);
        });
    }

    playHurt() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
    }

    playLevelComplete() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { freq: 261.63, duration: 0.15, delay: 0 },
            { freq: 392.00, duration: 0.15, delay: 0.15 },
            { freq: 440.00, duration: 0.2, delay: 0.3 },
            { freq: 523.25, duration: 0.45, delay: 0.5 }
        ];

        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            const noteStart = now + note.delay;
            osc.frequency.setValueAtTime(note.freq, noteStart);

            gain.gain.setValueAtTime(0.16, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + note.duration + 0.05);
        });
    }
}

const audio = new AudioManager();
