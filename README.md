# 🛠️ Tampermonkey Scripts

Zentrale Sammlung aller internen Browser-Tools für das Team.  
Jedes Script lädt seine Konfiguration automatisch von hier – Änderungen sind **sofort für alle Nutzer aktiv**.

---

## 📦 Verfügbare Scripts

| Script | Beschreibung | Installieren |
|--------|-------------|--------------|
| [APM Toolkit](./apm-toolkit/) | Titel-Präfix & Comment-Templates für EAM/APM | [→ Installieren](https://raw.githubusercontent.com/amz-hohoff/tampermonkey-scripts/main/apm-toolkit/loader.user.js) |

---

## 🚀 Installation für Nutzer (einmalig)

1. **Tampermonkey** im Browser installieren: [tampermonkey.net](https://www.tampermonkey.net)
2. Den **Installationslink** des gewünschten Scripts aufrufen (Tabelle oben)
3. Tampermonkey zeigt eine Installationsseite → **„Install"** klicken
4. Fertig – das Script aktualisiert sich ab jetzt automatisch ✅

> **Wichtig:** Die installierten Scripts müssen nie manuell aktualisiert werden.  
> Alle Änderungen (Konfiguration & Funktionen) werden automatisch geladen.

---

## ⚙️ Konfiguration ändern (für Config-Editoren)

Jedes Script hat eine eigene `config.json` in seinem Unterordner.  
Direkt auf GitHub bearbeiten → Änderung ist sofort live für alle.

**Keine Programmierkenntnisse nötig** – die `config.json` ist selbsterklärend aufgebaut.  
→ Bei Unsicherheit: [jsonlint.com](https://jsonlint.com) zum Validieren nutzen.

---

## 🧑‍💻 Entwicklung (für Entwickler)

Die Logik jedes Scripts liegt in `core.js` im jeweiligen Unterordner.  
Änderungen dort sind ebenfalls sofort live – kein Build, kein Deploy nötig.

**Neues Script hinzufügen:**
1. Neuen Ordner anlegen (z.B. `mein-script/`)
2. `loader.user.js`, `core.js`, `config.json` aus einem bestehenden Script kopieren und anpassen
3. In dieser README-Tabelle oben eintragen

---

## 👥 Berechtigungen

| Rolle | Kann | Zugang erteilt durch |
|-------|------|----------------------|
| **Nutzer** | Script installieren & nutzen | Öffentlicher Link |
| **Config-Editor** | `config.json` bearbeiten | Repository-Collaborator (Write) |
| **Entwickler** | `core.js` & alle Dateien bearbeiten | Repository-Collaborator (Write) |

Zugang anfordern bei: **@amz-hohoff**  
→ Settings → Collaborators → Add people

---

## 📁 Repo-Struktur

```
tampermonkey-scripts/
│
├── README.md                 ← Diese Datei
│
└── apm-toolkit/
    ├── loader.user.js        ← Nutzer installieren nur diese Datei (1x)
    ├── core.js               ← Gesamte Logik (Entwickler)
    ├── config.json           ← Konfiguration (Config-Editoren)
    └── README.md             ← Anleitung speziell für dieses Script
```
