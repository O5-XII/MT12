//press b to turn on show last pos
//variables
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

//draw circles
function draw() {
  background(220);
  if (sP && pcX !== undefined && pcY !== undefined) {
    fill(180);
    circle(pcX, pcY, cs);
  }
  fill(255);
  circle(cX, cY, cs);
}
//check if mouse is within the diamiter
function mousePressed() {
  let d = dist(mouseX, mouseY, cX, cY);
  if (d <= cs / 2) {
    relocateCircle();
  }
}
//randomly set circle location while storing previos
function relocateCircle() {
  pcX = cX;
  pcY = cY;
  cX = random(cs / 2, width - cs / 2);
  cY = random(cs / 2, height - cs / 2);
}

//simple value toggle
function keyPressed() {
  if (key === "b") {
    sP = !sP;
  }
}
