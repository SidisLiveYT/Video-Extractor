const { validate } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');
const YoutubePlaylistResolver = require('./YT-Playlist-Resolver');

async function QueryResolver(
  Query,
  ExtractOptions = {
    Proxy: undefined,
    YTCookies: undefined,
    YoutubeDLCookiesFilePath: undefined,
  },
  StreamValueRecordBoolean = undefined,
) {
  try {
    const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
    const ValidateUrlResult = await validate(Query);
    const YoutubeDLTracks = {
      playlist: ValidateUrlResult
        ? ValidateUrlResult.includes('playlist')
          ?? ValidateUrlResult.includes('album')
          ?? undefined
        : false,
      tracks:
        (Query.match(YoutubeUrlRegex)
        && ValidateUrlResult
        && (ValidateUrlResult.includes('playlist')
          || ValidateUrlResult.includes('album'))
          ? await YoutubePlaylistResolver(
            Query,
            ExtractOptions,
            StreamValueRecordBoolean,
          )
          : undefined)
        ?? (ValidateUrlResult
        && (ValidateUrlResult.includes('search') || Query.match(YoutubeUrlRegex))
          ? [
            (await YoutubeDLExtractor.YoutubeDLExtraction(
              Query,
              ExtractOptions,
              'youtube',
              undefined,
              undefined,
              StreamValueRecordBoolean,
            )),
          ]
          : [
            await YoutubeDLExtractor.YoutubeDLExtraction(
              Query,
              ExtractOptions,
              undefined,
              undefined,
              undefined,
              StreamValueRecordBoolean,
            ),
          ]),
      error: undefined,
    };
    return YoutubeDLTracks;
  } catch (error) {
    return {
      playlist: false,
      tracks: [],
      error,
    };
  }
}

module.exports = QueryResolver;
