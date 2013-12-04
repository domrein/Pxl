Plx.PixelBlotMap = function(map, width) {
  Plx.Component.call(this);
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
        this.pixelBlots.push(new Plx.PixelBlot(new Plx.Point(i % width, Math.floor(i / width)), i));
        break;
    }
  }
  this.visible = true;
  this.physicsComponent = null;
  this.beacon.observe(this, 'added', this.onAdded);
};

Plx.PixelBlotMap.prototype = Object.create(Plx.Component.prototype);
Plx.PixelBlotMap.prototype.constructor = Plx.PixelBlotMap;

Plx.PixelBlotMap.setBlotColor = function(red, green, blue) {
  for (var i = 0; i < this.pixelBlots.length; i ++) {
    var blot = this.pixelBlots[i];
    blot.red = red;
    blot.green = green;
    blot.blue = blue;
  }
};

// hash map of character codes and color values
Plx.PixelBlotMap.setBlotColorMap = function(colorMap) {
  this.colorMap = colorMap;
  this.updateBlotColors();
};

Plx.PixelBlotMap.updateBlotColors = function() {
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

Plx.PixelBlotMap.onAdded = function(event) {
  this.entity.beacon.observe(this, 'addedToScene', this.onAddedToScene);
};

Plx.PixelBlotMap.onAddedToScene = function(event) {
  this.physicsComponent = this.entity.fetchComponent(PhysicsComponent);
  if (this.physicsComponent != null)
    this.physicsComponent.beacon.observe(this, 'updated', this.onPhysicsUpdated);
};

Plx.PixelBlotMap.onPhysicsUpdated = function(event) {
  this.loc.x = this.physicsComponent.rect.loc.x;
  this.loc.y = this.physicsComponent.rect.loc.y;
  this.speedX = this.physicsComponent.speedX;
  this.speedY = this.physicsComponent.speedY;
};

Plx.PixelBlot = function(loc, mapIndex) {
  this.loc = loc;
  this.mapIndex = mapIndex;
  this.alpha = 1; // TODO: this used to be 0 for assimilate
  this.red = 0;
  this.green = 0;
  this.blue = 0;
};
