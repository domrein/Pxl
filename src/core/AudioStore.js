Pxl.AudioStore = function() {
  this.audio = {}; // image, dom element, bunch of frames packed together
};

Pxl.AudioStore.prototype.addAudio = function(audio, name) {
  this.audio[name] = audio;
};
