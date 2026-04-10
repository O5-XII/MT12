/* Miles Larkins -- Random Color guessing game, use wasd to avoid the losing color, if you're lucky you might get the bonus one. */

let camP, camT, worldUp; //camera
let VX, VY, yaw, pitch; //velocity
let bodyR, bodyH, bodyVY, isGrounded; //body physics
let showInfo, showMenu, debugFont, blocks; //menus
let gBlkI, nCallT, isOver, loseMsg, score, loseCI, pointCI, loseHideUntil; //states
let queLC, quePC; //debuging/rng que 
let lastPC; //percived rng 
// Boku no meirei wa zettaida
const MOVE_SPEED = 5; 
const GRAVITY = 0.8;
const JUMP_VELOCITY = -14;
const INTERMISSION_MS = 5000;
const LOSE_BLOCK_HIDE_MS = 3000;
const CANVAS_SIZE = { w: 1920, h: 1080 };
const MENU_CAM = { x: 900, y: -450, z: 1200, tx: 0, ty: 100, tz: 0 };
const MENU_BTN = { w: 220, h: 60, depth: 0.45 };
const HUD_PANEL = { distance: 120, side: 145, yOffset: 58, scale: 0.7 };
const DEBUG_PANEL = { distance: 260, side: -155, yOffset: 68, scale: 0.7 };
const THIRD_PERSON_CAM = { distance: 360, height: 130, targetYOffset: 56 };

function preload() {
  debugFont = loadFont('preload/Inconsolata_Condensed-Regular.ttf')
}

