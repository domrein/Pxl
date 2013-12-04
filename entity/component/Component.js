Plx.Component = function() {
  this.beacon = new Plx.Beacon(this);
  this.entity = null;
};

Plx.Component.prototype.destroy = function() {
  this.beacon.destroy();
};
