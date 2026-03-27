const demoCvText = `Haokai Ding
Department of Robotics, Example University
Email: haokai.ding@example.edu
Website: https://example.edu/~haokai
Google Scholar: https://scholar.google.com/citations?user=example
GitHub: https://github.com/example
ORCID: https://orcid.org/0000-0000-0000-0000

Research Interests
Robotics, embodied AI, human-robot interaction, robot learning.

Education
PhD in Robotics, Example University, 2022-2026
BEng in Automation, Sample Institute of Technology, 2018-2022

Experience
Research Intern, Embodied Systems Lab, 2025-present
Visiting Student, Interactive Robotics Group, 2024

Selected Publications
Haokai Ding, Collaborator A, Collaborator B. Sample Conference Paper Title. Conference on Helpful Robots 2026. DOI: 10.0000/example-doi-1

Collaborator C, Haokai Ding, Collaborator D. Sample Journal Article Title. Journal of Useful Systems 2025. https://doi.org/10.0000/example-doi-2`;

const importState = {
  rawText: '',
};

const fields = {
  name: document.getElementById('fieldName'),
  affiliation: document.getElementById('fieldAffiliation'),
  bio: document.getElementById('fieldBio'),
  email: document.getElementById('fieldEmail'),
  website: document.getElementById('fieldWebsite'),
  scholar: document.getElementById('fieldScholar'),
  github: document.getElementById('fieldGithub'),
  orcid: document.getElementById('fieldOrcid'),
  cvLink: document.getElementById('fieldCvLink'),
  education: document.getElementById('fieldEducation'),
  experience: document.getElementById('fieldExperience'),
  publications: document.getElementById('fieldPublications'),
  awards: document.getElementById('fieldAwards'),
  service: document.getElementById('fieldService'),
  news: document.getElementById('fieldNews'),
};

const snippetTargets = {
  homepage: document.getElementById('homepageSnippet'),
  details: document.getElementById('detailsSnippet'),
  publications: document.getElementById('publicationsSnippet'),
  contact: document.getElementById('contactSnippet'),
  extras: document.getElementById('extrasSnippet'),
};

const previewTargets = {
  homepage: document.getElementById('homepagePreview'),
  publications: document.getElementById('publicationsPreview'),
  contact: document.getElementById('contactPreview'),
};

const cvFileInput = document.getElementById('cvFile');
const rawTextInput = document.getElementById('rawText');
const importStatus = document.getElementById('importStatus');
const analyzeButton = document.getElementById('analyzeText');
const generateButton = document.getElementById('generateSnippets');
const clearButton = document.getElementById('clearAll');
const parseDemoButton = document.getElementById('parseDemo');

const stepTargets = {
  upload: document.getElementById('step-upload'),
  review: document.getElementById('step-review'),
  export: document.getElementById('step-export'),
};

const pageLang = document.documentElement.lang || 'en';
const isChinesePage = pageLang.toLowerCase().startsWith('zh');

const outputInEnglish = true;

const i18n = {
  waitingForUpload: isChinesePage ? '等待上传文件。' : 'Waiting for file upload.',
  generatedSnippets: isChinesePage ? '预览已刷新。满意后可以直接下载生成页面。' : 'Refreshed the previews. Download the generated pages when you are ready.',
  pasteOrExtractFirst: isChinesePage ? '请先粘贴文本或上传并提取 CV 内容。' : 'Paste or extract some CV text first.',
  readingFile: fileName => isChinesePage ? `正在读取 ${fileName}...` : `Reading ${fileName}...`,
  extractedFile: fileName => isChinesePage ? `已从 ${fileName} 提取文本。请检查少量关键字段，然后直接下载页面。` : `Extracted text from ${fileName}. Review a few key fields, then download the generated pages.`,
  parseFailed: isChinesePage ? '无法解析上传的文件。' : 'Could not parse the uploaded file.',
  cleared: isChinesePage ? '已清空导入内容。' : 'Cleared imported content.',
  nothingToDownload: isChinesePage ? '当前没有可下载的内容。' : 'There is nothing to download yet.',
  downloaded: fileName => isChinesePage ? `已下载 ${fileName}。` : `Downloaded ${fileName}.`,
  nothingToCopy: isChinesePage ? '当前没有可复制的内容。' : 'There is nothing to copy yet.',
  copied: targetId => isChinesePage ? `已复制 ${targetId}。` : `Copied ${targetId} to clipboard.`,
  clipboardFallback: isChinesePage ? '剪贴板访问失败，已帮你选中内容，请手动复制。' : 'Clipboard access failed. The snippet has been selected for manual copy.',
  demoLoaded: isChinesePage ? '已加载示例 CV 内容。你可以直接检查并下载页面。' : 'Loaded demo CV content. You can review the fields and download the pages directly.',
  publicationsNav: 'Publications/ · Contact/ · Scholar/',
  publicationsPageSummary: 'Preview of the generated publications page content.',
  contactPreviewLead: 'Preview of the generated contact section.',
  backToHome: 'back to home',
  generatedPublicationsPage: 'Generated publications page from the import helper.',
  generatedContactPage: 'Generated contact page from the import helper.',
  unsupportedFileType: isChinesePage ? '不支持这个文件类型，请上传 PDF 或 DOCX 文件。' : 'Unsupported file type. Please upload a PDF or DOCX file.',
  pdfLoadFailed: isChinesePage ? 'pdf.js 加载失败。' : 'pdf.js failed to load.',
  docxLoadFailed: isChinesePage ? 'mammoth.js 加载失败。' : 'mammoth.js failed to load.',
};

