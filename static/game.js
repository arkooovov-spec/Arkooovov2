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

        if (characterType === 'cube' || characterType === 'cube-man') {
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

            if (characterType === 'cube-man') {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 4;
                ctx.beginPath();
                // Левая рука
                ctx.moveTo(this.x - cameraX, this.y + 20);
                ctx.lineTo(this.x - cameraX - 10, this.y + 30);
                // Правая рука
                ctx.moveTo(this.x - cameraX + this.width, this.y + 20);
                ctx.lineTo(this.x - cameraX + this.width + 10, this.y + 30);
                // Левая нога
                ctx.moveTo(this.x - cameraX + 10, this.y + this.height);
                ctx.lineTo(this.x - cameraX + 5, this.y + this.height + 10);
                // Правая нога
                ctx.moveTo(this.x - cameraX + 30, this.y + this.height);
                ctx.lineTo(this.x - cameraX + 35, this.y + this.height + 10);
                ctx.stroke();
            }
        } else if (characterType === 'dog') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#d2b48c'; // Tan color
            ctx.fillStyle = '#d2b48c';

            // Тело
            ctx.fillRect(this.x - cameraX + 5, this.y + 15, 30, 20);

            // Голова
            ctx.fillRect(this.x - cameraX + 20, this.y + 5, 20, 15);

            // Хвост
            ctx.fillRect(this.x - cameraX, this.y + 15, 5, 5);

            // Уши
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.x - cameraX + 25, this.y, 10, 5);

            // Глаз
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0d0221';
            ctx.beginPath();
            ctx.arc(this.x - cameraX + 35, this.y + 10, 2, 0, Math.PI * 2);
            ctx.fill();

            // Нос
            ctx.beginPath();
            ctx.arc(this.x - cameraX + 40, this.y + 15, 2, 0, Math.PI * 2);
            ctx.fill();

            // Ноги (движущиеся)
            ctx.strokeStyle = '#d2b48c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            let legOffset = (Math.abs(this.velX) > 0) ? Math.sin(Date.now() / 100) * 5 : 0;

            ctx.moveTo(this.x - cameraX + 10, this.y + 35);
            ctx.lineTo(this.x - cameraX + 10 + legOffset, this.y + 40);

            ctx.moveTo(this.x - cameraX + 25, this.y + 35);
            ctx.lineTo(this.x - cameraX + 25 - legOffset, this.y + 40);
            ctx.stroke();
        }
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

class Mushroom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
    }

    draw(ctx, cameraX) {
        // Ножка
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x - cameraX + 6, this.y + 10, 8, 10);

        // Шляпка
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 10, this.y + 10, 10, Math.PI, 0);
        ctx.fill();

        // Белые точки
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 6, this.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 14, this.y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 10, this.y + 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

let gameState = 'INTRO';
let characterType = 'cube';
let currentLevel = 1;
let totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
let introTimer = 0;
let introParticles = [];

for(let i = 0; i < 100; i++) {
    introParticles.push({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 10 + 5,
        color: Math.random() > 0.5 ? '#00f2ff' : '#ff007f',
        targetX: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 400,
        targetY: SCREEN_HEIGHT / 2 + (Math.random() - 0.5) * 200
    });
}

const player = new Player(50, 450);
let cameraX = 0;
let messageTimer = 0;

let platforms = [];
let mushrooms = [];
let finish = null;

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

function updateIntro() {
    introTimer++;

    for (let p of introParticles) {
        if (introTimer < 120) {
            p.x += p.vx;
            p.y += p.vy;

            // Отскок от краев
            if (p.x < 0 || p.x > SCREEN_WIDTH) p.vx *= -1;
            if (p.y < 0 || p.y > SCREEN_HEIGHT) p.vy *= -1;
        } else {
            // Стягивание к тексту
            p.x += (p.targetX - p.x) * 0.05;
            p.y += (p.targetY - p.y) * 0.05;
        }
    }

    if (introTimer >= 240) {
        gameState = 'MENU';
    }
}

