function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
  strokeWeight(10);
  singleBezier();
}

function draw() {}

function keyPressed() {
  background(255);
  strokeWeight(10);
  singleBezier();
}
function singleBezier() {
  let p1 = { x: width / 2, y: height * 0.9 };
  let c1 = getSecondPoint(p1, random(-22.5, 22.5), random(100, 200));
  let p2 = { x: random(0, width), y: random(0, height) };
  let c2 = {
    x: undefined,
    y: random(0, p1.y * 0.9),
  };
  if (p2.x < p1.x) {
    c2.x = random(0, p1.x);
  } else {
    c2.x = random(p1.x, width);
  }
  bezier(p1.x, p1.y, c1.x, c1.y, p2.x, p2.y, c2.x, c2.y);
}

function drawBezier(origin) {
  let length = 100;
  let angle = random(-22.5, 22.5);
  let end = getSecondPoint(origin, angle, length);
  point(origin.x, origin.y);
  point(end.x, end.y);
}

function getSecondPoint(origin, angle, length) {
  let dx = length * sin(angle);
  let dy = length * cos(angle);
  return {
    x: origin.x + dx,
    y: origin.y - dy,
  };
}
