import Beacon from "./Beacon.js";
import InputRelay from "./InputRelay.js";
import SpriteStore from "./SpriteStore.js";
import AudioMixer from "./AudioMixer.js";
import DataStore from "./DataStore.js";
import SaveData from "./SaveData.js";
import SceneDirector from "../scene/SceneDirector.js";
import Preloader from "../scene/Preloader.js";

export default class Game {
  constructor(width, height, firstSceneClass, rendererClass, canvasId) {
    this.width = width;
    this.height = height;
    this.canvasId = canvasId;

    this.renderer = new rendererClass(this, this.canvasId);
    this.displayRatio = 1;
    this.beacon = new Beacon(this);

    this.inputRelay = new InputRelay(this);

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
    this.saveData = new SaveData();

    this.preloader = this.sceneDirector.addScene(Preloader, {});
    this.preloader.nextScene = firstSceneClass;
    this.preloader.spriteStore = this.spriteStore;
    this.preloader.audioMixer = this.audioMixer;
    this.preloader.dataStore = this.dataStore;

  }

  init() {
    this.preloader.load();
    this.update();
  }

  update(event) {
    this.time = new Date().getTime();
    if (this.lastTime === -1) {
      this.lastTime = this.time;
    }
    // this.deltaTime += this.time - this.lastTime;
    this.deltaTime = this.time - this.lastTime;

    this.lastTime = this.time;
    // if we've missed a ton of frames, then the user has navigated away or something, so just skip them
    if (this.deltaTime > this.updateRate * 10) {
      this.deltaTime = 0;
    }
    var scene, i;
    // while (this.deltaTime > this.updateRate) {
      for (i = 0; i < this.scenes.length; i++) {

        scene = this.scenes[i];
        if (!scene.paused) {
          scene.update(this.deltaTime / 1000);
        }
      }
      // this.deltaTime -= this.updateRate;
    // }

    this.renderer.render();

    window.requestAnimationFrame(event => this.update(event));
  }

  onDisplayResize() {
    console.log(document.getElementById(this.canvasId));
    const canvas = document.getElementById(this.canvasId);
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    // find display size and get ratio
    // var widthRatio = window.innerWidth / this.width;
    // var heightRatio = window.innerHeight / this.height;
    // this.displayRatio = widthRatio;
    // if (this.height * widthRatio > window.innerHeight) {
    //   this.displayRatio = heightRatio;
    // }
    // this.displayOffsetX = Math.round(window.innerWidth - this.width * this.displayRatio) / 2;
    // this.displayOffsetY = Math.round(window.innerHeight - this.height * this.displayRatio) / 2;
    //
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
    //
    this.beacon.emit("displayResized", null);
  }
};
