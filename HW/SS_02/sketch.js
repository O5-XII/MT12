/*
Color Wheel Picker 
Use:
- Drag inside the wheel to pick hue + saturation
- Drag the vertical bar to change brightness
- Drag the bottom bar to change alpha
*/

let cx = 170, cy = 190, R = 130;
let h = 0, s = 0, b = 1, a = 255;

let dragWheel = false, dragB = false, dragA = false;

function setup() {
  createCanvas(560, 400);
  colorMode(HSB, 360, 100, 100, 255);
  noStroke();
}

function draw() {
  background(255);

  // wheel (simple rings)
  for (let r = R; r > 0; r -= 2) {
    let sat = map(r, 0, R, 0, 100);
    for (let ang = 0; ang < 360; ang += 3) {
      fill(ang, sat, 100, 255);
      let x = cx + cos(radians(ang)) * r;
      let y = cy + sin(radians(ang)) * r;
      circle(x, y, 3);
    }
  }
  stroke(0); noFill(); circle(cx, cy, R * 2); noStroke();

  // brightness bar (right)
  let bx = 380, by = 60, bw = 22, bh = 260;
  for (let y = 0; y < bh; y++) {
    let bb = map(y, 0, bh - 1, 100, 0);
    stroke(h, s, bb, 255);
    line(bx, by + y, bx + bw, by + y);
  }
  noStroke();
  stroke(0); noFill(); rect(bx, by, bw, bh); noStroke();
  let bKnobY = by + map(b, 100, 0, 0, bh);
  stroke(0); line(bx - 6, bKnobY, bx + bw + 6, bKnobY); noStroke();

  // alpha bar (bottom)
  let ax = 40, ay = 340, aw = 260, ah = 18;
  // checker
  for (let x = 0; x < aw; x += 10) {
    for (let y = 0; y < ah; y += 9) {
      fill(((x / 10 + y / 9) % 2) ? 235 : 200);
      rect(ax + x, ay + y, 10, 9);
    }
  }
  // alpha overlay
  for (let x = 0; x < aw; x++) {
    let aa = map(x, 0, aw - 1, 0, 255);
    stroke(h, s, b, aa);
    line(ax + x, ay, ax + x, ay + ah);
  }
  noStroke();
  stroke(0); noFill(); rect(ax, ay, aw, ah); noStroke();
  let aKnobX = ax + map(a, 0, 255, 0, aw);
  stroke(0); line(aKnobX, ay - 6, aKnobX, ay + ah + 6); noStroke();

  // selected color + output (ALWAYS BLACK TEXT)
  let c = color(h, s, b, a);
  fill(255); stroke(0); rect(380, 340, 140, 45);
  noStroke(); fill(c); rect(390, 350, 35, 25);

  let rgba = hsbaToRgba(h, s, b, a);
  let hex = rgbToHex(rgba.r, rgba.g, rgba.b);
  let hexA = rgbToHexA(rgba.r, rgba.g, rgba.b, rgba.a);

  fill(0);
  textSize(14);
  text(`RGBA: ${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a}`, 40, 25);
  text(`HEX:  ${hex}`, 40, 45);
  text(`HEX+α: ${hexA}`, 40, 65);

  textSize(12);
  text("Wheel: Hue/Sat", 290, 95);
  text("Right bar: Brightness", 280, 112);
  text("Bottom bar: Alpha", 290, 129);

  // marker on wheel
  let mx = cx + cos(radians(h)) * map(s, 0, 100, 0, R);
  let my = cy + sin(radians(h)) * map(s, 0, 100, 0, R);
  stroke(0); strokeWeight(4); point(mx, my);
  stroke(255); strokeWeight(2); point(mx, my);
  strokeWeight(1); noStroke();
}

function mousePressed() {
  dragWheel = dist(mouseX, mouseY, cx, cy) <= R;

  let bx = 380, by = 60, bw = 22, bh = 260;
  dragB = mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;

  let ax = 40, ay = 340, aw = 260, ah = 18;
  dragA = mouseX >= ax && mouseX <= ax + aw && mouseY >= ay && mouseY <= ay + ah;

  updatePick();
}

function mouseDragged() { updatePick(); }
function mouseReleased() { dragWheel = dragB = dragA = false; }

function updatePick() {
  if (dragWheel) {
    let dx = mouseX - cx, dy = mouseY - cy;
    h = (degrees(atan2(dy, dx)) + 360) % 360;
    s = constrain(map(sqrt(dx * dx + dy * dy), 0, R, 0, 100), 0, 100);
  }
  if (dragB) {
    let by = 60, bh = 260;
    b = constrain(map(mouseY, by, by + bh, 100, 0), 0, 100);
  }
  if (dragA) {
    let ax = 40, aw = 260;
    a = floor(constrain(map(mouseX, ax, ax + aw, 0, 255), 0, 255));
  }
}

// convert HSBA -> RGBA (0..255) for readout/hex
function hsbaToRgba(h, s, v, a) {
  s /= 100; v /= 100;
  let c = v * s;
  let x = c * (1 - abs(((h / 60) % 2) - 1));
  let m = v - c;

  let rp = 0, gp = 0, bp = 0;
  if (h < 60)      { rp = c; gp = x; bp = 0; }
  else if (h < 120){ rp = x; gp = c; bp = 0; }
  else if (h < 180){ rp = 0; gp = c; bp = x; }
  else if (h < 240){ rp = 0; gp = x; bp = c; }
  else if (h < 300){ rp = x; gp = 0; bp = c; }
  else             { rp = c; gp = 0; bp = x; }

  return {
    r: floor((rp + m) * 255),
    g: floor((gp + m) * 255),
    b: floor((bp + m) * 255),
    a: floor(a)
  };
}

function toHex2(n) {
  let s = n.toString(16).toUpperCase();
  return s.length === 1 ? "0" + s : s;
}
function rgbToHex(r, g, b) {
  return "#" + toHex2(r) + toHex2(g) + toHex2(b);
}
function rgbToHexA(r, g, b, a) {
  return "#" + toHex2(r) + toHex2(g) + toHex2(b) + toHex2(a);
}
