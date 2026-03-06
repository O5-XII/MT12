let camP;
let camT;
let worldUp;
function setup() {
  createCanvas(1000,500,WEBGL);
  camP=createVector(0,0,900)
  camT=createVector(0,0,0)
  worldUp=createVector(0,1,0)
}

function draw() {
  background(220);

  //comment this out later probably
  debugMode(300,10,0,100,0)
  //normalMaterial()





  let fwd = p5.Vector.sub(camT, camP).normalize()
  let right=p5.Vector.cross(fwd, worldUp).normalize()
  let up = p5.Vector.cross(right, fwd).normalize()

  let speed = 5;
  let move=createVector(0,0,0)

  let x = mouseX-200
  let y = mouseY-200

  if(keyIsDown(UP_ARROW)) move.add(p5.Vector.mult(fwd, speed))
  if(keyIsDown(DOWN_ARROW)) move.add(p5.Vector.mult(fwd,-speed))
  if(keyIsDown(RIGHT_ARROW)) move.add(p5.Vector.mult(right,speed))
  if(keyIsDown(LEFT_ARROW)) move.add(p5.Vector.mult(right,-speed))
  if(keyIsDown(ENTER)) move.add(p5.Vector.mult(up,-speed))
  if(keyIsDown(SHIFT)) move.add(p5.Vector.mult(up, speed))

    camP.add(move);
    camT.add(move);

    let yaw = map(mouseX, 0, width, -PI / 3, PI / 3);
    let pitch = map(mouseY, 0, height, -PI / 6, PI / 6);


    let dirX = sin(yaw) * cos(pitch);
    let dirY = sin(pitch);
    let dirZ = -cos(yaw) * cos(pitch);

    camera(
      camP.x, camP.y, camP.z,                
      dirX*2000,dirY*2000,dirZ*2000             
    );

  
  
  //lighting
  ambientLight(100)

  let lX = (mouseX - width / 2) * 2
  let lY = (mouseY - height / 2) * 2

  spotLight(
    255, 255, 255,
    lX, lY, 200,
    -lX, -lY, -200,
    50
  );
  
  
  box(200)
}

function doubleClicked() {
  requestPointerLock();
}