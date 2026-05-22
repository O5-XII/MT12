let cnv;
let camP, camT;
let yaw, pitch;
let bodyH, bodyVY, isGrounded;
let blocks, spheres;
let gameState;
let targetRadius, gameDuration, scoreGoal;
let gameMode, modeButtons, gridshotSize;
let menuTab, menuTabButtons, gameTabPanel, settingsTabPanel;
let roundStartedAt, score, hits, shots;
let totalReactionMs, bestReactionMs, lastReactionMs;
let endTimeRemainingMs;
let showBlueOutlines, showFpsCounter, cameraHeight, fovDegrees;
let crosshairElement, menuPanel, hudPanel, endPanel, keybindPanel, fpsPanel;
let targetSizeSlider, roundTimeSlider, goalSlider, gridshotSizeSlider, gridshotSizeControl;
let cameraHeightSlider, fovSlider, blueOutlinesToggle, fpsToggle;
let hudScore, hudGoal, hudTime, hudAccuracy, hudReaction;
let endTitle, endStats;

const MOVE_SPEED = 5;
const MOUSE_SENSITIVITY = 0.003;
const GRAVITY = 0.8;
const DEFAULT_TARGET_RADIUS = 15;
const DEFAULT_ROUND_SECONDS = 30;
const DEFAULT_SCORE_GOAL = 20;
const DEFAULT_GRIDSHOT_SIZE = 75;
const DEFAULT_CAMERA_HEIGHT = 140;
const DEFAULT_FOV_DEGREES = 60;
const PLAYER_START_Y = -70;
const FLOOR_CENTER_Y = 120;
const TARGET_RESPAWN_DELAY = 260;
const MODE_PRECISION = 'precision';
const MODE_GRIDSHOT = 'gridshot';
const GRIDSHOT_TARGET_COUNT = 3;
const GRIDSHOT_COLUMNS = 5;
const GRIDSHOT_ROWS = 4;
const grey1 = [118, 126, 134];
const wallGrey = [66, 78, 88];
const blue1 = [127,255,212];

function setup() {
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(1000);
  createCrosshair();
  gameMode = MODE_PRECISION;
  menuTab = 'game';
  showBlueOutlines = true;
  showFpsCounter = false;
  cameraHeight = DEFAULT_CAMERA_HEIGHT;
  fovDegrees = DEFAULT_FOV_DEGREES;
  createInterface();
  shininess(255)
  specularMaterial(19,25,19)
  camP = createVector(0, PLAYER_START_Y, 650);
  camT = createVector(0, 0, 0);
  yaw = 0;
  pitch = 0;
  bodyH = cameraHeight;
  bodyVY = 0;
  isGrounded = false;
  gameState = 'menu';
  targetRadius = DEFAULT_TARGET_RADIUS;
  gameDuration = DEFAULT_ROUND_SECONDS * 1000;
  scoreGoal = DEFAULT_SCORE_GOAL;
  gridshotSize = DEFAULT_GRIDSHOT_SIZE;
  resetStats();

  blocks = [
    {pos: createVector(0, FLOOR_CENTER_Y, 650), size: createVector(700, 100, 720), color: grey1, isFloor: true },
    {pos: createVector(0,-250,0), size: createVector(900,700,12), color: wallGrey, isFrame: true } //frame
  ];

  spheres = [createTarget()];
  updateHud();
  updateEndScreen(false);
  setUIVisibility();
}

function draw() {
  background(12, 14, 20);

  movePlayerCamera();
  updateCameraTarget();
  applyCameraPerspective();
  camera(camP.x, camP.y, camP.z, camT.x, camT.y, camT.z, 0, 1, 0);

  ambientLight(80);
  directionalLight(255, 255, 255, -0.5, 0.75, -1);
  pointLight(80, 210, 225, camP.x, camP.y - 80, camP.z);

  updateTargets();
  drawWorld();
  updateHud();
  updateFpsCounter();
}

