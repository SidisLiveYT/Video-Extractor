const { search, setToken } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');

class YTPlaylistParser {
  static async YoutubePlaylistResolver(
    Url,
    ExtractOptions = {
      Proxy: undefined,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
    },
    StreamValueRecordBoolean = undefined,
  ) {
    const PlaylistData = search(Url, {
      limit: 100,
      source: { yoututbe: 'playlist' },
    });
    const CacheTracks = PlaylistData.map(
      async (Data) => await YoutubeDLExtractor.YoutubeDLExtraction(
        Data.url ?? Data.name ?? Data.title,
        ExtractOptions,
        'youtube',
        undefined,
        undefined,
        StreamValueRecordBoolean,
      ),
    );
    await Promise.all(CacheTracks);
    return CacheTracks;
  }
}

module.exports = YTPlaylistParser.YoutubePlaylistResolver;
