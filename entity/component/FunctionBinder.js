Plx.FunctionBinder = function() {
  Plx.Component.call(this);
  this.resetFunc = null;
  this.initFunc = null;
};

Plx.FunctionBinder.prototype = Object.create(Plx.Component.prototype);
Plx.FunctionBinder.prototype.constructor = Plx.FunctionBinder;

Plx.FunctionBinder.prototype.reset = function() {
  Plx.Component.prototype.reset.call(this);
  
  if (this.resetFunc)
    this.resetFunc = this.resetFunc.bind(this);
  if (this.initFunc)
    this.initFunc = this.initFunc.bind(this);
  if (this.resetFunc)
    this.resetFunc();
};

Plx.FunctionBinder.prototype.init = function() {
  Plx.Component.prototype.init.call(this);

  if (this.initFunc)
    this.initFunc();
};
