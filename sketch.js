//@ts-nocheck

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);
}

function draw() {}

function keyPressed() {
  background(255);
  strokeWeight(10);
  noFill();
  let flower = new Flower({
    start: { x: width / 2, y: height },
    numSegments: 20,
  });
  flower.draw();
}

function newFlower({
  start,
  numSegments = random(3, 8),
  stemType = random(["wild", "calm"]),
}) {
  let startAngle = random(-22, 22.5);
  let distance = STEMTYPE[stemType]();
  let a1 = start;
  let c1 = getSecondPoint(a1, startAngle, distance);
  let a2 = { x: random(0, width), y: random(0, height) };
  let c2 = { x: random(0, width), y: random(0, height) };
  console.log(c2);
  let stemSegment = new StemSegment(a1, c1, c2, a2);
  stroke("black");
  bezier(...stemSegment.toArray());
  // for (let i = 0; i < numSegments; i++) {}
  // Second segment - smooth continuation
  let a1_second = a2; // Start where first segment ended

  // Reflect c2 across a2 to get smooth control point
  let c1_second = {
    x: a2.x + (a2.x - c2.x), // a2.x - (c2.x - a2.x)
    y: a2.y + (a2.y - c2.y),
  };

  let a2_second = { x: random(0, width), y: random(0, height) };
  let c2_second = { x: random(0, width), y: random(0, height) };

  let stemSegment2 = new StemSegment(
    a1_second,
    c1_second,
    c2_second,
    a2_second,
  );
  bezier(...stemSegment2.toArray());
  stroke("red");
  point(c2.x, c2.y);
}

class StemSegment {
  constructor(a1, c1, c2, a2) {
    this.a1 = a1; // anchor 1 (start)
    this.c1 = c1; // control 1
    this.c2 = c2;
    this.a2 = a2;
  }

  // Convert to array for bezier()
  toArray() {
    return [
      this.a1.x,
      this.a1.y,
      this.c1.x,
      this.c1.y,
      this.c2.x,
      this.c2.y,
      this.a2.x,
      this.a2.y,
    ];
  }

  pointAt(t) {
    return {
      x: bezierPoint(this.a1.x, this.c1.x, this.c2.x, this.a2.x, t),
      y: bezierPoint(this.a1.y, this.c1.y, this.c2.y, this.a2.y, t),
    };
  }
}

class Flower {
  constructor({
    start,
    numSegments = random(3, 8),
    stemType = random(["wild"]),
  }) {
    this.segments = [];
    this.numSegments = numSegments;
    this.stemType = stemType;

    // Generate all segments
    this.generateSegments(start);
  }

  generateSegments(start) {
    let startAngle = random(-22, 22.5);
    let distance = STEMTYPE[this.stemType]();
    console.log(this.numSegments);
    // First segment
    let a1 = start;
    let c1 = getSecondPoint(a1, startAngle, distance);
    let a2 = { x: random(0, width), y: random(0, height) };
    let c2 = { x: random(0, width), y: random(0, height) };

    this.segments.push(new StemSegment(a1, c1, c2, a2));

    // Generate remaining segments
    for (let i = 1; i < this.numSegments; i++) {
      let prevSegment = this.segments[i - 1];
      this.addConnectedSegment(prevSegment);
    }
  }

  addConnectedSegment(prevSegment) {
    // Start where previous segment ended
    let a1 = prevSegment.a2;

    // Reflect previous c2 across a2 for smooth continuation
    let c1 = {
      x: prevSegment.a2.x + (prevSegment.a2.x - prevSegment.c2.x),
      y: prevSegment.a2.y + (prevSegment.a2.y - prevSegment.c2.y),
    };

    // New random endpoint and control point
    let a2 = { x: random(0, width), y: random(0, height) };
    let c2 = { x: random(0, width), y: random(0, height) };

    this.segments.push(new StemSegment(a1, c1, c2, a2));
  }

  draw() {
    stroke("black");
    for (let segment of this.segments) {
      bezier(...segment.toArray());
    }
  }
}

const STEMTYPE = {
  wild: () => random(75, 200),
};

//Helper functions
function getSecondPoint(origin, angle, length) {
  let dx = length * sin(angle);
  let dy = length * cos(angle);
  return {
    x: origin.x + dx,
    y: origin.y - dy,
  };
}
