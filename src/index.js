const SpotifyExtractor = require('./bin/Spotify-Resolver');
const QueryResolver = require('./bin/Query-Resolver');
const SoundCloudExtractor = require('./bin/SoundCloud-Resolver');
const { YoutubeDLData, ExtractOptions } = require('../typings/instances-commonjs');
const { HumanTimeConversion } = require('./bin/Track-Extractor');

/**
 * @function Extractor Youtube-DL Extractor for Music Players Node.jsv16
 * @param {String} Query Query for Searching Data as Tracks , Playlist or albums
 * @param {Object<ExtractOptions>} ExtractOptions Extracting Options for Youtube and Youtube-dl incase of Issue
 * @returns {Promise<YoutubeDLData>} YoutubeDLData Array and Playlist boolean
 */

async function Extractor(
  Query = undefined,
  ExtractOptions = {
    Proxy: undefined,
    YTCookies: undefined,
    YoutubeDLCookiesFilePath: undefined,
  },
) {
  if (!Query || (Query && typeof Query !== 'string')) throw TypeError('Query is invalid or is not String');
  const SpotifyUrlRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const SoundCloundUrlRegex = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;
  if (Query.match(SpotifyUrlRegex)) return Filteration(await SpotifyExtractor(Query, ExtractOptions));
  if (Query.match(SoundCloundUrlRegex)) {
    return Filteration(
      await SoundCloudExtractor(
        Query,
        ExtractOptions,
        Query.match(SoundCloundUrlRegex),
      ),
    );
  }
  return Filteration(await QueryResolver(Query, ExtractOptions));
}

/**
 * @function StreamDownloader Youtube-DL Stream Downloader for Music Players Node.jsv16
 * @param {String} Query Query for Searching Data as Tracks , Playlist or albums
 * @param {Object<ExtractOptions>} ExtractOptions Extracting Options for Youtube and Youtube-dl incase of Issue
 * @returns {Promise<YoutubeDLData>} YoutubeDLData Array and Playlist boolean
 */

async function StreamDownloader(
  Query = undefined,
  ExtractOptions = {
    Proxy: undefined,
    YTCookies: undefined,
    YoutubeDLCookiesFilePath: undefined,
  },
) {
  if (!Query || (Query && typeof Query !== 'string')) throw TypeError('Query is invalid or is not String');
  const SpotifyUrlRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const SoundCloundUrlRegex = /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;
  if (Query.match(SpotifyUrlRegex)) return Filteration(await SpotifyExtractor(Query, ExtractOptions, true));
  if (Query.match(SoundCloundUrlRegex)) {
    return Filteration(
      await SoundCloudExtractor(
        Query,
        ExtractOptions,
        Query.match(SoundCloundUrlRegex),
        true,
      ),
    );
  }
  return await QueryResolver(Query, ExtractOptions, true);
}
function Filteration(DataStructure) {
  if (DataStructure && DataStructure.tracks && DataStructure.tracks[0]) DataStructure.tracks = DataStructure.tracks.filter(Boolean);

  return DataStructure;
}

module.exports = { Extractor, StreamDownloader, HumanTimeConversion };
