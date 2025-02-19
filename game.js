// game.js

// Helper function to draw a rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const defaultP1Name = "Player 1";
const defaultP2Name = "Player 2";
let p1Name = defaultP1Name;
let p2Name = defaultP2Name;
let p1Score = 0, p2Score = 0;

const speed = 5;
let gameRunning = false;
let gamePaused = false;

const shootSound = document.getElementById("shootSound");
const hitSound = document.getElementById("hitSound");

const player1 = {
  x: 100,
  y: 0,
  width: 40,
  height: 40,
  color: "blue",
  health: 100,
  shield: 100,
  shieldActive: false,
  message: "",
  canShoot: true
};

const player2 = {
  x: 600,
  y: 0,
  width: 40,
  height: 40,
  color: "red",
  health: 100,
  shield: 100,
  shieldActive: false,
  message: "",
  canShoot: true
};

let bullets = [];

const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
  " ": false, q: false, Enter: false, m: false, p: false
};

document.addEventListener("keydown", (e) => {
  if (e.key === "CapsLock") { e.preventDefault(); return; }
  if (keys.hasOwnProperty(e.key)) {
    if (e.key === "p") { togglePause(); return; }
    if (e.key === " " && player1.canShoot && gameRunning && !gamePaused) {
      shootBullet(player1, 1);
      player1.canShoot = false;
    } else if (e.key === "Enter" && player2.canShoot && gameRunning && !gamePaused) {
      shootBullet(player2, 2);
      player2.canShoot = false;
    }
    keys[e.key] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "CapsLock") { e.preventDefault(); return; }
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    if (e.key === " ") player1.canShoot = true;
    if (e.key === "Enter") player2.canShoot = true;
  }
});

function movePlayers() {
  if (keys.a && player1.x > 0) player1.x -= speed;
  if (keys.d && player1.x + player1.width < canvas.width) player1.x += speed;
  if (keys.w && player1.y > 0) player1.y -= speed;
  if (keys.s && player1.y + player1.height < canvas.height) player1.y += speed;
  
  if (keys.ArrowLeft && player2.x > 0) player2.x -= speed;
  if (keys.ArrowRight && player2.x + player2.width < canvas.width) player2.x += speed;
  if (keys.ArrowUp && player2.y > 0) player2.y -= speed;
  if (keys.ArrowDown && player2.y + player2.height < canvas.height) player2.y += speed;
  
  player1.shieldActive = keys.q;
  player2.shieldActive = keys.m;
}

