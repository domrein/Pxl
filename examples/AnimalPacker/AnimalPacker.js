var onResize = null;
var onLoad = function(event) {
  // create game object
  var game = new Plx.Game(320, 420, PlayScene);

  onResize = function(event) { game.onDisplayResize(); };

  // declare images to preload
  game.preloader.addImage("Graphics.png");

  // declare frames contained within images
  game.spriteStore.addFrame(0, 0, 16, 8, "Graphics.png", "Turtle_1");
  game.spriteStore.addFrame(16, 0, 8, 8, "Graphics.png", "Bee_1");
  game.spriteStore.addFrame(0, 8, 24, 8, "Graphics.png", "Snake_1");
  game.spriteStore.addFrame(0, 16, 24, 16, "Graphics.png", "Elephant_1");
  game.spriteStore.addFrame(24, 0, 8, 7, "Graphics.png", "Egg_1");
  game.spriteStore.addFrame(32, 0, 40, 40, "Graphics.png", "Grid_1");

  // declare animations
  game.spriteStore.addAnim(["Turtle_1"], false, "Turtle", 1);
  game.spriteStore.addAnim(["Bee_1"], false, "Bee", 1);
  game.spriteStore.addAnim(["Snake_1"], false, "Snake", 1);
  game.spriteStore.addAnim(["Elephant_1"], false, "Elephant", 1);
  game.spriteStore.addAnim(["Egg_1"], false, "Egg", 1);
  game.spriteStore.addAnim(["Grid_1"], false, "Grid", 1);

  var scaleFactor = 7;
  game.entityFactory.registerType("Snake", [
    {name: "sprite", type: Plx.Sprite, params: {animName: "Egg", autoSizePhysics: true, scaleX: scaleFactor, scaleY: scaleFactor, z: 5}},
    {name: "physics", type: Plx.PhysicsComponent, params: {collisionType: "animal"}},
    {name: "pointerable", type: Plx.Pointerable, params: {draggable: true}},
  ]);

  // start the game
  game.init();
};
