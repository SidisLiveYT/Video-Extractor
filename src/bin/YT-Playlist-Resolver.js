const { search } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');

class YTPlaylistParser {
  static async YoutubePlaylistResolver(
    Url,
    ExtractOptions = {
      Proxy: undefined,
      BypassRatelimit: true,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
      SkipVideoDataOverRide: undefined,
    },
    StreamValueRecordBoolean = undefined,
  ) {
    const PlaylistData = search(Url, {
      limit: 100,
      source: { yoututbe: 'playlist' },
    });
    return await Promise.all(
      PlaylistData.map(
        async (Data) => await YoutubeDLExtractor.YoutubeDLExtraction(
          Data.title,
          ExtractOptions,
          'youtube',
          undefined,
          undefined,
          StreamValueRecordBoolean,
        ),
      ),
    );
  }
}

module.exports = YTPlaylistParser.YoutubePlaylistResolver;
