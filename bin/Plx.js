"use strict";

var lastTime = 0;

window.requestAnimationFrame || [ "webkit", "moz" ].forEach(function(vendor) {
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
}), window.requestAnimationFrame || (window.requestAnimationFrame = function(callback) {
    var currTime = new Date().getTime(), timeToCall = Math.max(0, 16 - (currTime - lastTime)), id = window.setTimeout(function() {
        callback(currTime + timeToCall);
    }, timeToCall);
    return lastTime = currTime + timeToCall, id;
});

var Plx = {};

Plx.Game = function(width, height, firstSceneClass) {
    this.beacon = new Plx.Beacon(this), this.width = width, this.height = height, this.onDisplayResize(), 
    this.firstSceneClass = firstSceneClass, this.sceneDirector = new Plx.SceneDirector(), 
    this.scenes = [], this.lastTime = -1, this.updateRate = 1e3 / 60, this.deltaTime = 0, 
    this.preloader = new Plx.Preloader(), this.preloader.beacon.observe(this, "imageLoaded", this.onImageLoaded), 
    this.preloader.beacon.observe(this, "completed", this.onPreloaderCompleted), this.spriteStore = new Plx.SpriteStore(), 
    this.saveData = new Plx.SaveData(), this.entityFactory = new Plx.EntityFactory(this), 
    this.entityFactory.registerType("PlxButton", [ {
        type: Plx.PhysicsComponent,
        name: "physics",
        params: {}
    }, {
        type: Plx.Sprite,
        name: "sprite",
        params: {
            autoSizePhysics: !0
        }
    }, {
        type: Plx.Pointerable,
        name: "pointerable",
        params: {}
    }, {
        type: Plx.Data,
        name: "data",
        params: {}
    } ]), this.entityFactory.registerType("PlxSprient", [ {
        type: Plx.PhysicsComponent,
        name: "physics",
        params: {}
    }, {
        type: Plx.Sprite,
        name: "sprite",
        params: {}
    } ]);
}, Plx.Game.prototype.init = function() {
    this.preloader.load();
}, Plx.Game.prototype.update = function() {
    var time = new Date().getTime();
    -1 == this.lastTime && (this.lastTime = time), this.deltaTime += time - this.lastTime, 
    this.lastTime = time, this.deltaTime > 10 * this.updateRate && (this.deltaTime = 0);
    for (var scene, i; this.deltaTime > this.updateRate; ) {
        for (i = 0; i < this.scenes.length; i++) scene = this.scenes[i], scene.paused || scene.update();
        this.deltaTime -= this.updateRate;
    }
    for (i = 0; i < this.scenes.length; i++) scene = this.scenes[i], scene.render(this.deltaTime / this.updateRate);
    var _this = this;
    window.requestAnimationFrame(function(event) {
        _this.update(event);
    });
}, Plx.Game.prototype.addScene = function(sceneClass, handoffData) {
    var scene = new sceneClass();
    scene.game = this, scene.init(handoffData), scene.beacon.observe(this, "completed", this.onSceneCompleted), 
    this.scenes.push(scene), scene.beacon.emit("added", null);
}, Plx.Game.prototype.onSceneCompleted = function(event) {
    event.beacon.ignore(this, "completed", this.onSceneCompleted);
    for (var scene, i = this.scenes.length - 1; i >= 0; i--) scene = this.scenes[i], 
    event.beacon.owner == scene && this.scenes.splice(i, 1);
    event.beacon.owner.destroy(), this.addScene(event.data.sceneClass, event.data.handoffData);
}, Plx.Game.prototype.onPreloaderCompleted = function() {
    this.preloader.beacon.ignore(this, "completed", this.onPreloaderCompleted), this.addScene(this.firstSceneClass), 
    this.update();
}, Plx.Game.prototype.onImageLoaded = function(event) {
    this.spriteStore.addImage(event.data.image, event.data.path);
}, Plx.Game.prototype.onDisplayResize = function() {
    var widthRatio = window.innerWidth / this.width, heightRatio = window.innerHeight / this.height;
    this.displayRatio = widthRatio, this.height * widthRatio > window.innerHeight && (this.displayRatio = heightRatio), 
    this.displayOffsetX = Math.round(window.innerWidth - this.width * this.displayRatio) / 2, 
    this.displayOffsetY = Math.round(window.innerHeight - this.height * this.displayRatio) / 2, 
    document.getElementById("canvas").width = this.width * this.displayRatio, document.getElementById("canvas").height = this.height * this.displayRatio, 
    document.getElementById("canvas").style.marginLeft = this.displayOffsetX + "px", 
    document.getElementById("canvas").style.marginTop = this.displayOffsetY + "px", 
    this.beacon.emit("displayResized", null);
}, Plx.Beacon = function(owner) {
    this.owner = owner, this.reset();
}, Plx.Beacon.prototype.reset = function() {
    this.observerGroups = [];
}, Plx.Beacon.prototype.observe = function(observer, signal, callback, precedence) {
    if (precedence = precedence || 5, !observer) throw new Error("observer required to observe");
    if (!signal) throw new Error("signal required to observe");
    if (!callback) throw new Error("callback required to observe");
    for (var observerGroup = new Plx.ObserverGroup(observer, signal, callback, precedence), inserted = !1, i = 0; i < this.observerGroups.length; i++) if (this.observerGroups[i].precedence > observerGroup.precedence) {
        this.observerGroups.splice(i, 0, observerGroup), inserted = !0;
        break;
    }
    inserted || this.observerGroups.push(observerGroup);
}, Plx.Beacon.prototype.ignore = function(observer, signal, callback) {
    for (var i = this.observerGroups.length - 1; i >= 0; i--) {
        var observerGroup = this.observerGroups[i];
        observerGroup.observer == observer && observerGroup.signal == signal && observerGroup.callback == callback && this.observerGroups.splice(i, 1);
    }
}, Plx.Beacon.prototype.emit = function(signal, data) {
    for (var observerGroup, event = new Plx.Event(this, data), matches = null, i = 0; i < this.observerGroups.length; i++) observerGroup = this.observerGroups[i], 
    observerGroup.signal == signal && (matches || (matches = []), matches.push(observerGroup));
    if (matches) for (i = 0; i < matches.length; i++) observerGroup = matches[i], event.consumed || observerGroup.callback.call(observerGroup.observer, event);
}, Plx.Beacon.prototype.destroy = function() {
    this.observerGroups = [];
}, Plx.ObserverGroup = function(observer, signal, callback, precedence) {
    this.observer = observer, this.signal = signal, this.callback = callback, this.precedence = precedence;
}, Plx.Event = function(beacon, data) {
    this.beacon = beacon, this.data = data, this.consumed = !1;
}, Plx.Point = function(x, y) {
    this.reset(x, y);
}, Plx.Point.prototype.reset = function(x, y) {
    this.x = x || 0, this.y = y || 0;
}, Plx.Point.prototype.calcAngle = function(point) {
    return xDist = point.x - this.x, yDist = point.y - this.y, Math.atan2(yDist, xDist);
}, Plx.Point.prototype.calcDist = function(point) {
    return xDist = point.x - this.x, yDist = point.y - this.y, Math.pow(Math.pow(xDist, 2) + Math.pow(yDist, 2), .5);
}, Plx.Preloader = function() {
    this.imagePaths = [], this.totalImages = 0, this.beacon = new Plx.Beacon(this), 
    this.canvas = document.getElementById("canvas"), this.context = this.canvas.getContext("2d");
}, Plx.Preloader.prototype.addImage = function(imagePath) {
    this.imagePaths.push(imagePath);
}, Plx.Preloader.prototype.load = function() {
    this.totalImages = this.imagePaths.length, this.render();
    for (var i = 0; i < this.imagePaths.length; i++) {
        var imagePath = this.imagePaths[i], image = new Image(), _this = this;
        image.onload = function(event) {
            _this.onImageLoaded(event);
        }, image.src = imagePath;
    }
}, Plx.Preloader.prototype.onImageLoaded = function(event) {
    for (var i = this.imagePaths.length - 1; i >= 0; i--) {
        var imagePath = this.imagePaths[i];
        if (-1 != event.currentTarget.src.indexOf(imagePath)) {
            this.beacon.emit("imageLoaded", {
                image: event.currentTarget,
                path: imagePath
            }), this.imagePaths.splice(i, 1);
            break;
        }
    }
    this.render(), this.imagePaths.length || this.beacon.emit("completed", {});
}, Plx.Preloader.prototype.render = function() {
    this.context.fillStyle = "#000000", this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    var padding = Math.round(this.canvas.width / 10), width = Math.round(this.canvas.width - 2 * padding), height = Math.round(padding), innerPadding = Math.round(this.canvas.width / 100), innerWidth = Math.round(width - 2 * innerPadding), innerHeight = Math.round(height - 2 * innerPadding), percentComplete = 1 - this.imagePaths.length / this.totalImages;
    this.context.fillStyle = this.context.strokeStyle = "#EEEEEE", this.context.strokeRect(padding, this.canvas.height / 2 - height / 2, width, height), 
    this.context.fillRect(padding + innerPadding, this.canvas.height / 2 - innerHeight / 2, Math.round(innerWidth * percentComplete), innerHeight);
}, Plx.Rectangle = function() {
    this.loc = new Plx.Point(), this.reset();
}, Plx.Rectangle.prototype.reset = function() {
    this.loc.reset(), this.width = 0, this.height = 0;
}, Plx.Rectangle.prototype.intersects = function(rectangle) {
    var intersectionFound = !0;
    return rectangle.loc.x >= this.loc.x + this.width ? intersectionFound = !1 : rectangle.loc.x + rectangle.width <= this.loc.x ? intersectionFound = !1 : rectangle.loc.y >= this.loc.y + this.height ? intersectionFound = !1 : rectangle.loc.y + rectangle.height <= this.loc.y && (intersectionFound = !1), 
    intersectionFound;
}, Plx.Rectangle.prototype.contains = function(point) {
    var inside = !0;
    return (point.x < this.loc.x || point.x > this.loc.x + this.width) && (inside = !1), 
    (point.y < this.loc.y || point.y > this.loc.y + this.height) && (inside = !1), inside;
}, Plx.Rectangle.prototype.getLeft = function() {
    return this.loc.x;
}, Plx.Rectangle.prototype.getRight = function() {
    return this.loc.x + this.width;
}, Plx.Rectangle.prototype.getTop = function() {
    return this.loc.y;
}, Plx.Rectangle.prototype.getBottom = function() {
    return this.loc.y + this.height;
}, Plx.SaveData = function() {
    window.localStorage.gameData || (window.localStorage.gameData = "{}");
    try {
        this.storage = JSON.parse(window.localStorage.gameData);
    } catch (error) {
        console.log("Couldn't parse window.localStorage.gameData. Clearing data."), this.storage = {};
    }
    this.storage.playCount ? this.storage.playCount++ : this.storage.playCount = 1, 
    this.flush();
}, Plx.SaveData.prototype.isFirstPlay = function() {
    return 1 == this.storage.playCount;
}, Plx.SaveData.prototype.hasSeenTutorial = function() {
    return this.storage.hasSeenTutorial || (this.storage.hasSeenTutorial = !1), this.storage.hasSeenTutorial;
}, Plx.SaveData.prototype.tutorialSeen = function() {
    this.storage.hasSeenTutorial = !0, this.flush();
}, Plx.SaveData.prototype.isLevelLocked = function(level) {
    return this.storage.levels || (this.storage.levels = {}), this.storage.levels[level] || (this.storage.levels[level] = {
        locked: !0,
        highScore: -1
    }), this.storage.levels[level].locked;
}, Plx.SaveData.prototype.unlockLevel = function(level) {
    this.storage.levels || (this.storage.levels = {}), this.storage.levels[level] || (this.storage.levels[level] = {
        locked: !0,
        highScore: -1
    }), this.storage.levels[level].locked = !1, this.flush();
}, Plx.SaveData.prototype.numUnlockedLevels = function() {
    var unlockedCount = 0;
    for (var level in this.storage.levels) this.storage.levels[level].locked || unlockedCount++;
    return unlockedCount;
}, Plx.SaveData.prototype.clearData = function() {
    this.storage = {}, this.flush();
}, Plx.SaveData.prototype.flush = function() {
    window.localStorage.gameData = JSON.stringify(this.storage);
}, Plx.SpriteStore = function() {
    this.images = {}, this.frames = {}, this.anims = {};
}, Plx.SpriteStore.prototype.addImage = function(image, name) {
    this.images[name] = image;
}, Plx.SpriteStore.prototype.addFrame = function(x, y, width, height, imageName, name) {
    this.frames[name] = {
        x: x,
        y: y,
        width: width,
        height: height,
        image: imageName
    };
}, Plx.SpriteStore.prototype.addAnim = function(frameNames, looping, name, frameRate) {
    this.anims[name] = {
        frames: frameNames,
        looping: looping,
        frameRate: frameRate
    };
}, Plx.SpriteStore.prototype.getAnimWidthHeight = function(animName) {
    var frame = this.frames[this.anims[animName].frames[0]];
    return [ frame.width, frame.height ];
}, Plx.Timer = function(duration, reps, delay, heartbeatBeacon, heartbeatEvent) {
    this.duration = duration, this.reps = reps, this.delay = delay, this.heartbeatBeacon = heartbeatBeacon, 
    this.heartbeatEvent = heartbeatEvent, this.beacon = new Plx.Beacon(this), this.curCount = 0, 
    this.curRep = 0, this.heartbeatOn = !1, this.curDelay = 0, this.isRunning = !1;
}, Plx.Timer.oneShot = function(duration, delay, heartbeatBeacon, heartbeatEvent, callback) {
    var timer = new Plx.Timer(duration, 1, delay, heartbeatBeacon, heartbeatEvent);
    return timer.beacon.observe(this, "completed", callback), timer.start(), timer;
}, Plx.Timer.prototype.start = function() {
    this.heartbeatOn || (this.heartbeatBeacon.observe(this, this.heartbeatEvent, this.onHeartbeat), 
    this.heartbeatOn = !0), this.curCount = 0, this.curRep = 0, this.curDelay = this.delay, 
    this.isRunning = !0;
}, Plx.Timer.prototype.stop = function() {
    this.heartbeatOn && (this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat), 
    this.heartbeatOn = !1);
}, Plx.Timer.prototype.reset = function() {
    this.curCount = 0, this.curRep = 0, this.curDelay = 0;
}, Plx.Timer.prototype.onHeartbeat = function() {
    return this.curDelay > 0 ? (this.curDelay--, void 0) : (this.curCount++, this.curCount == this.duration && (this.curCount = 0, 
    this.curRep++, this.beacon.emit("timed", null), this.curRep == this.reps && (this.beacon.emit("completed", null), 
    this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat), this.heartbeatOn = !1)), 
    void 0);
}, Plx.Tween = function(target, property, heartbeatBeacon, heartbeatEvent) {
    this.target = target, this.property = property, this.heartbeatBeacon = heartbeatBeacon, 
    this.heartbeatEvent = heartbeatEvent, this.beacon = new Plx.Beacon(this), this.time = 0, 
    this.heartbeatOn = !1, this.startValue = 0, this.endValue = 0, this.duration = 0;
}, Plx.Tween.move = function(target, changeX, changeY, duration, delay) {
    return Plx.Tween.moveTo(target, target.physics.rect.loc.x + changeX, target.physics.rect.loc.y + changeY, duration, delay);
}, Plx.Tween.moveTo = function(target, destX, destY, duration, delay) {
    var tweenX = new Plx.Tween(target.physics, "x", target.scene.beacon, "updated"), tweenY = new Plx.Tween(target.physics, "y", target.scene.beacon, "updated");
    if (delay) {
        var timer = new Plx.Timer(delay, 1, 0, target.scene.beacon, "updated");
        timer.start(), timer.beacon.observe(this, "timed", function() {
            tweenX.start(target.physics.rect.loc.x, destX, duration), tweenY.start(target.physics.rect.loc.y, destY, duration);
        });
    } else tweenX.start(target.physics.rect.loc.x, destX, duration), tweenY.start(target.physics.rect.loc.y, destY, duration);
    return [ tweenX, tweenY ];
}, Plx.Tween.prototype.start = function(startValue, endValue, duration) {
    this.startValue = startValue, this.endValue = endValue, this.duration = duration, 
    this.heartbeatOn || (this.heartbeatBeacon.observe(this, this.heartbeatEvent, this.onHeartbeat), 
    this.heartbeatOn = !0), this.time = 0;
}, Plx.Tween.prototype.onHeartbeat = function() {
    if (0 == this.time) "x" == this.property && (this.target.rect.loc.x = this.startValue), 
    "y" == this.property && (this.target.rect.loc.y = this.startValue), this.time++; else if (this.time < this.duration) {
        var changeAmount = Plx.Easing.easeInOutSine(this.time, this.startValue, this.endValue - this.startValue, this.duration) - Plx.Easing.easeInOutSine(this.time - 1, this.startValue, this.endValue - this.startValue, this.duration);
        "x" == this.property && (this.target.speedX = changeAmount), "y" == this.property && (this.target.speedY = changeAmount), 
        this.time++;
    } else "x" == this.property && (this.target.rect.loc.x = this.endValue, this.target.speedX = 0), 
    "y" == this.property && (this.target.rect.loc.y = this.endValue, this.target.speedY = 0), 
    this.beacon.emit("completed", {
        target: this.target
    }), this.heartbeatBeacon.ignore(this, this.heartbeatEvent, this.onHeartbeat), this.heartbeatOn = !1;
    this.target.beacon.emit("updated", null);
}, Plx.Tween.prototype.destroy = function() {}, Plx.Easing = {}, Plx.Easing.PI_M2 = 2 * Math.PI, 
Plx.Easing.PI_D2 = Math.PI / 2, Plx.Easing.easeLinear = function(t, b, c, d) {
    return c * t / d + b;
}, Plx.Easing.easeInSine = function(t, b, c, d) {
    return -c * Math.cos(t / d * Plx.Easing.PI_D2) + c + b;
}, Plx.Easing.easeOutSine = function(t, b, c, d) {
    return c * Math.sin(t / d * Plx.Easing.PI_D2) + b;
}, Plx.Easing.easeInOutSine = function(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}, Plx.Easing.easeInQuint = function(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
}, Plx.Easing.easeOutQuint = function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}, Plx.Easing.easeInOutQuint = function(t, b, c, d) {
    return (t /= d / 2) < 1 ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}, Plx.Easing.easeInQuart = function(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
}, Plx.Easing.easeOutQuart = function(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}, Plx.Easing.easeInOutQuart = function(t, b, c, d) {
    return (t /= d / 2) < 1 ? c / 2 * t * t * t * t + b : -c / 2 * ((t -= 2) * t * t * t - 2) + b;
}, Plx.Easing.easeInQuad = function(t, b, c, d) {
    return c * (t /= d) * t + b;
}, Plx.Easing.easeOutQuad = function(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
}, Plx.Easing.easeInOutQuad = function(t, b, c, d) {
    return (t /= d / 2) < 1 ? c / 2 * t * t + b : -c / 2 * (--t * (t - 2) - 1) + b;
}, Plx.Easing.easeInExpo = function(t, b, c, d) {
    return 0 == t ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
}, Plx.Easing.easeOutExpo = function(t, b, c, d) {
    return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}, Plx.Easing.easeInOutExpo = function(t, b, c, d) {
    return 0 == t ? b : t == d ? b + c : (t /= d / 2) < 1 ? c / 2 * Math.pow(2, 10 * (t - 1)) + b : c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
}, Plx.Easing.easeInElastic = function(t, b, c, d, a, p) {
    if (0 == t) return b;
    if (1 == (t /= d)) return b + c;
    if (p || (p = .3 * d), !a || a < Math.abs(c)) {
        a = c;
        var s = p / 4;
    } else s = p / Plx.Easing.PI_M2 * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Plx.Easing.PI_M2 / p)) + b;
}, Plx.Easing.easeOutElastic = function(t, b, c, d, a, p) {
    if (0 == t) return b;
    if (1 == (t /= d)) return b + c;
    if (p || (p = .3 * d), !a || a < Math.abs(c)) {
        a = c;
        var s = p / 4;
    } else s = p / Plx.Easing.PI_M2 * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * Plx.Easing.PI_M2 / p) + c + b;
}, Plx.Easing.easeInOutElastic = function(t, b, c, d, a, p) {
    if (a = a || null, p = p || null, 0 == t) return b;
    if (2 == (t /= d / 2)) return b + c;
    if (p || (p = .3 * d * 1.5), !a || a < Math.abs(c)) {
        a = c;
        var s = p / 4;
    } else s = p / Plx.Easing.PI_M2 * Math.asin(c / a);
    return 1 > t ? -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Plx.Easing.PI_M2 / p) + b : a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * Plx.Easing.PI_M2 / p) * .5 + c + b;
}, Plx.Easing.easeInCircular = function(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
}, Plx.Easing.easeOutCircular = function(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
}, Plx.Easing.easeInOutCircular = function(t, b, c, d) {
    return (t /= d / 2) < 1 ? -c / 2 * (Math.sqrt(1 - t * t) - 1) + b : c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
}, Plx.Easing.easeInBack = function(t, b, c, d, s) {
    return s = s || 1.70158, c * (t /= d) * t * ((s + 1) * t - s) + b;
}, Plx.Easing.easeOutBack = function(t, b, c, d, s) {
    return s = s || 1.70158, c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}, Plx.Easing.easeInOutBack = function(t, b, c, d, s) {
    return s = s || 1.70158, (t /= d / 2) < 1 ? c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b : c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
}, Plx.Easing.easeInBounce = function(t, b, c, d) {
    return c - Plx.Easing.easeOutBounce(d - t, 0, c, d) + b;
}, Plx.Easing.easeOutBounce = function(t, b, c, d) {
    return (t /= d) < 1 / 2.75 ? 7.5625 * c * t * t + b : 2 / 2.75 > t ? c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b : 2.5 / 2.75 > t ? c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b : c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
}, Plx.Easing.easeInOutBounce = function(t, b, c, d) {
    return d / 2 > t ? .5 * Plx.Easing.easeInBounce(2 * t, 0, c, d) + b : .5 * Plx.Easing.easeOutBounce(2 * t - d, 0, c, d) + .5 * c + b;
}, Plx.Easing.easeInCubic = function(t, b, c, d) {
    return c * (t /= d) * t * t + b;
}, Plx.Easing.easeOutCubic = function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}, Plx.Easing.easeInOutCubic = function(t, b, c, d) {
    return (t /= d / 2) < 1 ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;
}, Plx.Utils = {}, Plx.Utils.random = function(min, max, round) {
    var num = Math.random() * (max - min) + min;
    return round && (num = Math.round(num)), num;
}, Plx.Utils.randomOffset = function(dist, distVariance) {
    var angle = Math.random() * Math.PI * 2;
    return dist += Math.random() * distVariance, new Point(Math.cos(angle) * dist, Math.sin(angle) * dist);
}, Plx.Utils.removeFromArray = function(array, targetObject, removeAll) {
    0 != removeAll && (removeAll = !0);
    for (var i = array.length - 1; i >= 0; i--) {
        var object = array[i];
        if (object == targetObject && (array.splice(i, 1), !removeAll)) return;
    }
}, Plx.Entity = function() {
    this.beacon = new Plx.Beacon(this), this.id = Plx.Entity.idCounter++, this.components = [], 
    this.componentMap = {}, this.typeName = null, this.reset();
}, Plx.Entity.idCounter = 0, Plx.Entity.prototype.reset = function() {
    for (var i = 0; i < this.components.length; i++) this.components[i].reset();
    this.beacon.reset(), this.alive = !0, this.scene = null, this.game = null;
}, Plx.Entity.prototype.update = function() {
    this.beacon.emit("updated", null);
}, Plx.Entity.prototype.addComponent = function(component) {
    return component.entity = this, component.game = this.game, component.beacon.emit("added", null), 
    this.components.push(component), this.componentMap[component.name] = component, 
    Object.defineProperty(this, component.name, {
        get: function() {
            return this.componentMap[component.name];
        }
    }), component;
}, Plx.Entity.prototype.fetchComponent = function(componentClass) {
    for (var i = 0; i < this.components.length; i++) {
        var component = this.components[i];
        if (component instanceof componentClass) return component;
    }
    return null;
}, Plx.Entity.prototype.fetchComponentByName = function(name) {
    return this.componentMap[name];
}, Plx.Entity.prototype.destroy = function() {
    this.beacon.destroy();
    for (var i = 0; i < this.components.length; i++) {
        var component = this.components[i];
        component.destroy();
    }
    this.components = [];
}, Plx.EntityFactory = function(game) {
    this.entityPool = {}, this.entityTypes = {}, this.game = game;
}, Plx.EntityFactory.prototype.registerType = function(name, componentList) {
    if (this.entityTypes[name]) throw new Error("type (" + name + ") already registered in EntityFactory");
    this.entityTypes[name] = {
        componentList: componentList
    }, this.entityPool[name] = [];
}, Plx.EntityFactory.prototype.createType = function(typeName, defaultOverrides) {
    var entityType = this.entityTypes[typeName];
    if (!entityType) throw new Error("type (" + typeName + ") not found in entityTypes");
    if (this.entityPool[typeName].length) var entity = this.entityPool[typeName].pop(); else {
        entity = new Plx.Entity(), entity.typeName = typeName, entity.game = this.game;
        for (var i = 0; i < entityType.componentList.length; i++) {
            var listItem = entityType.componentList[i], component = new listItem.type();
            component.entity = entity, component.name = listItem.name, entity.addComponent(component);
        }
    }
    for (entity.reset(), i = 0; i < entity.components.length; i++) {
        listItem = entityType.componentList[i], component = entity.components[i];
        for (var key in listItem.params) component[key] = listItem.params[key];
    }
    for (var defaultOverride in defaultOverrides) {
        component = entity.fetchComponentByName(defaultOverride);
        for (key in defaultOverrides[defaultOverride]) component[key] = defaultOverrides[defaultOverride][key];
    }
    for (i = 0; i < entity.components.length; i++) entity.components[i].init();
    return entity;
}, Plx.EntityFactory.prototype.returnEntity = function(entity) {
    this.entityPool[entity.typeName].push(entity);
}, Plx.Component = function() {
    this.beacon = new Plx.Beacon(this), this.entity = null, this.name = null, this.id = Plx.Component.idCounter++;
}, Plx.Component.idCounter = 0, Plx.Component.prototype.reset = function() {
    this.beacon.reset();
}, Plx.Component.prototype.init = function() {}, Plx.Component.prototype.destroy = function() {
    this.beacon.destroy();
}, Plx.Data = function() {
    Plx.Component.call(this), this.data = {};
}, Plx.Data.prototype = Object.create(Plx.Component.prototype), Plx.Data.prototype.constructor = Plx.Data, 
Plx.FunctionBinder = function() {
    Plx.Component.call(this), this.resetFunc = null, this.initFunc = null;
}, Plx.FunctionBinder.prototype = Object.create(Plx.Component.prototype), Plx.FunctionBinder.prototype.constructor = Plx.FunctionBinder, 
Plx.FunctionBinder.prototype.reset = function() {
    Plx.Component.prototype.reset.call(this), this.resetFunc && (this.resetFunc = this.resetFunc.bind(this)), 
    this.initFunc && (this.initFunc = this.initFunc.bind(this)), this.resetFunc && this.resetFunc();
}, Plx.FunctionBinder.prototype.init = function() {
    Plx.Component.prototype.init.call(this), this.initFunc && this.initFunc();
}, Plx.GridItem = function() {
    Plx.Component.call(this), this.shape = [];
}, Plx.GridItem.prototype = Object.create(Plx.Component.prototype), Plx.GridItem.prototype.constructor = Plx.GridItem, 
Plx.GridItem.prototype.reset = function() {}, Plx.GridItem.prototype.init = function() {}, 
Plx.KillOffscreen = function() {
    Plx.Component.call(this), this.reset();
}, Plx.KillOffscreen.prototype = Object.create(Plx.Component.prototype), Plx.KillOffscreen.prototype.constructor = Plx.KillOffscreen, 
Plx.KillOffscreen.prototype.reset = function() {
    Plx.Component.prototype.reset.call(this), this.left = !1, this.right = !1, this.top = !1, 
    this.bottom = !1, this.physicsComponent = null;
}, Plx.KillOffscreen.prototype.init = function() {
    this.physicsComponent = this.entity.fetchComponent(Plx.PhysicsComponent), this.physicsComponent.beacon.observe(this, "updated", this.onPhysicsUpdated);
}, Plx.KillOffscreen.prototype.onPhysicsUpdated = function() {
    this.left && this.physicsComponent.rect.loc.x + this.physicsComponent.rect.width < 0 ? this.entity.alive = !1 : this.right && this.physicsComponent.rect.loc.x > this.entity.scene.game.width ? this.entity.alive = !1 : this.top && this.physicsComponent.rect.loc.y + this.physicsComponent.rect.height < 0 ? this.entity.alive = !1 : this.bottom && this.physicsComponent.rect.loc.y > this.entity.scene.game.height && (this.entity.alive = !1);
}, Plx.PhysicsComponent = function() {
    Plx.Component.call(this), this.rect = new Plx.Rectangle(), this.lastRect = new Plx.Rectangle(), 
    this.nextRect = new Plx.Rectangle(), this.pendingMove = new Plx.Point(), Plx.PhysicsComponent.count++, 
    this.reset();
}, Plx.PhysicsComponent.prototype = Object.create(Plx.Component.prototype), Plx.PhysicsComponent.prototype.constructor = Plx.PhysicsComponent, 
Plx.PhysicsComponent.count = 0, Plx.PhysicsComponent.prototype.reset = function() {
    Plx.Component.prototype.reset.call(this), this.rect.reset(), this.lastRect.reset(), 
    this.nextRect.reset(), this.pendingMove.reset(), this.speedX = 0, this.speedY = 0, 
    this.capSpeed = !1, this.speedXMax = 0, this.speedYMax = 0, this.friction = 1, this.mass = 1, 
    this.sponginess = .1, this.collisionType = "none", this.gravity = 0, this.collisionEnabled = !0, 
    this.resolutionEnabled = !0;
}, Plx.PhysicsComponent.prototype.init = function() {}, Object.defineProperty(Plx.PhysicsComponent.prototype, "x", {
    get: function() {
        return this.rect.loc.x;
    },
    set: function(value) {
        this.rect.loc.x = value;
    }
}), Object.defineProperty(Plx.PhysicsComponent.prototype, "y", {
    get: function() {
        return this.rect.loc.y;
    },
    set: function(value) {
        this.rect.loc.y = value;
    }
}), Object.defineProperty(Plx.PhysicsComponent.prototype, "width", {
    get: function() {
        return this.rect.width;
    },
    set: function(value) {
        this.rect.width = value, this.nextRect.width = value;
    }
}), Object.defineProperty(Plx.PhysicsComponent.prototype, "height", {
    get: function() {
        return this.rect.height;
    },
    set: function(value) {
        this.rect.height = value, this.nextRect.height = value;
    }
}), Plx.PhysicsComponent.prototype.setX = function(x, syncLast) {
    syncLast = syncLast || !1, this.lastRect.loc.x = syncLast ? x : this.rect.loc.x, 
    this.rect.loc.x = x;
}, Plx.PhysicsComponent.prototype.setY = function(y, syncLast) {
    syncLast = syncLast || !1, this.lastRect.loc.y = syncLast ? y : this.rect.loc.y, 
    this.rect.loc.y = y;
}, Plx.PhysicsComponent.prototype.setWidth = function(width) {
    this.rect.width = width, this.nextRect.width = width;
}, Plx.PhysicsComponent.prototype.setHeight = function(height) {
    this.rect.height = height, this.nextRect.height = height;
}, Plx.PhysicsComponent.prototype.destroy = function() {
    Plx.PhysicsComponent.count--;
}, Plx.PixelBlotMap = function(map, width) {
    Plx.Component.call(this), this.loc = new Point(), this.speedX = 0, this.speedY = 0, 
    this.pixelBlots = [], this.blotSize = 4, this.map = map.replace(/\s/g, ""), this.colorMap = {};
    for (var i = 0; i < this.map.length; i++) {
        var character = this.map[i];
        switch (character) {
          case ".":
            continue;

          default:
            this.pixelBlots.push(new Plx.PixelBlot(new Plx.Point(i % width, Math.floor(i / width)), i));
        }
    }
    this.visible = !0, this.physicsComponent = null, this.beacon.observe(this, "added", this.onAdded);
}, Plx.PixelBlotMap.prototype = Object.create(Plx.Component.prototype), Plx.PixelBlotMap.prototype.constructor = Plx.PixelBlotMap, 
Plx.PixelBlotMap.setBlotColor = function(red, green, blue) {
    for (var i = 0; i < this.pixelBlots.length; i++) {
        var blot = this.pixelBlots[i];
        blot.red = red, blot.green = green, blot.blue = blue;
    }
}, Plx.PixelBlotMap.setBlotColorMap = function(colorMap) {
    this.colorMap = colorMap, this.updateBlotColors();
}, Plx.PixelBlotMap.updateBlotColors = function() {
    for (var i = 0; i < this.map.length; i++) {
        var character = this.map[i];
        if (this.colorMap[character]) for (var j = 0; j < this.map.length; j++) {
            var pixelBlot = this.map[j];
            if (pixelBlot.mapIndex == i) {
                pixelBlot.red = this.colorMap[character].red, pixelBlot.green = this.colorMap[character].green, 
                pixelBlot.blue = this.colorMap[character].blue;
                break;
            }
        }
    }
}, Plx.PixelBlotMap.onAdded = function() {
    this.entity.beacon.observe(this, "addedToScene", this.onAddedToScene);
}, Plx.PixelBlotMap.onAddedToScene = function() {
    this.physicsComponent = this.entity.fetchComponent(PhysicsComponent), null != this.physicsComponent && this.physicsComponent.beacon.observe(this, "updated", this.onPhysicsUpdated);
}, Plx.PixelBlotMap.onPhysicsUpdated = function() {
    this.loc.x = this.physicsComponent.rect.loc.x, this.loc.y = this.physicsComponent.rect.loc.y, 
    this.speedX = this.physicsComponent.speedX, this.speedY = this.physicsComponent.speedY;
}, Plx.PixelBlot = function(loc, mapIndex) {
    this.loc = loc, this.mapIndex = mapIndex, this.alpha = 1, this.red = 0, this.green = 0, 
    this.blue = 0;
}, Plx.Pointerable = function() {
    Plx.Component.call(this), this.reset();
}, Plx.Pointerable.prototype = Object.create(Plx.Component.prototype), Plx.Pointerable.prototype.constructor = Plx.Pointerable, 
Plx.Pointerable.prototype.reset = function() {
    Plx.Component.prototype.reset.call(this), this.beacon.reset(), this.enabled = !0, 
    this.draggable = !1, this.colCheck = null, this.syncLoc = null;
}, Plx.Pointerable.prototype.init = function() {
    this.physics = this.entity.fetchComponent(Plx.PhysicsComponent), this.colCheck && (this.colCheck = this.colCheck.bind(this)), 
    this.syncLoc && (this.syncLoc = this.syncLoc.bind(this));
}, Plx.Pointerable.prototype.collisionCheck = function(x, y) {
    return this.colCheck ? this.colCheck(x, y) : this.physics.rect.contains(new Plx.Point(x, y)) ? !0 : !1;
}, Plx.Pointerable.prototype.syncLocation = function(x, y, xOffset, yOffset) {
    return this.syncLoc ? (this.syncLoc(x, y), void 0) : (this.physics.x = x - xOffset, 
    this.physics.y = y - yOffset, void 0);
}, Plx.Sprite = function() {
    Plx.Component.call(this), this.loc = new Plx.Point(), this.anchor = new Plx.Point(), 
    this.offset = new Plx.Point(), this.reset();
}, Plx.Sprite.prototype = Object.create(Plx.Component.prototype), Plx.Sprite.prototype.constructor = Plx.Sprite, 
Plx.Sprite.prototype.reset = function() {
    Plx.Component.prototype.reset.call(this), this.loc.reset(), this.z = 0, this.visible = !0, 
    this.speedX = 0, this.speedY = 0, this.rotation = 0, this.anchor.reset(), this.offset.reset(), 
    this.scaleX = 1, this.scaleY = 1, this.anim = null, this.animName = null, this.animTimer = null, 
    this.frame = null, this.frameIndex = 0, this.flippedX = !1, this.flippedY = !1, 
    this.alpha = 1, this.autoSizePhysics = !1;
}, Plx.Sprite.prototype.init = function() {
    this.animTimer = new Plx.Timer(0, -1, 0, this.entity.beacon, "updated"), this.animTimer.beacon.observe(this, "timed", this.onAnimTimerTimed), 
    this.animName && this.play(this.animName), this.physics = this.entity.fetchComponent(Plx.PhysicsComponent), 
    null != this.physics && (this.physics.beacon.observe(this, "updated", this.onPhysicsUpdated), 
    this.autoSizePhysics && (this.physics.width = this.frame.width * this.scaleX, this.physics.height = this.frame.height * this.scaleY));
}, Plx.Sprite.prototype.onAnimTimerTimed = function() {
    if (!this.anim.looping && this.frameIndex == this.anim.frames.length - 1) return this.animTimer.stop(), 
    this.beacon.emit("animCompleted", null), void 0;
    this.frameIndex++, this.frameIndex >= this.anim.frames.length ? (this.anim.looping && (this.frameIndex = 0), 
    this.beacon.emit("animCompleted", null)) : this.frameIndex >= this.anim.frames.length && (this.frameIndex = this.anim.frames.length - 1);
    var frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex];
    frameName = this.entity.scene.game.spriteStore.anims[this.animName].frames[this.frameIndex], 
    this.frame = this.entity.scene.game.spriteStore.frames[frameName];
}, Plx.Sprite.prototype.onPhysicsUpdated = function() {
    this.loc.x = this.physics.rect.loc.x + this.offset.x, this.loc.y = this.physics.rect.loc.y + this.offset.y, 
    this.speedX = this.physics.speedX, this.speedY = this.physics.speedY;
}, Plx.Sprite.prototype.play = function(animName) {
    this.animName = animName, this.anim = this.game.spriteStore.anims[this.animName], 
    this.frameIndex = 0, this.animTimer.duration = this.anim.frameRate, this.animTimer.reset(), 
    this.animTimer.isRunning || this.animTimer.start();
    var frameName = this.anim.frames[this.frameIndex];
    this.frame = this.game.spriteStore.frames[frameName];
}, Plx.Sprite.prototype.pause = function() {}, Plx.Sprite.prototype.resume = function() {}, 
Plx.Sprite.prototype.setZIndex = function() {
    this.beacon.emit("updatedZIndex", {});
}, Plx.Scene = function() {
    this.paused = !1, this.beacon = new Plx.Beacon(this), this.entities = [], this.systems = [], 
    this.game = null;
}, Plx.Scene.prototype.init = function() {}, Plx.Scene.prototype.update = function() {
    var entity, i;
    for (i = 0; i < this.entities.length; i++) entity = this.entities[i], entity.update();
    for (i = this.entities.length - 1; i >= 0; i--) entity = this.entities[i], entity.alive || (this.removeEntity(entity), 
    this.entities.splice(i, 1), this.game.entityFactory.returnEntity(entity));
    this.beacon.emit("updated", null), this.beacon.emit("updateCompleted", null);
}, Plx.Scene.prototype.render = function(frameProgress) {
    this.beacon.emit("rendered", {
        frameProgress: frameProgress
    }), this.beacon.emit("renderCompleted", {
        frameProgress: frameProgress
    });
}, Plx.Scene.prototype.addSystem = function(system) {
    return system.scene = this, this.systems.push(system), system.beacon.emit("addedToScene", {}), 
    system;
}, Plx.Scene.prototype.fetchSystem = function(systemClass) {
    for (var i = 0; i < this.systems.length; i++) {
        var system = this.systems[i];
        if (system instanceof systemClass) return system;
    }
    return null;
}, Plx.Scene.prototype.makeEntity = function(type, defaultOverrides) {
    return this.addEntity(this.game.entityFactory.createType(type, defaultOverrides));
}, Plx.Scene.prototype.addEntity = function(entity) {
    return entity.scene = this, this.entities.push(entity), this.beacon.emit("entityAdded", {
        entity: entity
    }), entity.beacon.emit("addedToScene", {}), entity;
}, Plx.Scene.prototype.removeEntity = function(entity) {
    entity.beacon.emit("removedFromScene", null), this.beacon.emit("entityRemoved", {
        entity: entity
    });
}, Plx.Scene.prototype.switchScene = function(sceneClass, transition, handoffData) {
    this.beacon.emit("completed", {
        sceneClass: sceneClass,
        transition: transition,
        handoffData: handoffData
    }), this.paused = !0;
}, Plx.Scene.prototype.destroy = function() {
    var i;
    for (i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        this.game.entityFactory.returnEntity(entity);
    }
    for (i = 0; i < this.systems.length; i++) {
        var system = this.systems[i];
        system.destroy();
    }
    this.beacon.destroy();
}, Plx.SceneDirector = function() {
    this.scenes = [];
}, Plx.SceneDirector.prototype.addScene = function(scene) {
    this.scenes.push(scene);
}, Plx.SceneDirector.prototype.swapScenes = function(oldScene, newScene) {
    this.scenes.remove(oldScene), this.scenes.add(newScene);
}, Plx.System = function() {
    this.beacon = new Plx.Beacon(this), this.beacon.observe(this, "addedToScene", function() {
        this.scene.beacon.observe(this, "entityAdded", this.onEntityAdded), this.scene.beacon.observe(this, "entityRemoved", this.onEntityRemoved);
    }), this.scene = null, this.componentTypes = [];
}, Plx.System.prototype.onEntityAdded = function(event) {
    for (var _this = this, entity = event.data.entity, i = 0; i < entity.components.length; i++) {
        var component = entity.components[i];
        this.componentTypes.forEach(function(componentType) {
            component instanceof componentType && _this.addComponent(component);
        });
    }
}, Plx.System.prototype.onEntityRemoved = function(event) {
    for (var _this = this, entity = event.data.entity, i = entity.components.length - 1; i >= 0; i--) {
        var component = entity.components[i];
        this.componentTypes.forEach(function(componentType) {
            component instanceof componentType && _this.removeComponent(component);
        });
    }
}, Plx.System.prototype.addComponent = function() {}, Plx.System.prototype.removeComponent = function() {}, 
Plx.System.prototype.update = function() {}, Plx.System.prototype.destroy = function() {
    this.beacon.destroy();
}, Plx.GridPlacement = function() {
    Plx.System.call(this), this.componentTypes = [ Plx.GridItem ], this.width = 0, this.height = 0;
}, Plx.GridPlacement.prototype = Object.create(Plx.System.prototype), Plx.GridPlacement.prototype.constructor = Plx.GridPlacement, 
Plx.GridPlacement.prototype.update = function() {}, Plx.GridPlacement.prototype.addComponent = function() {}, 
Plx.GridPlacement.prototype.removeComponent = function() {}, Plx.GridPlacement.prototype.destroy = function() {}, 
Plx.KeyboardInput = function() {
    Plx.System.call(this), this.keys = [];
    for (var i = 0; 255 > i; i++) this.keys.push(!1);
    var _this = this;
    this.keyDownFunc = function(event) {
        _this.onKeyDown(event);
    }, this.keyUpFunc = function(event) {
        _this.onKeyUp(event);
    }, window.addEventListener("keydown", this.keyDownFunc, !1), window.addEventListener("keyup", this.keyUpFunc, !1);
}, Plx.KeyboardInput.prototype = Object.create(Plx.System.prototype), Plx.KeyboardInput.prototype.constructor = Plx.KeyboardInput, 
Plx.KeyboardInput.prototype.onKeyDown = function(event) {
    this.keys[event.keyCode] = !0, this.beacon.emit("keyDown", {
        keyCode: event.keyCode
    }), this.beacon.emit(this.translateKeyCode(event.keyCode) + "Down", null);
}, Plx.KeyboardInput.prototype.onKeyUp = function(event) {
    this.keys[event.keyCode] = !1, this.beacon.emit("keyUp", {
        keyCode: event.keyCode
    }), this.beacon.emit(this.translateKeyCode(event.keyCode) + "Up", null);
}, Plx.KeyboardInput.prototype.getKeyDown = function(keyName) {
    switch (keyName) {
      case "space":
        return this.keys[32];

      case "left":
        return this.keys[37];

      case "up":
        return this.keys[38];

      case "right":
        return this.keys[39];

      case "down":
        return this.keys[40];

      case "z":
        return this.keys[90];
    }
    return console.log("keyName " + keyName + " does not exist"), !1;
}, Plx.KeyboardInput.prototype.translateKeyCode = function(keyCode) {
    switch (keyName = "", keyCode) {
      case 32:
        keyName = "space";
        break;

      case 37:
        keyName = "left";
        break;

      case 38:
        keyName = "up";
        break;

      case 39:
        keyName = "right";
        break;

      case 40:
        keyName = "down";
        break;

      case 90:
        keyName = "z";
    }
    return keyName;
}, Plx.KeyboardInput.prototype.destroy = function() {
    window.removeEventListener("keydown", this.keyDownFunc, !1), window.removeEventListener("keyup", this.keyUpFunc, !1);
};

