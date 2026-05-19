// ==UserScript==
// @name         APM – Toolkit
// @namespace    https://eu1.eam.hxgnsmartcloud.com/
// @version      1.0.0
// @description  APM Toolkit – lädt Konfiguration und Funktionen automatisch von GitHub.
// @author       amz-hohoff
// @match        *://eu1.eam.hxgnsmartcloud.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Diese Datei wird vom Nutzer EINMALIG installiert.                  ║
// ║  Änderungen an Funktionen oder Konfiguration erfolgen auf GitHub,   ║
// ║  nicht hier. Diese Datei muss NIEMALS aktualisiert werden.          ║
// ╚══════════════════════════════════════════════════════════════════════╝

(function () {
    'use strict';

    const BASE_URL = 'https://raw.githubusercontent.com/amz-hohoff/Tempermonkey-Scripts/main/apm-toolkit';

    function fetchText(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method:  'GET',
                url:     url + '?_=' + Date.now(),
                onload:  r => r.status === 200
                    ? resolve(r.responseText)
                    : reject(new Error('HTTP ' + r.status + ': ' + url)),
                onerror: () => reject(new Error('Netzwerkfehler: ' + url)),
            });
        });
    }

    Promise.all([
        fetchText(BASE_URL + '/config.json'),
        fetchText(BASE_URL + '/core.js'),
    ])
    .then(([configText, coreText]) => {
        const CONFIG = JSON.parse(configText);
        new Function('CONFIG', coreText)(CONFIG);
    })
    .catch(err => {
        console.warn('[APM Toolkit] Fehler beim Laden:', err.message);
    });

})();
