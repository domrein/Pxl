import Beacon from "../core/Beacon.js";
import Physics from "./Physics.js";
import Input from "./Input.js";
import Camera from "./Camera.js";
import Layer from "./Layer.js";
import Tweener from "../core/Tweener.js";

export default class Scene {
  constructor(game, handoffData) {
    this.game = game;
    this.handoffData = handoffData;

    this.paused = false;
    this.beacon = new Beacon(this);
    this.actors = [];
    this.physics = new Physics(this);
    this.input = new Input();
    this.camera = new Camera();
    this.tweener = new Tweener();
    this.layers = [];
    this.addLayer("default");
  }

  update() {
    this.tweener.update();
    this.camera.update();
    // update all actors
    for (const actor of this.actors) {
      actor.update();
    }

    this.physics.update();

    // TODO: actor pooling
    // remove dead actors
    // let reduceResult = this.actors.reduce((prev, curr) => prev && curr.alive, true);
    // if (!this.actors.reduce((prev, curr) => prev && curr.alive, true)) {
    //   this.actors = this.actors.filter(actor => actor.alive);
    // }

    for (let i = this.actors.length - 1; i >= 0; i--) {
      const actor = this.actors[i];
      if (!actor.alive) {
        this.removeActor(actor, i);
      }
    }

    this.beacon.emit("updated");
    // systems should do any cleanup at this point. They should not interact further.
    this.beacon.emit("updateCompleted");
  }

  render(frameProgress) {
    this.beacon.emit("rendered", {frameProgress:frameProgress});
    this.beacon.emit("renderCompleted", {frameProgress:frameProgress});
  }

  addActor(actor) {
    actor.scene = this;
    this.actors.push(actor);
    actor.beacon.emit("addedToScene");
    this.beacon.emit("actorAdded", actor);

    return actor;
  }

  removeActor(actor, index) {
    this.beacon.emit("actorRemoved", actor);
    actor.beacon.emit("removedFromScene");
    if (index !== undefined) {
      this.actors.splice(index, 1);
    }
    else {
      this.actors.splice(this.actors.indexOf(actor), 1);
    }
  }

  addLayer(name, {ySort = false} = {}) {
    const layer = new Layer();
    layer.name = name;
    layer.ySort = ySort;
    this.layers.push(layer);
    return layer;
  }

  switchScene(sceneClass, transition, handoffData) {
    this.beacon.emit("completed", sceneClass, transition, handoffData);
    this.paused = true;
  }

  destroy() {
    // var i;
    // for (i = 0; i < this.actors.length; i ++) {
    //   var actor = this.actors[i];
    //   this.game.actorFactory.returnActor(actor);
    // }
    // for (i = 0; i < this.systems.length; i ++) {
    //   var system = this.systems[i];
    //   system.destroy();
    // }
    this.beacon.destroy();
  }
};
