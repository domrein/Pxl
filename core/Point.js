Plx.Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Plx.Point.prototype.calcAngle = function(point) {
  xDist = point.x - this.x;
  yDist = point.y - this.y;
  return Math.atan2(yDist, xDist);
};

Plx.Point.prototype.calcDist = function(point) {
  xDist = point.x - this.x;
  yDist = point.y - this.y;
  return Math.pow(Math.pow(xDist, 2) + Math.pow(yDist, 2), .5);
};
