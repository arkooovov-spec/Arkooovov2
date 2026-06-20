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

        // Глаза
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 12, this.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 28, this.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Рот (улыбка)
        ctx.strokeStyle = '#0d0221';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 20, this.y + 25, 8, 0, Math.PI);
        ctx.stroke();
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#ff007f'; // Neon Pink
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

const platforms = [
    new Platform(0, 500, 200, 40),
    new Platform(300, 400, 150, 30),
    new Platform(550, 300, 150, 30),
    new Platform(800, 450, 200, 30),
    new Platform(1100, 350, 200, 30),
    new Platform(1400, 250, 150, 30),
    new Platform(1700, 400, 200, 30),
    new Platform(2000, 300, 150, 30),
    new Platform(2300, 450, 300, 40)
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

            if (player.velY > 0 && player.y + player.height <= p.y + player.velY + 2) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }
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

function drawBackground() {
    // Рисуем сетку для глубины с учетом камеры
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;

    let offsetX = -cameraX % 50;

    for (let i = offsetX; i < SCREEN_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, SCREEN_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i < SCREEN_HEIGHT; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(SCREEN_WIDTH, i);
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

    finish.draw(ctx, cameraX);
    player.draw(ctx, cameraX);

    if (messageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#39ff14';
        ctx.fillText('Поздравляем!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        ctx.shadowBlur = 0;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
