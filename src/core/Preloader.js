Pxl.Preloader = function() {
  this.imagePaths = [];
  this.totalImages = 0;
  // this.images = {};
  this.beacon = new Pxl.Beacon(this);
  // TODO: pass in id of canvas
  this.canvas = document.getElementById('canvas');
  this.context = this.canvas.getContext('2d');
};

Pxl.Preloader.prototype.addImage = function(imagePath) {
  this.imagePaths.push(imagePath);
};

Pxl.Preloader.prototype.load = function() {
  this.totalImages = this.imagePaths.length;
  this.render();
  for (var i = 0; i < this.imagePaths.length; i ++) {
    var imagePath = this.imagePaths[i];
    var image = new Image();
    var _this = this;
    image.onload = function(event){_this.onImageLoaded(event);};
    image.src = imagePath;
    // this.images[imagePath] = image;
  }
};

Pxl.Preloader.prototype.onImageLoaded = function(event) {
  for (var i = this.imagePaths.length - 1; i >= 0; i --) {
    var imagePath = this.imagePaths[i];
    if (event.currentTarget.src.indexOf(imagePath) != -1) {
      this.beacon.emit('imageLoaded', {image:event.currentTarget, path:imagePath});
      this.imagePaths.splice(i, 1);
      break;
    }
  }

  this.render();

  if (!this.imagePaths.length)
    this.beacon.emit('completed', {});
};

Pxl.Preloader.prototype.render = function() {
  // clear screen
  this.context.fillStyle = '#000000';
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
  // calc sizes and stuff
  var padding = Math.round(this.canvas.width / 10);
  var width = Math.round(this.canvas.width - padding * 2);
  var height = Math.round(padding);
  var innerPadding = Math.round(this.canvas.width / 100);
  var innerWidth = Math.round(width - innerPadding * 2);
  var innerHeight = Math.round(height - innerPadding * 2);

  // calc percentComplete
  // Using Object.keys is probably a bad idea, but it doesn't really matter here (Note though that it is ES5)
  var percentComplete = 1 - this.imagePaths.length / this.totalImages;

  // draw loading bar
  this.context.fillStyle = this.context.strokeStyle = '#EEEEEE';
  this.context.strokeRect(padding, this.canvas.height / 2 - height / 2, width, height);
  this.context.fillRect(padding + innerPadding, this.canvas.height / 2 - innerHeight / 2, Math.round(innerWidth * percentComplete), innerHeight);
};