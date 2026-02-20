

let tx, ty;                 
let mx = NaN, my = NaN;     // mouse pos is not nan check

const teleportMs = 666;     // 1.5fps in ms for round time
let lastTeleport = 0;

const targetDiam = 100;     // visual target
const boxHalf = 55;         // accuracy required (its agtually value*2 bc radius vs diamater)

let state = "idle";         // game state
let countdownEndsAt = 0;

let score = 0;
let roundCleared = false;   // win check

let startBtn;

const SCORE_KEY = "teleport_scores_last3";

function setup() {
  createCanvas(400, 400);
  frameRate(60);

  startBtn = createButton("Start");
  startBtn.position(10, height + 10);
  startBtn.mousePressed(startGameCountdown);

  resetGameToIdle();
}

function resetGameToIdle() {
  state = "idle";
  score = 0;
  roundCleared = false;

  mx = NaN; my = NaN;

  newTarget();
  lastTeleport = millis(); // idle status
}

function startGameCountdown() {
  if (state === "countdown" || state === "running") return;

  state = "countdown";
  countdownEndsAt = millis() + 2000;

  // start clean slate
  score = 0;
  roundCleared = false;
  newTarget();
  lastTeleport = countdownEndsAt; // countdown logic
}

function newTarget() {
  // keep fully on-canvas
  const r = targetDiam / 2;
  tx = random(r, width - r);
  ty = random(r, height - r);
}

function draw() {
  background(220);

  //hit check
  const mouseValid = Number.isFinite(mx) && Number.isFinite(my);
  const hit = mouseValid && dist(mx, my, tx, ty) <= boxHalf;

  // If hit during a round, win
  if (state === "running" && hit) roundCleared = true;

  // sate mover forwarder
  if (state === "countdown") {
    const msLeft = countdownEndsAt - millis();
    if (msLeft <= 0) {
      state = "running";
      lastTeleport = millis();
      roundCleared = false; // must clear the first round
    }
  }

  if (state === "running") {
    const elapsed = millis() - lastTeleport;

    if (elapsed >= teleportMs) {
      // Lose checker
      if (!roundCleared) {
        endGame();
      } else {
        // update score
        score += 1;

        // progress to next
        roundCleared = false;
        newTarget();
        lastTeleport = millis();
      }
    }
  }

  // draw target 
  fill(255);
  circle(tx, ty, targetDiam);

  // indicator icon 
  const iconGreen = (state === "running" && roundCleared) || (state !== "running" && hit);
  fill(iconGreen ? "lime" : "red");
  circle(25, 25, 50);

  // UI text 
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);

  const last3 = loadLast3Scores();
  text(`Score: ${score}`, 10, 60);
  text(`Last 3: ${last3.length ? last3.join(", ") : "—"}`, 10, 80);

  if (state === "idle") { //game ui when idle
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Press Start", width / 2, height / 2);
  }

  if (state === "countdown") { //game ui for counting 
    const sec = Math.max(0, Math.ceil((countdownEndsAt - millis()) / 1000));
    textSize(40);
    textAlign(CENTER, CENTER);
    text(sec.toString(), width / 2, height / 2);
  }

  if (state === "gameover") { //lose ui
    textSize(18);
    textAlign(CENTER, CENTER);
    text(`Game Over\nFinal Score: ${score}\nPress Start`, width / 2, height / 2);
  }

  // Optional: show accuracy circle
  /*
  noFill();
  stroke(0);
  circle(tx, ty, boxHalf * 2);
  noStroke();
  */
}

function endGame() { //game ender
  state = "gameover";
  saveScore(score);
}

// mouse tracking 
function mouseMoved() { mx = mouseX; my = mouseY; }
function mouseDragged() { mx = mouseX; my = mouseY; }
function mouseEntered() { mx = mouseX; my = mouseY; }
function mouseExited() { mx = NaN; my = NaN; }

// storage logic
function loadLast3Scores() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function saveScore(s) {
  const n = Math.max(0, Math.floor(Number(s) || 0));
  const prev = loadLast3Scores();
  const next = [n, ...prev].slice(0, 3);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(next));
  } catch {
    // catch all thingy
  }
}