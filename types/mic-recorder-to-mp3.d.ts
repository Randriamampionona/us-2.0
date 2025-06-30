declare module "mic-recorder-to-mp3" {
  export default class MicRecorder {
    constructor(config?: {
      bitRate?: number;
      sampleRate?: number;
      encoderPath?: string;
      lamejsUrl?: string;
    });
    start(): Promise<void>;
    stop(): {
      getMp3(): Promise<[ArrayBuffer, Blob]>;
    };
  }
}
