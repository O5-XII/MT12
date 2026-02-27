let cX;
let cY;
const cs = 100;

function setup() {
  createCanvas(400, 400);
  relocateCircle();
}

function draw() {
  background(220);
  circle(cX, cY, cs);
}

function mousePressed() {
  let d = dist(mouseX, mouseY, cX, cY);
  if (d <= cs / 2) {
    relocateCircle();
  }
}

function relocateCircle() {
  cX = random(cs / 2, width - cs / 2);
  cY = random(cs / 2, height - cs / 2);
}
