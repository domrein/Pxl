Plx.KillOffscreen = function(left, right, top, bottom) {
  Plx.Component.call(this);
  this.left = left;
  this.right = right;
  this.top = top;
  this.bottom = bottom;
  this.beacon.observe(this, 'added', this.onAdded);
  this.physicsComponent = null;
};

Plx.KillOffscreen.prototype = Object.create(Plx.Component.prototype);
Plx.KillOffscreen.prototype.constructor = Plx.KillOffscreen;

Plx.KillOffscreen.prototype.onAdded = function(event) {
  this.physicsComponent = this.entity.fetchComponent(Plx.PhysicsComponent);
  this.physicsComponent.beacon.observe(this, 'updated', this.onPhysicsUpdated);
};

Plx.KillOffscreen.prototype.onPhysicsUpdated = function(event) {
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
