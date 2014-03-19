Plx.GridPlacerSys = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.GridItem];
  this.width = 0;
  this.height = 0;
};

Plx.GridPlacerSys.prototype = Object.create(Plx.System.prototype);
Plx.GridPlacerSys.prototype.constructor = Plx.GridPlacerSys;

Plx.GridPlacerSys.prototype.update = function() {  
};

Plx.GridPlacerSys.prototype.addComponent = function(component) {
};

Plx.GridPlacerSys.prototype.removeComponent = function(component) {
};

Plx.GridPlacerSys.prototype.destroy = function() {
};
