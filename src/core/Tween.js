/*
  TERMS OF USE - EASING EQUATIONS
  ---------------------------------------------------------------------------------
  Open source under the BSD License.

  Copyright © 2001 Robert Penner All rights reserved.

  Redistribution and use in source and binary forms, with || without
  modification, are permitted provided that the following conditions are met:

  Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer. Redistributions in binary
  form must reproduce the above copyright notice, this list of conditions and
  the following disclaimer in the documentation and/or other materials provided
  with the distribution. Neither the name of the author nor the names of
  contributors may be used to endorse || promote products derived from this
  software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  ---------------------------------------------------------------------------------
*/

// @t is the current time (or position) of the tween. This can be seconds || frames, steps, seconds, ms, whatever – as long as the unit is the same as is used for the total time [3].
// @b is the beginning value of the property.
// @c is the change between the beginning and destination value of the property.
// @d is the total time of the tween.

// TODO: curry this and add defaults
  // we can probably just default heartbeatBeacon to the target and do "updated", delay of zero etc
Pxl.Tween = function(target, property, heartbeatBeacon, heartbeatEvent, delay, easeFunc) {
  easeFunc = easeFunc || Pxl.Easing.easeInOutSine;
  delay = delay || 0;

  this.target = target;
  this.property = property;
  this.heartbeatBeacon = heartbeatBeacon;
  this.heartbeatEvent = heartbeatEvent;
  this.beacon = new Pxl.Beacon(this);
  this.time = 0 - delay;
  this.heartbeatOn = false;
  this.startValue = 0;
  this.endValue = 0;
  this.duration = 0;
  this.delay = delay;
  this.easeFunc = easeFunc;
};

// utility function to move entity with a physics component
Pxl.Tween.move = function(target, changeX, changeY, duration, delay, easeFunc) {
  return Pxl.Tween.moveTo(target, target.physics.rect.loc.x + changeX, target.physics.rect.loc.y + changeY, duration, delay, easeFunc);
};

Pxl.Tween.moveTo = function(target, destX, destY, duration, delay, easeFunc) {
  var tweenX = new Pxl.Tween(target.physics, 'x', target.scene.beacon, 'updated', delay, easeFunc);
  var tweenY = new Pxl.Tween(target.physics, 'y', target.scene.beacon, 'updated', delay, easeFunc);
  tweenX.start(target.physics.rect.loc.x, destX, duration);
  tweenY.start(target.physics.rect.loc.y, destY, duration);
  
  return [tweenX, tweenY];
};

Pxl.Tween.prototype.start = function(startValue, endValue, duration) {
  this.startValue = startValue;
  this.endValue = endValue;
  this.duration = duration;
  if (!this.heartbeatOn) {
    this.heartbeatBeacon.observe(this, this.heartbeatEvent, this.onHeartbeat);
    this.heartbeatOn = true;
  }
  
  this.time = 0 - this.delay;

  // set to init value
  this.target[this.property] = this.startValue;

  return this;
};

Pxl.Tween.prototype.stop = function() {
  if (this.heartbeatOn) {
    this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat);
    this.heartbeatOn = false;
  }
  
  return this;
};

Pxl.Tween.prototype.onHeartbeat = function(event) {
  // if (this.target instanceof Pxl.Point)
  //   console.log();
  if (this.time <= 0) {
    this.target[this.property] = this.startValue;
    this.time++;
  }
  else if (this.time < this.duration) {
    var changeAmount = this.easeFunc(this.time, this.startValue, this.endValue - this.startValue, this.duration) - this.easeFunc(this.time - 1, this.startValue, this.endValue - this.startValue, this.duration);
    
    // TODO: the physics system should handle the speed adjustments
    if (this.property == 'x' && this.target.hasOwnProperty('speedX'))
      this.target.speedX = changeAmount;
    else if (this.property == 'y' && this.target.hasOwnProperty('speedY'))
      this.target.speedY = changeAmount;
    else
      this.target[this.property] += changeAmount;
    this.time++;
  }
  else {
    if (this.property == 'x') {
      this.target.x = this.endValue;
      if (this.target.hasOwnProperty('speedX'))
        this.target.speedX = 0;
    }
    else if (this.property == 'y') {
      this.target.y = this.endValue;
      if (this.target.hasOwnProperty('speedY'))
        this.target.speedY = 0;
    }
    else
      this.target[this.property] = this.endValue;
    
    this.beacon.emit('completed', {target:this.target}); //TODO: update this event to completed in assimilate
    this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat);
    this.heartbeatOn = false;
  }
  if (this.target.beacon)
    this.target.beacon.emit('updated', null);
};

Pxl.Tween.prototype.destroy = function() {

}
  // titleLike = new Sprient 'Squishy_Float_Idle'
  // titleLike.physicsComponent.setX (@game.width - 69) / 2
  // titleLike.physicsComponent.setY @game.height
  // timer = new Timer tweenPause * 1, 1, 0, @beacon, 'updated'
  // timer.start()
  // timer.beacon.observe @, 'timed', (event)=>
  //   tween = new Tween titleLike.physicsComponent, 'y', @beacon, 'updated'
  //   tween.beacon.observe @, 'completed', ->
  //   tween.start titleLike.physicsComponent.rect.loc.y, 155, tweenTime
  // @addEntity titleLike



// only has static functions
Pxl.Easing = {};
Pxl.Easing.PI_M2 = Math.PI * 2;
Pxl.Easing.PI_D2 = Math.PI / 2;

// Linear
Pxl.Easing.easeLinear = function(t, b, c, d) {
  return c * t / d + b;
};

