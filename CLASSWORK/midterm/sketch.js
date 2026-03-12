let camP;
let camT;
let worldUp;
let VX;
let VY;
let yaw;
let pitch;
function setup() {
  createCanvas(1000,500,WEBGL);
  camP=createVector(0,0,900)
  camT=createVector(0,0,0)
  worldUp=createVector(0,1,0)
  VX = width / 2
  VY = height / 2
  yaw = 0
  pitch = 0
  
}

function draw() {
  background(220);

  //comment this out later probably
  debugMode(300,10,0,100,0)
  //normalMaterial()

  let dirX = sin(yaw) * cos(pitch);
  let dirY = sin(pitch);
  let dirZ = -cos(yaw) * cos(pitch);
  let fwd = createVector(dirX, dirY, dirZ).normalize()
  let right=p5.Vector.cross(fwd, worldUp).normalize()
  let up = p5.Vector.cross(right, fwd).normalize()

  let speed = 5;
  let move=createVector(0,0,0)

  if(keyIsDown(UP_ARROW)) move.add(p5.Vector.mult(fwd, speed))
  if(keyIsDown(DOWN_ARROW)) move.add(p5.Vector.mult(fwd,-speed))
  if(keyIsDown(RIGHT_ARROW)) move.add(p5.Vector.mult(right,speed))
  if(keyIsDown(LEFT_ARROW)) move.add(p5.Vector.mult(right,-speed))
  if(keyIsDown(ENTER)) move.add(p5.Vector.mult(up,-speed))
  if(keyIsDown(SHIFT)) move.add(p5.Vector.mult(up, speed))

    camP.add(move);
    camT.add(move);

    camT.set(
      camP.x + dirX * 1000,
      camP.y + dirY * 1000,
      camP.z + dirZ * 1000
    )

    camera(
      camP.x, camP.y, camP.z,                
      camT.x, camT.y, camT.z,
      0, 1, 0
    );

  
  
  //lighting
  ambientLight(100)

  
  translate(200,0)
  box(200)
  translate(-400,0,0)
  box(200)
}

function mouseMoved() {
  VX = constrain(VX + movedX, 0, width)
  VY = constrain(VY + movedY, 0, height)
  yaw += movedX * 0.003
  pitch += movedY * 0.003
  pitch = constrain(pitch, -PI / 2 + 0.01, PI / 2 - 0.01)
}

function doubleClicked() {
  requestPointerLock();
}
