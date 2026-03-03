class Enemy {
  constructor(x, y, hp = 3) {
    this.pos = createVector(x, y);
    this.w = 30;
    this.h = 30;
    this.maxHP = hp;
    this.hp = hp;
    this.invuln = 0;
    this.attackCooldown = 0;
  }

  takeDamage(d) {
    if (this.invuln > 0) return;
    this.hp -= d;
    if (this.hp < 0) this.hp = 0;
    this.invuln = 10;
  }

  updateBase() {
    if (this.invuln > 0) this.invuln--;
    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  hit(box) {
    return (
      box.x < this.pos.x + this.w &&
      box.x + box.w > this.pos.x &&
      box.y < this.pos.y + this.h &&
      box.y + box.h > this.pos.y
    );
  }

  touches(player) {
    return (
      this.pos.x < player.pos.x + player.w &&
      this.pos.x + this.w > player.pos.x &&
      this.pos.y < player.pos.y + player.h &&
      this.pos.y + this.h > player.pos.y
    );
  }

  drawHP() {
    fill(0);
    rect(this.pos.x, this.pos.y - 10, this.w, 5);
    fill(255, 50, 50);
    rect(this.pos.x, this.pos.y - 10, this.w * (this.hp / this.maxHP), 5);
  }
}

// Melee Enemy
class MeleeEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 4);
  }

  update(player) {
    this.updateBase();
    this.pos.x += player.pos.x < this.pos.x ? -1 : 1;

    if (this.attackCooldown === 0 && this.touches(player)) {
      player.hp--;
      this.attackCooldown = 60;
    }
  }

  draw() {
    fill(200, 60, 60);
    rect(this.pos.x, this.pos.y, this.w, this.h, 4);
    fill(0);
    rect(this.pos.x + 8, this.pos.y + 10, 4, 4);
    rect(this.pos.x + 18, this.pos.y + 10, 4, 4);
    this.drawHP();
  }
}

// Ranged Enemy
class RangedEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 3);
    this.projectiles = [];
  }

  update(player) {
    this.updateBase();

    // Shoot at player every 90 frames
    if (frameCount % 90 === 0) {
      let dir = createVector(
        player.pos.x + player.w / 2 - (this.pos.x + this.w / 2),
        player.pos.y + player.h / 2 - (this.pos.y + this.h / 2)
      );
      dir.setMag(5);
      this.projectiles.push(
        new Projectile(
          this.pos.x + this.w / 2,
          this.pos.y + this.h / 2,
          dir.x,
          dir.y
        )
      );
    }

    // Update projectiles
    for (let p of this.projectiles) p.update(player);
    this.projectiles = this.projectiles.filter((p) => !p.toRemove);
  }

  draw() {
    fill(200, 200, 60);
    rect(this.pos.x, this.pos.y, this.w, this.h, 4);
    fill(0);
    ellipse(this.pos.x + 15, this.pos.y + 15, 6);

    // Draw projectiles
    for (let p of this.projectiles) p.draw();
    this.drawHP();
  }
}

// Boss base
class Boss extends Enemy {
  constructor(x, y, hp = 12) {
    super(x, y, hp);
    this.w = 60;
    this.h = 60;
  }
}

class Boss1 extends Boss {
  update(player) {
    this.updateBase();
    this.pos.x += sin(frameCount * 0.05) * 2;
  }

  draw() {
    fill(160, 0, 200);
    rect(this.pos.x, this.pos.y, this.w, this.h, 8);
    fill(255);
    rect(this.pos.x + 20, this.pos.y + 20, 6, 6);
    rect(this.pos.x + 35, this.pos.y + 20, 6, 6);
    this.drawHP();
  }
}

class Boss2 extends Boss {
  constructor(x, y) {
    super(x, y, 15);
    this.startX = x;
    this.projectiles = [];
  }

  update(player) {
    this.updateBase();
    this.pos.x = this.startX + sin(frameCount * 0.05) * 100;

    // Shoot at player every 120 frames
    if (frameCount % 120 === 0) {
      let dir = createVector(
        player.pos.x + player.w / 2 - (this.pos.x + this.w / 2),
        player.pos.y + player.h / 2 - (this.pos.y + this.h / 2)
      );
      dir.setMag(6);
      this.projectiles.push(
        new Projectile(
          this.pos.x + this.w / 2,
          this.pos.y + this.h / 2,
          dir.x,
          dir.y,
          2
        )
      );
    }

    // Update projectiles
    for (let p of this.projectiles) p.update(player);
    this.projectiles = this.projectiles.filter((p) => !p.toRemove);

    // Touch damage
    if (this.touches(player) && this.attackCooldown === 0) {
      player.hp--;
      this.attackCooldown = 60;
    }
  }

