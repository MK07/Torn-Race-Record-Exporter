// ==UserScript==
// @name         Torn Racing Record Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      2.4
// @description  Uploads racing records to Google Sheets for ranking (private community use).
// @author       MK07
// @match        https://www.torn.com/page.php?sid=racing
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @connect      googleusercontent.com
// @updateURL    https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Torn%20Race%20Record%20Exporter.user.js
// @downloadURL  https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Torn%20Race%20Record%20Exporter.user.js
// ==/UserScript==

const webAppUrl = 'https://script.google.com/macros/s/AKfycbzA-aXSEM56APtgBTG4QLV1d3bmYjmvCk9MBKiDtjSbFeeOsr5hhv1sIewQ_UqV2RpM/exec';//update if sheet script is updated, deploy first

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

//Upload Button
const uploadBtn = document.createElement('button');
uploadBtn.textContent = '📤 Upload Racing Records';
uploadBtn.style.cssText = 'position:fixed; top:20px; right:60px; z-index:9999; padding:10px 16px; background-color:#008cba; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:14px; box-shadow:0 2px 6px rgba(0,0,0,0.2);';
document.body.appendChild(uploadBtn);

//Settings Gear Icon
const gearBtn = document.createElement('div');
gearBtn.textContent = '⚙️';
gearBtn.style.cssText = 'position:fixed; top:24px; right:20px; font-size:18px; cursor:pointer; z-index:9999;';
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

//Main Upload Logic --- don't touch this.
uploadBtn.onclick = async () => {
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';

  try {
    const res = await fetch(`https://api.torn.com/v2/user/racingrecords?key=${apiKey}`); //will need to update if splent updates the api
    if (!res.ok) throw new Error('API request failed');

    const data = await res.json();
    if (!data.racingrecords) throw new Error('Invalid racing data');
//cross origin request to Google sheets
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
        uploadBtn.disabled = false;
        uploadBtn.textContent = '📤 Upload Racing Records';
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
