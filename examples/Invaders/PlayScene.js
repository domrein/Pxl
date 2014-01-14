var PlayScene = function() {
  Plx.Scene.call(this);
  this.addSystem(new Plx.SpriteRenderer());
  var physics = new Plx.Physics();
  physics.addCollisionPair("player", "enemy");
  this.addSystem(physics);
  this.addSystem(new Plx.PointerInput());

  this.beacon.observe(this, "added", this.onAdded);
  this.beacon.observe(this, "updated", this.onUpdated);
};

PlayScene.prototype = Object.create(Plx.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  var player = this.addEntity(this.game.entityFactory.createType("Player", {physics: {x: 0}}));
  var bullet = this.addEntity(this.game.entityFactory.createType("Bullet", {physics: {x: 30}}));
  var enemy = this.addEntity(this.game.entityFactory.createType("Enemy", {physics: {x: 60}}));
  var arrowButton = this.addEntity(this.game.entityFactory.createType("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4}, physics: {x: 90}}));
};

PlayScene.prototype.onUpdated = function(event) {

};