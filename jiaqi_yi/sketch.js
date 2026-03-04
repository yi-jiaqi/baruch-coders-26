let points = 0;
let colorOfBackground;
let colorOfBackground_Failed;
let button;
let buy;
let add = 1;
let add_change = 1;
let attempts = 50;

function setup() {
  textSize(30);
  colorOfBackground = color(220, 220, 220);
  colorOfBackground_Failed = color(255, 0, 0);

  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER);
  button = createButton("click me");
  button.position(50, 100);
  buy = createButton("buy boost");
  buy.position(300, 100);

  button.mousePressed(plusOne);

  buy.mousePressed(buyBoost);
}

function draw() {
  if (attempts <= 0) {
    background(colorOfBackground_Failed);
  } else {
    background(colorOfBackground);
  }

  text("High Score: ", width/2, 50);
  // text("Jayvian - 4891772 - 50 Attempts", 200, 80);
  
  
  text(points, width/2, 200);
  text("points:", width/2, 150);

  text("add:", width/2, 250);
  text(add, width/2, 300);

  text("Attempts Left:", width/2, 350);
  text(attempts, width/2, 400);

  text("Current High Score By Benji: 134,217,812", width/2, 450);
}

function plusOne() {
  if (attempts > 0) {
    attempts -= 1;
    points += add;
  }
}
function buyBoost() {
  if (attempts > 0) {
    attempts -= 1;

    let points_copy = points;
    let price = 1;
    let buyable = false;
    if (points_copy >= 10) {
      points_copy /= 10;
      price *= 10;
      add_change *= 2;
      buyable = true;
    }
    if (buyable) {
      points -= price;
      add = add_change;
    }
  }
}
