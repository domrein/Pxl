Pxl.Rectangle = function() {
  Pxl.Point.call(this);
  this.reset();
};

Pxl.Rectangle.prototype.reset = function() {
  Pxl.Point.prototype.reset.call(this);
  this.width = 0;
  this.height = 0;
};

Pxl.Rectangle.prototype.intersects = function(rectangle) {
  var intersectionFound = true;
  if (rectangle.x >= this.x + this.width)
    intersectionFound = false;
  else if (rectangle.x + rectangle.width <= this.x)
    intersectionFound = false;
  else if (rectangle.y >= this.y + this.height)
    intersectionFound = false;
  else if (rectangle.y + rectangle.height <= this.y)
    intersectionFound = false;
  
  return intersectionFound;
};

Pxl.Rectangle.prototype.contains = function(point) {
  var inside = true;
  if (point.x < this.x || point.x > this.x + this.width)
    inside = false;
  if (point.y < this.y || point.y > this.y + this.height)
    inside = false;

  return inside;
};

// TODO: convert these to getters/setters
Pxl.Rectangle.prototype.getLeft = function() {
  return this.x;
};

Pxl.Rectangle.prototype.getRight = function() {
  return this.x + this.width;
};

Pxl.Rectangle.prototype.getTop = function() {
  return this.y;
};

Pxl.Rectangle.prototype.getBottom = function() {
  return this.y + this.height ;
};
