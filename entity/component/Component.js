Plx.Component = function() {
  this.beacon = new Plx.Beacon(this);
  // we never move components from one entity to another, so we never need to rebind these after creation
  this.entity = null;
  this.name = null;

  this.rreset();
};

// TEMP: stupid name until I figure out how I wanna do super calls
Plx.Component.prototype.rreset = function() {
  this.beacon.reset();
};

Plx.Component.prototype.destroy = function() {
  this.beacon.destroy();
};
