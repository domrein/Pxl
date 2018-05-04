/*
Paul Milham
12/26/17
*/

// global seed (for testing)
let seed = null;
// radians in a circle
const CIRCLE_RADIANS = Math.PI * 2;

// distribution test
// const nums = {};
// for (let i = 0; i < 1000000; i++) {
//   let num = int(0, 100);
//   if (!nums[num]) {
//     nums[num] = 1;
//   }
//   else {
//     nums[num]++;
//   }
// }
// console.log(nums);

export default class Random {
  static get seed() {
    return seed;
  }

  // this should be set before intantiating instances
  static set seed(val) {
    seed = val;
    console.warn(`Setting global random seed to ${val}`);
  }

  // only pass in seed if you want a random repeatable sequence for this instance
  constructor(_seed = null) {
    // instance seed
    if (_seed) {
      this.state = _seed;
    }
    // global seed
    else if (seed) {
      this.state = seed;
    }
    // random seed
    else {
      this.state = Math.floor(Math.random() * 1000000)
    }
    this.increment = seed % 10 + 1;
  }

  int(min, max) {
    const range = max - min;
    const i = Math.floor(this.rand() * range + min);

    return i;
  }

  float(min, max) {
    const range = max - min;

    return this.rand() * range + min;
  }

  // min = "a", max = "d"
  letter(min, max) {
    const range = max.charCodeAt(0) - min.charCodeAt(0);

    return String.fromCharCode(this.rand() * range + min.charCodeAt(0));
  }

  // random radian in circle
  radian(start = 0, end = CIRCLE_RADIANS) {
    while (end < start) {
      end += CIRCLE_RADIANS;
    }
    const range = end - start;
    let r = this.rand() * range + start;
    while (r > CIRCLE_RADIANS) {
      r -= CIRCLE_RADIANS;
    }

    return r;
  }

  // applies Math.PI
  piRadian(start = 0, end = 2) {
    return this.radian(start * Math.PI, end * Math.PI);
  }

  // percentage of circle
  percentRadian(start = 0, end = 1) {
    return this.radian(start * Math.PI * 2, end * Math.PI * 2);
  }

  // returns random item in array
  item(array) {
    if (!array.length) {
      return null;
    }

    return array[int(0, array.length)];
  }

  // mutates this.state on every call
  rand() {
    // update state with xorshift
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;

    // normalize
    const num = Math.abs(this.state) / Math.abs(~(1 << 31));

    return num === 1 ? 0 : num;
  }

  chance(percent) {
    if (percent > 1) {
      percent /= 100;
    }

    return this.rand() < percent;
  }
};
