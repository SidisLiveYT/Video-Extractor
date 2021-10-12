const YoutubeDL = require('@sidislive/youtube-dl-exec');
const isUrl = require('is-url');

async function DataExtractorYoutubeDL(
  Query,
  extractor = false,
  ExtraValue = {},
  SpecialPlaylistRequest = false,
) {
  try {
    Query = !isUrl(Query) ? `ytsearch:${Query}` : Query;
    const YoutubeDLRawDatas = await YoutubeDL(Query, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    if (!SpecialPlaylistRequest) {
      return YoutubeDLTrackModel(
        YoutubeDLRawDatas[0] ?? YoutubeDLRawDatas,
        extractor,
        ExtraValue,
      );
    }
    const ProcessedYoutubeDLTrack = YoutubeDLRawDatas && YoutubeDLRawDatas.entries
      ? await Promise.all(
        await YoutubeDLRawDatas.entries.map((Track) => YoutubeDLTrackModel(Track, extractor)),
      )
      : [];
    return ProcessedYoutubeDLTrack;
  } catch (error) {
    return void null;
  }

  function YoutubeDLTrackModel(
    YoutubeDLRawData,
    extractor = false,
    ExtraValue = {},
  ) {
    const track = {
      Id: 0,
      url:
        ExtraValue.url
        ?? YoutubeDLRawData.video_url
        ?? (YoutubeDLRawData.webpage_url
        && !YoutubeDLRawData.extractor.includes('youtube:search')
          ? YoutubeDLRawData.webpage_url
          : false)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].webpage_url
        && !YoutubeDLRawData.entries[0].extractor.includes('youtube:search')
          ? YoutubeDLRawData.entries[0].webpage_url
          : false)
        ?? 'none',
      video_Id:
        ExtraValue.video_Id
        ?? YoutubeDLRawData.display_id
        ?? (YoutubeDLRawData.display_id
        && !YoutubeDLRawData.extractor.includes('youtube:search')
          ? YoutubeDLRawData.display_id
          : false)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].display_id
        && !YoutubeDLRawData.entries[0].extractor.includes('youtube:search')
          ? YoutubeDLRawData.entries[0].display_id
          : false)
        ?? 'none',
      title:
        ExtraValue.title
        ?? YoutubeDLRawData.track
        ?? YoutubeDLRawData.title
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].title
          : false)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].track
          : false)
        ?? 'none',
      author:
        ExtraValue.author
        ?? YoutubeDLRawData.uploader
        ?? YoutubeDLRawData.channel
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader
          : false)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel
          : false)
        ?? 'none',
      author_link:
        ExtraValue.author_link
        ?? YoutubeDLRawData.uploader_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].author_link
          : false)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].uploader_url
          : false)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : false)
        ?? 'none',
      description:
        ExtraValue.description
        ?? YoutubeDLRawData.description
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].description
          : false)
        ?? 'none',
      custom_extractor: 'youtube-dl',
      duration:
        ExtraValue.duration
        ?? YoutubeDLRawData.duration
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].duration
          : false)
        ?? 0,
      stream_url:
        ExtraValue.stream_url
        ?? YoutubeDLRawData.url
        ?? (YoutubeDLRawData.formats && YoutubeDLRawData.formats[0]
          ? YoutubeDLRawData.formats.find((rqformat) => rqformat.format.includes('audio')).url
          : false)
        ?? (YoutubeDLRawData.requested_formats
        && YoutubeDLRawData.requested_formats[0]
          ? YoutubeDLRawData.requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : false)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].formats.find((rqformat) => rqformat.format.includes('audio')).url
          : false)
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].requested_formats
        && YoutubeDLRawData.entries[0].requested_formats[0]
          ? YoutubeDLRawData.entries[0].requested_formats.find((rqformat) => rqformat.format.includes('audio')).url
          : false)
        ?? 'none',
      orignal_extractor:
        extractor
        ?? YoutubeDLRawData.extractor
        ?? YoutubeDLRawData.extractor_key
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor
          : false)
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].extractor_key
          : false)
        ?? 'arbitary',
      thumbnail:
        ExtraValue.thumbnail
        ?? (YoutubeDLRawData.thumbnail && YoutubeDLRawData.thumbnail[0]
          ? YoutubeDLRawData.thumbnail[0].url
          : false)
        ?? YoutubeDLRawData.thumbnail
        ?? (YoutubeDLRawData.entries
        && YoutubeDLRawData.entries[0]
        && YoutubeDLRawData.entries[0].thumbnail
        && YoutubeDLRawData.entries[0].thumbnail[0]
          ? YoutubeDLRawData.entries[0].thumbnail[0].url
          : false)
        ?? YoutubeDLRawData.entries[0].thumbnail
        ?? 'none',
      channelId:
        ExtraValue.channelId
        ?? YoutubeDLRawData.channel_id
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_id
          : false)
        ?? 'none',
      channel_url:
        ExtraValue.channel_url
        ?? YoutubeDLRawData.channel_url
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].channel_url
          : false)
        ?? 'none',
      likes:
        ExtraValue.likes
        ?? YoutubeDLRawData.like_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].like_count
          : false)
        ?? 0,
      is_live:
        ExtraValue.is_live
        ?? YoutubeDLRawData.is_live
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].is_live
          : false)
        ?? false,
      dislikes:
        ExtraValue.dislikes
        ?? YoutubeDLRawData.dislike_count
        ?? (YoutubeDLRawData.entries && YoutubeDLRawData.entries[0]
          ? YoutubeDLRawData.entries[0].dislike_count
          : false)
        ?? 0,
    };
    return track;
  }
}

module.exports = DataExtractorYoutubeDL;
