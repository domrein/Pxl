var calcIntersectTime = function(leftActor, rightActor, topActor, bottomActor) {
  var curActor = leftActor;
  var otherActor = rightActor;
  if (!leftActor) {
    curActor = topActor;
    otherActor = bottomActor;
  }

  var relativeXSpeed, relativeYSpeed, xDist, yDist, xIntersectTime, yIntersectTime = null;
  if (leftActor && rightActor) {
    relativeXSpeed = curActor.speedX - otherActor.speedX;
    xDist = rightActor.rect.loc.x - (leftActor.rect.loc.x + leftActor.rect.width);
    xIntersectTime = Math.abs(xDist / relativeXSpeed);
  }
  if (topActor && bottomActor) {
    relativeYSpeed = curActor.speedY - otherActor.speedY;
    yDist = bottomActor.rect.loc.y - (topActor.rect.loc.y + topActor.rect.height);
    yIntersectTime = Math.abs(yDist / relativeYSpeed);
  }
  if (xIntersectTime && !validateIntersectTime(curActor, otherActor, xIntersectTime))
    xIntersectTime = null;
  if (yIntersectTime && !validateIntersectTime(curActor, otherActor, yIntersectTime))
    yIntersectTime = null;
  // if neither intersect time is valid, that means we started the tick with the actors overlapping
  // HACK: Just set it to 0 for now (It doesn't matter in Hungry Squishy's case)
  if (!xIntersectTime && !yIntersectTime)
    xIntersectTime = 0;

  var intersectTime = null;
  if (xIntersectTime != null)
    intersectTime = xIntersectTime;
  if ((yIntersectTime != null && !xIntersectTime) || (yIntersectTime != null && xIntersectTime != null && yIntersectTime < xIntersectTime)) {
    intersectTime = yIntersectTime;
    leftActor = rightActor = null;
  }
  else
    topActor = bottomActor = null;

  return {intersectTime:intersectTime, yIntersectTime:yIntersectTime, xIntersectTime:xIntersectTime};
};

// this is the same as collide, but < instead of <= so we can validate collision times
var validateIntersectTime = function(actorOne, actorTwo, stepProgress) {
  if (stepProgress < 0)
    blah = 2;
  var colliding = true;
  if (actorOne.rect.loc.x + actorOne.rect.width + actorOne.speedX * stepProgress < actorTwo.rect.loc.x + actorTwo.speedX * stepProgress) // to the left
    colliding = false;
  else if (actorOne.rect.loc.x + actorOne.speedX * stepProgress > actorTwo.rect.loc.x + actorTwo.rect.width + actorTwo.speedX * stepProgress) // to the right
    colliding = false;
  else if (actorOne.rect.loc.y + actorOne.rect.height + actorOne.speedY * stepProgress < actorTwo.rect.loc.y + actorTwo.speedY * stepProgress) // above
    colliding = false;
  else if (actorOne.rect.loc.y + actorOne.speedY * stepProgress > actorTwo.rect.loc.y + actorTwo.rect.height + actorTwo.speedY * stepProgress) // below
    colliding = false;
  
  return colliding;
};

var adjustPendingSpeed = function(speedProp, actorOne, actorTwo) {
  if (actorOne.mass == 0)
    return actorOne[speedProp];
  if (actorTwo.mass == 0)
    return actorTwo[speedProp];
  if (actorOne.mass == -1)
    return;

  var myMassMod = 0.9;
  var otherMassMod = 1.0;
  var actorOneMass = actorOne.mass;
  var actorTwoMass = actorTwo.mass;

  if (actorOneMass == -1)
    actorOneMass = actorTwoMass * 100;
  if (actorTwoMass == -1)
    actorTwoMass = actorOneMass * 100;

  var myMass = actorOneMass * myMassMod;
  var otherMass = actorTwoMass * otherMassMod;
  var mySpeed = actorOne[speedProp] * (1 - actorOne.sponginess);
  var otherSpeed = actorTwo[speedProp] * (1 - actorOne.sponginess);

  var updatedSpeed = ((myMass - otherMass) / (myMass + otherMass)) * mySpeed + ((2 * otherMass) / (myMass + otherMass)) * otherSpeed;
  return updatedSpeed;
};

