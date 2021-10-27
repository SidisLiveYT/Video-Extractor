const { search, setToken } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');

class YTPlaylistParser {
  static #YTCookies = undefined

  static async YoutubePlaylistResolver(
    Url,
    ExtractOptions = {
      Proxy: undefined,
      YTCookies: undefined,
      YoutubeDLCookiesFilePath: undefined,
    },
    StreamValueRecordBoolean = undefined,
  ) {
    if (ExtractOptions && ExtractOptions.YTCookies && ExtractOptions.YTCookies !== YTPlaylistParser.#YTCookies) {
      YTPlaylistParser.#YTCookies = ExtractOptions.YTCookies;
      setToken({
        youtube: {
          cookie: YTPlaylistParser.#YTCookies,
        },
      });
    }
    const PlaylistData = search(Url, {
      limit: 100,
      source: { yoututbe: 'playlist' },
    });
    const CacheTracks = PlaylistData.map(
      async (Data) => await YoutubeDLExtractor.YoutubeDLExtraction(
        Data.url ?? Data.name ?? Data.title,
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
