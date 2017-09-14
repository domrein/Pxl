import Graphic from "./Graphic.js";

export default class Text extends Graphic {
  constructor(actor, text) {
    super(actor);
    this.text = `${text}`;
    this.prefix = "";
    this.size = 25;
    this.font = "DSDigital";
    this.fillStyle = "#FFFFFF";
    this.textBaseline = "top";
    this.fontString = `${this.size}px ${this.font}`;
  }
};
