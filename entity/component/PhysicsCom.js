Plx.PhysicsComponent = function() {
  Plx.Component.call(this);
  this.rect = new Plx.Rectangle();
  Plx.PhysicsComponent.count++;
  this.reset();
};

Plx.PhysicsComponent.prototype = Object.create(Plx.Component.prototype);
Plx.PhysicsComponent.prototype.constructor = Plx.PhysicsComponent;

Plx.PhysicsComponent.count = 0;

Plx.PhysicsComponent.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
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
  }
});

Object.defineProperty(Plx.PhysicsComponent.prototype, "height", {
  get: function() {
    return this.rect.height;
  },
  set: function(value) {
    this.rect.height = value;
  }
});

Plx.PhysicsComponent.prototype.destroy = function() {
  Plx.PhysicsComponent.count--;
  // console.log "destroyed, PhysicsComponent.count: //{PhysicsComponent.count}"
};
