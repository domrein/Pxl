/*
Paul Milham
2/15/16
*/

import Point from "./Point.js";

export default class InputRelay {
  constructor(game) {
    this.game = game;
    this.preventDefaults = null;
    this.canvas = game.renderer.canvas;
    this.touching = false;

    document.addEventListener("keydown", this.onKeyDown.bind(this), true);
    document.addEventListener("keyup", this.onKeyUp.bind(this), true);

    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    // TODO: attach gamepad events
  }

  onKeyDown(event) {
    if (this.preventDefaults && this.preventDefaults.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
    if (this.game.scenes.length) {
      const activeScene = this.game.scenes[this.game.scenes.length - 1];
      if (!activeScene.input.keys[event.key]) {
        activeScene.input.onKeyPressed(event.key);
      }
    }
  }

  onKeyUp(event) {
    if (this.preventDefaults && this.preventDefaults.indexOf(event.key) !== -1) {
      event.preventDefault();
    }
    if (this.game.scenes.length) {
      const activeScene = this.game.scenes[this.game.scenes.length - 1];
      if (activeScene.input.keys[event.key]) {
        activeScene.input.onKeyReleased(event.key);
      }
    }
  }

  onTouchStart(event) {
    // block pull down to refresh behavior on mobile browsers
    event.preventDefault();

    for (const changedTouch of event.changedTouches) {
      const touchX = changedTouch.clientX - this.canvas.offsetLeft;
      const touchY = changedTouch.clientY - this.canvas.offsetTop;
      const touch = new Point(touchX / this.game.displayRatio, touchY / this.game.displayRatio);
      if (this.game.scenes.length) {
        const scene = this.game.scenes[this.game.scenes.length - 1];
        scene.input.onTouchStarted(touch);
        scene.actors.forEach(a => {
          if (a.body && a.body.touchable) {
            if (a.body.contains(touch)) {
              a.body.beacon.emit("touchStarted");
            }
          }
        });
      }
    }
  }

  onTouchMove(event) {
    for (const changedTouch of event.changedTouches) {
      const touchX = changedTouch.clientX - this.canvas.offsetLeft;
      const touchY = changedTouch.clientY - this.canvas.offsetTop;
      const touch = new Point(touchX / this.game.displayRatio, touchY / this.game.displayRatio);
      if (this.game.scenes.length) {
        const scene = this.game.scenes[this.game.scenes.length - 1];
        scene.input.onTouchMoved(touch);
      }
    }
  }

  onTouchEnd(event) {
    for (const changedTouch of event.changedTouches) {
      const touchX = changedTouch.clientX - this.canvas.offsetLeft;
      const touchY = changedTouch.clientY - this.canvas.offsetTop;
      const touch = new Point(touchX / this.game.displayRatio, touchY / this.game.displayRatio);
      if (this.game.scenes.length) {
        this.game.scenes[this.game.scenes.length - 1].input.onTouchEnded(touch);
      }
    }
  }

  // NOTE: mouse events mimic touch events
  onMouseDown(event) {
    const touch = new Point(event.offsetX / this.game.displayRatio, event.offsetY / this.game.displayRatio);
    this.touching = true;
    if (this.game.scenes.length) {
      const scene = this.game.scenes[this.game.scenes.length - 1];
      scene.input.onTouchStarted(touch);
      scene.actors.forEach(a => {
        if (a.body && a.body.touchable) {
          if (a.body.contains(touch)) {
            a.body.beacon.emit("touchStarted");
          }
        }
      });
    }
  }

  onMouseMove(event) {
    // dispatch touch event
    if (this.touching) {
      const touch = new Point(event.offsetX / this.game.displayRatio, event.offsetY / this.game.displayRatio);
      if (this.game.scenes.length) {
        this.game.scenes[this.game.scenes.length - 1].input.onTouchMoved(touch);
      }
    }

    // TODO: dispatch mouse move event for mouse only interactions (hover)
  }

  onMouseUp(event) {
    this.touching = false;
    const touch = new Point(event.offsetX / this.game.displayRatio, event.offsetY / this.game.displayRatio);
    if (this.game.scenes.length) {
      this.game.scenes[this.game.scenes.length - 1].input.onTouchEnded(touch);
    }
  }
};