function createCrosshair() {
  let oldCrosshair = document.getElementById('crosshair');
  if (oldCrosshair) oldCrosshair.remove();

  crosshairElement = document.createElement('div');
  crosshairElement.id = 'crosshair';
  crosshairElement.innerHTML = '<span class="crosshair-line crosshair-horizontal"></span><span class="crosshair-line crosshair-vertical"></span>';
  document.body.appendChild(crosshairElement);
}

function createInterface() {
  let oldUi = document.getElementById('aim-ui');
  if (oldUi) oldUi.remove();

  let ui = document.createElement('main');
  ui.id = 'aim-ui';
  document.body.appendChild(ui);

  menuPanel = document.createElement('section');
  menuPanel.id = 'aim-menu';
  menuPanel.className = 'aim-panel';

  createMenuTabs(menuPanel);
  createModeControl(gameTabPanel);

  let sizeControl = createSliderControl(gameTabPanel, 'Orb size', 8, 40, DEFAULT_TARGET_RADIUS, ' px');
  targetSizeSlider = sizeControl.slider;
  targetSizeSlider.addEventListener('input', function() {
    targetRadius = Number(targetSizeSlider.value);
    refreshGridshotTargets();
  });

  let gridControl = createSliderControl(gameTabPanel, 'Gridshot size', 45, 100, DEFAULT_GRIDSHOT_SIZE, '%');
  gridshotSizeControl = gridControl.control;
  gridshotSizeSlider = gridControl.slider;
  gridshotSizeSlider.addEventListener('input', function() {
    gridshotSize = Number(gridshotSizeSlider.value);
    refreshGridshotTargets();
  });
  updateModeButtons();

  let timeControl = createSliderControl(gameTabPanel, 'Round time', 15, 60, DEFAULT_ROUND_SECONDS, ' sec');
  roundTimeSlider = timeControl.slider;

  let goalControl = createSliderControl(gameTabPanel, 'Win score', 5, 50, DEFAULT_SCORE_GOAL, '');
  goalSlider = goalControl.slider;

  let startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'primary-button';
  startButton.textContent = 'Start Run';
  startButton.addEventListener('click', function(event) {
    event.stopPropagation();
    startGame();
  });
  gameTabPanel.appendChild(startButton);

  createSettingsControls(settingsTabPanel);
  ui.appendChild(menuPanel);

  hudPanel = document.createElement('section');
  hudPanel.id = 'aim-hud';
  hudPanel.innerHTML = [
    '<div><span>Score</span><strong id="hud-score">0</strong><small>/<span id="hud-goal">20</span></small></div>',
    '<div><span>Time</span><strong id="hud-time">30</strong><small>sec</small></div>',
    '<div><span>Acc</span><strong id="hud-accuracy">--</strong></div>',
    '<div><span>React</span><strong id="hud-reaction">--</strong></div>'
  ].join('');
  ui.appendChild(hudPanel);

  hudScore = document.getElementById('hud-score');
  hudGoal = document.getElementById('hud-goal');
  hudTime = document.getElementById('hud-time');
  hudAccuracy = document.getElementById('hud-accuracy');
  hudReaction = document.getElementById('hud-reaction');

  endPanel = document.createElement('section');
  endPanel.id = 'aim-end';
  endPanel.className = 'aim-panel';

  endTitle = document.createElement('h1');
  endStats = document.createElement('div');
  endStats.className = 'end-stats';

  let restartButton = document.createElement('button');
  restartButton.type = 'button';
  restartButton.className = 'primary-button';
  restartButton.textContent = 'Run Again';
  restartButton.addEventListener('click', function(event) {
    event.stopPropagation();
    startGame();
  });

  endPanel.appendChild(endTitle);
  endPanel.appendChild(endStats);
  endPanel.appendChild(restartButton);
  ui.appendChild(endPanel);

  keybindPanel = document.createElement('section');
  keybindPanel.id = 'keybinds-panel';
  keybindPanel.innerHTML = [
    '<span>Keybinds</span>',
    '<div><kbd>Mouse</kbd><p>Aim</p></div>',
    '<div><kbd>Click</kbd><p>Shoot</p></div>',
    '<div><kbd>Enter</kbd><p>Start</p></div>',
    '<div><kbd>M</kbd><p>Menu</p></div>',
    '<div><kbd>R</kbd><p>Restart</p></div>'
  ].join('');
  ui.appendChild(keybindPanel);

  fpsPanel = document.createElement('section');
  fpsPanel.id = 'fps-counter';
  fpsPanel.className = 'hidden';
  fpsPanel.textContent = 'FPS --';
  ui.appendChild(fpsPanel);
}

