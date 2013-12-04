Plx.Draggable = function() {
  Plx.Component.call(this);
  this.beacon.observe(this, 'added', this.onAdded);
  this.physicsComponent = null;
  this.mouseInput = null;
  this.dragging = false;
  this.dragOffset = new Plx.Point();
  this.startDragLoc = new Plx.Point();
  this.startDragFunc = null; // this is a function that can be called when the drag is started to do any updates you might need
  this.precedence = 5;
  this.enabled = true;
};

Plx.Draggable.prototype = Object.create(Plx.Component.prototype);
Plx.Draggable.prototype.constructor = Plx.Draggable;

Plx.Draggable.prototype.onAdded = function(event) {
  this.physicsComponent = this.entity.fetchComponent(Plx.PhysicsComponent);
};

Plx.Draggable.prototype.onMouseDown = function(event) {
  if (!this.enabled)
    return;
  // check to see if we should start drag
  if (this.collisionCheck(event)) {
    this.dragging = true;
    event.consumed = true;
    this.startDragLoc.x = this.physicsComponent.rect.loc.x;
    this.startDragLoc.y = this.physicsComponent.rect.loc.y;
    this.dragOffset.x = event.data.x - this.physicsComponent.rect.loc.x;
    this.dragOffset.y = event.data.y - this.physicsComponent.rect.loc.y;
    this.syncToDragLocation(event.data.x, event.data.y);
    this.mouseInput.beacon.observe(this, 'mouseMove', this.onMouseMove);
    if (this.startDragFunc)
      this.startDragFunc(event);
    this.beacon.emit('dragStart', {});
  }
};

Plx.Draggable.prototype.collisionCheck = function(event) {
  if (this.physicsComponent.rect.contains(new Point(event.data.x, event.data.y)))
    return true;
  return false;
};

Plx.Draggable.prototype.onMouseUp = function(event) {
  // check to see if we should end drag
  if (this.dragging) {
    if (event.data.hasOwnProperty('x') && event.data.hasOwnProperty('y'))
      this.syncToDragLocation(event.data.x, event.data.y);
    this.mouseInput.beacon.ignore(this, 'mouseMove', this.onMouseMove);
    this.dragging = false;
    this.beacon.emit('dragEnd', {});
  }
};

Plx.Draggable.prototype.onMouseMove = function(event) {
  // check to see if we should update position
  this.syncToDragLocation(event.data.x, event.data.y);
};

Plx.Draggable.prototype.syncToDragLocation = function(x, y) {
  // TODO: add in speed so that it animates smoothly
  // this.physicsComponent.speedX = x - this.physicsComponent.rect.loc.x
  // this.physicsComponent.speedY = y - this.physicsComponent.rect.loc.y
  this.physicsComponent.rect.loc.x = x - this.dragOffset.x;
  this.physicsComponent.rect.loc.y = y - this.dragOffset.y;
};

Plx.Draggable.prototype.setMouseInput = function(mouseInput, precedence) {
  this.mouseInput = mouseInput;
  precedence = precedence || 5;
  if (this.mouseInput) {
    this.mouseInput.beacon.ignore(this, 'mouseDown', this.onMouseDown, this.precedence);
    this.mouseInput.beacon.ignore(this, 'mouseUp', this.onMouseUp, this.precedence);
  }

  this.precedence = precedence;
  this.mouseInput.beacon.observe(this, 'mouseDown', this.onMouseDown, this.precedence);
  this.mouseInput.beacon.observe(this, 'mouseUp', this.onMouseUp, this.precedence);
};
