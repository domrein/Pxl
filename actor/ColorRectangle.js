import Graphic from "./Graphic.js";

export default class ColorRectangle extends Graphic {
  constructor(actor) {
    super(actor);

    this.width = 10;
    this.height = 10;
    this.color = "#000";
  }
};
