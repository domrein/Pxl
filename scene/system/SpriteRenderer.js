Plx.SpriteRenderer = function() {
  Plx.System.call(this);
  this.sprites = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
  this.canvas = document.getElementById("canvas");
  this.context = this.canvas.getContext("2d");

  // I hate cross browser crap like this!
  this.context.imageSmoothingEnabled = false;
  this.context.mozImageSmoothingEnabled = false;
  this.context.webkitImageSmoothingEnabled = false;
};

Plx.SpriteRenderer.prototype = Object.create(Plx.System.prototype);
Plx.SpriteRenderer.prototype.constructor = Plx.SpriteRenderer;

Plx.SpriteRenderer.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "entityAdded", this.onEntityAdded);
  this.scene.beacon.observe(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.observe(this, "rendered", this.onRendered, 10);
};

Plx.SpriteRenderer.prototype.onEntityAdded = function(event) {
  // if entity has sprite component, add it to the system
  var entity = event.data.entity;
  for (var i = 0; i < entity.components.length; i ++) {
    var component = entity.components[i];
    if (component instanceof Plx.Sprite)
      this.addComponent(component);
  }
};

Plx.SpriteRenderer.prototype.onEntityRemoved = function(event) {
  // if entity has sprite component, remove it from the system
  var entity = event.data.entity;
  for (var i = entity.components.length - 1; i >= 0; i--) {
    var component = entity.components[i];
    if (component instanceof Plx.Sprite)
      this.removeComponent(component);
  }
};

Plx.SpriteRenderer.prototype.addComponent = function(spriteComponent) {
  var inserted = false
  // TODO: this number is blowing up as we add components!
  for (var i = 0; i < this.sprites.length; i++) {
    var sprite = this.sprites[i];
    if (sprite.z > spriteComponent.z) {
      inserted = true;
      this.sprites.splice(i, 0, spriteComponent);
      break;
    }
  }
  if (!inserted)
    this.sprites.push(spriteComponent);
  spriteComponent.beacon.observe(this, "updatedZIndex", this.onSpriteUpdatedZIndex);
};

Plx.SpriteRenderer.prototype.removeComponent = function(spriteComponent) {
  for (var i = this.sprites.length - 1; i >= 0; i--) {
    var otherComponent = this.sprites[i];
    if (spriteComponent != otherComponent)
      continue;
    spriteComponent.beacon.ignore(this, "updatedZIndex", this.onSpriteUpdatedZIndex);
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

Plx.SpriteRenderer.prototype.destroy = function() {
  this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded);
  this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
};
