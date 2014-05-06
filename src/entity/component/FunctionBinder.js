Pxl.FunctionBinder = function() {
  Pxl.Component.call(this);
  this.resetFunc = null;
  this.initFunc = null;
};

Pxl.FunctionBinder.prototype = Object.create(Pxl.Component.prototype);
Pxl.FunctionBinder.prototype.constructor = Pxl.FunctionBinder;

Pxl.FunctionBinder.prototype.reset = function() {
  Pxl.Component.prototype.reset.call(this);
  
  if (this.resetFunc)
    this.resetFunc = this.resetFunc.bind(this);
  if (this.initFunc)
    this.initFunc = this.initFunc.bind(this);
  if (this.resetFunc)
    this.resetFunc();
};

Pxl.FunctionBinder.prototype.init = function() {
  Pxl.Component.prototype.init.call(this);

  if (this.initFunc)
    this.initFunc();
};
