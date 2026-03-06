function setup() {
  createCanvas(400,400,WEBGL);
}

function draw() {
  background(220);

  let x = mouseX-200
  let y = mouseY-200


    let eyeX = 0;
    let eyeY = 0;
    let eyeZ = 900;

    let yaw = map(mouseX, 0, width, -PI / 3, PI / 3);
    let pitch = map(mouseY, 0, height, -PI / 6, PI / 6);


    let dirX = sin(yaw) * cos(pitch);
    let dirY = sin(pitch);
    let dirZ = -cos(yaw) * cos(pitch);

    camera(
      eyeX, eyeY, eyeZ,                
      eyeX + dirX * 1000,              
      eyeY + dirY * 1000,
      eyeZ + dirZ * 1000,
      0, 1, 0
    );

  box(200)
}
