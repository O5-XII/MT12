let cX;
let cY;
let pcX;
let pcY;
let sP = false;
const cs = 100;

function setup() {
  createCanvas(400, 400);
  relocateCircle();
}

function draw() {
  background(220);
  if (sP && pcX !== undefined && pcY !== undefined) {
    fill(180);
    circle(pcX, pcY, cs);
  }
  fill(255);
  circle(cX, cY, cs);
}

function mousePressed() {
  let d = dist(mouseX, mouseY, cX, cY);
  if (d <= cs / 2) {
    relocateCircle();
  }
}

function relocateCircle() {
  pcX = cX;
  pcY = cY;
  cX = random(cs / 2, width - cs / 2);
  cY = random(cs / 2, height - cs / 2);
}

function keyPressed() {
  if (key === "b") {
    sP = !sP;
  }
}