function createMenuTabs(parent) {
  let tabs = document.createElement('div');
  tabs.className = 'menu-tabs';

  menuTabButtons = [
    createMenuTabButton('Game', 'game'),
    createMenuTabButton('Settings', 'settings')
  ];

  for (let button of menuTabButtons) {
    tabs.appendChild(button);
  }

  gameTabPanel = document.createElement('div');
  gameTabPanel.className = 'tab-panel';

  settingsTabPanel = document.createElement('div');
  settingsTabPanel.className = 'tab-panel';

  parent.appendChild(tabs);
  parent.appendChild(gameTabPanel);
  parent.appendChild(settingsTabPanel);
  updateMenuTabs();
}

function createMenuTabButton(label, tab) {
  let button = document.createElement('button');
  button.type = 'button';
  button.className = 'tab-button';
  button.textContent = label;
  button.dataset.tab = tab;
  button.addEventListener('click', function(event) {
    event.stopPropagation();
    menuTab = tab;
    updateMenuTabs();
  });

  return button;
}

function updateMenuTabs() {
  if (!menuTabButtons || !gameTabPanel || !settingsTabPanel) return;

  for (let button of menuTabButtons) {
    button.classList.toggle('selected', button.dataset.tab === menuTab);
  }

  gameTabPanel.classList.toggle('hidden', menuTab !== 'game');
  settingsTabPanel.classList.toggle('hidden', menuTab !== 'settings');
}

function createSettingsControls(parent) {
  blueOutlinesToggle = createToggleControl(parent, 'Blue outlines', showBlueOutlines, function(isChecked) {
    showBlueOutlines = isChecked;
  });

  fpsToggle = createToggleControl(parent, 'FPS counter', showFpsCounter, function(isChecked) {
    showFpsCounter = isChecked;
    updateFpsCounter();
  });

  let heightControl = createSliderControl(parent, 'Camera height', 100, 190, cameraHeight, ' px');
  cameraHeightSlider = heightControl.slider;
  cameraHeightSlider.addEventListener('input', function() {
    setCameraHeight(Number(cameraHeightSlider.value));
  });

  let fovControl = createSliderControl(parent, 'FOV', 45, 95, fovDegrees, ' deg');
  fovSlider = fovControl.slider;
  fovSlider.addEventListener('input', function() {
    fovDegrees = Number(fovSlider.value);
  });
}

function createToggleControl(parent, labelText, checked, onChange) {
  let control = document.createElement('label');
  control.className = 'toggle-control';

  let input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('input', function() {
    onChange(input.checked);
  });

  let label = document.createElement('span');
  label.textContent = labelText;

  control.appendChild(input);
  control.appendChild(label);
  parent.appendChild(control);

  return input;
}

function createModeControl(parent) {
  let control = document.createElement('div');
  control.className = 'mode-control';

  let title = document.createElement('span');
  title.className = 'control-title';
  title.textContent = 'Game mode';

  let options = document.createElement('div');
  options.className = 'mode-options';

  modeButtons = [
    createModeButton('Precision', MODE_PRECISION),
    createModeButton('Gridshot', MODE_GRIDSHOT)
  ];

  for (let button of modeButtons) {
    options.appendChild(button);
  }

  control.appendChild(title);
  control.appendChild(options);
  parent.appendChild(control);
  updateModeButtons();
}

