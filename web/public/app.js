// ── State ────────────────────────────
let personas = [];
let activeChat = null; // personaId or 'group' or 'biz-group'
let chatHistories = JSON.parse(localStorage.getItem('savant-chat-histories') || '{}');
// Clean up empty/error assistant messages from interrupted sessions
for (const [key, msgs] of Object.entries(chatHistories)) {
  chatHistories[key] = msgs.filter(m => {
    if (m.role !== 'assistant') return true;
    if (!m.content) return false;
    if (/\*\*Error\*\*:\s*(network|abort|fetch|failed to fetch)/i.test(m.content)) return false;
    return true;
  });
}
localStorage.setItem('savant-chat-histories', JSON.stringify(chatHistories));
let isStreaming = false;
let chatMode = localStorage.getItem('savant-chat-mode') || 'fast'; // 'fast' or 'deep'

function saveChatHistories() {
  try {
    // Keep only last 50 messages per chat to avoid localStorage limits
    const trimmed = {};
    for (const [key, msgs] of Object.entries(chatHistories)) {
      trimmed[key] = msgs.slice(-50);
    }
    localStorage.setItem('savant-chat-histories', JSON.stringify(trimmed));
  } catch { /* localStorage full, ignore */ }
}
let lang = localStorage.getItem('savant-lang') || 'en';
let apiKey = localStorage.getItem('savant-api-key') || '';
let provider = localStorage.getItem('savant-provider') || 'local';
let bizCollapsed = localStorage.getItem('savant-biz-collapsed') === 'true';

// Biz agent activation state (localStorage)
function getBizEnabled() {
  try { return JSON.parse(localStorage.getItem('savant-biz-enabled') || '{}'); } catch { return {}; }
}
function setBizEnabled(id, on) {
  const state = getBizEnabled();
  state[id] = on;
  localStorage.setItem('savant-biz-enabled', JSON.stringify(state));
}
function isBizEnabled(id) {
  const state = getBizEnabled();
  if (id === 'sayno') return true; // SayNo always on (gateway)
  return state[id] === true;
}
function getActiveBizIds() {
  return personas.filter(p => p.category === 'biz' && isBizEnabled(p.id)).map(p => p.id);
}

// Dev specialist agent activation state (localStorage)
const CORE_DEV_IDS = ['einstein', 'shakespeare', 'socrates', 'stevejobs'];
function isCoreDev(id) { return CORE_DEV_IDS.includes(id); }
function getDevEnabled() {
  try { return JSON.parse(localStorage.getItem('savant-dev-enabled') || '{}'); } catch { return {}; }
}
function setDevEnabled(id, on) {
  const state = getDevEnabled();
  state[id] = on;
  localStorage.setItem('savant-dev-enabled', JSON.stringify(state));
}
function isDevEnabled(id) {
  if (isCoreDev(id)) return true; // Core 4 always on
  const state = getDevEnabled();
  return state[id] === true;
}
function getActiveDevIds() {
  return personas.filter(p => p.category === 'dev' && isDevEnabled(p.id)).map(p => p.id);
}

const providerNames = { local: 'Claude Code', anthropic: 'Claude', openai: 'GPT', gemini: 'Gemini' };
const providerKeyNames = { local: '', anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY' };
const providerKeyLinks = {
  local: '',
  anthropic: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey',
};


const i18n = {
  en: {
    welcome: 'Pick a persona and start chatting about your project.',
    welcomeGroup: 'All personas will discuss your question together.',
    groupName: 'Dev Team Chat',
    groupTitle: 'Dev Personas',
    bizGroupName: 'Biz Team Chat',
    bizGroupTitle: 'Biz Personas',
    devSection: 'Development',
    bizSection: 'Business',
    newChat: 'New Chat',
    apiKey: 'API Key',
    placeholder: 'Ask about your project...',
    typing: 'Typing...',
    ready: 'Ready',
    modalTitle: 'API Key Required',
    modalDesc: 'To chat with Savant personas, you need an Anthropic API key.',
    modalGetKey: 'Get API Key',
    modalSave: 'Save',
    modalHint: 'Or set it in your terminal:',
  },
  ko: {
    welcome: '페르소나를 선택하고 프로젝트에 대해 대화하세요.',
    welcomeGroup: '페르소나가 함께 당신의 질문을 논의합니다.',
    groupName: '개발 단톡방',
    groupTitle: '개발 페르소나',
    bizGroupName: '사업 단톡방',
    bizGroupTitle: '사업 페르소나',
    devSection: '개발',
    bizSection: '사업',
    newChat: '새 대화',
    apiKey: 'API 키 설정',
    placeholder: '프로젝트에 대해 물어보세요...',
    typing: '입력 중...',
    ready: '대기 중',
    modalTitle: 'API 키가 필요합니다',
    modalDesc: 'Savant 페르소나와 대화하려면 Anthropic API 키가 필요합니다.',
    modalGetKey: 'API 키 발급',
    modalSave: '저장',
    modalHint: '터미널에서 설정할 수도 있습니다:',
  }
};

function t(key) { return i18n[lang]?.[key] || i18n.en[key] || key; }

// ── Init ─────────────────────────────
async function init() {
  const [personaRes, projectRes] = await Promise.all([
    fetch('/api/personas'),
    fetch('/api/project'),
  ]);
  personas = await personaRes.json();
  const project = await projectRes.json();

  document.getElementById('projectName').textContent = project.name;
  document.title = `Savant Chat · ${project.name}`;

  apiKey = localStorage.getItem(`savant-api-key-${provider}`) || '';
  applyLang();
  applyProviderButtons();
  renderPersonaList();
  document.getElementById('modeFast').className = chatMode === 'fast' ? 'active' : '';
  document.getElementById('modeDeep').className = chatMode === 'deep' ? 'active' : '';
  // Restore last active chat or default to first dev persona
  const lastChat = localStorage.getItem('savant-active-chat');
  const validChat = lastChat && (lastChat === 'group' || lastChat === 'biz-group' || personas.some(p => p.id === lastChat));
  if (validChat) {
    selectChat(lastChat);
  } else {
    const firstDev = personas.find(p => p.category === 'dev');
    if (firstDev) selectChat(firstDev.id);
  }

  // Resume active response if page was refreshed during streaming
  resumeActiveResponse();
}

async function resumeActiveResponse() {
  const saved = sessionStorage.getItem('savant-active-response');
  if (!saved) return;
  try {
    const { id, chat } = JSON.parse(saved);
    // Check if response exists on server
    const check = await fetch(`/api/response/${id}`);
    const info = await check.json();
    if (!info.found) { sessionStorage.removeItem('savant-active-response'); return; }

    // Switch to that chat
    if (activeChat !== chat) selectChat(chat);
    const history = chatHistories[chat] || [];

    if (info.done) {
      // Response finished while we were refreshing — just update the last message
      if (info.text && history.length > 0 && history[history.length - 1].role === 'assistant') {
        history[history.length - 1].content = info.text;
      } else if (info.text) {
        history.push({ role: 'assistant', content: info.text });
      }
      saveChatHistories();
      renderMessages();
      sessionStorage.removeItem('savant-active-response');
      return;
    }

    // Still streaming — reconnect via SSE
    isStreaming = true;
    processingChat = chat;
    // Ensure assistant message exists
    if (history.length === 0 || history[history.length - 1].role !== 'assistant') {
      history.push({ role: 'assistant', content: info.text || '' });
    } else {
      history[history.length - 1].content = info.text || '';
    }
    renderMessages();

    const response = await fetch(`/api/response/${id}/stream`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = info.text || '';
    let buffer = '';
    let usageData = info.usage || null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            if (parsed.cached) { assistantText = parsed.text; } // Full cached text
            else { assistantText += parsed.text; }
            const estTokens = Math.round(assistantText.length / 4);
            updateStreamingUsage(usageData, estTokens);
          } else if (parsed.usage) {
            usageData = { ...usageData, ...parsed.usage };
            updateStreamingUsage(usageData, null);
          } else if (parsed.error) {
            assistantText += `\n\n**Error**: ${parsed.error}`;
          }
        } catch {}
      }

      history[history.length - 1].content = assistantText;
      const bubble = document.getElementById('streaming-bubble');
      if (bubble && activeChat === chat) {
        bubble.innerHTML = marked.parse(assistantText, { breaks: true });
        bubble.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
        scrollToBottom();
      }
    }

    history[history.length - 1].content = assistantText;
    saveChatHistories();
    sessionStorage.removeItem('savant-active-response');
    isStreaming = false;
    processingChat = null;
    renderMessages();
  } catch (err) {
    sessionStorage.removeItem('savant-active-response');
    isStreaming = false;
    processingChat = null;
  }
}

