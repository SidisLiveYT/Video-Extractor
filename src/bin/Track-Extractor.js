const YoutubeDL = require('youtube-dl-exec');
const isUrl = require('is-url');
const { stream } = require('play-dl');
const fs = require('fs');

class YoutubeDLExtractor {
  static #Proxy = undefined

  static #YoutubeDLCookiesFilePath = undefined

  static async YoutubeDLExtraction(
    Query,
    ExtractOptions = {
      Proxy: undefined,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
    },
    extractor = false,
    ExtraValue = {},
    SpecialPlaylistRequest = false,
    StreamValueRecordBoolean = undefined,
  ) {
    Query = !isUrl(Query) ? `ytsearch:${Query}` : Query;
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
    const ExtracCredentials = {};
    if (YoutubeDLExtractor.#Proxy) ExtracCredentials.proxy = YoutubeDLExtractor.#Proxy;
    if (YoutubeDLExtractor.#YoutubeDLCookiesFilePath) ExtracCredentials.cookies = YoutubeDLExtractor.#YoutubeDLCookiesFilePath;
    const YoutubeDLRawDatas = await YoutubeDL(
      Query,
      {
        ...ExtracCredentials,
        dumpSingleJson: true,
        skipDownload: true,
        simulate: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
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
          ),
        ),
      )
      : [];
    return ProcessedYoutubeDLTrack;
  }

  static #streamextractor(Url) {
    const ExtracCredentials = {};
    if (YoutubeDLExtractor.#Proxy) ExtracCredentials.proxy = YoutubeDLExtractor.#Proxy;
    if (YoutubeDLExtractor.#YoutubeDLCookiesFilePath) ExtracCredentials.cookies = YoutubeDLExtractor.#YoutubeDLCookiesFilePath;
    const YoutubeDLProcess = YoutubeDL.raw(
      Url,
      {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        r: '100K',
        ...ExtracCredentials,
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
  }

  static async #YoutubeStreamDownload(Url) {
    const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
    if (!Url) return undefined;
    if (!Url.match(YoutubeUrlRegex)) return undefined;

    const SourceStream = await stream(Url);
    return SourceStream;
  }

  static async #YoutubeDLTrackModel(
    YoutubeDLRawData,
    extractor = false,
    ExtraValue = {},
    StreamValueRecordBoolean = undefined,
  ) {
    const YoutubeSourceStreamData = StreamValueRecordBoolean
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
        ?? undefined,
      stream: StreamValueRecordBoolean
        ? (YoutubeSourceStreamData
          ? YoutubeSourceStreamData.stream
          : undefined)
          ?? YoutubeDLExtractor.#streamextractor(
            !YoutubeDLRawData.extractor.includes('search')
              ? YoutubeDLRawData.video_url
                  ?? YoutubeDLRawData.webpage_url
                  ?? undefined
              : undefined
                  ?? (YoutubeDLRawData.entries
                  && YoutubeDLRawData.entries[0]
                  && YoutubeDLRawData.entries[0].webpage_url
                    ? YoutubeDLRawData.entries[0].video_url
                      ?? YoutubeDLRawData.entries[0].webpage_url
                      ?? undefined
                    : undefined)
                  ?? ExtraValue.url
                  ?? undefined,
          )
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
        : undefined,
      stream_type: StreamValueRecordBoolean
        ? YoutubeSourceStreamData
          ? YoutubeSourceStreamData.type
          : undefined ?? undefined
        : undefined,
      stream_duration: (
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

      stream_video_Id:
        (YoutubeDLRawData.display_id
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
      stream_human_duration: YoutubeDLExtractor.HumanTimeConversion(
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
      ),
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
