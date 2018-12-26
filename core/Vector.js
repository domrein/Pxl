export default class Vector {
  /**
  * @param {Vector} vector
  * @param {number} multiplier
  * @returns {Vector}
  */
  static multiply(vector, multiplier) {
    return new Vector(vector.m * multiplier, vector);
  }

  /**
  * @param {Vector} vector
  * @returns {Vector}
  */
  static clone(vector) {
    return new Vector(vector.m, vector.d);
  }

  constructor(magnitude, direction) {
    /** @type {number} */
    this._m = magnitude || 0;
    /** @type {number} */
    this._d = direction || 0;
    /** @type {number} */
    this._x = null;
    /** @type {number} */
    this._y = null;
  }

  /**
  * @returns {number}
  */
  get m() {
    return this._m;
  }

  /**
  * @param {number} val
  */
  set m(val) {
    this._m = val;

    this._x = null;
    this._y = null;
  }

  /**
  * @returns {number}
  */
  get d() {
    return this._d;
  }

  /**
  * @param {number} val
  */
  set d(val) {
    this._d = val;

    this._x = null;
    this._y = null;
  }

  /**
  * @returns {number}
  */
  get x() {
    if (this._x === null) {
      this._x = this.m * Math.cos(this.d);
    }

    return this._x;
  }

  /**
  * @returns {number}
  */
  set x(val) {
    this._x = val;

    this._y = null;
    this._m = (this.x ** 2 + this.y ** 2) ** 0.5;
    this._d = Math.atan2(this.y, this.x);
  }

  /**
  * @returns {number}
  */
  get y() {
    if (this._y === null) {
      this._y = this.m * Math.sin(this.d);
    }

    return this._y;
  }

  /**
  * @returns {number}
  */
  set y(val) {
    this._y = val;

    this._x = null;
    this._m = (this.x ** 2 + this.y ** 2) ** 0.5;
    this._d = Math.atan2(this.y, this.x);
  }

  /**
  * @param {Vector} vector
  */
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

  /**
  * @param {Vector} vector
  */
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
