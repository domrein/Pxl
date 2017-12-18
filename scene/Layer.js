/*
Paul Milham
2/27/16
*/

import Point from "../core/Point.js";
import * as random from "../core/random.js";

export default class Layer extends Point {
  constructor() {
    super();

    this.name = "";
    this.ySort = false; // renderer will sort layer by graphic z, then actor y on every frame
  }
}
