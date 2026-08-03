'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Image, FileJson, FileText, Hash, Link2, Download, Upload, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import {
  convertImage, jsonToCsv, csvToJson, jsonToYaml, yamlToJson,
  formatJson, minifyJson, textToBase64, base64ToText,
  urlEncode, urlDecode, downloadBlob,
  type ImageFormat, type ConvertResult,
} from '@/lib/converters'

// 工具定义
const TOOLS = [
  { id: 'image', name: '图片格式转换', desc: 'PNG / JPG / WebP / BMP 互转', icon: Image },
  { id: 'json-csv', name: 'JSON ↔ CSV', desc: 'JSON 对象数组和 CSV 表格互转', icon: FileJson },
  { id: 'json-yaml', name: 'JSON ↔ YAML', desc: 'JSON 和 YAML 配置文件互转', icon: FileText },
  { id: 'json-format', name: 'JSON 格式化', desc: '美化或压缩 JSON', icon: FileJson },
  { id: 'base64', name: 'Base64 编解码', desc: '文本和 Base64 互转', icon: Hash },
  { id: 'url', name: 'URL 编解码', desc: 'URL 编码和解码', icon: Link2 },
] as const

type ToolId = typeof TOOLS[number]['id']

export function ConvertCenter() {
  const [activeTool, setActiveTool] = useState<ToolId>('image')

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              首页
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">文件转换中心</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-8">
        {/* 工具选择 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl text-center
                  transition-all duration-200 border
                  ${isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border/40 hover:border-border/70 hover:bg-muted/50 text-foreground'}
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{tool.name}</span>
              </button>
            )
          })}
        </div>

        {/* 转换工具 */}
        <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8">
          {activeTool === 'image' && <ImageConverter />}
          {activeTool === 'json-csv' && <JsonCsvConverter />}
          {activeTool === 'json-yaml' && <JsonYamlConverter />}
          {activeTool === 'json-format' && <JsonFormatter />}
          {activeTool === 'base64' && <Base64Converter />}
          {activeTool === 'url' && <UrlConverter />}
        </div>
      </div>
    </div>
  )
}

// ============ 图片格式转换 ============
function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(92)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await convertImage(file, { format, quality: quality / 100 })
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '转换失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (result) downloadBlob(result.blob, result.filename)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">图片格式转换</h2>
      <p className="text-sm text-muted-foreground">支持 PNG、JPG、WebP、BMP、AVIF 格式互转，可调整质量和尺寸。</p>

      {/* 文件选择 */}
      <div>
        <label className="block text-sm font-medium mb-2">选择图片</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null) }}
            className="block text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 file:cursor-pointer"
          />
        </div>
        {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">目标格式</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageFormat)}
            className="w-full h-10 rounded-lg border border-border/60 bg-background px-3 text-sm"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG / JPG</option>
            <option value="webp">WebP</option>
            <option value="bmp">BMP</option>
            <option value="avif">AVIF</option>
          </select>
        </div>
        {(format === 'jpeg' || format === 'webp') && (
          <div>
            <label className="block text-sm font-medium mb-2">质量: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        )}
      </div>

      <Button onClick={handleConvert} disabled={!file || loading} className="gap-2">
        {loading ? '转换中...' : <><ArrowRightLeft className="h-4 w-4" />开始转换</>}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/30">
          {result.preview && <img src={result.preview} alt="预览" className="w-20 h-20 object-cover rounded-lg" />}
          <div className="flex-1">
            <p className="text-sm font-medium">{result.filename}</p>
            <p className="text-xs text-muted-foreground">{(result.blob.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />下载
          </Button>
        </div>
      )}
    </div>
  )
}

