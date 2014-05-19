Pxl.TextCom = function() {
  Pxl.Sprite.call(this);
  this.reset();
};

Pxl.TextCom.prototype = Object.create(Pxl.Component.prototype);
Pxl.TextCom.prototype.constructor = Pxl.TextCom;

Pxl.TextCom.prototype.reset = function() {
  Pxl.Sprite.prototype.reset.call(this);
  
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

Object.defineProperty(Pxl.TextCom.prototype, "anchorX", {
  get: function() {
    return this.achor.x;
  },
  set: function(value) {
    this.anchor.x = value;
  }
});

Object.defineProperty(Pxl.TextCom.prototype, "anchorY", {
  get: function() {
    return this.achor.y;
  },
  set: function(value) {
    this.anchor.y = value;
  }
});

Pxl.TextCom.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
  
  this.animTimer = new Pxl.Timer(0, -1, 0, this.entity.beacon, "updated");
  this.animTimer.beacon.observe(this, "timed", this.onAnimTimerTimed);

  if (this.animName)
    this.play(this.animName);

  this.physics = this.entity.fetchComponent(Pxl.PhysicsComponent);
  if (this.physics != null) {
    this.physics.beacon.observe(this, "updated", this.onPhysicsUpdated);
    if (this.autoSizePhysics) {
      this.physics.width = this.frame.width * this.scaleX;
      this.physics.height = this.frame.height * this.scaleY;
    }
  }
};

Pxl.TextCom.prototype.onAnimTimerTimed = function() {
  if (!this.anim.looping && this.frameIndex == this.anim.frames.length - 1) {
    this.animTimer.stop();
    this.beacon.emit("animCompleted", null);
    return;
  }

  this.frameIndex++;
  if (this.frameIndex >= this.anim.frames.length) {
    if (this.anim.looping)
      this.frameIndex = 0;
    // dispatch anim complete event?
    this.beacon.emit("animCompleted", null);
  }
  else if (this.frameIndex >= this.anim.frames.length)
    this.frameIndex = this.anim.frames.length - 1;
  
  var frameName = this.entity.scene.game.TextComStore.anims[this.animName].frames[this.frameIndex];
  frameName = this.entity.scene.game.TextComStore.anims[this.animName].frames[this.frameIndex];
  this.frame = this.entity.scene.game.TextComStore.frames[frameName];
};

Pxl.TextCom.prototype.onPhysicsUpdated = function() {
  this.loc.x = this.physics.rect.loc.x + this.offset.x;
  this.loc.y = this.physics.rect.loc.y + this.offset.y;
  this.speedX = this.physics.speedX;
  this.speedY = this.physics.speedY;
};

Pxl.TextCom.prototype.play = function(animName) {
  this.animName = animName;
  this.anim = this.game.TextComStore.anims[this.animName];
  this.frameIndex = 0;
  this.animTimer.duration = this.anim.frameRate;
  this.animTimer.reset();
  if (!this.animTimer.isRunning)
    this.animTimer.start();
  var frameName = this.anim.frames[this.frameIndex];
  this.frame = this.game.TextComStore.frames[frameName];
};

Pxl.TextCom.prototype.pause = function() {
};

Pxl.TextCom.prototype.resume = function() {
};

Pxl.TextCom.prototype.setZIndex = function() {
  this.beacon.emit('updatedZIndex', {});
};
