<div align="center">
  <br />
  <br />
  <p>
<h1>Video Extractor</h1>
  </p>
</div>

## About

Video Extractor is a Extractor/Scrapper and Helps Players to fetch data from custom-youtube-dl or Custom Extractors , as Per reduces extra work and credentials.

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
const { Extractor } = require('video-extractor') //For CommonJS
                            OR
import { Extractor } from 'video-extractor' //for ES6


var Data = await Extractor(Url || 'Despacito')
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
      duration: 0,
      preview_stream_url: String,
      stream: String
      orignal_extractor: 'youtube' | 'spotify' | 'facebook' | 'arbitary',
      thumbnail: String,
      channelId: 0 || String,
      channel_url: String,
      likes: 0,
      is_live: false,
      dislikes: 0,
    }
  ]
}
```

- `Data.tracks[0].stream can be used in terms of stream value in @discordjs/voice or any other Audio package .`
- `Object can be seen null or undefined based on platform , like channelId and channel_url isn't present for facebook and soundcloud , But most usable stuff will be there for all shorts of Videos`

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
