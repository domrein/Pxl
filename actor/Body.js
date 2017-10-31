import Rectangle from "../core/Rectangle.js";
import Beacon from "../core/Beacon.js";
import Point from "../core/Point.js";
import Vector from "../core/Vector.js";

export default class Body extends Rectangle {
  constructor() {
    super();

    this.beacon = new Beacon(this);

    this.type = "none";
    this.mass = null; // for use in shared collision resolution
    this.velocity = new Vector();
    this.friction = null;
    this.gravity = new Vector();
    this.disabled = false;
  }

  calcAngle(body) {
    const myCenter = new Point(this.x + this.width / 2, this.y + this.height / 2);
    const otherCenter = new Point(body.x + body.width / 2, body.y + body.height / 2);
    const xDist = myCenter.x - otherCenter.x;
    const yDist = myCenter.y - otherCenter.y;
    return Math.atan2(yDist, xDist);
  }
};