var calcIntersectTime = function(leftActor, rightActor, topActor, bottomActor) {
    var curActor = leftActor, otherActor = rightActor;
    leftActor || (curActor = topActor, otherActor = bottomActor);
    var relativeXSpeed, relativeYSpeed, xDist, yDist, xIntersectTime, yIntersectTime = null;
    leftActor && rightActor && (relativeXSpeed = curActor.speedX - otherActor.speedX, 
    xDist = rightActor.rect.loc.x - (leftActor.rect.loc.x + leftActor.rect.width), xIntersectTime = Math.abs(xDist / relativeXSpeed)), 
    topActor && bottomActor && (relativeYSpeed = curActor.speedY - otherActor.speedY, 
    yDist = bottomActor.rect.loc.y - (topActor.rect.loc.y + topActor.rect.height), yIntersectTime = Math.abs(yDist / relativeYSpeed)), 
    xIntersectTime && !validateIntersectTime(curActor, otherActor, xIntersectTime) && (xIntersectTime = null), 
    yIntersectTime && !validateIntersectTime(curActor, otherActor, yIntersectTime) && (yIntersectTime = null), 
    xIntersectTime || yIntersectTime || (xIntersectTime = 0);
    var intersectTime = null;
    return null != xIntersectTime && (intersectTime = xIntersectTime), null != yIntersectTime && !xIntersectTime || null != yIntersectTime && null != xIntersectTime && xIntersectTime > yIntersectTime ? (intersectTime = yIntersectTime, 
    leftActor = rightActor = null) : topActor = bottomActor = null, {
        intersectTime: intersectTime,
        yIntersectTime: yIntersectTime,
        xIntersectTime: xIntersectTime
    };
}, validateIntersectTime = function(actorOne, actorTwo, stepProgress) {
    0 > stepProgress && (blah = 2);
    var colliding = !0;
    return actorOne.rect.loc.x + actorOne.rect.width + actorOne.speedX * stepProgress < actorTwo.rect.loc.x + actorTwo.speedX * stepProgress ? colliding = !1 : actorOne.rect.loc.x + actorOne.speedX * stepProgress > actorTwo.rect.loc.x + actorTwo.rect.width + actorTwo.speedX * stepProgress ? colliding = !1 : actorOne.rect.loc.y + actorOne.rect.height + actorOne.speedY * stepProgress < actorTwo.rect.loc.y + actorTwo.speedY * stepProgress ? colliding = !1 : actorOne.rect.loc.y + actorOne.speedY * stepProgress > actorTwo.rect.loc.y + actorTwo.rect.height + actorTwo.speedY * stepProgress && (colliding = !1), 
    colliding;
}, adjustPendingSpeed = function(speedProp, actorOne, actorTwo) {
    if (0 == actorOne.mass) return actorOne[speedProp];
    if (0 == actorTwo.mass) return actorTwo[speedProp];
    if (-1 != actorOne.mass) {
        var myMassMod = .9, otherMassMod = 1, actorOneMass = actorOne.mass, actorTwoMass = actorTwo.mass;
        -1 == actorOneMass && (actorOneMass = 100 * actorTwoMass), -1 == actorTwoMass && (actorTwoMass = 100 * actorOneMass);
        var myMass = actorOneMass * myMassMod, otherMass = actorTwoMass * otherMassMod, mySpeed = actorOne[speedProp] * (1 - actorOne.sponginess), otherSpeed = actorTwo[speedProp] * (1 - actorOne.sponginess), updatedSpeed = (myMass - otherMass) / (myMass + otherMass) * mySpeed + 2 * otherMass / (myMass + otherMass) * otherSpeed;
        return updatedSpeed;
    }
}, calcPostCollisionSpeed = function(actorOne, actorTwo, vertical) {
    if (-1 == actorOne.mass && -1 == actorTwo.mass && alert("unmoving actors are colliding"), 
    vertical) {
        var pendingYSpeedOne = adjustPendingSpeed("speedY", actorOne, actorTwo), pendingYSpeedTwo = adjustPendingSpeed("speedY", actorTwo, actorOne);
        actorOne.speedY = pendingYSpeedOne, actorTwo.speedY = pendingYSpeedTwo;
    } else {
        var pendingXSpeedOne = adjustPendingSpeed("speedX", actorOne, actorTwo), pendingXSpeedTwo = adjustPendingSpeed("speedX", actorTwo, actorOne);
        actorOne.speedX = pendingXSpeedOne, actorTwo.speedX = pendingXSpeedTwo;
    }
    var friction = (actorOne.friction + actorTwo.friction) / 2;
    actorOne.speedY *= friction, actorTwo.speedY *= friction, actorOne.speedX *= friction, 
    actorTwo.speedX *= friction, -1 == actorOne.mass && (actorOne.speedX = 0, actorOne.speedY = 0), 
    -1 == actorTwo.mass && (actorTwo.speedX = 0, actorTwo.speedY = 0);
}, separateActors = function(actorOne, actorTwo, vertical) {
    0 != actorOne.mass && 0 != actorTwo.mass && (vertical ? (-1 != actorOne.mass && (actorOne.rect.loc.y = actorTwo.rect.loc.y - actorOne.rect.height), 
    -1 != actorTwo.mass && (actorTwo.rect.loc.y = actorOne.rect.loc.y + actorOne.rect.height)) : (-1 != actorOne.mass && (actorOne.rect.loc.x = actorTwo.rect.loc.x - actorOne.rect.width), 
    -1 != actorTwo.mass && (actorTwo.rect.loc.x = actorOne.rect.loc.x + actorOne.rect.width)));
};

