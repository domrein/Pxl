// just a simple reusable entity sprite combo (stupid name though)
Plx.Sprient = function(anim) {
  Plx.Entity.call(this);
  this.anim = anim;

  this.physicsComponent = this.addComponent(new Plx.PhysicsComponent());
  this.sprite = this.addComponent(new Plx.Sprite());

  this.beacon.observe(this, 'addedToScene', this.onAddedToScene);
};

Plx.Sprient.prototype = Object.create(Plx.Entity.prototype);
Plx.Sprient.prototype.constructor = Plx.Sprient;

Plx.Sprient.prototype.onAddedToScene = function(event) {
  this.beacon.ignore(this, 'addedToScene', this.onAddedToScene);
  this.sprite.play(this.anim);
};
