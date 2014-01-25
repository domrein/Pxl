Plx.PhysicsComponent = function() {
  Plx.Component.call(this);
  this.rect = new Plx.Rectangle();
  this.lastRect = new Plx.Rectangle();
  // just for use in physics system
  this.nextRect = new Plx.Rectangle();
  this.pendingMove = new Plx.Point();
  Plx.PhysicsComponent.count++;
  this.reset();
};

Plx.PhysicsComponent.prototype = Object.create(Plx.Component.prototype);
Plx.PhysicsComponent.prototype.constructor = Plx.PhysicsComponent;

Plx.PhysicsComponent.count = 0;

Plx.PhysicsComponent.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  this.rect.reset();
  this.lastRect.reset();
  
  // just for use in physics system
  this.nextRect.reset();

  this.pendingMove.reset();
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
  this.collisionType = "none";
  this.gravity = 0;
  this.collisionEnabled = true;
  this.resolutionEnabled = true;
  // console.log "created, PhysicsComponent.count: //{PhysicsComponent.count}"
};

Plx.PhysicsComponent.prototype.init = function() {

};

Object.defineProperty(Plx.PhysicsComponent.prototype, "x", {
  get: function() {
    return this.rect.loc.x;
  },
  set: function(value) {
    this.rect.loc.x = value;
  }
});

Object.defineProperty(Plx.PhysicsComponent.prototype, "y", {
  get: function() {
    return this.rect.loc.y;
  },
  set: function(value) {
    this.rect.loc.y = value;
  }
});

Object.defineProperty(Plx.PhysicsComponent.prototype, "width", {
  get: function() {
    return this.rect.width;
  },
  set: function(value) {
    this.rect.width = value;
    this.nextRect.width = value;
  }
});

Object.defineProperty(Plx.PhysicsComponent.prototype, "height", {
  get: function() {
    return this.rect.height;
  },
  set: function(value) {
    this.rect.height = value;
    this.nextRect.height = value;
  }
});

// TODO: rip these out and replace with getters/setters
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
