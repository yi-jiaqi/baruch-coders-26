// =======================================

// WATER BALLOON INFINITE CLIMBER

// +5 UP, -5 DOWN

// SPIKES AFTER 50 SCORE (SAFE SPACING)

// DOUBLE JUMP EVERY 10 POINTS

// POP + WATER BURST ON SPIKE ONLY

// =======================================


let lastPlatformY = null;

let lastPlatformId = null;

let lastSpikeY = -Infinity;


let ball;

let gravity = 0.8;

let moveAccel = 0.6;

let maxSpeed = 6;

let friction = 0.9;

let jumpStrength = -16;

let bounceDamp = -0.25;


let onGround = false;


let youCanDoubleJump = false;

let lastDoubleJumpScore = 0;


let scaleX = 1;

let scaleY = 1;

let targetScaleX = 1;

let targetScaleY = 1;


let platforms = [];

let highestPlatformY = 0;

let camY = 0;

let score = 0;


let gameStarted = false;


// Pop system

let isPopping = false;

let popTimer = 0;

let popDuration = 30;


// Water particles

let waterParticles = [];


// ======================

// SETUP

// ======================


function setup() {

  createCanvas(600, 500);

  resetGame();

}


function draw() {

  background(200, 230, 255);


  if (!gameStarted) {

    textAlign(CENTER, CENTER);

    textSize(36);

    fill(30);

    text("Click to Start", width / 2, height / 2);

    return;

  }


  updateBall();

  updateCamera();

  generatePlatforms();

  cleanPlatforms();


  push();

  translate(0, -camY);


  drawPlatforms();

  drawBalloon();

  updateWaterParticles();


  pop();


  drawUI();

}


// ======================

// BALL LOGIC

// ======================


function updateBall() {


  // Stop physics during pop

  if (isPopping) {

    popTimer++;


    if (popTimer >= popDuration) {

      gameStarted = false;

      resetGame();

    }

    return;

  }


  let prevY = ball.y;


  // Horizontal

  if (keyIsDown(LEFT_ARROW)) ball.vx -= moveAccel;

  if (keyIsDown(RIGHT_ARROW)) ball.vx += moveAccel;


  ball.vx *= friction;

  ball.vx = constrain(ball.vx, -maxSpeed, maxSpeed);

  ball.x += ball.vx;

  ball.x = constrain(ball.x, ball.r, width - ball.r);


  // Gravity

  ball.vy += gravity;

  ball.y += ball.vy;


  onGround = false;


  // PLATFORM COLLISION

  for (let p of platforms) {

    if (

      ball.vy >= 0 &&

      prevY + ball.r <= p.y &&

      ball.y + ball.r >= p.y &&

      ball.x + ball.r > p.x &&

      ball.x - ball.r < p.x + p.w

    ) {

      ball.y = p.y - ball.r;

      ball.vy *= bounceDamp;


      targetScaleY = 0.6;

      targetScaleX = 1.4;


      onGround = true;


      if (lastPlatformId !== null && p.id !== lastPlatformId) {


        if (p.y < lastPlatformY) {

          score += 5;

        } else {

          score -= 5;

          if (score < 0) score = 0;

        }


        while (score >= lastDoubleJumpScore + 10) {

          youCanDoubleJump = true;

          lastDoubleJumpScore += 10;

        }

      }


      lastPlatformY = p.y;

      lastPlatformId = p.id;


      break;

    }

  }


  // SPIKE COLLISION

  for (let p of platforms) {

    if (p.hasSpike && p.spikeX !== null) {

      let spikeTop = p.y - 10;


      if (

        ball.x + ball.r > p.spikeX &&

        ball.x - ball.r < p.spikeX + 10 &&

        ball.y + ball.r > spikeTop &&

        ball.y - ball.r < p.y

      ) {

        isPopping = true;

        popTimer = 0;

        ball.vx = 0;

        ball.vy = 0;

        createWaterBurst();

      }

    }

  }


  // Restore squish

  if (!onGround) {

    targetScaleX = 1;

    targetScaleY = 1;

  }


  scaleX = lerp(scaleX, targetScaleX, 0.2);

  scaleY = lerp(scaleY, targetScaleY, 0.2);


  // Fall death (no pop animation)

  if (ball.y - camY > height + 120) {

    gameStarted = false;

    resetGame();

  }

}


function updateCamera() {

  let threshold = height * 0.35;

  if (ball.y - camY < threshold) {

    camY = ball.y - threshold;

  }

}


function drawUI() {

  fill(0);

  textSize(20);

  textAlign(LEFT, TOP);

  text("Score: " + score, 15, 15);


  if (youCanDoubleJump) {

    fill(0, 150, 255);

    text("Double Jump Ready!", 15, 40);

  }

}


// ======================

// PLATFORM SYSTEM

// ======================


function generateInitialPlatforms() {

  let y = height - 40;


  let w = 120;

  let x = width / 2 - w / 2;


  platforms.push({

    x: x,

    y: y,

    w: w,

    h: 12,

    id: platforms.length,

    hasSpike: false,

    spikeX: null

  });


  y -= 80;


  for (let i = 0; i < 6; i++) {

    createPlatformLayer(y);

    y -= random(75, 90);

  }


  highestPlatformY = y;

}


