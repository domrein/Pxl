Plx.Tappable = function() {
  Plx.Component.call(this);
  this.reset();
};

Plx.Tappable.prototype = Object.create(Plx.Component.prototype);
Plx.Tappable.prototype.constructor = Plx.Tappable;

Plx.Tappable.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  this.beacon.reset();
  this.enabled = true;
};

Plx.Tappable.prototype.init = function() {
  this.physics = this.entity.fetchComponent(Plx.PhysicsComponent);
};

Plx.Tappable.prototype.collisionCheck = function(x, y) {
  if (this.physics.rect.contains(new Plx.Point(x, y)))
    return true;

  return false;
};
