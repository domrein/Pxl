export default class SpriteStore {
  constructor() {
    this.frameData = {};
    this.animData = {};
    this.images = {}; // image, dom element, bunch of frames packed together
    this.frames = {}; // frame, individual pic, has a name
    this.anims = {}; // anim, list of frames
  }

  addImage(image, name) {
    this.images[name] = image;
  }

  buildAnims() {
    for (const image of Object.keys(this.frameData)) {
      const imageFrames = this.frameData[image];
      for (const frame of Object.keys(imageFrames)) {
        const frameData = imageFrames[frame];
        this.addFrame(frame, frameData.x, frameData.y, frameData.width, frameData.height, this.images[image]);
      }
    }

    for (const anim of Object.keys(this.animData)) {
      const animData = this.animData[anim];
      const frames = [];
      for (const frame of animData.frames) {
        frames.push(this.frames[frame]);
      }
      this.addAnim(anim, frames, animData.frameRate, animData.looping);
    }
  }

  addFrame(name, x, y, width, height, imageName) {
    this.frames[name] = {x: x, y: y, width: width, height: height, image: imageName};
  }

  // TODO: how do we control how many ticks each frame gets? (maybe some frames get more ticks than others?)
  addAnim(name, frames, frameRate, looping) {
    this.anims[name] = {frames: frames, looping: looping, frameRate: frameRate, name};
  }

  // // TODO: the fact that this function needs to exist is kinda stupid. Find a way to immediately set sprite width/height without having to wait
  // // on callbacks to be added to scene so we have access to game etc.
  // getAnimWidthHeight(animName) {
  //   var frame = this.frames[this.anims[animName].frames[0]];
  //   return [frame.width, frame.height];
  // }
};