function setProvider(p) {
  provider = p;
  localStorage.setItem('savant-provider', p);
  // Update API key for this provider
  apiKey = localStorage.getItem(`savant-api-key-${p}`) || '';
  applyProviderButtons();
}

function applyProviderButtons() {
  document.getElementById('provLocal').className = provider === 'local' ? 'active' : '';
  document.getElementById('provAnthropic').className = provider === 'anthropic' ? 'active' : '';
  document.getElementById('provOpenai').className = provider === 'openai' ? 'active' : '';
  document.getElementById('provGemini').className = provider === 'gemini' ? 'active' : '';
  // Hide API Key button when using local provider
  const apiKeyBtn = document.querySelector('.sidebar-bottom .secondary');
  if (apiKeyBtn) apiKeyBtn.style.display = provider === 'local' ? 'none' : '';
}

function setLang(l) {
  lang = l;
  localStorage.setItem('savant-lang', l);
  applyLang();
  renderPersonaList();
  renderMessages();
}

function applyLang() {
  document.getElementById('langEn').className = lang === 'en' ? 'active' : '';
  document.getElementById('langKo').className = lang === 'ko' ? 'active' : '';
  document.getElementById('input').placeholder = t('placeholder');
  document.getElementById('modalTitle').textContent = t('modalTitle');
  document.getElementById('modalDesc').textContent = t('modalDesc');
  document.getElementById('modalGetKey').textContent = t('modalGetKey');
  document.getElementById('modalSave').textContent = t('modalSave');
  document.getElementById('modalHint').innerHTML = `${t('modalHint')} <code>export ANTHROPIC_API_KEY=sk-ant-...</code>`;
  document.querySelectorAll('.t').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en;
  });
}

function renderPersonaList() {
  const list = document.getElementById('personaList');
  const devPersonas = personas.filter(p => p.category === 'dev');
  const bizPersonas = personas.filter(p => p.category === 'biz');

  // Dev section
  const devManageBtn = `<span onclick="event.stopPropagation(); openDevModal()" style="font-size:10px; color:var(--muted); cursor:pointer; padding:2px 6px; border-radius:4px; background:#f0f0f0;">${lang === 'ko' ? '관리' : 'Manage'}</span>`;
  const devHeader = `<div class="category-header" onclick="toggleCategory('dev')">
    <span class="label">${t('devSection')}</span>
    <span style="display:flex;align-items:center;gap:6px;">${devManageBtn}<span class="arrow">▼</span></span>
  </div>`;

  // Only show core devs + activated specialist devs in sidebar
  const activeDevPersonas = devPersonas.filter(p => isCoreDev(p.id) || isDevEnabled(p.id));
  const devItems = activeDevPersonas.map(p => `
    <div class="persona-item ${activeChat === p.id ? 'active' : ''}"
         onclick="selectChat('${p.id}')" id="chat-${p.id}">
      <div class="avatar" style="background:${p.color}">${p.initial}</div>
      <div class="persona-info">
        <div class="name" ondblclick="event.stopPropagation(); editPersonaName('${p.id}', this)">${lang === 'ko' ? p.nameKo : p.name}</div>
        <div class="title">${lang === 'ko' ? p.titleKo : p.title}</div>
      </div>
    </div>
  `).join('');

  const devGroupItem = `
    <div class="persona-item ${activeChat === 'group' ? 'active' : ''}"
         onclick="selectChat('group')" id="chat-group">
      <div class="avatar group-av">All</div>
      <div class="persona-info">
        <div class="name">${t('groupName')}</div>
        <div class="title">${t('groupTitle')}</div>
      </div>
    </div>`;

  // Biz section
  const bizHeaderClass = bizCollapsed ? 'category-header collapsed' : 'category-header';
  const bizItemsClass = bizCollapsed ? 'category-items collapsed' : 'category-items';
  const bizManageBtn = `<span onclick="event.stopPropagation(); openBizModal()" style="font-size:10px; color:var(--muted); cursor:pointer; padding:2px 6px; border-radius:4px; background:#f0f0f0;">${lang === 'ko' ? '관리' : 'Manage'}</span>`;
  const bizHeader = `<div class="${bizHeaderClass}" onclick="toggleCategory('biz')" style="margin-top:12px; border-top:1px solid var(--border); padding-top:10px;">
    <span class="label">${t('bizSection')}</span>
    <span style="display:flex;align-items:center;gap:6px;">${bizManageBtn}<span class="arrow">▼</span></span>
  </div>`;

  // Only show activated biz agents in sidebar
  const activeBizPersonas = bizPersonas.filter(p => p.id === 'sayno' || isBizEnabled(p.id));
  const bizItems = activeBizPersonas.map(p => `
      <div class="persona-item ${activeChat === p.id ? 'active' : ''}"
           onclick="selectChat('${p.id}')" id="chat-${p.id}">
        <div class="avatar" style="background:${p.color}">${p.initial}</div>
        <div class="persona-info">
          <div class="name" ondblclick="event.stopPropagation(); editPersonaName('${p.id}', this)">${lang === 'ko' ? p.nameKo : p.name}</div>
          <div class="title">${lang === 'ko' ? p.titleKo : p.title}</div>
        </div>
      </div>`
  ).join('');

  const activeBiz = getActiveBizIds();
  const bizGroupItem = activeBiz.length >= 2 ? `
    <div class="persona-item ${activeChat === 'biz-group' ? 'active' : ''}"
         onclick="selectChat('biz-group')" id="chat-biz-group">
      <div class="avatar biz-group-av">Biz</div>
      <div class="persona-info">
        <div class="name">${t('bizGroupName')}</div>
        <div class="title">${activeBiz.length} ${lang === 'ko' ? '명 활성' : 'active'}</div>
      </div>
    </div>` : '';

  const addAgentItem = `
    <a href="https://github.com/rlaope/claude-code-savant/issues" target="_blank"
       style="text-decoration:none;">
      <div class="persona-item" style="margin-top:10px; border:1px dashed #ddd; background:#fafafa; opacity:0.7;">
        <div class="avatar sm" style="background:#ddd; color:#999; font-size:16px;">+</div>
        <div class="persona-info">
          <div class="name" style="color:#999;">${lang === 'ko' ? '새 에이전트 추가 요청' : 'Request a New Agent'}</div>
          <div class="title">${lang === 'ko' ? 'GitHub Issue로 제안하기' : 'Suggest via GitHub Issue'}</div>
        </div>
      </div>
    </a>`;

  list.innerHTML = devHeader + `<div class="category-items">${devItems}${devGroupItem}</div>`
    + bizHeader + `<div class="${bizItemsClass}">${bizItems}${bizGroupItem}</div>`
    + addAgentItem;
}

