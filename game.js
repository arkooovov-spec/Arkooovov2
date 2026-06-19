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
    }

    draw(ctx) {
        // Тело (синий куб)
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Лицо
        ctx.fillStyle = 'black';
        // Глаза
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Рот
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 28);
        ctx.lineTo(this.x + 28, this.y + 28);
        ctx.stroke();
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const player = new Player();
const platforms = [
    new Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40),
    new Platform(200, 450, 150, 20),
    new Platform(450, 350, 150, 20),
    new Platform(150, 250, 150, 20),
    new Platform(500, 150, 150, 20)
];

const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    // Горизонтальное движение
    player.velX = 0;
    if (keys['ArrowLeft']) player.velX = -5;
    if (keys['ArrowRight']) player.velX = 5;

    // Прыжок
    if (keys['ArrowUp'] && player.onGround) {
        player.velY = -15;
        player.onGround = false;
    }

    // Быстрое падение
    if (keys['ArrowDown']) {
        player.velY += 2;
    }

    // Гравитация
    player.velY += 0.8;

    // Обновление позиции
    player.x += player.velX;
    player.y += player.velY;

    // Коллизии с границами
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > SCREEN_WIDTH) player.x = SCREEN_WIDTH - player.width;

    // Коллизии с платформами
    player.onGround = false;
    for (const p of platforms) {
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y) {

            // Если падаем сверху
            if (player.velY > 0 && player.y + player.height <= p.y + player.velY + 1) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

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
