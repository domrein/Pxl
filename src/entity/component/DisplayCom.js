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
  this._layerIndex = 0;
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
  this.lerp = 1;
};

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorX", {
  get: function() {
    return this.anchor.x;
  },
  set: function(value) {
    this.anchor.x = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorY", {
  get: function() {
    return this.anchor.y;
  },
  set: function(value) {
    this.anchor.y = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "offsetX", {
  get: function() {
    return this.offset.x;
  },
  set: function(value) {
    this.offset.x = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "offsetY", {
  get: function() {
    return this.offset.y;
  },
  set: function(value) {
    this.offset.y = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "layerIndex", {
  get: function() {
    return this._layerIndex;
  },
  set: function(value) {
    this._layerIndex = value;
    // TODO: this should only be dispatched if it's already been added to display system
    this.beacon.emit('updatedLayerIndex', {});
  }
});

Pxl.DisplayCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
  
  this.physics = this.entity.fetchComponent(Pxl.PhysicsComponent);
  if (this.physics != null) {
    this.physics.beacon.observe(this, "updated", this.onPhysicsUpdated);
    this.onPhysicsUpdated();
  }
};

Pxl.DisplayCom.prototype.sizePhysics = function() {
};

Pxl.DisplayCom.prototype.onPhysicsUpdated = function() {
  this.loc.x = this.physics.rect.loc.x;
  this.loc.y = this.physics.rect.loc.y;
  this.speedX = this.physics.speedX;
  this.speedY = this.physics.speedY;
};