var calcPostCollisionSpeed = function(actorOne, actorTwo, vertical) {
  if (actorOne.mass == -1 && actorTwo.mass == -1)
    // unmoving actors shouldn't be colliding
    // something is very wrong
    alert("unmoving actors are colliding");
  if (vertical) {
    var pendingYSpeedOne = adjustPendingSpeed("speedY", actorOne, actorTwo);
    var pendingYSpeedTwo = adjustPendingSpeed("speedY", actorTwo, actorOne);
    actorOne.speedY = pendingYSpeedOne;
    actorTwo.speedY = pendingYSpeedTwo;
  }
  else {
    var pendingXSpeedOne = adjustPendingSpeed("speedX", actorOne, actorTwo);
    var pendingXSpeedTwo = adjustPendingSpeed("speedX", actorTwo, actorOne);
    actorOne.speedX = pendingXSpeedOne;
    actorTwo.speedX = pendingXSpeedTwo;
  }

  var friction = (actorOne.friction + actorTwo.friction) / 2;
  actorOne.speedY *= friction;
  actorTwo.speedY *= friction;
  actorOne.speedX *= friction;
  actorTwo.speedX *= friction;

  if (actorOne.mass == -1) {
    actorOne.speedX = 0;
    actorOne.speedY = 0;
  }
  if (actorTwo.mass == -1) {
    actorTwo.speedX = 0;
    actorTwo.speedY = 0;
  }
};

// TODO: make them repel in stead of just setting one outside the other based on mass
// just assume you move the one with non negative mass for now
var separateActors = function(actorOne, actorTwo, vertical) {
  if (actorOne.mass == 0 || actorTwo.mass == 0)
    return;
  if (vertical) {
    if (actorOne.mass != -1) // move actorOne above actorTwo
      actorOne.rect.loc.y = actorTwo.rect.loc.y - actorOne.rect.height;
    if (actorTwo.mass != -1) // move actorTwo below actorOne
      actorTwo.rect.loc.y = actorOne.rect.loc.y + actorOne.rect.height;
  }
  else {
    if (actorOne.mass != -1) // move actorOne to the left of actorTwo
      actorOne.rect.loc.x = actorTwo.rect.loc.x - actorOne.rect.width;
    if (actorTwo.mass != -1) // move actorTwo to the right of actorOne
      actorTwo.rect.loc.x = actorOne.rect.loc.x + actorOne.rect.width;
  }
};

Plx.Physics = function() {
  Plx.System.call(this);
  this.componentTypes = [Plx.PhysicsComponent];
  this.collisionPairs = [];
  this.physicsComponents = {};
  this.physicsComponents["none"] = [];
  this.beacon.observe(this, "addedToScene", this.onAddedToScene);
};

Plx.Physics.prototype = Object.create(Plx.System.prototype);
Plx.Physics.prototype.constructor = Plx.Physics;

Plx.Physics.prototype.onAddedToScene = function(event) {
  this.scene.beacon.observe(this, "updated", this.onSceneUpdated, 1);
};

Plx.Physics.prototype.addComponent = function(component) {
  if (!this.physicsComponents[component.collisionType])
    throw new Error("Collion Type " + component.collisionType + ") not registered.");
  this.physicsComponents[component.collisionType].push(component);
  // console.log "entityId: //{event.data['entity'].id} component added"
};

Plx.Physics.prototype.removeComponent = function(component) {
  for (var j = this.physicsComponents[component.collisionType].length - 1; j >= 0; j --) {
    var otherComponent = this.physicsComponents[component.collisionType][j];
    if (otherComponent == component)
      this.physicsComponents[component.collisionType].splice(j, 1);
  }
};

