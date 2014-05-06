Pxl.Utils = {};
Pxl.Utils.random = function(min, max, round) {
  var num = Math.random() * (max - min) + min;
  if (round)
    num = Math.round(num);
  return num;
};

Pxl.Utils.randomOffset = function(dist, distVariance) {
  var angle = Math.random() * Math.PI * 2;
  dist += Math.random() * distVariance;
  return new Point(Math.cos(angle) * dist, Math.sin(angle) * dist);
};

Pxl.Utils.removeFromArray = function(array, targetObject, removeAll) {
  if (removeAll != false)
    removeAll = true
  for (var i = array.length - 1; i >= 0; i --) {
    var object = array[i];
    if (object == targetObject)
    {
      array.splice(i, 1);
      if (!removeAll)
        return;
    }
  }
};
