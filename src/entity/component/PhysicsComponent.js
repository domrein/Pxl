Pxl.PhysicsComponent = function() {
  Pxl.Component.call(this);
  this.rect = new Pxl.Rectangle();
  this.lastRect = new Pxl.Rectangle();
  // just for use in physics system
  this.nextRect = new Pxl.Rectangle();
  this.pendingMove = new Pxl.Point();
  Pxl.PhysicsComponent.count++;
  this.reset();
};

Pxl.PhysicsComponent.prototype = Object.create(Pxl.Component.prototype);
Pxl.PhysicsComponent.prototype.constructor = Pxl.PhysicsComponent;

Pxl.PhysicsComponent.count = 0;

Pxl.PhysicsComponent.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  
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

Pxl.PhysicsComponent.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
};

Object.defineProperty(Pxl.PhysicsComponent.prototype, "x", {
  get: function() {
    return this.rect.x;
  },
  set: function(value) {
    this.rect.x = value;
    this.beacon.emit("updated", null);
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "y", {
  get: function() {
    return this.rect.y;
  },
  set: function(value) {
    this.rect.y = value;
    this.beacon.emit("updated", null);
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "width", {
  get: function() {
    return this.rect.width;
  },
  set: function(value) {
    this.rect.width = value;
    this.nextRect.width = value;
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "height", {
  get: function() {
    return this.rect.height;
  },
  set: function(value) {
    this.rect.height = value;
    this.nextRect.height = value;
  }
});

// TODO: rip these out and replace with getters/setters
Pxl.PhysicsComponent.prototype.setX = function(x, syncLast) {
  syncLast = syncLast || false;
  if (syncLast)
    this.lastRect.x = x;
  else
    this.lastRect.x = this.rect.x;
  this.rect.x = x;
};

Pxl.PhysicsComponent.prototype.setY = function(y, syncLast) {
  syncLast = syncLast || false;
  if (syncLast)
    this.lastRect.y = y;
  else
    this.lastRect.y = this.rect.y;
  this.rect.y = y;
};

Pxl.PhysicsComponent.prototype.setWidth = function(width) {
  this.rect.width = width;
  this.nextRect.width = width;
};

Pxl.PhysicsComponent.prototype.setHeight = function(height) {
  this.rect.height = height;
  this.nextRect.height = height;
};

Pxl.PhysicsComponent.prototype.destroy = function() {
  Pxl.PhysicsComponent.count--;
  // console.log "destroyed, PhysicsComponent.count: //{PhysicsComponent.count}"
};
