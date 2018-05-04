import Beacon from "./Beacon.js";
import InputRelay from "./InputRelay.js";
import SpriteStore from "./SpriteStore.js";
import AudioMixer from "./AudioMixer.js";
import DataStore from "./DataStore.js";
import Preloader from "./Preloader.js";
import SaveData from "./SaveData.js";
import SceneDirector from "../scene/SceneDirector.js";

export default class Game {
  constructor(width, height, firstSceneClass, rendererClass, canvasId, {responsive = false} = {}) {
    this.renderer = new rendererClass(this, canvasId);
    this.displayRatio = 1;
    this.beacon = new Beacon(this);

    this.inputRelay = new InputRelay(this);

    this.width = width;
    this.height = height;
    this.responsive = responsive; // resize game to window size
    window.addEventListener("resize", () => this.onDisplayResize());
    this.onDisplayResize();

    this.firstSceneClass = firstSceneClass;
    this.scenes = [];
    this.sceneDirector = new SceneDirector(this.scenes, this);
    this.lastTime = -1;
    this.time = -1;
    this.updateRate = 1000 / 60;
    this.deltaTime = 0;
    this.spriteStore = new SpriteStore();
    this.audioMixer = new AudioMixer();
    this.dataStore = new DataStore();

    this.preloader = new Preloader();
    // TODO: logic is inconsistent with handling loading
    this.preloader.beacon.observe(this.spriteStore, "imageLoaded", (source, image, name) => this.spriteStore.addImage(image, name));
    this.preloader.beacon.observe(this.spriteStore, "completed", () => {
      if (this.dataStore.data.frameData) {
        this.spriteStore.frameData = this.dataStore.data.frameData;
      }
      if (this.dataStore.data.animData) {
        this.spriteStore.animData = this.dataStore.data.animData;
      }
      this.spriteStore.buildAnims();
    });
    this.preloader.beacon.observe(this.audioMixer, "audioContextCreated", this.audioMixer.onContextCreated);
    this.preloader.beacon.observe(this.audioMixer, "audioLoaded", this.audioMixer.onAudioLoaded);
    this.preloader.beacon.observe(this.dataStore, "dataLoaded", (source, data, name) => this.dataStore.addData(data, name));
    this.preloader.beacon.observe(this, "completed", this.onPreloaderCompleted);

    this.saveData = new SaveData();
  }

  init() {
    this.preloader.load();
  }

  update(event) {
    this.time = new Date().getTime();
    if (this.lastTime == -1) {
      this.lastTime = this.time;
    }
    this.deltaTime += this.time - this.lastTime;
    this.lastTime = this.time;
    // if we've missed a ton of frames, then the user has navigated away or something, so just skip them
    if (this.deltaTime > this.updateRate * 10) {
      this.deltaTime = 0;
    }
    var scene, i;
    while (this.deltaTime > this.updateRate) {
      for (i = 0; i < this.scenes.length; i++) {
        scene = this.scenes[i];
        if (!scene.paused) {
          scene.update();
        }
      }
      this.deltaTime -= this.updateRate;
    }

    this.renderer.render();

    window.requestAnimationFrame(event => this.update(event));
  }

  onPreloaderCompleted(source) {
    this.preloader.beacon.ignore(this, "completed", this.onPreloaderCompleted);
    this.sceneDirector.addScene(this.firstSceneClass);
    this.update();
  }

  onDisplayResize() {
    // find display size and get ratio
    var widthRatio = window.innerWidth / this.width;
    var heightRatio = window.innerHeight / this.height;
    this.displayRatio = Math.ceil(widthRatio);
    if (this.height * widthRatio > window.innerHeight) {
      this.displayRatio = Math.ceil(heightRatio);
    }
    this.displayOffsetX = Math.round(window.innerWidth - this.width * this.displayRatio) / 2;
    this.displayOffsetY = Math.round(window.innerHeight - this.height * this.displayRatio) / 2;
    const canvas = document.getElementById("canvas");
    if (this.responsive) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    else {
      canvas.width = this.width * this.displayRatio;
      canvas.height = this.height * this.displayRatio;
      // TODO: make sure the fullscreen toggling is correct and unprefix it
      if (!document.webkitFullscreenElement) {
        canvas.style.marginLeft = this.displayOffsetX  + "px";
        canvas.style.marginTop = this.displayOffsetY  + "px";
      }
      else {
        canvas.style.marginLeft = "0px";
        canvas.style.marginTop = "0px";
      }
    }

    this.beacon.emit("displayResized", {
      display: canvas.width > canvas.height ? "landscape" : "portrait",
    });
  }

  get responsiveLeft() {
    return 0 - this.displayOffsetX / this.displayRatio;
  }

  get responsiveRight() {
    return this.width + this.displayOffsetX / this.displayRatio;
  }

  get responsiveTop() {
    return 0 - this.displayOffsetY / this.displayRatio;
  }

  get responsiveBottom() {
    return this.height + this.displayOffsetY / this.displayRatio;
  }

  get responsiveWidth() {
    return this.width + this.displayOffsetX * 2 / this.displayRatio;
  }

  get responsiveHeight() {
    return this.height + this.displayOffsetY * 2 / this.displayRatio;
  }
};
