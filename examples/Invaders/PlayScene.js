var PlayScene = function() {
  Plx.Scene.call(this);
  this.addSystem(new Plx.SpriteRenderer());
  var physics = new Plx.Physics();
  physics.addCollisionPair("player", "enemy");
  this.addSystem(physics);
  this.addSystem(new Plx.PointerInput());

  this.beacon.observe(this, "added", this.onAdded);
  this.beacon.observe(this, "updated", this.onUpdated);
  this.player = null;
  this.cooldown = 10;
  this.cooldownCount = 0;
};

PlayScene.prototype = Object.create(Plx.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  this.player = this.makeEntity("Player", {});
  this.player.physics.x = this.game.width / 2 - this.player.physics.width / 2;
  this.player.physics.y = this.game.height - this.player.physics.height - 10;
  var bullet = this.makeEntity("Bullet", {physics: {x: 30}});
  var enemy = this.makeEntity("Enemy", {physics: {x: 60}});
  var rightArrowButton = this.makeEntity("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4}, physics: {x: 90}});
  rightArrowButton.tappable.beacon.observe(this, "tapped", this.onRightArrowTapped);
};

PlayScene.prototype.onUpdated = function(event) {
  // auto fire bullets
  this.cooldownCount++;
  if (this.cooldownCount == this.cooldown) {
    this.cooldownCount = 0;
    this.makeEntity("Bullet", {physics: {x: this.player.physics.x, y: this.player.physics.y}});
  }
};

PlayScene.prototype.onRightArrowTapped = function(event) {
  this.player.physics.x++;
};
