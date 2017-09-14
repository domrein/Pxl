import Point from "./Point.js";

export default class Rectangle extends Point {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    super.reset();
    this.width = 0;
    this.height = 0;
  }

  intersects(rectangle) {
    var intersectionFound = true;
    if (rectangle.x >= this.x + this.width) {
      intersectionFound = false;
    }
    else if (rectangle.x + rectangle.width <= this.x) {
      intersectionFound = false;
    }
    else if (rectangle.y >= this.y + this.height) {
      intersectionFound = false;
    }
    else if (rectangle.y + rectangle.height <= this.y) {
      intersectionFound = false;
    }

    return intersectionFound;
  }

  contains(point) {
    var inside = true;
    if (point.x < this.x || point.x > this.x + this.width) {
      inside = false;
    }
    if (point.y < this.y || point.y > this.y + this.height) {
      inside = false;
    }

    return inside;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height ;
  }

  get center() {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }
};