function toggleCategory(cat) {
  if (cat === 'biz') {
    bizCollapsed = !bizCollapsed;
    localStorage.setItem('savant-biz-collapsed', bizCollapsed);
  }
  renderPersonaList();
}

function toggleBiz(id) {
  const current = isBizEnabled(id);
  setBizEnabled(id, !current);
  if (current && activeChat === id) {
    selectChat('sayno');
  }
  renderPersonaList();
}

function openBizModal() {
  const bizPersonas = personas.filter(p => p.category === 'biz');
  document.getElementById('bizModalTitle').textContent =
    lang === 'ko' ? '사업 에이전트 관리' : 'Manage Business Agents';
  document.getElementById('bizModalDesc').textContent =
    lang === 'ko' ? '필요한 도메인 전문가를 활성화하세요. 세이노는 게이트웨이로 항상 켜져 있습니다.' : 'Activate the domain experts you need. SayNo is always on as the gateway.';

  const chipsHtml = bizPersonas.map(p => {
    const isGateway = p.id === 'sayno';
    const enabled = isBizEnabled(p.id);
    const chipClass = (enabled || isGateway) ? 'biz-chip active' : 'biz-chip inactive';
    const clickAction = isGateway ? '' : `onclick="toggleBizModal('${p.id}')"`;
    const gatewayBadge = isGateway ? `<span class="gateway-badge">GATEWAY</span>` : '';
    const name = lang === 'ko' ? p.nameKo : p.name;
    const desc = lang === 'ko' ? p.titleKo : p.title;
    return `
      <div class="${chipClass}" ${clickAction} style="${isGateway ? 'cursor:default;' : ''}">
        <div class="chip-avatar" style="background:${p.color}">${p.initial}</div>
        <div class="chip-name">${name}</div>
        <div class="chip-desc">${desc}</div>
        ${gatewayBadge}
      </div>`;
  }).join('');

  document.getElementById('bizAgentList').innerHTML = `<div class="biz-chip-grid">${chipsHtml}</div>`;
  document.getElementById('bizModal').classList.remove('hidden');
}

function toggleBizModal(id) {
  const current = isBizEnabled(id);
  setBizEnabled(id, !current);
  if (current && activeChat === id) {
    selectChat('sayno');
  }
  openBizModal(); // re-render modal
  renderPersonaList();
}

function closeBizModal() {
  document.getElementById('bizModal').classList.add('hidden');
}

function openDevModal() {
  const devPersonas = personas.filter(p => p.category === 'dev');
  document.getElementById('devModalTitle').textContent =
    lang === 'ko' ? '개발 에이전트 관리' : 'Manage Dev Specialist Agents';
  document.getElementById('devModalDesc').textContent =
    lang === 'ko' ? '필요한 전문 에이전트를 활성화하세요. 코어 페르소나(Einstein, Shakespeare, Socrates, Steve Jobs)는 항상 켜져 있습니다.' : 'Activate the specialist agents you need. Core personas (Einstein, Shakespeare, Socrates, Steve Jobs) are always on.';

  const chipsHtml = devPersonas.map(p => {
    const isCore = isCoreDev(p.id);
    const enabled = isDevEnabled(p.id);
    const chipClass = (enabled || isCore) ? 'biz-chip active' : 'biz-chip inactive';
    const clickAction = isCore ? '' : `onclick="toggleDevModal('${p.id}')"`;
    const coreBadge = isCore ? `<span class="gateway-badge">CORE</span>` : '';
    const name = lang === 'ko' ? p.nameKo : p.name;
    const desc = lang === 'ko' ? p.titleKo : p.title;
    return `
      <div class="${chipClass}" ${clickAction} style="${isCore ? 'cursor:default;' : ''}">
        <div class="chip-avatar" style="background:${p.color}">${p.initial}</div>
        <div class="chip-name">${name}</div>
        <div class="chip-desc">${desc}</div>
        ${coreBadge}
      </div>`;
  }).join('');

  document.getElementById('devAgentList').innerHTML = `<div class="biz-chip-grid">${chipsHtml}</div>`;
  document.getElementById('devModal').classList.remove('hidden');
}

function toggleDevModal(id) {
  const current = isDevEnabled(id);
  setDevEnabled(id, !current);
  if (current && activeChat === id) {
    selectChat('einstein');
  }
  openDevModal(); // re-render modal
  renderPersonaList();
}

function closeDevModal() {
  document.getElementById('devModal').classList.add('hidden');
}

