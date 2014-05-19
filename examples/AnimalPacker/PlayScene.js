var PlayScene = function() {
  Pxl.Scene.call(this);
  this.addSystem(new Pxl.Canvas2dDisplaySys());
  var physics = new Pxl.Physics();
  physics.addCollisionPair("animal", "animal");
  this.addSystem(physics);
  this.addSystem(new Pxl.PointerSys());

  this.beacon.observe(this, "added", this.onAdded);
  this.beacon.observe(this, "updated", this.onUpdated);
};

PlayScene.prototype = Object.create(Pxl.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  var _this = this;
  this.player = this.makeEntity("Snake", {});
  var grid = this.makeEntity("PxlSprient", {sprite: {animName: "Grid", scaleX: 7, scaleY: 7, z: 2, autoSizePhysics: true}});
  grid.physics.y = grid.physics.x = this.game.width / 2 - grid.physics.width / 2;
};

PlayScene.prototype.onUpdated = function(event) {
};
