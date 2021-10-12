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
  stream_url: String
  orignal_extractor: String | 'youtbe' | 'spotify' | 'facebook' | 'arbitary'
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
