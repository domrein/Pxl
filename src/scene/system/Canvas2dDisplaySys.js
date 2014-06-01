Pxl.Canvas2dDisplaySys = function() {
  Pxl.System.call(this);
  this.componentTypes = [Pxl.SpriteCom, Pxl.TextCom];
  this.sortedDisplayComs = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
  // internal canvas for drawing
  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");

  // display canvas (canvas we flip the back buffer onto)
  this.displayCanvas = document.getElementById("canvas");
  this.displayContext = this.displayCanvas.getContext("2d");
  this.smoothImages = false;
  this.camera = new Pxl.Point();
};

Pxl.Canvas2dDisplaySys.prototype = Object.create(Pxl.System.prototype);
Pxl.Canvas2dDisplaySys.prototype.constructor = Pxl.Canvas2dDisplaySys;

Pxl.Canvas2dDisplaySys.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "added", this.onSceneAddedToGame);
  this.scene.beacon.observe(this, "rendered", this.onRendered, 10);
  this.scene.beacon.observe(this, "renderCompleted", this.onRenderCompleted);
};

Pxl.Canvas2dDisplaySys.prototype.onSceneAddedToGame = function(event) {
  // NOTE: whenever you adjust the width/height of the canvas, anything like imageSmoothing will be reset to default
  this.canvas.width = this.scene.game.width;
  this.canvas.height = this.scene.game.height;
  this.scene.game.beacon.observe(this, "displayResized", this.onDisplayResized);
  this.onDisplayResized();
};

Pxl.Canvas2dDisplaySys.prototype.onDisplayResized = function(event) {
  if (!this.smoothImages) {
    // Make sure we aren't smoothing any of our sweet pixel art
    this.context.imageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;

    // We want these false if we're scaling up, true if we're scaling down
    this.displayContext.imageSmoothingEnabled = false;
    this.displayContext.mozImageSmoothingEnabled = false;
    this.displayContext.webkitImageSmoothingEnabled = false;
  }
};

Pxl.Canvas2dDisplaySys.prototype.addComponent = function(component) {
  Pxl.System.prototype.addComponent.call(this, component);
  var inserted = false;
  // TODO: this number is blowing up as we add components!
  for (var i = 0; i < this.sortedDisplayComs.length; i++) {
    var displayCom = this.sortedDisplayComs[i];
    if (displayCom.layerIndex > component.layerIndex) {
      inserted = true;
      this.sortedDisplayComs.splice(i, 0, component);
      break;
    }
  }
  if (!inserted)
    this.sortedDisplayComs.push(component);
  component.beacon.observe(this, "updatedLayerIndex", this.onDisplayComUpdatedLayerIndex);
};

Pxl.Canvas2dDisplaySys.prototype.removeComponent = function(component) {
  Pxl.System.prototype.removeComponent.call(this, component);
  for (var i = this.sortedDisplayComs.length - 1; i >= 0; i--) {
    var otherComponent = this.sortedDisplayComs[i];
    if (component != otherComponent)
      continue;
    component.beacon.ignore(this, "updatedLayerIndex", this.onDisplayComUpdatedLayerIndex);
    this.sortedDisplayComs.splice(i, 1);
  }
};

Pxl.Canvas2dDisplaySys.prototype.onDisplayComUpdatedLayerIndex = function(event) {
  var displayCom = event.beacon.owner;
  this.removeComponent(displayCom);
  this.addComponent(displayCom);
};

