# ffkity

CLI, MCP server, and Express server for FFmpeg workflows. Work in progress.

## Audio

| Command | Description | ID |
| --- | --- | --- |
| Convert format | Convert audio format with practical quality and encoding choices. | `audio_convert` |
| Trim segment | Trim audio to a selected start time and duration. | `audio_trim` |
| Normalize loudness | Normalize speech/music loudness for consistent playback volume. | `audio_normalize` |

## Image

| Command | Description | ID |
| --- | --- | --- |
| Resize image | Resize with fit/fill/stretch behavior and optional background fill. | `image_resize` |
| Remove background (solid color) | Remove near-solid background color using FFmpeg color keying. | `image_remove_background` |
| Convert format | Convert image format to another extension. | `image_convert` |

## Video

| Command | Description | ID |
| --- | --- | --- |
| Convert format | Convert video format with broadly compatible defaults. | `video_convert` |
| Change playback speed | Speed up or slow down video and audio by a multiplier. | `video_speed` |
| Extract screenshot | Extract a still image from the video at a chosen timestamp. | `video_screenshot` |
| Create GIF | Create a GIF from the full video or from a selected segment. | `video_gif` |