function selectChat(id) {
  activeChat = id;
  localStorage.setItem('savant-active-chat', id);
  if (!chatHistories[id]) chatHistories[id] = [];

  if (id === 'group') {
    document.getElementById('headerAvatar').className = 'avatar group-av';
    document.getElementById('headerAvatar').style.background = '';
    document.getElementById('headerAvatar').textContent = 'All';
    document.getElementById('headerName').textContent = t('groupName');
    document.getElementById('headerStatus').textContent = t('groupTitle');
  } else if (id === 'biz-group') {
    document.getElementById('headerAvatar').className = 'avatar biz-group-av';
    document.getElementById('headerAvatar').style.background = '';
    document.getElementById('headerAvatar').textContent = 'Biz';
    document.getElementById('headerName').textContent = t('bizGroupName');
    document.getElementById('headerStatus').textContent = t('bizGroupTitle');
  } else {
    const p = personas.find(x => x.id === id);
    if (!p) return;
    document.getElementById('headerAvatar').className = 'avatar';
    document.getElementById('headerAvatar').style.background = p.color;
    document.getElementById('headerAvatar').textContent = p.initial;
    document.getElementById('headerName').textContent = lang === 'ko' ? p.nameKo : p.name;
    document.getElementById('headerStatus').textContent = lang === 'ko' ? p.titleKo : p.title;
  }

  document.querySelectorAll('.persona-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`chat-${id}`)?.classList.add('active');

  renderMessages();
  document.getElementById('input').focus();
}

// ── Messages ─────────────────────────
function renderMessages() {
  const container = document.getElementById('messages');
  const history = chatHistories[activeChat] || [];

  if (history.length === 0) {
    const isGroup = activeChat === 'group' || activeChat === 'biz-group';
    const p = isGroup ? null : personas.find(x => x.id === activeChat);
    const avStyle = activeChat === 'biz-group'
      ? 'class="avatar sm biz-group-av"'
      : activeChat === 'group'
      ? 'class="avatar sm group-av"'
      : `class="avatar sm" style="background:${p?.color||'#666'}"`;
    const avText = activeChat === 'biz-group' ? 'Biz' : activeChat === 'group' ? 'All' : (p?.initial || '?');
    const welcomeText = getWelcomeBubble(activeChat);
    container.innerHTML = `
      <div class="message-row assistant" style="margin-top:40px;">
        <div ${avStyle}>${avText}</div>
        <div class="bubble">${marked.parse(welcomeText, { breaks: true })}</div>
      </div>
    `;
    return;
  }

  const isAnyGroup = activeChat === 'group' || activeChat === 'biz-group';
  const p = isAnyGroup ? null : personas.find(x => x.id === activeChat);

  // Prepend welcome bubble before chat history
  const wavStyle = activeChat === 'biz-group'
    ? 'class="avatar sm biz-group-av"'
    : activeChat === 'group'
    ? 'class="avatar sm group-av"'
    : `class="avatar sm" style="background:${p?.color||'#666'}"`;
  const wavText = activeChat === 'biz-group' ? 'Biz' : activeChat === 'group' ? 'All' : (p?.initial || '?');
  const welcomePrefix = `
    <div class="message-row assistant" style="margin-top:20px;opacity:0.7;">
      <div ${wavStyle}>${wavText}</div>
      <div class="bubble">${marked.parse(getWelcomeBubble(activeChat), { breaks: true })}</div>
    </div>
  `;

  const avStyle2 = activeChat === 'biz-group'
    ? 'class="avatar sm biz-group-av"'
    : activeChat === 'group'
    ? 'class="avatar sm group-av"'
    : `class="avatar sm" style="background:${p?.color||'#666'}"`;
  const avText2 = activeChat === 'biz-group' ? 'Biz' : activeChat === 'group' ? 'All' : (p?.initial || '?');

  container.innerHTML = welcomePrefix + history.map((msg, idx) => {
    if (msg.role === 'user') {
      return `<div class="message-row user">
        <div class="avatar sm" style="background:#1a1a1a;font-size:9px;">You</div>
        <div class="bubble">${escapeHtml(msg.content)}</div>
      </div>`;
    }
    // For in-progress responses, render with streaming-bubble id
    const isLastMsg = idx === history.length - 1;
    const isInProgress = isLastMsg && processingChat === activeChat && msg.role === 'assistant';
    if (!msg.content && !isInProgress) return '';
    if (isInProgress) {
      return `<div class="message-row assistant">
        <div ${avStyle2}>${avText2}</div>
        <div class="bubble" id="streaming-bubble">${msg.content ? marked.parse(msg.content, { breaks: true }) : ''}</div>
      </div>`;
    }
    return `<div class="message-row assistant">
      <div ${avStyle2}>${avText2}</div>
      <div class="bubble">${marked.parse(msg.content, { breaks: true })}</div>
    </div>`;
  }).join('');

  // Show typing indicator if this chat is being processed and no text yet
  if (processingChat === activeChat) {
    const lastMsg = history[history.length - 1];
    const hasContent = lastMsg && lastMsg.role === 'assistant' && lastMsg.content;
    if (!hasContent) {
      // No text yet — show typing animation
      const typingRow = document.createElement('div');
      typingRow.className = 'message-row assistant';
      typingRow.innerHTML = `<div ${avStyle2}>${avText2}</div>
        <div class="bubble">
          <div class="typing-indicator"><span></span><span></span><span></span></div>
          <div class="thinking-status"></div>
        </div>`;
      container.appendChild(typingRow);
    }
    // If has content, streaming-bubble is already rendered from history map above
  }

  // Show queue indicator if this chat has queued messages
  const queuedForThis = messageQueue.filter(q => q.chatId === activeChat);
  if (queuedForThis.length > 0 && processingChat !== activeChat) {
    const queueRow = document.createElement('div');
    queueRow.className = 'message-row assistant';
    queueRow.innerHTML = `<div ${avStyle2}>${avText2}</div>
      <div class="bubble">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
        <div style="color:#888;font-size:12px;margin-top:4px">${lang === 'ko' ? '다른 답변 처리 중... 대기열에 추가됨' : 'Waiting for other response to finish...'}</div>
      </div>`;
    container.appendChild(queueRow);
  }

  container.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
  scrollToBottom();
}

function getWelcomeBubble(id) {
  const pName = document.getElementById('projectName').textContent || 'your project';
  const en = {
    einstein: `Hi, I'm the Einstein agent. I've been studying the **${pName}** project. Ask me about concepts, architecture, or how anything works — I'll break it down from first principles for you.`,
    shakespeare: `Greetings! I'm the Shakespeare agent. I've read through the **${pName}** codebase. Share any code with me and I'll analyze its flow, structure, and drama with narrative and flowcharts.`,
    socrates: `Hello, I'm the Socrates agent. I'm standing by on the **${pName}** project. Got an error, bug, or stack trace? I'll trace it to its root cause through systematic investigation.`,
    stevejobs: `Hey. I'm the Steve Jobs agent. I've looked at **${pName}** closely. Tell me what you're building or where you're stuck — I'll give you bold, honest direction on what matters most.`,
    sayno: `Hi, I'm the SayNo (세이노) agent — your business gateway. I've analyzed **${pName}** from a business perspective. Ask me about monetization, revenue models, P&L projections, or market sizing — I'll give you the numbers that matter.`,
    finance: `Hello, I'm the Finance PM. I specialize in investment strategy, fundraising, and financial modeling for **${pName}**. Ask me about valuation, cap tables, runway, or funding strategy.`,
    growth: `Hi, I'm the Growth PM. I focus on user acquisition, retention, and scaling strategies for **${pName}**. Ask me about funnels, CAC, viral loops, or marketing channels.`,
    legal: `Hello, I'm the Legal Advisor. I provide business law guidance for **${pName}**. Ask about entity formation, contracts, IP, or regulatory compliance.`,
    fashion: `Hi, I'm the Fashion PM. I specialize in fashion business strategy. Ask me about brand positioning, seasonal planning, margin structures, or retail strategy for **${pName}**.`,
    logistics: `Hello, I'm the Logistics Manager. I handle supply chain and operations analysis. Ask about fulfillment, inventory, delivery strategy, or cost optimization for **${pName}**.`,
    fnb: `Hi, I'm the F&B PM. I specialize in food & beverage business. Ask about food costs, kitchen ops, delivery platform strategy, or menu engineering for **${pName}**.`,
    saas: `Hello, I'm the SaaS PM. I focus on software business metrics. Ask about MRR, churn, pricing tiers, PLG strategy, or ARR growth modeling for **${pName}**.`,
    ecommerce: `Hi, I'm the E-commerce PM. I specialize in online retail strategy. Ask about conversion funnels, AOV optimization, platform selection, or marketplace strategy for **${pName}**.`,
    realestate: `Hello, I'm the Real Estate PM. I handle property investment and PropTech analysis. Ask about cap rates, rental yields, market cycles, or PropTech business models for **${pName}**.`,
    healthcare: `Hi, I'm the Healthcare PM. I specialize in HealthTech and digital health strategy. Ask about regulatory pathways, reimbursement models, or clinical validation for **${pName}**.`,
    content: `Hello, I'm the Content PM. I focus on media and creator economy strategy. Ask about content monetization, audience growth, platform strategy, or creator economics for **${pName}**.`,
    hr: `Hi, I'm the HR PM. I specialize in people operations and hiring. Ask about compensation benchmarks, hiring funnels, org design, or headcount planning for **${pName}**.`,
    education: `Hello, I'm the Education PM. I focus on EdTech and learning business. Ask about course economics, institutional sales, learner engagement, or EdTech models for **${pName}**.`,
    travel: `Hi, I'm the Travel PM. I specialize in tourism and hospitality. Ask about revenue management, OTA strategy, seasonal pricing, or travel platform economics for **${pName}**.`,
    'jvm-developer': `Hi, I'm the JVM Developer agent. I've analyzed **${pName}** for JVM performance. Ask me about GC tuning, JIT compilation, memory management, concurrency, or virtual threads — I'll profile first and optimize with data.`,
    'python-developer': `Hi, I'm the Python Developer agent. I've studied **${pName}** for Python performance. Ask me about GIL management, asyncio, vectorization, Cython, or profiling — I'll show you where the bottleneck really is.`,
    'go-developer': `Hi, I'm the Go Developer agent. I've reviewed **${pName}** for Go performance. Ask me about goroutines, channels, escape analysis, GC tuning, or pprof — I'll help you write Go that's fast and idiomatic.`,
    'rust-developer': `Hi, I'm the Rust Developer agent. I've examined **${pName}** for Rust performance. Ask me about ownership patterns, zero-cost abstractions, unsafe boundaries, or LLVM optimizations — I'll benchmark everything with criterion.`,
    'node-developer': `Hi, I'm the Node.js Developer agent. I've inspected **${pName}** for Node.js performance. Ask me about event loop optimization, V8 internals, Worker threads, streaming, or bundling — I'll keep your event loop free.`,
    'swift-developer': `Hi, I'm the Swift Developer agent. I've analyzed **${pName}** for Swift performance. Ask me about ARC optimization, value types, Instruments profiling, or Swift concurrency — I'll show you what the compiler really does.`,
    'cpp-developer': `Hi, I'm the C/C++ Developer agent. I've reviewed **${pName}** for C/C++ performance. Ask me about memory management, cache optimization, SIMD, RAII patterns, or compiler flags — I'll measure at the hardware level.`,
    'aws-architect': `Hi, I'm the AWS Architect agent. I've analyzed **${pName}** for cloud architecture. Ask me about service selection, cost optimization, Well-Architected review, or migration strategy — every recommendation comes with a cost estimate.`,
    'k8s-developer': `Hi, I'm the K8s Developer agent. I've reviewed **${pName}** for Kubernetes orchestration. Ask me about workload configuration, scaling, networking, troubleshooting, or production hardening — I'll show you the YAML.`,
    'iac-developer': `Hi, I'm the IaC Developer agent. I've analyzed **${pName}** for infrastructure as code. Ask me about Terraform modules, state management, CI/CD integration, or migration strategy — I'll manage the blast radius.`,
    'observability-developer': `Hi, I'm the Observability Engineer agent. I've reviewed **${pName}** for monitoring and tracing. Ask me about SLOs, Prometheus, OpenTelemetry, alerting, or dashboards — I'll make every signal actionable.`,
    'cicd-developer': `Hi, I'm the CI/CD Engineer agent. I've analyzed **${pName}** for pipeline optimization. Ask me about GitHub Actions, ArgoCD, deployment strategies, or build caching — I'll get your pipeline under 5 minutes.`,
    'docker-developer': `Hi, I'm the Docker Developer agent. I've reviewed **${pName}** for container optimization. Ask me about multi-stage builds, image size reduction, security hardening, or BuildKit features — I'll get your image under 100MB.`,
    'system-designer': `Hi, I'm the System Designer agent. I've studied **${pName}** for architecture. Ask me about distributed system design, data partitioning, scaling patterns, or capacity planning — I'll start with back-of-envelope math.`,
    'performance-detective': `Hi, I'm the Performance Detective agent. I'm investigating **${pName}** for performance issues. Got slow queries, latency spikes, or resource contention? I'll follow the trace to the root cause.`,
    'sre-engineer': `Hi, I'm the SRE Engineer agent. I've assessed **${pName}** for reliability. Ask me about zero-downtime deployments, high availability, SLO/error budgets, or incident response — I'll quantify every risk.`,
    group: `Welcome to the Dev Team Chat for **${pName}**! Einstein, Shakespeare, Socrates, and Steve Jobs will discuss your question together.`,
    'biz-group': `Welcome to the Biz Team Chat for **${pName}**! Your active business agents will discuss your question together and synthesize strategic insights.`,
  };
  const ko = {
    einstein: `안녕하세요, 아인슈타인 에이전트입니다. **${pName}** 프로젝트를 분석 완료했습니다. 개념, 아키텍처, 동작 원리에 대해 질문해주세요 — 기초 원리부터 명쾌하게 설명해드리겠습니다.`,
    shakespeare: `반갑습니다! 셰익스피어 에이전트입니다. **${pName}** 코드베이스를 파악하고 있습니다. 코드를 보여주시면 흐름과 구조를 이야기와 플로차트로 분석해드릴게요.`,
    socrates: `안녕하세요, 소크라테스 에이전트입니다. **${pName}** 프로젝트에 대기 중입니다. 에러, 버그, 스택 트레이스가 있으신가요? 근본 원인까지 체계적으로 추적해드리겠습니다.`,
    stevejobs: `안녕하세요. 스티브 잡스 에이전트입니다. **${pName}** 프로젝트를 살펴봤습니다. 지금 만들고 있는 것이나 고민을 말씀해주세요 — 정말 중요한 것이 무엇인지 방향을 제시해드리겠습니다.`,
    sayno: `안녕하세요, 세이노 에이전트입니다 — 사업 에이전트의 게이트웨이입니다. **${pName}** 프로젝트를 사업적 관점에서 분석했습니다. 수익화 모델, 매출 예측, 손익 계산, 시장 규모 등 숫자로 증명하는 전략을 제시해드리겠습니다.`,
    finance: `안녕하세요, 파이낸스 PM입니다. **${pName}** 프로젝트의 투자 전략, 자금 조달, 재무 모델링을 담당합니다. 밸류에이션, 캡테이블, 런웨이, 펀딩 전략을 물어보세요.`,
    growth: `안녕하세요, 그로스 PM입니다. **${pName}** 프로젝트의 유저 획득, 리텐션, 스케일링 전략을 담당합니다. 퍼널, CAC, 바이럴 루프, 마케팅 채널을 물어보세요.`,
    legal: `안녕하세요, 법률 어드바이저입니다. **${pName}** 프로젝트의 사업 법률 가이드를 제공합니다. 법인 설립, 계약, 지식재산권, 규제 준수에 대해 물어보세요.`,
    fashion: `안녕하세요, 패션 PM입니다. 패션 사업 전략 전문입니다. **${pName}**의 브랜드 포지셔닝, 시즌 기획, 마진 구조, 유통 전략을 물어보세요.`,
    logistics: `안녕하세요, 물류 매니저입니다. 공급망과 운영 분석을 담당합니다. **${pName}**의 풀필먼트, 재고, 배송 전략, 비용 최적화를 물어보세요.`,
    fnb: `안녕하세요, F&B PM입니다. 요식업 사업 전문입니다. **${pName}**의 원가율, 주방 운영, 배달 플랫폼 전략, 메뉴 엔지니어링을 물어보세요.`,
    saas: `안녕하세요, SaaS PM입니다. 소프트웨어 비즈니스 지표 전문입니다. **${pName}**의 MRR, 이탈률, 가격 정책, PLG 전략, ARR 성장 모델링을 물어보세요.`,
    ecommerce: `안녕하세요, 이커머스 PM입니다. 온라인 유통 전략 전문입니다. **${pName}**의 전환율, 객단가, 플랫폼 선택, 마켓플레이스 전략을 물어보세요.`,
    realestate: `안녕하세요, 부동산 PM입니다. 부동산 투자 및 프롭테크 분석 전문입니다. **${pName}**의 수익률, 임대 수익, 시장 사이클, 프롭테크 모델을 물어보세요.`,
    healthcare: `안녕하세요, 헬스케어 PM입니다. 디지털 헬스 전략 전문입니다. **${pName}**의 인허가, 수가 체계, 임상 검증에 대해 물어보세요.`,
    content: `안녕하세요, 콘텐츠 PM입니다. 미디어 및 크리에이터 이코노미 전문입니다. **${pName}**의 콘텐츠 수익화, 오디언스 성장, 플랫폼 전략을 물어보세요.`,
    hr: `안녕하세요, HR PM입니다. 인사 운영 및 채용 전략 전문입니다. **${pName}**의 연봉 벤치마크, 채용 퍼널, 조직 설계, 인력 계획을 물어보세요.`,
    education: `안녕하세요, 교육 PM입니다. 에듀테크 및 러닝 비즈니스 전문입니다. **${pName}**의 강의 수익 모델, 학습자 확보, 기관 영업에 대해 물어보세요.`,
    travel: `안녕하세요, 여행 PM입니다. 관광 및 숙박업 전문입니다. **${pName}**의 레비뉴 매니지먼트, OTA 전략, 시즌별 가격 정책을 물어보세요.`,
    'jvm-developer': `안녕하세요, JVM 개발자 에이전트입니다. **${pName}** 프로젝트의 JVM 성능을 분석했습니다. GC 튜닝, JIT 컴파일, 메모리 관리, 동시성, 가상 스레드에 대해 물어보세요.`,
    'python-developer': `안녕하세요, Python 개발자 에이전트입니다. **${pName}** 프로젝트의 Python 성능을 분석했습니다. GIL, asyncio, 벡터화, Cython, 프로파일링에 대해 물어보세요.`,
    'go-developer': `안녕하세요, Go 개발자 에이전트입니다. **${pName}** 프로젝트의 Go 성능을 분석했습니다. 고루틴, 채널, 이스케이프 분석, GC 튜닝, pprof에 대해 물어보세요.`,
    'rust-developer': `안녕하세요, Rust 개발자 에이전트입니다. **${pName}** 프로젝트의 Rust 성능을 분석했습니다. 소유권, 라이프타임, 제로코스트 추상화, unsafe에 대해 물어보세요.`,
    'node-developer': `안녕하세요, Node.js 개발자 에이전트입니다. **${pName}** 프로젝트의 Node.js 성능을 분석했습니다. 이벤트 루프, V8, Worker 스레드, 번들링에 대해 물어보세요.`,
    'swift-developer': `안녕하세요, Swift 개발자 에이전트입니다. **${pName}** 프로젝트의 Swift 성능을 분석했습니다. ARC, 값 타입, Instruments, Swift 동시성에 대해 물어보세요.`,
    'cpp-developer': `안녕하세요, C/C++ 개발자 에이전트입니다. **${pName}** 프로젝트의 C/C++ 성능을 분석했습니다. 메모리 관리, 캐시 최적화, SIMD, 컴파일러 옵션에 대해 물어보세요.`,
    'aws-architect': `안녕하세요, AWS 아키텍트 에이전트입니다. **${pName}** 프로젝트의 클라우드 아키텍처를 분석했습니다. 서비스 선택, 비용 최적화, Well-Architected 리뷰, 마이그레이션 전략에 대해 물어보세요.`,
    'k8s-developer': `안녕하세요, K8s 개발자 에이전트입니다. **${pName}** 프로젝트의 쿠버네티스 오케스트레이션을 분석했습니다. 워크로드 설정, 스케일링, 네트워킹, 트러블슈팅에 대해 물어보세요.`,
    'iac-developer': `안녕하세요, IaC 개발자 에이전트입니다. **${pName}** 프로젝트의 인프라 코드를 분석했습니다. Terraform 모듈, 상태 관리, CI/CD 통합, 마이그레이션에 대해 물어보세요.`,
    'observability-developer': `안녕하세요, 옵저버빌리티 엔지니어 에이전트입니다. **${pName}** 프로젝트의 모니터링을 분석했습니다. SLO, Prometheus, OpenTelemetry, 알림, 대시보드에 대해 물어보세요.`,
    'cicd-developer': `안녕하세요, CI/CD 엔지니어 에이전트입니다. **${pName}** 프로젝트의 파이프라인을 분석했습니다. GitHub Actions, ArgoCD, 배포 전략, 빌드 캐싱에 대해 물어보세요.`,
    'docker-developer': `안녕하세요, Docker 개발자 에이전트입니다. **${pName}** 프로젝트의 컨테이너를 분석했습니다. 멀티스테이지 빌드, 이미지 최적화, 보안 강화, BuildKit에 대해 물어보세요.`,
    'system-designer': `안녕하세요, 시스템 디자이너 에이전트입니다. **${pName}** 프로젝트의 아키텍처를 분석했습니다. 대규모 시스템 설계, 데이터 파티셔닝, 스케일링 패턴, 용량 계획에 대해 물어보세요.`,
    'performance-detective': `안녕하세요, 성능 탐정 에이전트입니다. **${pName}** 프로젝트의 성능을 조사 중입니다. 슬로우 쿼리, 레이턴시 스파이크, 리소스 경합이 있으면 근본 원인을 추적해드리겠습니다.`,
    'sre-engineer': `안녕하세요, SRE 엔지니어 에이전트입니다. **${pName}** 프로젝트의 안정성을 평가했습니다. 무중단 배포, 고가용성, SLO/에러 버짓, 인시던트 대응에 대해 물어보세요.`,
    group: `**${pName}** 개발 단톡방에 오신 걸 환영합니다! 아인슈타인, 셰익스피어, 소크라테스, 스티브 잡스가 함께 질문에 답하고 의견을 종합해드립니다.`,
    'biz-group': `**${pName}** 사업 단톡방에 오신 걸 환영합니다! 활성화된 사업 에이전트들이 함께 전략적 인사이트를 종합해드립니다.`,
  };
  const texts = lang === 'ko' ? ko : en;
  return texts[id] || texts.einstein;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

function scrollToBottom() {
  const c = document.getElementById('messages');
  requestAnimationFrame(() => { c.scrollTop = c.scrollHeight; });
}

// ── Send (Queue-based) ───────────────
const messageQueue = [];
let processingChat = null; // which chat is currently being processed

async function sendMessage() {
  if (!activeChat) return;
  const input = document.getElementById('input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  autoResize(input);

  const targetChat = activeChat;
  const history = chatHistories[targetChat];
  history.push({ role: 'user', content: text });
  saveChatHistories();
  renderMessages();

  // If already processing another chat, queue this request
  if (processingChat !== null) {
    messageQueue.push({ chatId: targetChat, lang, provider, mode: chatMode });
    // Show queue indicator if viewing this chat
    if (activeChat === targetChat) {
      const container = document.getElementById('messages');
      const queueEl = document.createElement('div');
      queueEl.className = 'message-row assistant queue-indicator';
      queueEl.setAttribute('data-queue-chat', targetChat);
      const qp = personas.find(x => x.id === targetChat);
      const qAvStyle = `class="avatar sm" style="background:${qp?.color||'#666'}"`;
      const qAvText = qp?.initial || '?';
      queueEl.innerHTML = `<div ${qAvStyle}>${qAvText}</div>
        <div class="bubble" style="color:#888;font-style:italic">${lang === 'ko' ? '다른 답변 처리 중... 대기열에 추가됨' : 'Waiting for other response to finish...'}</div>`;
      container.appendChild(queueEl);
      scrollToBottom();
    }
    return;
  }

  processChat(targetChat, lang, provider, chatMode);
}

async function processChat(targetChat, chatLang, chatProvider, chatModeVal) {
  processingChat = targetChat;
  const history = chatHistories[targetChat];
  const isGroupChat = targetChat === 'group' || targetChat === 'biz-group';
  const p = isGroupChat ? null : personas.find(x => x.id === targetChat);

  // Only show typing indicator if viewing this chat
  let typingEl = null;
  if (activeChat === targetChat) {
    const container = document.getElementById('messages');
    typingEl = document.createElement('div');
    typingEl.className = 'message-row assistant';
    const avStyle = targetChat === 'biz-group'
      ? 'class="avatar sm biz-group-av"'
      : targetChat === 'group'
      ? 'class="avatar sm group-av"'
      : `class="avatar sm" style="background:${p?.color||'#666'}"`;
    const avText = targetChat === 'biz-group' ? 'Biz' : targetChat === 'group' ? 'All' : (p?.initial || '?');
    typingEl.innerHTML = `<div ${avStyle}>${avText}</div>
      <div class="bubble">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
        <div class="thinking-status" id="thinkingStatus"></div>
      </div>`;
    container.appendChild(typingEl);
    scrollToBottom();
  }

  isStreaming = true;
  if (activeChat === targetChat) {
    document.getElementById('headerStatus').textContent = t('typing');
  }

  if (chatProvider === 'local' && activeChat === targetChat) {
    const statusEl = document.getElementById('thinkingStatus');
    if (statusEl) statusEl.textContent = chatLang === 'ko' ? 'Claude Code 연결 중...' : 'Connecting to Claude Code...';
  }

  const isBizGroup = targetChat === 'biz-group';
  const isDevGroup = targetChat === 'group';
  const endpoint = isBizGroup ? '/api/chat/biz-group' : isDevGroup ? '/api/chat/group' : '/api/chat';
  let body;
  if (isBizGroup) {
    body = { messages: history.map(m => ({ role: m.role, content: m.content })), lang: chatLang, provider: chatProvider, activeIds: getActiveBizIds(), mode: chatModeVal };
  } else if (isDevGroup) {
    body = { messages: history.map(m => ({ role: m.role, content: m.content })), lang: chatLang, provider: chatProvider, mode: chatModeVal };
  } else {
    body = { personaId: targetChat, messages: history.map(m => ({ role: m.role, content: m.content })), lang: chatLang, provider: chatProvider, mode: chatModeVal };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify(body),
    });

    if (response.status === 500 && chatProvider !== 'local') {
      const errText = await response.text();
      if (errText.includes('API_KEY')) {
        if (typingEl) typingEl.remove();
        history.pop();
        showApiKeyModal();
        isStreaming = false;
        processingChat = null;
        return;
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';
    let buffer = '';
    let bubbleReady = false;
    let usageData = null;

    const avStyle = targetChat === 'biz-group'
      ? 'class="avatar sm biz-group-av"'
      : targetChat === 'group'
      ? 'class="avatar sm group-av"'
      : `class="avatar sm" style="background:${p?.color||'#666'}"`;
    const avText = targetChat === 'biz-group' ? 'Biz' : targetChat === 'group' ? 'All' : (p?.initial || '?');

    // For non-local providers, swap typing indicator for streaming bubble immediately
    history.push({ role: 'assistant', content: '' });
    if (chatProvider !== 'local' && activeChat === targetChat) {
      if (typingEl) typingEl.remove();
      bubbleReady = true;
      const msgRow = document.createElement('div');
      msgRow.className = 'message-row assistant';
      msgRow.innerHTML = `<div ${avStyle}>${avText}</div>
        <div class="bubble" id="streaming-bubble"></div>`;
      container.appendChild(msgRow);
    }

    function updateStreamingUsage(usage, estimatedOut) {
      const bubble = document.getElementById('streaming-bubble');
      if (!bubble) return;
      let el = document.getElementById('streaming-usage');
      if (!el) {
        el = document.createElement('div');
        el.id = 'streaming-usage';
        el.className = 'token-usage streaming';
        bubble.after(el);
      }
      const inp = usage?.input_tokens || usage?.input || 0;
      const out = usage?.output_tokens || usage?.output || estimatedOut || 0;
      const maxTokens = 4096;
      const pct = Math.min(100, Math.round((out / maxTokens) * 100));
      const label = inp ? `${inp.toLocaleString()} in · ${out.toLocaleString()} out` : `~${out.toLocaleString()} tokens`;
      el.innerHTML = `<span class="usage-text">${label}</span>`
        + `<div class="usage-bar-wrap"><div class="usage-bar" style="width:${pct}%"></div></div>`;
    }

    function ensureBubble() {
      if (bubbleReady || activeChat !== targetChat) return;
      if (typingEl) typingEl.remove();
      bubbleReady = true;
      const msgRow = document.createElement('div');
      msgRow.className = 'message-row assistant';
      msgRow.innerHTML = `<div ${avStyle}>${avText}</div>
        <div class="bubble" id="streaming-bubble"></div>`;
      container.appendChild(msgRow);
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.responseId) {
            // Server sent response ID for resume capability
            sessionStorage.setItem('savant-active-response', JSON.stringify({
              id: parsed.responseId, chat: targetChat
            }));
          } else if (parsed.status !== undefined) {
            // Server-sent status update (local provider thinking phase)
            const statusEl = document.getElementById('thinkingStatus');
            if (statusEl) {
              if (parsed.status === '') {
                statusEl.textContent = '';
              } else {
                const statusI18n = {
                  'Connecting to Claude Code...': { ko: 'Claude Code 연결 중...' },
                  'Initializing Claude Code...': { ko: 'Claude Code 초기화 중...' },
                  'Analyzing your question...': { ko: '질문 분석 중...' },
                  'Generating response...': { ko: '답변 생성 중...' },
                  'Deep thinking...': { ko: '깊이 생각하는 중...' },
                  'Almost there...': { ko: '거의 다 됐어요...' },
                };
                const translated = chatLang === 'ko' && statusI18n[parsed.status]?.ko
                  ? statusI18n[parsed.status].ko : parsed.status;
                statusEl.style.opacity = '0';
                setTimeout(() => { statusEl.textContent = translated; statusEl.style.opacity = '1'; }, 200);
              }
            }
          } else if (parsed.error) {
            ensureBubble();
            assistantText += `\n\n**Error**: ${parsed.error}`;
          } else if (parsed.usage) {
            usageData = { ...usageData, ...parsed.usage };
            updateStreamingUsage(usageData, null);
          } else if (parsed.text) {
            ensureBubble();
            assistantText += parsed.text;
            // Estimate ~1 token per 4 chars, update progress bar in real-time
            const estTokens = Math.round(assistantText.length / 4);
            updateStreamingUsage(usageData, estTokens);
          }
        } catch {}
      }

      // Update history in real-time so chat switching preserves progress
      history[history.length - 1].content = assistantText;
      // Periodically save to localStorage so refresh preserves partial responses
      if (assistantText.length % 200 < 50) saveChatHistories();

      const bubble = document.getElementById('streaming-bubble');
      if (bubble && activeChat === targetChat) {
        bubble.innerHTML = marked.parse(assistantText, { breaks: true });
        bubble.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
        scrollToBottom();
      }
    }

    // Show final token usage below the response
    if (usageData && activeChat === targetChat) {
      const bubble = document.getElementById('streaming-bubble');
      if (bubble) {
        // Remove streaming usage if exists
        const existing = document.getElementById('streaming-usage');
        if (existing) existing.remove();
        const inp = usageData.input_tokens || usageData.input || 0;
        const out = usageData.output_tokens || usageData.output || 0;
        const maxTokens = 4096;
        const pct = Math.min(100, Math.round((out / maxTokens) * 100));
        const usageEl = document.createElement('div');
        usageEl.className = 'token-usage';
        usageEl.innerHTML = `<span class="usage-text">${inp.toLocaleString()} in · ${out.toLocaleString()} out</span>`
          + `<div class="usage-bar-wrap"><div class="usage-bar" style="width:${pct}%"></div></div>`;
        bubble.after(usageEl);
      }
    }

    history[history.length - 1].content = assistantText;
    saveChatHistories();
    sessionStorage.removeItem('savant-active-response');
  } catch (err) {
    if (typingEl) typingEl.remove();
    // Don't save transient network errors (e.g. page refresh during streaming)
    const isNetworkError = /network|abort|fetch|failed to fetch/i.test(err.message || '');
    if (!isNetworkError) {
      history.push({ role: 'assistant', content: `**Error**: ${err.message}` });
      saveChatHistories();
    }
    if (activeChat === targetChat) renderMessages();
  } finally {
    isStreaming = false;
    processingChat = null;
    if (activeChat === targetChat) {
      const sp = personas.find(x => x.id === activeChat);
      const statusText = activeChat === 'biz-group' ? t('bizGroupTitle') : activeChat === 'group' ? t('groupTitle') : (lang === 'ko' ? sp?.titleKo : sp?.title);
      document.getElementById('headerStatus').textContent = statusText || '';
    }
    // If user switched to the completed chat, re-render to show the response
    if (activeChat === targetChat) renderMessages();
    // Process next in queue
    if (messageQueue.length > 0) {
      const next = messageQueue.shift();
      // Remove queue indicator
      document.querySelectorAll(`.queue-indicator[data-queue-chat="${next.chatId}"]`).forEach(el => el.remove());
      processChat(next.chatId, next.lang, next.provider, next.mode);
    }
  }
}

