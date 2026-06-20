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

        // Свечение
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        if (selectedCharacter === 'cube') {
            // Тело
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
        } else if (selectedCharacter === 'human') {
            // Рисуем человека (неоновый стикман)
            ctx.beginPath();
            ctx.arc(this.x - cameraX + this.width/2, this.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();

            // Тело
            ctx.fillRect(this.x - cameraX + this.width/2 - 2, this.y + 18, 4, 15);

            // Руки
            ctx.fillRect(this.x - cameraX + 5, this.y + 20, 30, 3);

            // Ноги
            ctx.fillRect(this.x - cameraX + 12, this.y + 33, 4, 15);
            ctx.fillRect(this.x - cameraX + 24, this.y + 33, 4, 15);
        } else if (selectedCharacter === 'dog') {
            // Рисуем собаку
            // Тело
            ctx.fillRect(this.x - cameraX + 5, this.y + 20, 25, 12);

            // Голова
            ctx.fillRect(this.x - cameraX + 25, this.y + 10, 12, 12);

            // Уши
            ctx.fillRect(this.x - cameraX + 25, this.y + 5, 4, 5);
            ctx.fillRect(this.x - cameraX + 33, this.y + 5, 4, 5);

            // Ноги
            ctx.fillRect(this.x - cameraX + 8, this.y + 32, 4, 8);
            ctx.fillRect(this.x - cameraX + 23, this.y + 32, 4, 8);

            // Хвост
            ctx.fillRect(this.x - cameraX + 2, this.y + 15, 3, 8);
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

const player = new Player(50, 450);
let cameraX = 0;
let messageTimer = 0;

// Game State Management
const STATE_MAIN_MENU = 'MAIN_MENU';
const STATE_CHAR_SELECT = 'CHAR_SELECT';
const STATE_LEVEL_SELECT = 'LEVEL_SELECT';
const STATE_COUNTDOWN = 'COUNTDOWN';
const STATE_PLAYING = 'PLAYING';
const STATE_FINISHED = 'FINISHED';

let gameState = STATE_MAIN_MENU;
let countdownValue = 3;
let countdownTimer = 0;

// UI Elements
const uiMainMenu = document.getElementById('main-menu');
const uiCharMenu = document.getElementById('character-menu');
const uiLevelMenu = document.getElementById('level-menu');
const uiCountdown = document.getElementById('countdown-overlay');
const uiCountdownText = document.getElementById('countdown-text');
const uiWinOverlay = document.getElementById('win-overlay');

const btnCharacters = document.getElementById('btn-characters');
const btnCharCube = document.getElementById('btn-char-cube');
const btnCharHuman = document.getElementById('btn-char-human');
const btnCharDog = document.getElementById('btn-char-dog');

const btnLevels = document.getElementById('btn-levels');
const btnLvl1 = document.getElementById('btn-lvl-1');
const btnContinue = document.getElementById('btn-continue');

let selectedCharacter = 'cube';

// UI Event Listeners
if (btnCharacters) {
    btnCharacters.addEventListener('click', () => {
        uiMainMenu.classList.add('hidden');
        uiCharMenu.classList.remove('hidden');
        gameState = STATE_CHAR_SELECT;
    });
}

function selectCharacter(charType) {
    selectedCharacter = charType;
    uiCharMenu.classList.add('hidden');
    uiMainMenu.classList.remove('hidden');
    gameState = STATE_MAIN_MENU;
}

if (btnCharCube) btnCharCube.addEventListener('click', () => selectCharacter('cube'));
if (btnCharHuman) btnCharHuman.addEventListener('click', () => selectCharacter('human'));
if (btnCharDog) btnCharDog.addEventListener('click', () => selectCharacter('dog'));

if (btnLevels) {
    btnLevels.addEventListener('click', () => {
        uiMainMenu.classList.add('hidden');
        uiLevelMenu.classList.remove('hidden');
        gameState = STATE_LEVEL_SELECT;
    });
}

if (btnLvl1) {
    btnLvl1.addEventListener('click', () => {
        uiLevelMenu.classList.add('hidden');
        startCountdown();
    });
}

if (btnContinue) {
    btnContinue.addEventListener('click', () => {
        uiWinOverlay.classList.add('hidden');
        uiLevelMenu.classList.remove('hidden');
        gameState = STATE_LEVEL_SELECT;
        player.respawn();
        cameraX = 0;
    });
}

function startCountdown() {
    gameState = STATE_COUNTDOWN;
    countdownValue = 3;
    uiCountdown.classList.remove('hidden');
    uiCountdownText.innerText = countdownValue;

    // Player resets to beginning
    player.respawn();
    cameraX = 0;

    let interval = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            uiCountdownText.innerText = countdownValue;
        } else if (countdownValue === 0) {
            uiCountdownText.innerText = "GO!";
        } else {
            clearInterval(interval);
            uiCountdown.classList.add('hidden');
            gameState = STATE_PLAYING;
        }
    }, 1000);
}

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

// 3D Background Decoration
class BackgroundCube {
    constructor(x, y, z, size, color) {
        this.x = x;
        this.y = y;
        this.z = z; // z determines parallax speed and scale
        this.size = size;
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }

    draw(ctx, cameraX) {
        this.rotation += this.rotSpeed;

        // Parallax effect: objects further away (higher z) move less
        const parallaxFactor = 1 / this.z;
        const screenX = this.x - cameraX * parallaxFactor;
        const screenY = this.y;

        // Scale based on z depth
        const scale = 1 / this.z;
        const s = this.size * scale;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = this.color;

        // Draw a simple 3D wireframe cube projection (isometric-like)
        const offset = s * 0.4;

        ctx.beginPath();
        // Back face
        ctx.rect(-s/2 + offset, -s/2 - offset, s, s);
        // Front face
        ctx.rect(-s/2 - offset, -s/2 + offset, s, s);
        ctx.stroke();

        // Connecting lines
        ctx.beginPath();
        ctx.moveTo(-s/2 + offset, -s/2 - offset);
        ctx.lineTo(-s/2 - offset, -s/2 + offset);

        ctx.moveTo(s/2 + offset, -s/2 - offset);
        ctx.lineTo(s/2 - offset, -s/2 + offset);

        ctx.moveTo(s/2 + offset, s/2 - offset);
        ctx.lineTo(s/2 - offset, s/2 + offset);

        ctx.moveTo(-s/2 + offset, s/2 - offset);
        ctx.lineTo(-s/2 - offset, s/2 + offset);
        ctx.stroke();

        ctx.restore();
    }
}

const bgCubes = [];
const colors = ['rgba(0, 242, 255, 0.4)', 'rgba(255, 0, 127, 0.4)', 'rgba(57, 255, 20, 0.4)'];
for (let i = 0; i < 40; i++) {
    // Spread cubes far across the level and at different depths
    const x = Math.random() * 3000 - 500;
    const y = Math.random() * 600;
    const z = Math.random() * 2 + 1.5; // z from 1.5 to 3.5
    const size = Math.random() * 60 + 40;
    const color = colors[Math.floor(Math.random() * colors.length)];
    bgCubes.push(new BackgroundCube(x, y, z, size, color));
}


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
    if (gameState !== STATE_PLAYING) return; // Freeze logic when not playing

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

        gameState = STATE_FINISHED;
        uiWinOverlay.classList.remove('hidden');
    }

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

    // Рисуем 3D кубы на фоне
    for (const cube of bgCubes) {
        cube.draw(ctx, cameraX);
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

    // We removed the canvas-based win screen since we now use HTML uiWinOverlay
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
