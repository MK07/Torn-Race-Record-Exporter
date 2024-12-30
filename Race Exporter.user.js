// ==UserScript==
// @name         Race Exporter
// @namespace    https://github.com/MK07/Torn-Race-Record-Exporter
// @version      1.0
// @description  Exports Racing CSVs to the Drive folder
// @author       MK07
// @match        https://www.torn.com/loader.php?sid=racing
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Race%20Exporter.user.js
// @downloadURL  https://raw.githubusercontent.com/MK07/Torn-Race-Record-Exporter/main/Race%20Exporter.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Button, white text, green background, ugly colour???
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

    exportButton.addEventListener('click', function () {
        let apiKey = localStorage.getItem('tornApiKey');
        let userName = localStorage.getItem('tornUserName');

        if (!apiKey || !userName) {
            apiKey = prompt('Enter your Full Access API key:');
            userName = prompt('Enter your username:');

            if (apiKey && userName) {
                // Store locally, might need changes when user selection gets added
                localStorage.setItem('tornApiKey', apiKey);
                localStorage.setItem('tornUserName', userName);
            } else {
                alert('API key and username are required!');
                return;
            }
        }

        // Fetch from API
        fetchRacingLogs(apiKey, userName);
    });

    function fetchRacingLogs(apiKey, userName) {
        const baseUrl = `https://api.torn.com/user/?selections=log&log=8733&key=${apiKey}`;
        let timeTo = null;
        let racingLogs = [];

        const fetchLogs = () => {
            const url = timeTo ? `${baseUrl}&to=${timeTo - 1}` : baseUrl;
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function (response) {
                    try {
                        if (response.status === 200) {
                            const data = JSON.parse(response.responseText);
                            if (data.error) {
                                alert(`Error from Torn API: ${data.error.error}`);
                                return;
                            }
                            const logs = data.log || {};
                            const logEntries = Object.values(logs);

                            if (logEntries.length === 0) {
                                const csvData = formatCSV(racingLogs);
                                sendDataToGoogleAppsScript(csvData, userName);
                                return;
                            }

                            racingLogs = racingLogs.concat(
                                logEntries.map(log => ({
                                    log: log.log || '',
                                    title: log.title || '',
                                    timestamp: log.timestamp || '',
                                    category: log.category || '',
                                    car: log.data?.car || '',
                                    track: log.data?.track || '',
                                    time: log.data?.time || '',
                                    italic: log.params?.italic || '',
                                    color: log.params?.color || ''
                                }))
                            );

                            timeTo = Math.min(...logEntries.map(log => log.timestamp));
                            fetchLogs();
                        } else {
                            alert(`Failed to fetch logs. HTTP Status: ${response.status}`);
                        }
                    } catch (error) {
                        alert(`Error processing response: ${error.message}`);
                    }
                },
                onerror: function (error) {
                    console.error('Fetch error:', error);
                    alert('Error fetching racing logs.');
                }
            });
        };

        fetchLogs();
    }

    // extra format for the csv, cause there is going to be the broken strings
    function escapeCsv(value) {
        return `"${String(value || '').replace(/"/g, '""')}"`;
    }

    // Convert into csv
    function formatCSV(racingLogs) {
        const headers = ['log', 'title', 'timestamp', 'category', 'car', 'track', 'time', 'italic', 'color'];
        const csvData = [headers.join(',')].concat(
            racingLogs.map(log =>
                headers.map(field => escapeCsv(log[field])).join(',')
            )
        ).join('\n');
        return csvData;
    }

    // Send data to drive
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
            onload: function (response) {
                if (response.status === 200) {
                    alert('CSV file uploaded successfully to Google Drive!');
                } else {
                    alert('Error uploading file: ' + response.statusText);
                }
            },
            onerror: function (error) {
                alert('Request failed: ' + error);
            }
        });
    }
})();
