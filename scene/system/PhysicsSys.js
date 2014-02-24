Plx.PhysicsSys = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.PhysicsCom];
  this.collisionPairs = [];
  this.types = {};
  this.types["none"] = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
};

Plx.PhysicsSys.prototype = Object.create(Plx.System.prototype);
Plx.PhysicsSys.prototype.constructor = Plx.Physics;

Plx.PhysicsSys.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "updated", this.onSceneUpdated, 1);
};

Plx.PhysicsSys.prototype.addComponent = function(component) {
  if (!this.types[component.collisionType])
    throw new Error("Collion Type " + component.collisionType + ") not registered.");
  this.types[component.collisionType].push(component);
  // console.log "entityId: //{event.data['entity'].id} component added"
};

Plx.PhysicsSys.prototype.removeComponent = function(component) {
  for (var j = this.types[component.collisionType].length - 1; j >= 0; j --) {
    var otherComponent = this.types[component.collisionType][j];
    if (otherComponent == component)
      this.types[component.collisionType].splice(j, 1);
  }
};

Plx.PhysicsSys.prototype.onSceneUpdated = function(event) {
  // add speeds that were set the frame before
  // update speeds based on this frame's logic

  // loop over all the components
  for (var type in this.types) {

  }
};
