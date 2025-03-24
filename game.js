// Get canvas and set up context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

const gridSize = 40;

// Define enemy path
const path = [
    { x: 0, y: 160 }, { x: 160, y: 160 }, { x: 160, y: 320 }, { x: 480, y: 320 }, { x: 480, y: 160 }, { x: 600, y: 160 }
];

// Enemies and waves
let enemies = [];
let currentWave = 1;
let enemySpeed = 1;
let enemyHealth = 3; // Default enemy health
let waveSize = 5;
let waveCountdown = 300;

// Towers and bullets
let towers = [];
let bullets = [];

// Draw grid
function drawGrid() {
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

// Draw path
function drawPath() {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(path[0].x + gridSize / 2, path[0].y + gridSize / 2);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x + gridSize / 2, path[i].y + gridSize / 2);
    }
    ctx.stroke();
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, gridSize / 2, gridSize / 2);

        // Draw enemy health bar
        ctx.fillStyle = "black";
        ctx.fillRect(enemy.x, enemy.y - 5, (enemy.health / enemyHealth) * (gridSize / 2), 3);
    });
}

// Move enemies along the path
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        let target = path[enemy.index + 1];
        if (!target) {
            enemies.splice(index, 1);
            return;
        }

        let dx = target.x - enemy.x;
        let dy = target.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.speed) {
            enemy.index++;
        } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    });
}

// Draw towers
function drawTowers() {
    ctx.fillStyle = "green";
    towers.forEach(tower => {
        ctx.fillRect(tower.x, tower.y, gridSize, gridSize);
    });
}

// Draw bullets (small black dots)
function drawBullets() {
    ctx.fillStyle = "black";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Move bullets and check hits
function moveBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        let closestEnemy = null;
        let minDist = Infinity;
        let enemyHitIndex = -1;

        enemies.forEach((enemy, enemyIndex) => {
            let dx = enemy.x - bullet.x;
            let dy = enemy.y - bullet.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                closestEnemy = enemy;
                enemyHitIndex = enemyIndex;
            }
        });

        if (closestEnemy && minDist < 5) {
            enemies[enemyHitIndex].health -= 1; // Reduce enemy health

            if (enemies[enemyHitIndex].health <= 0) {
                enemies.splice(enemyHitIndex, 1); // Remove enemy if health is 0
            }
            
            bullets.splice(bulletIndex, 1); // Remove bullet after hitting one enemy
        } else if (closestEnemy) {
            let dx = closestEnemy.x - bullet.x;
            let dy = closestEnemy.y - bullet.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            bullet.x += (dx / dist) * bullet.speed;
            bullet.y += (dy / dist) * bullet.speed;
        }
    });
}

// Add a tower on click
canvas.addEventListener("click", (event) => {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / gridSize) * gridSize;
    let y = Math.floor((event.clientY - rect.top) / gridSize) * gridSize;

    let existingTower = towers.find(t => t.x === x && t.y === y);
    if (existingTower) {
        existingTower.fireRate -= 5; // Upgrade tower
    } else {
        towers.push({ x, y, fireRate: 60 });
    }
});

// Shoot bullets from towers
function shootBullets() {
    towers.forEach(tower => {
        if (tower.fireRate <= 0) {
            let targetEnemy = enemies[0]; // Target first enemy
            if (targetEnemy) {
                bullets.push({
                    x: tower.x + gridSize / 2,
                    y: tower.y + gridSize / 2,
                    speed: 3
                });
            }
            tower.fireRate = 60; // Reset fire rate
        } else {
            tower.fireRate--;
        }
    });
}

// Spawn enemy waves
function spawnWave() {
    if (waveCountdown <= 0) {
        for (let i = 0; i < waveSize; i++) {
            enemies.push({
                x: path[0].x,
                y: path[0].y,
                speed: enemySpeed,
                index: 0,
                health: enemyHealth
            });
        }
        waveCountdown = 300;
        currentWave++;
        enemySpeed += 0.2;
        enemyHealth += 1;
        waveSize += 2;
    } else {
        waveCountdown--;
    }
}

// Update game
function updateGame() {
    moveEnemies();
    moveBullets();
    shootBullets();
    spawnWave();
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawPath();
    drawEnemies();
    drawTowers();
    drawBullets();
    updateGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();
