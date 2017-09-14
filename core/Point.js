export default class Point {
  constructor(x, y) {
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  calcAngle(point) {
    const xDist = point.x - this.x;
    const yDist = point.y - this.y;
    return Math.atan2(yDist, xDist);
  }

  calcDist(point) {
    const xDist = point.x - this.x;
    const yDist = point.y - this.y;
    return Math.pow(Math.pow(xDist, 2) + Math.pow(yDist, 2), 0.5);
  }
};
