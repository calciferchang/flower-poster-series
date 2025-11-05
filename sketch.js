//@ts-nocheck
const CONFIG = {
  numFlowers: () => floor(random(1, 5)),
  colorPalette: () => random(["dark", "light"]),
  FPS: 1 / 2,
};

const COLOR_SCHEME = {
  dark: { canvas: "rgb(17, 17, 17)", stem: "rgb(250, 249, 246)" },
  light: { canvas: "rgb(250, 249, 246)", stem: "rgb(17, 17, 17)" },
};

const FLOWER_CONFIG = {
  firstSegmentAngle: () => random(-22.5, 22.5),
  // Gaussian to maintain the possibility of chaos while lessening its frequency
  numSegments: () => floor(constrain(randomGaussian(2.5, 3), 1, 10)),
  petalColor: () => color(random(Object.values(FLOWER_CONFIG.COLORS))),
  COLORS: {
    yellow: "rgb(251, 194, 109)",
    orange: "rgb(245, 125, 98)",
    red: "rgb(225, 91, 100)",
  },
  stemLength: () => random(Object.keys(STEM_LENGTHS)),
  stemCurveType: () => random(Object.keys(STEM_CURVES)),
  bulbVariant: () => random(Object.keys(BULB_VARIANTS)),
};

const STEM_LENGTHS = {
  wild: () => random(75, 200),
};

const STEM_CURVES = {};
const BULB_VARIANTS = {
  daisy: (position, petalColor) => {
    push();
    noStroke();
    translate(position.x, position.y);
    fill(0);
    circle(0, 0, 20);
    fill(petalColor);
    for (let i = 0; i < 10; i++) {
      ellipse(15, 20, 40, 40);
      rotate(60);
    }
    pop();
  },
};

function newPoster() {
  let numFlowers = CONFIG.numFlowers();
  let colorPalette = CONFIG.colorPalette();

  let bgColor = COLOR_SCHEME[colorPalette].canvas;
  background(bgColor);
  container.style("background-color", bgColor);

  let flowers = [];

  for (let i = numFlowers - 1; i >= 0; i--) {
    let tint = numFlowers === 1 ? 0 : map(i, 0, numFlowers - 1, 0, 0.7);

    let flower = new Flower({
      startPosition: { x: width / 2, y: height },
      currentTint: tint,
      colorPalette: colorPalette,
    });
    flower.draw();
  }
}
class StemSegment {
  constructor(a1, c1, c2, a2) {
    this.a1 = a1; // anchor 1 (startPosition)
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
    // Need to generate predetermined start positions
    startPosition,
    currentTint,
    colorPalette,
  }) {
    this.segments = [];
    this.numSegments = FLOWER_CONFIG.numSegments();
    this.stemLength = FLOWER_CONFIG.stemLength();
    this.stemCurveType = FLOWER_CONFIG.stemCurveType();
    this.bulbVariant = FLOWER_CONFIG.bulbVariant();
    this.colorPalette = colorPalette;
    this.petalColor = FLOWER_CONFIG.petalColor();
    this.currentTint = currentTint;
    // Generate all segments
    this.generateSegments(startPosition);
  }

  generateSegments(startPosition) {
    // Need to move more of this into different types
    let startAngle = FLOWER_CONFIG.firstSegmentAngle();
    let length = STEM_LENGTHS[this.stemLength]();
    // First segment
    let a1 = startPosition;
    let c1 = getSecondPoint(a1, startAngle, length);
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

  drawBulb() {
    let endPoint = this.segments[this.segments.length - 1].a2;

    let petalColor = lerpColor(
      this.petalColor,
      color(COLOR_SCHEME[this.colorPalette].canvas),
      this.currentTint,
    );

    BULB_VARIANTS[this.bulbVariant](endPoint, petalColor);
  }

  draw() {
    strokeWeight(8);
    noFill();
    let stemColor = lerpColor(
      color(COLOR_SCHEME[this.colorPalette].stem),
      color(COLOR_SCHEME[this.colorPalette].canvas),
      this.currentTint,
    );
    stroke(stemColor);
    for (let segment of this.segments) {
      bezier(...segment.toArray());
    }
    this.drawBulb();
  }
}

//Helper functions
function getSecondPoint(origin, angle, length) {
  let dx = length * sin(angle);
  let dy = length * cos(angle);
  return {
    x: origin.x + dx,
    y: origin.y - dy,
  };
}

// P5.JS setup
//
let container;
let resizeTimeout;
function setup() {
  container = select("#sketch-container");
  createCanvas(container.width, container.height);
  select("canvas").parent("sketch-container");

  angleMode(DEGREES);
  frameRate(CONFIG.FPS);
  newPoster();
}
function windowResized() {
  noLoop();
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas(container.elt.offsetWidth, container.elt.offsetHeight);
    newPoster(); // Generate new poster with new dimensions
    loop(); // Resume animation
  }, 250);
}
function draw() {
  newPoster();
}
