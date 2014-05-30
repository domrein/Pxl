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
    return this.grid.length;
  }
});

Pxl.GridPlacerCom.prototype.rotate = function() {
  var rotatedGrid = [];
  while (rotatedGrid.length < this.width)
    rotatedGrid.push("");

  for (var i = this.height - 1; i >= 0; i --) {
    for (var j = 0; j < this.width; j ++) {
      rotatedGrid[j] += this.grid[i][j];
    }
  }

  this.grid = rotatedGrid;
};

// [x.x]
// [...]
// [xxx]

// [x.x]
// [x..]
// [x.x]

Pxl.GridPlacerCom.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  this.grid = [];
  this.gridCell = null;
  this.rotation = 0;
};

Pxl.GridPlacerCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
};
