const { validate } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');
const YoutubePlaylistResolver = require('./YT-Playlist-Resolver');

async function QueryResolver(Query) {
  const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
  const ValidateUrlResult = await validate(Query);
  const YoutubeDLTracks = {
    playlist:
      !ValidateUrlResult
      ?? ValidateUrlResult.includes('playlist')
      ?? ValidateUrlResult.includes('album')
      ?? false,
    tracks:
      Query.match(YoutubeUrlRegex)
      && ValidateUrlResult
      && (ValidateUrlResult.includes('playlist')
        || ValidateUrlResult.includes('album'))
        ? await YoutubePlaylistResolver(Query)
        : [await YoutubeDLExtractor.YoutubeDLExtraction(Query)],
  };
  return YoutubeDLTracks;
}

module.exports = QueryResolver;
