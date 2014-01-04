Plx.Beacon = function(owner) {
  this.reset(owner);
};

Plx.Beacon.prototype.reset = function(owner) {
  this.owner = owner;
  // WHEEEE! Break the observer pattern. :)
  this.observerGroups = [];
};

// precedence is on a scale of 1-10 normally
// lower precedence gets called first
Plx.Beacon.prototype.observe = function(observer, signal, callback, precedence) {
  precedence = precedence || 5;
  if (!observer)
    throw new Error('observer required to observe');
  if (!signal)
    throw new Error('signal required to observe');
  if (!callback)
    throw new Error('callback required to observe');
  
  var observerGroup = new Plx.ObserverGroup(observer, signal, callback, precedence);
  var inserted = false;
  for (var i = 0; i < this.observerGroups.length; i ++) {
    if (this.observerGroups[i].precedence > observerGroup.precedence) {
      this.observerGroups.splice(i, 0, observerGroup);
      inserted = true;
      break;
    }
  }
  if (!inserted)
    this.observerGroups.push(observerGroup);
};

Plx.Beacon.prototype.ignore = function(observer, signal, callback) {
  for (var i = this.observerGroups.length - 1; i >= 0; i --) {
    var observerGroup = this.observerGroups[i];
    if(observerGroup.observer == observer && observerGroup.signal == signal && observerGroup.callback == callback)
      this.observerGroups.splice(i, 1);
  }
};

Plx.Beacon.prototype.emit = function(signal, data) {
  var event = new Plx.Event(this, data);
  // find all the observerGroups with matching signals
  var matches = null;
  var observerGroup;
  for (var i = 0; i < this.observerGroups.length; i ++) {
    observerGroup = this.observerGroups[i];
    if (observerGroup.signal == signal) {
      if (!matches)
        matches = []
      matches.push(observerGroup);
    }
  }
  // pass along event for all groups that matched
  if (matches) {
    for (i = 0; i < matches.length; i ++) {
      observerGroup = matches[i];
      if (!event.consumed)
        observerGroup.callback.call(observerGroup.observer, event);
    }
  }
};

Plx.Beacon.prototype.destroy = function() {
  this.observerGroups = [];
};

//internal helper classes
Plx.ObserverGroup = function(observer, signal, callback, precedence) {
  this.observer = observer;
  this.signal = signal;
  this.callback = callback;
  this.precedence = precedence;
};

Plx.Event = function(beacon, data) {
  this.beacon = beacon;
  this.data = data;
  this.consumed = false;
};