function createModeButton(label, mode) {
  let button = document.createElement('button');
  button.type = 'button';
  button.className = 'mode-button';
  button.textContent = label;
  button.dataset.mode = mode;
  button.addEventListener('click', function(event) {
    event.stopPropagation();
    gameMode = mode;
    updateModeButtons();
  });

  return button;
}

function updateModeButtons() {
  if (!modeButtons) return;

  for (let button of modeButtons) {
    button.classList.toggle('selected', button.dataset.mode === gameMode);
  }

  if (gridshotSizeControl) {
    gridshotSizeControl.classList.toggle('hidden', gameMode !== MODE_GRIDSHOT);
  }
}

function createSliderControl(parent, labelText, min, max, value, unit, formatter) {
  let control = document.createElement('label');
  control.className = 'slider-control';

  let header = document.createElement('span');
  header.className = 'slider-header';

  let label = document.createElement('span');
  label.textContent = labelText;

  let valueLabel = document.createElement('strong');
  valueLabel.textContent = getSliderLabel(value, unit, formatter);

  let slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.addEventListener('input', function() {
    valueLabel.textContent = getSliderLabel(slider.value, unit, formatter);
  });

  header.appendChild(label);
  header.appendChild(valueLabel);
  control.appendChild(header);
  control.appendChild(slider);
  parent.appendChild(control);

  return { control: control, slider: slider, valueLabel: valueLabel };
}

function getSliderLabel(value, unit, formatter) {
  if (formatter) return formatter(value);
  return value + unit;
}

function drawWorld(){
  drawWBlocks();
  drawGridshotGuide();
  drawSpheres();
}

function drawWBlocks() {
  for (let block of blocks) {
    push();
    translate(block.pos.x, block.pos.y, block.pos.z);
    noStroke();
    fill(block.color[0], block.color[1], block.color[2]);
    box(block.size.x, block.size.y, block.size.z);
    drawBlockSurface(block);
    pop();
  }
}

function drawBlockSurface(block) {
  if (block.isFrame) {
    let z = block.size.z / 2 + 1;
    stroke(115, 139, 150, 90);
    strokeWeight(1);

    for (let x = -block.size.x / 2; x <= block.size.x / 2; x += 100) {
      line(x, -block.size.y / 2, z, x, block.size.y / 2, z);
    }

    for (let y = -block.size.y / 2; y <= block.size.y / 2; y += 100) {
      line(-block.size.x / 2, y, z, block.size.x / 2, y, z);
    }

    if (showBlueOutlines) {
      stroke(127, 255, 212, 150);
      line(-block.size.x / 2, -block.size.y / 2, z + 1, block.size.x / 2, -block.size.y / 2, z + 1);
      line(block.size.x / 2, -block.size.y / 2, z + 1, block.size.x / 2, block.size.y / 2, z + 1);
      line(block.size.x / 2, block.size.y / 2, z + 1, -block.size.x / 2, block.size.y / 2, z + 1);
      line(-block.size.x / 2, block.size.y / 2, z + 1, -block.size.x / 2, -block.size.y / 2, z + 1);
    }
  }

  if (block.isFloor) {
    let y = -block.size.y / 2 - 1;
    stroke(210, 220, 226, 65);
    strokeWeight(1);

    for (let x = -block.size.x / 2; x <= block.size.x / 2; x += 100) {
      line(x, y, -block.size.z / 2, x, y, block.size.z / 2);
    }

    for (let z = -block.size.z / 2; z <= block.size.z / 2; z += 100) {
      line(-block.size.x / 2, y, z, block.size.x / 2, y, z);
    }
  }
}

