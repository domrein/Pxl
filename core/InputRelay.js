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
    document.addEventListener("keydown", this.onKeyDown.bind(this), true);
    document.addEventListener("keyup", this.onKeyUp.bind(this), true);
    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
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
      const touch = new Point(touchX, touchY);
      if (this.game.scenes.length) {
        this.game.scenes[this.game.scenes.length - 1].input.onTouchStart(touch);
      }
    }
  }

  onTouchMove(event) {
    // TODO: touch move events
    // console.log(event);
  }

  onTouchEnd(event) {
    // TODO: touch end events
    // console.log(event);
  }

  // NOTE: mouse events mimic touch events
  onMouseDown(event) {
    const touch = new Point(event.offsetX, event.offsetY);
    if (this.game.scenes.length) {
      this.game.scenes[this.game.scenes.length - 1].input.onTouchStart(touch);
    }
  }
};
