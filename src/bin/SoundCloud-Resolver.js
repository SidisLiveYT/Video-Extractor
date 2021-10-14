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
  const SoundCloudRawTrack = await YoutubeDLExtractor.YoutubeDLExtraction(
    Query,
    'souncloud',
  );
  return {
    playlist: false,
    tracks: [SoundCloudRawTrack],
  };
}

module.exports = SoundCloudExtractor;
