// 文档转换工具：PDF/Word/Markdown（重依赖全部动态加载，不影响其他页面速度）

export interface ConvertFileResult {
  blob: Blob
  filename: string
}

// ============ Markdown 转换 ============

// Markdown → HTML
export async function markdownToHtml(md: string): Promise<string> {
  const { marked } = await import('marked')
  return await marked.parse(md)
}

// HTML → Markdown
export async function htmlToMarkdown(html: string): Promise<string> {
  const TurndownService = (await import('turndown')).default
  const service = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  return service.turndown(html)
}

// ============ PDF ↔ Word ============

// PDF → Word（提取文字生成 Word 兼容的 .doc 文档）
export async function pdfFileToWord(file: File): Promise<ConvertFileResult> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs'

  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise

  let bodyHtml = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    // 按 Y 坐标把文字还原成行
    const lines: Record<number, string[]> = {}
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      if (!item.str || !item.str.trim()) continue
      const y = Math.round(item.transform[5])
      if (!lines[y]) lines[y] = []
      lines[y].push(item.str)
    }
    const ys = Object.keys(lines).map(Number).sort((a, b) => b - a)
    for (const y of ys) {
      const text = lines[y].join(' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      if (text.trim()) bodyHtml += `<p>${text}</p>`
    }
    if (i < doc.numPages) bodyHtml += '<p style="page-break-after:always"></p>'
  }

  if (!bodyHtml) throw new Error('这个 PDF 没有可提取的文字（可能是纯图片扫描件）')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:SimSun,serif;font-size:12pt;line-height:1.8}p{margin:6pt 0}</style></head><body>${bodyHtml}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  return { blob, filename: file.name.replace(/\.pdf$/i, '') + '.doc' }
}

// Word (.docx) → PDF（解析成 HTML 后渲染成 PDF 页面）
export async function wordFileToPdf(file: File): Promise<ConvertFileResult> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  if (!result.value.trim()) throw new Error('这个文档没有可转换的内容')

  // 隐藏容器渲染 HTML（A4 宽度）
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;padding:48px;font-family:SimSun,Microsoft YaHei,serif;font-size:14px;line-height:1.9;color:#000;'
  container.innerHTML = result.value
  document.body.appendChild(container)

  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return { blob: pdf.output('blob'), filename: file.name.replace(/\.(docx|doc)$/i, '') + '.pdf' }
  } finally {
    document.body.removeChild(container)
  }
}