Plx.Physics.prototype.updatePhysicsSpeeds = function(componentList) {
  for (var i = 0; i < componentList.length; i++) {
    var component = componentList[i];
    // TODO: make sure this is how we actually want to do gravity (I just threw it in here real quick)
    component.speedY += component.gravity;
    // apply friction
    if (component.friction != 1.0) {
      component.speedX *= component.friction;
      component.speedY *= component.friction;
    }

    // cap speed
    if (component.capSpeed) {
      // TODO: just have speedMax instead of x/y max
      if (component.speedX > component.speedXMax)
        component.speedX = component.speedXMax;
      if (component.speedX < -component.speedXMax)
        component.speedX = -component.speedXMax;
      if (component.speedY > component.speedYMax)
        component.speedY = component.speedYMax;
      if (component.speedY < -component.speedYMax)
        component.speedY = -component.speedYMax;
    }

    component.pendingMove.x = component.speedX;
    component.pendingMove.y = component.speedY;
    component.nextRect.loc.x = component.rect.loc.x + component.speedX;
    component.nextRect.loc.y = component.rect.loc.y + component.speedY;
    component.beacon.emit("speedUpdated", null);
  }
};

Plx.Physics.prototype.updatePhysicsLocations = function(componentList) {
  for (var i = 0; i < componentList.length; i++) {
    var component = componentList[i];
    component.lastRect.loc.x = component.rect.loc.x;
    component.lastRect.loc.y = component.rect.loc.y;
    component.rect.loc.x += component.pendingMove.x;
    component.rect.loc.y += component.pendingMove.y;
    component.beacon.emit("updated", null);
  }
};

Plx.Physics.prototype.calcCollisionData = function(actorOne, actorTwo) {
  var collisionPair = null;
  if (actorOne.nextRect.intersects(actorTwo.nextRect)) {
    // determine top/left actors
    var tempLeft = actorOne;
    var tempRight = actorTwo;
    if (actorTwo.rect.loc.x < actorOne.rect.loc.x) {
      tempLeft = actorTwo;
      tempRight = actorOne;
    }
    var tempTop = actorOne;
    var tempBottom = actorTwo;
    if (actorTwo.rect.loc.y < actorOne.rect.loc.y) {
      tempTop = actorTwo;
      tempBottom = actorOne;
    }

    var tempXDist = tempRight.rect.loc.x - (tempLeft.rect.loc.x + tempLeft.rect.width);
    var tempYDist = tempBottom.rect.loc.y - (tempTop.rect.loc.y + tempTop.rect.height);

    var leftActor, rightActor, topActor, bottomActor = null;
    leftActor = tempLeft;
    rightActor = tempRight;
    topActor = tempTop;
    bottomActor = tempBottom;

    // TODO: do we really need this?
    // if tempXDist >= 0
    //   // component on left
    //   leftActor = tempLeft
    //   rightActor = tempRight
    // if tempYDist >= 0
    //   // component on bottom
    //   topActor = tempTop
    //   bottomActor = tempBottom

    // find out when they collided
    var intersectData = calcIntersectTime(leftActor, rightActor, topActor, bottomActor);
    if (intersectData.xIntersectTime == null)
      leftActor = rightActor = null;
    else
      topActor = bottomActor = null;
    // if !leftActor && !rightActor && !topActor && !bottomActor
    //   // alert('all actors null in collision')
    //   blah = 2
    
    // HACK: if we've nulled out all actors, just use left && right (this is for squishy to hold the key)
    if (!leftActor && !rightActor && !topActor && !bottomActor) {
      leftActor = tempLeft;
      rightActor = tempRight;
    }

    collisionPair = {
      leftActor:leftActor,
      rightActor:rightActor,
      topActor:topActor,
      bottomActor:bottomActor,
      intersectTime:intersectData.intersectTime,
      vertical:(topActor && bottomActor) ? true : false
    };
  }
  return collisionPair;
};

