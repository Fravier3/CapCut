import type { MediaAsset, MediaType } from "@/media/types";

export const SUPPORTS_AUDIO: readonly MediaType[] = ["audio", "video"];

export function mediaSupportsAudio({
	media,
}: {
	media: MediaAsset | null | undefined;
}): boolean {
	if (!media) return false;
	return SUPPORTS_AUDIO.includes(media.type);
}

export const getMediaTypeFromFile = ({
	file,
}: {
	file: File;
}): MediaType | null => {
	const { type } = file;

	if (type.startsWith("image/")) {
		return "image";
	}
	if (type.startsWith("video/")) {
		return "video";
	}
	if (type.startsWith("audio/")) {
		return "audio";
	}

	const extension = file.name.split('.').pop()?.toLowerCase();
	if (extension && ['mp3','m4a','aac','wav','wave','ogg','oga','flac','aiff','aif','opus','caf','weba'].includes(extension)) return 'audio';
	if (extension && ['mp4','mov','m4v','webm','mkv'].includes(extension)) return 'video';
	return null;
};
