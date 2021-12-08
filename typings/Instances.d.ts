export type VideoStreamData = {
  video: String
  audio: String
}
export type YoutubeDLTrack = {
  Id: 0
  url: String
  video_Id: String
  title: String
  author: String
  author_link: String
  description: String
  custom_extractor: `youtube-dl`
  duration: Number
  human_duration: String
  preview_stream_url: String
  video_stream: VideoStreamData | undefined
  stream: String | 'Socket'
  stream_url: String
  stream_type: String
  stream_duration: Number
  stream_video_Id: String
  stream_human_duration: String
  orignal_extractor: String | 'youtube' | 'spotify' | 'facebook' | 'arbitrary'
  thumbnail: String
  channelId: String | Number
  channel_url: String
  lyrics: String
  likes: Number
  is_live: Boolean
  dislikes: Number
}

export type YoutubeDLData = {
  playlist: Boolean
  tracks: Array<YoutubeDLTrack>
  error: Error | Error[] | String | undefined
}

export type ExtractOptions = {
  Proxy: String | undefined
  BypassRatelimit: Boolean | undefined
  YTCookies: String | undefined
  YoutubeDLCookiesFilePath: String | undefined
  SkipVideoDataOverRide: Boolean | undefined,
}
