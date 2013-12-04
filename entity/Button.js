// just a simple reusable button
Plx.Button = function(anim) {
  Plx.Entity.call(this);
  this.anim = anim;

  this.data = {}; // for saving misc stuff associated with the button

  this.physicsComponent = this.addComponent(new Plx.PhysicsComponent());
  this.sprite = this.addComponent(new Plx.Sprite());
  this.tappable = this.addComponent(new Plx.Tappable());

  this.beacon.observe(this, 'addedToScene', this.onAddedToScene);
};

Plx.Button.prototype = Object.create(Plx.Entity.prototype);
Plx.Button.prototype.constructor = Plx.Button;
    
Plx.Button.prototype.onAddedToScene = function(event) {
  this.beacon.ignore(this, 'addedToScene', this.onAddedToScene);
  this.sprite.play(this.anim);
  this.physicsComponent.setWidth(this.sprite.frame.width);
  this.physicsComponent.setHeight(this.sprite.frame.height);
};
