Pxl.PointerCom = function() {
  Pxl.Component.call(this);
  this.reset();
};

Pxl.PointerCom.prototype = Object.create(Pxl.Component.prototype);
Pxl.PointerCom.prototype.constructor = Pxl.PointerCom;

Pxl.PointerCom.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  
  this.beacon.reset();
  this.enabled = true;
  this.draggable = false;
  this.dragStart = null; // stores location of drag start
  this.colCheck = null; // for overriding collision check
  this.syncLoc = null; // for overriding syncLocation
  this.lastTapTime = -1;
  
  // component dependencies
  this.physics = null;
  this.display = null;
};

Pxl.PointerCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);

  this.physics = this.entity.cm.physics;
  this.display = this.entity.cm.sprite; // TODO: sprite should be renamed display

  if (this.colCheck)
    this.colCheck = this.colCheck.bind(this);
  if (this.syncLoc)
    this.syncLoc = this.syncLoc.bind(this);
};

Pxl.PointerCom.prototype.globalToLocalX = function(x) {
  x += this.display.system.camera.x * this.display.lerp + this.display.pivotX + this.display.anchorX;
  return x;
};

Pxl.PointerCom.prototype.globalToLocalY = function(y) {
  y += this.display.system.camera.y * this.display.lerp + this.display.pivotY + this.display.anchorY;
  return y;
};

Pxl.PointerCom.prototype.collisionCheck = function(x, y) {
  x = this.globalToLocalX(x);
  y = this.globalToLocalY(y);
  if (this.colCheck)
    return this.colCheck(x, y);

  if (this.physics.rect.contains(new Pxl.Point(x, y)))
    return true;
  
  return false;
};

Pxl.PointerCom.prototype.syncLocation = function(x, y, localX, localY) {
  if (this.syncLoc) {
    this.syncLoc(x, y, localX, localY);
    return;
  }
  
  // TODO: add in speed so that it animates smoothly
  // this.physicsComponent.speedX = x - this.physicsComponent.rect.loc.x
  // this.physicsComponent.speedY = y - this.physicsComponent.rect.loc.y
  this.physics.x = x - localX;
  this.physics.y = y - localY;
};
