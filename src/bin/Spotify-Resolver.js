const { getData, getPreview } = require('spotify-url-info');
const YoutubeDLExtractor = require('./Track-Extractor');

async function SpotifyScrapper(
  Url,
  ExtractOptions = {
    Proxy: undefined,
    BypassRatelimit: true,
    YTCookies: undefined,
    YoutubeDLCookiesFilePath: undefined,
  },
  StreamValueRecordBoolean = undefined,
) {
  try {
    const SpotifyTracksRawData = await getData(Url);
    if (SpotifyTracksRawData.type === 'track') {
      const CacheTrack = await SpotifyTrackExtractor(
        SpotifyTracksRawData,
        ExtractOptions,
        StreamValueRecordBoolean,
      );
      return {
        playlist: false,
        tracks:
          (CacheTrack && CacheTrack.tracks
            ? [CacheTrack.tracks]
            : [CacheTrack]) ?? [],
        error: CacheTrack && CacheTrack.error ? CacheTrack.error : undefined,
      };
    }
    SpotifyTracksRawData.tracks.items = SpotifyTracksRawData.tracks.items.map(
      (video) => {
        if (
          (video && video.track && video.track.name !== '')
          || (video && video.name !== '')
        ) return video;
        return void undefined;
      },
    );
    SpotifyTracksRawData.tracks.items = SpotifyTracksRawData.tracks.items.filter(
      Boolean,
    );
    const ProcessedTracks = await Promise.all(
      SpotifyTracksRawData.tracks.items.map(
        async (Track) => await SpotifyTrackExtractor(
          Track,
          ExtractOptions,
          StreamValueRecordBoolean,
        ),
      ),
    );

    return {
      playlist: !!ProcessedTracks[0],
      tracks:
        (ProcessedTracks && ProcessedTracks[0].tracks
          ? ProcessedTracks.map((instance) => instance.tracks)
          : ProcessedTracks) ?? [],
      error:
        ProcessedTracks && ProcessedTracks[0].error
          ? ProcessedTracks.map((instance) => instance.error)
          : undefined,
    };
  } catch (error) {
    return {
      playlist: false,
      tracks: [],
      error,
    };
  }

  async function SpotifyTrackExtractor(
    SpotifyTrackRawData,
    ExtractOptions = {
      Proxy: undefined,
      BypassRatelimit: true,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
    },
    StreamValueRecordBoolean,
  ) {
    const VideoThumbnailPreview = await getPreview(
      (SpotifyTrackRawData.id
        ? `https://open.spotify.com/track/${SpotifyTrackRawData.id}`
        : undefined)
        ?? (SpotifyTrackRawData.track
          ? `https://open.spotify.com/track/${SpotifyTrackRawData.track.id}`
          : undefined),
    );
    const track = {
      Id: 0,
      url:
        (SpotifyTrackRawData.external_urls
          ? SpotifyTrackRawData.external_urls.spotify
          : undefined)
        ?? (SpotifyTrackRawData.track.external_urls
          ? SpotifyTrackRawData.track.external_urls.spotify
          : undefined)
        ?? (VideoThumbnailPreview ? VideoThumbnailPreview.link : undefined)
        ?? undefined,
      video_Id:
        (SpotifyTrackRawData.track
          ? SpotifyTrackRawData.track.id
          : undefined)
        ?? SpotifyTrackRawData.id
        ?? undefined,
      title:
        SpotifyTrackRawData.name
        ?? (SpotifyTrackRawData.track
          ? SpotifyTrackRawData.track.name
          : undefined)
        ?? VideoThumbnailPreview.title
        ?? undefined,
      author:
        VideoThumbnailPreview.artist
        ?? (SpotifyTrackRawData.artists && SpotifyTrackRawData.artists[0]
          ? SpotifyTrackRawData.artists[0].name
          : SpotifyTrackRawData.track
            && SpotifyTrackRawData.track.artists
            && SpotifyTrackRawData.track.artists[0]
            ? SpotifyTrackRawData.track.artists[0].name
            : undefined)
        ?? undefined,
      author_link:
        (SpotifyTrackRawData.artists
        && SpotifyTrackRawData.artists[0]
        && SpotifyTrackRawData.artists[0].external_urls
          ? SpotifyTrackRawData.artists[0].external_urls.spotify
          : SpotifyTrackRawData.track
            && SpotifyTrackRawData.track.artists
            && SpotifyTrackRawData.track.artists[0]
            ? SpotifyTrackRawData.track.artists[0].external_urls.spotify
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
      `${track.title}`,
      ExtractOptions,
      'spotify',
      track,
      undefined,
      StreamValueRecordBoolean,
    );
    return ProcessedTracks;
  }
}
module.exports = SpotifyScrapper;
