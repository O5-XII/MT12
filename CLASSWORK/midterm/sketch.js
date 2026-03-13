let camP;
let camT;
let worldUp;
let VX;
let VY;
let yaw;
let pitch;
let bodyR;
let bodyH;
let bodyVY;
let isGrounded;
let showInfo;
let showMenu;
let debugFont;
let blocks;
const MOVE_SPEED = 5;
const GRAVITY = 0.8;
const JUMP_VELOCITY = -14;
const MENU_CAM = { x: 900, y: -450, z: 1200, tx: 0, ty: 100, tz: 0 };
const MENU_BTN = { w: 220, h: 60, depth: 0.45 };

function preload() {
  debugFont = loadFont('preload/Inconsolata_Condensed-Regular.ttf')
}

function setup() {
  createCanvas(1000,500,WEBGL);
  camP=createVector(0,-100,900) //spawn position
  camT=createVector(0,0,0)
  worldUp=createVector(0,1,0)
  VX = width / 2
  VY = height / 2
  yaw = 0
  pitch = 0
  bodyR = 35
  bodyH = 140
  bodyVY = 0
  isGrounded = false
  showInfo = false
  showMenu = true
  //map buliding
  blocks = [
    { pos: createVector(200, 0, 0), size: createVector(200, 200, 200) },
    { pos: createVector(-200, 0, 0), size: createVector(200, 200, 200) },
    { pos: createVector(0, 150, 0), size: createVector(600, 100, 2000) }
  ]
  
}

function draw() {
  background(220);

  let dirX = sin(yaw) * cos(pitch);
  let dirY = sin(pitch);
  let dirZ = -cos(yaw) * cos(pitch);
  let lookFwd = createVector(dirX, dirY, dirZ).normalize();
  let moveFwd = createVector(sin(yaw),0,-cos(yaw)).normalize();
  let right=createVector(cos(yaw),0,sin(yaw)).normalize();
  let move = getMoveInput(moveFwd, right)

  if (!showMenu) movePlayer(move);

  camT.set(
    camP.x + lookFwd.x * 1000,
    camP.y + lookFwd.y * 1000,
    camP.z + lookFwd.z * 1000
  )

  setActiveCamera()
  drawWorld()
  drawMenu()
  drawDebug(lookFwd, right)
}

// menu and some camera stuff
function setActiveCamera() {
  if (showMenu) {
    camera(MENU_CAM.x, MENU_CAM.y, MENU_CAM.z, MENU_CAM.tx, MENU_CAM.ty, MENU_CAM.tz, 0, 1, 0)
  } else {
    camera(camP.x, camP.y, camP.z, camT.x, camT.y, camT.z, 0, 1, 0)
  }
}

function drawWorld() {
  ambientLight(200)

  push()
  translate(camP.x, camP.y + bodyH + 20, camP.z)
  normalMaterial()
  cylinder(bodyR, bodyH)
  pop()

  for (let block of blocks) {
    push()
    translate(block.pos.x, block.pos.y, block.pos.z)
    box(block.size.x, block.size.y, block.size.z)
    pop()
  }
}

function drawMenu() {
  if (!showMenu) return
  drawStartButton()
}

function drawStartButton() {
  let buttonP = getMenuButtonPosition()
  let menuCamP = createVector(MENU_CAM.x, MENU_CAM.y, MENU_CAM.z)
  let toMenuCam = p5.Vector.sub(menuCamP, buttonP).normalize()
  let buttonYaw = atan2(toMenuCam.x, toMenuCam.z)
  let buttonPitch = -atan2(toMenuCam.y, sqrt(toMenuCam.x * toMenuCam.x + toMenuCam.z * toMenuCam.z))

  push()
  translate(buttonP.x, buttonP.y, buttonP.z)
  rotateY(buttonYaw)
  rotateX(buttonPitch)
  noStroke()
  rectMode(CENTER)
  fill(15, 15, 15, 185)
  rect(0, 0, MENU_BTN.w, MENU_BTN.h, 18)
  stroke(255)
  strokeWeight(2)
  noFill()
  rect(0, 0, MENU_BTN.w, MENU_BTN.h, 18)
  noStroke()
  fill(255)
  textFont(debugFont)
  textAlign(CENTER, CENTER)
  textSize(22)
  text('PRESS ENTER', 0, 2)
  pop()
}

function drawDebug(lookFwd, right) {
  if (showInfo) {
    debugMode(300, 10, 0, 100, 0)
    drawDebugInfo(lookFwd, right)
  } else {
    noDebugMode()
  }
}

// keybinds
function getMoveInput(moveFwd, right) {
  let move = createVector(0,0,0)
  if (showMenu) return move

  if(keyIsDown(87)) move.add(p5.Vector.mult(moveFwd, MOVE_SPEED))
  if(keyIsDown(83)) move.add(p5.Vector.mult(moveFwd,-MOVE_SPEED))
  if(keyIsDown(68)) move.add(p5.Vector.mult(right,MOVE_SPEED))
  if(keyIsDown(65)) move.add(p5.Vector.mult(right,-MOVE_SPEED))
  return move
}

function mouseMoved() {
  if (showMenu) return
  VX = constrain(VX + movedX, 0, width)
  VY = constrain(VY + movedY, 0, height)
  yaw += movedX * 0.003
  pitch += movedY * 0.003
  pitch = constrain(pitch, -PI / 2 + 0.01, PI / 2 - 0.01)
}

function doubleClicked() {
  if (!showMenu) requestPointerLock();
}

function mousePressed() {
  if (showMenu && overStartButton()) startGame()
}

function keyPressed() {
  if (showMenu) {
    if (keyCode === ENTER || key === ' ') startGame()
    return
  }

  if (keyCode === 32 && isGrounded) {
    bodyVY = JUMP_VELOCITY
    isGrounded = false
  }

  toggleDebug()
}

