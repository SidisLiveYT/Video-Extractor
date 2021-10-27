import { YoutubeDLData , ExtractOptions} from './Instances'

export function Extractor (Query: String,ExtractOptions: ExtractOptions): Promise<YoutubeDLData> | undefined
export function StreamDownloader (
  Query: String
): Promise<YoutubeDLData> | undefined
export function HumanTimeConversion (
  DurationMilliSeconds?: Number
): String | undefined
