const YoutubeDLExtractor = require('./Track-Extractor');

async function SoundCloudExtractor(
  Query,
  RegexValue,
  StreamValueRecordBoolean = undefined,
) {
  if (
    (RegexValue[3] && RegexValue[3].includes('/sets/'))
    || (RegexValue[2] && RegexValue[2].includes('/sets/'))
    || (RegexValue[4] && RegexValue[4].includes('/sets/'))
    || Query.includes('/sets/')
  ) {
    const YoutubeDLTracks = await YoutubeDLExtractor(
      Query,
      'soundcloud',
      undefined,
      true,
      StreamValueRecordBoolean,
    );
    return {
      playlist: true,
      tracks: YoutubeDLTracks,
    };
  }
  const SoundCloudRawTrack = await YoutubeDLExtractor.YoutubeDLExtraction(
    Query,
    'souncloud',
    undefined,
    undefined,
    StreamValueRecordBoolean,
  );
  return {
    playlist: false,
    tracks: [SoundCloudRawTrack],
  };
}

module.exports = SoundCloudExtractor;
