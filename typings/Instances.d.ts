declare type fetchOptions = {
  fetchLimit?: number;
  streamQuality?: string;
  rawCookies?: string;
  userAgents?: string[];
};

export type scrapperOptions = {
  fetchLyrics?: boolean | "true";
  eventReturn?: { metadata?: any };
  ratelimit?: number;
  ignoreInternalError?: boolean | "true";
  fetchOptions?: fetchOptions;
  streamDownload?: boolean | "false";
};

export type extractorData = {
  playlist: boolean;
  tracks: Array<Track>;
};

export class Track {
  public getStream(streamMetadata: {}, __cacheMain: {}): Promise<Track>;
  public getLyrics(): Promise<string>;
  readonly trackId: number;
  readonly url: string;
  readonly videoId: string | number;
  readonly title: string;
  readonly description: string;
  readonly author: { name: string; url: string };
  readonly extractorModel: {
    orignal:
      | string
      | "deezer"
      | "youtube"
      | "spotify"
      | "facebook"
      | "reverbnation"
      | "soundcloud"
      | "arbitary";
    custom: string | "youtube-dl";
  };
  readonly duration: {
    ms: number;
    readable: string;
  };
  readonly videoMetadata: {
    video: Object[];
    audio: string;
  };
  readonly thumbnail: {
    Id: string | number;
    metadata: Object[];
  };
  readonly channel: {
    name: string;
    Id: string | number;
    url: string;
  };
  readonly isLive: boolean;
  readonly ratings: {
    likes: number | string;
    dislikes: number | string;
  };
  readonly streamMetadata: {
    buffer:
      | string
      | ReadableStream<Buffer>
      | "Fetched Stream from youtube-dl using stream() function or ffmpeg parsed Stream Url";
    videoId: string;
    type: string;
    duration: {
      ms: number;
      readable: string;
    };
  };
  readonly lyrics:
    | string
    | ""
    | "Lyrics fetched from Un-Official Source , so limited Resources are expected";
  readonly raw: {} | "Unparsed and fetched Track Data from youtube-dl";
}

export type Awaitable<T> = T | PromiseLike<T>;

export interface trackEvents {
  tracks: [
    orignalExtractor:
      | string
      | "deezer"
      | "youtube"
      | "spotify"
      | "facebook"
      | "reverbnation"
      | "soundcloud"
      | "arbitary",
    track: Track,
    metadata: any
  ];
}
