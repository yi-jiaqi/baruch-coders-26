let cols = 20;
let rows = 15;
let blockSize = 40;
let world = [];
let offsetX = 0;
let player;
let mobs = [];
let inventory = ["mycelium"];
let selectedBlock = 0;
let mobSpawnTimer = 0;
let placeRange = 3;

document.oncontextmenu = () => false;

// ---------- SETUP ----------
function setup() {
  createCanvas(cols * blockSize, rows * blockSize);
  generateWorld();

  player = {
    x: floor(cols / 2),
    y: floor(rows / 2),
    size: blockSize * 0.8,
    velocityY: 0
  };
}

// ---------- DRAW LOOP ----------
function draw() {
  background(120, 180, 255); // sky

  drawWorld();
  updatePlayer();
  drawPlayer();
  spawnMobs();
  updateMobs();
  handleCollisions();
  drawInventory();
}

// ---------- WORLD GENERATION WITH ORES ----------
function generateWorld() {
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = -50; x < 50; x++) {
      if (y > rows / 2 + 2) {
        // Underground with ores
        let r = random();
        if (r < 0.02) row.push("diamond");
        else if (r < 0.06) row.push("gold");
        else if (r < 0.12) row.push("coal");
        else row.push("stone");
      } else if (y > rows / 2) {
        row.push("mycelium");
      } else {
        row.push("air");
      }
    }
    world.push(row);
  }
}

// ---------- DRAW WORLD WITH DESIGN ----------
function drawWorld() {
  for (let y = 0; y < rows; y++) {
    for (let x = -50; x < 50; x++) {
      let block = world[y][x + 50];
      let screenX = (x - offsetX) * blockSize;
      let centerX = screenX + blockSize/2;
      let centerY = y * blockSize + blockSize/2;

      if (block === "mycelium") {
        fill(150, 100, 170);
        rect(screenX, y * blockSize, blockSize, blockSize);
        fill(120, 70, 150);
        rect(screenX, y * blockSize, blockSize, 6);
        fill(170, 120, 190);
        for (let i = 0; i < 5; i++) ellipse(screenX + random(blockSize), y*blockSize + random(blockSize), 3, 3);
      }

      else if (block === "stone") {
        fill(100, 100, 100);
        rect(screenX, y*blockSize, blockSize, blockSize);
        fill(140);
        ellipse(centerX + 5, centerY + 5, 10);
        ellipse(centerX - 5, centerY - 5, 6);
      }

      else if (block === "coal") {
        fill(80,80,80);
        rect(screenX, y*blockSize, blockSize, blockSize);
        fill(30);
        ellipse(centerX-8, centerY-5, 8, 8);
        ellipse(centerX+6, centerY+4, 10, 10);
        fill(60);
        ellipse(centerX, centerY, 4, 4);
      }

      else if (block === "gold") {
        fill(180,150,0);
        rect(screenX, y*blockSize, blockSize, blockSize);
        fill(255,215,0);
        ellipse(centerX, centerY, 14, 14);
        fill(255,255,150,150);
        ellipse(centerX-3, centerY-3, 6, 6);
        fill(200,180,0);
        ellipse(centerX+4, centerY+4, 5, 5);
      }

      else if (block === "diamond") {
        fill(0,150,200);
        rect(screenX, y*blockSize, blockSize, blockSize);
        fill(0,255,255);
        ellipse(centerX, centerY, 12, 12);
        fill(180,255,255);
        ellipse(centerX-3, centerY-3, 6, 6);
        fill(0,180,200);
        ellipse(centerX+3, centerY+3, 4, 4);
        fill(255,255,255,200);
        for (let i=0; i<3; i++) ellipse(centerX+random(-5,5), centerY+random(-5,5), 2,2);
      }
    }
  }
}

// ---------- PLAYER ----------
function updatePlayer() {
  player.velocityY += 0.5;
  player.y += player.velocityY;

  if (keyIsDown(LEFT_ARROW)) { player.x -= 0.15; offsetX = max(offsetX-0.15,-50); }
  if (keyIsDown(RIGHT_ARROW)) { player.x += 0.15; offsetX = min(offsetX+0.15,50); }

  let px = floor(player.x)+50;
  let py = floor((player.y + player.size/2)/blockSize);
  if (py<rows && world[py][px] && world[py][px]!="air") {
    player.y = py*blockSize - player.size/2;
    player.velocityY = 0;
  }
}

function drawPlayer() {
  let screenX = (player.x-offsetX)*blockSize + blockSize*0.1;
  let y = player.y;
  let s = player.size;

  fill(50,120,255); rect(screenX + s*0.25, y + s*0.3, s*0.5, s*0.5, 6);
  fill(255,220,180); rect(screenX + s*0.3, y, s*0.4, s*0.35, 6);
  fill(0); ellipse(screenX + s*0.4, y + s*0.15, 4); ellipse(screenX + s*0.6, y + s*0.15, 4);

  let swing = sin(frameCount * 0.2) * 5;
  stroke(255,220,180); strokeWeight(4);
  line(screenX + s*0.25, y + s*0.4, screenX + s*0.15, y + s*0.6 + swing);
  line(screenX + s*0.75, y + s*0.4, screenX + s*0.85, y + s*0.6 - swing);
  noStroke();
}

// ---------- BLOCK PLACING ----------
function mousePressed() {
  let gridX = floor(mouseX/blockSize);
  let gridY = floor(mouseY/blockSize);
  let worldX = gridX + floor(offsetX);
  let worldIndex = worldX+50;
  if (worldIndex<0||worldIndex>=100) return;
  if (gridY<0||gridY>=rows) return;

  let distToPlayer = dist(player.x, player.y/blockSize, worldX, gridY);
  if (distToPlayer>placeRange) return;

  if (mouseButton===LEFT) world[gridY][worldIndex]="air";
  if (mouseButton===RIGHT && world[gridY][worldIndex]=="air")
    world[gridY][worldIndex]=inventory[selectedBlock];
}

// ---------- MOBS ----------
function spawnMobs() {
  mobSpawnTimer++;
  if (mobSpawnTimer>180) {
    let mx=floor(random(-50,50)), my=floor(rows/2);
    mobs.push({x:mx,y:my,size:blockSize*0.8,velocityY:0,direction:random([-1,1]),type:random(["cow","mooshroom"])});
    mobSpawnTimer=0;
  }
}

function updateMobs() {
  for(let mob of mobs){
    mob.velocityY+=0.3; mob.y+=mob.velocityY; mob.x+=mob.direction*0.02;

    let screenX=(mob.x-offsetX)*blockSize; let y=mob.y; let s=mob.size;
    if(mob.type==="cow"){
      fill(255); rect(screenX, y+s*0.3, s, s*0.5, 8); fill(0); ellipse(screenX+s*0.3, y+s*0.5, 12);
    } else {
      fill(200,0,0); rect(screenX, y+s*0.3, s, s*0.5, 8); fill(255); ellipse(screenX+s*0.4, y+s*0.2, 14);
    }
  }
}

// ---------- COLLISIONS ----------
function handleCollisions() {}

// ---------- INVENTORY ----------
function drawInventory(){
  fill(200); rect(10,height-50,140,40);
  fill(0); text("1: Mycelium",15,height-25);
}

// ---------- JUMP ----------
function keyPressed(){
  if(keyCode===UP_ARROW){
    let px=floor(player.x)+50;
    let py=floor((player.y+player.size/2+1)/blockSize);
    if(world[py][px] && world[py][px]!="air") player.velocityY=-10;
  }
  if(key==="1") selectedBlock=0;
}
