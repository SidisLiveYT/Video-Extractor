const YoutubeDL = require('@sidislive/youtube-dl-exec');
const isUrl = require('is-url');
const { stream } = require('play-dl');

class YoutubeDLExtractor {
  static async YoutubeDLExtraction(
    Query,
    extractor = false,
    ExtraValue = {},
    SpecialPlaylistRequest = false,
    StreamValueRecordBoolean = undefined,
  ) {
    try {
      Query = !isUrl(Query) ? `ytsearch:${Query}` : Query;
      const YoutubeDLRawDatas = await YoutubeDL(
        Query,
        {
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
    } catch (error) {
      return void undefined;
    }
  }

  static #streamextractor(Url) {
    const YoutubeDLProcess = YoutubeDL.raw(
      Url,
      {
        o: '-',
        q: '',
        f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        r: '100K',
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
        (ExtraValue.video_Id
        ?? YoutubeDLRawData.display_id
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
        ExtraValue.duration
        ?? YoutubeDLRawData.duration
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].duration
          : undefined)
        ?? 0,
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
      orignal_extractor:
        extractor
        ?? YoutubeDLRawData.extractor
        ?? YoutubeDLRawData.extractor_key
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor
          : undefined)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor_key
          : undefined)
        ?? 'arbitrary',
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
}

module.exports = YoutubeDLExtractor;
