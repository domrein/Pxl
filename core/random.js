let seed = 0;
let state = 0;
let increment = 0;

export const setSeed = (val, warn = true) => {
  if (warn) {
    console.warn(`Setting random seed to ${val}`);
  }
  seed = val;
  state = seed;
  increment = seed % 10 + 1;
}

setSeed(Math.floor(Math.random() * 1000000), false);

export const int = (min, max) => {
  const range = max - min;
  const i = Math.floor(rand() * range + min);
  // console.log(i);
  return i;
};

export const float = (min, max) => {
  const range = max - min;
  return rand() * range + min;
};

// radians in a circle
const radians = Math.PI * 2;
// random radian in circle
export const radian = (start = 0, end = radians) => {
  while (end < start) {
    end += radians;
  }
  const range = end - start;
  let r = rand() * range;
  while (r > radians) {
    r -= radians;
  }

  return r;
};

// returns random item in array
export const item = array => {
  if (!array.length) {
    return null;
  }

  return array[int(0, array.length)];
}

export const rand = () => {
  // update state with xorshift
  state ^= state << 13;
  state ^= state >> 17;
  state ^= state << 5;

  // normalize
  const num = Math.abs(state) / Math.abs(~(1 << 31));

  return num === 1 ? 0 : num;
};

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

export const chance = percent => {
  if (percent > 1) {
    percent /= 100;
  }

  return rand() < percent;
};
