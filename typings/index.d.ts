import { YoutubeDLData } from './Instances'

export function Extractor (Query: String): Promise<YoutubeDLData> | undefined
export function StreamDownloader (
  Query: String
): Promise<YoutubeDLData> | undefined
export function HumanTimeConversion (
  DurationMilliSeconds?: Number
): String | undefined
