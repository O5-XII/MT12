function setup() {
  createCanvas(400, 400);
  background(245);
  stroke(20, 90, 180);
  strokeWeight(4);
  noLoop();
}

function draw() {
  background(245);

  const totalPoints = 700;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = 0; i < totalPoints; i++) {
    const angle = i * 137.5;
    const radius = 2 + sqrt(i) * 6;
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    point(x, y);
  }
}
