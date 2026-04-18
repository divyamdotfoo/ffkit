# ffkity

CLI, MCP server, and Express server for FFmpeg workflows. Work in progress.

## Audio Commands

| Feature            | Description                                  | Status |
| ------------------ | -------------------------------------------- | ------ |
| Convert format     | Change audio format with quality presets     | ✅     |
| Trim segment       | Cut audio by time                            | ✅     |
| Normalize loudness | Even out volume                              | ✅     |
| Fade in/out        | Add fade effect                              | ⏳     |
| Adjust volume      | Change volume by dB or percentage            | ⏳     |
| Extract from video | Pull audio from video files                  | ⏳     |
| Merge clips        | Concatenate audio files                      | ⏳     |
| Stereo to mono     | Convert stereo to mono                       | ⏳     |
| Extract channel    | Extract left or right channel                | ⏳     |
| Remove silence     | Strip silence from audio                     | ⏳     |
| Speed change       | Adjust playback speed                        | ⏳     |
| Bitrate reduce     | Lower bitrate for compression                | ⏳     |
| Preview extract    | Export first N seconds                       | ⏳     |
| Split chapters     | Export by time segments                      | ⏳     |
| Sample rate        | Convert between 44.1kHz, 48kHz, 96kHz        | ⏳     |
| Add metadata       | Set ID3 tags                                 | ⏳     |
| EQ boost/cut       | Adjust bass, mid, treble                     | ⏳     |
| Channel mix        | Create stereo from mono or down-mix surround | ⏳     |
| Add silence        | Prepend or append silence                    | ⏳     |
| Batch convert      | Convert all files in folder                  | ⏳     |

## Image Commands

| Feature           | Description                              | Status |
| ----------------- | ---------------------------------------- | ------ |
| Resize            | Fit, fill, stretch, or pad to dimensions | ✅     |
| Convert format    | JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF    | ✅     |
| Remove background | Color-key solid backdrop                 | ✅     |
| Crop              | Crop by dimensions or auto-detect        | ⏳     |
| Rotate            | 90, 180, 270 degrees, flip               | ⏳     |
| Compress          | Reduce file size with quality slider     | ⏳     |
| Text overlay      | Add text with font, size, color          | ⏳     |
| Watermark         | Overlay image at corner/center           | ⏳     |
| Brightness        | Adjust brightness percentage             | ⏳     |
| Contrast          | Enhance or reduce contrast               | ⏳     |
| Saturation        | Increase colors or desaturate            | ⏳     |
| Grayscale         | Convert to black and white               | ⏳     |
| Blur              | Apply gaussian or box blur               | ⏳     |
| Sharpen           | Enhance edges and detail                 | ⏳     |
| Border            | Add solid color frame                    | ⏳     |
| Thumbnail         | Generate square thumbnail                | ⏳     |
| Extract EXIF      | Read photo metadata                      | ⏳     |
| Strip metadata    | Remove EXIF/IPTC data                    | ⏳     |
| Contact sheet     | Grid montage of images                   | ⏳     |
| Batch process     | Apply operation to folder                | ⏳     |

## Video Commands

| Feature           | Description                            | Status |
| ----------------- | -------------------------------------- | ------ |
| Convert format    | MP4, WebM, MKV, MOV, AVI, FLV, MPEG    | ✅     |
| Playback speed    | 0.5x to 2.0x speed change              | ✅     |
| Screenshot        | Extract frame at timestamp             | ✅     |
| Create GIF        | Video or time range to GIF             | ✅     |
| Trim              | Cut segment by start time and duration | ⏳     |
| Merge clips       | Concatenate multiple videos            | ⏳     |
| Extract audio     | Pull audio track from video            | ⏳     |
| Remove audio      | Strip audio, keep video only           | ⏳     |
| Replace audio     | Swap video audio with new file         | ⏳     |
| Add subtitles     | Burn-in subtitle file (.srt, .vtt)     | ⏳     |
| Extract subtitles | Pull subtitle track from MKV           | ⏳     |
| Resize            | Scale to 480p, 720p, 1080p, 4K         | ⏳     |
| Bitrate           | Reduce bitrate for streaming           | ⏳     |
| Frame rate        | Convert between 24fps, 30fps, 60fps    | ⏳     |
| Letterbox         | Add black bars for aspect ratio        | ⏳     |
| Crop              | Remove borders or focus region         | ⏳     |
| Fade effect       | Fade from/to black                     | ⏳     |
| Preview clip      | Export first N seconds                 | ⏳     |
| Aspect ratio      | Force 4:3, 16:9, 21:9, 1:1             | ⏳     |
| Batch convert     | Convert all videos in folder           | ⏳     |
