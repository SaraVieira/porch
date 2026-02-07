const content = document.getElementById('content')

async function init() {
  const { apiUrl } = await chrome.storage.sync.get('apiUrl')

  if (!apiUrl) {
    content.innerHTML = `
      <div class="configure">
        <p>Configure your Homepage URL in settings first.</p>
        <button class="btn-settings" id="open-settings">Open Settings</button>
      </div>
    `
    document.getElementById('open-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })
    return
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  content.innerHTML = `
    <div class="tab-info">
      <div class="tab-title">${escapeHtml(tab.title || 'Untitled')}</div>
      <div class="tab-url">${escapeHtml(tab.url || '')}</div>
    </div>
    <button class="btn-save" id="save-btn">Save Bookmark</button>
    <div id="status"></div>
    <button class="btn-settings" id="open-settings">Settings</button>
  `

  document.getElementById('save-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-btn')
    const status = document.getElementById('status')

    btn.disabled = true
    btn.textContent = 'Saving...'

    try {
      const res = await fetch(`${apiUrl}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      status.className = 'status status-success'
      status.textContent = 'Bookmark saved!'
      btn.textContent = 'Saved!'

      setTimeout(() => window.close(), 1200)
    } catch (err) {
      status.className = 'status status-error'
      status.textContent = `Failed: ${err.message}`
      btn.disabled = false
      btn.textContent = 'Save Bookmark'
    }
  })

  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

init()
