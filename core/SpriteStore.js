Plx.SpriteStore = function() {
  this.images = {}; // image, dom element, bunch of frames packed together
  this.frames = {}; // frame, individual pic, has a name
  this.anims = {}; // anim, list of frames
};

Plx.SpriteStore.prototype.addImage = function(image, name) {
  this.images[name] = image;
};

Plx.SpriteStore.prototype.addFrame = function(x, y, width, height, imageName, name) {
  this.frames[name] = {x:x, y:y, width:width, height:height, image:imageName};
};

// TODO: how do we control how many ticks each frame gets? (maybe some frames get more ticks than others?)
Plx.SpriteStore.prototype.addAnim = function(frameNames, looping, name, frameRate) {
  this.anims[name] = {frames:frameNames, looping:looping, frameRate:frameRate};
};

// TODO: the fact that this function needs to exist is kinda stupid. Find a way to immediately set sprite width/height without having to wait
// on callbacks to be added to scene so we have access to game etc.
Plx.SpriteStore.prototype.getAnimWidthHeight = function(animName) {
  var frame = this.frames[this.anims[animName].frames[0]];
  return [frame.width, frame.height];
};
