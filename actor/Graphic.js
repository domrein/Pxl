/*
Paul Milham
3/5/16
*/

import Point from "../core/Point.js";

let idCount = 0;

export default class Graphic {
  constructor(actor) {
    this.actor = actor;
    this.actor.beacon.observe(this, "addedToScene", this.onAddedToScene);

    this.scale = new Point(1, 1);

    this.visible = true;
    this.alpha = 1;
    this.offset = new Point();
    this.pivot = new Point();
    this.z = 0;
    this.id = idCount++; // used to keep z sorting stable
    this.layerName = "default"; // used to look up layer when added to scene
    this.layer = null;
    this.lerp = 1;

    this.blinkCount = 0;
    this.blinkRate = -1;
    this.blinkDuration = -1;
  }

  update() {
    if (this.blinkRate !== -1) {
      this.blinkCount++;
      if (this.blinkCount >= this.blinkRate) {
        this.visible = false;
      }
      if (this.blinkCount >= this.blinkRate + this.blinkDuration) {
        this.blinkCount = 0;
        this.visible = true;
      }
    }
  }

  onAddedToScene() {
    this.layer = this.actor.scene.layers.find(l => l.name === this.layerName);
    if (!this.layer) {
      throw new Error(`Unable to find layer by name: ${this.layerName} in scene ${this.actor.scene.constructor.name}`);
    }
  }
};
