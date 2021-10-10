const { validate } = require('play-dl');
const YoutubeDLExtractor = require('./Tracks-Extractor');
const YoutubePlaylistResolver = require('./YT-Playlist-Resolver');

async function QueryResolver(Query) {
  const ValidateUrlResult = validate(Query);
  const YoutubeUrlRegex = /^.*(youtu.be\/|list=|watch=|v=)([^#\&\?]*).*/;
  const YoutubeDLTracks = {
    playlist:
      ValidateUrlResult.includes('playlist')
      ?? ValidateUrlResult.includes('album')
      ?? false,
    tracks:
      Query.match(YoutubeUrlRegex)
      && (ValidateUrlResult.includes('playlist')
        || ValidateUrlResult.includes('album'))
        ? await YoutubePlaylistResolver(Query)
        : [await YoutubeDLExtractor(Query)],
  };
  return YoutubeDLTracks;
}

module.exports = QueryResolver;
