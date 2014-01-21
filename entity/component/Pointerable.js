Plx.Pointerable = function() {
  Plx.Component.call(this);
  this.reset();
};

Plx.Pointerable.prototype = Object.create(Plx.Component.prototype);
Plx.Pointerable.prototype.constructor = Plx.Pointerable;

Plx.Pointerable.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  this.beacon.reset();
  this.enabled = true;
  this.draggable = false;
  this.colCheck = null; // for overriding collision check
  this.syncLoc = null; // for overriding syncLocation
};

Plx.Pointerable.prototype.init = function() {
  this.physics = this.entity.fetchComponent(Plx.PhysicsComponent);
  if (this.colCheck)
    this.colCheck = this.colCheck.bind(this);
  if (this.syncLoc)
    this.syncLoc = this.syncLoc.bind(this);
};

Plx.Pointerable.prototype.collisionCheck = function(x, y) {
  if (this.colCheck)
    return this.colCheck(x, y);

  if (this.physics.rect.contains(new Plx.Point(x, y)))
    return true;

  return false;
};

Plx.Pointerable.prototype.syncLocation = function(x, y, xOffset, yOffset) {
  if (this.syncLoc) {
    this.syncLoc(x, y);
    return;
  }

  // TODO: add in speed so that it animates smoothly
  // this.physicsComponent.speedX = x - this.physicsComponent.rect.loc.x
  // this.physicsComponent.speedY = y - this.physicsComponent.rect.loc.y
  this.physics.x = x - xOffset;
  this.physics.y = y - yOffset;
};
