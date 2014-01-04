Plx.Rectangle = function() {
  this.loc = new Plx.Point();
  this.reset();
};

Plx.Rectangle.prototype.reset = function() {
  this.loc.reset();
  this.width = 0;
  this.height = 0;
};

Plx.Rectangle.prototype.intersects = function(rectangle) {
  var intersectionFound = true;
  if (rectangle.loc.x >= this.loc.x + this.width)
    intersectionFound = false;
  else if (rectangle.loc.x + rectangle.width <= this.loc.x)
    intersectionFound = false;
  else if (rectangle.loc.y >= this.loc.y + this.height)
    intersectionFound = false;
  else if (rectangle.loc.y + rectangle.height <= this.loc.y)
    intersectionFound = false;
  
  return intersectionFound;
};

Plx.Rectangle.prototype.contains = function(point) {
  var inside = true;
  if (point.x < this.loc.x || point.x > this.loc.x + this.width)
    inside = false;
  if (point.y < this.loc.y || point.y > this.loc.y + this.height)
    inside = false;

  return inside;
};

// TODO: convert these to getters/setters
Plx.Rectangle.prototype.getLeft = function() {
  return this.loc.x;
};

Plx.Rectangle.prototype.getRight = function() {
  return this.loc.x + this.width;
};

Plx.Rectangle.prototype.getTop = function() {
  return this.loc.y;
};

Plx.Rectangle.prototype.getBottom = function() {
  return this.loc.y + this.height ;
};
