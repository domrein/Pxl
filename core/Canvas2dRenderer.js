import Sprite from "../actor/Sprite.js";
import Text from "../actor/Text.js";
import ColorRectangle from "../actor/ColorRectangle.js";

export default class Canvas2dRenderer {
  // TODO: how do we render scene transitions?
  constructor(game, canvasId) {
    this.game = game;

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.border = "2px solid";
    this.canvas.width = game.width;
    this.canvas.height = game.height;
    document.body.appendChild(this.canvas);

    this.context = this.canvas.getContext("2d");
    this.renderCanvas = document.getElementById(canvasId);
    this.renderContext = this.renderCanvas.getContext("2d");
    this.renderContext.imageSmoothingEnabled = false;
    this.graphics = new WeakMap();
    this.backgroundColor = "#000000";
  }

  onSceneAdded(scene) {
    scene.beacon.observe(this, "actorAdded", this.onActorAdded);
    scene.beacon.observe(this, "actorRemoved", this.onActorRemoved);

    const layers = {};
    scene.layers.forEach(l => layers[l.name] = []);


    scene.actors.forEach(a => a.graphics.forEach(g => layers[g.layer.name].push(g)))
    Object.values(layers).forEach(l => l.sort(this.sortGraphics));

    // add all actors in scene (usually actors added in constructor)
    // scene.actors.forEach(a => this.onActorAdded(scene.beacon, a));

    this.graphics.set(scene, layers);
  }

  // sort by then z, then id
  // (graphics are already sorted by layer)
  sortGraphics(a, b) {
    if (a.z === b.z) {
      return a.id - b.id;
    }
    return a.z - b.z;
  }

  onActorAdded(source, actor) {
    const layers = this.graphics.get(source.owner);
    // sort as we add (should match logic in sortGraphics)
    for (const actorGraphic of actor.graphics) {
      let inserted = false;
      const layerGraphics = layers[actorGraphic.layer.name];
      // TODO: this insertion algorightm could be more efficient (binary search)
      for (let i = 0; i < layerGraphics.length; i++) {
        const layerGraphic = layerGraphics[i];
        const sort = this.sortGraphics(actorGraphic, layerGraphic);
        if (sort < 0) {
          layerGraphics.splice(i, 0, actorGraphic);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        layerGraphics.push(actorGraphic);
      }
    }
  }

  onActorRemoved(source, actor) {
    const layers = this.graphics.get(source.owner);
    actor.graphics.forEach(g => {
      const layer = layers[g.layer.name];
      const index = layer.indexOf(g);
      if (index !== -1) {
        layer.splice(index, 1);
      }
    });
  }

  render() {
    this.context.imageSmoothingEnabled = false;
    // this.renderContext.imageSmoothingEnabled = false;
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const scene of this.game.scenes) {
      const layers = this.graphics.get(scene);
      // render each layer
      for (const l of scene.layers) {
      // scene.layers.forEach(l => {
        const graphics = layers[l.name];
        if (l.ySort) {
          graphics.sort((a, b) => {
            if (a.z === b.z) {
              if (a.actor.body.y === b.actor.body.y) {
                return a.id - b.id;
              }
              return a.actor.body.y - b.actor.body.y;
            }
            return a.z - b.z;
          });
        }
        for (const graphic of graphics) {
          // if sprite isn't visible
          if (!graphic.visible) {
            continue;
          }
          if (graphic.alpha <= 0) {
            continue;
          }


          const renderX = (graphic.actor.body.x + graphic.offset.x) - scene.camera.x * graphic.lerp;
          const renderY = (graphic.actor.body.y + graphic.offset.y) - scene.camera.y * graphic.lerp;
          let renderWidth = 0;
          let renderHeight = 0;
          if (graphic instanceof Sprite) {
            renderWidth = graphic.frame.image.width;
            renderHeight = graphic.frame.image.width;
          }

          // if sprite is off camera
          if (renderX + renderWidth < 0) {
            continue;
          }
          if (renderX > scene.game.width) {
            continue;
          }
          if (renderY + renderHeight < 0) {
            continue;
          }
          if (renderY > scene.game.height) {
            continue;
          }

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
                -renderX * graphic.frame.width,
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
                graphic.frame.width * graphic.scale.x,
                graphic.frame.height * graphic.scale.y
              );
            }
          }
          else if (graphic instanceof Text) {
            this.context.font = `${graphic.size}px ${graphic.font}`;
            this.context.fillStyle = graphic.fillStyle;
            this.context.textBaseline = graphic.textBaseline;
            if (graphic.shadow) {
              this.context.shadowColor = graphic.shadow.color;
              this.context.shadowOffsetX = graphic.shadow.x;
              this.context.shadowOffsetY = graphic.shadow.y;
              this.context.shadowBlur = graphic.shadow.blur;
            }
            this.context.fillText(graphic.prefix + graphic.text, renderX, renderY);
            if (graphic.shadow) {
              this.context.shadowColor = null;
              this.context.shadowOffsetX = 0;
              this.context.shadowOffsetY = 0;
              this.context.shadowBlur = 0;
            }
          }
          else if (graphic instanceof ColorRectangle) {
            this.context.fillStyle = graphic.color;
            this.context.fillRect(
              renderX,
              renderY,
              graphic.width * graphic.scale.x,
              graphic.height * graphic.scale.y
            );
          }
        }
      }
    }

    var widthRatio = window.innerWidth / this.game.width;
    var heightRatio = window.innerHeight / this.game.height;
    let displayRatio = widthRatio;
    if (this.game.height * widthRatio > window.innerHeight) {
      displayRatio = heightRatio;
    }
    // this.displayOffsetX = Math.round(window.innerWidth - this.width * this.displayRatio) / 2;
    // this.displayOffsetY = Math.round(window.innerHeight - this.height * this.displayRatio) / 2;

    // document.getElementById(this.canvasId).width = this.width * this.displayRatio;
    // document.getElementById(this.canvasId).height = this.height * this.displayRatio;
    // // TODO: make sure the fullscreen toggling is correct and unprefix it
    // if (!document.webkitFullscreenElement) {
    //   document.getElementById(this.canvasId).style.marginLeft = this.displayOffsetX  + "px";
    //   document.getElementById(this.canvasId).style.marginTop = this.displayOffsetY  + "px";
    // }
    // else {
    //   document.getElementById(this.canvasId).style.marginLeft = "0px";
    //   document.getElementById(this.canvasId).style.marginTop = "0px";
    // }

    this.renderContext.drawImage(this.canvas, 0, 0, this.game.width * displayRatio, this.game.height * displayRatio);
  }
};
