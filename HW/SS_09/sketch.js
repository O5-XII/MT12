function setup() {
  createCanvas(640, 450)
  textFont("monospace")
  textSize(15)
  noStroke()
}

function draw() {
  background(242, 246, 252)

  const forCount = floor(map(constrain(mouseX, 0, width), 0, width, 1, 24))
  const whileCount = floor(map(constrain(mouseY, 0, height), 0, height, 1, 24))

  fill(20)
  textSize(20)
  text("loop showcase", 20, 32)

  textSize(15)
  text("mouse Left/Right = FOR loop", 20, 58)
  text("mouse Up/Down = WHILE loop", 20, 78)
  text(`forCount: ${forCount}`, 20, 102);
  text(`whileCount: ${whileCount}`, 140, 120)

  ForLoopSec(forCount)
  WhileLoopSec(whileCount)
}

function ForLoopSec(forCount) {
  fill(25)
  text("circles", 20, 140)

  const y = 190
  for (let i = 0; i < forCount; i++) {
    const x = map(i, 0, max(1, forCount - 1), 40, width - 40)
    const size = 18 + 6 * sin(frameCount * 0.08 + i * 0.45)
    fill(70, 120 + i * 5, 220 - i * 4)
    circle(x, y, size)
  }
}

function WhileLoopSec(whileCount) {
  fill(25)
  text("bars", 20, 260)
  const baseline = height - 36
  const barsWidth = (width - 80) / max(1, whileCount)

  let i = 0
  while (i < whileCount) {
    const x = 40 + i * barsWidth
    const h = map(i, 0, max(1, whileCount - 1), 24, 126)
    fill(255 - i * 6, 130 + i * 4, 120 + 40 * sin(frameCount * 0.05 + i))
    rect(x, baseline, barsWidth - 6, - h, 4)
    i++
  }
}
