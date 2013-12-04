Plx.SceneDirector = function() {
  this.scenes = [];
};

Plx.SceneDirector.prototype.addScene = function(scene) {
  this.scenes.push(scene);
};

Plx.SceneDirector.prototype.swapScenes = function(oldScene, newScene, transition) {
  this.scenes.remove(oldScene);
  this.scenes.add(newScene);
};