function drawIntro() {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    for (let p of introParticles) {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.shadowBlur = 0;

    if (introTimer > 120) {
        let alpha = Math.min((introTimer - 120) / 60, 1);
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#39ff14';
        ctx.fillText('Neon Cube Jump', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        ctx.shadowBlur = 0;
    }
}

function updateMenu() {
    // Menu logic if needed
}

function drawMenu() {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = '#00f2ff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Выберите персонажа', SCREEN_WIDTH / 2, 100);

    // Кубик
    ctx.fillStyle = characterType === 'cube' ? '#ff007f' : '#00f2ff';
    ctx.fillRect(150, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Кубик', 200, 380);

    // Человечек
    ctx.fillStyle = characterType === 'cube-man' ? '#ff007f' : '#00f2ff';
    ctx.fillRect(350, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.fillText('Человечек', 400, 380);

    // Собака
    ctx.fillStyle = characterType === 'dog' ? '#ff007f' : '#00f2ff';
    ctx.fillRect(550, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.fillText('Собака', 600, 380);
}

function updateLevelSelect() {
    // Level select logic if needed
}

function drawLevelSelect() {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = '#39ff14';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Выберите уровень', SCREEN_WIDTH / 2, 100);

    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(150, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Уровень 1', 200, 380);

    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(350, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.fillText('Уровень 2', 400, 380);

    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(550, 250, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.fillText('Уровень 3', 600, 380);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (gameState === 'MENU') {
        if (y >= 250 && y <= 350) {
            if (x >= 150 && x <= 250) {
                characterType = 'cube';
                gameState = 'LEVEL_SELECT';
            } else if (x >= 350 && x <= 450) {
                characterType = 'cube-man';
                gameState = 'LEVEL_SELECT';
            } else if (x >= 550 && x <= 650) {
                characterType = 'dog';
                gameState = 'LEVEL_SELECT';
            }
        }
    } else if (gameState === 'LEVEL_SELECT') {
        if (y >= 250 && y <= 350) {
            if (x >= 150 && x <= 250) {
                loadLevel(1);
                gameState = 'PLAYING';
            } else if (x >= 350 && x <= 450) {
                loadLevel(2);
                gameState = 'PLAYING';
            } else if (x >= 550 && x <= 650) {
                loadLevel(3);
                gameState = 'PLAYING';
            }
        }
    }
});

function loadLevel(index) {
    cameraX = 0;
    player.respawn();
    mushrooms = [];
    currentLevel = index;

    switch(index) {
        case 1:
            platforms = [
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
            mushrooms.push(new Mushroom(350, 380));
            mushrooms.push(new Mushroom(850, 430));
            mushrooms.push(new Mushroom(1450, 230));
            finish = new Finish(2500, 350);
            break;
        case 2:
            platforms = [
                new Platform(0, 500, 150, 40),
                new Platform(250, 450, 100, 30),
                new Platform(450, 350, 100, 30),
                new Platform(650, 250, 100, 30),
                new Platform(850, 400, 150, 30),
                new Platform(1150, 300, 100, 30),
                new Platform(1400, 450, 200, 30),
                new Platform(1750, 350, 150, 30)
            ];
            mushrooms.push(new Mushroom(480, 330));
            mushrooms.push(new Mushroom(900, 380));
            mushrooms.push(new Mushroom(1800, 330));
            finish = new Finish(2000, 250);
            break;
        case 3:
            platforms = [
                new Platform(0, 500, 100, 40),
                new Platform(200, 400, 80, 30),
                new Platform(400, 300, 80, 30),
                new Platform(600, 450, 100, 30),
                new Platform(850, 350, 100, 30),
                new Platform(1100, 250, 100, 30),
                new Platform(1350, 400, 150, 30),
                new Platform(1650, 300, 100, 30),
                new Platform(1900, 450, 150, 30)
            ];
            mushrooms.push(new Mushroom(420, 280));
            mushrooms.push(new Mushroom(1130, 230));
            mushrooms.push(new Mushroom(1680, 280));
            finish = new Finish(2200, 350);
            break;
    }
}

function updatePlaying() {
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

    // Проверка грибов
    for (let i = mushrooms.length - 1; i >= 0; i--) {
        const m = mushrooms[i];
        if (player.x < m.x + m.width &&
            player.x + player.width > m.x &&
            player.y < m.y + m.height &&
            player.y + player.height > m.y) {

            mushrooms.splice(i, 1);
            totalCoins += 5;
            localStorage.setItem('totalCoins', totalCoins);
        }
    }

    // Проверка финиша
    if (finish && player.x < finish.x + finish.width &&
        player.x + player.width > finish.x &&
        player.y < finish.y + finish.height &&
        player.y + player.height > finish.y) {

        gameState = 'LEVEL_SELECT';
    }

    // Обновление камеры
    let targetCameraX = player.x - SCREEN_WIDTH / 2 + player.width / 2;
    if (targetCameraX < 0) targetCameraX = 0;
    cameraX += (targetCameraX - cameraX) * 0.1; // Плавное следование
}

function update() {
    switch (gameState) {
        case 'INTRO': updateIntro(); break;
        case 'MENU': updateMenu(); break;
        case 'LEVEL_SELECT': updateLevelSelect(); break;
        case 'PLAYING': updatePlaying(); break;
    }
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

function drawPlaying() {
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    drawBackground();

    for (const p of platforms) {
        p.draw(ctx, cameraX);
    }

    for (const m of mushrooms) {
        m.draw(ctx, cameraX);
    }

    if (finish) finish.draw(ctx, cameraX);
    player.draw(ctx, cameraX);

    // HUD
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(SCREEN_WIDTH - 60, 30, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(totalCoins, SCREEN_WIDTH - 40, 38);
}

function draw() {
    switch (gameState) {
        case 'INTRO': drawIntro(); break;
        case 'MENU': drawMenu(); break;
        case 'LEVEL_SELECT': drawLevelSelect(); break;
        case 'PLAYING': drawPlaying(); break;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
