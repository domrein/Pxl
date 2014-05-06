Pxl.PixelBlotMap = function(map, width) {
  Pxl.Component.call(this);
  this.loc = new Point();
  this.speedX = 0;
  this.speedY = 0;
  this.pixelBlots = [];
  this.blotSize = 4;
  this.map = map.replace(/\s/g, '');
  this.colorMap = {};
  for (var i = 0; i < this.map.length; i ++) {
    var character = this.map[i];
    switch (character) {
      case '.':
        continue;
        break;
      default:
        this.pixelBlots.push(new Pxl.PixelBlot(new Pxl.Point(i % width, Math.floor(i / width)), i));
        break;
    }
  }
  this.visible = true;
  this.physicsComponent = null;
  this.beacon.observe(this, 'added', this.onAdded);
};

Pxl.PixelBlotMap.prototype = Object.create(Pxl.Component.prototype);
Pxl.PixelBlotMap.prototype.constructor = Pxl.PixelBlotMap;

Pxl.PixelBlotMap.setBlotColor = function(red, green, blue) {
  for (var i = 0; i < this.pixelBlots.length; i ++) {
    var blot = this.pixelBlots[i];
    blot.red = red;
    blot.green = green;
    blot.blue = blue;
  }
};

// hash map of character codes and color values
Pxl.PixelBlotMap.setBlotColorMap = function(colorMap) {
  this.colorMap = colorMap;
  this.updateBlotColors();
};

Pxl.PixelBlotMap.updateBlotColors = function() {
  for (var i = 0; i < this.map.length; i ++) {
    var character = this.map[i];
    if (!this.colorMap[character])
      continue;
    // update appropriate blot
    for (var j = 0; j < this.map.length; j ++) {
      var pixelBlot = this.map[j];
      if (pixelBlot.mapIndex == i) {
        pixelBlot.red = this.colorMap[character].red;
        pixelBlot.green = this.colorMap[character].green;
        pixelBlot.blue = this.colorMap[character].blue;
        break;
      }
    }
  }
};

Pxl.PixelBlotMap.onAdded = function(event) {
  this.entity.beacon.observe(this, 'addedToScene', this.onAddedToScene);
};

Pxl.PixelBlotMap.onAddedToScene = function(event) {
  this.physicsComponent = this.entity.fetchComponent(PhysicsComponent);
  if (this.physicsComponent != null)
    this.physicsComponent.beacon.observe(this, 'updated', this.onPhysicsUpdated);
};

Pxl.PixelBlotMap.onPhysicsUpdated = function(event) {
  this.loc.x = this.physicsComponent.rect.loc.x;
  this.loc.y = this.physicsComponent.rect.loc.y;
  this.speedX = this.physicsComponent.speedX;
  this.speedY = this.physicsComponent.speedY;
};

Pxl.PixelBlot = function(loc, mapIndex) {
  this.loc = loc;
  this.mapIndex = mapIndex;
  this.alpha = 1; // TODO: this used to be 0 for assimilate
  this.red = 0;
  this.green = 0;
  this.blue = 0;
};
