Pxl.PhysicsComponent = function() {
  Pxl.Component.call(this);
  this.rect = new Pxl.Rectangle();
  Pxl.PhysicsComponent.count++;
  this.reset();
};

Pxl.PhysicsComponent.prototype = Object.create(Pxl.Component.prototype);
Pxl.PhysicsComponent.prototype.constructor = Pxl.PhysicsComponent;

Pxl.PhysicsComponent.count = 0;

Pxl.PhysicsComponent.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  
  this.rect.reset();
  // TODO: refactor this into speed.x
  this.speedX = 0;
  this.speedY = 0;
  this.capSpeed = false;
  // TODO: refactor this into speedMax.x
  // TODO: just have speedMax instead of x,y
  this.speedXMax = 0;
  this.speedYMax = 0;
  this.friction = 1;
  this.collisionType = "none";
  this.gravity = 0;
  this.enabled = true;
};

Pxl.PhysicsComponent.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
};

Object.defineProperty(Pxl.PhysicsComponent.prototype, "x", {
  get: function() {
    return this.rect.loc.x;
  },
  set: function(value) {
    this.rect.loc.x = value;
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "y", {
  get: function() {
    return this.rect.loc.y;
  },
  set: function(value) {
    this.rect.loc.y = value;
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "width", {
  get: function() {
    return this.rect.width;
  },
  set: function(value) {
    this.rect.width = value;
  }
});

Object.defineProperty(Pxl.PhysicsComponent.prototype, "height", {
  get: function() {
    return this.rect.height;
  },
  set: function(value) {
    this.rect.height = value;
  }
});

Pxl.PhysicsComponent.prototype.destroy = function() {
  Pxl.PhysicsComponent.count--;
  // console.log "destroyed, PhysicsComponent.count: //{PhysicsComponent.count}"
};
