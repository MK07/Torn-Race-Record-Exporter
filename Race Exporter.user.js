// ==UserScript==
// @name         Race Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      1.0
// @description  Exports Racing CSVs to the Drive folder
// @author       MK07
// @match        https://www.torn.com/loader.php?sid=racing
// @grant        none
// @updateURL    https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Race%20Exporter.user.js
// @downloadURL  https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Race%20Exporter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Button to trigger
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Racing Log';
    exportButton.style.position = 'fixed';
    exportButton.style.top = '20px';
    exportButton.style.right = '20px';
    exportButton.style.padding = '10px';
    exportButton.style.backgroundColor = '#28a745';
    exportButton.style.color = 'white';
    exportButton.style.fontSize = '16px';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '5px';
    document.body.appendChild(exportButton);

    exportButton.addEventListener('click', function() {
        let apiKey = localStorage.getItem('tornApiKey'); 
        let userName = localStorage.getItem('tornUserName'); 

        if (!apiKey || !userName) {
            apiKey = prompt('Enter your Full Access API key:');
            userName = prompt('Enter your username:');

            if (apiKey && userName) {
                // Store the API key and username for future use
                localStorage.setItem('tornApiKey', apiKey);
                localStorage.setItem('tornUserName', userName);
            } else {
                alert('API key and username are required!');
                return;
            }
        }

        // Fetch the racing logs from Torn API
        fetchRacingLogs(apiKey, userName);
    });

    // Fetch racing logs from Torn API
    function fetchRacingLogs(apiKey, userName) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.torn.com/user/?selections=log&log=8733&key=${apiKey}`,
            onload: function(response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    const logs = data.log;

                    if (logs) {
                        let racingLogs = [];

                        for (const logId in logs) {
                            const log = logs[logId];
                            racingLogs.push({
                                log: log.log,
                                title: log.title,
                                timestamp: log.timestamp,
                                category: log.category,
                                data: log.data,
                                params: log.params
                            });
                        }

                        // format into CSV
                        const csvData = formatCSV(racingLogs);

                        // Send the CSV data to Google
                        sendDataToGoogleAppsScript(csvData, userName);
                    } else {
                        alert('No racing logs found!');
                    }
                } else {
                    alert('Failed to fetch racing logs from Torn API');
                }
            },
            onerror: function(error) {
                alert('Error fetching racing logs: ' + error);
            }
        });
    }

    function formatCSV(racingLogs) {
        let csvData = 'log,title,timestamp,category,data.car,data.track,data.time,params.italic,params.color\n';

        racingLogs.forEach(log => {
            csvData += `${log.log},${log.title},${log.timestamp},${log.category},${log.data.car},${log.data.track},${log.data.time},${log.params.italic},${log.params.color}\n`;
        });

        return csvData;
    }

    // Send the CSV data to Google
    function sendDataToGoogleAppsScript(csvData, userName) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://script.google.com/macros/s/AKfycbxH3m0CFCSJ0HK7BfZtIf3rHkWeAG5dcJ-bw9hzshWB65wxZZNXmrVZzJo9VKLMCQ8T/exec',
            data: JSON.stringify({
                csvData: csvData,
                userName: userName
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            onload: function(response) {
                if (response.status === 200) {
                    alert('CSV file uploaded successfully to Google Drive!');
                } else {
                    alert('Error uploading file: ' + response.statusText);
                }
            },
            onerror: function(error) {
                alert('Request failed: ' + error);
            }
        });
    }
})();