Pxl.Canvas2dDisplaySys.prototype.onRendered = function(event) {
  var _this = this;
  this.context.fillStyle = "rgba(0, 0, 0, 1)";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.sortedDisplayComs.forEach(function(displayCom) {
    // TODO: move all common displayCom code up here
    if (!displayCom.visible)
      return;
    
    var offsetSumX = displayCom.anchorX * displayCom.scaleX;
    if (displayCom.scaleX != 1)
       offsetSumX -= (displayCom.pivotX * displayCom.scaleX - displayCom.pivotX);
    var offsetSumY = displayCom.anchorY * displayCom.scaleY;
    if (displayCom.scaleY != 1)
      offsetSumY -= (displayCom.pivotY * displayCom.scaleY - displayCom.pivotY);

    var displayComX = displayCom.loc.x + displayCom.speedX * event.data.frameProgress - offsetSumX - _this.camera.x * displayCom.lerp;
    var displayComY = displayCom.loc.y + displayCom.speedY * event.data.frameProgress - offsetSumY - _this.camera.y * displayCom.lerp;
    
    if (displayCom instanceof Pxl.SpriteCom) {
      if (!displayCom.anim || !displayCom.frame)
        return;
      var drawOffsetX = 0;
      var drawOffsetY = 0;
      var image = _this.scene.game.spriteStore.images[displayCom.frame.image];
      if (displayCom.flippedX || displayCom.flippedY || displayCom.rotation || displayCom.alpha != 1) {
        _this.context.save();
        // TODO: make flipping work in conjunction with rotation and pivots
        if (displayCom.rotation) {
          _this.context.translate(Math.round(displayComX + displayCom.pivotX), Math.round(displayComY + displayCom.pivotY));
          drawOffsetX = -displayCom.pivotX;
          drawOffsetY = -displayCom.pivotY;
          _this.context.rotate(displayCom.rotation);
          displayComX = 0;
          displayComY = 0;
        }
        if (displayCom.flippedX || displayCom.flippedY) {
          var flipX = (displayCom.flippedX) ? 1 : 0;
          var flipY = (displayCom.flippedY) ? 1 : 0;
          var scaleX = (displayCom.flippedX) ? -1 : 1;
          var scaleY = (displayCom.flippedY) ? -1 : 1;
          _this.context.translate(Math.round(displayComX + displayCom.frame.width * displayCom.scaleX * flipX), Math.round(displayComY + displayCom.frame.height * displayCom.scaleY * flipY));
          _this.context.scale(scaleX, scaleY);
          displayComX = 0;
          displayComY = 0;
        }
        // _this.context.fillStyle = "#00FF00";
        // _this.context.strokeRect(drawOffsetX, drawOffsetY, Math.round(displayCom.frame.width * displayCom.scaleX), Math.round(displayCom.frame.height * displayCom.scaleY));
        _this.context.drawImage(image, displayCom.frame.x, displayCom.frame.y, displayCom.frame.width, displayCom.frame.height, 0 + drawOffsetX, 0 + drawOffsetY, Math.round(displayCom.frame.width * displayCom.scaleX), Math.round(displayCom.frame.height * displayCom.scaleY));
        _this.context.restore();
      }
      else {
        // _this.context.fillStyle = "#00FF00";
        // _this.context.strokeRect(displayComX, displayComY, Math.round(displayCom.frame.width * displayCom.scaleX), Math.round(displayCom.frame.height * displayCom.scaleY));
        _this.context.drawImage(image, displayCom.frame.x, displayCom.frame.y, displayCom.frame.width, displayCom.frame.height, Math.round(displayComX), Math.round(displayComY), Math.round(displayCom.frame.width * displayCom.scaleX), Math.round(displayCom.frame.height * displayCom.scaleY));
      }
    }
    else if (displayCom instanceof Pxl.TextCom) {
      var widthTotal = 0;
      displayCom.frames.forEach(function(letterFrame) {
        image = _this.scene.game.spriteStore.images[letterFrame.image];
        _this.context.drawImage(image, letterFrame.x, letterFrame.y, letterFrame.width, letterFrame.height, Math.round(displayComX + widthTotal), Math.round(displayComY), Math.round(letterFrame.width), Math.round(letterFrame.height));
        widthTotal += letterFrame.width;
      });
    }
  });
  this.beacon.emit("renderingCompleted", null);
};

Pxl.Canvas2dDisplaySys.prototype.onRenderCompleted = function(event) {
  this.displayContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
  // this.displayContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
  // this.displayContext.fillStyle = "#FF0000";
  // this.displayContext.fillRect(0, 0, 20, 20);
};

Pxl.Canvas2dDisplaySys.prototype.destroy = function() {
  this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded);
  this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
};
