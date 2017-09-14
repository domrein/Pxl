export default class Vector {
  constructor(magnitude, direction) {
    this._m = magnitude || 0;
    this._d = direction || 0;
    this._x = null;
    this._y = null;
  }

  get m() {
    return this._m;
  }

  set m(val) {
    this._m = val;

    this._x = null;
    this._y = null;
  }

  get d() {
    return this._d;
  }

  set d(val) {
    this._d = val;

    this._x = null;
    this._y = null;
  }

  get x() {
    if (this._x === null) {
      this._x = this.m * Math.cos(this.d);
    }

    return this._x;
  }

  set x (val) {
    this._x = val;

    this._y = null;
    this._m = (this.x ** 2 + this.y ** 2) ** 0.5;
    this._d = Math.atan2(this.y, this.x);
  }

  get y() {
    if (this._y === null) {
      this._y = this.m * Math.sin(this.d);
    }

    return this._y;
  }

  set y(val) {
    this._y = val;

    this._x = null;
    this._m = (this.x ** 2 + this.y ** 2) ** 0.5;
    this._d = Math.atan2(this.y, this.x);
  }

  add(vector) {
    // add x components
    // add y components
    // use pythagoreom to figure out new magnitude and direction

    const x = this.x + vector.x;
    const y = this.y + vector.y;

    this.m = (x ** 2 + y ** 2) ** 0.5;
    this.d = Math.atan2(y, x);

    this._x = null;
    this._y = null;
  }

  addClamped(vector) {
    // if this addition made m go past maxM, back it off to maxM or subtract out m from new vector, whichever is greater
    this.add(vector);

    // clamp x
    if (vector.x > 0 && this.x > vector.x) {
      this.x = Math.max(this.x - vector.x, vector.x);
    }
    else if (vector.x < 0 && this.x < vector.x) {
      this.x = Math.min(this.x - vector.x, vector.x);
    }

    // clamp y
    if (vector.y > 0 && this.y > vector.y) {
      this.y = Math.max(this.y - vector.y, vector.y);
    }
    else if (vector.y < 0 && this.y < vector.y) {
      this.y = Math.min(this.y - vector.y, vector.y);
    }
  }
};
