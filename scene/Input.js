/*
Paul Milham
2/15/16
*/

import Beacon from "../core/Beacon.js";

export default class Input {
  constructor() {
    this.beacon = new Beacon(this);
    this.keys = {};
  }

  onKeyPressed(key) {
    this.beacon.emit("keyPressed", key);
    this.keys[key] = true;
  }

  onKeyReleased(key) {
    this.beacon.emit("keyReleased", key);
    this.keys[key] = false;
  }

  onTouchStarted(touch) {
    this.beacon.emit("touchStarted", touch);
  }

  onTouchMoved(touch) {
    this.beacon.emit("touchMoved", touch);
  }

  onTouchEnded(touch) {
    this.beacon.emit("touchEnded", touch);
  }
};
