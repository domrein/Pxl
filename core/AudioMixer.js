/*
Paul Milham
2/20/16
*/

export default class AudioMixer {
  constructor() {
    this.audio = {};
    this.context = null;
  }

  play(sound) {
    const source = this.context.createBufferSource();
    source.buffer = this.audio[sound];
    source.connect(this.context.destination);
    source.start(0);
  }

  onContextCreated(source, context) {
    this.context = context;
  }

  onAudioLoaded(source, buffer, name) {
    this.audio[name] = buffer;
  }
};
