export const UserSettingsKeys = {
    GOOGLE_AUTO_UPLOAD: "google_auto_upload",
    DROPBOX_AUTO_UPLOAD: "dropbox_auto_upload",
    UPLOAD_MAX_QUALITY: "upload_max_quality",
    COMPRESS_BEFORE_UPLOAD: "compress_before_upload",
} as const;

export const GlobalSettingsKeys = {
    FILE_UPLOAD_SIZE_LIMIT: "file_upload_size_limit",
} as const;


export const DefaultUserSettings = {
    [UserSettingsKeys.GOOGLE_AUTO_UPLOAD]: "false",
    [UserSettingsKeys.DROPBOX_AUTO_UPLOAD]: "false", 
    [UserSettingsKeys.UPLOAD_MAX_QUALITY]: "true",
    [UserSettingsKeys.COMPRESS_BEFORE_UPLOAD]: "true",
} as const;

export const CHUNK_SIZE = 45 * 1024 * 1024 // 45MB