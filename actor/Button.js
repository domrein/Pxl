/*
Paul Milham
12/21/17
*/

import Actor from "./Actor.js";
import Body from "./Body.js";
import Sprite from "./Sprite.js";

export default class Button extends Actor {
  constructor(scene, animName) {
    super(scene);

    this.animName = animName;

    this.body = new Body();
    this.body.width = 48;
    this.body.height = 32;
    this.body.touchable = true;

    this.graphics.push(new Sprite(this));
    this.graphics[0].play(`${this.animName}Up`);
    this.graphics[0].layerName = "ui";

    this.body.beacon.observe(this, "touchStarted", this.onTouchStarted);
    this.body.beacon.observe(this, "touchEnded", this.onTouchEnded);
  }

  onTouchStarted(source, touch) {
    this.graphics[0].play(`${this.animName}Down`);
  }

  onTouchEnded(source, touch) {
    this.graphics[0].play(`${this.animName}Up`);
  }
}
