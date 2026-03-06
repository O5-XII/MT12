let counter = 0;

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);
  textSize(24);

  setInterval(() => {
    counter++;
  }, 1);
}

function draw() {
  background(220);
  text(`Count: ${counter}`, width / 2, height / 2);
}
