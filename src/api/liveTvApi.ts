import { Channel, EpgProgram, ResolvedStream } from '../types';

const baseUrl = 'https://api.viulk.xyz';
const channelsEndpoint = `${baseUrl}/channels`;
const fallbackChannelsEndpoint = `${baseUrl}/api/channels`;

export class LiveTvApi {
  static async fetchChannels(): Promise<Channel[]> {
    try {
      const channels = await this.fetchJsonChannels(channelsEndpoint);
      if (channels.length > 0) return channels;
    } catch (e) {
      // fallback
    }
    try {
      const fallback = await this.fetchJsonChannels(fallbackChannelsEndpoint);
      if (fallback.length > 0) return fallback;
    } catch (e) {
      // ignore
    }
    return [];
  }

  private static async fetchJsonChannels(url: string): Promise<Channel[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ST TV/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return [];
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      const id = item.id || `channel_${index}`;
      const name = item.channel || item.title || 'Live TV';
      
      return {
        id,
        name,
        logo: item.channelImage || null,
        streamUrl: '',
        manifestUrl: item.manifest || null,
        category: item.category || 'General',
        currentProgram: (item.title && item.title !== name) ? item.title : null,
        thumbnail: item.thumbnail || null,
        views: item.views || null,
        quality: 'HD',
        isLive: item.isLive !== false,
        realepgId: item.realepgId || null,
        isCatchup: item.iscatchup || false
      };
    });
  }

  static async resolveStream(channel: Channel): Promise<ResolvedStream> {
    if (!channel.manifestUrl) {
      return {
        streamUrl: channel.streamUrl,
        licenseUrl: null,
        isWidevine: false
      };
    }

    try {
      const response = await fetch(channel.manifestUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ST TV/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data.url) {
          return {
            streamUrl: json.data.url,
            licenseUrl: json.data.wv_license_proxy_url || null,
            isWidevine: json.data.drm?.widevine || false
          };
        }
      }
    } catch (e) {
      console.error('Failed to resolve stream from manifest', e);
    }
    
    return {
      streamUrl: channel.streamUrl,
      licenseUrl: null,
      isWidevine: false
    };
  }

  static async fetchEpgPrograms(channel: Channel): Promise<EpgProgram[]> {
    if (!channel.realepgId) return [];
    
    try {
      const response = await fetch(`${baseUrl}/api/epg/${channel.realepgId}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((item) => ({
        id: item.id,
        uid: item.uid,
        title: item.title || 'Program',
        startIso: item.start,
        endIso: item.end,
        timeString: item.time || '',
        dateString: '',
        startFormatted: '',
        endFormatted: '',
        channelId: item.channel_id || channel.realepgId,
        realepgId: item.realepgId || channel.realepgId,
        channelUid: channel.id,
        channelName: channel.name,
        channelLogo: channel.logo,
        thumbnail: item.image_id ? `https://api3.viu.lk/api/client/v1/global/images/${item.image_id}?accessKey=WkVjNWNscFhORDBLCg==` : channel.thumbnail,
        views: item.views || null,
        manifestUrl: item.manifest || null,
        isLive: false,
        isUpcoming: false
      }));
    } catch(e) {
      console.error('Failed to load EPG', e);
      return [];
    }
  }
}