function generatePlatforms() {

  while (highestPlatformY > camY - 200) {

    createPlatformLayer(highestPlatformY);

    highestPlatformY -= random(75, 90);

  }

}


function createPlatformLayer(y) {

  let platformCount = random() < 0.25 ? 2 : 1;


  function makePlatform(x, w) {

    let platform = {

      x: x,

      y: y,

      w: w,

      h: 12,

      id: platforms.length,

      hasSpike: false,

      spikeX: null

    };


    if (

      score >= 50 &&

      random() < 0.3 &&

      (lastSpikeY - y >= 70 || lastSpikeY === -Infinity)

    ) {

      platform.hasSpike = true;

      platform.spikeX = random(platform.x + 10, platform.x + platform.w - 20);

      lastSpikeY = y;

    }


    platforms.push(platform);

  }


  if (platformCount === 1) {

    let w = random(90, 130);

    let x = random(40, width - w - 40);

    makePlatform(x, w);

  } else {

    let w1 = random(90, 120);

    let w2 = random(90, 120);


    let x1 = random(40, width / 2 - w1 - 20);

    let x2 = random(width / 2 + 20, width - w2 - 40);


    makePlatform(x1, w1);

    makePlatform(x2, w2);

  }

}


function cleanPlatforms() {

  platforms = platforms.filter(p => p.y < camY + height + 100);

}


function drawPlatforms() {

  noStroke();


  for (let p of platforms) {

    fill(140, 90, 50);

    rect(p.x, p.y, p.w, p.h, 4);


    if (p.hasSpike && p.spikeX !== null) {

      fill(255, 0, 0);

      triangle(

        p.spikeX,

        p.y,

        p.spikeX + 10,

        p.y,

        p.spikeX + 5,

        p.y - 10

      );

    }

  }

}


// ======================

// BALLOON

// ======================


function drawBalloon() {

  push();

  translate(ball.x, ball.y);

  noStroke();


  let popScale = 1;

  let alpha = 255;


  if (isPopping) {

    let t = popTimer / popDuration;


    if (t < 0.5) {

      popScale = 1 + t * 2;      // expand

    } else {

      popScale = 2 - t * 2;      // shrink

      alpha = 255 * (1 - t);     // fade

    }

  }


  push();

  scale(scaleX * popScale, scaleY * popScale);


  // Balloon body

  fill(0, 100, 255, alpha);

  ellipse(0, 0, ball.r * 2, ball.r * 2.6);


  // Shine

  fill(255, 255, 255, 90 * (alpha / 255));

  ellipse(-ball.r * 0.4, -ball.r * 0.4, ball.r * 0.6);


  // 🎀 TIE (RESTORED)

  fill(0, 70, 220, alpha);

  let balloonTop = -ball.r * 1.3;

  let tieHeight = ball.r * 0.5;

  let tieWidth = ball.r * 0.4;


  triangle(

    -tieWidth / 2,

    balloonTop - tieHeight,

    tieWidth / 2,

    balloonTop - tieHeight,

    0,

    balloonTop

  );


  pop();


  pop();

}


// ======================

// WATER PARTICLES

// ======================


function createWaterBurst() {

  for (let i = 0; i < 25; i++) {

    waterParticles.push({

      x: ball.x,

      y: ball.y,

      vx: random(-4, 4),

      vy: random(-6, -1),

      size: random(4, 8),

      alpha: 255

    });

  }

}


function updateWaterParticles() {

  for (let i = waterParticles.length - 1; i >= 0; i--) {

    let w = waterParticles[i];


    w.vy += 0.3;

    w.x += w.vx;

    w.y += w.vy;

    w.alpha -= 8;


    fill(0, 150, 255, w.alpha);

    noStroke();

    ellipse(w.x, w.y, w.size);


    if (w.alpha <= 0) {

      waterParticles.splice(i, 1);

    }

  }

}


// ======================

// INPUT

// ======================


function keyPressed() {

  if (keyCode === UP_ARROW && onGround) {


    ball.vy = jumpStrength;

    onGround = false;

    targetScaleY = 1.4;

    targetScaleX = 0.6;


  } else if (keyCode === UP_ARROW && youCanDoubleJump) {


    ball.vy = jumpStrength;

    onGround = false;

    targetScaleY = 1.4;

    targetScaleX = 0.6;


    youCanDoubleJump = false;

  }

}


function mousePressed() {

  if (!gameStarted) gameStarted = true;

}


// ======================

// RESET

// ======================


function resetGame() {

  camY = 0;

  platforms = [];

  score = 0;


  lastPlatformY = null;

  lastPlatformId = null;

  lastSpikeY = -Infinity;


  youCanDoubleJump = false;

  lastDoubleJumpScore = 0;


  isPopping = false;

  popTimer = 0;

  waterParticles = [];


  generateInitialPlatforms();


  let spawnPlatform = platforms[0];


  ball = {

    x: spawnPlatform.x + spawnPlatform.w / 2,

    y: spawnPlatform.y - 22,

    r: 22,

    vx: 0,

    vy: 0

  };

}