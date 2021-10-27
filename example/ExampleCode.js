import { Extractor, StreamDownloader , HumanTimeConversion } from 'video-extractor' //for ES6


var Data = await Extractor(Url || 'Despacito', {
  Proxy: `http://127.0.0.1:2267`, //Proxy -> IP:Port
  YTCookies: undefined,  //Youtube Cookies Value ( a very Big String here )
  YoutubeDLCookiesFilePath: undefined //Fetch a Cookie.txt which is a Netscape Cookie File and give path file ("./path/to/file") like this
})
var StreamData = await StreamDownloader(Url || 'Despacito')
var HumanTime = HumanTimeConversion(MilliSeconds)
console.log(TracksData)
console.log(TracksData.tracks)
console.log(TracksData.tracks[0].url)
