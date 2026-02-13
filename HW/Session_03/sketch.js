let font;

function preload(){
  font = loadFont('assets/Inconsolata-ExtraLight.ttf')
}

function setup() {
  createCanvas(450, 450, WEBGL);
  frameRate()
}

function draw() {
  background(200);


//setting the origin to 0,0 for webgl
  let pmx = pmouseX -225;
  let pmy = pmouseY -225;
  let mx = mouseX -225;
  let my = mouseY -225;

  let c = color(mx,my,127)
  fill(c)
  noStroke()
  rect(mx,my,50,50)

  textAlign(CENTER);
  textSize(16);
  textFont(font);
  fill(0);
  text(`x: ${mx} y: ${my}`, 0, 0);
}


