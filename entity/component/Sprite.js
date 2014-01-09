Plx.Sprite = function() {
  Plx.Component.call(this);
  this.loc = new Plx.Point();
  this.anchor = new Plx.Point();
  this.offset = new Plx.Point();
  this.reset();
};

Plx.Sprite.prototype = Object.create(Plx.Component.prototype);
Plx.Sprite.prototype.constructor = Plx.Sprite;

Plx.Sprite.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  this.loc.reset();
  this.z = 0;
  this.visible = true;
  this.speedX = 0;
  this.speedY = 0;
  this.rotation = 0;
  this.anchor.reset();
  this.offset.reset();
  this.scaleX = 1;
  this.scaleY = 1;
  this.anim = null;
  this.animName = null;
  this.animTimer = null;
  this.frame = null;
  this.frameIndex = 0;
  this.flippedX = false;
  this.flippedY = false;
  this.alpha = 1;
  this.autoSizePhysics = false;
};

Plx.Sprite.prototype.init = function() {
  this.animTimer = new Plx.Timer(0, -1, 0, this.entity.beacon, "updated");
  this.animTimer.beacon.observe(this, "timed", this.onAnimTimerTimed);

  this.play(this.animName);

  this.physics = this.entity.fetchComponent(Plx.PhysicsComponent);
  if (this.physics != null) {
    this.physics.beacon.observe(this, "updated", this.onPhysicsUpdated);
    if (this.autoSizePhysics) {
      this.physics.width = this.frame.width;
      this.physics.height = this.frame.height;
    }
  }
};

Plx.Sprite.prototype.onAnimTimerTimed = function() {
  this.frameIndex++;
  if (this.frameIndex >= this.anim.frames.length) {
    if (this.anim.looping)
      this.frameIndex = 0;
    // dispatch anim complete event?
    this.beacon.emit("animComplete", null);
  }
  else if (this.frameIndex >= this.anim.frames.length)
    this.frameIndex = this.anim.frames.length - 1;

  frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
  frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
  this.frame = this.entity.scene.game.spriteStore.frames[frameName];
};

Plx.Sprite.prototype.onPhysicsUpdated = function() {
  this.loc.x = this.physics.rect.loc.x + this.offset.x;
  this.loc.y = this.physics.rect.loc.y + this.offset.y;
  this.speedX = this.physics.speedX;
  this.speedY = this.physics.speedY;
};

Plx.Sprite.prototype.play = function(animName) {
  this.animName = animName;
  this.anim = this.game.spriteStore.anims[this.animName];
  this.frameIndex = 0;
  this.animTimer.duration = this.anim.frameRate;
  this.animTimer.reset();
  if (!this.animTimer.isRunning)
    this.animTimer.start();
  frameName = this.anim.frames[this.frameIndex];
  this.frame = this.game.spriteStore.frames[frameName];
};

Plx.Sprite.prototype.pause = function() {
};

Plx.Sprite.prototype.resume = function() {
};

Plx.Sprite.prototype.setZIndex = function() {
  this.beacon.emit('updatedZIndex', {});
};