function setup() {
  pixelDensity(1)
  createCanvas(CANVAS_SIZE.w, CANVAS_SIZE.h, WEBGL);
  camP=createVector(0,-100,900) //spawn position
  camT=createVector(0,0,0)
  worldUp=createVector(0,1,0)
  VX = width / 2
  VY = height / 2
  yaw = 0
  pitch = 0
  bodyR = 35
  bodyH = 100
  bodyVY = 0
  isGrounded = false
  showInfo = false
  showMenu = true
  gBlkI = -1
  nCallT = 0
  isOver = false
  loseMsg = ''
  score = 0
  loseCI = -1
  pointCI = -1
  loseHideUntil = 0
  queLC = -1
  quePC = -1
  lastPC = -1
  //map buliding
  blocks = [
    { pos: createVector(-100, 150, 0), size: createVector(200,400,200), color: [230, 80, 80], challenge: true, label: 'RED' },
    { pos: createVector(-100, 150, -200), size: createVector(200,200,200), color: [80, 120, 230], challenge: true, label: 'BLUE' },
    { pos: createVector(100, 150,-200), size: createVector(200,200,200), color: [80, 210, 120], challenge: true, label: 'GREEN' },
    { pos: createVector(100, 150, 0), size: createVector(200, 200, 200), color: [240, 220, 70], challenge: true, label: 'YELLOW' },
    { pos: createVector(0, 150, 600), size: createVector(600, 100, 750), color: [180, 180, 180], challenge: false, label: '' }
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

  if (!showMenu && !isOver) {
    movePlayer(move);
    updateRoundState()
  }

  setActiveCamera(lookFwd)
  drawWorld()
  drawMenu()
  drawHUD(lookFwd, right)
  drawDebug(lookFwd, right)
}

// menu and some camera stuff
function setActiveCamera(lookFwd) {
  if (showMenu) {
    camT.set(MENU_CAM.tx, MENU_CAM.ty, MENU_CAM.tz)
    camera(MENU_CAM.x, MENU_CAM.y, MENU_CAM.z, MENU_CAM.tx, MENU_CAM.ty, MENU_CAM.tz, 0, 1, 0)
  } else {
    camT.set(camP.x, camP.y + THIRD_PERSON_CAM.targetYOffset, camP.z)

    let camOffset = p5.Vector.mult(lookFwd, -THIRD_PERSON_CAM.distance)
    camOffset.y -= THIRD_PERSON_CAM.height
    let camPos = p5.Vector.add(camT, camOffset)

    camera(camPos.x, camPos.y, camPos.z, camT.x, camT.y, camT.z, 0, 1, 0)
  }
}

function drawWorld() {
  ambientLight(200)

  push()
  translate(camP.x, camP.y + bodyH / 2, camP.z)
  normalMaterial()
  cylinder(bodyR, bodyH)
  pop()

  for (let i = 0; i < blocks.length; i++) {
    if (isBlockHidden(i)) continue
    let block = blocks[i]
    push()
    translate(block.pos.x, block.pos.y, block.pos.z)
    noStroke()
    fill(block.color[0], block.color[1], block.color[2])
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
//menu designing 
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
  textFont(debugFont)
  textAlign(CENTER, CENTER)
  fill(0)
  textSize(34)
  text('guess the colors', 0, -70)
  fill(255)
  textSize(22)
  text('PRESS ENTER', 0, 2)
  pop()
}

function drawDebug(lookFwd, right) {
  if (showInfo) {
    debugMode(400, 10, 0, 50, -100)
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
    if (keyCode === ENTER) startGame()
    return
  }

  if (isOver) {
    if (key ==='r') resetGame()
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
  resetGame()
  requestPointerLock()
}
// resetting text
function resetGame() {
  camP.set(0, -100, 900)
  camT.set(0, 0, 0)
  bodyVY = 0
  isGrounded = false
  gBlkI = -1
  nCallT = 0
  isOver = false
  loseMsg = ''
  score = 0
  loseCI = -1
  pointCI = -1
  loseHideUntil = 0
  queLC = -1
  quePC = -1
  lastPC = -1
  queueNextColorCall()
  nextColorCall()
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

// actual debug toggle 
function toggleDebug() {
  if (key === 'I') {
    showInfo = !showInfo
  }
}

function drawDebugInfo(lookFwd, right) {
  let upcomingLose = queLC >= 0 ? blocks[queLC].label : 'NONE'
  let upcomingPoint = quePC >= 0 ? blocks[quePC].label : 'NONE'
  let nextIn = max(0, ceil((nCallT - millis()) / 1000))
  
  let info = [
    `camP: ${nf(camP.x, 1, 1)}, ${nf(camP.y, 1, 1)}, ${nf(camP.z, 1, 1)}`,
    `camT: ${nf(camT.x, 1, 1)}, ${nf(camT.y, 1, 1)}, ${nf(camT.z, 1, 1)}`,
    `yaw: ${nf(yaw, 1, 3)}`,
    `pitch: ${nf(pitch, 1, 3)}`,
    `bodyR: ${bodyR}`,
    `bodyH: ${bodyH}`,
    `bodyVY: ${nf(bodyVY, 1, 2)}`,
    `grounded: ${isGrounded}`,
    `grounded block: ${gBlkI}`,
    `lose color index: ${loseCI}`,
    `point color index: ${pointCI}`,
    `upcoming lose: ${upcomingLose}`,
    `upcoming point: ${upcomingPoint}`,
    `next call in: ${nextIn}s`,
    `blocks: ${blocks.length}`
  ]

  let panelP = p5.Vector.add(camP, p5.Vector.mult(lookFwd, DEBUG_PANEL.distance))
  panelP.add(p5.Vector.mult(right, DEBUG_PANEL.side))
  panelP.y -= DEBUG_PANEL.yOffset
  let toCam = p5.Vector.sub(camP, panelP).normalize()
  let panelYaw = atan2(toCam.x, toCam.z)
  let panelPitch = -atan2(toCam.y, sqrt(toCam.x * toCam.x + toCam.z * toCam.z))

  push()
  translate(panelP.x, panelP.y, panelP.z)
  rotateY(panelYaw)
  rotateX(panelPitch)
  scale(DEBUG_PANEL.scale, DEBUG_PANEL.scale, DEBUG_PANEL.scale)
  noLights()
  fill(0)
  textFont(debugFont)
  textSize(14)
  textAlign(LEFT, TOP)
  text(info.join('\n'), 0, 0)
  pop()
}

// collisions
function movePlayer(move) {
  camP.x += move.x
  HorizCollisions()
  camP.z += move.z
  HorizCollisions()

  isGrounded = false
  gBlkI = -1
  bodyVY += GRAVITY
  camP.y += bodyVY
  VertCollisions()
}

function isBlockHidden(blockI) {
  return blockI >= 0 && blockI <= 3 && blockI === loseCI && millis() < loseHideUntil
}

function HorizCollisions() {
  for (let i = 0; i < blocks.length; i++) {
    if (isBlockHidden(i)) continue
    let block = blocks[i]
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
  for (let i = 0; i < blocks.length; i++) {
    if (isBlockHidden(i)) continue
    let block = blocks[i]
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
      gBlkI = i
    } else if (bodyVY < 0 && bottom > maxY && overlapBottom < overlapTop) {
      camP.y = maxY
      bodyVY = 0
    } else if (overlapTop <= overlapBottom) {
      camP.y = minY - bodyH
      bodyVY = 0
      isGrounded = true
      gBlkI = i
    } else {
      camP.y = maxY
      bodyVY = 0
    }
  }
}

function startRound() {
  // remeber this lowk
  nextColorCall()
}

function updateRoundState() {
  if (camP.y > 1000) {
    setGameOver('You fell off.')
    return
  }

  if (millis() >= nCallT) {
    nextColorCall()
  }
}

function setGameOver(reason) {
  isOver = true
  loseMsg = reason
  exitPointerLock()
}

function nextColorCall() {
  if (queLC < 0 || quePC < 0) {
    queueNextColorCall()
  }

  loseCI = queLC
  pointCI = quePC
  loseHideUntil = millis() + LOSE_BLOCK_HIDE_MS
  lastPC = pointCI
  queueNextColorCall()

  if (gBlkI === loseCI) {
    setGameOver(`Called ${blocks[loseCI].label}. You lose.`)
    return
  }

  if (gBlkI >= 0 && gBlkI <= 3) {
    if (gBlkI === pointCI) {
      score += 4
    } else {
      score += 1
    }
  }

  nCallT = millis() + INTERMISSION_MS
}

function queueNextColorCall() {
  queLC = floor(random(4))
  quePC = floor(random(4))
  while (quePC === queLC || quePC === lastPC) {
    quePC = floor(random(4))
  }
}

function drawHUD(lookFwd, right) {
  if (showMenu) return

  push()
  let panelP = p5.Vector.add(camP, p5.Vector.mult(lookFwd, HUD_PANEL.distance))
  panelP.add(p5.Vector.mult(right, HUD_PANEL.side))
  panelP.y -= HUD_PANEL.yOffset
  let toCam = p5.Vector.sub(camP, panelP).normalize()
  let panelYaw = atan2(toCam.x, toCam.z)
  let panelPitch = -atan2(toCam.y, sqrt(toCam.x * toCam.x + toCam.z * toCam.z))

  translate(panelP.x, panelP.y, panelP.z)
  rotateY(panelYaw)
  rotateX(panelPitch)
  scale(HUD_PANEL.scale, HUD_PANEL.scale, HUD_PANEL.scale)
  noLights()

  textFont(debugFont)
  fill(0)
  textAlign(LEFT, TOP)
  textSize(18)

  if (!isOver) {
    let timeLeft = max(0, ceil((nCallT - millis()) / 1000))
    fill(0)
    text(`Lose Color: ${blocks[loseCI].label}`, 0, 0)
    text(`Point Color: ${blocks[pointCI].label}`, 0, 28)
    text(`Next Call In: ${timeLeft}s`, 0, 56)
    text(`Score: ${score}`, 0, 84)
  } else {
    fill(0)
    textSize(32)
    text(`You Lose`, 0, 0)
    textSize(18)
    text(`${loseMsg}`, 0, 36)
    text(`Final Score: ${score}`, 0, 64)
    text(`Press R to restart`, 0, 92)
  }

  pop()
}
