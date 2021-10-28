const YoutubeDLExtractor = require('./Track-Extractor');

async function SoundCloudExtractor(
  Query,
  ExtractOptions = {
    Proxy: undefined,
    YTCookies: undefined,
    YoutubeDLCookiesFilePath: undefined,
  },
  RegexValue,
  StreamValueRecordBoolean = undefined,
) {
  try {
    if (
      (RegexValue[3] && RegexValue[3].includes('/sets/'))
      || (RegexValue[2] && RegexValue[2].includes('/sets/'))
      || (RegexValue[4] && RegexValue[4].includes('/sets/'))
      || Query.includes('/sets/')
    ) {
      const YoutubeDLTracks = await YoutubeDLExtractor.YoutubeDLExtraction(
        Query,
        ExtractOptions,
        'soundcloud',
        undefined,
        true,
        StreamValueRecordBoolean,
      );
      return {
        playlist: true,
        tracks: YoutubeDLTracks,
        error: undefined,
      };
    }
    const SoundCloudRawTrack = await YoutubeDLExtractor.YoutubeDLExtraction(
      Query,
      ExtractOptions,
      'souncloud',
      undefined,
      undefined,
      StreamValueRecordBoolean,
    );
    return {
      playlist: false,
      tracks: [SoundCloudRawTrack],
      error: undefined,
    };
  } catch (error) {
    return {
      playlist: false,
      tracks: [],
      error,
    };
  }
}

module.exports = SoundCloudExtractor;