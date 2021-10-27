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
  stream: null,
  stream_type: undefined,
  stream_duration: 0,
  stream_video_Id: undefined,
  stream_human_duration: undefined,
  orignal_extractor: null | 'youtube' | 'spotify' | 'facebook' | 'arbitrary',
  thumbnail: null,
  channelId: 'none' | 0,
  channel_url: null,
  likes: 0,
  is_live: false,
  dislikes: 0,
}

var YoutubeDLData = {
  playlist: false,
  tracks: [YoutubeDLTrack],
  error: undefined
}
var ExtractOptions = {
  Proxy: `http://127.0.0.1:2267`, //Proxy -> IP:Port
  YTCookies: undefined,  //Youtube Cookies Value ( a very Big String here )
  YoutubeDLCookiesFilePath: undefined //Fetch a Cookie.txt which is a Netscape Cookie File and give path file ("./path/to/file") like this
}

module.exports = { YoutubeDLData, ExtractOptions }
