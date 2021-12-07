const YoutubeDL = require('@sidislive/youtube-dl-exec');
const isUrl = require('is-url');
const { stream, setToken, search } = require('play-dl');
const { randomOne } = require('proxies-generator');
const fs = require('fs');
const { GetLyrics } = require('./Lyrics-Extractor');

class YoutubeDLExtractor {
  static #Proxy = undefined;

  static #YTCookies = undefined;

  static #YoutubeDLCookiesFilePath = undefined;

  static async YoutubeDLExtraction(
    Query,
    ExtractOptions = {
      Proxy: undefined,
      BypassRatelimit: true,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
      SkipVideoDataOverRide: undefined,
    },
    extractor = false,
    ExtraValue = {},
    SpecialPlaylistRequest = false,
    StreamValueRecordBoolean = undefined,
    SecretDepth = 0,
    PostTrackName = undefined,
  ) {
    const SenderQuery = !isUrl(Query) ? `ytsearch:${Query}` : Query;
    if (
      ExtractOptions.YoutubeDLCookiesFilePath
      && YoutubeDLExtractor.YoutubeDLCookiesFilePath
        !== ExtractOptions.YoutubeDLCookiesFilePath
      && fs.statSync(`${ExtractOptions.YoutubeDLCookiesFilePath}`).isFile()
    ) {
      YoutubeDLExtractor.YoutubeDLCookiesFilePath = ExtractOptions.YoutubeDLCookiesFilePath;
    }
    if (
      ExtractOptions
      && ExtractOptions.Proxy
      && ExtractOptions.Proxy !== YoutubeDLExtractor.#Proxy
    ) YoutubeDLExtractor.#Proxy = ExtractOptions.Proxy;
    if (
      ExtractOptions
      && ExtractOptions.YTCookies
      && ExtractOptions.YTCookies !== YoutubeDLExtractor.#YTCookies
    ) {
      YoutubeDLExtractor.#YTCookies = ExtractOptions.YTCookies;
      setToken({
        youtube: {
          cookie: YoutubeDLExtractor.#YTCookies,
        },
      });
    }
    const ExtraCredentials = {};
    if (YoutubeDLExtractor.#Proxy) ExtraCredentials.proxy = YoutubeDLExtractor.#Proxy;
    if (YoutubeDLExtractor.#YoutubeDLCookiesFilePath) ExtraCredentials.cookies = YoutubeDLExtractor.#YoutubeDLCookiesFilePath;
    try {
      const YoutubeDLRawDatas = await YoutubeDL(
        SenderQuery,
        {
          ...ExtraCredentials,
          dumpSingleJson: true,
          skipDownload: true,
          simulate: true,
          noWarnings: true,
          noCallHome: true,
          noCheckCertificate: true,
          preferFreeFormats: true,
          sleepInterval: 2,
          youtubeSkipDashManifest: true,
        },
        {
          stdio: ['ignore', 'pipe', 'ignore'],
        },
      );

      if (!SpecialPlaylistRequest) {
        return await YoutubeDLExtractor.#YoutubeDLTrackModel(
          YoutubeDLRawDatas[0] ?? YoutubeDLRawDatas,
          extractor,
          ExtraValue ?? {},
          StreamValueRecordBoolean,
          ExtractOptions.SkipVideoDataOverRide,
        );
      }
      const ProcessedYoutubeDLTrack = YoutubeDLRawDatas && YoutubeDLRawDatas.entries
        ? await Promise.all(
          await YoutubeDLRawDatas.entries.map(
            async (Track) => await YoutubeDLExtractor.#YoutubeDLTrackModel(
              Track,
              extractor,
              undefined,
              StreamValueRecordBoolean,
              ExtractOptions.SkipVideoDataOverRide,
            ),
          ),
        )
        : [];
      return ProcessedYoutubeDLTrack;
    } catch (error) {
      if (SecretDepth > 10) {
        throw Error(
          '[429] Song has been Ratelimited | Please change Song Name or Url',
        );
      }
      if (!ExtractOptions.BypassRatelimit || SpecialPlaylistRequest) {
        throw Error(
          '[429] Song has been Ratelimited | Please change Song Name or Url',
        );
      }
      if (
        error
        && (`${error.message}`.includes('429')
          || `${error.message}`.includes('exit code 1')
          || `${error}`.includes('429')
          || `${error}`.includes('exit code 1'))
      ) YoutubeDLExtractor.#Proxy = (await randomOne(true)).url;
      PostTrackName = SecretDepth === 0 ? Query : PostTrackName;
      ++SecretDepth;
      const Value = (await search(Query, { limit: SecretDepth + 2 }))[
        SecretDepth
      ];
      if (!Value || (Value && !Value.title)) throw new Error(`[429] Song - "${PostTrackName}" got Ratelimited`);
      const Song = await YoutubeDLExtractor.YoutubeDLExtraction(
        Value.title,
        ExtractOptions,
        extractor,
        ExtraValue,
        null,
        true,
        SecretDepth,
        PostTrackName,
      );
      if (SecretDepth !== 0) return Song;

      return {
        tracks: Song,
        error: `[429] Song - "${PostTrackName}" got Ratelimited`,
      };
    }
  }

