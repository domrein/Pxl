Pxl.SceneDirector = function() {
  this.scenes = [];
};

Pxl.SceneDirector.prototype.addScene = function(scene) {
  this.scenes.push(scene);
};

Pxl.SceneDirector.prototype.swapScenes = function(oldScene, newScene, transition) {
  this.scenes.remove(oldScene);
  this.scenes.add(newScene);
};
