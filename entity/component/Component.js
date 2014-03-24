Plx.Component = function() {
  this.beacon = new Plx.Beacon(this);
  // we never move components from one entity to another, so we never need to rebind these after creation
  this.entity = null;
  this.name = null;
  this.id = Plx.Component.idCounter++;
  this.data = {};
  this.initFunc = null;
};

Plx.Component.idCounter = 0;

// used for resetting state. Called whenever parent entity is recycled
Plx.Component.prototype.reset = function() {
  this.beacon.reset();
};

// TODO: have a custom function run at beginning and end of init call
// called once all default values have been set
Plx.Component.prototype.init = function() {
  if (this.initFunc)
    this.initFunc();
};

Plx.Component.prototype.destroy = function() {
  this.beacon.destroy();
};