  static async #streamextractor(Url, SecretDepth = 0) {
    try {
      const ExtraCredentials = {};
      if (YoutubeDLExtractor.#Proxy) ExtraCredentials.proxy = YoutubeDLExtractor.#Proxy;
      if (YoutubeDLExtractor.#YoutubeDLCookiesFilePath) ExtraCredentials.cookies = YoutubeDLExtractor.#YoutubeDLCookiesFilePath;
      const YoutubeDLProcess = YoutubeDL.raw(
        Url,
        {
          o: '-',
          q: '',
          f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
          r: '6.9M',
          ...ExtraCredentials,
        },
        {
          stdio: ['ignore', 'pipe', 'ignore'],
        },
      );

      if (!YoutubeDLProcess.stdout) return void undefined;
      const stream = YoutubeDLProcess.stdout;

      stream.on('error', () => {
        if (!YoutubeDLProcess.killed) YoutubeDLProcess.kill();
        stream.resume();
      });
      return stream;
    } catch (error) {
      if (SecretDepth > 3) throw Error(`${error.message ?? error}`);
      if (
        error
        && !(
          `${error.message}`.includes('429')
          || `${error.message}`.includes('exit code 1')
          || `${error}`.includes('429')
          || `${error}`.includes('exit code 1')
        )
      ) {
        throw Error(`${error.message ?? error}`);
      }
      YoutubeDLExtractor.#Proxy = (await randomOne(true)).url;
      const StreamData = await YoutubeDLExtractor.streamextractor(
        Url,
        ++SecretDepth,
      );

      if (SecretDepth !== 0) return StreamData;
      return {
        stream: StreamData,
        error: error.message ?? `${error}`,
      };
    }
  }

  static async #YoutubeStreamDownload(Url, SecretDepth = 0) {
    try {
      const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
      if (!Url) return undefined;
      if (!Url.match(YoutubeUrlRegex)) return undefined;

      const SourceStream = await stream(Url, {
        proxy: YoutubeDLExtractor.#Proxy
          ? [YoutubeDLExtractor.#Proxy]
          : undefined,
      });
      return SourceStream;
    } catch (error) {
      if (SecretDepth >= 3) throw Error(`${error.message ?? error}`);
      if (
        error
        && !(
          `${error.message}`.includes('429')
          || `${error.message}`.includes('exit code 1')
          || `${error.message}`.includes('Ratelimit')
          || `${error.message}`.includes('ratelimit')
          || `${error.message}`.includes('unavaliable')
          || `${error.message}`.includes('Unavaliable')
          || `${error}`.includes('429')
          || `${error}`.includes('unavaliable')
          || `${error}`.includes('exit code 1')
          || `${error}`.includes('Ratelimit')
          || `${error}`.includes('ratelimit')
          || `${error}`.includes('Unavaliable')
        )
      ) {
        throw Error(`${error.message ?? error}`);
      }

      YoutubeDLExtractor.#Proxy = (await randomOne(true)).url;
      const StreamData = YoutubeDLExtractor.#YoutubeStreamDownload(
        Url,
        ++SecretDepth,
      );

      if (SecretDepth !== 0) return StreamData;

      return {
        stream: StreamData,
        error: error.message ?? `${error}`,
      };
    }
  }

