import Graphic from "./Graphic.js";

export default class Text extends Graphic {
  constructor(actor, text) {
    super(actor);
    this.text = `${text}`;
    this.prefix = "";
    this.size = Text.defaultSize;
    this.font = Text.defaultFont;
    this.fillStyle = "#FFFFFF";
    this.textBaseline = "top";
    this.fontString = `${this.size}px ${this.font}`;
    this.shadow = null;
    // this.shadow = {
    //   color: "#000",
    //   x: 5,
    //   y: 5,
    //   blur: 5,
    // };
  }
};

Text.defaultFont = "DSDigital";
Text.defaultSize = 25;
