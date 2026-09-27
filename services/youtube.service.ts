import { MetadataResult, VideoMetaData, YouTubeApiResponse, YoutubeVideoRaw } from './types';

const parseNullableMetric = (value?: string): number | null => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toVideoMetadata = (raw: YoutubeVideoRaw): VideoMetaData => {
  return {
    id: raw.id,
    title: raw.snippet.title,
    description: raw.snippet.description,
    channelId: raw.snippet.channelId,
    channelTitle: raw.snippet.channelTitle,
    publishedAt: raw.snippet.publishedAt,
    viewCount: parseNullableMetric(raw.statistics.viewCount) ?? 0,
    likeCount: parseNullableMetric(raw.statistics.likeCount),
    commentCount: parseNullableMetric(raw.statistics.commentCount),
    thumbnailUrl: raw.snippet.thumbnails?.default?.url ?? "",
    platform: "youtube",
  };
};

export const fetchMetaData = async(vdoId: string): Promise<MetadataResult> => {
	const apiKey = process.env.YOUTUBE_DATA_API_V3;

	if(!apiKey) {
		console.error("API key missing");
		return {
			status: 'config_error'
		};
	}

	const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${vdoId}&key=${apiKey}`;

	try {
		const resp = await fetch(url);

		if (!resp.ok) {
			return {
				status: "api_error",
				statusCode: resp.status
			}
		}

		const data: YouTubeApiResponse = await resp.json();

		if(!data.items || data.items.length == 0) {
			console.warn(`No video found for ID: ${vdoId}`);
      		return {
				status: 'not_found'
			};
		}

		return {
			status: 'success',
			data: toVideoMetadata(data.items[0])
		}
	} catch (err) {
		console.error(err);
		return {
			status: 'api_error',
			statusCode: 0
		};
	}
}