const { setToken, stream } = require('play-dl');
const youtubeDLCore = require('youtube-dl-exec');
const randomUserAgents = require('random-useragent').getRandom;
const { randomOne } = require('proxies-generator');
const { getLyrics } = require('./__lyrics');
const youtube = require('./__youtube');

class Track {
  #__raw = {};

  constructor(rawBlueprint, __rawYoutubeDl) {
    if (__rawYoutubeDl) this.#__raw = __rawYoutubeDl;
    this.patch(rawBlueprint);
  }

  static timeConverter(__milliseconds = 0) {
    if (
      typeof __milliseconds !== 'number'
      || [0, Infinity].includes(__milliseconds)
    ) return 'Un-Readable Duration';
    __milliseconds /= 1000;
    let __cookedTime = '';
    for (
      let __wasteArray = [
          [Math.floor(__milliseconds / 31536e3), 'Years'],
          [Math.floor((__milliseconds % 31536e3) / 86400), 'Days'],
          [Math.floor(((__milliseconds % 31536e3) % 86400) / 3600), 'Hours'],
          [
            Math.floor((((__milliseconds % 31536e3) % 86400) % 3600) / 60),
            'Minutes',
          ],
          [
            Math.floor((((__milliseconds % 31536e3) % 86400) % 3600) % 60),
            'Seconds',
          ],
        ],
        __waste2Array = 0,
        __garbage = __wasteArray.length;
      __waste2Array < __garbage;
      __waste2Array++
    ) {
      __wasteArray[__waste2Array][0] !== 0
        && (__cookedTime += ` ${__wasteArray[__waste2Array][0]} ${
          __wasteArray[__waste2Array][0] === 1
            ? __wasteArray[__waste2Array][1].substr(
              0,
              __wasteArray[__waste2Array][1].length - 1,
            )
            : __wasteArray[__waste2Array][1]
        }`);
    }
    return __cookedTime.trim();
  }