// ============ JSON ↔ CSV ============
function JsonCsvConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'json-csv' | 'csv-json'>('json-csv')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      const result = direction === 'json-csv' ? jsonToCsv(input) : csvToJson(input)
      setOutput(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleDownload = () => {
    const ext = direction === 'json-csv' ? 'csv' : 'json'
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `converted.${ext}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">JSON ↔ CSV</h2>
      <div className="flex gap-2">
        <Button variant={direction === 'json-csv' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('json-csv'); setOutput('') }}>JSON → CSV</Button>
        <Button variant={direction === 'csv-json' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('csv-json'); setOutput('') }}>CSV → JSON</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">输入 {direction === 'json-csv' ? 'JSON' : 'CSV'}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'json-csv' ? '[{"name": "Alice", "age": 30}]' : 'name,age\nAlice,30'}
            className="w-full h-48 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">输出</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={!input.trim()} className="gap-2"><ArrowRightLeft className="h-4 w-4" />转换</Button>
        {output && <Button onClick={handleDownload} variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />下载</Button>}
      </div>
    </div>
  )
}

// ============ JSON ↔ YAML ============
function JsonYamlConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'json-yaml' | 'yaml-json'>('json-yaml')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      const result = direction === 'json-yaml' ? jsonToYaml(input) : yamlToJson(input)
      setOutput(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const handleDownload = () => {
    const ext = direction === 'json-yaml' ? 'yaml' : 'json'
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `converted.${ext}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">JSON ↔ YAML</h2>
      <div className="flex gap-2">
        <Button variant={direction === 'json-yaml' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('json-yaml'); setOutput('') }}>JSON → YAML</Button>
        <Button variant={direction === 'yaml-json' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('yaml-json'); setOutput('') }}>YAML → JSON</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">输入 {direction === 'json-yaml' ? 'JSON' : 'YAML'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={direction === 'json-yaml' ? '{"name": "Alice", "age": 30}' : 'name: Alice\nage: 30'} className="w-full h-48 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">输出</label>
          <textarea value={output} readOnly className="w-full h-48 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleConvert} disabled={!input.trim()} className="gap-2"><ArrowRightLeft className="h-4 w-4" />转换</Button>
        {output && <Button onClick={handleDownload} variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />下载</Button>}
      </div>
    </div>
  )
}

// ============ JSON 格式化 ============
function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleFormat = () => {
    setError('')
    try { setOutput(formatJson(input)) } catch (e: unknown) { setError(e instanceof Error ? e.message : '格式化失败') }
  }

  const handleMinify = () => {
    setError('')
    try { setOutput(minifyJson(input)) } catch (e: unknown) { setError(e instanceof Error ? e.message : '压缩失败') }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">JSON 格式化</h2>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"name":"Alice","items":[1,2,3]}' className="w-full h-40 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono resize-none" />
      <div className="flex gap-3">
        <Button onClick={handleFormat} disabled={!input.trim()} className="gap-2">美化格式</Button>
        <Button onClick={handleMinify} variant="outline" disabled={!input.trim()}>压缩为一行</Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {output && (
        <div>
          <label className="block text-sm font-medium mb-2">结果</label>
          <textarea value={output} readOnly className="w-full h-48 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none" />
          <Button onClick={() => { const blob = new Blob([output], { type: 'application/json' }); downloadBlob(blob, 'formatted.json') }} variant="outline" size="sm" className="mt-2 gap-1.5"><Download className="h-4 w-4" />下载</Button>
        </div>
      )}
    </div>
  )
}

// ============ Base64 ============
function Base64Converter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      setOutput(direction === 'encode' ? textToBase64(input) : base64ToText(input))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Base64 编解码</h2>
      <div className="flex gap-2">
        <Button variant={direction === 'encode' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('encode'); setOutput('') }}>文本 → Base64</Button>
        <Button variant={direction === 'decode' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('decode'); setOutput('') }}>Base64 → 文本</Button>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={direction === 'encode' ? '输入要编码的文本...' : 'SGVsbG8gV29ybGQ='} className="w-full h-32 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono resize-none" />
      <Button onClick={handleConvert} disabled={!input.trim()} className="gap-2"><ArrowRightLeft className="h-4 w-4" />转换</Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {output && (
        <div>
          <label className="block text-sm font-medium mb-2">结果</label>
          <textarea value={output} readOnly className="w-full h-32 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none" />
          <Button onClick={() => { navigator.clipboard.writeText(output) }} variant="outline" size="sm" className="mt-2">复制结果</Button>
        </div>
      )}
    </div>
  )
}

// ============ URL 编解码 ============
function UrlConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      setOutput(direction === 'encode' ? urlEncode(input) : urlDecode(input))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">URL 编解码</h2>
      <div className="flex gap-2">
        <Button variant={direction === 'encode' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('encode'); setOutput('') }}>编码</Button>
        <Button variant={direction === 'decode' ? 'default' : 'outline'} size="sm" onClick={() => { setDirection('decode'); setOutput('') }}>解码</Button>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={direction === 'encode' ? 'https://example.com/搜索?q=你好' : 'https%3A%2F%2Fexample.com'} className="w-full h-32 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono resize-none" />
      <Button onClick={handleConvert} disabled={!input.trim()} className="gap-2"><ArrowRightLeft className="h-4 w-4" />转换</Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {output && (
        <div>
          <label className="block text-sm font-medium mb-2">结果</label>
          <textarea value={output} readOnly className="w-full h-32 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm font-mono resize-none" />
          <Button onClick={() => { navigator.clipboard.writeText(output) }} variant="outline" size="sm" className="mt-2">复制结果</Button>
        </div>
      )}
    </div>
  )
}