// ── API Key ──────────────────────────
function showApiKeyModal() {
  const name = providerNames[provider] || provider;
  const envKey = providerKeyNames[provider] || 'API_KEY';
  const link = providerKeyLinks[provider] || '#';
  document.getElementById('modalTitle').textContent =
    lang === 'ko' ? `${name} API 키 설정` : `${name} API Key`;
  document.getElementById('modalDesc').textContent =
    lang === 'ko' ? `${name}와 대화하려면 API 키가 필요합니다.` : `You need a ${name} API key to chat.`;
  document.getElementById('modalGetKey').textContent =
    lang === 'ko' ? `${name} 키 발급` : `Get ${name} Key`;
  document.getElementById('modalGetKey').closest('a').href = link;
  document.getElementById('modalHint').innerHTML =
    `${lang === 'ko' ? '터미널에서 설정:' : 'Or set in terminal:'} <code>export ${envKey}=...</code>`;
  document.getElementById('apiKeyInput').placeholder = provider === 'anthropic' ? 'sk-ant-...' : provider === 'openai' ? 'sk-...' : 'AI...';
  document.getElementById('apiKeyModal').classList.remove('hidden');
  document.getElementById('apiKeyInput').value = apiKey;
  document.getElementById('apiKeyInput').focus();
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (val) {
    apiKey = val;
    localStorage.setItem(`savant-api-key-${provider}`, val);
  }
  document.getElementById('apiKeyModal').classList.add('hidden');
}

