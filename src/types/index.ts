export interface Channel {
  id: string;
  name: string;
  logo: string | null;
  streamUrl: string;
  manifestUrl: string | null;
  category: string;
  currentProgram: string | null;
  thumbnail: string | null;
  views: string | null;
  quality: string;
  isLive: boolean;
  realepgId: number | null;
  isCatchup: boolean;
}

export interface EpgProgram {
  id: number;
  uid: string;
  title: string;
  startIso: string;
  endIso: string;
  timeString: string;
  dateString: string;
  startFormatted: string;
  endFormatted: string;
  channelId: number;
  realepgId: number;
  channelUid: string;
  channelName: string;
  channelLogo: string | null;
  thumbnail: string | null;
  views: string | null;
  manifestUrl: string | null;
  isLive: boolean;
  isUpcoming: boolean;
}

export interface ResolvedStream {
  streamUrl: string;
  licenseUrl: string | null;
  isWidevine: boolean;
}
