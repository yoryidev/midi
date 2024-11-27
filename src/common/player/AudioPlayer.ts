export default class AudioPlayer {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private _isPlaying: boolean = false;
  private _isPaused: boolean = false;
  private startTime: number = 0; // Timestamp when playback started
  private pausedAt: number = 0; // Timestamp where the audio was paused in seconds
  private defaultBPM: number = 100;
  private currentBPM: number = 100;
  private _volume: number = 1.0;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.setVolume(this._volume);
  }

  async loadAudio(url: string): Promise<number> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log("Audio loaded with BPM:", this.defaultBPM);
      return this.currentBPM;
    } catch (error) {
      console.error("Error loading audio:", error);
      throw error;
    }
  }

  play(offset: number = 0): void {
    if (!this.audioBuffer) {
      console.warn("No audio file loaded");
      return;
    }

    if (this._isPlaying) {
      this.stop();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.createAudioSource();
    const playbackRate = this.currentBPM / this.defaultBPM;
    this.audioSource!.playbackRate.value = playbackRate;

    // Adjust offset to ensure precise resume
    const adjustedOffset = offset / playbackRate;
    this.audioSource!.start(0, adjustedOffset);

    this.startTime = this.audioContext.currentTime - adjustedOffset;
    this._isPlaying = true;
    this._isPaused = false;
  }

  private createAudioSource(): void {
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.audioBuffer;
    this.audioSource.connect(this.gainNode);
    this.audioSource.onended = () => {
      this._isPlaying = false;
    };
  }

  pause(): void {
    if (!this._isPlaying || this._isPaused) {
      return;
    }

    // Save the paused position based on `audioContext.currentTime`
    const playbackRate = this.currentBPM / this.defaultBPM;
    this.pausedAt = (this.audioContext.currentTime - this.startTime) * playbackRate;

    this.stop();
    this._isPaused = true;
    console.log("Paused at:", this.pausedAt);
  }

  resume(): void {
    if (!this._isPaused) {
      return;
    }

    console.log("Resuming from:", this.pausedAt);
    this.play(this.pausedAt);
    this._isPaused = false;
  }

  stop(): void {
    if (this.audioSource) {
      try {
        this.audioSource.stop();
      } catch (e) {
        console.warn("Error stopping audio source:", e);
      }
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    this._isPlaying = false;
    this._isPaused = false;
  }

  setBPM(newBPM: number): void {
    this.currentBPM = newBPM;
    if (this.audioSource && this._isPlaying) {
      const playbackRate = this.currentBPM / this.defaultBPM;
      this.audioSource.playbackRate.value = playbackRate;
    }
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value));
    this.gainNode.gain.value = this._volume;
  }

  get volume(): number {
    return this._volume;
  }

  set currentTime(time: number) {
    if (!this.audioBuffer) {
      console.warn("No audio loaded to set the currentTime.");
      return;
    }

    const clampedTime = Math.max(0, Math.min(time, this.duration));

    if (this._isPlaying) {
      this.stop();
      this.play(clampedTime);
    } else {
      this.pausedAt = clampedTime;
      this._isPaused = true;
      console.log(`Current time set to: ${this.pausedAt} ms (paused)`);
    }
  }

  get duration(): number {
    return this.audioBuffer ? this.audioBuffer.duration * 1000 : 0;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
