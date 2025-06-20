// ==UserScript==
// @name         Torn Race Records Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      2.0
// @description  Exports Racing Records to the Drive folder
// @author       MK07
// @match        https://www.torn.com/loader.php?sid=racing
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
  'use strict';

  const webAppUrl = "https://script.google.com/macros/s/AKfycbzKWY-yLCzrlyAZTwDW3SOjiRQMqQtqAnNFouswZs1RB-kc76uDmFZZT7BkpXX0O7Cl/exec"; 

  function getOrPromptSetting(key, promptMsg) {
    let value = localStorage.getItem(key);
    if (!value) {
      value = prompt(promptMsg);
      if (value) localStorage.setItem(key, value);
    }
    return value;
  }

  let username = getOrPromptSetting("tornUploaderUsername", "Enter your Torn username:");
  let apiKey = getOrPromptSetting("tornUploaderApiKey", "Enter your Torn API Key (with 'racing' permission):");

  const uploadBtn = document.createElement("button");
  uploadBtn.textContent = "Upload Racing Records";
  Object.assign(uploadBtn.style, {
    position: "fixed",
    top: "20px",
    right: "60px",
    zIndex: 9999,
    padding: "10px 16px",
    backgroundColor: "#008cba",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  });
  document.body.appendChild(uploadBtn);

  const gearBtn = document.createElement("div");
  gearBtn.textContent = "⚙️";
  Object.assign(gearBtn.style, {
    position: "fixed",
    top: "24px",
    right: "20px",
    fontSize: "18px",
    cursor: "pointer",
    zIndex: 9999
  });
  document.body.appendChild(gearBtn);

  gearBtn.onclick = () => {
    const newUsername = prompt("Update your Torn username:", localStorage.getItem("tornUploaderUsername") || "");
    const newApiKey = prompt("Update your Torn API Key:", localStorage.getItem("tornUploaderApiKey") || "");
    if (newUsername) localStorage.setItem("tornUploaderUsername", newUsername);
    if (newApiKey) localStorage.setItem("tornUploaderApiKey", newApiKey);
    alert("Settings updated.");
    location.reload();
  };

  uploadBtn.onclick = async function() {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    try {
      const apiUrl = `https://api.torn.com/v2/user/racingrecords?key=${apiKey}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Torn API request failed");

      const data = await res.json();
      if (!data.racingrecords || !Array.isArray(data.racingrecords)) {
        throw new Error("Invalid data from Torn API");
      }

      GM_xmlhttpRequest({
        method: "POST",
        url: `${webAppUrl}?username=${encodeURIComponent(username)}`,
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        onload: function(response) {
          alert("✅ Upload successful: " + response.responseText);
          uploadBtn.textContent = "✅ Uploaded!";
          setTimeout(() => uploadBtn.textContent = "Upload Racing Records", 3000);
          uploadBtn.disabled = false;
        },
        onerror: function(error) {
          alert("❌ Upload failed: " + (error.error || "Network error"));
          uploadBtn.textContent = "❌ Upload Error";
          setTimeout(() => uploadBtn.textContent = "Upload Racing Records", 3000);
          uploadBtn.disabled = false;
        }
      });

    } catch (err) {
      alert("❌ Upload failed: " + err.message);
      uploadBtn.textContent = "❌ Upload Error";
      setTimeout(() => uploadBtn.textContent = "Upload Racing Records", 3000);
      uploadBtn.disabled = false;
    }
  };
})();
