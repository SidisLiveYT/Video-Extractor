const SpotifyExtractor = require('./bin/Spotify-Resolver');
const QueryResolver = require('./bin/Query-Resolver');
const SoundCloudExtractor = require('./bin/SoundCloud-Resolver');
const YoutubeDLData = require('../typings/instances-commonjs');

/**
 * @function Extractor Youtube-DL Extractor for Music Players Node.jsv16
 * @param {String} Query Query for Searching Data as Tracks , Playlist or albums
 * @returns {Promise<YoutubeDLData>} YoutubeDLData Array and Playlist boolean
 */

async function Extractor(Query = undefined) {
  if (!Query || (Query && typeof Query !== 'string')) throw TypeError('Query is invalid or is not String');
  const SpotifyUrlRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const SoundCloundUrlRegex = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;
  if (Query.match(SpotifyUrlRegex)) return await SpotifyExtractor(Query);
  if (Query.match(SoundCloundUrlRegex)) return await SoundCloudExtractor(Query, Query.match(SoundCloundUrlRegex));
  return await QueryResolver(Query);
}

/**
 * @function StreamDownloader Youtube-DL Stream Downloader for Music Players Node.jsv16
 * @param {String} Query Query for Searching Data as Tracks , Playlist or albums
 * @returns {Promise<YoutubeDLData>} YoutubeDLData Array and Playlist boolean
 */

async function StreamDownloader(Query = undefined) {
  if (!Query || (Query && typeof Query !== 'string')) throw TypeError('Query is invalid or is not String');
  const SpotifyUrlRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const SoundCloundUrlRegex = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;
  if (Query.match(SpotifyUrlRegex)) return await SpotifyExtractor(Query, true);
  if (Query.match(SoundCloundUrlRegex)) {
    return await SoundCloudExtractor(
      Query,
      Query.match(SoundCloundUrlRegex),
      true,
    );
  }
  return await QueryResolver(Query, true);
}

module.exports = { Extractor, StreamDownloader };
