# academic-console-template

<p align="center">
  <img src="my-academic-site/images/readme-mascot.svg" alt="academic-console 吉祥物" width="140" />
</p>

<p align="center">
  <a href="https://hkding0125.github.io/academic-console-template/">在线预览</a> ·
  <a href="https://github.com/hkding0125/academic-console-template/generate">使用模板</a> ·
  <a href="README.md">English README</a>
</p>

一个适用于 GitHub Pages 和其他静态托管平台的终端风格学术主页模板。

![模板预览](my-academic-site/images/template-preview.svg)

## 快速开始 🚀

🔗 模板仓库地址：`https://github.com/hkding0125/academic-console-template`

如果你是第一次用 GitHub Pages，其实只需要做这 4 件事：

1. 在 GitHub 上点击 **Use this template**。
2. 修改 `index.html`、`publications.html`、`contact.html`。
3. 替换 `my-academic-site/images/` 里的占位图片。
4. 推送仓库，并启用 GitHub Pages。

做到这里，网站基础版本就可以先上线。

## 小白最先改什么 ✅

如果你想先用最简单的方式跑起来，优先改这些：
- 👤 你的名字
- 📝 首页简介
- 📚 论文条目
- 🔗 联系方式链接
- 🖼️ 头像 / logo 图片

其他内容可以等网站先上线以后再慢慢改。

## 包含内容 📦

- `index.html` — 🏠 首页
- `publications.html` — 📄 论文页
- `contact.html` — ✉️ 联系页
- `styles.css` — 🎨 公共样式
- `scripts.js` — ⚙️ 主题切换、弹窗和通用脚本
- `my-academic-site/images/` — 🖼️ 占位图片和 logo

## 如何自定义

### 1. 替换你的个人信息
建议优先修改：
- `index.html`
- `publications.html`
- `contact.html`

建议搜索这些占位词：
- `Your Name`
- `example.com`
- 示例论文标题
- 占位学校/机构/时间

### 2. 替换占位图片
建议替换这些文件：
- `my-academic-site/images/avatar-illustration.svg`
- `my-academic-site/images/avatar-photo.svg`
- `my-academic-site/images/institution-a.svg`
- `my-academic-site/images/institution-b.svg`
- `my-academic-site/images/lab.svg`
- `my-academic-site/images/template-preview.svg`（可选）

如果你不需要 logo，也可以直接删除 HTML 里的对应图片标签。

### 3. 更新站点元信息
在 `index.html` 中更新：
- 页面标题
- meta description
- `og:title`
- `og:description`
- `og:image`
- `og:url`
- canonical URL

### 4. 替换外部链接
把占位链接替换成你自己的：
- Google Scholar
- CV
- ORCID
- GitHub
- 个人网站
- 项目 / demo 链接

### 5. 部署
你可以把这个模板部署到：
- GitHub Pages
- Cloudflare Pages
- Netlify
- 任意静态网站托管平台

如果使用 GitHub Pages，推送仓库后，在仓库设置里启用 Pages 即可。

## CV 导入助手

如果你想更快开始，可以直接在浏览器里打开 `import.html` 或 `import.zh.html`。

现在仓库里包含：
- `import.html` — English import helper
- `import.zh.html` — Chinese helper interface

它可以：
- 上传 `.pdf` 或 `.docx` 格式的 CV
- 在浏览器里提取文本
- 自动生成姓名、简介、教育经历、研究/工作经历、论文、奖励、学术服务、动态和联系方式的草稿字段
- 生成适用于 `index.html`、`publications.html` 和 `contact.html` 的 HTML 片段
- 直接把生成片段和完整页面下载成 `.html` 文件
- 在复制前先看实时预览效果

推荐流程：
1. 打开 `import.html` 或 `import.zh.html`。
2. 上传你的 CV 文件。
3. 检查提取出的文本和可编辑字段。
4. 复制或下载生成的 HTML 片段。
5. 粘贴到对应模板页面中。

说明：
- `import.zh.html` 只是中文操作界面，生成的站点内容和导出页面仍然保持英文。
- 这个导入器更适合生成初稿，不是完美转换器。
- 可选中文本的 PDF 效果通常比扫描版 PDF 更好。
- 论文条目通常仍然需要你手动微调。
- 最终网站仍然是纯 HTML/CSS/JS。

## README 语言版本

本仓库包含：
- `README.md` — English
- `README.zh.md` — 中文说明

## 说明

- 这个模板是纯 HTML / CSS / JS 实现，**不依赖 Hugo**。
- 视觉风格参考了 [`hugo-theme-console`](https://github.com/mrmierzejewski/hugo-theme-console/)，但实现方式是独立的。

## 发布前建议检查

在正式发布你的网站前，建议确认已经删除或替换：
- 占位姓名
- 示例论文条目
- 示例链接
- 不再使用的占位资源
