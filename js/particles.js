/**
 * ParticleSystem - Efeitos visuais de esperança, onda de luz, pétalas e mensagens de superação
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.lightWaves = [];
        this.bloomedSunflowers = [];
        this.petals = [];
        this.darkPalette = false;
        this.animationTime = 0;
        this.specters = [
            { x: 8, y: 132, width: 92, height: 104, alpha: 0.16, drift: 7, phase: 0.4 },
            { x: 42, y: 220, width: 78, height: 118, alpha: 0.19, drift: 5, phase: 1.8 },
            { x: 10, y: 314, width: 108, height: 96, alpha: 0.14, drift: 9, phase: 3.1 },
            { x: 48, y: 378, width: 68, height: 112, alpha: 0.15, drift: 6, phase: 4.5 }
        ];
    }

    setDarkPalette(enabled) {
        this.darkPalette = !!enabled;
    }

    isWarmParticleColor(color) {
        const normalized = String(color).toLowerCase().replace(/\s/g, '');
        return /^#(?:ffd|ffe|fff)/.test(normalized) || normalized.startsWith('rgba(255,235,150,');
    }

    emitSparks(x, y, count = 14, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                size: 3 + Math.random() * 4,
                color: color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                shape: Math.random() > 0.4 ? 'star' : 'circle'
            });
        }
    }

    emitHearts(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 16 - 8),
                y: y,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -1.2 - Math.random() * 1.5,
                size: 14,
                color: '#ff6b81',
                alpha: 1,
                decay: 0.02,
                shape: 'heart'
            });
        }
    }

    emitLightWave(x, y) {
        this.lightWaves.push({
            x: x,
            y: y,
            radius: 10,
            maxRadius: 140,
            alpha: 0.85,
            growth: 7.5
        });
    }

    emitSunflowerBloom(x, y) {
        // Deixa um pequeno girassol no chão onde o sintoma foi superado
        this.bloomedSunflowers.push({
            x: x,
            y: y,
            scale: 0.2,
            targetScale: 1.0,
            alpha: 1.0
        });

        // Solta chuva de corações e faíscas douradas
        this.emitSparks(x, y, 20, '#ffd700');
        this.emitHearts(x, y - 10, 4);
    }

    emitText(x, y, text, color = '#fff9c4') {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            vy: -1.2,
            alpha: 1.0,
            color: color
        });
    }

    emitDust(x, y) {
        this.particles.push({
            x: x + (Math.random() * 12 - 6),
            y: y + 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 0.8,
            size: 2 + Math.random() * 3,
            color: 'rgba(255, 235, 150, 0.6)',
            alpha: 0.8,
            decay: 0.04,
            shape: 'circle'
        });
    }

    updatePetals(canvasWidth, canvasHeight, hopeLevel, density = 1) {
        // Adiciona pétalas se a esperança for maior que 20%
        if (hopeLevel > 20 && Math.random() < (hopeLevel / 200) * density) {
            this.petals.push({
                x: Math.random() * canvasWidth + 100,
                y: -10,
                vx: -1.2 - Math.random() * 1.5,
                vy: 1.0 + Math.random() * 1.2,
                angle: Math.random() * Math.PI,
                vAngle: 0.03 + Math.random() * 0.04,
                size: 6 + Math.random() * 4,
                alpha: 0.75
            });
        }

        for (let i = this.petals.length - 1; i >= 0; i--) {
            const pet = this.petals[i];
            pet.x += pet.vx;
            pet.y += pet.vy;
            pet.angle += pet.vAngle;
            if (pet.y > canvasHeight || pet.x < -20) {
                this.petals.splice(i, 1);
            }
        }
    }

    update() {
        this.animationTime += 1 / 60;

        // Atualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.04;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Atualizar ondas de luz
        for (let i = this.lightWaves.length - 1; i >= 0; i--) {
            const wave = this.lightWaves[i];
            wave.radius += wave.growth;
            wave.alpha = Math.max(0, 1 - (wave.radius / wave.maxRadius));
            if (wave.radius >= wave.maxRadius) {
                this.lightWaves.splice(i, 1);
            }
        }

        // Atualizar textos flutuantes
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.alpha -= 0.014;
            if (t.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Atualizar girassóis florescidos
        for (let g of this.bloomedSunflowers) {
            if (g.scale < g.targetScale) {
                g.scale += 0.08;
            }
        }
    }

    drawSpecters(ctx) {
        for (const specter of this.specters) {
            const time = this.animationTime * 0.55 + specter.phase;
            const driftX = Math.sin(time) * specter.drift + Math.sin(time * 0.43) * 4;
            const driftY = Math.sin(time * 0.72) * 11 + Math.cos(time * 0.31) * 4;
            const fade = 0.38 + (Math.sin(time * 0.8) + 1) * 0.31;

            ctx.save();
            ctx.translate(specter.x + specter.width / 2 + driftX, specter.y + specter.height / 2 + driftY);
            ctx.rotate(Math.sin(time * 0.5) * 0.08);
            ctx.scale(specter.width / 100, specter.height / 100);
            ctx.globalAlpha = specter.alpha * fade;

            const haze = ctx.createRadialGradient(0, 0, 8, 0, 0, 76);
            haze.addColorStop(0, 'rgba(8, 7, 22, 0.82)');
            haze.addColorStop(0.52, 'rgba(13, 10, 29, 0.5)');
            haze.addColorStop(1, 'rgba(18, 14, 34, 0)');
            ctx.fillStyle = haze;
            ctx.beginPath();
            ctx.ellipse(0, 0, 58, 66, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(7, 7, 20, 0.72)';
            ctx.beginPath();
            ctx.moveTo(-42, 52);
            ctx.bezierCurveTo(-47, 20, -32, 3, -28, -12);
            ctx.bezierCurveTo(-38, -42, -14, -58, 2, -38);
            ctx.bezierCurveTo(14, -57, 39, -41, 29, -14);
            ctx.bezierCurveTo(48, 4, 43, 33, 34, 52);
            ctx.bezierCurveTo(18, 42, 9, 59, -4, 50);
            ctx.bezierCurveTo(-18, 61, -28, 42, -42, 52);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(18, 14, 36, 0.45)';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-27, 24);
            ctx.quadraticCurveTo(-47, 41 + Math.sin(time) * 5, -53, 61);
            ctx.moveTo(24, 19);
            ctx.quadraticCurveTo(43, 39 + Math.cos(time * 0.8) * 5, 49, 59);
            ctx.stroke();
            ctx.restore();
        }
    }

    draw(ctx, cameraX) {
        // 1. Desenhar Girassóis Florescidos (onde sentimentos foram vencidos)
        for (let g of this.bloomedSunflowers) {
            const drawX = g.x - cameraX;
            if (drawX < -50 || drawX > ctx.canvas.width + 50) continue;

            ctx.save();
            ctx.translate(drawX, g.y);
            ctx.scale(g.scale, g.scale);
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🌻', 0, 0);
            ctx.restore();
        }

        // 2. Desenhar Ondas de Luz Expansivas
        for (let wave of this.lightWaves) {
            const drawX = wave.x - cameraX;
            ctx.save();
            ctx.globalAlpha = wave.alpha;
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#fff59d';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(drawX, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Preenchimento radiante suave
            const radGrad = ctx.createRadialGradient(drawX, wave.y, wave.radius * 0.4, drawX, wave.y, wave.radius);
            radGrad.addColorStop(0, 'rgba(255, 235, 59, 0.2)');
            radGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = radGrad;
            ctx.fill();

            ctx.restore();
        }

        // 3. Desenhar Partículas
        for (let p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = this.darkPalette && this.isWarmParticleColor(p.color) ? '#303640' : p.color;

            const drawX = p.x - cameraX;
            const drawY = p.y;

            if (p.shape === 'heart') {
                ctx.font = `${p.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(this.darkPalette ? '🖤' : '💛', drawX, drawY);
            } else if (p.shape === 'star') {
                ctx.beginPath();
                ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(drawX - p.size * 1.4, drawY - 1, p.size * 2.8, 2);
                ctx.fillRect(drawX - 1, drawY - p.size * 1.4, 2, p.size * 2.8);
            } else {
                ctx.beginPath();
                ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 4. Desenhar Pétalas Flutuantes na Tela
        for (let pet of this.petals) {
            ctx.save();
            ctx.globalAlpha = pet.alpha;
            ctx.translate(pet.x, pet.y);
            ctx.rotate(pet.angle);
            ctx.fillStyle = this.darkPalette ? '#303640' : '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(0, 0, pet.size, pet.size * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 5. Desenhar Textos Flutuantes
        for (let t of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = t.color;
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 4;
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x - cameraX, t.y);
            ctx.restore();
        }
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.lightWaves = [];
        this.bloomedSunflowers = [];
        this.petals = [];
    }
}

const particles = new ParticleSystem();