function startGame() {
  showMenu = false
  requestPointerLock()
}

function overStartButton() {
  let buttonP = getMenuButtonPosition()
  let screenP = screenPosition(buttonP.x, buttonP.y, buttonP.z)
  let halfW = MENU_BTN.w / 2
  let halfH = MENU_BTN.h / 2

  return mouseX >= screenP.x - halfW && mouseX <= screenP.x + halfW &&
    mouseY >= screenP.y - halfH && mouseY <= screenP.y + halfH
}

function getMenuButtonPosition() {
  let menuCamP = createVector(MENU_CAM.x, MENU_CAM.y, MENU_CAM.z)
  let menuCamT = createVector(MENU_CAM.tx, MENU_CAM.ty, MENU_CAM.tz)
  return p5.Vector.lerp(menuCamT, menuCamP, MENU_BTN.depth)
}

// debug
function toggleDebug() {
  if (key === 'i' || key === 'I') {
    showInfo = !showInfo
  }
}

function drawDebugInfo(lookFwd, right) {
  
  let info = [
    `camP: ${nf(camP.x, 1, 1)}, ${nf(camP.y, 1, 1)}, ${nf(camP.z, 1, 1)}`,
    `camT: ${nf(camT.x, 1, 1)}, ${nf(camT.y, 1, 1)}, ${nf(camT.z, 1, 1)}`,
    `yaw: ${nf(yaw, 1, 3)}`,
    `pitch: ${nf(pitch, 1, 3)}`,
    `bodyR: ${bodyR}`,
    `bodyH: ${bodyH}`,
    `bodyVY: ${nf(bodyVY, 1, 2)}`,
    `grounded: ${isGrounded}`,
    `blocks: ${blocks.length}`
  ]

  let panelP = p5.Vector.add(camP, p5.Vector.mult(lookFwd, 260))
  panelP.add(p5.Vector.mult(right, -90))
  panelP.y -= 40
  let toCam = p5.Vector.sub(camP, panelP).normalize()
  let panelYaw = atan2(toCam.x, toCam.z)
  let panelPitch = -atan2(toCam.y, sqrt(toCam.x * toCam.x + toCam.z * toCam.z))

  push()
  translate(panelP.x, panelP.y, panelP.z)
  rotateY(panelYaw)
  rotateX(panelPitch)
  scale(0.7, 0.7, 0.7)
  noLights()
  fill(0)
  textFont(debugFont)
  textSize(14)
  textAlign(LEFT, TOP)
  text(info.join('\n'), 0, 0)
  pop()
}

// movement + collisions
function movePlayer(move) {
  camP.x += move.x
  HorizCollisions()
  camP.z += move.z
  HorizCollisions()

  isGrounded = false
  bodyVY += GRAVITY
  camP.y += bodyVY
  VertCollisions()
}
function HorizCollisions() {
  for (let block of blocks) {
    let minX = block.pos.x - block.size.x / 2
    let maxX = block.pos.x + block.size.x / 2
    let minY = block.pos.y - block.size.y / 2
    let maxY = block.pos.y + block.size.y / 2
    let minZ = block.pos.z - block.size.z / 2
    let maxZ = block.pos.z + block.size.z / 2

    let top = camP.y
    let bottom = camP.y + bodyH
    if (bottom <= minY || top >= maxY) continue

    let nearX = constrain(camP.x, minX, maxX)
    let nearZ = constrain(camP.z, minZ, maxZ)
    let dx = camP.x - nearX
    let dz = camP.z - nearZ
    let distSq = dx * dx + dz * dz

    if (distSq >= bodyR * bodyR) continue

    if (distSq > 0.0001) {
      let dist = sqrt(distSq)
      let push = bodyR - dist
      camP.x += (dx / dist) * push
      camP.z += (dz / dist) * push
      continue
    }

    let pushL = abs(camP.x - minX)
    let pushR = abs(maxX - camP.x)
    let pushF = abs(camP.z - minZ)
    let pushB = abs(maxZ - camP.z)
    let minPush = min(pushL, pushR, pushF, pushB)

    if (minPush === pushL) camP.x = minX - bodyR
    else if (minPush === pushR) camP.x = maxX + bodyR
    else if (minPush === pushF) camP.z = minZ - bodyR
    else camP.z = maxZ + bodyR
  }
}

function VertCollisions() {
  for (let block of blocks) {
    let minX = block.pos.x - block.size.x / 2
    let maxX = block.pos.x + block.size.x / 2
    let minY = block.pos.y - block.size.y / 2
    let maxY = block.pos.y + block.size.y / 2
    let minZ = block.pos.z - block.size.z / 2
    let maxZ = block.pos.z + block.size.z / 2

    let nearX = constrain(camP.x, minX, maxX)
    let nearZ = constrain(camP.z, minZ, maxZ)
    let dx = camP.x - nearX
    let dz = camP.z - nearZ
    if (dx * dx + dz * dz >= bodyR * bodyR) continue

    let top = camP.y
    let bottom = camP.y + bodyH

    let overlapsY = bottom > minY && top < maxY
    if (!overlapsY) continue

    let overlapTop = bottom - minY
    let overlapBottom = maxY - top

    if (bodyVY >= 0 && top < minY && overlapTop <= overlapBottom) {
      camP.y = minY - bodyH
      bodyVY = 0
      isGrounded = true
    } else if (bodyVY < 0 && bottom > maxY && overlapBottom < overlapTop) {
      camP.y = maxY
      bodyVY = 0
    } else if (overlapTop <= overlapBottom) {
      camP.y = minY - bodyH
      bodyVY = 0
      isGrounded = true
    } else {
      camP.y = maxY
      bodyVY = 0
    }
  }
}
