const FOV = 160, RANGE = 180, SPEED = 4, R = 22;
const KEY_A = 65, KEY_D = 68, KEY_W = 87, KEY_S = 83;
let px, py;
let fovMaskOn = false;
const box = { x: 350, y: 330, w: 100, h: 80 };

function setup() {
  createCanvas(700, 500);
  angleMode(DEGREES);
  px = width / 2;
  py = height / 2;
}

function draw() {
  background(242, 246, 252);
  movePlayer();

  const blue = atan2(mouseY - py, mouseX - px);
  const red = blue + 180;

  if (!fovMaskOn) {
    drawCone(px, py, blue, color(70, 130, 255, 75));
    drawCone(px, py, red, color(255, 90, 70, 75));
  }

  const boxPts = rectPoints(box);
  const boxCenter = [box.x + box.w / 2, box.y + box.h / 2];
  const boxTestPts = [...boxPts, boxCenter];
  const boxInBlue = boxTestPts.some(([x, y]) => inCone(x, y, px, py, blue));
  const boxInRed = boxTestPts.some(([x, y]) => inCone(x, y, px, py, red));

  const simPts = boxPts.map(([x, y]) => [2 * px - x, 2 * py - y]);
  const simCenter = [2 * px - boxCenter[0], 2 * py - boxCenter[1]];
  const simTestPts = [...simPts, simCenter];
  const simInBlue = simTestPts.some(([x, y]) => inCone(x, y, px, py, blue));

  drawBoxes(true, boxInRed);

  if (fovMaskOn) {
    applyFovMask(px, py, blue);
    drawCone(px, py, blue, color(70, 130, 255, 95));
    drawBoxes(boxInBlue, boxInRed && simInBlue);
  }

  noStroke();
  fill(35);
  circle(px, py, R * 2);
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(KEY_A)) px -= SPEED;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(KEY_D)) px += SPEED;
  if (keyIsDown(UP_ARROW) || keyIsDown(KEY_W)) py -= SPEED;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(KEY_S)) py += SPEED;
  px = constrain(px, R, width - R);
  py = constrain(py, R, height - R);
}

function keyPressed() {
  if (key === "f" || key === "F") {
    fovMaskOn = !fovMaskOn;
  }
}

function applyFovMask(ox, oy, a) {
  push();
  noStroke();
  fill(0, 235);
  rect(0, 0, width, height);
  erase();
  drawCone(ox, oy, a, color(0));
  noErase();
  pop();
}

function drawBoxes(showRealBox, showSimBox) {
  if (showRealBox) {
    noStroke();
    fill(55);
    rect(box.x, box.y, box.w, box.h, 10);
  }

  if (!showSimBox) return;
  noStroke();
  fill(70, 130, 255, 220);
  stroke(25, 80, 200);
  strokeWeight(2);
  beginShape();
  for (const [x, y] of rectPoints(box)) {
    vertex(2 * px - x, 2 * py - y);
  }
  endShape(CLOSE);
}

function drawCone(ox, oy, a, c) {
  noStroke();
  fill(c);
  beginShape();
  vertex(ox, oy);
  for (let t = a - FOV / 2; t <= a + FOV / 2; t += 2) {
    vertex(ox + cos(t) * RANGE, oy + sin(t) * RANGE);
  }
  endShape(CLOSE);
}

function inCone(x, y, ox, oy, a) {
  const dx = x - ox, dy = y - oy;
  if (sqrt(dx * dx + dy * dy) > RANGE) return false;
  const da = ((atan2(dy, dx) - a + 540) % 360) - 180;
  return abs(da) <= FOV / 2;
}

function rectPoints(r) {
  return [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ];
}
