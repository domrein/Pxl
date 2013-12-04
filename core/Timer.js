Plx.Timer = function(duration, reps, delay, heartbeatBeacon, heartbeatEvent) {
  this.duration = duration;
  this.reps = reps;
  this.delay = delay;
  this.heartbeatBeacon = heartbeatBeacon;
  this.heartbeatEvent = heartbeatEvent;
  this.beacon = new Plx.Beacon(this);
  this.curCount = 0;
  this.curRep = 0;
  this.heartbeatOn = false;
  this.curDelay = 0;
  this.isRunning = false;
};

Plx.Timer.oneShot = function(duration, delay, heartbeatBeacon, heartbeatEvent, callback) {
  var timer = new Plx.Timer(duration, 1, delay, heartbeatBeacon, heartbeatEvent);
  timer.beacon.observe(this, 'completed', callback);
  timer.start();
  return timer;
};

Plx.Timer.prototype.start = function() {
  if (!this.heartbeatOn) {
    this.heartbeatBeacon.observe(this, this.heartbeatEvent, this.onHeartbeat);
    this.heartbeatOn = true;
  }
  this.curCount = 0;
  this.curRep = 0;
  this.curDelay = this.delay;
  this.isRunning = true;
};

Plx.Timer.prototype.stop = function() {
  if (this.heartbeatOn) {
    this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat);
    this.heartbeatOn = false;
  }
};

Plx.Timer.prototype.reset = function() {
  this.curCount = 0;
  this.curRep = 0;
  this.curDelay = 0;
};

Plx.Timer.prototype.onHeartbeat = function(event) {
  if(this.curDelay > 0) {
    this.curDelay--;
    return;
  }

  this.curCount++;
  if (this.curCount == this.duration) {
    this.curCount = 0;
    this.curRep++;
    this.beacon.emit('timed', null);
    if (this.curRep == this.reps) {
      this.beacon.emit('completed', null);
      this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat);
      this.heartbeatOn = false;
    }
  }
};