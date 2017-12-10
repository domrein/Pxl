import Beacon from "./Beacon.js";

export default class Preloader {
  constructor() {
    this.imagePaths = [];
    this.totalImages = 0;
    this.audio = [];
    this.totalAudio = 0;
    this.data = [];
    this.totalData = 0;
    this.beacon = new Beacon(this);
    // TODO: pass in id of canvas
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
  }

  addImage(path, name) {
    this.imagePaths.push({path, name});
  }

  addAudio(path, name) {
    this.audio.push({path, name});
  }

  addFrameData(path) {
    this.addData(path, "frameData");
  }

  addAnimData(path) {
    this.addData(path, "animData");
  }

  addData(path, name) {
    this.data.push({path, name});
  }

  load() {
    this.totalImages = this.imagePaths.length;
    this.render();
    // load images
    for (let i = 0; i < this.imagePaths.length; i ++) {
      const {path: imagePath, name: imageName} = this.imagePaths[i];

      const image = new Image();
      image.onload = event => {
        this.imagePaths.splice(this.imagePaths.indexOf(imagePath), 1);
        this.beacon.emit("imageLoaded", event.currentTarget, imageName);

        this.render();

        if (!this.imagePaths.length) {
          this.beacon.emit("allImagesLoaded");
        }
        if (!this.imagePaths.length && !this.audio.length && !this.data.length) {
          this.beacon.emit("completed", {});
        }
      };
      image.src = imagePath;
      // this.images[imagePath] = image;
    }

    // TODO: remove AudioContext prefix when Safari updates
    const context = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.beacon.emit("audioContextCreated", context);
    for (const audio of this.audio) {
      const request = new XMLHttpRequest();
      request.open("GET", audio.path, true);
      request.responseType = "arraybuffer";
      request.addEventListener("load", event => {
        context.decodeAudioData(event.target.response, buffer => {
          for (let i = this.audio.length - 1; i >= 0; i--) {
            if (this.audio[i].path === audio.path) {
              this.audio.splice(i, 1);
            }
          }
          this.beacon.emit("audioLoaded", buffer, audio.name);

          if (!this.audio.length) {
            this.beacon.emit("allAudioLoaded");
          }
          if (!this.imagePaths.length && !this.audio.length && !this.data.length) {
            this.beacon.emit("completed", {});
          }
        });
      }, false);
      request.send();
    }

    for (const data of this.data) {
      const request = new XMLHttpRequest();
      request.open("GET", data.path, true);
      request.addEventListener("load", event => {
        console.log(event);
        for (let i = this.data.length - 1; i >= 0; i--) {
          if (this.data[i].path === data.path) {
            this.data.splice(i, 1);
          }
        }
        this.beacon.emit("dataLoaded", JSON.parse(event.currentTarget.response), data.name);

        if (!this.data.length) {
          this.beacon.emit("allDataLoaded");
        }
        if (!this.imagePaths.length && !this.audio.length && !this.data.length) {
          this.beacon.emit("completed", {});
        }
      }, false);
      request.send();
    }
  }

  render() {
    // clear screen
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // calc sizes and stuff
    const padding = Math.round(this.canvas.width / 10);
    const width = Math.round(this.canvas.width - padding * 2);
    const height = Math.round(padding);
    const innerPadding = Math.round(this.canvas.width / 100);
    const innerWidth = Math.round(width - innerPadding * 2);
    const innerHeight = Math.round(height - innerPadding * 2);

    // calc percentComplete
    const percentComplete = 1 - this.imagePaths.length / this.totalImages;

    // draw loading bar
    this.context.fillStyle = this.context.strokeStyle = "#EEEEEE";
    this.context.strokeRect(padding, this.canvas.height / 2 - height / 2, width, height);
    this.context.fillRect(padding + innerPadding, this.canvas.height / 2 - innerHeight / 2, Math.round(innerWidth * percentComplete), innerHeight);
  }
};
