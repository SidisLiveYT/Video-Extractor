const { search } = require('play-dl');
const YoutubeDLExtractor = require('./Track-Extractor');

async function YoutubePlaylistResolver(Url, StreamValueRecordBoolean = null) {
  const PlaylistData = search(Url, {
    limit: 100,
    source: { yoututbe: 'playlist' },
  });
  const CacheTracks = PlaylistData.map(
    async (Data) => await YoutubeDLExtractor.YoutubeDLExtraction(
      Data.url ?? Data.name ?? Data.title,
      'youtube',
      null,
      null,
      StreamValueRecordBoolean,
    ),
  );
  await Promise.all(CacheTracks);
  return CacheTracks;
}

module.exports = YoutubePlaylistResolver;
