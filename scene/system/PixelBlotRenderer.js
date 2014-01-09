Plx.PixelBlotRenderer = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.PixelBlotMap];
  this.pixelBlotMaps = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
  this.canvas = document.getElementById("canvas");
  this.context = this.canvas.getContext("2d");
  this.flicker = false; // TODO: set this to true for assimilate
  this.alphaFill = 1; // TODO: set this to .75 for assimilate
};

Plx.PixelBlotRenderer.prototype = Object.create(Plx.System.prototype);
Plx.PixelBlotRenderer.prototype.constructor = Plx.PixelBlotRenderer;

Plx.PixelBlotRenderer.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "rendered", this.onRendered, 10);
};

Plx.PixelBlotRenderer.prototype.addComponent = function(component) {
  this.pixelBlotMaps.push(component);
};

Plx.PixelBlotRenderer.prototype.removeComponent = function(component) {
  for (var j = this.pixelBlotMaps.length - 1; j >= 0; j --) {
    var otherComponent = this.pixelBlotMaps[j];
    if (component == otherComponent)
      this.pixelBlotMaps.splice(j, 1);
  }
};

Plx.PixelBlotRenderer.prototype.onRendered = function(event) {
  this.context.fillStyle = "rgba(0, 0, 0, " + this.alphaFill + ")";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  for (var i = 0; i < this.pixelBlotMaps.length; i++) {
    var blotMap = this.pixelBlotMaps[i];
    if (!blotMap.visible)
      continue;

    var blotMapX = Math.floor(blotMap.loc.x + blotMap.speedX * event.data.frameProgress);
    var blotMapY = Math.floor(blotMap.loc.y + blotMap.speedY * event.data.frameProgress);
    for (var j = 0; j < blotMap.pixelBlots.length; j++) {
      var blot = blotMap.pixelBlots[j];
      if (this.flicker) {
        if (Math.random() < .2)
          blot.alpha = 1;
        else
          blot.alpha -= .05;
      }

      var xOffset = 0;
//         if Math.random() > .99
//           if Math.random()
//             xOffset = 1
//           else
//             xOffset = -1
      var yOffset = 0;
//         if Math.random() > .99
//           if Math.random()
//             yOffset = 1
//           else
//             yOffset = -1

//         size = 2 + Math.random() * 3
      if (blot.alpha > 0) {
        this.context.fillStyle = "rgba(" + blot.red + "," + blot.green + "," + blot.blue + "," + blot.alpha + ")";
        var blotX = blotMapX + (blot.loc.x + xOffset) * blotMap.blotSize;
        var blotY = blotMapY + (blot.loc.y + yOffset) * blotMap.blotSize;
        this.context.fillRect(blotX, blotY, blotMap.blotSize, blotMap.blotSize);
      }
    }
  }
};

Plx.PixelBlotRenderer.prototype.destroy = function() {
  this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
};
