Plx.Sprite = function() {
  Plx.Component.call(this);
  this.loc = new Plx.Point();
  this.z = 0;
  this.visible = true;
  this.speedX = 0;
  this.speedY = 0;
  this.rotation = 0;
  this.anchor = new Plx.Point();
  this.offset = new Plx.Point();
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
  this.beacon.observe(this, 'added', this.onAdded);
};

Plx.Sprite.prototype = Object.create(Plx.Component.prototype);
Plx.Sprite.prototype.constructor = Plx.Sprite;

Plx.Sprite.prototype.onAdded = function() {
  this.entity.beacon.observe(this, 'addedToScene', this.onAddedToScene);
  this.animTimer = new Plx.Timer(0, -1, 0, this.entity.beacon, 'updated');
  this.animTimer.beacon.observe(this, 'timed', this.onAnimTimerTimed);
};

Plx.Sprite.prototype.onAddedToScene = function() {
  this.physicsComponent = this.entity.fetchComponent(Plx.PhysicsComponent);
  if (this.physicsComponent != null)
    this.physicsComponent.beacon.observe(this, 'updated', this.onPhysicsUpdated);
  if (this.animName) {
    frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
    this.frame = this.entity.scene.game.spriteStore.frames[frameName];
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
  this.loc.x = this.physicsComponent.rect.loc.x + this.offset.x;
  this.loc.y = this.physicsComponent.rect.loc.y + this.offset.y;
  this.speedX = this.physicsComponent.speedX;
  this.speedY = this.physicsComponent.speedY;
};

Plx.Sprite.prototype.play = function(animName) {
  this.animName = animName;
  this.anim = this.entity.scene.game.spriteStore.anims[this.animName];
  this.frameIndex = 0;
  this.animTimer.duration = this.anim.frameRate;
  this.animTimer.reset();
  if (!this.animTimer.isRunning)
    this.animTimer.start();
  if (this.entity && this.entity.scene && this.entity.scene.game) {
    frameName = this.anim.frames[this.frameIndex];
    this.frame = this.entity.scene.game.spriteStore.frames[frameName];
  }
};

Plx.Sprite.prototype.pause = function() {
};

Plx.Sprite.prototype.resume = function() {
};

Plx.Sprite.prototype.setZIndex = function() {
  this.beacon.emit('updatedZIndex', {});
};
