Plx.Data = function() {
  Plx.Component.call(this);
  this.data = {};
};

Plx.Data.prototype = Object.create(Plx.Component.prototype);
Plx.Data.prototype.constructor = Plx.Data;