function drawGridshotGuide() {
  if (gameMode !== MODE_GRIDSHOT) return;
  if (!showBlueOutlines) return;

  let bounds = getGridshotBounds(targetRadius || DEFAULT_TARGET_RADIUS);
  let z = bounds.z - (targetRadius || DEFAULT_TARGET_RADIUS) + 4;

  push();
  translate(0, 0, z);
  noFill();
  strokeWeight(2);
  stroke(127, 255, 212, 130);
  rectMode(CENTER);
  rect(bounds.centerX, bounds.centerY, bounds.width, bounds.height);

  strokeWeight(1);
  stroke(127, 255, 212, 60);

  for (let col = 1; col < GRIDSHOT_COLUMNS; col++) {
    let x = bounds.minX + bounds.width * (col / GRIDSHOT_COLUMNS);
    line(x, bounds.minY, 0, x, bounds.maxY, 0);
  }

  for (let row = 1; row < GRIDSHOT_ROWS; row++) {
    let y = bounds.minY + bounds.height * (row / GRIDSHOT_ROWS);
    line(bounds.minX, y, 0, bounds.maxX, y, 0);
  }

  pop();
}

function drawSpheres() {
  for (let ball of spheres) {
    if (!ball.active) continue;

    drawTargetRing(ball);

    push();
    translate(ball.pos.x, ball.pos.y, ball.pos.z);
    let age = ball.spawnedAt ? millis() - ball.spawnedAt : 0;
    let popScale = constrain(age / 150, 0.45, 1);
    let pulse = 1 + sin(millis() * 0.012) * 0.035;
    scale(popScale * pulse);
    noStroke();
    specularMaterial(ball.color[0], ball.color[1], ball.color[2]);
    sphere(ball.radius, 24, 16);
    translate(0, 0, ball.radius * 0.72);
    ambientMaterial(245, 255, 255);
    sphere(ball.radius * 0.22, 12, 8);
    pop();
  }
}

function drawTargetRing(ball) {
  if (!showBlueOutlines) return;

  let frame = getFrameBlock();
  let wallZ = frame.pos.z + frame.size.z / 2 + 2;

  push();
  translate(ball.pos.x, ball.pos.y, wallZ);
  noFill();
  strokeWeight(2);
  stroke(127, 255, 212, 100);
  circle(0, 0, ball.radius * 3.4);
  stroke(245, 255, 255, 70);
  circle(0, 0, ball.radius * 2.15);
  pop();
}

function createTarget() {
  let target = {
    pos: createVector(0, 0, 0),
    radius: targetRadius || DEFAULT_TARGET_RADIUS,
    color: blue1,
    active: false,
    visibleUntil: 0,
    respawnAt: 0,
    spawnedAt: 0,
    gridIndex: -1
  };

  return target;
}

function updateTargets() {
  if (gameState !== 'playing') return;

  if (hasRoundStarted() && getTimeRemainingMs() <= 0) {
    endGame(score >= scoreGoal);
    return;
  }

  let now = millis();

  for (let i = 0; i < getTargetCount(); i++) {
    let target = spheres[i];

    if (!target.active && now > target.respawnAt) {
      spawnTarget(target);
    }
  }
}

function spawnTarget(target) {
  target.radius = targetRadius;
  target.pos = getTargetSpawnPosition(target);
  target.active = true;
  target.visibleUntil = Infinity;
  target.spawnedAt = millis();
}

function spawnStartTarget(target) {
  target.radius = targetRadius;
  target.pos = getStartTargetPosition(target.radius);
  target.active = true;
  target.visibleUntil = Infinity;
  target.spawnedAt = millis();
  target.gridIndex = -1;
}

function hideTarget(target) {
  target.active = false;
  target.respawnAt = millis() + TARGET_RESPAWN_DELAY;
}

function getTargetCount() {
  if (gameMode === MODE_GRIDSHOT) return GRIDSHOT_TARGET_COUNT;
  return 1;
}

