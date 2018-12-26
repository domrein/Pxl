import Beacon from "../core/Beacon.js";
import Actor from "../actor/Actor.js";
import Body from "../actor/Body.js";
import Scene from "../scene/Scene.js";

export default class Physics {
  /**
  * @param scene {Scene}
  */
  constructor(scene) {
    scene.beacon.observe(this, "actorAdded", this.onActorAdded);
    scene.beacon.observe(this, "actorRemoved", this.onActorRemoved);

    // TODO: figure out why this isn't working
    /** @type {Map<string, string>} */
    this.bodies = new Map();

    /** @type {Array<Array<string>>} */
    this.collisionPairs = [];

    this.beacon = new Beacon(this);
  }

  /**
  * @param {Beacon} source
  * @param {Actor} actor
  */
  onActorAdded(source, actor) {
    if (actor.body) {
      if (!this.bodies.has(actor.body.type)) {
        this.bodies.set(actor.body.type, []);
      }
      this.bodies.get(actor.body.type).push(actor.body);
    }
  }

  /**
  * @param {Beacon} source
  * @param {Actor} actor
  */
  onActorRemoved(source, actor) {
    if (actor.body) {
      const bodies = this.bodies.get(actor.body.type);
      if (bodies) {
        for (let i = bodies.length - 1; i >= 0; i--) {
          if (bodies[i] === actor.body) {
            bodies.splice(i, 1);
          }
        }
      }
    }
  }

  /**
  * @param {number} delta
  */
  update(delta) {
    // update physics
    for (const [type, bodies] of this.bodies.entries()) {
      for (const body of bodies) {
        // apply forces
        if (body.friction && body.friction.m) {
          body.velocity.x *= body.friction.x;
          body.velocity.y *= body.friction.y;
        }
        if (body.gravity && body.gravity.m) {
        // if (body.gravity && body.applyGravity) {
          body.velocity.add(Vector.multiply(body.gravity, delta));
        }

        // cap speed
        // TODO: this needs to go. Most of the time we want to cap speed created by input, but not overall.
        //  Example: player can only run so fast, but could be pushed by an explosion
        // if (body.velocity.m > body.maxSpeed && body.maxSpeed !== -1) {
        //   body.velocity.m = body.maxSpeed;
        // }

        // update position
        body.x += body.velocity.x * delta;
        body.y += body.velocity.y * delta;
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
            if (!leftBody.disabled && !rightBody.disabled && leftBody.intersects(rightBody)) {
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
