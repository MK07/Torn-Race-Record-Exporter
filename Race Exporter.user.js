// ==UserScript==
// @name         Torn Racing Record Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      2.3
// @description  Uploads racing records to Google Sheets for ranking (private community use).
// @author       MK07
// @match        https://www.torn.com/page.php?sid=racing
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @connect      googleusercontent.com
// ==/UserScript==

(function () {
  'use strict';

  const encodedUrl = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6QS1hWFNFTTU2QVB0Z0JURzRRTFYxZDNibVlqbXZDazlNQktpRHRqU2JGZWVPc3I1aGh2MXNJZXdRX1VxVjJScE0vZXhlYw==';
  const webAppUrl = atob(encodedUrl);

  function getOrPrompt(key, message) {
    let val = localStorage.getItem(key);
    if (!val) {
      val = prompt(message);
      if (val) localStorage.setItem(key, val);
    }
    return val;
  }

  const unameKey = 'splent';
  const apiKeyKey = 'vroom';
  const authKeyKey = 'Love';

  let username = getOrPrompt(unameKey, 'Enter your username:');
  let apiKey = getOrPrompt(apiKeyKey, 'Enter your Minimal Access API key:');
  let authKey = getOrPrompt(authKeyKey, 'Enter your access code:');

  // --- Upload Button ---
  const uploadBtn = document.createElement('button');
  uploadBtn.textContent = '📤 Upload Racing Records';
  Object.assign(uploadBtn.style, {
    position: 'fixed',
    top: '20px',
    right: '60px',
    zIndex: 9999,
    padding: '10px 16px',
    backgroundColor: '#008cba',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  });
  document.body.appendChild(uploadBtn);

  // --- Settings Gear Icon ---
  const gearBtn = document.createElement('div');
  gearBtn.textContent = '⚙️';
  Object.assign(gearBtn.style, {
    position: 'fixed',
    top: '24px',
    right: '20px',
    fontSize: '18px',
    cursor: 'pointer',
    zIndex: 9999
  });
  document.body.appendChild(gearBtn);

  gearBtn.onclick = () => {
    const newUsername = prompt('Update username:', localStorage.getItem(unameKey) || '');
    const newKey = prompt('Update API key:', localStorage.getItem(apiKeyKey) || '');
    const newAuth = prompt('Update access code:', localStorage.getItem(authKeyKey) || '');

    if (newUsername) localStorage.setItem(unameKey, newUsername);
    if (newKey) localStorage.setItem(apiKeyKey, newKey);
    if (newAuth) localStorage.setItem(authKeyKey, newAuth);

    alert('✅ Settings updated.');
    location.reload();
  };

  // --- Main Upload Logic ---
  uploadBtn.onclick = async () => {
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
      const res = await fetch(`https://api.torn.com/v2/user/racingrecords?key=${apiKey}`);
      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      if (!data.racingrecords) throw new Error('Invalid racing data');

      GM_xmlhttpRequest({
        method: 'POST',
        url: `${webAppUrl}?username=${encodeURIComponent(username)}`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
          ...data,
          auth: authKey
        }),
        onload: (response) => {
          const result = JSON.parse(response.responseText);
          if (result.error) {
            alert('❌ Upload failed: ' + result.error);
          } else {
            alert('✅ Upload successful!');
            uploadBtn.textContent = '✅ Uploaded!';
          }
          setTimeout(() => {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '📤 Upload Racing Records';
          }, 2000);
        },
        onerror: (err) => {
          alert('❌ Upload failed: ' + err.error);
          uploadBtn.disabled = false;
          uploadBtn.textContent = '📤 Upload Racing Records';
        }
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
      uploadBtn.disabled = false;
      uploadBtn.textContent = '📤 Upload Racing Records';
    }
  };
})();

