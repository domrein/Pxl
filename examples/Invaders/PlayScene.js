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

  this.enemyCount = 0;
};

PlayScene.prototype = Object.create(Plx.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;

PlayScene.prototype.onAdded = function(event) {
  var _this = this;
  this.player = this.makeEntity("Player", {});
  this.player.beacon.observe(this, "removedFromScene", function(event) {
    // TODO: game over screen
    _this.switchScene(PlayScene, null, null);
  });
  this.player.physics.x = this.game.width / 2 - this.player.physics.width / 2;
  this.player.physics.y = this.game.height - this.player.physics.height - 10;
  var bullet = this.makeEntity("Bullet", {physics: {x: 30}});
  
  // controls
  var arrowPadding = 10;
  var rightArrowButton = this.makeEntity("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4}});
  rightArrowButton.physics.x = this.game.width - rightArrowButton.physics.width - arrowPadding;
  rightArrowButton.physics.y = this.game.height - rightArrowButton.physics.height - arrowPadding;
  rightArrowButton.pointerable.beacon.observe(this, "entered", function(event) {_this.rightDown = true;});
  rightArrowButton.pointerable.beacon.observe(this, "exited", function(event) {_this.rightDown = false;});
  var leftArrowButton = this.makeEntity("PlxButton", {sprite: {animName: "ArrowButton", scaleX: 4, scaleY: 4, flippedX: true}, physics: {x: 90}});
  leftArrowButton.physics.x = arrowPadding;
  leftArrowButton.physics.y = this.game.height - leftArrowButton.physics.height - arrowPadding;
  leftArrowButton.pointerable.beacon.observe(this, "entered", function(event) {_this.leftDown = true;});
  leftArrowButton.pointerable.beacon.observe(this, "exited", function(event) {_this.leftDown = false;});

  this.addEnemies();
};

PlayScene.prototype.addEnemies = function() {
  var _this = this;
  for (var i = 0; i < 5; i ++) {
    for (var j = 0; j < 8; j ++) {
      var enemy = this.makeEntity("Enemy", {physics: {x: j * 40 + 10, y: i * 35 + 10}});
      this.enemyCount++;
      enemy.beacon.observe(this, "removedFromScene", function(event) {
        _this.enemyCount--;
        if (_this.enemyCount == 0) {
          // TODO: switch to "YOU WIN" scene
          _this.switchScene(PlayScene, null, null);
        }
      });
    }
  }
};

PlayScene.prototype.onUpdated = function(event) {
  // auto fire bullets
  this.cooldownCount++;
  if (this.cooldownCount == this.cooldown) {
    this.cooldownCount = 0;
    var bullet = this.makeEntity("Bullet", {});
    bullet.sprite.loc.x = bullet.physics.x = this.player.physics.x + this.player.physics.width / 2 - bullet.physics.width / 2;
    bullet.sprite.loc.y = bullet.physics.y = this.player.physics.y - bullet.physics.height / 2;
  }

  // move player
  if (this.leftDown && !this.rightDown)
    this.player.physics.speedX -= 1.5;
  else if (!this.leftDown && this.rightDown)
    this.player.physics.speedX += 1.5;
};
