Pxl.TextCom = function() {
  Pxl.DisplayCom.call(this);
  this.reset();
};

Pxl.TextCom.prototype = Object.create(Pxl.DisplayCom.prototype);
Pxl.TextCom.prototype.constructor = Pxl.TextCom;

Pxl.TextCom.prototype.reset = function() {
  Pxl.DisplayCom.prototype.reset.call(this);
  this.text = "";
  this.font = "";
};

Pxl.TextCom.prototype.init = function() {
  Pxl.DisplayCom.prototype.init.call(this);
};
