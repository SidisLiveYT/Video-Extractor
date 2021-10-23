const { getData, getPreview } = require('spotify-url-info');
const YoutubeDLExtractor = require('./Track-Extractor');

async function SpotifyScrapper(Url, StreamValueRecordBoolean = undefined) {
  const SpotifyTracksRawData = await getData(Url);
  if (SpotifyTracksRawData.type === 'track') {
    const CacheTrack = await SpotifyTrackExtractor(
      SpotifyTracksRawData,
      StreamValueRecordBoolean,
    );
    return {
      playlist: false,
      tracks: [CacheTrack],
    };
  }

  const ProcessedTracks = await Promise.all(
    SpotifyTracksRawData.tracks.items.map(
      async (Track) => await SpotifyTrackExtractor(Track, StreamValueRecordBoolean),
    ),
  );

  return {
    playlist: false,
    tracks: ProcessedTracks,
  };

  async function SpotifyTrackExtractor(
    SpotifyTrackRawData,
    StreamValueRecordBoolean,
  ) {
    const VideoThumbnailPreview = await getPreview(
      SpotifyTrackRawData.external_urls
        ? SpotifyTrackRawData.external_urls.spotify
        : SpotifyTrackRawData.track.external_urls.spotify,
    );
    const track = {
      Id: 0,
      url:
        (SpotifyTrackRawData.external_urls
          ? SpotifyTrackRawData.external_urls.spotify
            ?? SpotifyTrackRawData.track.external_urls.spotify
            ?? undefined
          : undefined)
        ?? (VideoThumbnailPreview ? VideoThumbnailPreview.link : undefined)
        ?? undefined,
      video_Id:
        (SpotifyTrackRawData.track ? SpotifyTrackRawData.track.id : undefined)
        ?? SpotifyTrackRawData.id
        ?? undefined,
      title:
        SpotifyTrackRawData.name
        ?? (SpotifyTrackRawData.track ? SpotifyTrackRawData.track.name : undefined)
        ?? VideoThumbnailPreview.title
        ?? undefined,
      author:
        (SpotifyTrackRawData.artists && SpotifyTrackRawData.artists[0]
          ? SpotifyTrackRawData.artists[0].name
          : SpotifyTrackRawData.track
            && SpotifyTrackRawData.track.artists
            && SpotifyTrackRawData.track.artists[0]
            ? SpotifyTrackRawData.track.artists[0].name
            : undefined) ?? undefined,
      author_link:
        (SpotifyTrackRawData.artists && SpotifyTrackRawData.artists[0]
          ? SpotifyTrackRawData.artists[0].url
          : SpotifyTrackRawData.track
            && SpotifyTrackRawData.track.artists
            && SpotifyTrackRawData.track.artists[0]
            ? SpotifyTrackRawData.track.artists[0].url
            : undefined) ?? undefined,
      description:
        SpotifyTrackRawData.description
        ?? VideoThumbnailPreview.description
        ?? undefined,
      custom_extractor: 'youtube-dl',
      duration:
        SpotifyTrackRawData.duration_ms
        ?? (SpotifyTrackRawData.track
          ? SpotifyTrackRawData.track.duration_ms
          : undefined)
        ?? undefined,
      orignal_extractor: 'spotify',
      thumbnail: VideoThumbnailPreview.image ?? undefined,
      channelId: undefined,
      channel_url: undefined,
      likes: undefined,
      is_live: false,
      dislikes: undefined,
    };
    const ProcessedTracks = await YoutubeDLExtractor.YoutubeDLExtraction(
      track.title,
      'spotify',
      track,
      undefined,
      StreamValueRecordBoolean,
    );
    return ProcessedTracks;
  }
}
module.exports = SpotifyScrapper;
