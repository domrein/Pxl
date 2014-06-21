Pxl.TextCom = function() {
  Pxl.DisplayCom.call(this);
  this.reset();
};

Pxl.TextCom.prototype = Object.create(Pxl.DisplayCom.prototype);
Pxl.TextCom.prototype.constructor = Pxl.TextCom;

Object.defineProperty(Pxl.TextCom.prototype, "font", {
  get: function() {
    return this._font;
  },
  set: function(value) {
    this._font = value;
    if (this._text && this.game)
      this.updateFrames();
  }
});

Object.defineProperty(Pxl.TextCom.prototype, "text", {
  get: function() {
    return this._text;
  },
  set: function(value) {
    this._text = value;
    if (this._font && this.game)
      this.updateFrames();
  }
});

Object.defineProperty(Pxl.TextCom.prototype, "width", {
  get: function() {
    var widthTotal = 0;
    this.frames.forEach(function(letterFrame) {
      widthTotal += letterFrame.width;
    });
    return widthTotal * this.scaleX;
  }
});

Object.defineProperty(Pxl.TextCom.prototype, "height", {
  get: function() {
    return this.frames[0].height;
  },
});

Pxl.TextCom.prototype.reset = function() {
  Pxl.DisplayCom.prototype.reset.call(this);
  this._text = "";
  this._font = "";
  this.frames = [];
};

Pxl.TextCom.prototype.init = function() {
  Pxl.DisplayCom.prototype.init.call(this);
  this.updateFrames();
};

// TODO: support animated fonts?
Pxl.TextCom.prototype.updateFrames = function() {
  this.frames = [];
  for (var i = 0; i < this._text.length; i++) {
    var curChar = this._text[i];
    var anim = this.game.spriteStore.anims[this._font + "_" + curChar.toUpperCase()];
    var frameName = anim.frames[0];
    this.frames.push(this.game.spriteStore.frames[frameName]);
  };
};
