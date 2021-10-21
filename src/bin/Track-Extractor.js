const YoutubeDL = require('@sidislive/youtube-dl-exec');
const isUrl = require('is-url');
const { stream } = require('play-dl');

class YoutubeDLExtractor {
  static async YoutubeDLExtraction(
    Query,
    extractor = false,
    ExtraValue = {},
    SpecialPlaylistRequest = false,
    StreamValueRecordBoolean = null,
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
          ExtraValue,
          StreamValueRecordBoolean,
        );
      }
      const ProcessedYoutubeDLTrack = YoutubeDLRawDatas && YoutubeDLRawDatas.entries
        ? await Promise.all(
          await YoutubeDLRawDatas.entries.map(
            async (Track) => await YoutubeDLExtractor.#YoutubeDLTrackModel(
              Track,
              extractor,
              null,
              StreamValueRecordBoolean,
            ),
          ),
        )
        : [];
      return ProcessedYoutubeDLTrack;
    } catch (error) {
      return void null;
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

    if (!YoutubeDLProcess.stdout) return void null;
    const stream = YoutubeDLProcess.stdout;

    stream.on('error', () => {
      if (!YoutubeDLProcess.killed) YoutubeDLProcess.kill();
      stream.resume();
    });
    return stream;
  }

  static async #YoutubeStreamDownload(Url) {
    const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
    if (!Url) return null;
    if (!Url.match(YoutubeUrlRegex)) return null;

    const SourceStream = await stream(Url);
    return SourceStream;
  }

  static async #YoutubeDLTrackModel(
    YoutubeDLRawData,
    extractor = false,
    ExtraValue = {},
    StreamValueRecordBoolean = null,
  ) {
    const YoutubeSourceStreamData = YoutubeDLRawData.is_live
      || (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].is_live)
      ? await YoutubeDLExtractor.#YoutubeStreamDownload(
        YoutubeDLRawData.video_url
              ?? (YoutubeDLRawData.webpage_url
              && !YoutubeDLRawData.extractor.includes('search')
                ? YoutubeDLRawData.webpage_url
                : null)
              ?? (YoutubeDLRawData.entries
              && YoutubeDLRawData.entries[0]
              && YoutubeDLRawData.entries[0].webpage_url
              && !YoutubeDLRawData.entries[0].extractor.includes('search')
                ? YoutubeDLRawData.entries[0].webpage_url
                : null)
              ?? null,
      )
      : null;
    const track = {
      Id: 0,
      url:
        ExtraValue.url
        ?? (!YoutubeDLRawData.extractor.includes('search')
          ? YoutubeDLRawData.video_url ?? YoutubeDLRawData.webpage_url ?? null
          : null)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].webpage_url
        && !YoutubeDLRawData.entries[0].extractor.includes('search')
          ? YoutubeDLRawData.entries[0].video_url
            ?? YoutubeDLRawData.entries[0].webpage_url
            ?? null
          : null)
        ?? null,
      video_Id:
        (ExtraValue.video_Id
        ?? YoutubeDLRawData.display_id
        ?? (YoutubeDLRawData.display_id
          && !YoutubeDLRawData.extractor.includes('search'))
          ? YoutubeDLRawData.display_id
          : null)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].display_id
        && !YoutubeDLRawData.entries[0].extractor.includes('search')
          ? YoutubeDLRawData.entries[0].display_id
          : null)
        ?? null,
      title:
        ExtraValue.title
        ?? YoutubeDLRawData.track
        ?? YoutubeDLRawData.title
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].title
          : null)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].track
          : null)
        ?? null,
      author:
        ExtraValue.author
        ?? YoutubeDLRawData.uploader
        ?? YoutubeDLRawData.channel
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader
          : null)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel
          : null)
        ?? null,
      author_link:
        ExtraValue.author_link
        ?? YoutubeDLRawData.uploader_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].author_link
          : null)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader_url
          : null)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : null)
        ?? null,
      description:
        ExtraValue.description
        ?? YoutubeDLRawData.description
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].description
          : null)
        ?? null,
      custom_extractor: 'youtube-dl',
      duration:
        ExtraValue.duration
        ?? YoutubeDLRawData.duration
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].duration
          : null)
        ?? 0,
      preview_stream_url:
        ExtraValue.stream_url
        ?? YoutubeDLRawData.url
        ?? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
          ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio')).url
          : null)
        ?? (YoutubeDLRawData.requested_formats
        && YoutubeDLRawData.requested_formats[0]
          ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : null)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio')).url
          : null)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].requested_formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : null)
        ?? null,
      stream: YoutubeSourceStreamData
        ? YoutubeSourceStreamData.stream
        : null
          ?? (StreamValueRecordBoolean
            ? YoutubeDLExtractor.#streamextractor(
              ExtraValue.url
                  ?? (!YoutubeDLRawData.extractor.includes('search')
                    ? YoutubeDLRawData.video_url
                      ?? YoutubeDLRawData.webpage_url
                      ?? null
                    : null)
                  ?? (YoutubeDLRawData.entries
                  && YoutubeDLRawData.entries[0]
                  && YoutubeDLRawData.entries[0].webpage_url
                  && !YoutubeDLRawData.entries[0].extractor.includes('search')
                    ? YoutubeDLRawData.entries[0].video_url
                      ?? YoutubeDLRawData.entries[0].webpage_url
                      ?? null
                    : null)
                  ?? null,
            )
            : null)
          ?? ExtraValue.stream_url
          ?? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
            ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio')).url
            : null)
          ?? (YoutubeDLRawData.requested_formats
          && YoutubeDLRawData.requested_formats[0]
            ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
            : null)
          ?? (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].formats
          && YoutubeDLRawData.entries[0].requested_formats[0]
            ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio')).url
            : null)
          ?? (YoutubeDLRawData.entries
          && YoutubeDLRawData.entries[0]
          && YoutubeDLRawData.entries[0].requested_formats
          && YoutubeDLRawData.entries[0].requested_formats[0]
            ? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
            : null)
          ?? null,
      stream_type: YoutubeSourceStreamData
        ? YoutubeSourceStreamData.type
        : undefined ?? undefined,
      orignal_extractor:
        extractor
        ?? YoutubeDLRawData.extractor
        ?? YoutubeDLRawData.extractor_key
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor
          : null)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor_key
          : null)
        ?? 'arbitrary',
      thumbnail:
        ExtraValue.thumbnail
        ?? (YoutubeDLRawData.thumbnail && YoutubeDLRawData.thumbnail[0]
          ? YoutubeDLRawData.thumbnail[0].url
          : null)
        ?? YoutubeDLRawData.thumbnail
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].thumbnail
        && YoutubeDLRawData.entries[0].thumbnail[0]
          ? YoutubeDLRawData.entries[0].thumbnail[0].url
          : null)
        ?? YoutubeDLRawData.entries[0].thumbnail
        ?? null,
      channelId:
        ExtraValue.channelId
        ?? YoutubeDLRawData.channel_id
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_id
          : null)
        ?? null,
      channel_url:
        ExtraValue.channel_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : null)
        ?? null,
      likes:
        ExtraValue.likes
        ?? YoutubeDLRawData.like_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].like_count
          : null)
        ?? 0,
      is_live:
        ExtraValue.is_live
        ?? YoutubeDLRawData.is_live
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].is_live
          : null)
        ?? false,
      dislikes:
        ExtraValue.dislikes
        ?? YoutubeDLRawData.dislike_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].dislike_count
          : null)
        ?? 0,
    };
    return track;
  }
}

module.exports = YoutubeDLExtractor;
