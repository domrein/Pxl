var onLoad = function(event) {
  // create game object
  var game = new Plx.Game(320, 420, PlayScene);

  // declare images to preload
  game.preloader.addImage("Graphics.png");

  // declare frames contained within images
  game.spriteStore.addFrame(0, 0, 3, 5, "Graphics.png", "Player_1");
  game.spriteStore.addFrame(3, 2, 1, 3, "Graphics.png", "Bullet_1");
  game.spriteStore.addFrame(4, 0, 5, 5, "Graphics.png", "Enemy_1");

  // declare animations
  game.spriteStore.addAnim(["Player_1"], true, "Player", 1);
  game.spriteStore.addAnim(["Bullet_1"], true, "Bullet", 1);
  game.spriteStore.addAnim(["Enemy_1"], true, "Enemy", 1);

  // declare entities
  var scaleFactor = 3;
  game.entityFactory.registerType("Player", [
    {name: "sprite", type: Plx.Sprite, params: {animName: "Player", autoSizePhysics: true, scaleX: scaleFactor, scaleY: scaleFactor}},
    {name: "physics", type: Plx.PhysicsComponent, params: {collisionType: "player"}},
  ]);

  game.entityFactory.registerType("Bullet", [
    {name: "sprite", type: Plx.Sprite, params: {animName: "Bullet", autoSizePhysics: true, scaleX: scaleFactor, scaleY: scaleFactor}},
    {name: "physics", type: Plx.PhysicsComponent, params: {speedY: 3, collisionType: "player"}},
  ]);

  game.entityFactory.registerType("Enemy", [
    {name: "sprite", type: Plx.Sprite, params: {animName: "Enemy", autoSizePhysics: true, scaleX: scaleFactor, scaleY: scaleFactor}},
    {name: "physics", type: Plx.PhysicsComponent, params: {speedY: 3, collisionType: "enemy"}},
  ]);

  // start the game
  game.init();
};

// {"colors":["929292","6d6d6d","6df7ff","b6fbff","494949","b6b6b6","f4ec79","7cf093","3ae95d","0f8326","ffdb24","ffe76d","ff24ce"],"width":20,"pixels":[-1,-1,1,1,1,-1,-1,-1,7,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,-1,0,0,0,-1,4,-1,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,0,0,0,0,0,4,-1,8,8,-1,-1,-1,-1,12,12,12,12,12,-1,4,0,2,3,3,0,4,-1,-1,-1,-1,-1,-1,12,12,12,12,12,12,12,4,0,2,2,3,0,4,-1,10,10,10,-1,-1,12,12,-1,12,-1,12,12,-1,0,2,2,2,0,-1,-1,10,11,10,-1,-1,12,12,12,12,12,12,12,-1,0,0,1,0,0,-1,-1,10,10,10,-1,-1,-1,12,12,12,12,12,-1,0,0,0,1,0,0,0,-1,-1,-1,-1,-1,-1,12,12,-1,12,-1,12,12,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,1,0,1,1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]}