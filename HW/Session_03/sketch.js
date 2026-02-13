let font;

function preload(){
  font = loadFont('assets/Inconsolata-ExtraLight.ttf')
}

function setup() {
  createCanvas(450, 450, WEBGL);
  frameRate()
}

function draw() {
  background(220);


//setting the origin to 0,0 for webgl
  let pmx = pmouseX -225;
  let pmy = pmouseY -225;
  let mx = mouseX -225;
  let my = mouseY -225;

  let c = color(127,127,127)
  fill(c)
  line(mx,-225,mx,450)
  line(-225,my,450,my)

  textAlign(CENTER);
  textSize(16);
  textFont(font);
  fill(220);
  text(`x: ${mx} y: ${my}`, 0, 0);
}


