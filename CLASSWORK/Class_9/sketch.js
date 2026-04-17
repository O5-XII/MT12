const FOV = 160, RANGE = 180, SPEED = 4, R = 22;
let px, py;
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

  drawCone(px, py, blue, color(70, 130, 255, 75));
  drawCone(px, py, red, color(255, 90, 70, 75));

  noStroke();
  fill(55);
  rect(box.x, box.y, box.w, box.h, 10);

  const testPts = [...rectPoints(box), [box.x + box.w / 2, box.y + box.h / 2]];
  if (testPts.some(([x, y]) => inCone(x, y, px, py, red))) {
    fill(70, 130, 255, 220);
    stroke(25, 80, 200);
    strokeWeight(2);
    beginShape();
    for (const [x, y] of rectPoints(box)) {
      vertex(2 * px - x, 2 * py - y);
    }
    endShape(CLOSE);
  }

  noStroke();
  fill(35);
  circle(px, py, R * 2);
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW)) px -= SPEED;
  if (keyIsDown(RIGHT_ARROW)) px += SPEED;
  if (keyIsDown(UP_ARROW)) py -= SPEED;
  if (keyIsDown(DOWN_ARROW)) py += SPEED;
  px = constrain(px, R, width - R);
  py = constrain(py, R, height - R);
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
