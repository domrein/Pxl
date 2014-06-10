Pxl.AudioSys = function() {
  Pxl.System.call(this);
  this.componentTypes = [Pxl.AudioCom];
  this.width = 0;
  this.height = 0;
  this.grid = [];
  this.gridOffset = new Pxl.Point(); // offset used when calculating physics location
  this.gridCellSize = 0; // physics size of each cell
};

Pxl.AudioSys.prototype = Object.create(Pxl.System.prototype);
Pxl.AudioSys.prototype.constructor = Pxl.AudioSys;

Pxl.AudioSys.prototype.addComponent = function(component) {
  Pxl.System.prototype.addComponent.call(this, component);
};

Pxl.AudioSys.prototype.update = function() {
};

Pxl.AudioSys.prototype.removeComponent = function(component) {
  Pxl.System.prototype.removeComponent.call(this, component);
};

Pxl.AudioSys.prototype.destroy = function() {
};
