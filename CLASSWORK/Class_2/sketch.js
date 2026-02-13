let pg;

function setup() {
  createCanvas(100, 100);
  background(180)

  pg = createGraphics(50,50,WEBGL);
  pg.background(100);
  pg.lights();
  pg.noStroke();
  pg.rotateX(QUARTER_PI);
  pg.rotateY(QUARTER_PI);
  pg.torus(15,5);
  describe('grey torus')
}

function doubleClicked() {
  if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
    image(pg, 25,25);
  }
}