function setup() {
  createCanvas(300,300,WEBGL);
  frameRate(30)

}

function draw() {
  background(200)

  let pmx = pmouseX - 150
  let pmy = pmouseY - 150
  let mx = mouseX - 150
  let my = mouseY - 150

  line(pmx,pmy,mx,my)
}