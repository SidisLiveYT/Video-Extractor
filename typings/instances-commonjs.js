var YoutubeDLTrack = {
  Id: 0,
  url: null,
  title: null,
  author: null,
  author_link: null,
  description: null,
  custom_extractor: `youtube-dl`,
  duration: 0,
  human_duration: undefined,
  preview_stream_url: null,
  video_stream: null,
  stream: null,
  stream_url: ' ',
  stream_type: undefined,
  stream_duration: 0,
  stream_video_Id: undefined,
  stream_human_duration: undefined,
  orignalExtractor: null | 'youtube' | 'spotify' | 'facebook' | 'arbitrary',
  thumbnail: null,
  channelId: 'none' | 0,
  channel_url: null,
  lyrics: '',
  likes: 0,
  is_live: false,
  dislikes: 0,
}

var YoutubeDLData = {
  playlist: false,
  tracks: [YoutubeDLTrack],
  error: undefined,
}
var ExtractOptions = {
  Proxy: `http://127.0.0.1:2267`, //Proxy -> IP:Port
  BypassRatelimit: true, //Boolean value | if true , then Track will take time to fetch based on Non-Ratelimit Songs and Error have to be handled
  YTCookies: undefined, //Youtube Cookies Value ( a very Big String here )
  YoutubeDLCookiesFilePath: undefined, //Fetch a Cookie.txt which is a Netscape Cookie File and give path file ("./path/to/file") like this
  SkipVideoDataOverRide: undefined, //Skips Video Data and only focus on Audio Streams if true
}

module.exports = { YoutubeDLData, ExtractOptions }
