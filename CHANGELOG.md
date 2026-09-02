# Changelog

All notable changes to this project are documented here.

## [2.0.0] - 2026-09-02

### Removed

- Removed the user-facing composer button-position editor.
- Removed long-press dragging, coordinate persistence, reset-position controls,
  and layout-editing visual states.

### Changed

- Changed the Community component ID to `io.github.says693.composer-dynamic-island`
  so it matches the public repository owner.
- Minimized browser storage to the configured flag and selected control IDs.
- Added migration that discards legacy positions and cached control labels.
- Clarified Community v0.15 and optional DSH Web compatibility boundaries.
- Added GitHub installation, repository metadata, release checks, and CI.

### Fixed

- Removed a broken test dependency on a missing CDP verification file.
- Reclaimed panel space previously reserved for layout controls.