const setStatus = (message, type = 'info') => {
  if (!importStatus) return;
  importStatus.textContent = message;
  importStatus.dataset.state = type;
};

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const normalizeText = text => String(text ?? '')
  .replace(/\r\n?/g, '\n')
  .replace(/[\t\f\v]+/g, ' ')
  .replace(/\u00a0/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const splitLines = text => normalizeText(text).split('\n').map(line => line.trim()).filter(Boolean);

const splitParagraphs = text => normalizeText(text)
  .split(/\n\s*\n/g)
  .map(block => block.trim())
  .filter(Boolean);

const titleCaseHeading = value => value.toLowerCase().replace(/^[a-z]/, char => char.toUpperCase());

const isLikelyHeading = line => {
  if (!line) return false;
  if (line.length > 40) return false;
  if (/[:：]$/.test(line)) return true;
  return /^[A-Z][A-Za-z/&\- ]{2,}$/.test(line) || /^[A-Za-z][A-Za-z/&\- ]{2,}$/.test(line);
};

const knownSectionAliases = new Map([
  ['education', 'education'],
  ['academic background', 'education'],
  ['employment', 'experience'],
  ['experience', 'experience'],
  ['work experience', 'experience'],
  ['professional experience', 'experience'],
  ['selected publications', 'publications'],
  ['publications', 'publications'],
  ['papers', 'publications'],
  ['contact', 'contact'],
  ['contact information', 'contact'],
  ['research interests', 'research'],
  ['research', 'research'],
  ['awards', 'awards'],
  ['honors', 'awards'],
  ['news', 'news'],
  ['updates', 'news'],
  ['services', 'service'],
  ['service', 'service'],
  ['教育经历', 'education'],
  ['教育', 'education'],
  ['工作经历', 'experience'],
  ['研究经历', 'experience'],
  ['经历', 'experience'],
  ['论文发表', 'publications'],
  ['发表论文', 'publications'],
  ['发表', 'publications'],
  ['联系方式', 'contact'],
  ['联系', 'contact'],
  ['研究方向', 'research'],
  ['研究兴趣', 'research'],
  ['奖励', 'awards'],
  ['获奖', 'awards'],
  ['荣誉', 'awards'],
  ['动态', 'news'],
  ['新闻', 'news'],
  ['更新', 'news'],
  ['服务', 'service'],
]);

const identifySections = text => {
  const lines = splitLines(text);
  const sections = {};
  let current = 'top';
  sections[current] = [];

  for (const line of lines) {
    const key = line.replace(/[:：]+$/, '').trim().toLowerCase();
    if (isLikelyHeading(line) && knownSectionAliases.has(key)) {
      current = knownSectionAliases.get(key);
      if (!sections[current]) sections[current] = [];
      continue;
    }
    sections[current].push(line);
  }

  return sections;
};

const findFirstMatch = (text, regex) => {
  const match = text.match(regex);
  return match?.[1] || match?.[0] || '';
};

const findName = text => {
  const topLines = splitLines(text).slice(0, 8);
  const firstGoodLine = topLines.find(line => {
    if (line.length < 3 || line.length > 60) return false;
    if (/@|https?:\/\//i.test(line)) return false;
    if (/curriculum vitae|resume|cv/i.test(line)) return false;
    return /^[A-Za-z][A-Za-z .'-]+$/.test(line) || /^[\u4e00-\u9fffA-Za-z·• ]+$/.test(line);
  });
  return firstGoodLine || '';
};

const findAffiliation = (sections, text, name) => {
  const topLines = splitLines(text).slice(0, 12);
  return topLines.find(line => line !== name && !/@|https?:\/\//i.test(line) && /(university|institute|school|department|lab|laboratory|college|center|centre|研究院|实验室|学院|大学)/i.test(line)) || '';
};

const buildBio = (sections, affiliation) => {
  const researchLines = sections.research || [];
  const topLines = sections.top || [];
  const candidate = researchLines.join(' ')
    || topLines.find(line => line.length > 40 && !/@|https?:\/\//i.test(line))
    || '';

  if (!candidate && !affiliation) return '';
  if (candidate) return candidate;
  return `I am a researcher at ${affiliation}.`;
};

const extractLinks = text => {
  const email = findFirstMatch(text, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const urls = Array.from(text.matchAll(/https?:\/\/[^\s<>)\]]+/gi), match => match[0].replace(/[),.;]+$/, ''));
  const website = urls.find(url => !/scholar\.google|github\.com|orcid\.org/i.test(url)) || '';
  const scholar = urls.find(url => /scholar\.google/i.test(url)) || '';
  const github = urls.find(url => /github\.com/i.test(url)) || '';
  const orcid = urls.find(url => /orcid\.org/i.test(url)) || '';
  const cvLink = urls.find(url => /\.pdf($|\?)/i.test(url)) || '';

  return { email, website, scholar, github, orcid, cvLink };
};

const cleanListSection = lines => lines
  .map(line => line.replace(/^[-•*]\s*/, '').trim())
  .filter(Boolean);

const extractPublicationEntriesFromText = text => {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const lines = splitLines(normalized);
  const bulletEntries = lines
    .map(line => line.replace(/^\s*(?:[-•*]|\[(?:\d+|\w+)\])\s*/, '').trim())
    .filter(line => /(doi|journal|conference|proceedings|arxiv|preprint|symposium|workshop|transactions|letters|review)/i.test(line) || /10\.\d{4,9}\//i.test(line) || /(?:19|20)\d{2}/.test(line));
  if (bulletEntries.length > 1) return bulletEntries;

  const paragraphEntries = splitParagraphs(normalized).filter(entry => /(doi|journal|conference|proceedings|arxiv|preprint|symposium|workshop|transactions|letters|review)/i.test(entry) || /10\.\d{4,9}\//i.test(entry));
  if (paragraphEntries.length) return paragraphEntries;

  return bulletEntries;
};

const cleanStructuredSection = lines => lines
  .map(line => line.replace(/^[-•*]\s*/, '').trim())
  .filter(Boolean);

const extractNews = sections => cleanStructuredSection(sections.news || sections.top?.filter(line => /(?:19|20)\d{2}[./-]\d{1,2}|accepted|award|talk|joined|started|released/i.test(line)) || []);
const extractAwards = sections => cleanStructuredSection(sections.awards || []);
const extractService = sections => cleanStructuredSection(sections.service || []);

const extractPublications = sections => {
  const sectionText = normalizeText((sections.publications || []).join('\n'));
  if (sectionText) {
    const entries = extractPublicationEntriesFromText(sectionText);
    if (entries.length) return entries;
  }

  return extractPublicationEntriesFromText(
    Object.entries(sections)
      .filter(([key]) => key !== 'publications')
      .map(([, lines]) => Array.isArray(lines) ? lines.join('\n') : '')
      .join('\n\n'),
  );
};

const parseCvText = text => {
  const normalized = normalizeText(text);
  const sections = identifySections(normalized);
  const name = findName(normalized);
  const affiliation = findAffiliation(sections, normalized, name);
  const bio = buildBio(sections, affiliation);
  const links = extractLinks(normalized);
  const education = cleanListSection(sections.education || []);
  const experience = cleanListSection(sections.experience || []);
  const publications = extractPublications(sections);
  const awards = extractAwards(sections);
  const service = extractService(sections);
  const news = extractNews(sections);

  return {
    name,
    affiliation,
    bio,
    ...links,
    education,
    experience,
    publications,
    awards,
    service,
    news,
  };
};

const fillFields = data => {
  fields.name.value = data.name || '';
  fields.affiliation.value = data.affiliation || '';
  fields.bio.value = data.bio || '';
  fields.email.value = data.email || '';
  fields.website.value = data.website || '';
  fields.scholar.value = data.scholar || '';
  fields.github.value = data.github || '';
  fields.orcid.value = data.orcid || '';
  fields.cvLink.value = data.cvLink || '';
  fields.education.value = (data.education || []).join('\n');
  fields.experience.value = (data.experience || []).join('\n');
  fields.publications.value = (data.publications || []).join('\n\n');
  fields.awards.value = (data.awards || []).join('\n');
  fields.service.value = (data.service || []).join('\n');
  fields.news.value = (data.news || []).join('\n');
};

const getFieldData = () => ({
  name: fields.name.value.trim(),
  affiliation: fields.affiliation.value.trim(),
  bio: fields.bio.value.trim(),
  email: fields.email.value.trim(),
  website: fields.website.value.trim(),
  scholar: fields.scholar.value.trim(),
  github: fields.github.value.trim(),
  orcid: fields.orcid.value.trim(),
  cvLink: fields.cvLink.value.trim(),
  education: splitLines(fields.education.value),
  experience: splitLines(fields.experience.value),
  publications: splitParagraphs(fields.publications.value),
  awards: splitLines(fields.awards.value),
  service: splitLines(fields.service.value),
  news: splitLines(fields.news.value),
});

const htmlParagraphs = values => values.filter(Boolean).map(value => `        <p>${escapeHtml(value)}</p>`).join('\n');

const buildHeroLinks = data => {
  const items = [
    ['publications.html', 'Publications', false],
    ['contact.html', 'Contact', false],
    [data.scholar, 'Scholar', true],
    [data.cvLink || data.website, data.cvLink ? 'CV' : 'Website', true],
  ].filter(([href]) => Boolean(href));

  return items.map(([href, label, external], index) => {
    const anchor = external
      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      : `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
    const spacer = index < items.length - 1 ? '\n          <span>/</span>' : '';
    return `          ${anchor}${spacer}`;
  }).join('\n');
};

const buildHomepageSnippet = data => {
  const introLines = [];
  if (data.bio) {
    introLines.push(data.bio);
  } else if (data.name && data.affiliation) {
    introLines.push(`I am ${data.name}, a researcher at ${data.affiliation}.`);
  } else if (data.affiliation) {
    introLines.push(`I am a researcher at ${data.affiliation}.`);
  }

  if (data.affiliation && data.bio && !data.bio.includes(data.affiliation)) {
    introLines.push(`I am currently affiliated with ${data.affiliation}.`);
  }

  if (!introLines.length) {
    introLines.push('Replace this section with a concise introduction to your background, research areas, collaborators, and current projects.');
  }

  return `<h2 class="intro-title">Hi!</h2>\n<p class="intro-rule">===</p>\n${htmlParagraphs(introLines)}\n        <p class="hero-links">\n${buildHeroLinks(data)}\n        </p>`;
};

const splitDetailEntry = line => {
  const parts = line.split('|').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { title: parts[0], subtitle: parts[1], period: parts.slice(2).join(' | ') };
  }

  const match = line.match(/^(.*?)(?:,\s*)([^,]+?)(?:,\s*)((?:19|20)\d{2}[^,]*)$/);
  if (match) {
    return { title: match[1].trim(), subtitle: match[2].trim(), period: match[3].trim() };
  }

  return { title: line, subtitle: 'Add more detail here.', period: '' };
};

const buildDetailItems = (lines, fallbackImage) => lines.map(line => {
  const entry = splitDetailEntry(line);
  return `        <article class="detail-item">\n          <div class="detail-main">\n            <div class="logo-row">\n              <img class="entry-logo" src="${fallbackImage}" alt="Entry logo" loading="lazy">\n              <div>\n                <h3>${escapeHtml(entry.title)}</h3>\n                <p>${escapeHtml(entry.subtitle)}</p>\n              </div>\n            </div>\n          </div>\n          <div class="detail-side">${escapeHtml(entry.period || 'YYYY–YYYY')}</div>\n        </article>`;
}).join('\n');

const buildDetailsSnippet = data => {
  const educationItems = data.education.length
    ? buildDetailItems(data.education, 'my-academic-site/images/institution-a.svg')
    : '        <article class="detail-item">\n          <div class="detail-main">\n            <div class="logo-row">\n              <img class="entry-logo" src="my-academic-site/images/institution-a.svg" alt="Institution placeholder logo" loading="lazy">\n              <div>\n                <h3>Institution Name</h3>\n                <p>Degree, department, or program name.</p>\n              </div>\n            </div>\n          </div>\n          <div class="detail-side">2022–2026</div>\n        </article>';

  const experienceItems = data.experience.length
    ? buildDetailItems(data.experience, 'my-academic-site/images/lab.svg')
    : '        <article class="detail-item">\n          <div class="detail-main">\n            <div class="logo-row">\n              <img class="entry-logo" src="my-academic-site/images/lab.svg" alt="Lab placeholder logo" loading="lazy">\n              <div>\n                <h3>Research Role · Lab / Group / Institution</h3>\n                <p>Summarize what you worked on and what technical area this role focused on.</p>\n              </div>\n            </div>\n          </div>\n          <div class="detail-side">2025–present</div>\n        </article>';

  return `<section class="content-section" id="education">\n  <h2>education</h2>\n  <div class="detail-list">\n${educationItems}\n  </div>\n</section>\n\n<section class="content-section" id="experience">\n  <h2>experience</h2>\n  <div class="detail-list">\n${experienceItems}\n  </div>\n</section>`;
};

const parseNewsEntry = line => {
  const trimmed = line.trim();
  const match = trimmed.match(/^((?:19|20)\d{2}(?:[./-]\d{1,2})?)\s*[|｜\-–—:]\s*(.+)$/);
  if (match) {
    return { date: match[1].replace(/-/g, '.'), text: match[2].trim() };
  }

  const leadingDate = trimmed.match(/^((?:19|20)\d{2}(?:[./-]\d{1,2})?)\s+(.+)$/);
  if (leadingDate) {
    return { date: leadingDate[1].replace(/-/g, '.'), text: leadingDate[2].trim() };
  }

  return { date: 'recent', text: trimmed };
};

const parseAwardEntry = line => {
  const trimmed = line.trim();
  const pipeParts = trimmed.split('|').map(part => part.trim()).filter(Boolean);
  if (pipeParts.length >= 2) {
    const maybeYear = pipeParts[pipeParts.length - 1].match(/(?:19|20)\d{2}/)?.[0] || '';
    return {
      name: pipeParts.slice(0, maybeYear ? -1 : pipeParts.length).join(' | '),
      year: maybeYear,
    };
  }

  const yearMatch = trimmed.match(/((?:19|20)\d{2})(?!.*(?:19|20)\d{2})/);
  if (yearMatch) {
    return {
      name: trimmed.slice(0, yearMatch.index).replace(/[|,:，；;\-–—]+\s*$/, '').trim(),
      year: yearMatch[1],
    };
  }

  return { name: trimmed, year: '' };
};

const buildExtrasSnippet = data => {
  const newsItems = data.news.length
    ? data.news.map(line => {
        const entry = parseNewsEntry(line);
        return `          <li class="news-item"><span class="news-date">${escapeHtml(entry.date)}</span><span class="news-text">${escapeHtml(entry.text)}</span></li>`;
      }).join('\n')
    : '          <li class="news-item"><span class="news-date">2026.03</span><span class="news-text">Replace this item with a recent paper, award, talk, or project update.</span></li>';

  const serviceItems = data.service.length
    ? data.service.map(line => `          <li>${escapeHtml(line)}</li>`).join('\n')
    : '          <li>Add conference reviewing, mentoring, teaching, or volunteer service here.</li>';

  const awardItems = data.awards.length
    ? data.awards.map(line => {
        const entry = parseAwardEntry(line);
        return `            <li><span class="award-name">${escapeHtml(entry.name)}</span><span class="award-year">${escapeHtml(entry.year || '—')}</span></li>`;
      }).join('\n')
    : '            <li><span class="award-name">Sample Fellowship or Scholarship</span><span class="award-year">2026</span></li>';

  return `<section class="content-section" id="news">\n  <h2>${isChinesePage ? 'news' : 'news'}</h2>\n  <ul class="news-list">\n${newsItems}\n  </ul>\n</section>\n\n<section class="content-section" id="service">\n  <h2>${isChinesePage ? 'service' : 'service'}</h2>\n  <ul class="plain-list">\n${serviceItems}\n  </ul>\n</section>\n\n<section class="content-section" id="awards">\n  <h2>${isChinesePage ? 'awards' : 'awards'}</h2>\n  <div class="award-group">\n    <h3>${isChinesePage ? 'selected honors' : 'selected honors'}</h3>\n    <ul class="award-list">\n${awardItems}\n    </ul>\n  </div>\n</section>`;
};

const parsePublication = (entryText, preferredName) => {
  const singleLine = entryText.replace(/\s+/g, ' ').trim();
  const doiMatch = singleLine.match(/(https?:\/\/doi\.org\/\S+|10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i);
  const yearMatches = Array.from(singleLine.matchAll(/(?:19|20)\d{2}/g), match => Number(match[0]));
  const year = yearMatches.length ? Math.max(...yearMatches) : null;

  const normalizedForSplit = singleLine
    .replace(/\b(?:doi|DOI):\s*\S+/g, match => ` ${match} `)
    .replace(/https?:\/\/doi\.org\/\S+/gi, match => ` ${match} `);
  const sentences = normalizedForSplit.split(/\.\s+/).map(part => part.trim()).filter(Boolean);

  const firstSentence = sentences[0] || '';
  const authorLooksValid = /,/.test(firstSentence) || /\band\b/i.test(firstSentence);

  let authors = authorLooksValid ? firstSentence : (preferredName || 'Your Name');
  let title = sentences[1] || '';
  let venue = sentences.slice(2).join('. ');

  if (!title) {
    const stripped = singleLine.replace(/(https?:\/\/doi\.org\/\S+|10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig, '').trim();
    const parts = stripped.split(/\.\s+/).map(part => part.trim()).filter(Boolean);
    if (parts.length >= 3) {
      authors = authorLooksValid ? parts[0] : authors;
      title = parts[1];
      venue = parts.slice(2).join('. ');
    } else if (parts.length === 2) {
      authors = authorLooksValid ? parts[0] : authors;
      title = parts[1];
    } else {
      title = stripped;
    }
  }

  title = title.replace(/^(?:["“”']+)|(?:["“”']+)$/g, '').trim();
  venue = venue.replace(/\b(?:doi|DOI):\s*\S+/g, '').replace(/https?:\/\/doi\.org\/\S+/gi, '').trim().replace(/\.$/, '');

  if (!title) title = singleLine;

  if (preferredName) {
    const escapedName = preferredName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeAuthors = escapeHtml(authors);
    const safePreferredName = escapeHtml(preferredName);
    authors = safeAuthors.replace(new RegExp(escapedName, 'g'), `<strong>${safePreferredName}</strong>`);
  } else {
    authors = escapeHtml(authors);
  }

  const links = [];
  if (doiMatch) {
    const doi = doiMatch[1];
    const href = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
    links.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">doi</a>`);
  }

  return {
    title: escapeHtml(title.replace(/\.$/, '')),
    authors,
    venue: escapeHtml(venue || 'Add venue / journal / conference name here.'),
    links,
    year,
    type: inferPublicationType(venue),
  };
};

const inferPublicationType = venueText => {
  const venue = (venueText || '').toLowerCase();
  if (/(arxiv|preprint|working paper|under review|submitted)/i.test(venue)) return 'preprint';
  if (/(journal|transactions|letters|review|magazine)/i.test(venue)) return 'journal';
  if (/(conference|proceedings|symposium|workshop|meeting)/i.test(venue)) return 'conference';
  return 'other';
};

const publicationTypeLabel = type => {
  if (type === 'conference') return 'conference papers';
  if (type === 'journal') return 'journal articles';
  if (type === 'preprint') return 'preprints';
  return 'other';
};

const groupPublicationsByYear = publications => {
  const groups = new Map();

  for (const publication of publications) {
    const key = publication.year || 'Selected';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(publication);
  }

  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === 'Selected') return 1;
    if (b[0] === 'Selected') return -1;
    return Number(b[0]) - Number(a[0]);
  });
};

const groupPublicationsByType = publications => {
  const groups = new Map();
  for (const publication of publications) {
    const key = publication.type || 'other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(publication);
  }

  const order = ['conference', 'journal', 'preprint', 'other'];
  return Array.from(groups.entries()).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
};

const buildPublicationItems = items => items.map(parsed => {
  const linksLine = parsed.links.length ? `\n              <div class="pub-links">\n                ${parsed.links.join('\n                ')}\n              </div>` : '';

  return `        <li class="publication-item">\n          <div class="pub-body">\n            <div class="pub-title">${parsed.title}</div>\n            <div class="pub-meta">${parsed.authors}</div>\n            <div class="pub-venue">${parsed.venue}</div>${linksLine}\n          </div>\n        </li>`;
}).join('\n');

const buildPublicationsSnippet = data => {
  const entries = data.publications.length ? data.publications : ['Your Name, Collaborator A, Collaborator B. Sample Conference Paper Title. Conference Name 2026. DOI: 10.0000/example-doi-1'];
  const parsedEntries = entries.map(entry => parsePublication(entry, data.name));
  const groups = groupPublicationsByYear(parsedEntries);

  return groups.map(([year, items], index) => {
    const sectionId = index === 0 ? 'selected-year' : `selected-year-${year}`;
    const heading = year === 'Selected' ? 'selected publications' : String(year);
    const typeGroups = groupPublicationsByType(items);
    const groupedMarkup = typeGroups
      .map(([type, typeItems]) => `  <h3 class="group-title">${escapeHtml(publicationTypeLabel(type))}</h3>\n  <ol class="publication-list full-list">\n${buildPublicationItems(typeItems)}\n  </ol>`)
      .join('\n\n');

    return `<section class="content-section" id="${escapeHtml(sectionId)}">\n  <h2>${escapeHtml(heading)}</h2>\n${groupedMarkup}\n</section>`;
  }).join('\n\n');
};

const buildContactSnippet = data => {
  const emailText = data.email ? data.email.replace('@', ' [at] ').replace(/\./g, ' [dot] ') : 'your.email [at] example [dot] com';
  const websiteHref = data.website || 'https://example.com';
  const websiteLabel = data.website ? data.website.replace(/^https?:\/\//, '') : 'example.com';

  const profileLinks = [
    data.scholar ? `<a href="${escapeHtml(data.scholar)}" target="_blank" rel="noopener noreferrer">Google Scholar</a>` : '',
    data.github ? `<a href="${escapeHtml(data.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : '',
    data.orcid ? `<a href="${escapeHtml(data.orcid)}" target="_blank" rel="noopener noreferrer">ORCID</a>` : '',
  ].filter(Boolean).join(', ');

  return `<ul class="contact-block">\n  <li>Email: <a href="mailto:${escapeHtml(data.email || 'your.email@example.com')}">${escapeHtml(emailText)}</a></li>\n  <li>Website: <a href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(websiteLabel)}</a></li>\n  <li>Profiles: ${profileLinks || '<a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">Google Scholar</a>, <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>, <a href="https://orcid.org/" target="_blank" rel="noopener noreferrer">ORCID</a>'}</li>\n</ul>`;
};

const renderPreview = data => {
  const previewName = escapeHtml(data.name || 'Your Name');

  if (previewTargets.homepage) {
    previewTargets.homepage.innerHTML = `
      <article class="preview-page-shell">
        <div class="preview-nav">
          <div class="preview-brand"><span class="site-mark-link">${previewName}</span><span class="site-mark-prompt">:~#</span></div>
          <div class="preview-nav-links">${i18n.publicationsNav}</div>
        </div>
        <header class="hero preview-hero">
          <div class="hero-media">
            <div class="profile-container preview-profile-box">
              <div class="preview-profile-placeholder">IMG</div>
            </div>
          </div>
          <div class="hero-copy hero-intro">
            ${buildHomepageSnippet(data)}
          </div>
        </header>
        <div class="preview-divider"></div>
        <main class="preview-main-stack">
          ${buildDetailsSnippet(data)}

          ${buildExtrasSnippet(data)}
        </main>
        <footer class="site-footer compact-footer preview-footer-meta">
          <p class="footer-meta">© ${previewName} · Last updated YYYY-MM-DD</p>
        </footer>
      </article>
    `;
  }

  if (previewTargets.publications) {
    previewTargets.publications.innerHTML = `
      <article class="preview-page-shell">
        <div class="preview-nav">
          <div class="preview-brand"><span class="site-mark-link">${previewName}</span><span class="site-mark-prompt">:~#</span><span class="site-path">publications/</span></div>
          <div class="preview-nav-links">${i18n.publicationsNav}</div>
        </div>
        <header class="page-header preview-page-header">
          <p class="prompt-line">$ ls publications</p>
          <h1>publications</h1>
          <p class="page-summary">${i18n.publicationsPageSummary}</p>
        </header>
        <main class="preview-main-stack">
          ${buildPublicationsSnippet(data)}
        </main>
        <footer class="site-footer compact-footer preview-footer-meta">
          <p class="footer-meta">← ${i18n.backToHome} · Last updated YYYY-MM-DD</p>
        </footer>
      </article>
    `;
  }

  if (previewTargets.contact) {
    previewTargets.contact.innerHTML = `
      <article class="preview-page-shell">
        <div class="preview-nav">
          <div class="preview-brand"><span class="site-mark-link">${previewName}</span><span class="site-mark-prompt">:~#</span><span class="site-path">contact/</span></div>
          <div class="preview-nav-links">${i18n.publicationsNav}</div>
        </div>
        <main class="preview-main-stack">
          <section class="content-section contact-page" id="contact-preview-block">
            <h2>Contact</h2>
            <p class="intro-rule">=======</p>
            <p class="contact-lead">${i18n.contactPreviewLead}</p>
            ${buildContactSnippet(data)}
          </section>
        </main>
        <footer class="site-footer compact-footer preview-footer-meta">
          <p class="footer-meta">← ${i18n.backToHome} · Last updated YYYY-MM-DD</p>
        </footer>
      </article>
    `;
  }
};

const buildHtmlDocument = ({ lang, title, description, bodyContent }) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${description}" />
  <meta name="color-scheme" content="light dark" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
${bodyContent}
  </div>
  <script src="scripts.js"></script>
</body>
</html>`;

const buildNavigation = (name, pathLabel = '') => {
  const safeName = escapeHtml(name || 'Your Name');
  const homeHref = 'index.html';
  const publicationsHref = 'publications.html';
  const contactHref = 'contact.html';
  const publicationsLabel = 'Publications/';
  const contactLabel = 'Contact/';
  const scholarLabel = 'Scholar/';
  const pathPart = pathLabel ? `<span class="site-path">${escapeHtml(pathLabel)}</span>` : '';
  return `    <nav class="site-nav" aria-label="Primary">\n      <div class="site-brand" aria-label="site mark"><span class="site-mark"><a class="site-mark-link" href="${homeHref}">${safeName}</a><span class="site-mark-prompt">:~#</span></span>${pathPart}</div>\n      <div class="nav-links">\n        <a href="${publicationsHref}">${publicationsLabel}</a>\n        <a href="${contactHref}">${contactLabel}</a>\n        <a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">${scholarLabel}</a>\n      </div>\n      <button id="theme-switcher" type="button" aria-label="Toggle dark mode">☾</button>\n    </nav>`;
};

const buildFullHomepage = data => buildHtmlDocument({
  lang: outputInEnglish ? 'en' : (isChinesePage ? 'zh-CN' : 'en'),
  title: `${escapeHtml(data.name || 'Your Name')}`,
  description: `${escapeHtml(data.name || 'Your Name')} academic homepage.`,
  bodyContent: `${buildNavigation(data.name)}\n\n    <header class="hero" id="top">\n      <div class="hero-media">\n        <div class="profile-container">\n          <img class="profile-image default" loading="lazy" src="my-academic-site/images/avatar-illustration.svg" alt="Illustrated profile placeholder">\n          <img class="profile-image hover" loading="lazy" src="my-academic-site/images/avatar-photo.svg" alt="Profile placeholder">\n        </div>\n      </div>\n\n      <div class="hero-copy hero-intro">\n        ${buildHomepageSnippet(data)}\n      </div>\n    </header>\n\n    <main class="main-content">\n${buildDetailsSnippet(data)}\n\n${buildExtrasSnippet(data)}\n    </main>\n\n    <footer class="site-footer">\n      <p class="footer-meta">© ${escapeHtml(data.name || 'Your Name')} · Last updated <time id="lastUpdated" datetime="">—</time></p>\n    </footer>`,
});

const buildFullPublicationsPage = data => buildHtmlDocument({
  lang: outputInEnglish ? 'en' : (isChinesePage ? 'zh-CN' : 'en'),
  title: `Publications · ${escapeHtml(data.name || 'Your Name')}`,
  description: `Publications by ${escapeHtml(data.name || 'Your Name')}.`,
  bodyContent: `${buildNavigation(data.name, 'publications/')}\n\n    <header class="page-header">\n      <p class="prompt-line">$ ls publications</p>\n      <h1>publications</h1>\n      <p class="page-summary">${i18n.generatedPublicationsPage}</p>\n    </header>\n\n    <main class="main-content">\n${buildPublicationsSnippet(data)}\n    </main>\n\n    <footer class="site-footer compact-footer">\n      <p class="footer-meta">← <a href="index.html">${i18n.backToHome}</a> · Last updated <time id="lastUpdated" datetime="">—</time></p>\n    </footer>`,
});

const buildFullContactPage = data => buildHtmlDocument({
  lang: outputInEnglish ? 'en' : (isChinesePage ? 'zh-CN' : 'en'),
  title: `Contact · ${escapeHtml(data.name || 'Your Name')}`,
  description: `Contact information for ${escapeHtml(data.name || 'Your Name')}.`,
  bodyContent: `${buildNavigation(data.name, 'contact/')}\n\n    <main class="main-content">\n      <section class="content-section contact-page" id="contact">\n        <h2>Contact</h2>\n        <p class="intro-rule">=======</p>\n        <p class="contact-lead">${i18n.generatedContactPage}</p>\n        ${buildContactSnippet(data)}\n      </section>\n    </main>\n\n    <footer class="site-footer compact-footer">\n      <p class="footer-meta">← <a href="index.html">${i18n.backToHome}</a> · Last updated <time id="lastUpdated" datetime="">—</time></p>\n    </footer>`,
});

const downloadGeneratedPage = pageType => {
  const data = getFieldData();
  if (pageType === 'home') {
    const blob = new Blob([buildFullHomepage(data)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.generated.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(i18n.downloaded(link.download), 'success');
    return;
  }

  if (pageType === 'publications') {
    const blob = new Blob([buildFullPublicationsPage(data)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'publications.generated.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus(i18n.downloaded(link.download), 'success');
    return;
  }

  const blob = new Blob([buildFullContactPage(data)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'contact.generated.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(i18n.downloaded(link.download), 'success');
};

const activateWizardStep = stepName => {
  const order = ['upload', 'review', 'export'];
  const activeIndex = order.indexOf(stepName);
  if (activeIndex === -1) return;

  order.forEach((name, index) => {
    const target = stepTargets[name];
    if (!target) return;
    target.classList.toggle('is-active', index <= activeIndex);
  });
};

const refreshGeneratedOutput = ({ skipStatus = false } = {}) => {
  const data = getFieldData();
  snippetTargets.homepage.value = buildHomepageSnippet(data);
  snippetTargets.details.value = buildDetailsSnippet(data);
  snippetTargets.publications.value = buildPublicationsSnippet(data);
  snippetTargets.contact.value = buildContactSnippet(data);
  snippetTargets.extras.value = buildExtrasSnippet(data);
  renderPreview(data);
  activateWizardStep('export');
  if (!skipStatus) {
    setStatus(i18n.generatedSnippets, 'success');
  }
};


const analyzeCurrentText = () => {
  const text = rawTextInput.value.trim();
  if (!text) {
    setStatus(i18n.pasteOrExtractFirst, 'warning');
    return;
  }

  importState.rawText = text;
  fillFields(parseCvText(text));
  refreshGeneratedOutput();
};

const extractPdfText = async file => {
  if (!window.pdfjsLib) {
    throw new Error(i18n.pdfLoadFailed);
  }

  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = content.items.map(item => item.str).join(' ');
    pages.push(lines.trim());
  }

  return normalizeText(pages.join('\n\n'));
};

const extractDocxText = async file => {
  if (!window.mammoth) {
    throw new Error(i18n.docxLoadFailed);
  }

  const buffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
  return normalizeText(result.value);
};

const handleFileUpload = async event => {
  const file = event.target.files?.[0];
  if (!file) return;

  setStatus(i18n.readingFile(file.name), 'info');

  try {
    let text = '';
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      text = await extractPdfText(file);
    } else if (/\.docx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractDocxText(file);
    } else {
      throw new Error(i18n.unsupportedFileType);
    }

    rawTextInput.value = text;
    importState.rawText = text;
    setStatus(i18n.extractedFile(file.name), 'success');
    fillFields(parseCvText(text));
    activateWizardStep('review');
    refreshGeneratedOutput({ skipStatus: true });
  } catch (error) {
    console.error(error);
    setStatus(error.message || i18n.parseFailed, 'error');
  }
};

const clearAll = () => {
  rawTextInput.value = '';
  Object.values(fields).forEach(field => {
    field.value = '';
  });
  Object.values(snippetTargets).forEach(target => {
    target.value = '';
  });
  Object.values(previewTargets).forEach(target => {
    if (target) target.innerHTML = '';
  });
  importState.rawText = '';
  cvFileInput.value = '';
  activateWizardStep('upload');
  setStatus(i18n.cleared, 'info');
};

const downloadSnippet = (targetId, fileName) => {
  const target = document.getElementById(targetId);
  if (!target?.value) {
    setStatus(i18n.nothingToDownload, 'warning');
    return;
  }

  const blob = new Blob([target.value], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || `${targetId}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(i18n.downloaded(fileName || `${targetId}.html`), 'success');
};

const copySnippet = async targetId => {
  const target = document.getElementById(targetId);
  if (!target?.value) {
    setStatus(i18n.nothingToCopy, 'warning');
    return;
  }

  try {
    await navigator.clipboard.writeText(target.value);
    setStatus(i18n.copied(targetId), 'success');
  } catch {
    target.focus();
    target.select();
    setStatus(i18n.clipboardFallback, 'warning');
  }
};

Object.values(fields).forEach(field => {
  field?.addEventListener('input', () => refreshGeneratedOutput({ skipStatus: true }));
});

cvFileInput?.addEventListener('change', handleFileUpload);
analyzeButton?.addEventListener('click', analyzeCurrentText);
generateButton?.addEventListener('click', refreshGeneratedOutput);
clearButton?.addEventListener('click', clearAll);
parseDemoButton?.addEventListener('click', () => {
  rawTextInput.value = demoCvText;
  importState.rawText = demoCvText;
  fillFields(parseCvText(demoCvText));
  activateWizardStep('review');
  refreshGeneratedOutput({ skipStatus: true });
  setStatus(i18n.demoLoaded, 'success');
});

document.addEventListener('click', event => {
  const copyButton = event.target.closest('.copy-button[data-copy-target]');
  if (copyButton) {
    copySnippet(copyButton.getAttribute('data-copy-target'));
    return;
  }

  const downloadButton = event.target.closest('.copy-button[data-download-target]');
  if (downloadButton) {
    downloadSnippet(
      downloadButton.getAttribute('data-download-target'),
      downloadButton.getAttribute('data-download-name'),
    );
    return;
  }

  const pageDownloadButton = event.target.closest('[data-download-page]');
  if (pageDownloadButton) {
    downloadGeneratedPage(pageDownloadButton.getAttribute('data-download-page'));
  }
});
