var YoutubeDLTrack = {
  Id: 0,
  url: 'none',
  title: 'none',
  author: 'none',
  author_link: 'none',
  description: 'none',
  custom_extractor: `youtube-dl`,
  duration: 0,
  stream_url: 'none',
  orignal_extractor: 'none' | 'youtbe' | 'spotify' | 'facebook' | 'arbitary',
  thumbnail: 'none',
  channelId: 'none' | 0,
  channel_url: 'none',
  likes: 0,
  is_live: false,
  dislikes: 0,
}

var YoutubeDLData = {
  playlist: false,
  tracks: [YoutubeDLTrack],
}

module.exports = YoutubeDLData
