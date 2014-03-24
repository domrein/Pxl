Plx.GridPlacerSys = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.GridPlacerCom];
  this.width = 0;
  this.height = 0;
  this.grid = [];
  this.gridOffset = new Plx.Point(); // offset used when calculating physics location
  this.gridCellSize = 0; // physics size of each cell
  // this.beacon.observe(this, "updated", function(event) {
  //   console.log("updated");
  // });
};

Plx.GridPlacerSys.prototype = Object.create(Plx.System.prototype);
Plx.GridPlacerSys.prototype.constructor = Plx.GridPlacerSys;


Plx.GridPlacerSys.prototype.addComponent = function(component) {
  Plx.System.prototype.addComponent.call(this, component);
  // TODO: make all the dependencies optional
  component.entity.componentMap.pointer.beacon.observe(this, "dragEnded", this.onComponentDragEnded);
};

Plx.GridPlacerSys.prototype.resizeGrid = function(width, height) {
  // TODO: run through the grid and see if the resize has invalidated items? (May need to update gridCell on the components)
  this.width = width;
  this.height = height;
  this.grid = [];
  for (var i = 0; i < height; i ++) {
    var row = "";
    for (var j = 0; j < width; j ++)
      row += ".";
    this.grid.push(row);
  }
};

Plx.GridPlacerSys.prototype.update = function() {
};

Plx.GridPlacerSys.prototype.onComponentDragEnded = function(event) {
  var physics = event.beacon.owner.physics;
  var gridPlacer = event.beacon.owner.entity.componentMap.gridPlacer;
  var x = Math.floor((physics.x - this.gridOffset.x) / this.gridCellSize);
  var y = Math.floor((physics.y - this.gridOffset.y) / this.gridCellSize);
  var validPlacement = this.validatePlacement(x, y, gridPlacer.grid);
  if (validPlacement) {
    this.placeComponent(x, y, gridPlacer);
    event.beacon.emit("gridPlacementSucceeded", {});

    var tween = new Plx.Tween(physics, "x", this.scene.beacon, "updated");
    tween.beacon.observe(this, "completed", function() {});
    tween.start(physics.x, x * this.gridCellSize + this.gridOffset.x, 5);
    
    tween = new Plx.Tween(physics, "y", this.scene.beacon, "updated");
    tween.beacon.observe(this, "completed", function() {});
    tween.start(physics.y, y * this.gridCellSize + this.gridOffset.y, 5);
  }
  else {
    event.beacon.emit("gridPlacementFailed", {});
  }
};

Plx.GridPlacerSys.prototype.validatePlacement = function(x, y, componentGrid) {
  var valid = true;
  if (x < 0 || x >= this.width || y < 0 || y >= this.height)
    valid = false;
  else {
    for (var i = 0; i < componentGrid.length; i++) {
      var line = componentGrid[i];
      for (var j = 0; j < line.length; j++) {
        var character = line[j];
        if (character == "x" && this.grid[i + y].charAt(j + x) == "x")
          valid = false;
      }
    }
  }

  return valid;
};

Plx.GridPlacerSys.prototype.placeComponent = function(x, y, component) {
  component.gridCell = new Plx.Point(x, y);
  for (var i = 0; i < component.grid.length; i++) {
    var line = component.grid[i];
    for (var j = 0; j < line.length; j++) {
      var character = line[j];
      if (character == "x")
        this.grid[i + y][j + x] = "x";
    }
  }
};

Plx.GridPlacerSys.prototype.removeComponent = function(x, y, component) {
  // this.placedComponents.push({x: x, y: y, component: component});
};

// This might be useful for manually blocking out spots in the grid
Plx.GridPlacerSys.changeAvailability = function(x, y, open) {
  if (y < 0 || y >= this.height || x < 0 || x >= this.width)
    console.log("Invalid coordinate update (" + x + ", " + y + ")");
  else
    this.grid[y][x] = (open) ? '.' : 'x';
};

Plx.GridPlacerSys.prototype.destroy = function() {
};
