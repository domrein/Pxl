Pxl.System = function() {
  this.beacon = new Pxl.Beacon(this);
  this.beacon.observe(this, "addedToScene", function(event) {
    this.scene.beacon.observe(this, "entityAdded", this.onEntityAdded);
    this.scene.beacon.observe(this, "entityRemoved", this.onEntityRemoved);
  });
  this.scene = null;
  this.componentTypes = [];
  this.components = [];
};

// TODO: pull this up into System
Pxl.System.prototype.onEntityAdded = function(event) {
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

Pxl.System.prototype.onEntityRemoved = function(event) {
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

Pxl.System.prototype.addComponent = function(component) {
  this.components.push(component);
  component.system = this;
};

Pxl.System.prototype.removeComponent = function(component) {
  this.components.splice(this.components.indexOf(component), 1);
};

Pxl.System.prototype.update = function() {
};

Pxl.System.prototype.destroy = function() {
  this.beacon.destroy();
};
