Plx.PhysicsComponent = function() {
  Plx.Component.call(this);
  this.rect = new Plx.Rectangle();
  this.lastRect = new Plx.Rectangle();
  
  // just for use in physics system
  this.nextRect = new Plx.Rectangle();

  this.pendingMove = new Plx.Point();
  // TODO: refactor this into speed.x
  this.speedX = 0;
  this.speedY = 0;
  this.capSpeed = false;
  // TODO: refactor this into speedMax.x
  // TODO: just have speedMax instead of x,y
  this.speedXMax = 0;
  this.speedYMax = 0;
  this.friction = 1;
  this.mass = 1;
  this.sponginess = .1;
  this.collisionType = 'none';
  Plx.PhysicsComponent.count++;
  this.gravity = 0;
  this.collisionEnabled = true;
  // console.log "created, PhysicsComponent.count: //{PhysicsComponent.count}"
};

Plx.PhysicsComponent.prototype = Object.create(Plx.Component.prototype);
Plx.PhysicsComponent.prototype.constructor = Plx.PhysicsComponent;

Plx.PhysicsComponent.count = 0;

Plx.PhysicsComponent.prototype.setX = function(x, syncLast) {
  syncLast = syncLast || false;
  if (syncLast)
    this.lastRect.loc.x = x;
  else
    this.lastRect.loc.x = this.rect.loc.x;
  this.rect.loc.x = x;
};

Plx.PhysicsComponent.prototype.setY = function(y, syncLast) {
  syncLast = syncLast || false;
  if (syncLast)
    this.lastRect.loc.y = y;
  else
    this.lastRect.loc.y = this.rect.loc.y;
  this.rect.loc.y = y;
};

Plx.PhysicsComponent.prototype.setWidth = function(width) {
  this.rect.width = width;
  this.nextRect.width = width;
};

Plx.PhysicsComponent.prototype.setHeight = function(height) {
  this.rect.height = height;
  this.nextRect.height = height;
};

Plx.PhysicsComponent.prototype.destroy = function() {
  Plx.PhysicsComponent.count--;
  // console.log "destroyed, PhysicsComponent.count: //{PhysicsComponent.count}"
};
