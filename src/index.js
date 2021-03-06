const path = require('path');
const EventEmitter = require('events');
const fileSystem = require('fs');
const spotify = require('./bin/__spotify');
const youtube = require('./bin/__youtube');
const soundcloud = require('./bin/__soundCloud');
const reverbnation = require('./bin/__reverbnation');
const Track = require('./bin/__trackModeler');
const youtubeDLEngine = require('./bin/__youtubeDLEngine');

/**
 * @class videoExtractor -> Main Handler to Fetch and Parse Songs from Youtube , SoundCloud and many Others from youtube-dl as its base source
 */

class videoExtractor extends EventEmitter {
  /**
   * @constructor
   * @param {scrapperOptions} __scrapperOptions -> Scrapping Options for functions and base Source Engine
   */
  constructor(
    __scrapperOptions = videoExtractor.#__privateCaches.__scrapperOptions,
  ) {
    super();
    this.__scrapperOptions = {
      ...videoExtractor.#__privateCaches.__scrapperOptions,
      ...__scrapperOptions,
      fetchOptions: {
        ...videoExtractor.#__privateCaches?.fetchOptions,
        ...__scrapperOptions?.fetchOptions,
      },
    };
  }

  /**
   * @static
   * @private
   * @property {Object} #__privateCaches -> Private Caches for functions to Store basic Options and Queue Data for Ratelimit
   */
  static #__privateCaches = {
    __ratelimitQueue: undefined,
    fetchOptions: {
      fetchLimit: Infinity,
      streamQuality: undefined,
      proxies: undefined,
      cookiesFile: undefined,
      rawCookies: undefined,
      userAgents: undefined,
      skipPlaylistLimit: true,
    },
    __scrapperOptions: {
      fetchLyrics: true,
      eventReturn: { metadata: undefined },
      ratelimit: 0,
      ignoreInternalError: true,
      fetchOptions: {
        fetchLimit: Infinity,
        streamQuality: undefined,
        proxies: undefined,
        cookiesFile: undefined,
        rawCookies: undefined,
        userAgents: undefined,
        skipPlaylistLimit: true,
      },
      streamDownload: false,
    },
  };

  /**
   * exec() -> Raw and in-built function for fetching Data for other methods with no exceptions
   * @param {string} rawQuery -> A String Value for Song Name or Url to be Parsed and Fetch Data about it
   * @param {scrapperOptions} __scrapperOptions -> Scrapping Options for functions and base Source Engine
   * @returns {Promise<extractorData>} playlist and Tracks from youtube-dl
   */
  async exec(
    rawQuery,
    __scrapperOptions = videoExtractor.#__privateCaches.__scrapperOptions,
  ) {
    try {
      __scrapperOptions = {
        ...this.__scrapperOptions,
        ...__scrapperOptions,
        fetchOptions: {
          ...this.__scrapperOptions?.fetchOptions,
          ...__scrapperOptions?.fetchOptions,
        },
      };
      if (
        !(rawQuery && typeof rawQuery === 'string' && rawQuery?.trim() !== '')
      ) {
        throw new Error(
          'video-extractor Error : Invalid Query is Provided to Parse and Stream for Client',
        );
      }

      await this.__customRatelimit(__scrapperOptions?.ratelimit);
      if (spotify.__test(rawQuery)) return await spotify.__extractor(rawQuery, __scrapperOptions, this);
      if (soundcloud.__test(rawQuery)) return await soundcloud.__extractor(rawQuery, __scrapperOptions, this);
      if (reverbnation.__test(rawQuery)) {
        return await reverbnation.__extractor(rawQuery, __scrapperOptions, this);
      }
      if (youtube.__test(rawQuery)) return await youtube.__extractor(rawQuery, __scrapperOptions, this);
      if (youtubeDLEngine.__testUri(rawQuery)) {
        return {
          playlist: false,
          tracks: await youtubeDLEngine.__rawExtractor(
            rawQuery,
            undefined,
            __scrapperOptions,
            this,
          ),
        };
      }
      throw new Error(
        'video-extractor Error : Un-Supportable Query is Provided to Parse and Stream for Client',
      );
    } catch (rawError) {
      if (__scrapperOptions?.ignoreInternalError) return void this.__errorHandling(rawError);
      throw rawError;
    }
  }

  /**
   * streamExtractor() -> Raw and in-built function for fetching Data for other methods with no exceptions
   * @param {string} rawQuery -> A String Value for Song Name or Url to be Parsed and Fetch Data about it
   * @param {scrapperOptions} __scrapperOptions -> Scrapping Options for functions and base Source Engine
   * @param {string | "tracks" | "streams"} returnType Return Type for method , And Optional choice and By Default its -> "tracks"
   * @returns {Promise<Track[] | Object[]>} playlist and Tracks from youtube-dl
   */
  async streamExtractor(
    rawQuery,
    __scrapperOptions = videoExtractor.#__privateCaches.__scrapperOptions,
    returnType = 'tracks',
  ) {
    const __rawResponse = await this.exec(rawQuery, {
      ...__scrapperOptions,
      streamDownload: true,
    });
    if (returnType && returnType?.toLowerCase()?.trim()?.includes('stream')) {
      return __rawResponse?.tracks?.filter((track) => track?.stream);
    }
    return __rawResponse?.tracks;
  }

  /**
   * softExtractor() -> Raw and in-built function for fetching Data for other methods with no exceptions
   * @param {string} rawQuery -> A String Value for Song Name or Url to be Parsed and Fetch Data about it
   * @param {scrapperOptions} __scrapperOptions -> Scrapping Options for functions and base Source Engine
   * @returns {Promise<Track[]>} playlist and Tracks from youtube-dl
   */
  async softExtractor(
    rawQuery,
    __scrapperOptions = videoExtractor.#__privateCaches.__scrapperOptions,
  ) {
    const __rawResponse = await this.exec(rawQuery, {
      ...__scrapperOptions,
      fetchLyrics: false,
      streamDownload: false,
    });
    return __rawResponse?.tracks;
  }

  __errorHandling(error = new Error()) {
    if (!error?.message) return undefined;
    if (!fileSystem.existsSync(path.join(__dirname, '/cache'))) fileSystem.mkdirSync(path.join(__dirname, '/cache'));
    const __cacheLocation = path.join(__dirname, '/cache', '/__errorLogs.txt');
    if (!__cacheLocation) return undefined;
    if (!fileSystem.existsSync(__cacheLocation)) {
      fileSystem.writeFileSync(
        __cacheLocation,
        `${new Date()} | `
          + `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
      );
    } else if (
      (fileSystem.readFileSync(__cacheLocation)?.length ?? 0) < 500000
    ) {
      fileSystem.appendFileSync(
        __cacheLocation,
        `\n\n${new Date()} | `
          + `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
        'utf8',
      );
    } else {
      fileSystem.writeFileSync(
        __cacheLocation,
        `${new Date()} | `
          + `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
      );
    }
    return true;
  }

  async __customRatelimit(waitTime = 2 * 1000, forceSkip = false) {
    if (forceSkip) return true;
    const __rawtimeMs = new Date().getTime();
    videoExtractor.#__privateCaches.__ratelimitQueue ??= __rawtimeMs;
    if (videoExtractor.#__privateCaches.__ratelimitQueue - __rawtimeMs > 1000) {
      videoExtractor.#__privateCaches.__ratelimitQueue += waitTime;
      await this.#sleep(
        videoExtractor.#__privateCaches.__ratelimitQueue - __rawtimeMs,
      );
      return true;
    }
    return true;
  }

  #sleep(waitTime = 2 * 1000) {
    if (!(waitTime && typeof waitTime === 'number' && waitTime > 500)) return true;
    return new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  static quickExtract = new videoExtractor();
}

module.exports = {
  default: { videoExtractor, quickExtract: videoExtractor.quickExtract },
  videoExtractor,
  quickExtract: videoExtractor.quickExtract,
};
