import Beacon from "../core/Beacon.js";

export default class Physics {
  constructor(scene) {
    scene.beacon.observe(this, "actorAdded", this.onActorAdded);
    scene.beacon.observe(this, "actorRemoved", this.onActorRemoved);
    this.bodies = {};
    this.collisionPairs = [];
    this.beacon = new Beacon(this);
  }

  onActorAdded(source, actor) {
    if (actor.body) {
      if (!this.bodies[actor.body.type]) {
        this.bodies[actor.body.type] = [];
      }
      this.bodies[actor.body.type].push(actor.body);
    }
  }

  onActorRemoved(source, actor) {
    if (actor.body) {
      const bodies = this.bodies[actor.body.type];
      if (bodies) {
        for (let i = bodies.length - 1; i >= 0; i--) {
          if (bodies[i] === actor.body) {
            bodies.splice(i, 1);
          }
        }
      }
    }
  }

  update() {
    // update physics
    for (const type of Object.keys(this.bodies)) {
      for (const body of this.bodies[type]) {
        // apply forces
        if (body.friction) {
          body.velocity.x *= body.friction.x;
          body.velocity.y *= body.friction.y;
        }
        if (body.gravity) {
        // if (body.gravity && body.applyGravity) {
          body.velocity.add(body.gravity);
        }

        // cap speed
        // TODO: this needs to go. Most of the time we want to cap speed created by input, but not overall.
        //  Example: player can only run so fast, but could be pushed by an explosion
        // if (body.velocity.m > body.maxSpeed && body.maxSpeed !== -1) {
        //   body.velocity.m = body.maxSpeed;
        // }

        // update position
        body.x += body.velocity.x;
        body.y += body.velocity.y;
      }
    }

    // run collision
    for (const pair of this.collisionPairs) {
      const [leftType, rightType, resolution] = pair;
      const leftBodies = this.bodies[leftType];
      const rightBodies = this.bodies[rightType];
      if (leftBodies && rightBodies) {
        for (let i = 0; i < leftBodies.length; i++) {
          const leftBody = leftBodies[i];
          for (let j = leftBodies === rightBodies ? i + 1 : 0; j < rightBodies.length; j++) {
            const rightBody = rightBodies[j];
            if (leftBody.intersects(rightBody)) {
              leftBody.beacon.emit("collided", rightBody);
              rightBody.beacon.emit("collided", leftBody);
              this.beacon.emit("collided", leftBody, rightBody);

              // find out which type was on left/right/top/bottom
              // look up resolution for collision type
              // apply resolution

              // resolve collision
              if (resolution === "moveOne") {

              }
            }
          }
        }
      }
    }
  }
};
