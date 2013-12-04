Plx.CanvasRenderer = function() {
  Plx.System.call(this);
  this.entitySprites = [];
  this.beacon.observe(this, 'addedToScene', this.onAddedToScene);
  this.canvas = document.getElementById("canvas");
  this.context = this.canvas.getContext('2d');
};

Plx.CanvasRenderer.prototype = Object.create(Plx.System.prototype);
Plx.CanvasRenderer.prototype.constructor = Plx.CanvasRenderer;

Plx.CanvasRenderer.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, 'entityAdded', this.onEntityAdded);
  this.scene.beacon.observe(this, 'entityRemoved', this.onEntityRemoved);
  this.scene.beacon.observe(this, 'updated', this.onUpdated, 10);
};

Plx.CanvasRenderer.prototype.onEntityAdded = function(event) {
  // if entity has sprite component, add it to the system
  var entity = event.data['entity'];
  for (var i = 0; i < entity.components.length; i++) {
    var component = entity.components[i];
    if (component instanceof Plx.Sprite)
      this.entitySprites.push(component);
  };
};

Plx.CanvasRenderer.prototype.onEntityRemoved = function(event) {
  // if entity has sprite component, remove it from the system
};

Plx.CanvasRenderer.prototype.onUpdated = function(event) {
  this.context.fillStyle = "rgba(0, 0, 0, .1)";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  for (var i = 0; i < this.entitySprites.length; i++) {
    var sprite = this.entitySprites[i];
    this.context.fillStyle = "#FF0000";
    this.context.fillRect(sprite.x - 2, sprite.y - 2, 4, 4);
  }
};
