var YoutubeDLTrack = {
  Id: 0,
  url: null,
  title: null,
  author: null,
  author_link: null,
  description: null,
  custom_extractor: `youtube-dl`,
  duration: 0,
  stream_url: null,
  orignal_extractor: null | 'youtbe' | 'spotify' | 'facebook' | 'arbitary',
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
}

module.exports = YoutubeDLData
