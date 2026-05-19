# APM Toolkit – Konfigurationsanleitung

## Für Config-Editoren

Alle Einstellungen befinden sich ausschließlich in **`config.json`**.  
Änderungen sind **sofort für alle Nutzer aktiv** – kein Update, kein Neustart nötig.

---

## Präfix-Optionen bearbeiten (`prefixOptions`)

Erscheinen im **„▾ Präfix"**-Dropdown neben dem Titel-Feld.

```json
"prefixOptions": [
    {
        "label": "FWO-(temp)",
        "desc":  "Kurze Erklärung wann dieser Präfix genutzt wird"
    }
]
```

| Feld    | Bedeutung |
|---------|-----------|
| `label` | Wird **vor** den Titel geschrieben, z.B. `FWO-(temp) Mein Titel` |
| `desc`  | Erklärungstext im Dropdown (rechte Spalte) |

---

## Comment-Templates bearbeiten (`commentTemplates`)

Erscheinen im **„▾ Comment"**-Dropdown neben dem Kommentar-Feld.

```json
"commentTemplates": [
    {
        "title": "Mein Template",
        "text":  "Zeile 1\nZeile 2\n\nZeile 4 (nach Leerzeile)"
    }
]
```

| Feld    | Bedeutung |
|---------|-----------|
| `title` | Anzeigename im Dropdown |
| `text`  | Vollständiger Text der ins Kommentarfeld eingefügt wird |

> **Tipp:** Für Zeilenumbrüche im `text` immer `\n` verwenden. Leerzeile = `\n\n`

---

## JSON-Regeln (wichtig!)

- Jeder Eintrag **außer dem letzten** braucht ein Komma am Ende: `},`
- Der **letzte** Eintrag bekommt kein Komma
- Anführungszeichen müssen immer **doppelt** sein: `"so"`

**JSON validieren vor dem Speichern:** https://jsonlint.com

---

## Berechtigungen vergeben

Repository-Owner: **@amz-hohoff**  
Neue Editoren hinzufügen: Settings → Collaborators → Add people
