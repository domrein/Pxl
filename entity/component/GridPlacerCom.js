Plx.GridPlacerCom = function() {
  Plx.Component.call(this);
  this.data = {};
  // grid is a comma delimeted list of strings. "." means nothing is in that spot. "x" means that spot is occuppied by the item
  this.grid = [];
};

Plx.GridPlacerCom.prototype = Object.create(Plx.Component.prototype);
Plx.GridPlacerCom.prototype.constructor = Plx.GridPlacerCom;

Object.defineProperty(Plx.GridPlacerCom.prototype, "width", {
  get: function() {
    if (!this.grid.length)
      return 0;
    return this.grid[0].length;
  }
});

Object.defineProperty(Plx.GridPlacerCom.prototype, "height", {
  get: function() {
    return this.grid.length
  }
});


Plx.GridPlacerCom.prototype.reset = function() {
};

Plx.GridPlacerCom.prototype.init = function() {
};