  draw() {
    fill(0, 180, 160);
    rect(this.pos.x, this.pos.y, this.w, this.h, 8);
    fill(0);
    ellipse(this.pos.x + 30, this.pos.y + 30, 10);

    // Draw projectiles
    for (let p of this.projectiles) p.draw();
    this.drawHP();
  }
}

class Projectile {
  constructor(x, y, vx, vy, damage = 1) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.w = 10;
    this.h = 10;
    this.damage = damage;
    this.toRemove = false;
  }

  update(player) {
    this.pos.add(this.vel);

    // Damage player if hits
    if (
      this.pos.x < player.pos.x + player.w &&
      this.pos.x + this.w > player.pos.x &&
      this.pos.y < player.pos.y + player.h &&
      this.pos.y + this.h > player.pos.y
    ) {
      player.hp -= this.damage;
      this.toRemove = true;
    }

    // Remove if off screen
    if (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    ) {
      this.toRemove = true;
    }
  }

  draw() {
    fill(255, 100, 0);
    ellipse(this.pos.x + this.w / 2, this.pos.y + this.h / 2, this.w, this.h);
  }
}

class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.w = 30;
    this.h = 40;
    this.onGround = false;
    this.facing = 1;

    this.maxHP = 10;
    this.hp = this.maxHP;
    this.attackTimer = 0;
  }

  update(platforms) {
    // Movement
    if (keyIsDown(65)) this.vel.x = -4;
    else if (keyIsDown(68)) this.vel.x = 4;
    else this.vel.x *= 0.8;

    if (keyIsDown(87) && this.onGround) {
      this.vel.y = -12;
      this.onGround = false;
    }

    // Gravity
    this.vel.y += 0.8;
    this.pos.add(this.vel);

    // Platform collisions
    this.onGround = false;
    for (let p of platforms) {
      if (this.collide(p)) {
        this.pos.y = p.y - this.h;
        this.vel.y = 0;
        this.onGround = true;
      }
    }

    // Clamp inside canvas
    this.pos.x = constrain(this.pos.x, 0, width - this.w);

    // Facing
    if (this.vel.x !== 0) this.facing = Math.sign(this.vel.x);

    // Attack timer
    if (this.attackTimer > 0) this.attackTimer--;
  }

  attack() {
    if (this.attackTimer === 0) this.attackTimer = 15;
  }

  isAttacking() {
    return this.attackTimer > 0;
  }

  swordHitbox() {
    return {
      x: this.pos.x + this.facing * this.w,
      y: this.pos.y + 10,
      w: 25,
      h: 20,
    };
  }
  draw() {
    push();
    translate(this.pos.x + this.w / 2, this.pos.y + this.h / 2);

    let attacking = this.isAttacking();
    let jumping = !this.onGround;

    // Body color based on state
    fill(80, 180, 255);
    if (attacking && jumping) fill(255, 150, 50);
    else if (attacking) fill(180, 100, 255);
    else if (jumping) fill(100, 180, 255);

    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 5);

    // Face
    fill(0);
    circle(this.facing * 10, -this.h / 2 + 15, 4);

    // Sword
    if (attacking) {
      fill(220);

      // Calculate swing
      let swing = sin(map(this.attackTimer, 15, 0, 0, PI)) * 15;
      let dir = this.facing;

      // If jumping & attacking, swing upwards
      if (jumping) swing = -abs(swing);

      // Sword handle
      rect(dir * (this.w / 2 + 5), -5, 5, 20);

      // Blade with wave
      beginShape();
      vertex(dir * (this.w / 2 + 5), -5);
      vertex(dir * (this.w / 2 + 5) + swing, -10);
      vertex(dir * (this.w / 2 + 20) + swing, -8);
      vertex(dir * (this.w / 2 + 20), 5);
      vertex(dir * (this.w / 2 + 5), 10);
      endShape(CLOSE);
    }

    pop();
  }

  drawHP() {
    fill(0);
    rect(20, 20, 104, 14);
    fill(50, 220, 50);
    rect(22, 22, 100 * (this.hp / this.maxHP), 10);
  }

  collide(p) {
    let prevBottom = this.pos.y + this.h - this.vel.y;
    let currBottom = this.pos.y + this.h;

    return (
      this.pos.x < p.x + p.w &&
      this.pos.x + this.w > p.x &&
      this.vel.y >= 0 &&
      prevBottom <= p.y &&
      currBottom >= p.y
    );
  }

  updateHealth() {
    // Clamp HP
    if (this.hp > this.maxHP) this.hp = this.maxHP;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    // For now: reset position and enemies stay
    this.pos = createVector(50, 300);
    this.vel.set(0, 0);
    // Optionally reset HP
    this.hp = this.maxHP;
  }
}

