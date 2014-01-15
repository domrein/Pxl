Plx.PointerInput = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.Tappable, Plx.Draggable];
  this.pointerComponents = [];

  this.mouseDown = false;
  this.mouseLoc = new Plx.Point();
  this.mouseTarget = null;

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

Plx.PointerInput.prototype = Object.create(Plx.System.prototype);
Plx.PointerInput.prototype.constructor = Plx.PointerInput;

Plx.PointerInput.prototype.update = function() {
  
};

Plx.PointerInput.prototype.addComponent = function(component) {
  this.pointerComponents.push(component);
};

Plx.PointerInput.prototype.removeComponent = function(component) {
  var index = this.pointerComponents.indexOf(component);
  if (index >= 0)
    this.pointerComponents.splice(index, 1);
};

Plx.PointerInput.prototype.onMouseDown = function(event) {
  // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
  this.mouseDown = true;
  for (var i = 0; i < this.pointerComponents.length; i ++) {
    var pointerComponent = this.pointerComponents[i];
    if (!pointerComponent.enabled)
      continue;
    if (pointerComponent.collisionCheck(event.layerX, event.layerY)) {
      pointerComponent.beacon.emit("tapped", null);
      pointerComponent.beacon.emit("entered", null);
      this.mouseTarget = pointerComponent;
      break;
    }
  }
};

Plx.PointerInput.prototype.onMouseUp = function(event) {
  if (this.mouseTarget) {
    this.mouseTarget.beacon.emit("exited", null);
    this.mouseTarget = null;
  }
  this.mouseDown = false;
};

Plx.PointerInput.prototype.onMouseMove = function(event) {
  if (this.mouseTarget) {
    if (this.mouseTarget.collisionCheck(event.layerX, event.layerY)) {
    }
    else {
      this.mouseTarget.beacon.emit("exited", null);
      this.mouseTarget = null;
    }
  }
  else if (this.mouseDown) {
    for (var i = 0; i < this.pointerComponents.length; i ++) {
      var pointerComponent = this.pointerComponents[i];
      if (!pointerComponent.enabled)
        continue;
      if (pointerComponent.collisionCheck(event.layerX, event.layerY)) {
        pointerComponent.beacon.emit("entered", null);
        this.mouseTarget = pointerComponent;
        break;
      }
    }
  }
};

// NOTE: layerX,Y is relative to the element, clientX,Y is relative to the document make these compatible (they just so hapen to be the same in thie case)
Plx.PointerInput.prototype.onTouchStart = function(event) {
  // window.alert 'touchstart'
  event.preventDefault(); // This is a hack so that Android dispatches the touchend event (I guess it also disables native scrolling) I guess this also prevents the mouse event from being sent
  // window.alert "touches.length //{event.touches.length}"
  touch = event.touches[0];
  // window.alert "touchX: //{touch.clientX}, touchY: //{touch.clientY}, "
  this.beacon.emit("mouseDown", {x:touch.clientX, y:touch.clientY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.PointerInput.prototype.onTouchEnd = function(event) {
  // window.alert 'touchend'
  // window.alert "touches.length //{event.touches.length}"
  event.preventDefault();
  this.beacon.emit("mouseUp", null); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.PointerInput.prototype.onTouchMove = function(event) {
  // window.alert 'touchmove'
  // window.alert "touches.length //{event.touches.length}"
  event.preventDefault();
  touch = event.touches[0];
  // window.alert "touchX: //{touch.clientX}, touchY: //{touch.clientY}, "
  this.beacon.emit("mouseMove", {x:touch.clientX, y:touch.clientY}); // TODO: if we scale the game we probably need to scale these inputs too (in the opposite direction though)
};

Plx.PointerInput.prototype.destroy = function() {
  document.getElementById("canvas").removeEventListener("mousedown", this.mouseDownFunc, false);
  document.getElementById("canvas").removeEventListener("mouseup", this.mouseUpFunc, false);
  document.getElementById("canvas").removeEventListener("mousemove", this.mouseMoveFunc, false);

  document.getElementById("canvas").addEventListener("touchstart", this.touchStartFunc, false);
  document.getElementById("canvas").addEventListener("touchend", this.touchEndFunc, false);
  document.getElementById("canvas").addEventListener("touchmove", this.touchMoveFunc, false);
};
