Pxl.EntityFactory = function(game) {
  this.entityPool = {};
  this.entityTypes = {};
  this.game = game;
};

// componentList is a component type and any values that should be set on it
// TODO: allow extension of types extendType (maybe cloneType with overrides?)
Pxl.EntityFactory.prototype.registerType = function(name, componentList) {
  if (this.entityTypes[name])
    throw new Error("type (" + name + ") already registered in EntityFactory");
  this.entityTypes[name] = {componentList: componentList};
  this.entityPool[name] = [];
};

Pxl.EntityFactory.prototype.createType = function(typeName, defaultOverrides) {
  // look in pool for type before creating
  var entityType = this.entityTypes[typeName];
  if (!entityType)
    throw new Error("type (" + typeName + ") not found in entityTypes")
  if (this.entityPool[typeName].length) {
    var entity = this.entityPool[typeName].pop();
  }
  // create entity with components if needed
  else {
    entity = new Pxl.Entity();
    entity.typeName = typeName;
    entity.game = this.game;
    for (var i = 0; i < entityType.componentList.length; i ++) {
      var listItem = entityType.componentList[i];
      var component = new listItem.type();
      component.entity = entity;
      component.name = listItem.name;
      entity.addComponent(component);
    }
  }

  entity.reset();
  // set defaults on all components
  for (i = 0; i < entity.components.length; i ++) {
    listItem = entityType.componentList[i];
    component = entity.components[i];
    for (var key in listItem.params)
      component[key] = this.clone(listItem.params[key]);
  }
  // set any default overrides
  for (var defaultOverride in defaultOverrides) {
    component = entity.fetchComponentByName(defaultOverride);
    for (key in defaultOverrides[defaultOverride])
      component[key] = this.clone(defaultOverrides[defaultOverride][key]);
  }

  // call init on components after they've all been created, added and defaults initialized
  for (i = 0; i < entity.components.length; i ++)
    entity.components[i].init();

  return entity;
};

Pxl.EntityFactory.prototype.returnEntity = function(entity) {
  this.entityPool[entity.typeName].push(entity);
};

// this is used for cloning default and override objects
Pxl.EntityFactory.prototype.clone = function(source) {
  if (typeof source != "object" || source == null)
    return source;

  var dest = {};
  for (var key in source) {
    if (typeof source[key] == "object" && source[key] != null)
      dest[key] = clone(source[key]);
    else
      dest[key] = source[key];
  }

  return dest;
}