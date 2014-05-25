Pxl.GridPlacerCom = function() {
  Pxl.Component.call(this);
  this.reset();
};

Pxl.GridPlacerCom.prototype = Object.create(Pxl.Component.prototype);
Pxl.GridPlacerCom.prototype.constructor = Pxl.GridPlacerCom;

Object.defineProperty(Pxl.GridPlacerCom.prototype, "width", {
  get: function() {
    if (!this.grid.length)
      return 0;
    return this.grid[0].length;
  }
});

Object.defineProperty(Pxl.GridPlacerCom.prototype, "height", {
  get: function() {
    return this.grid.length
  }
});


Pxl.GridPlacerCom.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  this.data = {};
  this.grid = [];
  this.gridCell = null;
};

Pxl.GridPlacerCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
};