  patch(rawBlueprint) {
    if (!rawBlueprint?.url) return undefined;
    this.trackId = rawBlueprint?.trackId;
    this.url = rawBlueprint?.url;
    this.videoId = rawBlueprint?.video_Id ?? rawBlueprint?.videoId;
    this.title = rawBlueprint?.title;
    this.description = rawBlueprint?.description;
    this.author = {
      Id: rawBlueprint?.channelId,
      name: rawBlueprint?.author,
      url: rawBlueprint?.author_link ?? rawBlueprint?.authorLink,
    };
    this.extractorModel = {
      orignal: rawBlueprint?.orignalExtractor ?? 'arbitary',
      custom: rawBlueprint?.customExtractor ?? 'youtube-dl',
    };
    this.duration = {
      ms: rawBlueprint?.duration,
      readable: Track.timeConverter(rawBlueprint?.duration ?? 0),
    };
    this.thumbnail = {
      Id: rawBlueprint?.video_Id ?? rawBlueprint?.videoId,
      metadata: rawBlueprint?.thumbnails,
    };
    this.channel = {
      name: rawBlueprint?.channelName ?? rawBlueprint?.author,
      Id: rawBlueprint?.channelId ?? rawBlueprint?.author,
      url: rawBlueprint?.channelUrl ?? rawBlueprint?.authorLink,
    };
    this.views = rawBlueprint?.viewsCount;
    this.fps = rawBlueprint?.fps;
    this.keywords = rawBlueprint?.tags;
    this.comments = rawBlueprint?.commentsCount;
    this.subtitles = rawBlueprint?.subtitles;
    this.isLive = rawBlueprint?.isLive;
    this.ratings = {
      likes: parseInt(rawBlueprint?.likes ?? 0) ?? 0,
      dislikes: parseInt(rawBlueprint?.dislikes ?? 0) ?? 0,
    };
    this.videoMetadata = {
      video: {
        '2160p':
          this.#__raw?.formats?.find((rqformat) => rqformat?.format_note?.includes('2160p'))?.url
          ?? this.#__raw?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('2160p'))?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find((rqformat) => rqformat?.format_note?.includes('2160p'))?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('2160p'))?.url,
        '1080p':
          this.#__raw?.formats?.find(
            (rqformat) => rqformat?.format_note?.includes('1080p')
              || rqformat?.format?.includes('1920x1080'),
          )?.url
          ?? this.#__raw?.requested_formats?.find(
            (rqformat) => rqformat?.format_note?.includes('1080p')
              || rqformat?.format?.includes('1920x1080'),
          )?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find(
            (rqformat) => rqformat?.format_note?.includes('1080p')
              || rqformat?.format?.includes('1920x1080'),
          )?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find(
            (rqformat) => rqformat?.format_note?.includes('1080p')
              || rqformat?.format?.includes('1920x1080'),
          )?.url,
        '720p':
          this.#__raw?.formats?.find(
            (rqformat) => rqformat?.format_note?.includes('720p')
              || rqformat?.format?.includes('1270x720'),
          )?.url
          ?? this.#__raw?.requested_formats?.find(
            (rqformat) => rqformat?.format_note?.includes('720p')
              || rqformat?.format?.includes('1270x720'),
          )?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find(
            (rqformat) => rqformat?.format_note?.includes('720p')
              || rqformat?.format?.includes('1270x720'),
          )?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find(
            (rqformat) => rqformat?.format_note?.includes('720p')
              || rqformat?.format?.includes('1270x720'),
          )?.url,
        '480p':
          this.#__raw?.formats?.find((rqformat) => rqformat?.format_note?.includes('480p'))?.url
          ?? this.#__raw?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('480p'))?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find((rqformat) => rqformat?.format_note?.includes('480p'))?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('480p'))?.url,
        '360p':
          this.#__raw?.formats?.find((rqformat) => rqformat?.format_note?.includes('360p'))?.url
          ?? this.#__raw?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('360p'))?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find((rqformat) => rqformat?.format_note?.includes('360p'))?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('360p'))?.url,
        '216p':
          this.#__raw?.formats?.find((rqformat) => rqformat?.format_note?.includes('216p'))?.url
          ?? this.#__raw?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('216p'))?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find((rqformat) => rqformat?.format_note?.includes('216p'))?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('216p'))?.url,
        '144p':
          this.#__raw?.formats?.find((rqformat) => rqformat?.format_note?.includes('144p'))?.url
          ?? this.#__raw?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('144p'))?.url
          ?? this.#__raw?.entries?.[0]?.formats?.find((rqformat) => rqformat?.format_note?.includes('144p'))?.url
          ?? this.#__raw?.entries?.[0]?.requested_formats?.find((rqformat) => rqformat?.format_note?.includes('144p'))?.url,
      },
      audio:
        this.#__raw?.formats?.find(
          (rqformat) => rqformat?.format_note?.includes('tiny')
            || rqformat?.format?.includes('audio only'),
        )?.url
        ?? this.#__raw?.requested_formats?.find(
          (rqformat) => rqformat?.format_note?.includes('tiny')
            || rqformat?.format?.includes('audio only'),
        )?.url
        ?? this.#__raw?.entries?.[0]?.formats?.find(
          (rqformat) => rqformat?.format_note?.includes('tiny')
            || rqformat?.format?.includes('audio only'),
        )?.url
        ?? this.#__raw?.entries?.[0]?.requested_formats?.find(
          (rqformat) => rqformat?.format_note?.includes('tiny')
            || rqformat?.format?.includes('audio only'),
        )?.url,
    };
    return this;
  }

  async getStream(
    streamMetadata = {},
    __cacheMain = {},
    reTryonRatelimit = true,
  ) {
    try {
      if (!this.url) {
        throw new Error(
          'Invalid Video Url is Detected for Stream Fetch from <Track>.url',
        );
      } else if (youtube.__test(this.url)) {
        const __playdlStream = await stream(this.url, {
          quality: 3,
          discordPlayerCompatibility: true,
        });
        this.streamMetadata = {
          preview: streamMetadata?.previewStreamUrl ?? this.#__raw?.url,
          url: streamMetadata?.streamUrl ?? this.videoMetadata?.audio,
          buffer: __playdlStream?.stream,
          type: __playdlStream?.type ?? streamMetadata?.streamType,
          videoId:
            this.#__raw?.display_id
            ?? this.#__raw?.entries?.[0]?.display_id
            ?? this.#__raw?.entries?.[0]?.id,
          duration: {
            ms:
              (this.#__raw?.duration
                ?? this.#__raw?.entries?.[0]?.duration
                ?? 0) * 1000,
            readable: Track.timeConverter(
              (this.#__raw?.duration
                ?? this.#__raw?.entries?.[0]?.duration
                ?? 0) * 1000,
            ),
          },
        };
        return this;
      } else {
        const __spawnProcess = youtubeDLCore.exec(
          this.url,
          {
            o: '-',
            q: '',
            f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
            r: '10M',
            ...streamMetadata?.__youtubeDlCaches,
          },
          {
            stdio: ['ignore', 'pipe', 'ignore'],
          },
        );

        if (!__spawnProcess?.stdout) return undefined;
        __spawnProcess?.stdout.on('error', () => {
          if (!__spawnProcess.killed) __spawnProcess.kill();
          __spawnProcess?.stdout.resume();
        });
        this.streamMetadata = {
          preview: streamMetadata?.previewStreamUrl ?? this.#__raw?.url,
          url:
            __spawnProcess?.stdout?.url
            ?? this.videoMetadata?.audio
            ?? streamMetadata?.streamUrl,
          buffer: __spawnProcess?.stdout,
          type: __spawnProcess?.stdout?.type ?? streamMetadata?.streamType,
          videoId:
            this.#__raw?.display_id
            ?? this.#__raw?.entries?.[0]?.display_id
            ?? this.#__raw?.entries?.[0]?.id,
          duration: {
            ms:
              streamMetadata?.orignalExtractor === 'youtube'
                ? (this.#__raw?.duration
                    ?? this.#__raw?.entries?.[0]?.duration
                    ?? 0) * 1000
                : this.#__raw?.duration
                  ?? this.#__raw?.entries?.[0]?.duration
                  ?? 0,
            readable: Track.timeConverter(
              streamMetadata?.orignalExtractor === 'youtube'
                ? (this.#__raw?.duration
                    ?? this.#__raw?.entries?.[0]?.duration
                    ?? 0) * 1000
                : this.#__raw?.duration
                    ?? this.#__raw?.entries?.[0]?.duration
                    ?? 0,
            ),
          },
        };
        return this;
      }
    } catch (rawError) {
      if (
        (streamMetadata?.ignoreError
          || rawError?.message?.includes('429')
          || `${rawError}`?.includes('429'))
        && __cacheMain
        && !reTryonRatelimit
      ) {
        return void __cacheMain.__errorHandling(rawError);
      }
      if (
        (streamMetadata?.ignoreError
          || rawError?.message?.includes('429')
          || `${rawError}`?.includes('429'))
        && __cacheMain
        && reTryonRatelimit
      ) {
        __cacheMain.__errorHandling(rawError);
        let __rawUserAgents = streamMetadata?.userAgents ?? [];
        __rawUserAgents = [
          randomUserAgents(),
          randomUserAgents(),
          randomUserAgents(),
          ...__rawUserAgents,
        ];
        await setToken({
          useragent: __rawUserAgents,
        });
        streamMetadata.__youtubeDlCaches = {
          ...streamMetadata.__youtubeDlCaches,
          proxy: (await randomOne(true))?.url,
        };
        return await this.getStream(streamMetadata, __cacheMain, false);
      }
      throw rawError;
    }
  }

  async getLyrics() {
    if (
      !(
        this.url
        && this.#__raw?.title
        && (this.author?.name
          ?? this.#__raw?.author?.name
          ?? this.#__raw?.artist?.name)
      )
    ) {
      return undefined;
    }
    this.lyrics = await getLyrics(
      this.#__raw?.title?.slice(0, 25)?.trim(),
      this.author?.name,
    );
    return this.lyrics;
  }

  get raw() {
    if (!this.#__raw) return undefined;
    return this.#__raw;
  }
}

module.exports = Track;
