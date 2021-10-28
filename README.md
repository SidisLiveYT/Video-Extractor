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

```
npm install video-extractor@latest
```

## Example usage

Extractor Video/Playlist/Album Data from any Platform :-

```
const { Extractor , StreamDownloader , HumanTimeConversion } = require('video-extractor') //For CommonJS
                            //OR
import { Extractor, StreamDownloader , HumanTimeConversion } from 'video-extractor' //for ES6


var Data = await Extractor(Url || 'Despacito', {
  Proxy: `http://127.0.0.1:2267`, //Proxy -> IP:Port
  YTCookies: undefined,  //Youtube Cookies Value ( a very Big String here )
  YoutubeDLCookiesFilePath: undefined //Fetch a Cookie.txt which is a Netscape Cookie File and give path file ("./path/to/file") like this
})
var StreamData = await StreamDownloader(Url || 'Despacito')
var HumanTime = HumanTimeConversion(MilliSeconds)

```

## Structure of Data/Track

```
Data : {
  playlist : Boolean,
  tracks : [
    {
      Id: 0,
      url: String,
      video_Id: String,
      title: String,
      author: String,
      author_link: String,
      description: String,
      custom_extractor: `youtube-dl`,
      duration: Number
      human_duration: String,
      stream: String,  // using StreamDownloader() will give "stream Data" or else undefined or 0
      stream_type: String,
      stream_duration: Number,
      stream_video_Id: String,
      stream_human_duration: Number,
      orignal_extractor: 'youtube' | 'spotify' | 'facebook' | 'arbitrary',
      thumbnail: String,
      channelId: 0 || String,
      channel_url: String,
      likes: 0,
      is_live: false,
      dislikes: 0,
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

## Use-Case for @discordjs/voice Package

```
const { StreamDownloader } = require('video-extractor')
const { createAudioResource } = require('@discordjs/voice')

const Data = await StreamDownloader('Despacito', {
  Proxy: `http://127.0.0.1:2267`, //Proxy -> IP:Port
  YTCookies: undefined,  //Youtube Cookies Value ( a very Big String here )
  YoutubeDLCookiesFilePath: undefined //Fetch a Cookie.txt which is a Netscape Cookie File and give path file ("./path/to/file") like this
})

if(Data.error) throw error; 

var Audio_Resource = createAudioResource(Data.tracks[0].stream ,{
  inputType: Data.tracks[0].stream_type
})


/*

- Rest is mentioned in @discordjs/voice examples , from here "Audio_Resource" is important
- Extractor() is same as StreamDownloader() but it will not download info related to Streams like - "stream","stream_type" and e.t.c , just the info about the Query

*/

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
nudge in the right direction, please don't hesitate to join our official [Support Server](https://discord.gg/Vkmzffpjny).