  static async #YoutubeDLTrackModel(
    YoutubeDLRawData,
    extractor = false,
    ExtraValue = {},
    StreamValueRecordBoolean = undefined,
    SkipVideoDataOverRide = undefined,
  ) {
    let YoutubeSourceStreamData = StreamValueRecordBoolean
      ? YoutubeDLRawData.is_live
        || (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].is_live)
        ? await YoutubeDLExtractor.#YoutubeStreamDownload(
          YoutubeDLRawData.video_url
              ?? (YoutubeDLRawData.webpage_url
              && !YoutubeDLRawData.extractor.includes('search')
                ? YoutubeDLRawData.webpage_url
                : undefined)
              ?? (YoutubeDLRawData.entries
              && YoutubeDLRawData.entries[0]
              && YoutubeDLRawData.entries[0].webpage_url
              && !YoutubeDLRawData.entries[0].extractor.includes('search')
                ? YoutubeDLRawData.entries[0].webpage_url
                : undefined)
              ?? undefined,
        )
        : undefined
      : undefined;
    extractor = extractor
      ?? YoutubeDLRawData.extractor
      ?? YoutubeDLRawData.extractor_key
      ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
        ? YoutubeDLRawData.entries[0].extractor
        : undefined)
      ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
        ? YoutubeDLRawData.entries[0].extractor_key
        : undefined)
      ?? undefined;

    const FetchedStreamData = StreamValueRecordBoolean
      ? (YoutubeSourceStreamData
        ? YoutubeSourceStreamData.streamdatas ?? YoutubeSourceStreamData
        : undefined)
        ?? (await YoutubeDLExtractor.#streamextractor(
          (!YoutubeDLRawData.extractor.includes('search')
            ? YoutubeDLRawData.video_url
              ?? YoutubeDLRawData.webpage_url
              ?? undefined
            : undefined)
            ?? (YoutubeDLRawData.entries
            && YoutubeDLRawData.entries[0]
            && YoutubeDLRawData.entries[0].webpage_url
              ? YoutubeDLRawData.entries[0].video_url
                ?? YoutubeDLRawData.entries[0].webpage_url
                ?? undefined
              : undefined)
            ?? ExtraValue.url
            ?? undefined,
        ))
        ?? ExtraValue.stream_url
        ?? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
          ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio')).url
          : undefined)
        ?? (YoutubeDLRawData.requested_formats
        && YoutubeDLRawData.requested_formats[0]
          ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio')).url
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].requested_formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : undefined)
        ?? undefined
      : undefined;

    const ErrorDatas = (YoutubeSourceStreamData && YoutubeSourceStreamData.streamdatas
      ? YoutubeSourceStreamData.error
      : undefined)
      ?? (FetchedStreamData && FetchedStreamData.streamdatas
        ? FetchedStreamData.error
        : undefined);

    YoutubeSourceStreamData = YoutubeSourceStreamData && YoutubeSourceStreamData.streamdatas
      ? YoutubeSourceStreamData.streamdatas
      : YoutubeSourceStreamData;

    const track = {
      Id: 0,
      url:
        ExtraValue.url
        ?? (!YoutubeDLRawData.extractor.includes('search')
          ? YoutubeDLRawData.video_url
            ?? YoutubeDLRawData.webpage_url
            ?? undefined
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].webpage_url
        && !YoutubeDLRawData.entries[0].extractor.includes('search')
          ? YoutubeDLRawData.entries[0].video_url
            ?? YoutubeDLRawData.entries[0].webpage_url
            ?? undefined
          : undefined)
        ?? undefined,
      video_Id:
        ExtraValue.video_Id
        ?? (YoutubeDLRawData.display_id
        ?? (YoutubeDLRawData.display_id
          && !YoutubeDLRawData.extractor.includes('search'))
          ? YoutubeDLRawData.display_id
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].display_id
          ? YoutubeDLRawData.entries[0].display_id
            ?? YoutubeDLRawData.entries[0].id
          : undefined)
        ?? undefined,
      title:
        ExtraValue.title
        ?? YoutubeDLRawData.track
        ?? YoutubeDLRawData.title
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].title
          : undefined)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].track
          : undefined)
        ?? undefined,
      author:
        ExtraValue.author
        ?? YoutubeDLRawData.uploader
        ?? YoutubeDLRawData.channel
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader
          : undefined)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel
          : undefined)
        ?? undefined,
      author_link:
        ExtraValue.author_link
        ?? YoutubeDLRawData.uploader_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].author_link
          : undefined)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader_url
          : undefined)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : undefined)
        ?? undefined,
      description:
        ExtraValue.description
        ?? YoutubeDLRawData.description
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].description
          : undefined)
        ?? undefined,
      custom_extractor: 'youtube-dl',
      duration:
        extractor === 'youtube'
          ? (ExtraValue.duration
              ?? YoutubeDLRawData.duration
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].duration
                : undefined)
              ?? 0) * 1000
          : ExtraValue.duration
            ?? YoutubeDLRawData.duration
            ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
              ? YoutubeDLRawData.entries[0].duration
              : undefined)
            ?? 0,
      human_duration: YoutubeDLExtractor.HumanTimeConversion(
        extractor === 'youtube'
          ? (ExtraValue.duration
              ?? YoutubeDLRawData.duration
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].duration
                : undefined)
              ?? 0) * 1000
          : ExtraValue.duration
              ?? YoutubeDLRawData.duration
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].duration
                : undefined)
              ?? 0,
      ),
      preview_stream_url:
        ExtraValue.stream_url
        ?? YoutubeDLRawData.url
        ?? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
          ? (
            (!SkipVideoDataOverRide
              ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('2160p'))
              : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('1080p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('720p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('480p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('360p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('216p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('144p'))
                : undefined)
              ?? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio'))
          ).url
          : undefined)
        ?? (YoutubeDLRawData.requested_formats
        && YoutubeDLRawData.requested_formats[0]
          ? (
            (!SkipVideoDataOverRide
              ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('2160p'))
              : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('1080p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('720p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('480p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('360p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('216p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('144p'))
                : undefined)
              ?? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio'))
          ).url
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].formats
        && YoutubeDLRawData.entries[0].formats[0]
          ? (
            (!SkipVideoDataOverRide
              ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('2160p'))
              : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('1080p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('720p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('480p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('360p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('216p'))
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('144p'))
                : undefined)
              ?? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio'))
          ).url
          : undefined)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].requested_formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? (
            (!SkipVideoDataOverRide
              ? YoutubeDLRawData.entries[0].requested_formats.find(
                (rqformat) => rqformat.format.includes('2160p'),
              )
              : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('1080p'),
                )
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('720p'),
                )
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('480p'),
                )
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('360p'),
                )
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('216p'),
                )
                : undefined)
              ?? (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('144p'),
                )
                : undefined)
              ?? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio'))
          ).url
          : undefined)
        ?? undefined,
      stream:
        FetchedStreamData && FetchedStreamData.streamdatas
          ? FetchedStreamData.streamdatas
          : FetchedStreamData,
      stream_url: StreamValueRecordBoolean
        ? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
          ? (
            (!SkipVideoDataOverRide
              ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('2160p'))
              : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('1080p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('720p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('480p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('360p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('216p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('144p'))
                  : undefined)
                ?? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio'))
          ).url
          : undefined)
          ?? (YoutubeDLRawData.requested_formats
          && YoutubeDLRawData.requested_formats[0]
            ? (
              (!SkipVideoDataOverRide
                ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('2160p'))
                : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('1080p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('720p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('480p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('360p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('216p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('144p'))
                  : undefined)
                ?? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio'))
            ).url
            : undefined)
          ?? (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].formats
          && YoutubeDLRawData.entries[0].formats[0]
            ? (
              (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('2160p'))
                : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('1080p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('720p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('480p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('360p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('216p'))
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('144p'))
                  : undefined)
                ?? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio'))
            ).url
            : undefined)
          ?? (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].requested_formats
          && YoutubeDLRawData.entries[0].requested_formats[0]
            ? (
              (!SkipVideoDataOverRide
                ? YoutubeDLRawData.entries[0].requested_formats.find(
                  (rqformat) => rqformat.format.includes('2160p'),
                )
                : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('1080p'),
                  )
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('720p'),
                  )
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('480p'),
                  )
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('360p'),
                  )
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('216p'),
                  )
                  : undefined)
                ?? (!SkipVideoDataOverRide
                  ? YoutubeDLRawData.entries[0].requested_formats.find(
                    (rqformat) => rqformat.format.includes('144p'),
                  )
                  : undefined)
                ?? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio'))
            ).url
            : undefined)
          ?? undefined
        : undefined,
      stream_type: StreamValueRecordBoolean
        ? YoutubeSourceStreamData
          ? YoutubeSourceStreamData.type
          : undefined ?? undefined
        : undefined,
      stream_duration: StreamValueRecordBoolean
        ? (
          YoutubeDLRawData.extractor
            ?? YoutubeDLRawData.extractor_key
            ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
              ? YoutubeDLRawData.entries[0].extractor
              : undefined)
            ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
              ? YoutubeDLRawData.entries[0].extractor_key
              : undefined)
            ?? undefined
        ).includes('youtube')
          ? (YoutubeDLRawData.duration
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].duration
                : undefined)
              ?? 0) * 1000
          : YoutubeDLRawData.duration
            ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
              ? YoutubeDLRawData.entries[0].duration
              : undefined)
            ?? 0
        : 0,

      stream_video_Id: StreamValueRecordBoolean
        ? (YoutubeDLRawData.display_id
          ?? (YoutubeDLRawData.display_id
            && !YoutubeDLRawData.extractor.includes('search'))
          ? YoutubeDLRawData.display_id
          : undefined)
          ?? (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].display_id
            ? YoutubeDLRawData.entries[0].display_id
              ?? YoutubeDLRawData.entries[0].id
            : undefined)
          ?? undefined
        : undefined,
      stream_human_duration: StreamValueRecordBoolean
        ? YoutubeDLExtractor.HumanTimeConversion(
          (
            YoutubeDLRawData.extractor
              ?? YoutubeDLRawData.extractor_key
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].extractor
                : undefined)
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].extractor_key
                : undefined)
              ?? undefined
          ).includes('youtube')
            ? (YoutubeDLRawData.duration
                  ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                    ? YoutubeDLRawData.entries[0].duration
                    : undefined)
                  ?? 0) * 1000
            : YoutubeDLRawData.duration
                  ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                    ? YoutubeDLRawData.entries[0].duration
                    : undefined)
                  ?? 0,
        )
        : undefined,
      orignal_extractor: extractor ?? 'arbitrary',
      thumbnail:
        ExtraValue.thumbnail
        ?? (YoutubeDLRawData.thumbnail && YoutubeDLRawData.thumbnail[0]
          ? YoutubeDLRawData.thumbnail[0].url
          : undefined)
        ?? YoutubeDLRawData.thumbnail
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].thumbnail
        && YoutubeDLRawData.entries[0].thumbnail[0]
          ? YoutubeDLRawData.entries[0].thumbnail[0].url
          : undefined)
        ?? YoutubeDLRawData.entries[0].thumbnail
        ?? undefined,
      channelId:
        ExtraValue.channelId
        ?? YoutubeDLRawData.channel_id
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_id
          : undefined)
        ?? undefined,
      channel_url:
        ExtraValue.channel_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : undefined)
        ?? undefined,
      lyrics: !(
        ExtraValue.is_live
        ?? YoutubeDLRawData.is_live
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].is_live
          : undefined)
        ?? false
      )
        ? await GetLyrics(
          ExtraValue.title
              ?? YoutubeDLRawData.track
              ?? YoutubeDLRawData.title
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].title
                : undefined)
              ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
                ? YoutubeDLRawData.entries[0].track
                : undefined)
              ?? undefined,
        )
        : undefined,
      likes:
        ExtraValue.likes
        ?? YoutubeDLRawData.like_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].like_count
          : undefined)
        ?? 0,
      is_live:
        ExtraValue.is_live
        ?? YoutubeDLRawData.is_live
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].is_live
          : undefined)
        ?? false,
      dislikes:
        ExtraValue.dislikes
        ?? YoutubeDLRawData.dislike_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].dislike_count
          : undefined)
        ?? 0,
    };
    if (ErrorDatas) {
      return {
        track,
        error: `${ErrorDatas}`,
      };
    }
    return track;
  }

  static HumanTimeConversion(DurationMilliSeconds = 0) {
    if (typeof DurationMilliSeconds !== 'number') return void null;
    DurationMilliSeconds /= 1000;
    let ProcessedString = '';
    for (
      let DurationArray = [
          [Math.floor(DurationMilliSeconds / 31536e3), 'Years'],
          [Math.floor((DurationMilliSeconds % 31536e3) / 86400), 'Days'],
          [
            Math.floor(((DurationMilliSeconds % 31536e3) % 86400) / 3600),
            'Hours',
          ],
          [
            Math.floor(
              (((DurationMilliSeconds % 31536e3) % 86400) % 3600) / 60,
            ),
            'Minutes',
          ],
          [
            Math.floor(
              (((DurationMilliSeconds % 31536e3) % 86400) % 3600) % 60,
            ),
            'Seconds',
          ],
        ],
        SideArray = 0,
        GarbageValue = DurationArray.length;
      SideArray < GarbageValue;
      SideArray++
    ) {
      DurationArray[SideArray][0] !== 0
        && (ProcessedString += ` ${DurationArray[SideArray][0]} ${
          DurationArray[SideArray][0] === 1
            ? DurationArray[SideArray][1].substr(
              0,
              DurationArray[SideArray][1].length - 1,
            )
            : DurationArray[SideArray][1]
        }`);
    }
    return ProcessedString.trim();
  }
}

module.exports = YoutubeDLExtractor;
