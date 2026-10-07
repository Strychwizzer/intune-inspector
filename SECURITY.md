# Sicherheit

## Sicherheitslücken melden

Bitte Sicherheitslücken **nicht** als öffentliches Issue melden, sondern über *Security → Report a vulnerability* in diesem Repository (privater Sicherheitshinweis).

Hilfreich sind: betroffene Version, Beschreibung, Schritte zur Reproduktion und mögliche Auswirkungen. Bitte keine echten Kundendaten, Snapshots oder Tokens mitschicken.

## Unterstützte Versionen

Sicherheitskorrekturen erfolgen für die jeweils aktuelle Version.

## Grundsätze

Intune Inspector ist auf minimale Rechte und lokale Datenhaltung ausgelegt: nur lesende Graph-Berechtigungen, Webserver nur auf `localhost`, keine Telemetrie, Geheimnisse werden beim Einlesen ausgeblendet. Details: [docs/sicherheit-datenschutz.md](docs/sicherheit-datenschutz.md).
