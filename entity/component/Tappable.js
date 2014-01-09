Plx.Tappable = function() {
  Plx.Component.call(this);
  this.reset();
};

Plx.Tappable.prototype = Object.create(Plx.Component.prototype);
Plx.Tappable.prototype.constructor = Plx.Tappable;

Plx.Tappable.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  this.beacon.reset();
  // TODO: mouseInput should be a system instead of handled at the component level
  // TODO: do some of these TODOs
  this.mouseInput = null;
  this.precedence = 5;
  this.enabled = true;
};

Plx.Tappable.prototype.init = function() {
  this.physics = this.entity.fetchComponent(Plx.PhysicsComponent);
};

Plx.Tappable.prototype.onMouseDown = function(event) {
  if (!this.enabled)
    return;
  if (this.collisionCheck(event)) {
    event.consumed = true;
    this.mouseInput.beacon.observe(this, "mouseDown", this.onMouseDown);
    this.beacon.emit("tapped", null);
  }
};

Plx.Tappable.prototype.collisionCheck = function(event) {
  if (this.physics.rect.contains(new Plx.Point(event.data.x, event.data.y)))
    return true;

  return false;
};

Plx.Tappable.prototype.setMouseInput = function(mouseInput, precedence) {
  this.mouseInput = mouseInput;
  precedence = precedence || 5;
  if (this.mouseInput)
    this.mouseInput.beacon.ignore(this, "mouseDown", this.onMouseDown, this.precedence);

  this.precedence = precedence;
  this.mouseInput.beacon.observe(this, "mouseDown", this.onMouseDown, this.precedence);
};
