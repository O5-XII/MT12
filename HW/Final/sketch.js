let cnv;
let camP, camT;
let yaw, pitch;
let bodyH, bodyVY, isGrounded;
let blocks, spheres;
let gameStarted;

const MOVE_SPEED = 5;
const MOUSE_SENSITIVITY = 0.003;
const GRAVITY = 0.8;
const TARGET_RADIUS = 50;
const TARGET_LIFETIME = 2500;
const TARGET_RESPAWN_DELAY = 350;
const grey1 = [180, 180, 180];
const blue1 = [127,255,212];

function setup() {
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  createCrosshair();
  shininess(255)
  specularMaterial(19,25,19)
  camP = createVector(0, -100, 650);
  camT = createVector(0, 0, 0);
  yaw = 0;
  pitch = 0;
  bodyH = 140;
  bodyVY = 0;
  isGrounded = false;
  gameStarted = false;

  blocks = [
    {pos: createVector(0, 150, 650), size: createVector(600, 100, 600), color: grey1 },
    {pos: createVector(0,-250,0), size: createVector(900,700,10), color: grey1, isFrame: true } //frame
  ];

  spheres = [createTarget()];
  spawnStartTarget(spheres[0]);
}

function draw() {
  background(12, 14, 20);

  movePlayerCamera();
  updateCameraTarget();
  camera(camP.x, camP.y, camP.z, camT.x, camT.y, camT.z, 0, 1, 0);

  ambientLight(80);
  directionalLight(255, 255, 255, -0.5, 0.75, -1);

  updateTargets();
  drawWorld();
}

function createCrosshair() {
  let crosshair = document.createElement('div');
  crosshair.id = 'crosshair';
  crosshair.innerHTML = '<span class="crosshair-line crosshair-horizontal"></span><span class="crosshair-line crosshair-vertical"></span>';
  document.body.appendChild(crosshair);
}

function drawWorld(){
  drawWBlocks();
  drawSpheres();
}

function drawWBlocks() {
  for (let block of blocks) {
    push();
    translate(block.pos.x, block.pos.y, block.pos.z);
    noStroke();
    fill(block.color[0], block.color[1], block.color[2]);
    box(block.size.x, block.size.y, block.size.z);
    pop();
  }
}

function drawSpheres() {
  for (let ball of spheres) {
    if (!ball.active) continue;

    push();
    translate(ball.pos.x, ball.pos.y, ball.pos.z);
    noStroke();
    fill(ball.color[0], ball.color[1], ball.color[2]);
    sphere(ball.radius);
    pop();
  }
}

function createTarget() {
  let target = {
    pos: createVector(0, 0, 0),
    radius: TARGET_RADIUS,
    color: blue1,
    active: false,
    visibleUntil: 0,
    respawnAt: 0
  };

  return target;
}

function updateTargets() {
  if (!gameStarted) return;

  let now = millis();

  for (let target of spheres) {
    if (target.active && now > target.visibleUntil) {
      hideTarget(target);
    }

    if (!target.active && now > target.respawnAt) {
      spawnTarget(target);
    }
  }
}

function spawnTarget(target, startsTimer = true) {
  target.pos = getTargetSpawnPosition(target.radius);
  target.active = true;
  target.visibleUntil = startsTimer ? millis() + TARGET_LIFETIME : Infinity;
}

function spawnStartTarget(target) {
  target.pos = getStartTargetPosition(target.radius);
  target.active = true;
  target.visibleUntil = Infinity;
}

function hideTarget(target) {
  target.active = false;
  target.respawnAt = millis() + TARGET_RESPAWN_DELAY;
}

function getTargetSpawnPosition(radius) {
  let frame = getFrameBlock();
  let minX = frame.pos.x - frame.size.x / 2 + radius;
  let maxX = frame.pos.x + frame.size.x / 2 - radius;
  let minY = frame.pos.y - frame.size.y / 2 + radius;
  let maxY = frame.pos.y + frame.size.y / 2 - radius;
  let z = frame.pos.z + frame.size.z / 2 + radius;

  return createVector(random(minX, maxX), random(minY, maxY), z);
}

function getStartTargetPosition(radius) {
  let frame = getFrameBlock();
  let floor = blocks[0];
  let startY = floor.pos.y - floor.size.y / 2 - bodyH;
  let z = frame.pos.z + frame.size.z / 2 + radius;

  return createVector(camP.x, startY, z);
}

function getFrameBlock() {
  return blocks.find(block => block.isFrame);
}

function movePlayerCamera() {
  let moveFwd = createVector(sin(yaw), 0, -cos(yaw)).normalize();
  let right = createVector(cos(yaw), 0, sin(yaw)).normalize();
  let move = createVector(0, 0, 0);

  if (keyIsDown(87)) move.add(moveFwd);
  if (keyIsDown(83)) move.sub(moveFwd);
  if (keyIsDown(68)) move.add(right);
  if (keyIsDown(65)) move.sub(right);

  if (move.mag() > 0) {
    move.normalize();
    move.mult(MOVE_SPEED);
    camP.add(move);
  }

  bodyVY += GRAVITY;
  camP.y += bodyVY;
  checkFloorCollision();
}

function checkFloorCollision() {
  isGrounded = false;

  for (let block of blocks) {
    let minX = block.pos.x - block.size.x / 2;
    let maxX = block.pos.x + block.size.x / 2;
    let minY = block.pos.y - block.size.y / 2;
    let minZ = block.pos.z - block.size.z / 2;
    let maxZ = block.pos.z + block.size.z / 2;

    let insideX = camP.x >= minX && camP.x <= maxX;
    let insideZ = camP.z >= minZ && camP.z <= maxZ;
    let feetY = camP.y + bodyH;
    let standingOnTop = feetY >= minY && feetY <= minY + abs(bodyVY) + GRAVITY + 1;

    if (insideX && insideZ && bodyVY >= 0 && standingOnTop) {
      camP.y = minY - bodyH;
      bodyVY = 0;
      isGrounded = true;
    }
  }
}

function updateCameraTarget() {
  let lookDirection = getLookDirection();

  camT.set(
    camP.x + lookDirection.x * 1000,
    camP.y + lookDirection.y * 1000,
    camP.z + lookDirection.z * 1000
  );
}

function getLookDirection() {
  return createVector(
    sin(yaw) * cos(pitch),
    sin(pitch),
    -cos(yaw) * cos(pitch)
  ).normalize();
}

function mousePressed() {
  requestPointerLock();
  checkTargetClick();
}

function checkTargetClick() {
  let direction = getLookDirection();
  let closestHit = null;
  let closestDistance = Infinity;

  for (let target of spheres) {
    if (!target.active) continue;

    let toTarget = target.pos.copy().sub(camP);
    let distanceForward = toTarget.dot(direction);
    let distanceFromRaySq = toTarget.dot(toTarget) - distanceForward * distanceForward;

    if (
      distanceForward > 0 &&
      distanceFromRaySq <= target.radius * target.radius &&
      distanceForward < closestDistance
    ) {
      closestHit = target;
      closestDistance = distanceForward;
    }
  }

  if (closestHit) {
    gameStarted = true;
    spawnTarget(closestHit);
  }
}

function mouseMoved() {
  if (!isPointerLocked()) return;

  yaw += movedX * MOUSE_SENSITIVITY;
  pitch += movedY * MOUSE_SENSITIVITY;
  pitch = constrain(pitch, -PI / 2 + 0.01, PI / 2 - 0.01);
}

function isPointerLocked() {
  return document.pointerLockElement === cnv.elt;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
