// 文件转换工具函数库

// ============ 图片转换 ============

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'avif'

export interface ImageConvertOptions {
  format: ImageFormat
  quality?: number // 0-1, 仅对 jpeg/webp 有效
  maxWidth?: number
  maxHeight?: number
}

export interface ConvertResult {
  blob: Blob
  filename: string
  preview?: string
}

// 图片格式转换
export async function convertImage(
  file: File,
  options: ImageConvertOptions
): Promise<ConvertResult> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          // 缩放处理
          if (options.maxWidth && width > options.maxWidth) {
            height = (height * options.maxWidth) / width
            width = options.maxWidth
          }
          if (options.maxHeight && height > options.maxHeight) {
            width = (width * options.maxHeight) / height
            height = options.maxHeight
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, width, height)

          const mimeType = `image/${options.format}`
          const quality = options.quality ?? 0.92

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('转换失败'))
                return
              }
              const ext = options.format === 'jpeg' ? 'jpg' : options.format
              const baseName = file.name.replace(/\.[^.]+$/, '')
              resolve({
                blob,
                filename: `${baseName}.${ext}`,
                preview: URL.createObjectURL(blob),
              })
            },
            mimeType,
            quality
          )
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

// ============ 数据格式转换 ============

// JSON → CSV
export function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('JSON 必须是对象数组')
  }
  const headers = Object.keys(data[0])
  const rows = data.map((item: Record<string, unknown>) =>
    headers.map((h) => {
      const val = item[h]
      const str = val == null ? '' : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

// CSV → JSON
export function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV 至少需要表头和一行数据')
  const headers = parseCsvLine(lines[0])
  const data = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] || ''
    })
    return obj
  })
  return JSON.stringify(data, null, 2)
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

// JSON → YAML (简单实现)
export function jsonToYaml(json: string): string {
  const data = JSON.parse(json)
  return toYaml(data, 0)
}

function toYaml(obj: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return obj.includes('\n') ? `|\n${obj.split('\n').map(l => pad + '  ' + l).join('\n')}` : obj
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const inner = toYaml(item, indent + 1)
        return `${pad}- ${inner.trimStart()}`
      }
      return `${pad}- ${toYaml(item, indent + 1)}`
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, val]) => {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return `${pad}${key}:\n${toYaml(val, indent + 1)}`
      }
      if (Array.isArray(val)) {
        if (val.length === 0) return `${pad}${key}: []`
        return `${pad}${key}:\n${toYaml(val, indent + 1)}`
      }
      return `${pad}${key}: ${toYaml(val, indent + 1)}`
    }).join('\n')
  }
  return String(obj)
}

// YAML → JSON (简单实现，支持常见语法)
export function yamlToJson(yaml: string): string {
  // 简单的 YAML 解析（支持键值对、数组、嵌套对象）
  const result = parseYamlValue(yaml.split('\n'), 0, 0)
  return JSON.stringify(result.value, null, 2)
}

interface YamlParseResult {
  value: unknown
  nextLine: number
}

function parseYamlValue(lines: string[], startLine: number, baseIndent: number): YamlParseResult {
  const obj: Record<string, unknown> = {}
  let i = startLine

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    const indent = line.search(/\S/)
    if (indent < baseIndent) break

    if (trimmed.startsWith('- ')) {
      // 这是数组，让上层处理
      break
    }

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) { i++; continue }

    const key = trimmed.slice(0, colonIdx).trim()
    const val = trimmed.slice(colonIdx + 1).trim()

    if (val === '' || val === '|' || val === '>') {
      // 嵌套对象或数组
      const nextIndent = indent + 2
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
        // 数组
        const arr: unknown[] = []
        let j = i + 1
        while (j < lines.length) {
          const arrLine = lines[j].trim()
          if (!arrLine.startsWith('- ')) break
          arr.push(parseYamlScalar(arrLine.slice(2).trim()))
          j++
        }
        obj[key] = arr
        i = j
      } else {
        // 嵌套对象
        const nested = parseYamlValue(lines, i + 1, nextIndent)
        obj[key] = nested.value
        i = nested.nextLine
      }
    } else {
      obj[key] = parseYamlScalar(val)
      i++
    }
  }

  return { value: obj, nextLine: i }
}

function parseYamlScalar(val: string): unknown {
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null' || val === '~') return null
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  return val
}

// JSON 格式化
export function formatJson(json: string): string {
  return JSON.stringify(JSON.parse(json), null, 2)
}

// JSON 压缩
export function minifyJson(json: string): string {
  return JSON.stringify(JSON.parse(json))
}

// ============ 文本工具 ============

// Base64 编码
export function textToBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

// Base64 解码
export function base64ToText(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

// URL 编码
export function urlEncode(text: string): string {
  return encodeURIComponent(text)
}

// URL 解码
export function urlDecode(text: string): string {
  return decodeURIComponent(text)
}

// 下载 Blob 文件
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
