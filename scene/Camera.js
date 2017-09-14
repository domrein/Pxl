/*
Paul Milham
2/27/16
*/

import Point from "../core/Point.js";

export default class Camera extends Point {
  constructor() {
    super();
    this.loc = new Point();
    this.shakeData = null;
  }

  update() {
    if (this.shakeData) {
      let shakeX = this.shakeData.intensity * (this.shakeData.count / this.shakeData.duration) * Math.random();
      if (Math.random() > 0.5) {
        shakeX = -shakeX;
      }
      let shakeY = this.shakeData.intensity * (this.shakeData.count / this.shakeData.duration) * Math.random();
      if (Math.random() > 0.5) {
        shakeY = -shakeY;
      }

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
