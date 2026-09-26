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
        if (!this.isBgmPlaying && !this.isMuted) {
            this.startBgm();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
        } else {
            this.startBgm();
        }
        return this.isMuted;
    }

    startBgm() {
        if (this.isMuted || this.isBgmPlaying) return;
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
