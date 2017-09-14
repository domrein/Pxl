import Graphic from "./Graphic.js";

export default class ColorRectangle extends Graphic {
  constructor(actor) {
    super(actor);

    this.width = 0;
    this.height = 0;
    this.color = "#000";
  }
};
