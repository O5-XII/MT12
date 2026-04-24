function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(200);
  textAlign(CENTER);
  textSize(20);

  const coords = [`x: ${mouseX}`, `y: ${mouseY}`];
  text(coords.join(" "), width/2, height/2)
}
