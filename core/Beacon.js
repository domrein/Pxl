export default class Beacon {
  constructor(owner) {
    this.owner = owner;
    this.reset();
  }

  reset() {
    // WHEEEE! Break the observer pattern. :)
    this.observerGroups = [];
  }

  // lower precedence gets called first
  observe(observer, signal, precedence, callback) {
    if (callback === undefined) {
      callback = precedence;
      precedence = 0;
    }

    const observerGroup = {
      observer: observer,
      signal: signal,
      precedence: precedence,
      callback: callback,
    };
    let inserted = false;
    for (let i = 0; i < this.observerGroups.length; i++) {
      if (this.observerGroups[i].precedence > observerGroup.precedence) {
        this.observerGroups.splice(i, 0, observerGroup);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.observerGroups.push(observerGroup);
    }
  }

  ignore(observer, signal, callback) {
    for (let i = this.observerGroups.length - 1; i >= 0; i--) {
      var observerGroup = this.observerGroups[i];
      if (observerGroup.observer === observer && observerGroup.signal === signal && observerGroup.callback === callback) {
        this.observerGroups.splice(i, 1);
      }
    }
  }

  emit(signal, ...args) {
    // var event = new Pxl.Event(this, data);
    // find all the observerGroups with matching signals
    for (const observerGroup of this.observerGroups) {
      if (observerGroup.signal === signal) {
        observerGroup.callback.call(observerGroup.observer, this, ...args);
      }
    }
    // var matches = null;
    // var observerGroup;
    // for (let i = 0; i < this.observerGroups.length; i ++) {
    //   observerGroup = this.observerGroups[i];
    //   if (observerGroup.signal === signal) {
    //     if (!matches) {
    //       matches = [];
    //     }
    //     matches.push(observerGroup);
    //   }
    // }
    // // pass along event for all groups that matched
    // if (matches) {
    //   for (let i = 0; i < matches.length; i ++) {
    //     observerGroup = matches[i];
    //     if (!event.consumed) {
    //       observerGroup.callback.apply(observerGroup.observer, args);
    //     }
    //   }
    // }
  }

  destroy() {
    this.observerGroups = [];
  }
};
