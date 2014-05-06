Pxl.KillOffscreen = function(left, right, top, bottom) {
  Pxl.Component.call(this);
  this.reset();
};

Pxl.KillOffscreen.prototype = Object.create(Pxl.Component.prototype);
Pxl.KillOffscreen.prototype.constructor = Pxl.KillOffscreen;

Pxl.KillOffscreen.prototype.reset = function(event) {
  Pxl.Component.prototype.reset.call(this);

  this.left = false;
  this.right = false;
  this.top = false;
  this.bottom = false;
  this.physicsComponent = null;
};

Pxl.KillOffscreen.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);
  this.physicsComponent = this.entity.fetchComponent(Pxl.PhysicsComponent);
  this.physicsComponent.beacon.observe(this, "updated", this.onPhysicsUpdated);
};

Pxl.KillOffscreen.prototype.onPhysicsUpdated = function(event) {
  // wasAlive = this.entity.alive
  if (this.left && this.physicsComponent.rect.loc.x + this.physicsComponent.rect.width < 0)
    this.entity.alive = false;
  else if (this.right && this.physicsComponent.rect.loc.x > this.entity.scene.game.width)
    this.entity.alive = false;
  else if (this.top && this.physicsComponent.rect.loc.y + this.physicsComponent.rect.height < 0)
    this.entity.alive = false;
  else if (this.bottom && this.physicsComponent.rect.loc.y > this.entity.scene.game.height)
    this.entity.alive = false;
  // if this.entity.alive != wasAlive then console.log "kill offscreened!"
};
