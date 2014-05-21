"use strict";
// requestAnimationFrame polyfill
var lastTime = 0;
if (!window.requestAnimationFrame) {
  ["webkit", "moz"].forEach(function(vendor) {
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
  });
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function(){callback(currTime + timeToCall);}, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}
// end requestAnimationFrame polyfill

// declare global namespace
// TODO: move this global stuff to a globals class?
var Pxl = {};

Pxl.Game = function(width, height, firstSceneClass) {
  this.beacon = new Pxl.Beacon(this);

  this.width = width;
  this.height = height;
  this.onDisplayResize();

  this.firstSceneClass = firstSceneClass;
  this.sceneDirector = new Pxl.SceneDirector();
  this.scenes = [];
  this.lastTime = -1;
  this.time = -1;
  this.updateRate = 1000 / 60;
  this.deltaTime = 0;
  this.preloader = new Pxl.Preloader();
  // TODO: seems like the game shouldn't have all this specific code to mediate between the preloader and the sprite store in it
  this.preloader.beacon.observe(this, "imageLoaded", this.onImageLoaded);
  this.preloader.beacon.observe(this, "completed", this.onPreloaderCompleted);
  this.spriteStore = new Pxl.SpriteStore();
  this.saveData = new Pxl.SaveData();
  this.entityFactory = new Pxl.EntityFactory(this);
  
  // TODO: move the default entity types somewhere more appropriate
  this.entityFactory.registerType("PxlButton", [
    {type: Pxl.PhysicsComponent, name: "physics", params: {}},
    {type: Pxl.SpriteCom, name: "sprite", params: {autoSizePhysics: true}},
    {type: Pxl.PointerCom, name: "pointer", params: {}},
    {type: Pxl.DataCom, name: "data", params: {}},
  ]);
  this.entityFactory.registerType("PxlSprient", [
    {type: Pxl.PhysicsComponent, name: "physics", params: {}},
    {type: Pxl.SpriteCom, name: "sprite", params: {}},
  ]);
};

Pxl.Game.prototype.init = function() {
  this.preloader.load();
};

Pxl.Game.prototype.update = function(event) {
  this.time = new Date().getTime();
  if (this.lastTime == -1)
    this.lastTime = this.time;
  this.deltaTime += this.time - this.lastTime;
  this.lastTime = this.time;
  // if we've missed a ton of frames, then the user has navigated away or something, so just skip them
  if (this.deltaTime > this.updateRate * 10)
    this.deltaTime = 0;
  var scene, i;
  while (this.deltaTime > this.updateRate) {
    for (i = 0; i < this.scenes.length; i++) {
      scene = this.scenes[i];
      if (!scene.paused)
        scene.update();
    }
    this.deltaTime -= this.updateRate;
  }
  for (i = 0; i < this.scenes.length; i ++) {
    scene = this.scenes[i];
    scene.render(this.deltaTime / this.updateRate);
  }
  var _this = this;
  window.requestAnimationFrame(function(event){_this.update(event);});
};

Pxl.Game.prototype.addScene = function(sceneClass, handoffData) {
  var scene = new sceneClass();
  scene.game = this;
  scene.init(handoffData);
  scene.beacon.observe(this, "completed", this.onSceneCompleted);
  this.scenes.push(scene);
  scene.beacon.emit("added", null);
};

Pxl.Game.prototype.onSceneCompleted = function(event) {
  event.beacon.ignore(this, "completed", this.onSceneCompleted);
  var scene;
  for (var i = this.scenes.length - 1; i >= 0; i--) {
    scene = this.scenes[i];
    if (event.beacon.owner == scene)
      this.scenes.splice(i, 1);
  }
  event.beacon.owner.destroy();
  this.addScene(event.data.sceneClass, event.data.handoffData);
};

Pxl.Game.prototype.onPreloaderCompleted = function(event) {
  this.preloader.beacon.ignore(this, "completed", this.onPreloaderCompleted);
  this.addScene(this.firstSceneClass);
  this.update();
};

Pxl.Game.prototype.onImageLoaded = function(event) {
  this.spriteStore.addImage(event.data.image, event.data.path);
};

Pxl.Game.prototype.onDisplayResize = function() {
  // find display size and get ratio
  var widthRatio = window.innerWidth / this.width;
  var heightRatio = window.innerHeight / this.height;
  this.displayRatio = widthRatio;
  if (this.height * widthRatio > window.innerHeight)
    this.displayRatio = heightRatio;
  this.displayOffsetX = Math.round(window.innerWidth - this.width * this.displayRatio) / 2;
  this.displayOffsetY = Math.round(window.innerHeight - this.height * this.displayRatio) / 2;

  document.getElementById("canvas").width = this.width * this.displayRatio;
  document.getElementById("canvas").height = this.height * this.displayRatio;
  document.getElementById("canvas").style.marginLeft = this.displayOffsetX + "px";
  document.getElementById("canvas").style.marginTop = this.displayOffsetY + "px";

  this.beacon.emit("displayResized", null);
};
