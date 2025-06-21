// ==UserScript==
// @name         Torn Racing Record Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      2.1
// @description  Uploads racing records to a Google Apps Script Web App for leaderboard tracking.
// @author       YourName
// @match        https://www.torn.com/loader.php?sid=racing
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const webAppUrl = 'https://script.google.com/macros/s/AKfycbzA-aXSEM56APtgBTG4QLV1d3bmYjmvCk9MBKiDtjSbFeeOsr5hhv1sIewQ_UqV2RpM/exec';

  //Store Keys
  function getOrPrompt(key, message) {
    let val = localStorage.getItem(key);
    if (!val) {
      val = prompt(message);
      if (val) localStorage.setItem(key, val);
    }
    return val;
  }

  let username = getOrPrompt('tornUsername', 'Enter your Torn username:');
  let apiKey = getOrPrompt('tornApiKey', 'Enter your Minimal Access key:');

  // Upload button
  const uploadBtn = document.createElement('button');
  uploadBtn.textContent = 'Upload Racing Records';
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

  // Change api and username
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
    const newUsername = prompt('Update username:', localStorage.getItem('tornUsername') || '');
    const newKey = prompt('Update API key:', localStorage.getItem('tornApiKey') || '');
    if (newUsername) localStorage.setItem('tornUsername', newUsername);
    if (newKey) localStorage.setItem('tornApiKey', newKey);
    alert('Settings updated.');
    location.reload();
  };

  // Main Script
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
        data: JSON.stringify(data),
        onload: (response) => {
          alert('✅ Upload successful!');
          uploadBtn.textContent = '✅ Uploaded!';
          setTimeout(() => {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Racing Records';
          }, 2000);
        },
        onerror: (err) => {
          alert('❌ Upload failed: ' + err.error);
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload Racing Records';
        }
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload Racing Records';
    }
  };
})();
