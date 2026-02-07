const urlInput = document.getElementById('api-url')
const saveBtn = document.getElementById('save-btn')
const status = document.getElementById('status')

// Load saved URL
chrome.storage.sync.get('apiUrl', ({ apiUrl }) => {
  if (apiUrl) urlInput.value = apiUrl
})

saveBtn.addEventListener('click', () => {
  let url = urlInput.value.trim()
  // Strip trailing slash
  url = url.replace(/\/+$/, '')

  if (!url) {
    status.textContent = 'Please enter a URL'
    status.style.color = '#f87171'
    return
  }

  chrome.storage.sync.set({ apiUrl: url }, () => {
    status.textContent = 'Saved!'
    status.style.color = '#4ade80'
    setTimeout(() => { status.textContent = '' }, 2000)
  })
})