// Sine
Pxl.Easing.easeInSine = function(t, b, c, d) {
  return -c * Math.cos(t / d * Pxl.Easing.PI_D2) + c + b;
};

Pxl.Easing.easeOutSine = function(t, b, c, d) {
  return c * Math.sin(t / d * Pxl.Easing.PI_D2) + b;
};

Pxl.Easing.easeInOutSine = function(t, b, c, d) {
  return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};

// Quintic
Pxl.Easing.easeInQuint = function(t, b, c, d) {
  return c * (t /= d) * t * t * t * t + b;
};

Pxl.Easing.easeOutQuint = function(t, b, c, d) {
  return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
};

Pxl.Easing.easeInOutQuint = function(t, b, c, d) {
  if ((t /= d / 2) < 1)
    return c / 2 * t * t * t * t * t + b;
  return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
};

// Quartic
Pxl.Easing.easeInQuart = function(t, b, c, d) {
  return c * (t /= d) * t * t * t + b;
};

Pxl.Easing.easeOutQuart = function(t, b, c, d) {
  return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

Pxl.Easing.easeInOutQuart = function(t, b, c, d) {
  if ((t /= d / 2) < 1)
    return c / 2 * t * t * t * t + b;
  return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
};

// Quadratic
Pxl.Easing.easeInQuad = function(t, b, c, d) {
  return c * (t /= d) * t + b;
};

Pxl.Easing.easeOutQuad = function(t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
};

Pxl.Easing.easeInOutQuad = function(t, b, c, d) {
  if ((t /= d / 2) < 1)
    return c / 2 * t * t + b;
  return -c / 2 * ((--t) * (t - 2) - 1) + b;
};

// Exponential
Pxl.Easing.easeInExpo = function(t, b, c, d) {
  if (t == 0)
    return b;
  else
    return c * Math.pow(2, 10 * (t / d - 1)) + b;
};

Pxl.Easing.easeOutExpo = function(t, b, c, d) {
  if (t == d)
    return b + c;
  else
    return c * (-Math.pow(2, -10 * t / d) + 1) + b;
};

Pxl.Easing.easeInOutExpo = function(t, b, c, d) {
  if (t == 0)
    return b;
  if (t == d)
    return b + c;
  if ((t /= d / 2) < 1)
    return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
  return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
};

// Elastic
Pxl.Easing.easeInElastic = function(t, b, c, d, a, p) {
  if (t == 0)
    return b;
  if ((t /= d) == 1)
    return b + c;
  if (!p)
    p = d * .3;
  if (!a || a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  }
  else {
    s = p / Pxl.Easing.PI_M2 * Math.asin(c / a);
  }
  return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Pxl.Easing.PI_M2 / p)) + b;
};

Pxl.Easing.easeOutElastic = function(t, b, c, d, a, p) {
  if (t == 0)
    return b
  if ((t /= d) == 1)
    return b + c;
  if (!p)
    p = d * .3;
  if (!a || a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  }
  else {
    s = p / Pxl.Easing.PI_M2 * Math.asin(c / a);
  }
  return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * Pxl.Easing.PI_M2 / p ) + c + b;
};

Pxl.Easing.easeInOutElastic = function(t, b, c, d, a, p) {
  a = a || null;
  p = p || null;
  if (t == 0)
    return b;
  if ((t /= d / 2) == 2)
    return b + c;
  if (!p)
    p = d * .3 * 1.5;
  if (!a || a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  }
  else {
    s = p / Pxl.Easing.PI_M2 * Math.asin(c / a);
  }
  if (t < 1)
    return -.5 * (a * Math.pow(2, 10 * (t -=1 )) * Math.sin((t * d - s) * Pxl.Easing.PI_M2 / p )) + b;
  return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * Pxl.Easing.PI_M2 / p) * .5 + c + b;
};

// Circular
Pxl.Easing.easeInCircular = function(t, b, c, d) {
  return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};

Pxl.Easing.easeOutCircular = function(t, b, c, d) {
  return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
};

Pxl.Easing.easeInOutCircular = function(t, b, c, d) {
  if ((t /= d / 2) < 1)
    return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
  return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};

// Back
Pxl.Easing.easeInBack = function(t, b, c, d, s) {
  s = s || 1.70158;
  return c * (t /= d) * t * ((s + 1) * t - s) + b;
};

Pxl.Easing.easeOutBack = function(t, b, c, d, s) {
  s = s || 1.70158;
  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};

Pxl.Easing.easeInOutBack = function(t, b, c, d, s) {
  s = s || 1.70158;
  if ((t /= d / 2) < 1)
    return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
  return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
};

// Bounce
Pxl.Easing.easeInBounce = function(t, b, c, d) {
  return c - Pxl.Easing.easeOutBounce(d - t, 0, c, d) + b;
};

Pxl.Easing.easeOutBounce = function(t, b, c, d) {
  if ((t /= d) < (1 / 2.75))
    return c * (7.5625 * t * t) + b;
  else if (t < (2 / 2.75))
    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
  else if (t < (2.5 / 2.75))
    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
  return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
};

Pxl.Easing.easeInOutBounce = function(t, b, c, d) {
  if (t < d / 2)
    return Pxl.Easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
  return Pxl.Easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
};

// Cubic
Pxl.Easing.easeInCubic = function(t, b, c, d) {
  return c * (t /= d) * t * t + b;
};

Pxl.Easing.easeOutCubic = function(t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b;
};

Pxl.Easing.easeInOutCubic = function(t, b, c, d) {
  if ((t /= d / 2) < 1)
    return c / 2 * t * t * t + b;
  return c / 2 * ((t -= 2) * t * t + 2) + b;
};
