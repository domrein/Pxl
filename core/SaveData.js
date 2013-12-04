// a wrapper around local storage for persisting game data
Plx.SaveData = function() {
  if (!window.localStorage.gameData)
    window.localStorage.gameData = "{}";
  try {
    this.storage = JSON.parse(window.localStorage.gameData);
  }
  catch (error) {
    console.log("Couldn't parse window.localStorage.gameData. Clearing data.");
    this.storage = {};
  }
  if (!this.storage['playCount'])
    this.storage['playCount'] = 1;
  else
    this.storage['playCount']++;
  this.flush();
};

Plx.SaveData.prototype.isFirstPlay = function() {
  return this.storage['playCount'] == 1;
};

Plx.SaveData.prototype.hasSeenTutorial = function() {
  if (!this.storage['hasSeenTutorial'])
    this.storage['hasSeenTutorial'] = false;
  
  return this.storage['hasSeenTutorial'];
};

Plx.SaveData.prototype.tutorialSeen = function() {
  this.storage['hasSeenTutorial'] = true;
  this.flush();
};

Plx.SaveData.prototype.isLevelLocked = function(level) {
  if (!this.storage['levels'])
    this.storage['levels'] = {};
  if (!this.storage['levels'][level])
    this.storage['levels'][level] = {locked:true, highScore:-1};

  return this.storage['levels'][level]['locked']
};

Plx.SaveData.prototype.unlockLevel = function(level) {
  if (!this.storage['levels'])
    this.storage['levels'] = {};
  if (!this.storage['levels'][level])
    this.storage['levels'][level] = {locked:true, highScore:-1};
  this.storage['levels'][level]['locked'] = false;
  this.flush();
};

Plx.SaveData.prototype.numUnlockedLevels = function() {
  var unlockedCount = 0;
  for (var level in this.storage['levels']) {
    if (!this.storage['levels'][level]['locked'])
      unlockedCount++;
  }
  return unlockedCount;
};

Plx.SaveData.prototype.clearData = function() {
  this.storage = {};
  this.flush();
};

Plx.SaveData.prototype.flush = function() {
  window.localStorage.gameData = JSON.stringify(this.storage);
};
