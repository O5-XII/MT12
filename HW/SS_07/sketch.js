let picker;

function setup() {
  createCanvas(560, 400);
  colorMode(HSB, 360, 100, 100, 255);
  noStroke();

  picker = new ColorPicker(170, 190, 130);
}

function draw() {
  background(255);
  picker.show();
}

function mousePressed() {
  picker.startDrag(mouseX, mouseY);
}

function mouseDragged() {
  picker.updateDrag(mouseX, mouseY);
}

function mouseReleased() {
  picker.stopDrag();
}

class ColorPicker {
  constructor(cx, cy, radius) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;

    this.h = 0;
    this.s = 0;
    this.b = 100;
    this.a = 255;

    this.dragWheel = false;
    this.dragB = false;
    this.dragA = false;

    this.brightnessBar = { x: 380, y: 60, w: 22, h: 260 };
    this.alphaBar = { x: 40, y: 340, w: 260, h: 18 };
  }

  show() {
    this.drawWheel();
    this.drawBrightnessBar();
    this.drawAlphaBar();
    this.drawReadout();
    this.drawWheelMarker();
  }

  drawWheel() {
    for (let r = this.radius; r > 0; r -= 2) {
      let sat = map(r, 0, this.radius, 0, 100);

      for (let ang = 0; ang < 360; ang += 3) {
        fill(ang, sat, 100, 255);
        let x = this.cx + cos(radians(ang)) * r;
        let y = this.cy + sin(radians(ang)) * r;
        circle(x, y, 3);
      }
    }

    stroke(0);
    noFill();
    circle(this.cx, this.cy, this.radius * 2);
    noStroke();
  }

  drawBrightnessBar() {
    let bar = this.brightnessBar;

    for (let y = 0; y < bar.h; y++) {
      let brightness = map(y, 0, bar.h - 1, 100, 0);
      stroke(this.h, this.s, brightness, 255);
      line(bar.x, bar.y + y, bar.x + bar.w, bar.y + y);
    }

    noStroke();
    stroke(0);
    noFill();
    rect(bar.x, bar.y, bar.w, bar.h);
    noStroke();

    let knobY = bar.y + map(this.b, 100, 0, 0, bar.h);
    stroke(0);
    line(bar.x - 6, knobY, bar.x + bar.w + 6, knobY);
    noStroke();
  }

  drawAlphaBar() {
    let bar = this.alphaBar;

    for (let x = 0; x < bar.w; x += 10) {
      for (let y = 0; y < bar.h; y += 9) {
        fill(((x / 10 + y / 9) % 2) ? 235 : 200);
        rect(bar.x + x, bar.y + y, 10, 9);
      }
    }

    for (let x = 0; x < bar.w; x++) {
      let alpha = map(x, 0, bar.w - 1, 0, 255);
      stroke(this.h, this.s, this.b, alpha);
      line(bar.x + x, bar.y, bar.x + x, bar.y + bar.h);
    }

    noStroke();
    stroke(0);
    noFill();
    rect(bar.x, bar.y, bar.w, bar.h);
    noStroke();

    let knobX = bar.x + map(this.a, 0, 255, 0, bar.w);
    stroke(0);
    line(knobX, bar.y - 6, knobX, bar.y + bar.h + 6);
    noStroke();
  }

  drawReadout() {
    let selectedColor = color(this.h, this.s, this.b, this.a);
    let rgba = this.hsbaToRgba();
    let hex = this.rgbToHex(rgba.r, rgba.g, rgba.b);
    let hexA = this.rgbToHexA(rgba.r, rgba.g, rgba.b, rgba.a);

    fill(255);
    stroke(0);
    rect(380, 340, 140, 45);

    noStroke();
    fill(selectedColor);
    rect(390, 350, 35, 25);

    fill(0);
    textSize(14);
    text(`RGBA: ${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a}`, 40, 25);
    text(`HEX:  ${hex}`, 40, 45);
    text(`HEX+alpha: ${hexA}`, 40, 65);

    textSize(12);
    text("Wheel: Hue/Sat", 290, 95);
    text("Right bar: Brightness", 280, 112);
    text("Bottom bar: Alpha", 290, 129);
  }

  drawWheelMarker() {
    let markerRadius = map(this.s, 0, 100, 0, this.radius);
    let markerX = this.cx + cos(radians(this.h)) * markerRadius;
    let markerY = this.cy + sin(radians(this.h)) * markerRadius;

    stroke(0);
    strokeWeight(4);
    point(markerX, markerY);

    stroke(255);
    strokeWeight(2);
    point(markerX, markerY);

    strokeWeight(1);
    noStroke();
  }

  startDrag(x, y) {
    let brightness = this.brightnessBar;
    let alpha = this.alphaBar;

    this.dragWheel = dist(x, y, this.cx, this.cy) <= this.radius;
    this.dragB = this.isInsideRect(x, y, brightness);
    this.dragA = this.isInsideRect(x, y, alpha);

    this.updateDrag(x, y);
  }

  updateDrag(x, y) {
    if (this.dragWheel) {
      let dx = x - this.cx;
      let dy = y - this.cy;

      this.h = (degrees(atan2(dy, dx)) + 360) % 360;
      this.s = constrain(map(sqrt(dx * dx + dy * dy), 0, this.radius, 0, 100), 0, 100);
    }

    if (this.dragB) {
      let bar = this.brightnessBar;
      this.b = constrain(map(y, bar.y, bar.y + bar.h, 100, 0), 0, 100);
    }

    if (this.dragA) {
      let bar = this.alphaBar;
      this.a = floor(constrain(map(x, bar.x, bar.x + bar.w, 0, 255), 0, 255));
    }
  }

  stopDrag() {
    this.dragWheel = false;
    this.dragB = false;
    this.dragA = false;
  }

  isInsideRect(x, y, rectArea) {
    return (
      x >= rectArea.x &&
      x <= rectArea.x + rectArea.w &&
      y >= rectArea.y &&
      y <= rectArea.y + rectArea.h
    );
  }

  hsbaToRgba() {
    let sat = this.s / 100;
    let val = this.b / 100;
    let chroma = val * sat;
    let x = chroma * (1 - abs(((this.h / 60) % 2) - 1));
    let m = val - chroma;

    let rp = 0;
    let gp = 0;
    let bp = 0;

    if (this.h < 60) {
      rp = chroma;
      gp = x;
    } else if (this.h < 120) {
      rp = x;
      gp = chroma;
    } else if (this.h < 180) {
      gp = chroma;
      bp = x;
    } else if (this.h < 240) {
      gp = x;
      bp = chroma;
    } else if (this.h < 300) {
      rp = x;
      bp = chroma;
    } else {
      rp = chroma;
      bp = x;
    }

    return {
      r: floor((rp + m) * 255),
      g: floor((gp + m) * 255),
      b: floor((bp + m) * 255),
      a: floor(this.a)
    };
  }

  toHex2(n) {
    let hex = n.toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  }

  rgbToHex(r, g, b) {
    return "#" + this.toHex2(r) + this.toHex2(g) + this.toHex2(b);
  }

  rgbToHexA(r, g, b, a) {
    return "#" + this.toHex2(r) + this.toHex2(g) + this.toHex2(b) + this.toHex2(a);
  }
}
