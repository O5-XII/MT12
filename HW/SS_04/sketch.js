// variable setup/settings
let wallImg;
let expimg;
let font;

let wallvis = true;
let expstart = -1;
const expms = 200;
const wallX = 40;
const wallY = 80;
const wallW = 320;
const wallH = 220;

//preload
function preload() {
  wallImg = loadImage("preload/brick-wall.png");
  expimg = loadImage("preload/explosion.png");
  font = loadFont("preload/Inconsolata_Condensed-Regular.ttf");
}

//canvas create
function setup() {
  createCanvas(400, 400, WEBGL);
  textAlign(CENTER, CENTER);
  textFont(font);
}
//draw function
function draw() {
  background(20);
  translate(-width / 2, -height / 2);

  if (!wallvis) {
    drawWinText();
  }

  if (wallvis) {
    image(wallImg, wallX, wallY, wallW, wallH);
    drawClickMe();
  }

  if (expstart > 0) {
    const elapsed = millis() - expstart;
    if (elapsed <= expms) {
      image(expimg, wallX, wallY, wallW, wallH);
    } else {
      expstart = -1;
    }
  }
}

//mouse press check
function mousePressed() {
  if (!wallvis) return;

  const clickedWall =
    mouseX >= wallX &&
    mouseX <= wallX + wallW &&
    mouseY >= wallY &&
    mouseY <= wallY + wallH;

  if (clickedWall) {
    wallvis = false;
    expstart = millis();
  }
}
//things to do when click
function drawClickMe() {
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(36);
  text("click me", wallX + wallW / 2, wallY + wallH / 2);
}

function drawWinText() {
  fill(255, 240, 80);
  noStroke();
  textSize(54);
  text("YOU WIN", width / 2, height / 2);
  textSize(20);
  text("press f5", width / 2, height / 2 + 42);
}
