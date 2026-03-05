import audio from '@images/icons/audio.png'
import doc from '@images/icons/doc.png'
import fileFormat from '@images/icons/file.png'
import image from '@images/icons/image.png'
import pdf from '@images/icons/pdf.png'
import ppt from '@images/icons/ppt.png'
import txt from '@images/icons/txt.png'
import video from '@images/icons/video.png'
import xls from '@images/icons/xls.png'
import zip from '@images/icons/zip.png'


export function fileIcon(file: File | null, fileName: string | null, type: string | null): string {
  // prefer the file MIME type if present (File objects have .type)
  let mime = ""
  let ext = ""

  if (file != null) {
    mime = file.type
    ext = getExtension(file?.name).toLowerCase().replace('.', '')
  } else if (fileName != null && type != null) {
    mime = type
    ext = getExtension(fileName).toLowerCase().replace('.', '')
  }

  // quick mime -> icon rules
  if (mime.startsWith('image/')) return image
  if (mime === 'application/pdf') return pdf
  if (mime.startsWith('audio/')) return audio
  if (mime.startsWith('video/')) return video
  if (mime === 'application/zip' || ext === 'zip') return zip

  // extension-based map (covers common ones)
  const map: Record<string, string> = {
    pdf: pdf,
    zip: zip,
    doc: doc,
    docx: doc,
    xls: xls,
    xlsx: xls,
    ppt: ppt,
    pptx: ppt,
    png: image,
    jpg: image,
    jpeg: image,
    svg: image,
    txt: txt,
    mp3: audio,
    wav: audio,
    mp4: audio,
    mov: audio,
  }

  return map[ext] ?? fileFormat // fallback
}

export function getExtension(filename = ''): string {
  const parts = filename.split('.')
  return parts.length > 1 ? `.${parts.pop()}` : ''
}
