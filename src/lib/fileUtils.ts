export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatFileSize(bytesPerSec)}/s`;
}

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "heic"]);
const VIDEO_EXTS = new Set(["mp4", "avi", "mkv", "mov", "webm", "3gp"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "flac", "aac", "ogg", "m4a"]);
const DOC_EXTS = new Set(["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx", "csv"]);
const ARCHIVE_EXTS = new Set(["zip", "tar", "gz", "rar", "7z"]);
const CODE_EXTS = new Set(["js", "ts", "jsx", "tsx", "py", "rs", "go", "java", "json", "yaml", "toml", "html", "css"]);

export function getFileIcon(name: string, isDir: boolean): string {
  if (isDir) return "folder";
  const ext = getFileExtension(name);
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (AUDIO_EXTS.has(ext)) return "music";
  if (DOC_EXTS.has(ext)) return "file-text";
  if (ARCHIVE_EXTS.has(ext)) return "archive";
  if (CODE_EXTS.has(ext)) return "file-code";
  return "file";
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXTS.has(getFileExtension(name));
}

export function joinAndroidPath(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}
