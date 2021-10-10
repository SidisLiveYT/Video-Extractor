const YoutubeDL = require('youtube-dl-exec')
const isUrl = require('is-url')

async function DataExtractorYoutubeDL(
  Query,
  extractor = false,
  ExtraValue = {},
  SpecialPlaylistRequest = false,
) {
  try {
    Query = !isUrl(Query) ? `ytsearch:${Query}` : Query
    const YoutubeDLRawDatas = await YoutubeDL(Query, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    })
    if (!SpecialPlaylistRequest) {
      return YoutubeDLTrackModel(
        YoutubeDLRawDatas[0] ?? YoutubeDLRawDatas,
        extractor,
        ExtraValue,
      )
    } else {
      var ProcessedYoutubeDLTrack =
        YoutubeDLRawDatas && YoutubeDLRawDatas.entries
          ? await Promise.all(
              await YoutubeDLRawDatas.entries.map((Track) => {
                return YoutubeDLTrackModel(Track, extractor)
              }),
            )
          : []
      return ProcessedYoutubeDLTrack
    }
  } catch (error) {
    return void null
  }

  function YoutubeDLTrackModel(
    YoutubeDLRawData,
    extractor = false,
    ExtraValue = {},
  ) {
    const track = {
      Id: 0,
      url:
        ExtraValue.url ??
        YoutubeDLRawData.webpage_url ??
        YoutubeDLRawData.entries[0].webpage_url ??
        YoutubeDLRawData.video_url ??
        'none',
      title:
        ExtraValue.title ??
        YoutubeDLRawData.track ??
        YoutubeDLRawData.title ??
        YoutubeDLRawData.entries[0].title ??
        'none',
      author:
        ExtraValue.author ??
        YoutubeDLRawData.uploader ??
        YoutubeDLRawData.channel ??
        YoutubeDLRawData.entries[0].creator ??
        YoutubeDLRawData.entries[0].uploader ??
        'none',
      author_link:
        ExtraValue.author_link ??
        YoutubeDLRawData.uploader_url ??
        YoutubeDLRawData.entries[0].uploader_url ??
        YoutubeDLRawData.channel_url ??
        YoutubeDLRawData.entries[0].channel_url ??
        'none',
      description:
        ExtraValue.description ??
        YoutubeDLRawData.description ??
        YoutubeDLRawData.entries[0].description ??
        'none',
      custom_extractor: 'youtube-dl',
      duration:
        ExtraValue.duration ??
        YoutubeDLRawData.duration ??
        YoutubeDLRawData.entries[0].duration ??
        0,
      stream_url:
        ExtraValue.stream_url ??
        YoutubeDLRawData.url ??
        YoutubeDLRawData.entries[0].formats.find((rqformat) =>
          rqformat.format.includes('audio'),
        ).url ??
        YoutubeDLRawData.entries[0].requested_formats.find((rqformat) =>
          rqformat.format.includes('audio'),
        ).url ??
        'none',
      orignal_extractor:
        extractor ??
        YoutubeDLRawData.extractor ??
        YoutubeDLRawData.extractor_key ??
        YoutubeDLRawData.entries[0].extractor ??
        YoutubeDLRawData.entries[0].extractor_key ??
        'arbitary',
      thumbnail:
        ExtraValue.thumbnail ??
        YoutubeDLRawData.thumbnail ??
        YoutubeDLRawData.entries[0].thumbnail ??
        YoutubeDLRawData.thumbnail[0].url ??
        'none',
      channelId:
        ExtraValue.channelId ??
        YoutubeDLRawData.channel_id ??
        YoutubeDLRawData.entries[0].channel_id ??
        'none',
      channel_url:
        ExtraValue.channel_url ??
        YoutubeDLRawData.channel_url ??
        YoutubeDLRawData.entries[0].channel_url ??
        'none',
      likes:
        ExtraValue.likes ??
        YoutubeDLRawData.like_count ??
        YoutubeDLRawData.entries[0].like_count ??
        0,
      is_live:
        ExtraValue.is_live ??
        YoutubeDLRawData.is_live ??
        YoutubeDLRawData.entries[0].is_live ??
        false,
      dislikes:
        ExtraValue.dislikes ??
        YoutubeDLRawData.like_count ??
        YoutubeDLRawData.entries[0].dislike_count ??
        0,
    }
    return track
  }
}

module.exports = DataExtractorYoutubeDL
