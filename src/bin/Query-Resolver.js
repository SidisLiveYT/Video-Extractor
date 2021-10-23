const { validate } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');
const YoutubePlaylistResolver = require('./YT-Playlist-Resolver');

async function QueryResolver(Query, StreamValueRecordBoolean = undefined) {
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
        ? await YoutubePlaylistResolver(Query, StreamValueRecordBoolean)
        : undefined)
      ?? (ValidateUrlResult
      && (ValidateUrlResult.includes('search') || Query.match(YoutubeUrlRegex))
        ? [
          await YoutubeDLExtractor.YoutubeDLExtraction(
            Query,
            'youtube',
            undefined,
            undefined,
            StreamValueRecordBoolean,
          ),
        ]
        : [
          await YoutubeDLExtractor.YoutubeDLExtraction(
            Query,
            undefined,
            undefined,
            undefined,
            StreamValueRecordBoolean,
          ),
        ]),
  };
  return YoutubeDLTracks;
}

module.exports = QueryResolver;
