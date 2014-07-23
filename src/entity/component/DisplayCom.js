Pxl.DisplayCom = function() {
  Pxl.Component.call(this);
  this.loc = new Pxl.Point();
  this.pivot = new Pxl.Point();
  this.anchor = new Pxl.Point();
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
  this.pivot.reset();
  this.anchor.reset();
  this.scaleX = 1;
  this.scaleY = 1;
  this.flippedX = false;
  this.flippedY = false;
  this.alpha = 1;
  this.autoSizePhysics = false;
  this.lerp = 1;
};

Object.defineProperty(Pxl.DisplayCom.prototype, "pivotX", {
  get: function() {
    return this.pivot.x;
  },
  set: function(value) {
    if (value === 'center')
      this.pivot.x = this.width / 2;
    else
      this.pivot.x = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "pivotY", {
  get: function() {
    return this.pivot.y;
  },
  set: function(value) {
    if (value === 'center')
      this.pivot.y = this.height / 2;
    else
      this.pivot.y = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorX", {
  get: function() {
    return this.anchor.x;
  },
  set: function(value) {
    if (value === 'center')
      this.anchor.x = this.width / 2;
    else
      this.anchor.x = value;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "anchorY", {
  get: function() {
    return this.anchor.y;
  },
  set: function(value) {
    if (value === 'center')
      this.anchor.y = this.height / 2;
    else
      this.anchor.y = value;
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

Object.defineProperty(Pxl.DisplayCom.prototype, "width", {
  get: function() {
    return 0;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "height", {
  get: function() {
    return 0;
  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "left", {
  get: function() {

  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "right", {
  get: function() {

  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "top", {
  get: function() {

  }
});

Object.defineProperty(Pxl.DisplayCom.prototype, "bottom", {
  get: function() {

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
  this.loc.x = this.physics.rect.x;
  this.loc.y = this.physics.rect.y;
  this.speedX = this.physics.speedX;
  this.speedY = this.physics.speedY;
};
