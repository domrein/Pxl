Plx.SpriteRenderer = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.Sprite];
  this.sprites = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
  // internal canvas for drawing
  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");

  // display canvas (canvas we flip the back buffer onto)
  this.displayCanvas = document.getElementById("canvas");
  this.displayContext = this.displayCanvas.getContext("2d");
  this.smoothImages = false;
};

Plx.SpriteRenderer.prototype = Object.create(Plx.System.prototype);
Plx.SpriteRenderer.prototype.constructor = Plx.SpriteRenderer;

Plx.SpriteRenderer.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "added", this.onSceneAddedToGame);
  this.scene.beacon.observe(this, "rendered", this.onRendered, 10);
  this.scene.beacon.observe(this, "renderCompleted", this.onRenderCompleted);
};

Plx.SpriteRenderer.prototype.onSceneAddedToGame = function(event) {
  // NOTE: whenever you adjust the width/height of the canvas, anything like imageSmoothing will be reset to default
  this.canvas.width = this.scene.game.width;
  this.canvas.height = this.scene.game.height;
  this.scene.game.beacon.observe(this, "displayResized", this.onDisplayResized);
  this.onDisplayResized();
};

Plx.SpriteRenderer.prototype.onDisplayResized = function(event) {
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

Plx.SpriteRenderer.prototype.addComponent = function(component) {
  var inserted = false
  // TODO: this number is blowing up as we add components!
  for (var i = 0; i < this.sprites.length; i++) {
    var sprite = this.sprites[i];
    if (sprite.z > component.z) {
      inserted = true;
      this.sprites.splice(i, 0, component);
      break;
    }
  }
  if (!inserted)
    this.sprites.push(component);
  component.beacon.observe(this, "updatedZIndex", this.onSpriteUpdatedZIndex);
};

Plx.SpriteRenderer.prototype.removeComponent = function(component) {
  for (var i = this.sprites.length - 1; i >= 0; i--) {
    var otherComponent = this.sprites[i];
    if (component != otherComponent)
      continue;
    component.beacon.ignore(this, "updatedZIndex", this.onSpriteUpdatedZIndex);
    this.sprites.splice(i, 1);
  }
};

Plx.SpriteRenderer.prototype.onSpriteUpdatedZIndex = function(event) {
  var sprite = event.beacon.owner;
  this.removeComponent(sprite);
  this.addComponent(sprite);
};

Plx.SpriteRenderer.prototype.onRendered = function(event) {
  this.context.fillStyle = "rgba(0, 0, 0, 1)";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  for (var i = 0; i < this.sprites.length; i++) {
    var sprite = this.sprites[i];
    if (!sprite.visible)
      continue;
    if (!sprite.anim || !sprite.frame)
      continue;
    var spriteX = sprite.loc.x + sprite.speedX * event.data.frameProgress;
    var spriteY = sprite.loc.y + sprite.speedY * event.data.frameProgress;
    var drawOffsetX = 0;
    var drawOffsetY = 0;
    var image = this.scene.game.spriteStore.images[sprite.frame.image];
    if (sprite.flippedX || sprite.flippedY || sprite.rotation || sprite.alpha != 1) {
      this.context.save();
      // TODO: make flipping work in conjunction with rotation and anchors
      if (sprite.rotation) {
        this.context.translate(Math.round(spriteX + sprite.anchor.x * sprite.scaleX), Math.round(spriteY + sprite.anchor.y * sprite.scaleY));
        drawOffsetX = -sprite.anchor.x * sprite.scaleX;
        drawOffsetY = -sprite.anchor.y * sprite.scaleY;
        this.context.rotate(sprite.rotation);
        spriteX = 0;
        spriteY = 0;
      }
      if (sprite.flippedX || sprite.flippedY) {
        var flipX = (sprite.flippedX) ? 1 : 0;
        var flipY = (sprite.flippedY) ? 1 : 0;
        var scaleX = (sprite.flippedX) ? -1 : 1;
        var scaleY = (sprite.flippedY) ? -1 : 1;
        this.context.translate(Math.round(spriteX + sprite.frame.width * sprite.scaleX * flipX), Math.round(spriteY + sprite.frame.height * sprite.scaleY * flipY));
        this.context.scale(scaleX, scaleY);
        spriteX = 0;
        spriteY = 0;
      }
      // this.context.fillStyle = "#00FF00";
      // this.context.strokeRect(drawOffsetX, drawOffsetY, Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY));
      this.context.drawImage(image, sprite.frame.x, sprite.frame.y, sprite.frame.width, sprite.frame.height, 0 + drawOffsetX, 0 + drawOffsetY, Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY));
      this.context.restore();
    }
    else {
      // this.context.fillStyle = "#00FF00";
      // this.context.strokeRect(spriteX, spriteY, Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY));
      this.context.drawImage(image, sprite.frame.x, sprite.frame.y, sprite.frame.width, sprite.frame.height, Math.round(spriteX), Math.round(spriteY), Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY));
    }
  }
  this.beacon.emit("renderingCompleted", null);
};

Plx.SpriteRenderer.prototype.onRenderCompleted = function(event) {
  this.displayContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
  // this.displayContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
  // this.displayContext.fillStyle = "#FF0000";
  // this.displayContext.fillRect(0, 0, 20, 20);
};

Plx.SpriteRenderer.prototype.destroy = function() {
  this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded);
  this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
};