Plx.Physics.prototype.findComponentCollisionPairs = function(component, intersectTimeOffset) {
  var collisionPairs = [];
  for (var i = 0; i < this.collisionPairs.length; i++) {
    var pair = this.collisionPairs[i];
    var collideeType = null;
    if (pair.typeOne == component.collisionType)
      collideeType = pair.typeOne;
    if (pair.typeTwo == component.collisionType)
      collideeType = pair.typeTwo;
    if (collideeType) {
      var collideeList = this.physicsComponents[collideeType];
      for (var j = 0; j < collideeList.length; j++) {
        var otherComponent = collideeList[j];
        var collisionPair = this.calcCollisionData(component, otherComponent);
        if (collisionPair) {
          collisionPair.intersectTime += intersectTimeOffset;
          collisionPairs.push(collisionPair);
        }
      }
    }
  }

  return collisionPairs;
};

Plx.Physics.prototype.findAllCollisionPairs = function(sort) {
  var collisionPairs = [];
  // collide components
  for (var i = 0; i < this.collisionPairs.length; i++) {
    var pair = this.collisionPairs[i];
    var listOneType = pair.typeOne;
    var listTwoType = pair.typeTwo;
    var listOne = this.physicsComponents[listOneType];
    var listTwo = this.physicsComponents[listTwoType];
    for (var j = 0; j < listOne.length; j++) {
      var component = listOne[j];
      if (!component.collisionEnabled)
        continue;
      var start = 0;
      if (listOneType == listTwoType)
        start = j + 1;
      for (var k = start; k < listTwo.length; k++) {
        var otherComponent = listTwo[k];
        if (!otherComponent.collisionEnabled)
          continue;
        var collisionPair = this.calcCollisionData(component, otherComponent);
        if (collisionPair)
          collisionPairs.push(collisionPair);
      }
    }
      // if we're looping over the same list, then don't hit the same items
  }
  if (sort) {
    // sort collision pairs based on time
    collisionPairs.sort(function(a, b) {
      return a.intersectTime - b.intersectTime;
    });
  }
  return collisionPairs;
};

