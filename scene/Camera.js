/*
Paul Milham
2/27/16
*/

import Point from "../core/Point.js";
import * as random from "../core/random.js";

export default class Camera extends Point {
  constructor() {
    super();
    this.loc = new Point();
    this.shakeData = null;
  }

  update() {
    if (this.shakeData) {
      let shakeX = this.shakeData.intensity * (this.shakeData.count / this.shakeData.duration) * random.float(-1, 1);
      let shakeY = this.shakeData.intensity * (this.shakeData.count / this.shakeData.duration) * random.float(-1, 1);

      this.x = this.loc.x + shakeX;
      this.y = this.loc.y + shakeY;
      this.shakeData.count--;
      if (this.shakeData.count <= 0) {
        this.shakeData = null;
        this.x = this.loc.x;
        this.x = this.loc.y;
      }
    }
  }

  shake(intensity, duration) {
    this.shakeData = {
      intensity,
      duration,
      count: duration,
    };
  }
};
