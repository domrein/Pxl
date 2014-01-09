Plx.System = function() {
  this.beacon = new Plx.Beacon(this);
  this.beacon.observe(this, "addedToScene", function(event) {
    this.scene.beacon.observe(this, "entityAdded", this.onEntityAdded);
    this.scene.beacon.observe(this, "entityRemoved", this.onEntityRemoved);
  });
  this.scene = null;
  this.componentTypes = [];
};

// TODO: pull this up into System
Plx.System.prototype.onEntityAdded = function(event) {
  var _this = this;
  // if entity has tappable, draggable component, add it to the system
  var entity = event.data.entity;
  for (var i = 0; i < entity.components.length; i ++) {
    var component = entity.components[i];
    this.componentTypes.forEach(function(componentType) {
      if (component instanceof componentType)
        _this.addComponent(component);
    });
  }
};

Plx.System.prototype.onEntityRemoved = function(event) {
  var _this = this;
  // if entity has sprite component, remove it from the system
  var entity = event.data.entity;
  for (var i = entity.components.length - 1; i >= 0; i--) {
    var component = entity.components[i];
    this.componentTypes.forEach(function(componentType) {
      if (component instanceof componentType)
        _this.removeComponent(component);
    });
  }
};

Plx.System.prototype.addComponent = function(component) {
};

Plx.System.prototype.removeComponent = function(component) {
};

Plx.System.prototype.update = function() {
};

Plx.System.prototype.destroy = function() {
  this.beacon.destroy();
};
