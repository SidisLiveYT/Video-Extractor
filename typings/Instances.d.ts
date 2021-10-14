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
  preview_stream_url: String
  stream: String
  stream_type: String,
  orignal_extractor: String | 'youtube' | 'spotify' | 'facebook' | 'arbitary'
  thumbnail: String
  channelId: String | Number
  channel_url: String
  likes: Number
  is_live: Boolean
  dislikes: Number
}

export type YoutubeDLData = {
  playlist: Boolean
  tracks: Array<YoutubeDLTrack>
}
