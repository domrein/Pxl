Plx.EntityFactory = function(game) {
  this.entityPool = {};
  this.entityTypes = {};
  this.game = game;
};

// componentList is a component type and any values that should be set on it
Plx.EntityFactory.prototype.registerType = function(name, componentList) {
  if (this.entityTypes[name])
    throw new Error("type (" + name + ") already registered in EntityFactory");
  this.entityTypes[name] = {componentList: componentList};
  this.entityPool[name] = [];
};

Plx.EntityFactory.prototype.createType = function(typeName, defaultOverrides) {
  // look in pool for type before creating
  var entityType = this.entityTypes[typeName];
  if (!entityType)
    throw new Error("type (" + typeName + ") not found in entityTypes")
  if (this.entityPool[typeName].length) {
    var entity = this.entityPool[typeName].pop();
  }
  // create entity with components if needed
  else {
    entity = new Plx.Entity();
    entity.game = this.game;
    for (var i = 0; i < entityType.componentList.length; i ++) {
      var listItem = entityType.componentList[i];
      var component = new listItem.type();
      component.name = listItem.name;
      entity.addComponent(component);
    }
  }

  // set defaults on all components
  // TODO: defaults can only be primitives right now, make it so we can set nested variables and objects as defaults
  for (i = 0; i < entity.components.length; i ++) {
    listItem = entityType.componentList[i];
    component = entity.components[i];
    for (key in listItem.params)
      component[key] = listItem.params[key];
  }
  // set any default overrides
  for (i = 0; i < defaultOverrides; i ++) {
    var defaultOverride = defaultOverrides[i];
    component = entity.fetchComponentByName(defaultOverride.name);
    for (key in defaultOverride.params)
      component[key] = defaultOverride.params[key];
  }

  // call init on components after they've all been created, added and defaults initialized
  for (i = 0; i < entity.components.length; i ++)
    entity.components[i].init();

  return entity;
};

Plx.EntityFactory.prototype.retire = function(entity) {
};