// ── Helpers ──────────────────────────
// ── Inline Persona Name Edit ─────────
function editPersonaName(id, el) {
  const original = el.textContent;
  el.contentEditable = 'true';
  el.style.background = '#fff';
  el.style.borderRadius = '3px';
  el.style.padding = '0 4px';
  el.style.outline = '1px solid #0984E3';
  el.focus();

  // Select all text
  const range = document.createRange();
  range.selectNodeContents(el);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  function save() {
    el.contentEditable = 'false';
    el.style.background = '';
    el.style.padding = '';
    el.style.outline = '';
    const newName = el.textContent.trim();
    if (!newName || newName === original) {
      el.textContent = original;
      return;
    }

    const field = lang === 'ko' ? 'nameKo' : 'name';
    fetch(`/api/persona/${id}/meta`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newName }),
    }).then(r => r.json()).then(data => {
      if (data.ok) {
        // Update local personas array
        const p = personas.find(x => x.id === id);
        if (p) {
          if (lang === 'ko') p.nameKo = newName;
          else p.name = newName;
        }
        // Update header if this is active chat
        if (activeChat === id) {
          document.getElementById('headerName').textContent = newName;
        }
      }
    }).catch(() => { el.textContent = original; });
  }

  el.addEventListener('blur', save, { once: true });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') { el.textContent = original; el.blur(); }
  });
}

