const fetch = require('isomorphic-unfetch');
const { getData, getPreview } = require('spotify-url-info')(fetch);
const youtubeDLEngine = require('./__youtubeDLEngine');

class spotify {
  static __spotifyCachedToken;

  static __spotifyRegex = [
    /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist|show|episode)(?::|\/)((?:[0-9a-zA-Z]){22})/,
  ];

  static __spotifyPlaylistRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;

  static __test(rawUrl, returnRegexValue = false) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== '')) return false;
      return returnRegexValue
        && Boolean(spotify.__spotifyRegex.find((regExp) => regExp.test(rawUrl)))
        ? rawUrl?.match(
          spotify.__spotifyRegex.find((regExp) => rawUrl.match(regExp)),
        ) ?? false
        : Boolean(spotify.__spotifyRegex.find((regExp) => regExp.test(rawUrl)));
    } catch {
      return false;
    }
  }

  static async __extractor(rawUrl, __scrapperOptions, __cacheMain) {
    if (!rawUrl) return undefined;
    try {
      const __rawData = await getData(rawUrl);
      let __arryData;
      let __cacheGarbage;
      let __cacheCount = 0;
      if (
        (__rawData?.type
          && ['track', 'episode'].includes(
            __rawData?.type?.toLowerCase()?.trim(),
          ))
        || __rawData?.show
      ) __arryData = [__rawData];
      else if (
        __rawData?.tracks?.items
        && Array.isArray(__rawData?.tracks?.items)
        && __rawData?.tracks?.items?.length > 0
      ) {
        __arryData = __rawData?.tracks?.items
          ?.filter(
            (rawVideo) => (rawVideo?.track?.name && rawVideo?.track?.name !== '')
              || (rawVideo?.name && rawVideo?.name !== ''),
          )
          ?.filter(Boolean);
      }

      const __processedTracks = (
        await Promise.all(
          __arryData?.map(async (rawTrack) => {
            if (
              !rawTrack
                || (__cacheCount
                  && __cacheCount >= __scrapperOptions?.fetchOptions?.fetchLimit)
            ) return undefined;
            __cacheGarbage = await spotify.__trackParser(
              rawTrack,
              ++__cacheCount,
              __scrapperOptions,
              __cacheMain,
            );
            return __cacheGarbage?.[0];
          }),
        )
      )?.filter(Boolean) ?? [];
      return {
        playlist: Boolean(
          __rawData?.tracks?.items
            && Array.isArray(__rawData?.tracks?.items)
            && __rawData?.tracks?.items?.length > 0,
        ),
        tracks: __processedTracks,
      };
    } catch (rawError) {
      if (__scrapperOptions?.ignoreInternalError) return void __cacheMain.__errorHandling(rawError);
      throw rawError;
    }
  }

  static async __trackParser(
    rawTrack,
    trackIndex,
    __scrapperOptions,
    __cacheMain,
  ) {
    if (!(rawTrack?.id || rawTrack?.track?.id)) return undefined;
    const __previewCaches = await getPreview(
      (rawTrack?.show && rawTrack?.id
        ? `https://open.spotify.com/episode/${rawTrack.id}`
        : undefined)
        ?? (rawTrack?.id || rawTrack?.track?.id
          ? `https://open.spotify.com/track/${
            rawTrack?.id ?? rawTrack?.track?.id
          }`
          : undefined),
    );
    const __trackBlueprint = {
      Id: trackIndex ?? 0,
      url:
        rawTrack?.external_urls?.spotify
        ?? rawTrack?.track?.external_urls?.spotify
        ?? __previewCaches?.link,
      title: rawTrack?.name ?? rawTrack?.track?.name ?? __previewCaches?.title,
      videoId: rawTrack?.track?.id ?? rawTrack?.id,
      author:
        __previewCaches?.artist
        ?? rawTrack?.artists?.[0]?.name
        ?? rawTrack?.track?.artists?.[0]?.name,
      authorLink:
        rawTrack?.artists?.[0].external_urls?.spotify
        ?? rawTrack?.track?.artists?.[0].external_urls?.spotify,
      description: rawTrack?.description ?? __previewCaches?.description,
      duration: rawTrack?.duration_ms ?? rawTrack?.track?.duration_ms,
      orignalExtractor: 'spotify',
      thumbnail: __previewCaches?.image,
      channelId:
        __previewCaches?.artist
        ?? rawTrack?.artists?.[0]?.name
        ?? rawTrack?.track?.artists?.[0]?.name,
      channelUrl:
        rawTrack?.artists?.[0].external_urls?.spotify
        ?? rawTrack?.track?.artists?.[0].external_urls?.spotify,
      isLive: false,
    };
    return await youtubeDLEngine.__rawExtractor(
      __trackBlueprint?.title
        && __trackBlueprint?.author
        && __trackBlueprint?.title?.length < 14
        ? `${__trackBlueprint?.title}|${__trackBlueprint?.author}`
        : __trackBlueprint?.title,
      __trackBlueprint,
      {
        ...__scrapperOptions,
        fetchOptions: { ...__scrapperOptions?.fetchOptions, fetchLimit: 1 },
      },
      __cacheMain,
    );
  }
}

module.exports = spotify;