Plx.Physics.prototype.resolveCollisionPairs = function(collisionPairs) {
  // TODO: look for collisionPairs happening at the same time with the same actor. Check for blockers before resolving
  // resolve pairs in order
  // when a pair is resolved, update nextRect, then pull out all pairs involving this actors, then reclac them && reinsert into list
  // for collisionPair in collisionPairs
  //   if collisionPair.actorOne instanceof SpikeyGround || collisionPair.actorTwo instanceof SpikeyGround
  //     poo = true
  while (collisionPairs.length) {
    var collisionPair = collisionPairs.shift();
    var component, otherComponent, componentSpeed, otherComponentSpeed;
    if (collisionPair.leftActor) {
      component = collisionPair.leftActor;
      otherComponent = collisionPair.rightActor;
      componentSpeed = component.speedX;
      otherComponentSpeed = otherComponent.speedX;
    }
    else if (collisionPair.topActor) {
      component = collisionPair.topActor;
      otherComponent = collisionPair.bottomActor;
      componentSpeed = component.speedY;
      otherComponentSpeed = otherComponent.speedY;
    }
    if (!component.resolutionEnabled || !otherComponent.resolutionEnabled) {
      component.beacon.emit("collided", {physicsComponent:otherComponent, type:otherComponent.collisionType, colliderDirection:(collisionPair.vertical) ? "down" : "right"});
      otherComponent.beacon.emit("collided", {physicsComponent:component, type:component.collisionType, colliderDirection:(collisionPair.vertical) ? "up" : "left"});

      continue;
    }

    // move actors up to point of collision
    component.rect.loc.x += component.speedX * collisionPair.intersectTime;
    component.rect.loc.y += component.speedY * collisionPair.intersectTime;
    otherComponent.rect.loc.x += otherComponent.speedX * collisionPair.intersectTime;
    otherComponent.rect.loc.y += otherComponent.speedY * collisionPair.intersectTime;
    
    // calc post collision speed
    calcPostCollisionSpeed(component, otherComponent, collisionPair.vertical);

    // update pending move
    component.pendingMove.x = component.speedX * (1 - collisionPair.intersectTime);
    component.pendingMove.y = component.speedY * (1 - collisionPair.intersectTime);
    otherComponent.pendingMove.x = otherComponent.speedX * (1 - collisionPair.intersectTime);
    otherComponent.pendingMove.y = otherComponent.speedY * (1 - collisionPair.intersectTime);

    // calc nextRect
    component.nextRect.loc.x = component.rect.loc.x + component.pendingMove.x;
    component.nextRect.loc.y = component.rect.loc.y + component.pendingMove.y;
    otherComponent.nextRect.loc.x = otherComponent.rect.loc.x + otherComponent.pendingMove.x;
    otherComponent.nextRect.loc.y = otherComponent.rect.loc.y + otherComponent.pendingMove.y;

    // emit events for collision
    if (component.sponginess == 1 && otherComponent.sponginess == 1)
      var blah = 1;
    component.beacon.emit("collided", {physicsComponent:otherComponent, type:otherComponent.collisionType, colliderDirection:(collisionPair.vertical) ? "down" : "right"});
    otherComponent.beacon.emit("collided", {physicsComponent:component, type:component.collisionType, colliderDirection:(collisionPair.vertical) ? "up" : "left"});

    // got through pairs && remove affected actors
    for (var i = collisionPairs.length - 1; i >= 0; i--) {
      var colPair = collisionPairs[i];
      var killPair = false;
      if (colPair.leftActor == component || colPair.rightActor == component || colPair.topActor == component || colPair.bottomActor == component)
        killPair = true;
      if (colPair.leftActor == otherComponent || colPair.rightActor == otherComponent || colPair.topActor == otherComponent || colPair.bottomActor == otherComponent)
        killPair = true;
      if (killPair)
        collisionPairs.splice(i ,1);
    }

    // recheck affected actors
    // NOTE: when we check like this we're going to be checking component against otherComponent && vice versa. So if somehow they collide again then we'll have a dup collision
    collisionPairs.concat(this.findComponentCollisionPairs(component, collisionPair.intersectTime));
    collisionPairs.concat(this.findComponentCollisionPairs(otherComponent, collisionPair.intersectTime));
    collisionPairs.sort(function(a, b) {
      return a.intersectTime - b.intersectTime;
    });
  }
};

Plx.Physics.prototype.onSceneUpdated = function(event) {
  // update location
  var key;
  for (key in this.physicsComponents)
    this.updatePhysicsSpeeds(this.physicsComponents[key]);
  
  var collisionPairs = this.findAllCollisionPairs(true);
  // this.removeCollisionPairDups collisionPairs
  this.resolveCollisionPairs(collisionPairs);

  for (key in this.physicsComponents)
    this.updatePhysicsLocations(this.physicsComponents[key]);
};

Plx.Physics.prototype.addCollisionPair = function(typeOne, typeTwo) {
  var pairFound = false;
  for (var i = 0; i < this.collisionPairs.length; i++) {
    var pair = this.collisionPairs[i];
    if ((pair.typeOne == typeOne && pair.typeTwo == typeTwo) || (pair.typeOne == typeTwo && pair.typeTwo == typeOne)) {
      console.log("Collision pair already added to physics system (typeOne: //{typeOne}, typeTwo: //{typeTwo})");
      pairFound = true;
    }
  }
  if (!pairFound) {
    this.collisionPairs.push(new Plx.CollisionPair(typeOne, typeTwo));

    if (!this.physicsComponents.hasOwnProperty(typeOne))
      this.physicsComponents[typeOne] = [];
    if (!this.physicsComponents.hasOwnProperty(typeTwo))
      this.physicsComponents[typeTwo] = [];
  }
};

Plx.Physics.prototype.destroy = function() {
  this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded);
  this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved);
  this.scene.beacon.ignore(this, "updated", this.onSceneUpdated, 1);
};

Plx.CollisionPair = function(typeOne, typeTwo) {
  this.typeOne = typeOne;
  this.typeTwo = typeTwo;
};
