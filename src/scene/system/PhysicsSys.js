Pxl.PhysicsSys = function() {
  Pxl.System.call(this);
  this.componentTypes = [Pxl.PhysicsCom];
  this.collisionPairs = [];
  this.types = {};
  this.types["none"] = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
};

Pxl.PhysicsSys.prototype = Object.create(Pxl.System.prototype);
Pxl.PhysicsSys.prototype.constructor = Pxl.Physics;

Pxl.PhysicsSys.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "updated", this.onSceneUpdated, 1);
};

Pxl.PhysicsSys.prototype.addComponent = function(component) {
  if (!this.types[component.collisionType])
    throw new Error("Collion Type " + component.collisionType + ") not registered.");
  this.types[component.collisionType].push(component);
  // console.log "entityId: //{event.data['entity'].id} component added"
};

Pxl.PhysicsSys.prototype.removeComponent = function(component) {
  for (var j = this.types[component.collisionType].length - 1; j >= 0; j --) {
    var otherComponent = this.types[component.collisionType][j];
    if (otherComponent == component)
      this.types[component.collisionType].splice(j, 1);
  }
};

Pxl.PhysicsSys.prototype.onSceneUpdated = function(event) {
  // add speeds that were set the frame before
  // update speeds based on this frame's logic

  // loop over all the components
  for (var type in this.types) {

  }
};