let game;

function setup() {
  createCanvas(800, 450);
  game = new Game();
}

function draw() {
  background(25);
  game.update();
  game.draw();
}

function keyPressed() {
  if (key === " ") game.player.attack();
}

// Game class
class Game {
  constructor() {
    this.levelIndex = 0;
    this.levels = [new Level1(), new Level2(), new Level3(), new Level4()];
    this.loadLevel();
  }

  loadLevel() {
    this.level = this.levels[this.levelIndex];
    this.player = new Player(50, 300);
  }

  update() {
    this.player.update(this.level.platforms);

    this.player.updateHealth();

    // Update enemies
    for (let e of this.level.enemies) {
      e.update(this.player);
      if (this.player.isAttacking() && e.hit(this.player.swordHitbox())) {
        e.takeDamage(1);
      }
    }
    this.level.enemies = this.level.enemies.filter((e) => e.hp > 0);

    // Boss
    if (this.level.boss) {
      this.level.boss.update(this.player);
      if (
        this.player.isAttacking() &&
        this.level.boss.hit(this.player.swordHitbox())
      ) {
        this.level.boss.takeDamage(1);
      }
      if (this.level.boss.hp <= 0) this.level.completed = true;
    }

    if (this.level.completed) {
      this.levelIndex++;
      if (this.levelIndex < this.levels.length) this.loadLevel();
    }
  }

  draw() {
    // Draw platforms
    fill(120);
    for (let p of this.level.platforms) rect(p.x, p.y, p.w, p.h);

    // Draw enemies
    for (let e of this.level.enemies) e.draw();

    // Draw boss
    if (this.level.boss) this.level.boss.draw();

    // Draw player
    this.player.draw();
    this.player.drawHP();
  }
}

// Levels
class Level {
  constructor() {
    this.platforms = [];
    this.enemies = [];
    this.boss = null;
    this.completed = false;
  }
}

class Level1 extends Level {
  constructor() {
    super();
    this.platforms = [
      { x: 0, y: 400, w: 800, h: 50 },
      { x: 220, y: 300, w: 140, h: 20 },
    ];
    this.enemies = [new MeleeEnemy(350, 360)];
    this.boss = new Boss1(600, 340);
  }
}

class Level2 extends Level {
  constructor() {
    super();
    this.platforms = [
      { x: 0, y: 400, w: 800, h: 50 },
      { x: 150, y: 280, w: 140, h: 20 },
      { x: 480, y: 240, w: 140, h: 20 },
    ];
    this.enemies = [new RangedEnemy(300, 360), new MeleeEnemy(500, 360)];
    this.boss = new Boss2(650, 340);
  }
}

class Level3 extends Level {
  constructor() {
    super();
    this.platforms = [
      { x: 0, y: 400, w: 800, h: 50 },
      { x: 100, y: 320, w: 120, h: 20 },
      { x: 300, y: 260, w: 140, h: 20 },
      { x: 550, y: 200, w: 120, h: 20 },
    ];
    this.enemies = [
      new MeleeEnemy(150, 360),
      new RangedEnemy(320, 220),
      new MeleeEnemy(580, 160),
    ];
    this.boss = new Boss1(700, 340); // reuse Boss1 type
  }
}

class Level4 extends Level {
  constructor() {
    super();
    this.platforms = [
      { x: 0, y: 400, w: 800, h: 50 },
      { x: 180, y: 330, w: 120, h: 20 },
      { x: 400, y: 270, w: 140, h: 20 },
      { x: 620, y: 220, w: 120, h: 20 },
    ];
    this.enemies = [
      new RangedEnemy(200, 290),
      new RangedEnemy(450, 230),
      new MeleeEnemy(650, 180),
    ];
    this.boss = new Boss2(700, 340); // reuse Boss2
  }
}