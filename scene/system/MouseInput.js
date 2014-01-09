// TODO: rework this system to handle input instead of just redispatching events
//  Have tappable, draggable and all that handled by the system itself
//  Also, we're mobile first, so MouseInput isn't the best name for the system :P
// TODO: combine all the input systems into UserInput (will handle keyboard, mouse, gamepad and touch)

Plx.MouseInput = function() {
  Plx.System.call(this);
  this.mouseDown = false;
  this.mouseLoc = new Plx.Point();

  // controls
  var _this = this;
  this.mouseDownFunc = function(event){_this.onMouseDown(event)};
  this.mouseUpFunc = function(event){_this.onMouseUp(event)};
  this.mouseMoveFunc = function(event){_this.onMouseMove(event)};
  this.touchStartFunc = function(event){_this.onTouchStart(event)};
  this.touchEndFunc = function(event){_this.onTouchEnd(event)};
  this.touchMoveFunc = function(event){_this.onTouchMove(event)};
  // mouse events
  document.getElementById("canvas").addEventListener("mousedown", this.mouseDownFunc, false);
  document.getElementById("canvas").addEventListener("mouseup", this.mouseUpFunc, false);
  document.getElementById("canvas").addEventListener("mousemove", this.mouseMoveFunc, false);
  // touch events
  document.getElementById("canvas").addEventListener("touchstart", this.touchStartFunc, false);
  document.getElementById("canvas").addEventListener("touchend", this.touchEndFunc, false);
  document.getElementById("canvas").addEventListener("touchmove", this.touchMoveFunc, false);
};

Plx.MouseInput.prototype = Object.create(Plx.System.prototype);
Plx.MouseInput.prototype.constructor = Plx.MouseInput;

Plx.MouseInput.prototype.onMouseDown = function(event) {
  // window.alert 'mouseDown'
  this.mouseDown = true;
  this.beacon.emit('mouseDown', {x:event.layerX, y:event.layerY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

// [MouseEvent] event
Plx.MouseInput.prototype.onMouseUp = function(event) {
  // window.alert 'mouseUp'
  this.mouseDown = false;
  this.beacon.emit('mouseUp', {x:event.layerX, y:event.layerY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

// [MouseEvent] event
Plx.MouseInput.prototype.onMouseMove = function(event) {
  // window.alert 'mouseMove'
  this.beacon.emit('mouseMove', {x:event.layerX, y:event.layerY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

// NOTE: layerX,Y is relative to the element, clientX,Y is relative to the document make these compatible (they just so hapen to be the same in thie case)
Plx.MouseInput.prototype.onTouchStart = function(event) {
  // window.alert 'touchstart'
  event.preventDefault(); // This is a hack so that Android dispatches the touchend event (I guess it also disables native scrolling) I guess this also prevents the mouse event from being sent
  // window.alert "touches.length //{event.touches.length}"
  touch = event.touches[0];
  // window.alert "touchX: //{touch.clientX}, touchY: //{touch.clientY}, "
  this.beacon.emit('mouseDown', {x:touch.clientX, y:touch.clientY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.MouseInput.prototype.onTouchEnd = function(event) {
  // window.alert 'touchend'
  // window.alert "touches.length //{event.touches.length}"
  event.preventDefault();
  this.beacon.emit('mouseUp', null); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.MouseInput.prototype.onTouchMove = function(event) {
  // window.alert 'touchmove'
  // window.alert "touches.length //{event.touches.length}"
  event.preventDefault();
  touch = event.touches[0];
  // window.alert "touchX: //{touch.clientX}, touchY: //{touch.clientY}, "
  this.beacon.emit('mouseMove', {x:touch.clientX, y:touch.clientY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.MouseInput.prototype.destroy = function() {
  document.getElementById('canvas').removeEventListener("mousedown", this.mouseDownFunc, false);
  document.getElementById('canvas').removeEventListener("mouseup", this.mouseUpFunc, false);
  document.getElementById('canvas').removeEventListener("mousemove", this.mouseMoveFunc, false);

  document.getElementById('canvas').addEventListener("touchstart", this.touchStartFunc, false);
  document.getElementById('canvas').addEventListener("touchend", this.touchEndFunc, false);
  document.getElementById('canvas').addEventListener("touchmove", this.touchMoveFunc, false);
};