function setupTargetsForMode() {
  ensureTargetCount(getTargetCount());

  for (let target of spheres) {
    target.active = false;
    target.respawnAt = Infinity;
    target.spawnedAt = 0;
    target.gridIndex = -1;
  }

  if (gameMode === MODE_GRIDSHOT) {
    for (let i = 0; i < GRIDSHOT_TARGET_COUNT; i++) {
      spawnTarget(spheres[i]);
    }
    return;
  }

  spawnStartTarget(spheres[0]);
}

function ensureTargetCount(count) {
  while (spheres.length < count) {
    spheres.push(createTarget());
  }
}

function applyMenuSettings() {
  targetRadius = Number(targetSizeSlider.value);
  gridshotSize = Number(gridshotSizeSlider.value);
  gameDuration = Number(roundTimeSlider.value) * 1000;
  scoreGoal = Number(goalSlider.value);
  setCameraHeight(Number(cameraHeightSlider.value));
  fovDegrees = Number(fovSlider.value);
}

function startGame() {
  applyMenuSettings();
  resetStats();
  resetPlayer();
  gameState = 'playing';
  setupTargetsForMode();
  lockPointer();
  setUIVisibility();
  updateHud();
}

function resetStats() {
  roundStartedAt = 0;
  score = 0;
  hits = 0;
  shots = 0;
  totalReactionMs = 0;
  bestReactionMs = Infinity;
  lastReactionMs = 0;
  endTimeRemainingMs = gameDuration;
}

function resetPlayer() {
  camP.set(0, getPlayerStartY(), 650);
  camT.set(0, 0, 0);
  yaw = 0;
  pitch = 0;
  bodyVY = 0;
  isGrounded = false;

  for (let target of spheres) {
    target.active = false;
    target.respawnAt = 0;
    target.spawnedAt = 0;
    target.gridIndex = -1;
  }
}

function endGame(didWin) {
  if (gameState === 'ended') return;

  endTimeRemainingMs = getTimeRemainingMs();
  gameState = 'ended';

  for (let target of spheres) {
    target.active = false;
  }

  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  updateEndScreen(didWin);
  setUIVisibility();
}

function openMenu() {
  if (gameState === 'menu') return;

  gameState = 'menu';

  for (let target of spheres) {
    target.active = false;
    target.respawnAt = 0;
    target.gridIndex = -1;
  }

  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  setUIVisibility();
}

function setCameraHeight(newHeight) {
  cameraHeight = newHeight;
  bodyH = cameraHeight;

  if (camP && blocks) {
    camP.y = getPlayerStartY();
  }
}

function applyCameraPerspective() {
  perspective(radians(fovDegrees), width / height, 0.1, 5000);
}

function getTimeRemainingMs() {
  if (gameState !== 'playing') return gameDuration;
  if (!hasRoundStarted()) return gameDuration;
  return max(0, gameDuration - (millis() - roundStartedAt));
}

function hasRoundStarted() {
  return roundStartedAt > 0;
}

function getAccuracyLabel() {
  if (shots === 0) return '--';
  return round((hits / shots) * 100) + '%';
}

function beginRound() {
  roundStartedAt = millis();

  for (let target of spheres) {
    if (target.active) {
      target.spawnedAt = roundStartedAt;
    }
  }
}

function getReactionLabel() {
  if (hits === 0) return '--';
  return round(totalReactionMs / hits) + 'ms';
}

function getModeLabel() {
  if (gameMode === MODE_GRIDSHOT) return 'Gridshot';
  return 'Precision';
}

function setUIVisibility() {
  document.body.classList.toggle('is-playing', gameState === 'playing');
  menuPanel.classList.toggle('hidden', gameState !== 'menu');
  hudPanel.classList.toggle('hidden', gameState !== 'playing');
  endPanel.classList.toggle('hidden', gameState !== 'ended');

  if (crosshairElement) {
    crosshairElement.classList.toggle('hidden', gameState !== 'playing');
  }
}

