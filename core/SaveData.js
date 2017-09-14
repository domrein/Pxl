"use strict";

// a wrapper around local storage for persisting game data
export default class SaveData {
  constructor() {
    if (!window.localStorage.gameData)
      window.localStorage.gameData = "{}";
    try {
      this.storage = JSON.parse(window.localStorage.gameData);
    }
    catch (error) {
      console.log("Couldn't parse window.localStorage.gameData. Clearing data.");
      this.storage = {};
    }
    if (!this.storage["playCount"]) {
      this.storage["playCount"] = 1;
    }
    else {
      this.storage["playCount"]++;
    }
    this.flush();
  }

  isFirstPlay() {
    return this.storage["playCount"] == 1;
  }

  hasSeenTutorial() {
    if (!this.storage["hasSeenTutorial"]) {
      this.storage["hasSeenTutorial"] = false;
    }

    return this.storage["hasSeenTutorial"];
  }

  tutorialSeen() {
    this.storage["hasSeenTutorial"] = true;
    this.flush();
  }

  isLevelLocked(level) {
    if (!this.storage["levels"]) {
      this.storage["levels"] = {};
    }
    if (!this.storage["levels"][level]) {
      this.storage["levels"][level] = {locked:true, highScore:-1};
    }

    return this.storage["levels"][level]["locked"];
  }

  unlockLevel(level) {
    if (!this.storage["levels"]) {
      this.storage["levels"] = {};
    }
    if (!this.storage["levels"][level]) {
      this.storage["levels"][level] = {locked:true, highScore:-1};
    }
    this.storage["levels"][level]["locked"] = false;
    this.flush();
  }

  numUnlockedLevels() {
    var unlockedCount = 0;
    for (var level in this.storage["levels"]) {
      if (!this.storage["levels"][level]["locked"]) {
        unlockedCount++;
      }
    }
    return unlockedCount;
  }

  clearData() {
    this.storage = {};
    this.flush();
  }

  flush() {
    window.localStorage.gameData = JSON.stringify(this.storage);
  }
};
