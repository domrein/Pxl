Pxl.Entity = function() {
  this.beacon = new Pxl.Beacon(this);
  // maybe we should have the id increment when it's inited?
  this.id = Pxl.Entity.idCounter++;
  this.components = [];
  this.componentMap = {};
  this.typeName = null;
  this.reset();
};

Pxl.Entity.idCounter = 0;

Pxl.Entity.prototype.reset = function() {
  for (var i = 0; i < this.components.length; i ++)
    this.components[i].reset();
  this.beacon.reset();
  this.alive = true;
  this.scene = null;
  this.game = null;
  // these arguments can be passed in and accessed by components during the init phase
  this.args = null;
};

Pxl.Entity.prototype.update = function() {
  this.beacon.emit('updated', null);
};

Pxl.Entity.prototype.addComponent = function(component) {
  component.entity = this;
  component.game = this.game;
  component.beacon.emit('added', null);
  this.components.push(component);
  this.componentMap[component.name] = component;

  // add getter for component for convenience
  Object.defineProperty(this, component.name, {
    get: function() {
      return this.componentMap[component.name];
    }
  });

  return component;
};

Pxl.Entity.prototype.fetchComponent = function(componentClass) {
  for (var i = 0; i < this.components.length; i ++) {
    var component = this.components[i];
    if (component instanceof componentClass)
      return component;
  }
  return null;
};

Pxl.Entity.prototype.fetchComponentByName = function(name) {
  return this.componentMap[name];
};

Pxl.Entity.prototype.destroy = function() {
  this.beacon.destroy();
  for (var i = 0; i < this.components.length; i ++) {
    var component = this.components[i];
    component.destroy();
  }
  this.components = [];
};
