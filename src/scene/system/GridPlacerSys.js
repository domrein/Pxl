Pxl.GridPlacerSys = function() {
  Pxl.System.call(this);
  this.componentTypes = [Pxl.GridPlacerCom];
  this.width = 0;
  this.height = 0;
  this.grid = [];
  this.gridOffset = new Pxl.Point(); // offset used when calculating physics location
  this.gridCellSize = 0; // physics size of each cell
  // this.beacon.observe(this, "updated", function(event) {
  //   console.log("updated");
  // });
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
  this.rebuildGrid(event.beacon.owner.entity.cm.gridPlacer);
};

Pxl.GridPlacerSys.prototype.onComponentDragEnded = function(event) {
  var physics = event.beacon.owner.physics;
  var display = event.beacon.owner.display;
  // get the size of the frame
  // rotate width/height accordingly
  // calculate offsets
  var gridPlacer = event.beacon.owner.entity.cm.gridPlacer;
  var width = gridPlacer.width * this.gridCellSize;
  var height = gridPlacer.height * this.gridCellSize;
  if (display.rotation == 0) {
    var myX = physics.x;
    var myY = physics.y;
  }
  else if (display.rotation == Math.PI / 2) {
    // myX = physics.x + display.offsetY - width;
    // myY = physics.y + display.offsetX - height;
    console.log('<here>');
    console.log(physics.x);
    console.log(display.offsetX);
    console.log(width);
    console.log('</here>');
    myX = physics.x + display.offsetX + display.offsetY - width;
    myY = physics.y + display.offsetY - display.offsetX;
  }

  console.log(myX);
  console.log(myY);

  var x = Math.round((myX - this.gridOffset.x) / this.gridCellSize);
  var y = Math.round((myY - this.gridOffset.y) / this.gridCellSize);
  console.log(x);
  console.log(y);
  var validPlacement = this.validatePlacement(x, y, gridPlacer);
  if (validPlacement) {
    this.placeComponent(x, y, gridPlacer);
    this.rebuildGrid();
    gridPlacer.beacon.emit("gridPlacementSucceeded", {});

    var tween = new Pxl.Tween(physics, "x", this.scene.beacon, "updated");
    tween.start(physics.x, x * this.gridCellSize + this.gridOffset.x, 5);
    
    tween = new Pxl.Tween(physics, "y", this.scene.beacon, "updated");
    tween.start(physics.y, y * this.gridCellSize + this.gridOffset.y, 5);
  }
  else {
    event.beacon.emit("gridPlacementFailed", {});

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
    // this.components.forEach(function(component) {
    //   if (!component.gridCell || gridPlacer === component)
    //     continue;
    // });
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
  console.log(this.grid);
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
      var physics = component.entity.cm.physics;
      var x = Math.round((physics.x - _this.gridOffset.x) / _this.gridCellSize);
      var y = Math.round((physics.y - _this.gridOffset.y) / _this.gridCellSize);
      _this.placeComponent(x, y, component)
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
