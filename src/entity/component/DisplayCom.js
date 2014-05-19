Pxl.DisplayCom = function() {
  Pxl.Component.call(this);
  this.loc = new Pxl.Point();
  this.anchor = new Pxl.Point();
  this.offset = new Pxl.Point();
  this.reset();
};

Pxl.DisplayCom.prototype = Object.create(Pxl.Component.prototype);
Pxl.DisplayCom.prototype.constructor = Pxl.DisplayCom;

Pxl.DisplayCom.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  
  this.loc.reset();
  this.z = 0;
  this.visible = true;
  this.speedX = 0;
  this.speedY = 0;
  this.rotation = 0;
  this.anchor.reset();
  this.offset.reset();
  this.scaleX = 1;
  this.scaleY = 1;
  this.flippedX = false;
  this.flippedY = false;
  this.alpha = 1;
  this.autoSizePhysics = false;
};

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorX", {
  get: function() {
    return this.achor.x;
  },
  set: function(value) {
    this.anchor.x = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorY", {
  get: function() {
    return this.achor.y;
  },
  set: function(value) {
    this.anchor.y = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "z", {
  get: function() {
    return this.z;
  },
  set: function(value) {
    this.z = value;
    // TODO: this should only be dispatched if it's already been added to display system
    this.beacon.emit('updatedZIndex', {});
  }
});

Pxl.DisplayCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
  
  this.physics = this.entity.fetchComponent(Pxl.PhysicsComponent);
  if (this.physics != null) {
    this.physics.beacon.observe(this, "updated", this.onPhysicsUpdated);
    if (this.autoSizePhysics)
      this.sizePhysics();
  }
};

Pxl.DisplayCom.prototype.sizePhysics = function() {
};

Pxl.DisplayCom.prototype.onPhysicsUpdated = function() {
  this.loc.x = this.physics.rect.loc.x + this.offset.x;
  this.loc.y = this.physics.rect.loc.y + this.offset.y;
  this.speedX = this.physics.speedX;
  this.speedY = this.physics.speedY;
};