function updateHud() {
  if (!hudScore) return;

  hudScore.textContent = score;
  hudGoal.textContent = scoreGoal;
  hudTime.textContent = ceil(getTimeRemainingMs() / 1000);
  hudAccuracy.textContent = getAccuracyLabel();
  hudReaction.textContent = getReactionLabel();
}

function updateFpsCounter() {
  if (!fpsPanel) return;

  fpsPanel.textContent = 'FPS ' + round(frameRate());
  fpsPanel.classList.toggle('hidden', !showFpsCounter);
}

function updateEndScreen(didWin) {
  if (!endTitle || !endStats) return;

  let avgReaction = hits > 0 ? round(totalReactionMs / hits) + 'ms' : '--';
  let bestReaction = bestReactionMs < Infinity ? round(bestReactionMs) + 'ms' : '--';
  let lastReaction = lastReactionMs > 0 ? round(lastReactionMs) + 'ms' : '--';
  let timeRemaining = ceil(endTimeRemainingMs / 1000) + 's';

  endTitle.textContent = didWin ? 'Win' : 'Time';
  endStats.innerHTML = [
    '<div><span>Mode</span><strong>' + getModeLabel() + '</strong></div>',
    '<div><span>Score</span><strong>' + score + '/' + scoreGoal + '</strong></div>',
    '<div><span>Time Left</span><strong>' + timeRemaining + '</strong></div>',
    '<div><span>Accuracy</span><strong>' + getAccuracyLabel() + '</strong></div>',
    '<div><span>Average</span><strong>' + avgReaction + '</strong></div>',
    '<div><span>Best</span><strong>' + bestReaction + '</strong></div>',
    '<div><span>Last</span><strong>' + lastReaction + '</strong></div>'
  ].join('');
}

function lockPointer() {
  if (cnv && cnv.elt && cnv.elt.requestPointerLock) {
    cnv.elt.requestPointerLock();
  }
}

function getTargetSpawnPosition(target) {
  if (gameMode === MODE_GRIDSHOT) {
    return getGridshotSpawnPosition(target);
  }

  target.gridIndex = -1;

  let radius = target.radius;
  let frame = getFrameBlock();
  let minX = frame.pos.x - frame.size.x / 2 + radius;
  let maxX = frame.pos.x + frame.size.x / 2 - radius;
  let minY = frame.pos.y - frame.size.y / 2 + radius;
  let maxY = frame.pos.y + frame.size.y / 2 - radius;
  let z = frame.pos.z + frame.size.z / 2 + radius;

  return createVector(random(minX, maxX), random(minY, maxY), z);
}

function getGridshotSpawnPosition(target) {
  let cells = getGridshotCells(target.radius);
  let activeIndexes = getActiveGridIndexes(target);
  let openCells = cells.filter(cell => !activeIndexes.includes(cell.index));
  let cell = random(openCells.length > 0 ? openCells : cells);

  target.gridIndex = cell.index;
  return cell.pos.copy();
}

function getGridshotCells(radius) {
  let bounds = getGridshotBounds(radius);
  let cells = [];

  for (let row = 0; row < GRIDSHOT_ROWS; row++) {
    for (let col = 0; col < GRIDSHOT_COLUMNS; col++) {
      let x = lerp(bounds.minX, bounds.maxX, col / (GRIDSHOT_COLUMNS - 1));
      let y = lerp(bounds.minY, bounds.maxY, row / (GRIDSHOT_ROWS - 1));
      cells.push({
        index: row * GRIDSHOT_COLUMNS + col,
        pos: createVector(x, y, bounds.z)
      });
    }
  }

  return cells;
}

