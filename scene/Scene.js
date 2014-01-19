Plx.Scene = function() {
  this.paused = false;
  this.beacon = new Plx.Beacon(this);
  this.entities = [];
  this.systems = [];
  this.game = null;
};

Plx.Scene.prototype.init = function(handoffData) {
};

Plx.Scene.prototype.update = function() {
  var entity, i;
  // update all entities
  for (i = 0; i < this.entities.length; i ++) {
    entity = this.entities[i];
    entity.update();
  }
  
  // remove dead entities
  for (i = this.entities.length - 1; i >= 0; i --) {
    entity = this.entities[i];
    if (!entity.alive) {
      this.removeEntity(entity);
      this.entities.splice(i, 1);
      this.game.entityFactory.returnEntity(entity);
    }
  }

  this.beacon.emit("updated", null);
  // systems should do any cleanup at this point. They should not interact further.
  this.beacon.emit("updateCompleted", null);
};

Plx.Scene.prototype.render = function(frameProgress) {
  this.beacon.emit("rendered", {frameProgress:frameProgress});
  this.beacon.emit("renderCompleted", {frameProgress:frameProgress});
};

Plx.Scene.prototype.addSystem = function(system) {
  system.scene = this;
  this.systems.push(system);
  system.beacon.emit("addedToScene", {});

  return system;
};

Plx.Scene.prototype.fetchSystem = function(systemClass) {
  for (var i = 0; i < this.systems.length; i ++) {
    var system = this.systems[i];
    if (system instanceof systemClass)
      return system;
  }

  return null;
};

// a convenience function to create an entity and add it to the scene
Plx.Scene.prototype.makeEntity = function(type, defaultOverrides) {
  return this.addEntity(this.game.entityFactory.createType(type, defaultOverrides));
};

Plx.Scene.prototype.addEntity = function(entity) {
  entity.scene = this;
  this.entities.push(entity);
  this.beacon.emit("entityAdded", {entity:entity});
  entity.beacon.emit("addedToScene", {});

  return entity;
};

Plx.Scene.prototype.removeEntity = function(entity) {
  entity.beacon.emit("removedFromScene", null);
  this.beacon.emit("entityRemoved", {entity:entity});
};

Plx.Scene.prototype.switchScene = function(sceneClass, transition, handoffData) {
  this.beacon.emit("completed", {sceneClass:sceneClass, transition:transition, handoffData:handoffData});
  this.paused = true;
};

Plx.Scene.prototype.destroy = function() {
  var i;
  for (i = 0; i < this.entities.length; i ++) {
    var entity = this.entities[i];
    this.game.entityFactory.returnEntity(entity);
  }
  for (i = 0; i < this.systems.length; i ++) {
    var system = this.systems[i];
    system.destroy();
  }
  this.beacon.destroy();
};
