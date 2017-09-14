export default class DataStore {
  constructor() {
    this.data = {};
  }

  addData(data, name) {
    this.data[name] = data;
  }
};
