import Scene from "./Scene.js";
import Actor from "../actor/Actor.js";
import Body from "../actor/Body.js";
import ColorRectangle from "../actor/ColorRectangle.js";

export default class Preloader extends Scene {
  constructor(game) {
    super(game);

    this.imagePaths = [];
    this.totalImages = 0;
    this.audio = [];
    this.totalAudio = 0;
    this.data = [];
    this.totalData = 0;

    this.nextScene = null;

    this.beacon.observe(this.spriteStore, "imageLoaded", (source, image, name) => this.spriteStore.addImage(image, name));
    this.beacon.observe(this.spriteStore, "completed", () => {
      if (this.dataStore.data.frameData) {
        this.spriteStore.frameData = this.dataStore.data.frameData;
      }
      if (this.dataStore.data.animData) {
        this.spriteStore.animData = this.dataStore.data.animData;
      }
      this.spriteStore.buildAnims();
    });
    this.beacon.observe(this.audioMixer, "audioContextCreated", (...args) => this.audioMixer.onContextCreated(...args));
    this.beacon.observe(this.audioMixer, "audioLoaded", (...args) => this.audioMixer.onAudioLoaded(...args));
    this.beacon.observe(this.dataStore, "dataLoaded", (source, data, name) => this.dataStore.addData(data, name));
  }

  init() {
    const padding = Math.round(this.game.width / 10);
    const width = Math.round(this.game.width - padding * 2);
    const height = Math.round(padding);
    const innerPadding = Math.round(this.game.width / 100);
    const innerWidth = Math.round(width - innerPadding * 2);
    const innerHeight = Math.round(height - innerPadding * 2);

    const progress = new Actor(this);
    progress.graphics.push(new ColorRectangle(progress));
    progress.graphics[0].color = "#FFF";
    progress.body = new Body();
    progress.body.x = padding;
    progress.body.y = this.game.height / 2 - height / 2;
    this.addActor(progress);

    const loadProgress = () => {
      const totalAssets = this.totalImages + this.totalAudio + this.totalData;
      const totalLoaded = totalAssets - this.imagePaths.length + this.audio.length + this.data.length;

      // calc percentComplete
      const percentComplete = totalLoaded / totalAssets;
      progress.graphics[0].width = width * percentComplete;
    };

    this.beacon.observe(this, "imageLoaded", loadProgress);
    this.beacon.observe(this, "audioLoaded", loadProgress);
    this.beacon.observe(this, "dataLoaded", loadProgress);
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
          this.beacon.emit("completed", this.nextScene);
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
            this.beacon.emit("completed", this.nextScene);
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
          this.beacon.emit("completed", this.nextScene);
        }
      }, false);
      request.send();
    }
  }
};
