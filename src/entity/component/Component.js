Pxl.Component = function() {
  this.beacon = new Pxl.Beacon(this);
  // we never move components from one entity to another, so we never need to rebind these after creation
  this.entity = null;
  this.name = null;
  this.id = Pxl.Component.idCounter++;
  this.data = {};
  this.initFunc = null;
  this.system = null;
};

Pxl.Component.idCounter = 0;

// used for resetting state. Called whenever parent entity is recycled
Pxl.Component.prototype.reset = function() {
  this.beacon.reset();
  this.data = {};
};

// TODO: have a custom function run at beginning and end of init call
// called once all default values have been set
Pxl.Component.prototype.init = function() {
  if (this.initFunc)
    this.initFunc();
};

Pxl.Component.prototype.destroy = function() {
  this.beacon.destroy();
};
