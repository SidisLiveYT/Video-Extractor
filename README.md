<div align="center">
  <br />
  <br />
  <p>
<h1>Video Extractor</h1>
  </p>
</div>

## About

Video Extractor is a Extractor/Scrapper/Downloader and Helps Players to fetch data from custom-youtube-dl or Custom Extractors , as Per reduces extra work and credentials.

- Supports Proxy , Cookies Headers for YT Playlists and Cookies.txt File for youtube-dl as ExtractorOptions
- Even Supports Youtube Live Streams to Stream on your Web Application(discord bots , html player and e.t.c)
- Object-oriented , means Value returned in a structure format
- Python Based Browser Extrator -> Need to have Python installed in binary \$PATH
- Supports 700+ Website's Urls and Even Youtube Search
- Delay/Buffer Timeout is max 3 seconds on tracks and 7 sec for Playlists
- Customisable Extractors
- Performant
- 100% coverage of youtube-dl and custom extractors

## Installation

**Node.js 16 or newer is required.**

```sh
npm install video-extractor@latest
```

## Example usage

Extractor Video/Playlist/Album Data from any Platform :-

```js
const { quickExtract , videoExtractor } = require('video-extractor') //For CommonJS
                            //OR
import { quickExtract , videoExtractor } from 'video-extractor' //for ES6/TypeScript


var Data = await quickExtract.softExtractor(Url || 'Despacito'})
var StreamData = await quickExtract.streamExtractor(Url || 'Despacito')

```

## Structure of Data/Track

```js
Data : {
  playlist : Boolean,
  tracks : [
  Track {
    trackId: 1,
    url: 'https://vimeo.com/246660563',
    videoId: '246660563',
    title: 'Fly - imai ft. 79, Kaho Nakamura',
    description: "Stop-motioned various kinds of mochi at my grandparents' place.\n" +
      'Direction/animation: Baku Hashimoto\n' +
      'Logo design: 79\n' +
      'Track by imai (group_inou) featuring 79, Kaho Nakamura (中村佳穂)\n' +
      'soundcloud.com/imai/psep\n' +
      'Behind the scene: baku89.com/making-of/fly',
    author: { Id: undefined, name: 'Baku 麦', url: 'https://vimeo.com/baku89' },      
    extractorModel: { orignal: 'vimeo', custom: 'youtube-dl' },
    duration: { ms: 194000, readable: '3 Minutes 14 Seconds' },
    thumbnail: {
      Id: '246660563',
      metadata: 'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_1280x720&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png'
    },
    channel: { name: 'Baku 麦', Id: 'Baku 麦', url: 'https://vimeo.com/baku89' },
    views: 60812,
    fps: 15,
    keywords: undefined,
    comments: undefined,
    subtitles: { en: [Array] },
    isLive: false,
    ratings: { likes: 2332, dislikes: 0 },
    videoMetadata: {
      video: [Object],
      audio: 'https://150vod-adaptive.akamaized.net/exp=1651128988~acl=%2F1cf9dbe0-76c9-4d13-9252-3a71c1c0cbc5%2F%2A~hmac=33df1c437a48fe5a78f855ca694e16721fee7ef31b594bd38cbaa5caa3f61238/1cf9dbe0-76c9-4d13-9252-3a71c1c0cbc5/sep/audio/0173d7d2/playlist.m3u8'
    },
    streamMetadata: {
      preview: undefined,
      url: 'https://150vod-adaptive.akamaized.net/exp=1651128988~acl=%2F1cf9dbe0-76c9-4d13-9252-3a71c1c0cbc5%2F%2A~hmac=33df1c437a48fe5a78f855ca694e16721fee7ef31b594bd38cbaa5caa3f61238/1cf9dbe0-76c9-4d13-9252-3a71c1c0cbc5/sep/audio/0173d7d2/playlist.m3u8',
      buffer: [Socket],
      type: undefined,
      videoId: '246660563',
      duration: [Object]
    }
  }
],
  error: String | Error |  Error[]  | undefined
}
```

- `Cookies.txt File can be exported from "Cookies.txt" extension on chrome and netscape cookies file type is needed and only path to taht file is neeed for youtube-dl and for YT Cookies for YT Playlist , just give Cookies headers`
- `Extractor() is same as StreamDownloader() but it will not download info related to Streams like - "stream","stream_type" and e.t.c , just the info about the Query`
- `Data.tracks[0].stream can be used in terms of stream value in @discordjs/voice or any other Audio package .`
- `Object can be seen undefined or undefined based on platform , like channelId and channel_url isn't present for facebook and soundcloud , But most usable stuff will be there for all shorts of Videos`
- `Video-Extractor Supports Live Streams of Youtubes and you can stream for your discord.js/voice Audio Resource stream value`

## Cookies.txt Info for youtube-dl

```
   How do I pass cookies to youtube-dl?
       for example  /path/to/cookies/file.txt.  Note that  the
       cookies  file  must  be  in Mozilla/Netscape format and the first line of the cookies file
       must be either # HTTP Cookie File or  # Netscape HTTP Cookie File.   Make  sure  you  have
       correct  newline  format  (<https://en.wikipedia.org/wiki/Newline>)  in the cookies file and
       convert newlines if necessary to correspond with your OS, namely CRLF (\r\n) for  Windows,
       LF  (\n)  for  Linux  and  CR  (\r)  for  Mac  OS.  HTTP Error 400: Bad Request when using
       Cookies Options is a good sign of invalid newline format.

       Passing cookies to youtube-dl is  a  good  way  to  workaround  login  when  a  particular
       extractor  does  not  implement it explicitly.
```

## Links

- [Youtube-dl](https://www.npmjs.com/package/@sidislive/youtube-dl-exec)
- [Source Code](https://github.com/SidisLiveYT/Video-Extractor.git)
- [GitHub Repo Link](https://github.com/SidisLiveYT/Video-Extractor)
- [NPM Package](https://www.npmjs.com/package/video-extractor)
- [Yarn Package](https://yarn.pm/video-extractor)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the ReadMe.md

## Help

If you don't understand something in the ReadMe.md , you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Support Server](https://discord.gg/MfME24sJ2a).
