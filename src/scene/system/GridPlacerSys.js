Pxl.GridPlacerSys = function() {
  Pxl.System.call(this);
  this.componentTypes = [Pxl.GridPlacerCom];
  this.width = 0;
  this.height = 0;
  this.grid = [];
  this.gridOffset = new Pxl.Point(); // offset used when calculating physics location
  this.gridCellSize = 0; // physics size of each cell
};

Pxl.GridPlacerSys.prototype = Object.create(Pxl.System.prototype);
Pxl.GridPlacerSys.prototype.constructor = Pxl.GridPlacerSys;


Pxl.GridPlacerSys.prototype.addComponent = function(component) {
  Pxl.System.prototype.addComponent.call(this, component);
  // TODO: make all the dependencies optional
  component.entity.cm.pointer.beacon.observe(this, "dragStarted", this.onComponentDragStarted);
  component.entity.cm.pointer.beacon.observe(this, "dragEnded", this.onComponentDragEnded);
};

Pxl.GridPlacerSys.prototype.resizeGrid = function(width, height) {
  // TODO: run through the grid and see if the resize has invalidated items? (May need to update gridCell on the components)
  this.width = width;
  this.height = height;
  this.rebuildGrid();
};

Pxl.GridPlacerSys.prototype.update = function() {
};

Pxl.GridPlacerSys.prototype.onComponentDragStarted = function(event) {
  var gridPlacer = event.beacon.owner.entity.cm.gridPlacer;
  this.rebuildGrid(gridPlacer);
};

Pxl.GridPlacerSys.prototype.calcGridXY = function(entity) {
  var physics = entity.cm.physics;
  // get the size of the frame
  // rotate width/height accordingly
  // calculate offsets
  var gridPlacer = entity.cm.gridPlacer;
  var width = gridPlacer.width * this.gridCellSize;
  var height = gridPlacer.height * this.gridCellSize;
  if (gridPlacer.rotation == 0 || gridPlacer.rotation == 2) {
    var myX = physics.x;
    var myY = physics.y;
  }
  else if (gridPlacer.rotation == 1 || gridPlacer.rotation == 3) {
    myX = physics.x + height / 2 - width / 2;
    myY = physics.y + width / 2 - height / 2;
  }

  var gridX = Math.round((myX - this.gridOffset.x) / this.gridCellSize);
  var gridY = Math.round((myY - this.gridOffset.y) / this.gridCellSize);

  return {x: gridX, y: gridY, rotatedX: myX, rotatedY: myY};
};

Pxl.GridPlacerSys.prototype.onComponentDragEnded = function(event) {
  var physics = event.beacon.owner.physics;
  var gridPlacer = event.beacon.owner.entity.cm.gridPlacer;

  var gridXY = this.calcGridXY(event.beacon.owner.entity);
  var validPlacement = this.validatePlacement(gridXY.x, gridXY.y, gridPlacer);
  if (validPlacement) {
    this.placeComponent(gridXY.x, gridXY.y, gridPlacer);
    this.rebuildGrid();
    gridPlacer.beacon.emit("gridPlacementSucceeded", {});
    gridPlacer.lastRotation = gridPlacer.rotation;

    var tween = new Pxl.Tween(physics, "x", this.scene.beacon, "updated");
    var targetX = gridXY.x * this.gridCellSize + this.gridOffset.x;
    var targetY = gridXY.y * this.gridCellSize + this.gridOffset.y;
    tween.start(physics.x, targetX + (physics.x - gridXY.rotatedX), 5);
    
    tween = new Pxl.Tween(physics, "y", this.scene.beacon, "updated");
    tween.start(physics.y, targetY + (physics.y - gridXY.rotatedY), 5);
  }
  else {
    gridPlacer.beacon.emit("gridPlacementFailed", {});
    var lastRotation = gridPlacer.lastRotation;
    var curRotation = gridPlacer.rotation;
    if (lastRotation > curRotation)
      lastRotation += 4;
    if (lastRotation - curRotation) {
      gridPlacer.rotate(lastRotation - curRotation);
    }

    tween = new Pxl.Tween(physics, "x", this.scene.beacon, "updated");
    tween.start(physics.x, event.beacon.owner.dragStart.x, 5);
    
    tween = new Pxl.Tween(physics, "y", this.scene.beacon, "updated");
    tween.start(physics.y, event.beacon.owner.dragStart.y, 5);
  }
};

Pxl.GridPlacerSys.prototype.validatePlacement = function(x, y, gridPlacer) {
  var valid = true;
  if (x < 0 || x + gridPlacer.grid[0].length > this.width || y < 0 || y + gridPlacer.grid.length > this.height)
    valid = false;
  else {
    for (var i = 0; i < gridPlacer.grid.length; i++) {
      var line = gridPlacer.grid[i];
      for (var j = 0; j < line.length; j++) {
        var character = line[j];
        if (character == "x" && this.grid[i + y].charAt(j + x) == "x")
          valid = false;
      }
    }
  }
  
  return valid;
};

Pxl.GridPlacerSys.prototype.placeComponent = function(x, y, component) {
  component.gridCell = new Pxl.Point(x, y);
  for (var i = 0; i < component.grid.length; i++) {
    var line = component.grid[i];
    for (var j = 0; j < line.length; j++) {
      var character = line[j];
      if (character == "x") {
        var index = j + x;
        var oldString = this.grid[i + y];
        this.grid[i + y] = oldString.substr(0, index) +  "x" + oldString.substr(index + 1);
      }
    }
  }
};

Pxl.GridPlacerSys.prototype.rebuildGrid = function(componentExclusion) {
  var _this = this;
  this.grid = [];
  for (var i = 0; i < this.height; i ++) {
    var row = "";
    for (var j = 0; j < this.width; j ++)
      row += ".";
    this.grid.push(row);
  }

  this.components.forEach(function(component) {
    if (component === componentExclusion)
      return;
    if (component.gridCell) {
      var gridXY = _this.calcGridXY(component.entity);
      _this.placeComponent(gridXY.x, gridXY.y, component)
    }
  });
};

Pxl.GridPlacerSys.prototype.countEmptySpots = function() {
  var count = 0;
  this.grid.forEach(function(row) {
    for (var i = 0; i < row.length; i++) {
      if (row[i] == ".")
        count ++;
    }
  });

  return count;
};


Pxl.GridPlacerSys.prototype.removeComponent = function(x, y, component) {
  // this.placedComponents.push({x: x, y: y, component: component});
};

// This might be useful for manually blocking out spots in the grid
Pxl.GridPlacerSys.changeAvailability = function(x, y, open) {
  if (y < 0 || y >= this.height || x < 0 || x >= this.width)
    console.log("Invalid coordinate update (" + x + ", " + y + ")");
  else
    this.grid[y][x] = (open) ? '.' : 'x';
};

Pxl.GridPlacerSys.prototype.destroy = function() {
};
