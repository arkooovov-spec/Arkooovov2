const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

class Player {
    constructor(x, y) {
        this.width = 40;
        this.height = 40;
        this.spawnX = x;
        this.spawnY = y;
        this.respawn();
        this.color = '#00f2ff'; // Neon Blue
        this.trail = [];
    }

    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
    }

    draw(ctx, cameraX) {
        // Эффект следа
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) this.trail.shift();

        this.trail.forEach((pos, i) => {
            ctx.fillStyle = `rgba(0, 242, 255, ${0.05 * i})`;
            ctx.fillRect(pos.x - cameraX, pos.y, this.width, this.height);
        });

        // Свечение кубика
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Тело
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);

        // Лицо
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0d0221'; // Темный цвет фона для глаз

        // Глаза (более реалистичные)
        const eyeX1 = this.x - cameraX + 12;
        const eyeX2 = this.x - cameraX + 28;
        const eyeY = this.y + 12;

        // Белки
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Зрачки
        ctx.fillStyle = '#0d0221';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Блики в глазах
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(eyeX1 - 1, eyeY - 1, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX2 - 1, eyeY - 1, 1, 0, Math.PI * 2);
        ctx.fill();

        // Рот (более выразительный с тенями)
        ctx.strokeStyle = '#0d0221';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 20, this.y + 28, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Губы/Тень под ртом
        ctx.strokeStyle = 'rgba(13, 2, 33, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 20, this.y + 29, 7, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }
}

class Platform {
    constructor(x, y, width, height, hasSpikes = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#ff007f'; // Neon Pink
        this.hasSpikes = hasSpikes;
    }

    draw(ctx, cameraX) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);

        // Блик на платформе
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x - cameraX, this.y, this.width, 4);

        if (this.hasSpikes) {
            ctx.fillStyle = '#ff3131';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff3131';
            const spikeSize = 10;
            for (let i = 0; i < this.width; i += spikeSize * 2) {
                ctx.beginPath();
                ctx.moveTo(this.x - cameraX + i, this.y);
                ctx.lineTo(this.x - cameraX + i + spikeSize, this.y - spikeSize);
                ctx.lineTo(this.x - cameraX + i + spikeSize * 2, this.y);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
    }
}

class Laser {
    constructor(x, y, width, height, vertical = true) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vertical = vertical;
        this.timer = 0;
        this.active = true;
    }

    update() {
        this.timer += 0.05;
        this.active = Math.sin(this.timer) > -0.3; // Пульсация лазера
    }

    draw(ctx, cameraX) {
        if (!this.active) return;

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';

        const pulse = Math.abs(Math.sin(this.timer)) * 2;
        if (this.vertical) {
            ctx.fillRect(this.x - cameraX + (this.width/2 - 1 - pulse/2), this.y, 2 + pulse, this.height);
        } else {
            ctx.fillRect(this.x - cameraX, this.y + (this.height/2 - 1 - pulse/2), this.width, 2 + pulse);
        }
        ctx.shadowBlur = 0;
    }

    checkCollision(player) {
        if (!this.active) return false;
        return (player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y < this.y + this.height &&
                player.y + player.height > this.y);
    }
}

class Finish {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 100;
        this.color = '#39ff14'; // Neon Green
    }

    draw(ctx, cameraX) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);

        // Рисуем финишные шашечки
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0d0221';
        for (let i = 0; i < this.width; i += 20) {
            for (let j = 0; j < this.height; j += 20) {
                if ((i + j) / 20 % 2 === 0) {
                    ctx.fillRect(this.x - cameraX + i, this.y + j, 10, 10);
                }
            }
        }
    }
}

const player = new Player(50, 450);
let cameraX = 0;
let messageTimer = 0;

let gameState = 'countdown'; // 'countdown', 'playing', 'finished'
let countdownValue = 3;
let countdownTimer = 60; // 60 кадров на каждую цифру
let countdownAlpha = 1;
let countdownScale = 1;

const bgMusic = document.getElementById('bgMusic');
let musicStarted = false;

function startMusic() {
    if (!musicStarted && bgMusic) {
        bgMusic.play().catch(e => console.log("Музыка заблокирована браузером"));
        musicStarted = true;
    }
}

const platforms = [
    new Platform(0, 500, 200, 40),
    new Platform(300, 400, 150, 30),
    new Platform(550, 300, 150, 30, true), // Spikes
    new Platform(800, 450, 200, 30),
    new Platform(1100, 350, 200, 30, true), // Spikes
    new Platform(1400, 250, 150, 30),
    new Platform(1700, 400, 200, 30, true), // Spikes
    new Platform(2000, 300, 150, 30),
    new Platform(2300, 450, 300, 40)
];

const lasers = [
    new Laser(450, 300, 10, 100),
    new Laser(950, 200, 10, 250),
    new Laser(1550, 100, 10, 150),
    new Laser(1850, 300, 10, 100)
];

const finish = new Finish(2500, 350);

const keys = {};

