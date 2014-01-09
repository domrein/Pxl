Plx.Entity = function() {
  this.beacon = new Plx.Beacon(this);
  // maybe we should have the id increment when it's inited?
  this.id = Plx.Entity.idCounter++;
  this.components = [];
  this.componentMap = {};
  this.typeName = null;
  this.reset();
};

Plx.Entity.idCounter = 0;

Plx.Entity.prototype.reset = function() {
  for (var i = 0; i < this.components.length; i ++)
    this.components[i].reset();
  this.beacon.reset();
  this.alive = true;
  this.scene = null;
  this.game = null;
};

Plx.Entity.prototype.update = function() {
  this.beacon.emit('updated', null);
};

Plx.Entity.prototype.addComponent = function(component) {
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

Plx.Entity.prototype.fetchComponent = function(componentClass) {
  for (var i = 0; i < this.components.length; i ++) {
    var component = this.components[i];
    if (component instanceof componentClass)
      return component;
  }
  return null;
};

Plx.Entity.prototype.fetchComponentByName = function(name) {
  return this.componentMap[name];
};

Plx.Entity.prototype.destroy = function() {
  this.beacon.destroy();
  for (var i = 0; i < this.components.length; i ++) {
    var component = this.components[i];
    component.destroy();
  }
  this.components = [];
};
