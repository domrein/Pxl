Pxl.SpriteCom = function() {
  Pxl.DisplayCom.call(this);
  this.reset();
};

Pxl.SpriteCom.prototype = Object.create(Pxl.DisplayCom.prototype);
Pxl.SpriteCom.prototype.constructor = Pxl.SpriteCom;

Pxl.SpriteCom.prototype.reset = function() {
  Pxl.DisplayCom.prototype.reset.call(this);
  
  this.anim = null;
  this.animName = null;
  this.animTimer = null;
  this.frame = null;
  this.frameIndex = 0;
};

Pxl.SpriteCom.prototype.init = function() {
  Pxl.DisplayCom.prototype.init.call(this);

  this.animTimer = new Pxl.Timer(0, -1, 0, this.entity.beacon, "updated");
  this.animTimer.beacon.observe(this, "timed", this.onAnimTimerTimed);

  if (this.animName)
    this.play(this.animName);
  if (this.autoSizePhysics && this.physics) {
    this.physics.width = this.frame.width * this.scaleX;
    this.physics.height = this.frame.height * this.scaleY;
  }
};

Pxl.SpriteCom.prototype.sizePhysics = function() {
};


Pxl.SpriteCom.prototype.onAnimTimerTimed = function() {
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
  
  var frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
  frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
  this.frame = this.entity.scene.game.spriteStore.frames[frameName];
};

Pxl.SpriteCom.prototype.play = function(animName) {
  this.animName = animName;
  this.anim = this.game.spriteStore.anims[this.animName];
  this.frameIndex = 0;
  this.animTimer.duration = this.anim.frameRate;
  this.animTimer.reset();
  if (!this.animTimer.isRunning)
    this.animTimer.start();
  var frameName = this.anim.frames[this.frameIndex];
  this.frame = this.game.spriteStore.frames[frameName];
};

Pxl.SpriteCom.prototype.pause = function() {
};

Pxl.SpriteCom.prototype.resume = function() {
};