// Обработка клавиатуры
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Обработка виртуальных кнопок
const setupMobileBtn = (id, code) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    const start = (e) => {
        e.preventDefault();
        keys[code] = true;
    };
    const end = (e) => {
        e.preventDefault();
        keys[code] = false;
    };

    btn.addEventListener('touchstart', start);
    btn.addEventListener('touchend', end);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
};

setupMobileBtn('btn-left', 'ArrowLeft');
setupMobileBtn('btn-right', 'ArrowRight');
setupMobileBtn('btn-up', 'ArrowUp');
setupMobileBtn('btn-down', 'ArrowDown');

function update() {
    if (gameState === 'countdown') {
        countdownTimer--;

        // Анимация ухода текста
        if (countdownTimer < 20) {
            countdownAlpha = countdownTimer / 20;
            countdownScale = 1 + (20 - countdownTimer) / 10;
        } else if (countdownTimer > 40) {
            // Анимация появления
            countdownAlpha = (60 - countdownTimer) / 20;
            countdownScale = 0.5 + (60 - countdownTimer) / 40;
        } else {
            countdownAlpha = 1;
            countdownScale = 1;
        }

        if (countdownTimer <= 0) {
            countdownValue--;
            countdownTimer = 60;
            if (countdownValue < 1) {
                gameState = 'playing';
                startMusic();
            }
        }
        return;
    }

    player.velX = 0;
    if (keys['ArrowLeft']) player.velX = -6;
    if (keys['ArrowRight']) player.velX = 6;

    if (keys['ArrowUp'] && player.onGround) {
        player.velY = -16;
        player.onGround = false;
    }

    if (keys['ArrowDown']) {
        player.velY += 2.5;
    }

    player.velY += 0.85; // Гравитация

    player.x += player.velX;
    player.y += player.velY;

    if (player.x < 0) player.x = 0;

    // Смерть при падении
    if (player.y > SCREEN_HEIGHT) {
        player.respawn();
    }

    player.onGround = false;
    for (const p of platforms) {
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y) {

            // Если у платформы есть шипы и мы коснулись их сверху
            if (p.hasSpikes && player.y + player.height > p.y && player.y + player.height < p.y + 15) {
                player.respawn();
                break;
            }

            if (player.velY > 0 && player.y + player.height <= p.y + player.velY + 2) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }
        }
    }

    for (const l of lasers) {
        l.update();
        if (l.checkCollision(player)) {
            player.respawn();
        }
    }

    // Проверка финиша
    if (player.x < finish.x + finish.width &&
        player.x + player.width > finish.x &&
        player.y < finish.y + finish.height &&
        player.y + player.height > finish.y) {

        messageTimer = 120; // Показать сообщение на 2 секунды (60 fps)
        player.respawn();
    }

    if (messageTimer > 0) messageTimer--;

    // Обновление камеры
    let targetCameraX = player.x - SCREEN_WIDTH / 2 + player.width / 2;
    if (targetCameraX < 0) targetCameraX = 0;
    cameraX += (targetCameraX - cameraX) * 0.1; // Плавное следование
}

const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawBackground() {
    // Дальний слой (звезды)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    stars.forEach(star => {
        let x = (star.x - cameraX * star.speed) % SCREEN_WIDTH;
        if (x < 0) x += SCREEN_WIDTH;
        ctx.beginPath();
        ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Рисуем сетку для глубины с учетом камеры (параллакс)
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.08)';
    ctx.lineWidth = 1;

    let offsetX = (-cameraX * 0.5) % 100;
    for (let i = offsetX; i < SCREEN_WIDTH; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, SCREEN_HEIGHT);
        ctx.stroke();
    }

    let offsetY = 0;
    for (let i = offsetY; i < SCREEN_HEIGHT; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(SCREEN_WIDTH, i);
        ctx.stroke();
    }

    // Более яркая сетка на переднем плане
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.05)';
    let offsetX2 = (-cameraX * 0.8) % 150;
    for (let i = offsetX2; i < SCREEN_WIDTH; i += 150) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, SCREEN_HEIGHT);
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    drawBackground();

    for (const p of platforms) {
        p.draw(ctx, cameraX);
    }

    for (const l of lasers) {
        l.draw(ctx, cameraX);
    }

    finish.draw(ctx, cameraX);
    player.draw(ctx, cameraX);

    if (gameState === 'countdown') {
        ctx.save();
        ctx.fillStyle = `rgba(0, 242, 255, ${countdownAlpha})`;
        ctx.font = `italic ${80 * countdownScale}px "New York Sans", serif`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15 * countdownAlpha;
        ctx.shadowColor = '#00f2ff';
        ctx.fillText(countdownValue, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30);
        ctx.restore();
    }

    if (messageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        const bounce = Math.abs(Math.sin(messageTimer * 0.1)) * 10;
        ctx.fillStyle = '#39ff14';
        ctx.font = `italic 60px "New York Sans", serif`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#39ff14';
        ctx.fillText('Поздравляем!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - bounce);
        ctx.shadowBlur = 0;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
