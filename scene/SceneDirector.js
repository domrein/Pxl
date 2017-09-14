export default class SceneDirector {
  // game and scene director share array of scenes
  constructor(scenes, game) {
    this.scenes = scenes;
    this.game = game;
  }

  addScene(sceneClass, handoffData) {
    var scene = new sceneClass(this.game, handoffData);
    scene.beacon.observe(this, "completed", this.onSceneCompleted);
    this.scenes.push(scene);
    scene.beacon.emit("added", null);
  }

  onSceneCompleted(source, sceneClass, handoffData) {
    source.ignore(this, "completed", this.onSceneCompleted);
    for (let i = this.scenes.length - 1; i >= 0; i--) {
      const scene = this.scenes[i];
      if (source.owner === scene) {
        this.scenes.splice(i, 1);
      }
    }
    source.owner.destroy();
    this.addScene(sceneClass, handoffData);
  }
};