function getGridshotBounds(radius) {
  let frame = getFrameBlock();
  let marginX = radius * 2.8;
  let marginY = radius * 2.8;
  let fullMinX = frame.pos.x - frame.size.x / 2 + marginX;
  let fullMaxX = frame.pos.x + frame.size.x / 2 - marginX;
  let fullMinY = frame.pos.y - frame.size.y / 2 + marginY;
  let fullMaxY = frame.pos.y + frame.size.y / 2 - marginY;
  let fullWidth = fullMaxX - fullMinX;
  let fullHeight = fullMaxY - fullMinY;
  let scale = constrain(gridshotSize / 100, 0.45, 1);
  let width = fullWidth * scale;
  let height = fullHeight * scale;
  let centerX = frame.pos.x;
  let centerY = frame.pos.y;

  return {
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minY: centerY - height / 2,
    maxY: centerY + height / 2,
    centerX: centerX,
    centerY: centerY,
    width: width,
    height: height,
    z: frame.pos.z + frame.size.z / 2 + radius
  };
}

function refreshGridshotTargets() {
  if (gameMode !== MODE_GRIDSHOT || gameState !== 'playing') return;

  for (let i = 0; i < getTargetCount(); i++) {
    spawnTarget(spheres[i]);
  }
}

function getActiveGridIndexes(targetToIgnore) {
  let indexes = [];

  for (let target of spheres) {
    if (target === targetToIgnore || !target.active || target.gridIndex < 0) continue;
    indexes.push(target.gridIndex);
  }

  return indexes;
}

function getStartTargetPosition(radius) {
  let frame = getFrameBlock();
  let startY = getPlayerStartY();
  let z = frame.pos.z + frame.size.z / 2 + radius;

  return createVector(camP.x, startY, z);
}

function getPlayerStartY() {
  return getFloorTopY() - bodyH;
}

function getFloorTopY() {
  let floor = blocks.find(block => block.isFloor) || blocks[0];
  return floor.pos.y - floor.size.y / 2;
}

function getFrameBlock() {
  return blocks.find(block => block.isFrame);
}

function movePlayerCamera() {
  let moveFwd = createVector(sin(yaw), 0, -cos(yaw)).normalize();
  let right = createVector(cos(yaw), 0, sin(yaw)).normalize();
  let move = createVector(0, 0, 0);
/*
  if (keyIsDown(87)) move.add(moveFwd);
  if (keyIsDown(83)) move.sub(moveFwd);
  if (keyIsDown(68)) move.add(right);
  if (keyIsDown(65)) move.sub(right);
*/
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
  if (gameState !== 'playing') return;
  lockPointer();
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

  if (!hasRoundStarted()) {
    if (closestHit) {
      beginRound();
      spawnTarget(closestHit);
    }

    updateHud();
    return;
  }

  shots++;

  if (closestHit) {
    hits++;
    score++;
    lastReactionMs = millis() - closestHit.spawnedAt;
    totalReactionMs += lastReactionMs;
    bestReactionMs = min(bestReactionMs, lastReactionMs);

    if (score >= scoreGoal) {
      endGame(true);
      return;
    }

    hideTarget(closestHit);
  }

  updateHud();
}

function mouseMoved() {
  updateMouseLook();
}

function mouseDragged() {
  if (updateMouseLook()) return false;
}

function updateMouseLook() {
  if (gameState !== 'playing') return false;
  if (!isPointerLocked()) return false;

  yaw += movedX * MOUSE_SENSITIVITY;
  pitch += movedY * MOUSE_SENSITIVITY;
  pitch = constrain(pitch, -PI / 2 + 0.01, PI / 2 - 0.01);
  return true;
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    openMenu();
    return;
  }

  if (gameState === 'menu' && keyCode === ENTER) {
    startGame();
  }

  if ((gameState === 'playing' || gameState === 'ended') && (key === 'r' || key === 'R')) {
    startGame();
    return;
  }

  if (gameState === 'ended' && keyCode === ENTER) {
    startGame();
  }
}

function isPointerLocked() {
  return document.pointerLockElement === cnv.elt;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
