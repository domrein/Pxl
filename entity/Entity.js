Plx.Entity = function() {
  this.beacon = new Plx.Beacon(this);
  this.components = [];
  this.alive = true;
  this.scene = null;
  this.id = Plx.Entity.idCounter++;
};

Plx.Entity.idCounter = 0;

Plx.Entity.prototype.update = function() {
  this.beacon.emit('updated', null);
};

Plx.Entity.prototype.addComponent = function(component) {
  component.entity = this;
  component.beacon.emit('added', null);
  this.components.push(component);

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

Plx.Entity.prototype.destroy = function() {
  this.beacon.destroy();
  for (var i = 0; i < this.components.length; i ++) {
    var component = this.components[i];
    component.destroy();
  }
  this.components = [];
};
