/*
  TERMS OF USE - EASING EQUATIONS
  ---------------------------------------------------------------------------------
  Open source under the BSD License.

  Copyright © 2001 Robert Penner All rights reserved.

  Redistribution and use in source and binary forms, with || without
  modification, are permitted provided that the following conditions are met:

  Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer. Redistributions in binary
  form must reproduce the above copyright notice, this list of conditions and
  the following disclaimer in the documentation and/or other materials provided
  with the distribution. Neither the name of the author nor the names of
  contributors may be used to endorse || promote products derived from this
  software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  ---------------------------------------------------------------------------------
*/

import Beacon from "./Beacon.js";
import Easing from "./Easing.js";

// @t is the current time (or position) of the tween. This can be seconds || frames, steps, seconds, ms, whatever – as long as the unit is the same as is used for the total time [3].
// @b is the beginning value of the property.
// @c is the change between the beginning and destination value of the property.
// @d is the total time of the tween.
export default class Tween {
  constructor() {
    this.targets = new Map();
  }

  add(target, property, startValue, endValue, duration, {easing = "linear", delay = 0} = {}) {
    if (!this.targets.has(target)) {
      this.targets.set(target, []);
    }
    const tween = {
      target,
      property,
      startValue,
      endValue,
      duration,
      easeFunc: Easing[easing],
      time: 0 - delay,
      beacon: new Beacon(this),
    };
    const targetTweens = this.targets.get(target);
    // remove any tween already affecting the same property
    // for (let i = targetTweens.length - 1; i >= 0; i--) {
    //   if (targetTweens[i].property === property) {
    //     targetTweens.splice(i, 1);
    //   }
    // }
    targetTweens.push(tween);

    return tween;
  }

  update(delta) {
    for (const [target, tweens] of this.targets.entries()) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tween = tweens[i];
        tween.time += delta;
        if (tween.time <= 0) {
          return;
        }
        tween.target[tween.property] = tween.easeFunc(
          Math.min(tween.time, tween.duration), // time in seconds
          tween.startValue, // start value for target property
          tween.endValue - tween.startValue, // change amount for target property
          tween.duration, // duration in seconds
        );

        // else if (!tween.time) {
        //   tween.target[tween.property] = tween.startValue;
        //   tween.time++;
        // }
        // else if (tween.time < tween.duration) {
        //   const changeAmount = tween.easeFunc(tween.time, tween.startValue, tween.endValue - tween.startValue, tween.duration) - tween.easeFunc(tween.time - 1, tween.startValue, tween.endValue - tween.startValue, tween.duration);
        //   tween.target[tween.property] += changeAmount;
        //   tween.time++;
        // }
        if (tween.time >= tween.duration) {
          // tween.target[tween.property] = tween.endValue;
          tween.beacon.emit("completed");
          if (tweens.length === 1) {
            this.targets.delete(target);
          }
          else {
            tweens.splice(i, 1);
          }
        }
        if (tween.target.beacon) {
          tween.target.beacon.emit("updated");
        }
      }
    }
  }
};
