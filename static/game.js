const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = 100;
        this.y = SCREEN_HEIGHT - 100;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
        this.color = '#00f2ff'; // Neon Blue
        this.trail = [];
    }

    draw(ctx) {
        // Эффект следа
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 5) this.trail.shift();

        this.trail.forEach((pos, i) => {
            ctx.fillStyle = `rgba(0, 242, 255, ${0.1 * i})`;
            ctx.fillRect(pos.x, pos.y, this.width, this.height);
        });

        // Свечение кубика
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Тело
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Лицо
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0d0221'; // Темный цвет фона для глаз

        // Глаза
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 28, this.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Рот (улыбка)
        ctx.strokeStyle = '#0d0221';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 25, 8, 0, Math.PI);
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

    draw(ctx) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Блик на платформе
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 4);
    }
}

const player = new Player();
const platforms = [
    new Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40),
    new Platform(200, 450, 200, 30),
    new Platform(450, 350, 200, 30),
    new Platform(150, 250, 200, 30),
    new Platform(500, 150, 200, 30)
];

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
    if (player.x + player.width > SCREEN_WIDTH) player.x = SCREEN_WIDTH - player.width;

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
}

function drawBackground() {
    // Рисуем сетку для глубины
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < SCREEN_WIDTH; i += 50) {
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
        p.draw(ctx);
    }

    player.draw(ctx);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
