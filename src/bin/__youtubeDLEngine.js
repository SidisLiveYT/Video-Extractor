const { setToken, playlist_info, video_info } = require('play-dl');
const randomUserAgents = require('random-useragent').getRandom;
const { randomOne } = require('proxies-generator');
const fileSystem = require('fs');
const youtubeDLCore = require('youtube-dl-exec');
const trackModel = require('./__trackModeler');

class youtubeDLEngine {
  static __cookies = undefined;

  static __uriRegex = [/^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/];

  static __cookiesFileBuffer = undefined;

  static __userAgents = undefined;

  static __proxy = undefined;

  static __testUri(rawUrl, returnRegexValue = false) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== '')) return false;
      return returnRegexValue
        && Boolean(
          youtubeDLEngine.__uriRegex.find((regExp) => regExp.test(rawUrl)),
        )
        ? rawUrl?.match(
          youtubeDLEngine.__uriRegex.find((regExp) => rawUrl.match(regExp)),
        ) ?? false
        : Boolean(
          youtubeDLEngine.__uriRegex.find((regExp) => regExp.test(rawUrl)),
        );
    } catch {
      return false;
    }
  }

  static async __rawExtractor(
    rawQuery,
    __trackBlueprint,
    __scrapperOptions,
    __cacheMain,
  ) {
    if (!(rawQuery && typeof rawQuery === 'string' && rawQuery !== '')) return undefined;
    let __searchResults;
    let __cacheGarbage;
    let __indexCount = 0;

    if (
      __scrapperOptions?.fetchOptions?.rawCookies
      && youtubeDLEngine.__cookies !== __scrapperOptions?.fetchOptions?.rawCookies
    ) {
      youtubeDLEngine.__cookies ??= __scrapperOptions?.fetchOptions?.rawCookies;
      await setToken({
        youtube: {
          cookie: youtubeDLEngine.__cookies,
        },
      });
    }
    if (
      __scrapperOptions?.fetchOptions?.userAgents
      && typeof __scrapperOptions?.fetchOptions?.userAgents === 'string'
      && __scrapperOptions?.fetchOptions?.userAgents?.toLowerCase()?.trim()
        === 'random-user-agents'
    ) {
      youtubeDLEngine.__userAgents = [
        randomUserAgents(),
        randomUserAgents(),
        randomUserAgents(),
      ];
      await setToken({
        useragent: youtubeDLEngine.__userAgents,
      });
    } else if (
      __scrapperOptions?.fetchOptions?.userAgents
      && Array.isArray(__scrapperOptions?.fetchOptions?.userAgents)
      && __scrapperOptions?.fetchOptions?.userAgents?.length > 0
    ) {
      youtubeDLEngine.__userAgents = __scrapperOptions?.fetchOptions?.userAgents;
      await setToken({
        useragent: youtubeDLEngine.__userAgents,
      });
    }
    if (
      __scrapperOptions?.fetchOptions?.proxies
      && typeof __scrapperOptions?.fetchOptions?.proxies === 'string'
      && __scrapperOptions?.fetchOptions?.proxies?.toLowerCase()?.trim()
        === 'random-proxy'
    ) youtubeDLEngine.__proxy = (await randomOne(true))?.url ?? youtubeDLEngine.__proxy;
    else if (
      __scrapperOptions?.fetchOptions?.proxies
      && Array.isArray(__scrapperOptions?.fetchOptions?.proxies)
      && __scrapperOptions?.fetchOptions?.proxies?.length > 0
    ) youtubeDLEngine.__proxy = __scrapperOptions?.fetchOptions?.proxies?.[0];
    if (
      __scrapperOptions?.fetchOptions?.cookiesFile
      && fileSystem.existsSync(__scrapperOptions?.fetchOptions?.cookiesFile)
    ) youtubeDLEngine.__cookiesFileBuffer = __scrapperOptions?.fetchOptions?.cookiesFile;
    __searchResults = (
      await youtubeDLEngine.#__customSearch(
        rawQuery,
        __trackBlueprint?.orignalExtractor,
      )
    )?.filter(Boolean);
    if (
      !(
        __searchResults
        && Array.isArray(__searchResults)
        && __searchResults?.length > 0
      )
    ) return undefined;
    if (
      __scrapperOptions?.fetchOptions?.fetchLimit
      && !Number.isNaN(__scrapperOptions?.fetchOptions?.fetchLimit)
      && parseInt(__scrapperOptions?.fetchOptions?.fetchLimit) > 0
      && parseInt(__scrapperOptions?.fetchOptions?.fetchLimit) < Infinity
    ) {
      __searchResults = __searchResults
        ?.slice(0, parseInt(__scrapperOptions?.fetchOptions?.fetchLimit ?? 1))
        ?.filter(Boolean);
    }
    return (
      await Promise.all(
        __searchResults?.map(async (__rawTrack) => {
          __cacheGarbage = await youtubeDLEngine.__trackModelling(
            __rawTrack,
            {
              ...__trackBlueprint,
              Id: ++__indexCount,
              orignalExtractor:
                __trackBlueprint?.orignalExtractor
                ?? __rawTrack?.extractor
                ?? 'arbitrary',
            },
            __scrapperOptions,
            __cacheMain,
          );
          if (__cacheGarbage && __scrapperOptions?.eventReturn) {
            __cacheMain.emit(
              'tracks',
              __trackBlueprint?.orignalExtractor ?? 'youtube',
              __cacheGarbage,
              typeof __scrapperOptions?.eventReturn === 'object'
                ? __scrapperOptions?.eventReturn?.metadata
                : undefined,
            );
          } else if (!__cacheGarbage) return undefined;
          return __cacheGarbage;
        }),
      )
    )?.filter(Boolean);
  }

  static async #__customSearch(rawQuery, extractor = 'arbitary') {
    let __rawResults;
    switch (extractor?.toLowerCase()?.trim()) {
      case 'youtube':
        if (/[?&]list=([^#\&\?]+)/.test(rawQuery)) {
          __rawResults = await (
            await playlist_info(rawQuery, { incomplete: true })
          )?.all_videos();
        } else __rawResults = [rawQuery];
        if (
          __rawResults
          && Array.isArray(__rawResults)
          && __rawResults?.length > 0
        ) {
          return await youtubeDLEngine.#__getMetadata(
            __rawResults
              ?.map((track) => {
                if (track?.url) return track?.url;
                if (track && typeof track === 'string') return track;
                return undefined;
              })
              ?.filter(Boolean),
          );
        }
        return undefined;
      default:
        return await youtubeDLEngine.#__getMetadata(rawQuery);
    }
  }

  static async #__getMetadata(rawQuery) {
    const __extraFlags = {
      proxy: youtubeDLEngine.__proxy,
      cookies: youtubeDLEngine.__cookiesFileBuffer,
    };
    let __rawFetchData;

    if (rawQuery && Array.isArray(rawQuery) && rawQuery?.length > 0) {
      __rawFetchData = Promise.all(
        rawQuery?.map(async (query) => {
          query = youtubeDLEngine.__testUri(query)
            ? query
            : `ytsearch:${query}`;
          return await youtubeDLCore(
            query,
            {
              ...__extraFlags,
              dumpSingleJson: true,
              skipDownload: true,
              simulate: true,
              noWarnings: true,
              noCallHome: true,
              noCheckCertificate: true,
              preferFreeFormats: true,
              sleepInterval: 2,
              youtubeSkipDashManifest: true,
            },
            {
              stdio: ['ignore', 'pipe', 'ignore'],
            },
          );
        }),
      );
      return __rawFetchData;
    }
    if (rawQuery) {
      rawQuery = youtubeDLEngine.__testUri(rawQuery)
        ? rawQuery
        : `ytsearch:${rawQuery}`;
      __rawFetchData = await youtubeDLCore(
        rawQuery,
        {
          ...__extraFlags,
          dumpSingleJson: true,
          skipDownload: true,
          simulate: true,
          noWarnings: true,
          noCallHome: true,
          noCheckCertificate: true,
          preferFreeFormats: true,
          sleepInterval: 2,
          youtubeSkipDashManifest: true,
        },
        {
          stdio: ['ignore', 'pipe', 'ignore'],
        },
      );
      return [__rawFetchData];
    }
    return undefined;
  }

  static async __trackModelling(
    __rawTrack,
    __trackBlueprint,
    __scrapperOptions,
    __cacheMain,
  ) {
    try {
      await __cacheMain.__customRatelimit(__scrapperOptions?.ratelimit);
      const Track = new trackModel(
        {
          trackId: __trackBlueprint?.Id ?? __rawTrack?.Id ?? 0,
          url:
            __trackBlueprint?.url
            ?? __rawTrack?.entries?.[0]?.video_url
            ?? __rawTrack?.entries?.[0]?.webpage_url
            ?? __rawTrack?.webpage_url
            ?? __rawTrack?.video_url
            ?? __rawTrack?.url,
          videoId:
            __trackBlueprint?.video_Id
            ?? __trackBlueprint?.videoId
            ?? __rawTrack?.id
            ?? __rawTrack?.videoId
            ?? __rawTrack?.display_id
            ?? __rawTrack?.entries?.[0]?.display_id
            ?? __rawTrack?.entries?.[0]?.id,
          title:
            __trackBlueprint?.title
            ?? __rawTrack?.track
            ?? __rawTrack?.title
            ?? __rawTrack?.entries?.[0]?.title
            ?? __rawTrack?.entries?.[0]?.track,
          author:
            __trackBlueprint?.author
            ?? __rawTrack?.uploader
            ?? __rawTrack?.channel
            ?? __rawTrack?.entries?.[0]?.uploader
            ?? __rawTrack?.entries?.[0]?.channel,
          authorLink:
            __trackBlueprint?.authorLink
            ?? __rawTrack?.uploader_url
            ?? __rawTrack?.channel_url
            ?? __rawTrack?.entries?.[0]?.author_link
            ?? __rawTrack?.entries?.[0]?.uploader_url
            ?? __rawTrack?.entries?.[0]?.channel_url,
          description:
            __trackBlueprint?.description
            ?? __rawTrack?.description
            ?? __rawTrack?.entries?.[0]?.description,
          customExtractor: 'youtube-dl',
          duration:
            (__trackBlueprint?.duration
              ?? __rawTrack?.duration
              ?? __rawTrack?.entries?.[0]?.duration
              ?? 0) * 1000,
          viewsCount:
            __trackBlueprint?.viewsCount
            ?? __rawTrack?.view_count
            ?? __rawTrack?.entries?.[0]?.view_count,
          commentCount:
            __trackBlueprint?.commentCount
            ?? __rawTrack?.comment_count
            ?? __rawTrack?.entries?.[0]?.comment_count,
          fps:
            __trackBlueprint?.fps
            ?? __rawTrack?.fps
            ?? __rawTrack?.entries?.[0]?.fps,
          tags:
            __trackBlueprint?.tags
            ?? __rawTrack?.tags
            ?? __rawTrack?.entries?.[0]?.tags,
          subtitles:
            __trackBlueprint?.subtitles
            ?? __rawTrack?.subtitles
            ?? __rawTrack?.entries?.[0]?.subtitles,
          orignalExtractor:
            __trackBlueprint?.orignalExtractor
            ?? __rawTrack?.extractor
            ?? 'arbitrary',
          thumbnails:
            __trackBlueprint?.thumbnail
            ?? __rawTrack?.thumbnail
            ?? __rawTrack?.entries?.[0]?.thumbnail
            ?? __rawTrack?.thumbnails
            ?? __rawTrack?.entries?.[0]?.thumbnails,
          channelName:
            __trackBlueprint?.author
            ?? __rawTrack?.uploader
            ?? __rawTrack?.channel
            ?? __rawTrack?.entries?.[0]?.uploader
            ?? __rawTrack?.entries?.[0]?.channel,
          channelId:
            __trackBlueprint?.channelId
            ?? __rawTrack?.channel_id
            ?? __rawTrack?.entries?.[0]?.channel_id,
          channelUrl:
            __trackBlueprint?.channelUrl
            ?? __rawTrack?.channel_url
            ?? __rawTrack?.entries?.[0]?.channel_url,
          likes:
            __trackBlueprint?.likes
            ?? __rawTrack?.like_count
            ?? __rawTrack?.entries?.[0]?.like_count
            ?? 0,
          isLive:
            __trackBlueprint?.isLive
            ?? __rawTrack?.is_live
            ?? __rawTrack?.entries?.[0]?.is_live
            ?? false,
          dislikes:
            __trackBlueprint?.dislikes
            ?? __rawTrack?.dislike_count
            ?? __rawTrack?.entries?.[0]?.dislike_count
            ?? 0,
        },
        __rawTrack,
      );

      if (__scrapperOptions?.streamDownload && Track.url) {
        await Track.getStream(
          {
            __youtubeDlCaches: {
              proxy: youtubeDLEngine.__proxy,
              cookies: youtubeDLEngine.__cookies,
            },
            ignoreError: __scrapperOptions?.ignoreInternalError ?? true,
            previewStreamUrl:
              __trackBlueprint?.stream_url
              ?? __trackBlueprint?.stream
              ?? __trackBlueprint?.streamUrl,
            streamUrl: __trackBlueprint?.stream ?? __trackBlueprint?.streamUrl,
            streamType: undefined,
            orignalExtractor:
              __trackBlueprint?.orignalExtractor
              ?? __rawTrack?.extractor
              ?? 'arbitrary',
            userAgents: youtubeDLEngine.__userAgents,
          },
          __cacheMain,
          true,
        );
      }
      if (
        __scrapperOptions?.fetchLyrics
        && __rawTrack?.url
        && !(
          __trackBlueprint?.isLive
          ?? __rawTrack?.is_live
          ?? __rawTrack?.entries?.[0]?.is_live
        )
      ) await Track.getLyrics();
      return Track;
    } catch (rawError) {
      if (__scrapperOptions?.ignoreInternalError) return void __cacheMain.__errorHandling(rawError);
      throw rawError;
    }
  }
}

module.exports = youtubeDLEngine;
