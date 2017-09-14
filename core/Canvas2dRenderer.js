import Sprite from "../actor/Sprite.js";
import Text from "../actor/Text.js";
import ColorRectangle from "../actor/ColorRectangle.js";

export default class Canvas2dRenderer {
  // TODO: how do we render scene transitions?
  constructor(game, canvasId) {
    this.game = game;
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.graphics = new WeakMap();
  }

  render() {
    this.context.imageSmoothingEnabled = false;
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const scene of this.game.scenes) {
      if (!this.graphics.get(scene)) {
        this.graphics.set(scene, scene.actors
          .reduce((prev, curr) => curr.graphics.length ? prev.concat(curr.graphics) : prev, [])
          .filter(graphic => graphic.visible)
          .sort((a, b) => a.z - b.z)
        );
      }
      // TODO: move this into an event based system instead of building every frame
      // need to know when actors are added/removed and when graphics are added/removed
      const graphics = scene.actors
        .reduce((prev, curr) => curr.graphics.length ? prev.concat(curr.graphics) : prev, [])
        .filter(graphic => graphic.visible)
        .sort((a, b) => a.z - b.z);
      for (const graphic of graphics) {
        const renderX = (graphic.actor.body.x + graphic.offset.x) * this.game.displayRatio + scene.camera.x * this.game.displayRatio;
        const renderY = (graphic.actor.body.y + graphic.offset.y) * this.game.displayRatio + scene.camera.y * this.game.displayRatio;
        if (graphic.alpha !== this.context.globalAlpha) {
          this.context.globalAlpha = graphic.alpha;
        }
        // TODO: find a cheaper way of testing type than instanceof
        if (graphic instanceof Sprite) {
          if (graphic.flip) {
            this.context.scale(-1, 1);
            this.context.drawImage(
              graphic.frame.image,
              graphic.frame.x,
              graphic.frame.y,
              graphic.frame.width,
              graphic.frame.height,
              -renderX - this.game.displayRatio * graphic.frame.width,
              renderY,
              graphic.frame.width * this.game.displayRatio * graphic.scale.x,
              graphic.frame.height * this.game.displayRatio * graphic.scale.y
            );
            this.context.scale(-1, 1);
          }
          else {
            // this.context.scale(1, 1);
            this.context.drawImage(
              graphic.frame.image,
              graphic.frame.x,
              graphic.frame.y,
              graphic.frame.width,
              graphic.frame.height,
              renderX,
              renderY,
              graphic.frame.width * this.game.displayRatio * graphic.scale.x,
              graphic.frame.height * this.game.displayRatio * graphic.scale.y
            );
          }
        }
        else if (graphic instanceof Text) {
          this.context.font = `${graphic.size * this.game.displayRatio}px ${graphic.font}`;
          this.context.fillStyle = graphic.fillStyle;
          this.context.textBaseline = graphic.textBaseline;
          this.context.fillText(graphic.prefix + graphic.text, renderX, renderY);
        }
        else if (graphic instanceof ColorRectangle) {
          this.context.fillStyle = graphic.color;
          this.context.fillRect(
            renderX,
            renderY,
            graphic.width * this.game.displayRatio * graphic.scale.x,
            graphic.height * this.game.displayRatio * graphic.scale.y
          );
        }
      }
    }
  }
};