function drawTopStatus() {
  const boxWidth = 220, boxHeight = 60, padding = 20, radius = 10;
  
  // Left status box for Player 1
  let grad = ctx.createLinearGradient(padding, padding, padding, padding + boxHeight);
  grad.addColorStop(0, "#333");
  grad.addColorStop(1, "#555");
  
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 6;
  drawRoundedRect(ctx, padding, padding, boxWidth, boxHeight, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  ctx.font = "bold 16px Arial";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillStyle = "red";
  ctx.fillText("Health: " + player1.health + "%", padding + 15, padding + 10);
  
  // Improved shield text with 3D effect for Player 1
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  let shieldGrad1 = ctx.createLinearGradient(padding + 15, padding + 30, padding + 15, padding + 50);
  shieldGrad1.addColorStop(0, "#4A90E2");
  shieldGrad1.addColorStop(1, "#003366");
  ctx.fillStyle = shieldGrad1;
  ctx.fillText("Shield: " + player1.shield + "% 🛡️", padding + 15, padding + 30);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.strokeText("Shield: " + player1.shield + "% 🛡️", padding + 15, padding + 30);
  ctx.restore();
  
  ctx.fillStyle = "white";
  ctx.fillText(p1Name, padding + 15, padding + boxHeight - 20);
  
  // Right status box for Player 2
  const rightX = canvas.width - boxWidth - padding;
  grad = ctx.createLinearGradient(rightX, padding, rightX, padding + boxHeight);
  grad.addColorStop(0, "#333");
  grad.addColorStop(1, "#555");
  
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 6;
  drawRoundedRect(ctx, rightX, padding, boxWidth, boxHeight, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  ctx.textAlign = "right";
  ctx.fillStyle = "red";
  ctx.fillText("Health: " + player2.health + "%", rightX + boxWidth - 15, padding + 10);
  
  // Improved shield text with 3D effect for Player 2
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  let shieldGrad2 = ctx.createLinearGradient(rightX + boxWidth - 15, padding + 30, rightX + boxWidth - 15, padding + 50);
  shieldGrad2.addColorStop(0, "#4A90E2");
  shieldGrad2.addColorStop(1, "#003366");
  ctx.fillStyle = shieldGrad2;
  ctx.fillText("Shield: " + player2.shield + "% 🛡️", rightX + boxWidth - 15, padding + 30);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.strokeText("Shield: " + player2.shield + "% 🛡️", rightX + boxWidth - 15, padding + 30);
  ctx.restore();
  
  ctx.fillStyle = "white";
  ctx.fillText(p2Name, rightX + boxWidth - 15, padding + boxHeight - 20);
  ctx.textAlign = "left";
}

function drawControls() {
  const boxWidth = 300, boxHeight = 50, padding = 20, radius = 10;
  
  // Left control box for Player 1
  const leftX = padding;
  const leftY = canvas.height - boxHeight - padding;
  let grad = ctx.createLinearGradient(leftX, leftY, leftX, leftY + boxHeight);
  grad.addColorStop(0, "#444");
  grad.addColorStop(1, "#666");
  
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  drawRoundedRect(ctx, leftX, leftY, boxWidth, boxHeight, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.fillText("P1: WASD move | SPACE shoot | Q shield", leftX + 15, leftY + 18);
  
  // Right control box for Player 2
  const rightX = canvas.width - boxWidth - padding;
  const rightY = canvas.height - boxHeight - padding;
  grad = ctx.createLinearGradient(rightX, rightY, rightX, rightY + boxHeight);
  grad.addColorStop(0, "#444");
  grad.addColorStop(1, "#666");
  
  ctx.save();
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  drawRoundedRect(ctx, rightX, rightY, boxWidth, boxHeight, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  ctx.textAlign = "right";
  ctx.fillStyle = "white";
  ctx.fillText("P2: Arrow keys move | ENTER shoot | M shield", rightX + boxWidth - 15, rightY + 18);
  ctx.textAlign = "left";
}

function gameLoop() {
  if (!gameRunning || gamePaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTopStatus();
  movePlayers();
  updateBullets();
  drawPlayer(player1);
  drawPlayer(player2);
  drawControls();
  checkGameOver();
  requestAnimationFrame(gameLoop);
}

function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (player.shieldActive) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function shootBullet(player, owner) {
  if (shootSound) {
    shootSound.currentTime = 0;
    shootSound.play();
  }
  const bullet = {
    x: owner === 1 ? player.x + player.width : player.x - 10,
    y: player.y + player.height / 2 - 2,
    width: 10,
    height: 4,
    speedX: owner === 1 ? 10 : -10,
    speedY: 0,
    owner: owner
  };
  bullets.push(bullet);
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.speedX;
    bullet.y += bullet.speedY;
    
    ctx.fillStyle = bullet.owner === 1 ? "cyan" : "orange";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }
    
    if (bullet.owner === 1 && rectCollision(bullet, player2)) {
      applyHit(player2);
      bullets.splice(i, 1);
      continue;
    } else if (bullet.owner === 2 && rectCollision(bullet, player1)) {
      applyHit(player1);
      bullets.splice(i, 1);
      continue;
    }
  }
}

function applyHit(player) {
  if (hitSound) {
    hitSound.currentTime = 0;
    hitSound.play();
  }
  if (player.shieldActive && player.shield > 0) {
    player.shield -= 10;
    if (player.shield < 0) player.shield = 0;
  } else {
    player.health -= 10;
    if (player.health < 0) player.health = 0;
  }
}

function rectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

function checkGameOver() {
  if (player1.health <= 0 || player2.health <= 0) {
    gameRunning = false;
    let winnerText = "";
    if (player1.health <= 0 && player2.health <= 0) {
      winnerText = "It's a draw!";
    } else if (player1.health <= 0) {
      winnerText = "Player 2 wins!";
      p2Score++;
    } else if (player2.health <= 0) {
      winnerText = "Player 1 wins!";
      p1Score++;
    }
    document.getElementById("winnerText").textContent = winnerText;
    updateScoreboard();
    showGameOverScreen();
  }
}

function updateScoreboard() {
  document.getElementById("p1Score").textContent = "Player 1: " + p1Score;
  document.getElementById("p2Score").textContent = "Player 2: " + p2Score;
}

function togglePause() {
  gamePaused = !gamePaused;
  document.getElementById("pauseScreen").classList.toggle("hidden", !gamePaused);
  if (!gamePaused && gameRunning) {
    gameLoop();
  }
}

function showGameOverScreen() {
  document.getElementById("gameOverScreen").classList.remove("hidden");
}

function restartGame() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("pauseScreen").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
  
  player1.x = 100; player1.y = 0;
  player2.x = 600; player2.y = 0;
  player1.health = 100; player2.health = 100;
  player1.shield = 100; player2.shield = 100;
  bullets = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  document.getElementById("p1Name").value = "";
  document.getElementById("p2Name").value = "";
  p1Name = defaultP1Name; p2Name = defaultP2Name;
  gameRunning = false;
}

function dropPlayers() {
  let dropSpeed = 5;
  let countdown = 3;
  let countdownInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      animateDrop();
    }
  }, 1000);
  
  function animateDrop() {
    function dropAnimation() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (player1.y < 300) player1.y += dropSpeed;
      if (player2.y < 300) player2.y += dropSpeed;
      drawPlayer(player1);
      drawPlayer(player2);
      if (player1.y >= 300 && player2.y >= 300) {
        player1.message = "🟦 " + p1Name;
        player2.message = "🟥 " + p2Name;
        setTimeout(() => {
          player1.message = "";
          player2.message = "";
          gameRunning = true;
          gameLoop();
        }, 2000);
        return;
      }
      requestAnimationFrame(dropAnimation);
    }
    dropAnimation();
  }
}

function startGame() {
  let inputP1 = document.getElementById("p1Name").value.trim();
  let inputP2 = document.getElementById("p2Name").value.trim();
  p1Name = inputP1 ? inputP1 : defaultP1Name;
  p2Name = inputP2 ? inputP2 : defaultP2Name;
  document.getElementById("startScreen").classList.add("hidden");
  dropPlayers();
}

document.getElementById("p1Name").addEventListener("input", function() {
  let newName = this.value.trim();
  if(newName === "") newName = defaultP1Name;
  p1Name = newName;
});
document.getElementById("p2Name").addEventListener("input", function() {
  let newName = this.value.trim();
  if(newName === "") newName = defaultP2Name;
  p2Name = newName;
});
