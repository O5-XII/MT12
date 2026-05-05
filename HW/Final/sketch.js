let cnv;
let camP, camT;
let yaw, pitch;
let bodyH, bodyVY, isGrounded;
let blocks;

const MOVE_SPEED = 5;
const MOUSE_SENSITIVITY = 0.003;
const GRAVITY = 0.8;
const grey1 = [180, 180, 180];
const blue1 = [127,255,212];

function setup() {
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  shininess(255)
  specularMaterial(19,25,19)
  camP = createVector(0, -100, 650);
  camT = createVector(0, 0, 0);
  yaw = 0;
  pitch = 0;
  bodyH = 140;
  bodyVY = 0;
  isGrounded = false;

  blocks = [
    {pos: createVector(0, 150, 650), size: createVector(600, 100, 600), color: grey1 },
    {pos: createVector(0,-250,0), size: createVector(900,700,10), color: grey1 }
  ];
  spheres = [
    {pos: createVector(0,0,0), radius: 50, color: blue1},
    {pos: createVector(240, -253,0), radius: 50, color: blue1},
    {pos: createVector(-225,-40, 0), radius: 50, color: blue1}
  ]
}

function draw() {
  background(12, 14, 20);

  movePlayerCamera();
  updateCameraTarget();
  camera(camP.x, camP.y, camP.z, camT.x, camT.y, camT.z, 0, 1, 0);

  ambientLight(80);
  directionalLight(255, 255, 255, -0.5, 0.75, -1);

  drawWorld();
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
    push();
    translate(ball.pos.x, ball.pos.y, ball.pos.z);
    noStroke();
    fill(ball.color[0], ball.color[1], ball.color[2]);
    sphere(ball.radius);
    pop();
  }
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
  let dirX = sin(yaw) * cos(pitch);
  let dirY = sin(pitch);
  let dirZ = -cos(yaw) * cos(pitch);

  camT.set(
    camP.x + dirX * 1000,
    camP.y + dirY * 1000,
    camP.z + dirZ * 1000
  );
}

function mousePressed() {
  requestPointerLock();
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