function clearChat() {
  if (activeChat) {
    chatHistories[activeChat] = [];
    saveChatHistories();
    renderMessages();
    document.getElementById('input').focus();
  }
}

function setChatMode(mode) {
  chatMode = mode;
  localStorage.setItem('savant-chat-mode', mode);
  document.getElementById('modeFast').className = mode === 'fast' ? 'active' : '';
  document.getElementById('modeDeep').className = mode === 'deep' ? 'active' : '';
  applyLang();
}

function clearCurrentChat() {
  if (!activeChat) return;
  if (processingChat === activeChat) {
    alert(lang === 'ko' ? '답변 처리 중에는 삭제할 수 없습니다.' : 'Cannot clear while response is in progress.');
    return;
  }
  const msg = lang === 'ko' ? '이 대화 내역을 삭제하시겠습니까?' : 'Clear this chat?';
  if (!confirm(msg)) return;
  chatHistories[activeChat] = [];
  saveChatHistories();
  renderMessages();
}

function downloadChat() {
  const history = chatHistories[activeChat] || [];
  if (history.length === 0) return;

  const pName = document.getElementById('projectName').textContent || 'project';
  const chatName = activeChat === 'group' ? 'team-chat' : activeChat;
  const lines = [`# Savant Chat — ${pName} / ${chatName}\n`];
  for (const msg of history) {
    const role = msg.role === 'user' ? 'You' : chatName;
    lines.push(`## ${role}\n\n${msg.content}\n`);
  }
  const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `savant-chat-${chatName}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ── Context Panel Resize ─────────
(function initResize() {
  const handle = document.getElementById('resizeHandle');
  const panel = document.getElementById('contextPanel');
  let startX = 0, startW = 0;

  handle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startW = panel.offsetWidth;
    panel.classList.add('dragging');
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onStop);
    e.preventDefault();
  });

  function onDrag(e) {
    const diff = startX - e.clientX;
    const newW = Math.max(280, Math.min(window.innerWidth * 0.9, startW + diff));
    panel.style.width = newW + 'px';
  }
  function onStop() {
    panel.classList.remove('dragging');
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onStop);
  }
})();

// ── Context Panel ────────────────
let contextLoaded = false;
let contextRaw = '';
let contextTranslated = '';
let contextShowingKo = false;

async function translateContext() {
  if (!contextRaw) return;

  // Toggle between original and translated
  if (contextShowingKo && contextTranslated) {
    // Switch back to original
    contextShowingKo = false;
    renderContextBody(contextRaw);
    document.getElementById('translateBtn').textContent = 'KO';
    return;
  }

  if (contextTranslated) {
    // Show cached translation
    contextShowingKo = true;
    renderContextBody(contextTranslated);
    document.getElementById('translateBtn').textContent = 'EN';
    return;
  }

  // Request translation
  document.getElementById('translateBtn').textContent = '...';
  document.getElementById('translateBtn').disabled = true;

  try {
    const res = await fetch('/api/project/context/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify({ provider }),
    });
    const { translated } = await res.json();
    contextTranslated = translated;
    contextShowingKo = true;
    renderContextBody(translated);
    document.getElementById('translateBtn').textContent = 'EN';
  } catch (err) {
    document.getElementById('translateBtn').textContent = 'KO';
    alert(lang === 'ko' ? '번역 실패: API 키를 확인해주세요.' : 'Translation failed. Check your API key.');
  }
  document.getElementById('translateBtn').disabled = false;
}

function renderContextBody(content) {
  const sizeKb = (new TextEncoder().encode(content).length / 1024).toFixed(1);
  const label = contextShowingKo ? '컨텍스트 크기' : 'Context size';
  document.getElementById('contextBody').innerHTML =
    `<div class="context-stat">${label}: ${sizeKb}KB</div>` +
    marked.parse(content, { breaks: true });
  document.getElementById('contextBody').querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
}

async function openContext() {
  document.getElementById('contextOverlay').classList.add('show');
  document.getElementById('contextPanel').classList.add('show');
  document.getElementById('contextTitle').textContent =
    lang === 'ko' ? 'AI가 이해하고 있는 프로젝트 정보' : 'Project Context (AI Knowledge)';

  if (!contextLoaded) {
    try {
      const res = await fetch('/api/project/context');
      const { context } = await res.json();
      contextRaw = context;
      contextShowingKo = false;
      renderContextBody(context);
      document.getElementById('translateBtn').textContent = 'KO';
      contextLoaded = true;
    } catch {
      document.getElementById('contextBody').innerHTML = '<p>Failed to load context.</p>';
    }
  }
}

function closeContext() {
  document.getElementById('contextOverlay').classList.remove('show');
  document.getElementById('contextPanel').classList.remove('show');
}

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
    return hljs.highlightAuto(code).value;
  },
  gfm: true, breaks: true,
});

init();
