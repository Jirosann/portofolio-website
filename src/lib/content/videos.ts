import fs from 'fs';
import path from 'path';
import { DRIVE_PLACEHOLDER, VideosFileSchema, type Video } from '@/lib/validation/schemas';

export interface VideoSectionData {
  folderUrl: string;
  videos: Video[];
}

/** Item yang boleh tampil: published dan link Drive asli (bukan placeholder). */
function isLive(video: Video): boolean {
  return video.published && !video.driveUrl.includes(DRIVE_PLACEHOLDER);
}

/**
 * Video Creation (sesi 13). null bila berkas tidak ada atau belum ada item yang lolos; section, tautan nav,
 * dan nomornya lalu tidak dirender sama sekali.
 */
export function getVideoSection(): VideoSectionData | null {
  const videosPath = path.join(process.cwd(), 'content/creative/videos.json');
  if (!fs.existsSync(videosPath)) return null;

  const result = VideosFileSchema.safeParse(JSON.parse(fs.readFileSync(videosPath, 'utf-8')));
  if (!result.success) {
    throw new Error(`Videos validation failed: ${result.error.message}`);
  }

  const videos = result.data.videos.filter(isLive);
  return videos.length > 0 ? { folderUrl: result.data.folderUrl, videos } : null;
}

/** ID file dari https://drive.google.com/file/d/<ID>/view, untuk URL embed /preview. */
export function driveFileId(driveUrl: string): string {
  return driveUrl.split('/file/d/')[1].split(/[/?#]/)[0];
}
