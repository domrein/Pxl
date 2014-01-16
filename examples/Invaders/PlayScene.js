var PlayScene = function() {
  Plx.Scene.call(this);
  this.addSystem(new Plx.SpriteRenderer());
  var physics = new Plx.Physics();
  physics.addCollisionPair("player", "enemy");
  this.addSystem(physics);
  this.addSystem(new Plx.PointerInput());

  this.beacon.observe(this, "added", this.onAdded);
  this.beacon.observe(this, "updated", this.onUpdated);
  
  // player variables
  this.player = null;
  this.cooldown = 10;
  this.cooldownCount = 0;
  this.leftDown = false;
  this.rightDown = false;
};

PlayScene.prototype = Object.create(Plx.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  var _this = this;
  this.player = this.makeEntity("Player", {});
  this.player.physics.x = this.game.width / 2 - this.player.physics.width / 2;
  this.player.physics.y = this.game.height - this.player.physics.height - 10;
  var bullet = this.makeEntity("Bullet", {physics: {x: 30}});
  var enemy = this.makeEntity("Enemy", {physics: {x: 60}});
  
  // controls
  var arrowPadding = 10;
  var rightArrowButton = this.makeEntity("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4}});
  rightArrowButton.physics.x = this.game.width - rightArrowButton.physics.width - arrowPadding;
  rightArrowButton.physics.y = this.game.height - rightArrowButton.physics.height - arrowPadding;
  rightArrowButton.tappable.beacon.observe(this, "entered", function(event) {
    _this.rightDown = true;
  });
  rightArrowButton.tappable.beacon.observe(this, "exited", function(event) {
    _this.rightDown = false;
  });
  var leftArrowButton = this.makeEntity("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4, flippedX: true}, physics: {x: 90}});
  leftArrowButton.physics.x = arrowPadding;
  leftArrowButton.physics.y = this.game.height - leftArrowButton.physics.height - arrowPadding;
  leftArrowButton.tappable.beacon.observe(this, "entered", function(event) {
    _this.leftDown = true;
  });
  leftArrowButton.tappable.beacon.observe(this, "exited", function(event) {
    _this.leftDown = false;
  });
};

PlayScene.prototype.onUpdated = function(event) {
  // auto fire bullets
  this.cooldownCount++;
  if (this.cooldownCount == this.cooldown) {
    this.cooldownCount = 0;
    this.makeEntity("Bullet", {physics: {x: this.player.physics.x, y: this.player.physics.y}});
  }

  // move player
  if (this.leftDown && !this.rightDown)
    this.player.physics.speedX -= 1.5;
  else if (!this.leftDown && this.rightDown)
    this.player.physics.speedX += 1.5;
  // if (this.leftDown && !this.rightDown)
  //   this.player.physics.speedX = -3;
  // else if (!this.leftDown && this.rightDown)
  //   this.player.physics.speedX = 3;
  // else
  //   this.player.physics.speedX = 0;
};
