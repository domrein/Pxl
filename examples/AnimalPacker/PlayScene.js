var PlayScene = function() {
  Plx.Scene.call(this);
  this.addSystem(new Plx.SpriteRenderer());
  var physics = new Plx.Physics();
  physics.addCollisionPair("animal", "animal");
  this.addSystem(physics);
  this.addSystem(new Plx.PointerSys());

  this.beacon.observe(this, "added", this.onAdded);
  this.beacon.observe(this, "updated", this.onUpdated);
};

PlayScene.prototype = Object.create(Plx.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  var _this = this;
  this.player = this.makeEntity("Snake", {});
  var grid = this.makeEntity("PlxSprient", {sprite: {animName: "Grid", scaleX: 7, scaleY: 7, z: 2, autoSizePhysics: true}});
  grid.physics.y = grid.physics.x = this.game.width / 2 - grid.physics.width / 2;
};

PlayScene.prototype.onUpdated = function(event) {
};
