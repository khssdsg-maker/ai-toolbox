import fs from 'fs'
import path from 'path'

const readmePath = path.resolve('README.md')
const readmeContent = fs.readFileSync(readmePath, 'utf8')

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub 项目说明预览 (README.md) - AI万能工具箱</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-dark.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body {
      background-color: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .top-bar {
      position: sticky;
      top: 0;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }
    .top-bar h1 {
      font-size: 16px;
      margin: 0;
      color: #58a6ff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-links {
      display: flex;
      gap: 12px;
    }
    .btn-link {
      color: #c9d1d9;
      text-decoration: none;
      font-size: 13px;
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid #30363d;
      background: #21262d;
    }
    .btn-link:hover {
      background: #30363d;
      color: #58a6ff;
    }
    .btn-link.primary {
      background: #238636;
      border-color: #2ea043;
      color: #fff;
    }
    .container {
      max-width: 1012px;
      margin: 32px auto;
      padding: 32px 48px;
      background-color: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
    }
    .mermaid {
      background: #161b22;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <h1>📄 GitHub 仓库主页说明 (README.md) · 本地渲染效果预览</h1>
    <div class="btn-links">
      <a href="index.html" class="btn-link">🌐 打开宣传单页 (index.html)</a>
      <a href="https://github.com/khssdsg-maker/ai-toolbox" target="_blank" class="btn-link primary">🔗 GitHub 仓库</a>
    </div>
  </div>

  <div class="container">
    <article id="content" class="markdown-body"></article>
  </div>

  <script id="raw-markdown" type="text/plain">
${readmeContent.replace(/<\/script>/g, '<\\/script>')}
  </script>

  <script>
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    let raw = document.getElementById('raw-markdown').textContent;
    // 自动将 docs/assets/ 映射到 assets/，确保本地与 GitHub 双端图片均能秒级渲染
    raw = raw.replace(/src=["']docs\\/assets\\//g, 'src="assets/').replace(/\\(docs\\/assets\\//g, '(assets/');
    
    // Custom renderer for mermaid blocks
    const renderer = new marked.Renderer();
    const origCode = renderer.code.bind(renderer);
    renderer.code = function({ text, lang }) {
      if (lang === 'mermaid') {
        return '<div class="mermaid">' + text + '</div>';
      }
      return origCode({ text, lang });
    };

    document.getElementById('content').innerHTML = marked.parse(raw, { renderer });
    mermaid.run();
  </script>
</body>
</html>`

fs.writeFileSync(path.resolve('docs/readme-preview.html'), html, 'utf8')
console.log('Generated docs/readme-preview.html successfully!')
