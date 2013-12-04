Plx.System = function() {
  this.beacon = new Plx.Beacon(this);
  this.scene = null;
};

Plx.System.prototype.update = function() {
};

Plx.System.prototype.destroy = function() {
  this.beacon.destroy();
};
