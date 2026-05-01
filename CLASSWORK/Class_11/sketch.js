let Rectangle;

function setup() {
  createCanvas(200,200);
  Rectangle = new rectang(width/2, height/2,40);
}
 
function draw() {
  background('grey')

  rectang.show();
}

class rectang {
  constructor(x,y,size) {
    this.x=x;
    this.y = y;
    this.size = size;
  }
  show() {
    textAlign
  }
}