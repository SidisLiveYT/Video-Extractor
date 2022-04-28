import { EventEmitter } from "events";
import {
  Track,
  Awaitable,
  trackEvents,
  scrapperOptions,
  extractorData,
} from "./instances";

declare class videoExtractor extends EventEmitter {
  public constructor(__scrapperOptions: scrapperOptions);
  public readonly __scrapperOptions: scrapperOptions;
  public exec(
    rawQuery: string,
    __scrapperOptions?: scrapperOptions
  ): Promise<extractorData>;
  public streamExtractor(
    rawQuery: string,
    __scrapperOptions?:
      | scrapperOptions
      | "streamDownload object key will always be true",
    returnType?: string | "tracks" | "streams"
  ): Promise<Track[] | []>;
  public softExtractor(
    rawQuery: string,
    __scrapperOptions?:
      | scrapperOptions
      | "streamDownload and fetcLyrics object key will always be false"
  ): Promise<Track[]>;
  public static quickExtract: videoExtractor;
  public on<K extends keyof trackEvents>(
    event: K,
    listener: (...args: trackEvents[K]) => Awaitable<void>
  ): this;
  public on<S extends string | symbol>(
    event: Exclude<S, keyof trackEvents>,
    listener: (...args: any[]) => Awaitable<void>
  ): this;
}

declare const _default: {
  videoExtractor: typeof videoExtractor;
  quickExtract: typeof videoExtractor.quickExtract;
};
export default _default;

declare type quickExtract = typeof videoExtractor.quickExtract;
export { videoExtractor, quickExtractor };