Plx.Physics = function() {
    Plx.System.call(this), this.componentTypes = [ Plx.PhysicsComponent ], this.collisionPairs = [], 
    this.physicsComponents = {}, this.physicsComponents.none = [], this.beacon.observe(this, "addedToScene", this.onAddedToScene);
}, Plx.Physics.prototype = Object.create(Plx.System.prototype), Plx.Physics.prototype.constructor = Plx.Physics, 
Plx.Physics.prototype.onAddedToScene = function() {
    this.scene.beacon.observe(this, "updated", this.onSceneUpdated, 1);
}, Plx.Physics.prototype.addComponent = function(component) {
    if (!this.physicsComponents[component.collisionType]) throw new Error("Collion Type " + component.collisionType + ") not registered.");
    this.physicsComponents[component.collisionType].push(component);
}, Plx.Physics.prototype.removeComponent = function(component) {
    for (var j = this.physicsComponents[component.collisionType].length - 1; j >= 0; j--) {
        var otherComponent = this.physicsComponents[component.collisionType][j];
        otherComponent == component && this.physicsComponents[component.collisionType].splice(j, 1);
    }
}, Plx.Physics.prototype.updatePhysicsSpeeds = function(componentList) {
    for (var i = 0; i < componentList.length; i++) {
        var component = componentList[i];
        component.speedY += component.gravity, 1 != component.friction && (component.speedX *= component.friction, 
        component.speedY *= component.friction), component.capSpeed && (component.speedX > component.speedXMax && (component.speedX = component.speedXMax), 
        component.speedX < -component.speedXMax && (component.speedX = -component.speedXMax), 
        component.speedY > component.speedYMax && (component.speedY = component.speedYMax), 
        component.speedY < -component.speedYMax && (component.speedY = -component.speedYMax)), 
        component.pendingMove.x = component.speedX, component.pendingMove.y = component.speedY, 
        component.nextRect.loc.x = component.rect.loc.x + component.speedX, component.nextRect.loc.y = component.rect.loc.y + component.speedY, 
        component.beacon.emit("speedUpdated", null);
    }
}, Plx.Physics.prototype.updatePhysicsLocations = function(componentList) {
    for (var i = 0; i < componentList.length; i++) {
        var component = componentList[i];
        component.lastRect.loc.x = component.rect.loc.x, component.lastRect.loc.y = component.rect.loc.y, 
        component.rect.loc.x += component.pendingMove.x, component.rect.loc.y += component.pendingMove.y, 
        component.beacon.emit("updated", null);
    }
}, Plx.Physics.prototype.calcCollisionData = function(actorOne, actorTwo) {
    var collisionPair = null;
    if (actorOne.nextRect.intersects(actorTwo.nextRect)) {
        var tempLeft = actorOne, tempRight = actorTwo;
        actorTwo.rect.loc.x < actorOne.rect.loc.x && (tempLeft = actorTwo, tempRight = actorOne);
        var tempTop = actorOne, tempBottom = actorTwo;
        actorTwo.rect.loc.y < actorOne.rect.loc.y && (tempTop = actorTwo, tempBottom = actorOne);
        var leftActor, rightActor, topActor, bottomActor = (tempRight.rect.loc.x - (tempLeft.rect.loc.x + tempLeft.rect.width), 
        tempBottom.rect.loc.y - (tempTop.rect.loc.y + tempTop.rect.height), null);
        leftActor = tempLeft, rightActor = tempRight, topActor = tempTop, bottomActor = tempBottom;
        var intersectData = calcIntersectTime(leftActor, rightActor, topActor, bottomActor);
        null == intersectData.xIntersectTime ? leftActor = rightActor = null : topActor = bottomActor = null, 
        leftActor || rightActor || topActor || bottomActor || (leftActor = tempLeft, rightActor = tempRight), 
        collisionPair = {
            leftActor: leftActor,
            rightActor: rightActor,
            topActor: topActor,
            bottomActor: bottomActor,
            intersectTime: intersectData.intersectTime,
            vertical: topActor && bottomActor ? !0 : !1
        };
    }
    return collisionPair;
}, Plx.Physics.prototype.findComponentCollisionPairs = function(component, intersectTimeOffset) {
    for (var collisionPairs = [], i = 0; i < this.collisionPairs.length; i++) {
        var pair = this.collisionPairs[i], collideeType = null;
        if (pair.typeOne == component.collisionType && (collideeType = pair.typeOne), pair.typeTwo == component.collisionType && (collideeType = pair.typeTwo), 
        collideeType) for (var collideeList = this.physicsComponents[collideeType], j = 0; j < collideeList.length; j++) {
            var otherComponent = collideeList[j], collisionPair = this.calcCollisionData(component, otherComponent);
            collisionPair && (collisionPair.intersectTime += intersectTimeOffset, collisionPairs.push(collisionPair));
        }
    }
    return collisionPairs;
}, Plx.Physics.prototype.findAllCollisionPairs = function(sort) {
    for (var collisionPairs = [], i = 0; i < this.collisionPairs.length; i++) for (var pair = this.collisionPairs[i], listOneType = pair.typeOne, listTwoType = pair.typeTwo, listOne = this.physicsComponents[listOneType], listTwo = this.physicsComponents[listTwoType], j = 0; j < listOne.length; j++) {
        var component = listOne[j];
        if (component.collisionEnabled) {
            var start = 0;
            listOneType == listTwoType && (start = j + 1);
            for (var k = start; k < listTwo.length; k++) {
                var otherComponent = listTwo[k];
                if (otherComponent.collisionEnabled) {
                    var collisionPair = this.calcCollisionData(component, otherComponent);
                    collisionPair && collisionPairs.push(collisionPair);
                }
            }
        }
    }
    return sort && collisionPairs.sort(function(a, b) {
        return a.intersectTime - b.intersectTime;
    }), collisionPairs;
}, Plx.Physics.prototype.resolveCollisionPairs = function(collisionPairs) {
    for (;collisionPairs.length; ) {
        var component, otherComponent, componentSpeed, otherComponentSpeed, collisionPair = collisionPairs.shift();
        if (collisionPair.leftActor ? (component = collisionPair.leftActor, otherComponent = collisionPair.rightActor, 
        componentSpeed = component.speedX, otherComponentSpeed = otherComponent.speedX) : collisionPair.topActor && (component = collisionPair.topActor, 
        otherComponent = collisionPair.bottomActor, componentSpeed = component.speedY, otherComponentSpeed = otherComponent.speedY), 
        component.resolutionEnabled && otherComponent.resolutionEnabled) {
            if (component.rect.loc.x += component.speedX * collisionPair.intersectTime, component.rect.loc.y += component.speedY * collisionPair.intersectTime, 
            otherComponent.rect.loc.x += otherComponent.speedX * collisionPair.intersectTime, 
            otherComponent.rect.loc.y += otherComponent.speedY * collisionPair.intersectTime, 
            calcPostCollisionSpeed(component, otherComponent, collisionPair.vertical), component.pendingMove.x = component.speedX * (1 - collisionPair.intersectTime), 
            component.pendingMove.y = component.speedY * (1 - collisionPair.intersectTime), 
            otherComponent.pendingMove.x = otherComponent.speedX * (1 - collisionPair.intersectTime), 
            otherComponent.pendingMove.y = otherComponent.speedY * (1 - collisionPair.intersectTime), 
            component.nextRect.loc.x = component.rect.loc.x + component.pendingMove.x, component.nextRect.loc.y = component.rect.loc.y + component.pendingMove.y, 
            otherComponent.nextRect.loc.x = otherComponent.rect.loc.x + otherComponent.pendingMove.x, 
            otherComponent.nextRect.loc.y = otherComponent.rect.loc.y + otherComponent.pendingMove.y, 
            1 == component.sponginess && 1 == otherComponent.sponginess) ;
            component.beacon.emit("collided", {
                physicsComponent: otherComponent,
                type: otherComponent.collisionType,
                colliderDirection: collisionPair.vertical ? "down" : "right"
            }), otherComponent.beacon.emit("collided", {
                physicsComponent: component,
                type: component.collisionType,
                colliderDirection: collisionPair.vertical ? "up" : "left"
            });
            for (var i = collisionPairs.length - 1; i >= 0; i--) {
                var colPair = collisionPairs[i], killPair = !1;
                (colPair.leftActor == component || colPair.rightActor == component || colPair.topActor == component || colPair.bottomActor == component) && (killPair = !0), 
                (colPair.leftActor == otherComponent || colPair.rightActor == otherComponent || colPair.topActor == otherComponent || colPair.bottomActor == otherComponent) && (killPair = !0), 
                killPair && collisionPairs.splice(i, 1);
            }
            collisionPairs.concat(this.findComponentCollisionPairs(component, collisionPair.intersectTime)), 
            collisionPairs.concat(this.findComponentCollisionPairs(otherComponent, collisionPair.intersectTime)), 
            collisionPairs.sort(function(a, b) {
                return a.intersectTime - b.intersectTime;
            });
        } else component.beacon.emit("collided", {
            physicsComponent: otherComponent,
            type: otherComponent.collisionType,
            colliderDirection: collisionPair.vertical ? "down" : "right"
        }), otherComponent.beacon.emit("collided", {
            physicsComponent: component,
            type: component.collisionType,
            colliderDirection: collisionPair.vertical ? "up" : "left"
        });
    }
}, Plx.Physics.prototype.onSceneUpdated = function() {
    var key;
    for (key in this.physicsComponents) this.updatePhysicsSpeeds(this.physicsComponents[key]);
    var collisionPairs = this.findAllCollisionPairs(!0);
    this.resolveCollisionPairs(collisionPairs);
    for (key in this.physicsComponents) this.updatePhysicsLocations(this.physicsComponents[key]);
}, Plx.Physics.prototype.addCollisionPair = function(typeOne, typeTwo) {
    for (var pairFound = !1, i = 0; i < this.collisionPairs.length; i++) {
        var pair = this.collisionPairs[i];
        (pair.typeOne == typeOne && pair.typeTwo == typeTwo || pair.typeOne == typeTwo && pair.typeTwo == typeOne) && (console.log("Collision pair already added to physics system (typeOne: //{typeOne}, typeTwo: //{typeTwo})"), 
        pairFound = !0);
    }
    pairFound || (this.collisionPairs.push(new Plx.CollisionPair(typeOne, typeTwo)), 
    this.physicsComponents.hasOwnProperty(typeOne) || (this.physicsComponents[typeOne] = []), 
    this.physicsComponents.hasOwnProperty(typeTwo) || (this.physicsComponents[typeTwo] = []));
}, Plx.Physics.prototype.destroy = function() {
    this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded), this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved), 
    this.scene.beacon.ignore(this, "updated", this.onSceneUpdated, 1);
}, Plx.CollisionPair = function(typeOne, typeTwo) {
    this.typeOne = typeOne, this.typeTwo = typeTwo;
}, Plx.PixelBlotRenderer = function() {
    Plx.System.call(this), this.componentTypes = [ Plx.PixelBlotMap ], this.pixelBlotMaps = [], 
    this.beacon.observe(this, "addedToScene", this.onAddedToScene), this.canvas = document.getElementById("canvas"), 
    this.context = this.canvas.getContext("2d"), this.flicker = !1, this.alphaFill = 1;
}, Plx.PixelBlotRenderer.prototype = Object.create(Plx.System.prototype), Plx.PixelBlotRenderer.prototype.constructor = Plx.PixelBlotRenderer, 
Plx.PixelBlotRenderer.prototype.onAddedToScene = function() {
    this.scene.beacon.observe(this, "rendered", this.onRendered, 10);
}, Plx.PixelBlotRenderer.prototype.addComponent = function(component) {
    this.pixelBlotMaps.push(component);
}, Plx.PixelBlotRenderer.prototype.removeComponent = function(component) {
    for (var j = this.pixelBlotMaps.length - 1; j >= 0; j--) {
        var otherComponent = this.pixelBlotMaps[j];
        component == otherComponent && this.pixelBlotMaps.splice(j, 1);
    }
}, Plx.PixelBlotRenderer.prototype.onRendered = function(event) {
    this.context.fillStyle = "rgba(0, 0, 0, " + this.alphaFill + ")", this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.pixelBlotMaps.length; i++) {
        var blotMap = this.pixelBlotMaps[i];
        if (blotMap.visible) for (var blotMapX = Math.floor(blotMap.loc.x + blotMap.speedX * event.data.frameProgress), blotMapY = Math.floor(blotMap.loc.y + blotMap.speedY * event.data.frameProgress), j = 0; j < blotMap.pixelBlots.length; j++) {
            var blot = blotMap.pixelBlots[j];
            this.flicker && (Math.random() < .2 ? blot.alpha = 1 : blot.alpha -= .05);
            var xOffset = 0, yOffset = 0;
            if (blot.alpha > 0) {
                this.context.fillStyle = "rgba(" + blot.red + "," + blot.green + "," + blot.blue + "," + blot.alpha + ")";
                var blotX = blotMapX + (blot.loc.x + xOffset) * blotMap.blotSize, blotY = blotMapY + (blot.loc.y + yOffset) * blotMap.blotSize;
                this.context.fillRect(blotX, blotY, blotMap.blotSize, blotMap.blotSize);
            }
        }
    }
}, Plx.PixelBlotRenderer.prototype.destroy = function() {
    this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved), this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
}, Plx.PointerInput = function() {
    Plx.System.call(this), this.componentTypes = [ Plx.Pointerable ], this.pointerComponents = [], 
    this.componentsInDrag = {}, this.pointers = {};
    var _this = this;
    this.mouseDownFunc = function(event) {
        _this.onMouseDown(event);
    }, this.mouseUpFunc = function(event) {
        _this.onMouseUp(event);
    }, this.mouseMoveFunc = function(event) {
        _this.onMouseMove(event);
    }, this.touchStartFunc = function(event) {
        _this.onTouchStart(event);
    }, this.touchEndFunc = function(event) {
        _this.onTouchEnd(event);
    }, this.touchMoveFunc = function(event) {
        _this.onTouchMove(event);
    }, this.touchCancelFunc = function(event) {
        _this.onTouchCancel(event);
    }, this.touchLeaveFunc = function(event) {
        _this.onTouchLeave(event);
    }, document.getElementById("canvas").addEventListener("mousedown", this.mouseDownFunc, !1), 
    document.getElementById("canvas").addEventListener("mouseup", this.mouseUpFunc, !1), 
    document.getElementById("canvas").addEventListener("mousemove", this.mouseMoveFunc, !1), 
    document.getElementById("canvas").addEventListener("touchstart", this.touchStartFunc, !1), 
    document.getElementById("canvas").addEventListener("touchend", this.touchEndFunc, !1), 
    document.getElementById("canvas").addEventListener("touchmove", this.touchMoveFunc, !1), 
    document.getElementById("canvas").addEventListener("touchcancel", this.touchCancelFunc, !1), 
    document.getElementById("canvas").addEventListener("touchleave", this.touchLeaveFunc, !1);
}, Plx.PointerInput.prototype = Object.create(Plx.System.prototype), Plx.PointerInput.prototype.constructor = Plx.PointerInput, 
Plx.PointerInput.prototype.update = function() {}, Plx.PointerInput.prototype.addComponent = function(component) {
    this.pointerComponents.push(component);
}, Plx.PointerInput.prototype.removeComponent = function(component) {
    var index = this.pointerComponents.indexOf(component);
    index >= 0 && (this.pointerComponents.splice(index, 1), this.componentsInDrag[component.id] && delete this.componentsInDrag[component.id]);
}, Plx.PointerInput.prototype.onMouseDown = function(event) {
    this.mouseDown = !0;
    var rect = document.getElementById("canvas").getBoundingClientRect();
    this.pointerStart("mouse", event.clientX - rect.left, event.clientY - rect.top);
}, Plx.PointerInput.prototype.onMouseUp = function() {
    this.mouseDown = !1, this.pointerEnd("mouse");
}, Plx.PointerInput.prototype.onMouseMove = function(event) {
    if (this.mouseDown) {
        var rect = document.getElementById("canvas").getBoundingClientRect();
        this.pointerMove("mouse", event.clientX - rect.left, event.clientY - rect.top);
    }
}, Plx.PointerInput.prototype.onTouchStart = function(event) {
    event.preventDefault();
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i], rect = document.getElementById("canvas").getBoundingClientRect();
        this.pointerStart(touch.identifier, touch.clientX - rect.left, touch.clientY - rect.top);
    }
}, Plx.PointerInput.prototype.onTouchEnd = function(event) {
    event.preventDefault();
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i];
        this.pointerEnd(touch.identifier);
    }
}, Plx.PointerInput.prototype.onTouchCancel = function(event) {
    this.onTouchEnd(event);
}, Plx.PointerInput.prototype.onTouchLeave = function(event) {
    this.onTouchEnd(event);
}, Plx.PointerInput.prototype.onTouchMove = function(event) {
    event.preventDefault();
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i], rect = document.getElementById("canvas").getBoundingClientRect();
        this.pointerMove(touch.identifier, touch.clientX - rect.left, touch.clientY - rect.top);
    }
}, Plx.PointerInput.prototype.pointerStart = function(id, x, y) {
    x /= this.scene.game.displayRatio, y /= this.scene.game.displayRatio;
    for (var pointer = this.pointers[id] = {
        x: x,
        y: y,
        target: null
    }, i = 0; i < this.pointerComponents.length; i++) {
        var pointerComponent = this.pointerComponents[i];
        if (pointerComponent.enabled && pointerComponent.collisionCheck(pointer.x, pointer.y)) {
            pointerComponent.beacon.emit("tapped", null), pointerComponent.beacon.emit("entered", null), 
            pointer.target = pointerComponent, pointerComponent.draggable && !this.componentsInDrag[pointerComponent.id] && (this.componentsInDrag[pointerComponent.id] = {
                xOffset: x - pointer.target.physics.x,
                yOffset: y - pointer.target.physics.y
            }, pointerComponent.beacon.emit("dragStarted", null));
            break;
        }
    }
}, Plx.PointerInput.prototype.pointerEnd = function(id) {
    var pointer = this.pointers[id];
    pointer && (pointer.target && (pointer.target.beacon.emit("lifted", null), pointer.target.beacon.emit("exited", null), 
    this.componentsInDrag[pointer.target.id] && (pointer.target.beacon.emit("dragEnded", null), 
    delete this.componentsInDrag[pointer.target.id])), delete this.pointers[id]);
}, Plx.PointerInput.prototype.pointerMove = function(id, x, y) {
    x /= this.scene.game.displayRatio, y /= this.scene.game.displayRatio;
    var pointer = this.pointers[id];
    if (pointer || (pointer = this.pointers[id] = {
        x: x,
        y: y,
        target: null
    }), pointer.x = x, pointer.y = y, pointer.target) if (this.componentsInDrag[pointer.target.id]) {
        var xOffset = this.componentsInDrag[pointer.target.id].xOffset, yOffset = this.componentsInDrag[pointer.target.id].yOffset;
        pointer.target.syncLocation(x, y, xOffset, yOffset);
    } else pointer.target.collisionCheck(pointer.x, pointer.y) || (pointer.target.beacon.emit("exited", null), 
    pointer.target = null); else for (var i = 0; i < this.pointerComponents.length; i++) {
        var pointerComponent = this.pointerComponents[i];
        if (pointerComponent.enabled && pointerComponent.collisionCheck(pointer.x, pointer.y)) {
            pointerComponent.beacon.emit("entered", null), pointer.target = pointerComponent;
            break;
        }
    }
}, Plx.PointerInput.prototype.destroy = function() {
    document.getElementById("canvas").removeEventListener("mousedown", this.mouseDownFunc, !1), 
    document.getElementById("canvas").removeEventListener("mouseup", this.mouseUpFunc, !1), 
    document.getElementById("canvas").removeEventListener("mousemove", this.mouseMoveFunc, !1), 
    document.getElementById("canvas").removeEventListener("touchstart", this.touchStartFunc, !1), 
    document.getElementById("canvas").removeEventListener("touchend", this.touchEndFunc, !1), 
    document.getElementById("canvas").removeEventListener("touchmove", this.touchMoveFunc, !1), 
    document.getElementById("canvas").removeEventListener("touchcancel", this.touchCancelFunc, !1), 
    document.getElementById("canvas").removeEventListener("touchleave", this.touchLeaveFunc, !1);
}, Plx.SpriteRenderer = function() {
    Plx.System.call(this), this.componentTypes = [ Plx.Sprite ], this.sprites = [], 
    this.beacon.observe(this, "addedToScene", this.onAddedToScene), this.canvas = document.createElement("canvas"), 
    this.context = this.canvas.getContext("2d"), this.displayCanvas = document.getElementById("canvas"), 
    this.displayContext = this.displayCanvas.getContext("2d"), this.smoothImages = !1, 
    this.camera = new Plx.Point();
}, Plx.SpriteRenderer.prototype = Object.create(Plx.System.prototype), Plx.SpriteRenderer.prototype.constructor = Plx.SpriteRenderer, 
Plx.SpriteRenderer.prototype.onAddedToScene = function() {
    this.scene.beacon.observe(this, "added", this.onSceneAddedToGame), this.scene.beacon.observe(this, "rendered", this.onRendered, 10), 
    this.scene.beacon.observe(this, "renderCompleted", this.onRenderCompleted);
}, Plx.SpriteRenderer.prototype.onSceneAddedToGame = function() {
    this.canvas.width = this.scene.game.width, this.canvas.height = this.scene.game.height, 
    this.scene.game.beacon.observe(this, "displayResized", this.onDisplayResized), this.onDisplayResized();
}, Plx.SpriteRenderer.prototype.onDisplayResized = function() {
    this.smoothImages || (this.context.imageSmoothingEnabled = !1, this.context.mozImageSmoothingEnabled = !1, 
    this.context.webkitImageSmoothingEnabled = !1, this.displayContext.imageSmoothingEnabled = !1, 
    this.displayContext.mozImageSmoothingEnabled = !1, this.displayContext.webkitImageSmoothingEnabled = !1);
}, Plx.SpriteRenderer.prototype.addComponent = function(component) {
    for (var inserted = !1, i = 0; i < this.sprites.length; i++) {
        var sprite = this.sprites[i];
        if (sprite.z > component.z) {
            inserted = !0, this.sprites.splice(i, 0, component);
            break;
        }
    }
    inserted || this.sprites.push(component), component.beacon.observe(this, "updatedZIndex", this.onSpriteUpdatedZIndex);
}, Plx.SpriteRenderer.prototype.removeComponent = function(component) {
    for (var i = this.sprites.length - 1; i >= 0; i--) {
        var otherComponent = this.sprites[i];
        component == otherComponent && (component.beacon.ignore(this, "updatedZIndex", this.onSpriteUpdatedZIndex), 
        this.sprites.splice(i, 1));
    }
}, Plx.SpriteRenderer.prototype.onSpriteUpdatedZIndex = function(event) {
    var sprite = event.beacon.owner;
    this.removeComponent(sprite), this.addComponent(sprite);
}, Plx.SpriteRenderer.prototype.onRendered = function(event) {
    this.context.fillStyle = "rgba(0, 0, 0, 1)", this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this.sprites.length; i++) {
        var sprite = this.sprites[i];
        if (sprite.visible && sprite.anim && sprite.frame) {
            var spriteX = sprite.loc.x + sprite.speedX * event.data.frameProgress - this.camera.x, spriteY = sprite.loc.y + sprite.speedY * event.data.frameProgress - this.camera.y, drawOffsetX = 0, drawOffsetY = 0, image = this.scene.game.spriteStore.images[sprite.frame.image];
            if (sprite.flippedX || sprite.flippedY || sprite.rotation || 1 != sprite.alpha) {
                if (this.context.save(), sprite.rotation && (this.context.translate(Math.round(spriteX + sprite.anchor.x * sprite.scaleX), Math.round(spriteY + sprite.anchor.y * sprite.scaleY)), 
                drawOffsetX = -sprite.anchor.x * sprite.scaleX, drawOffsetY = -sprite.anchor.y * sprite.scaleY, 
                this.context.rotate(sprite.rotation), spriteX = 0, spriteY = 0), sprite.flippedX || sprite.flippedY) {
                    var flipX = sprite.flippedX ? 1 : 0, flipY = sprite.flippedY ? 1 : 0, scaleX = sprite.flippedX ? -1 : 1, scaleY = sprite.flippedY ? -1 : 1;
                    this.context.translate(Math.round(spriteX + sprite.frame.width * sprite.scaleX * flipX), Math.round(spriteY + sprite.frame.height * sprite.scaleY * flipY)), 
                    this.context.scale(scaleX, scaleY), spriteX = 0, spriteY = 0;
                }
                this.context.drawImage(image, sprite.frame.x, sprite.frame.y, sprite.frame.width, sprite.frame.height, 0 + drawOffsetX, 0 + drawOffsetY, Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY)), 
                this.context.restore();
            } else this.context.drawImage(image, sprite.frame.x, sprite.frame.y, sprite.frame.width, sprite.frame.height, Math.round(spriteX), Math.round(spriteY), Math.round(sprite.frame.width * sprite.scaleX), Math.round(sprite.frame.height * sprite.scaleY));
        }
    }
    this.beacon.emit("renderingCompleted", null);
}, Plx.SpriteRenderer.prototype.onRenderCompleted = function() {
    this.displayContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
}, Plx.SpriteRenderer.prototype.destroy = function() {
    this.scene.beacon.ignore(this, "entityAdded", this.onEntityAdded), this.scene.beacon.ignore(this, "entityRemoved", this.onEntityRemoved), 
    this.scene.beacon.ignore(this, "rendered", this.onRendered, 10);
};