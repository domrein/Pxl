Plx.KeyboardInput = function() {
  Plx.System.call(this);
  this.keys = [];
  for (var i = 0; i < 255; i ++)
    this.keys.push(false);

  // controls
  var _this = this;
  this.keyDownFunc = function(event){_this.onKeyDown(event)};
  this.keyUpFunc = function(event){_this.onKeyUp(event)};
  window.addEventListener("keydown", this.keyDownFunc, false);
  window.addEventListener("keyup", this.keyUpFunc, false);
};

Plx.KeyboardInput.prototype = Object.create(Plx.System.prototype);
Plx.KeyboardInput.prototype.constructor = Plx.KeyboardInput;

// [KeyboardEvent] event
Plx.KeyboardInput.prototype.onKeyDown = function(event) {
  this.keys[event.keyCode] = true;
  this.beacon.emit('keyDown', {keyCode:event.keyCode});
  this.beacon.emit(this.translateKeyCode(event.keyCode) + "Down", null);
};

// [KeyboardEvent] event
Plx.KeyboardInput.prototype.onKeyUp = function(event) {
  this.keys[event.keyCode] = false;
  this.beacon.emit('keyUp', {keyCode:event.keyCode});
  this.beacon.emit(this.translateKeyCode(event.keyCode) + "Up", null);
};

Plx.KeyboardInput.prototype.getKeyDown = function(keyName) {
  switch (keyName) {
    case 'space': return this.keys[32]; break;
    case 'left': return this.keys[37]; break;
    case 'up': return this.keys[38]; break;
    case 'right': return this.keys[39]; break;
    case 'down': return this.keys[40]; break;
    case 'z': return this.keys[90]; break;
  }

  console.log("keyName " + keyName + " does not exist");
  return false;
};

Plx.KeyboardInput.prototype.translateKeyCode = function(keyCode) {
  keyName = ''
  switch (keyCode) {
    case 32: keyName = 'space'; break;
    case 37: keyName = 'left'; break;
    case 38: keyName = 'up'; break;
    case 39: keyName = 'right'; break;
    case 40: keyName = 'down'; break;
    case 90: keyName = 'z'; break;
  }

  return keyName;
};

Plx.KeyboardInput.prototype.destroy = function() {
  window.removeEventListener("keydown", this.keyDownFunc, false);
  window.removeEventListener("keyup", this.keyUpFunc, false);
};
