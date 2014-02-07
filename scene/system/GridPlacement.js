Plx.GridPlacement = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.GridItem];
  this.width = 0;
  this.height = 0;
};

Plx.GridPlacement.prototype = Object.create(Plx.System.prototype);
Plx.GridPlacement.prototype.constructor = Plx.GridPlacement;

Plx.GridPlacement.prototype.update = function() {  
};

Plx.GridPlacement.prototype.addComponent = function(component) {
};

Plx.GridPlacement.prototype.removeComponent = function(component) {
};

Plx.GridPlacement.prototype.destroy = function() {
};
