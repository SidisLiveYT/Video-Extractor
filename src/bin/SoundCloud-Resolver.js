const SoundCloud = require('soundcloud-scraper');

const SoundCloudClient = new SoundCloud.Client();
const YoutubeDLExtractor = require('./Track-Extractor');

async function SoundCloudExtractor(Query, RegexValue) {
  if (
    (RegexValue[3] && RegexValue[3].includes('/sets/'))
    || (RegexValue[2] && RegexValue[2].includes('/sets/'))
    || (RegexValue[4] && RegexValue[4].includes('/sets/'))
    || Query.includes('/sets/')
  ) {
    const YoutubeDLTracks = await YoutubeDLExtractor(
      Query,
      'soundcloud',
      null,
      true,
    );
    return {
      playlist: true,
      tracks: YoutubeDLTracks,
    };
  }
  const SoundCloudRawTrack = await SoundCloudClient.getSongInfo(Query);
  return {
    playlist: false,
    tracks: [await SoundCloundTrackModel(SoundCloudRawTrack)],
  };

  async function SoundCloundTrackModel(SoundCloudRawTrack) {
    const track = {
      Id: SoundCloudRawTrack.id ?? null,
      url: SoundCloudRawTrack.url ?? null,
      video_Id: SoundCloudRawTrack.id ?? null,
      title: SoundCloudRawTrack.title ?? null,
      author: SoundCloudRawTrack.author.name ?? null,
      author_link: SoundCloudRawTrack.author.url ?? null,
      description: SoundCloudRawTrack.description ?? null,
      custom_extractor: 'youtube-dl -> soundcloud',
      duration: SoundCloudRawTrack.duration ?? null,
      stream_url:
        SoundCloudRawTrack.streamURL && SoundCloudRawTrack.streamURL !== 'null'
          ? SoundCloudRawTrack.streamURL
          : null ?? null,
      orignal_extractor: 'soundcloud',
      thumbnail: SoundCloudRawTrack.thumbnail ?? null,
      channelId: null,
      channel_url: null,
      likes: SoundCloudRawTrack.likes ?? null,
      is_live: false,
      dislikes: null,
    };
    const CompleteTracks = await YoutubeDLExtractor.YoutubeDLExtraction(
      track.title,
      'souncloud',
      track,
    );
    return CompleteTracks;
  }
}

module.exports = SoundCloudExtractor;
