import Graphic from "./Graphic.js";

export default class Sprite extends Graphic {
  constructor(actor) {
    super(actor);

    this.anim = null;
    this.animCount = 0;
    this.frame = null;
    this.frameIndex = 0;
    this.flip = false;
  }

  update() {
    super.update();
    if (this.anim) {
      if (this.animCount === this.anim.frameRate) {
        this.animCount = 0;
        this.frameIndex++;
        if (this.frameIndex >= this.anim.frames.length) {
          if (this.anim.looping) {
            this.frameIndex = 0;
          }
          else {
            this.frameIndex = this.anim.frames.length - 1;
          }
        }
        this.frame = this.anim.frames[this.frameIndex];
      }
    }
    this.animCount++;
  }

  play(anim) {
    // TODO: have a global handle to get spriteStore?
    this.animCount = 0;
    this.frameIndex = 0;
    this.anim = this.actor.scene.game.spriteStore.anims[anim];
    this.frame = this.anim.frames[this.frameIndex];
  }
};
