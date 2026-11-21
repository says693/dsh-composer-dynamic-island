# Changelog

All notable changes to this project are documented here.

## Unreleased

### Fixed

- Keep the first touch click open when hover or focus has already previewed the
  island; a second click or an outside pointer press closes it.
- Keep the island closed after Escape restores focus to its trigger.

## [2.1.0] - 2026-09-02

### Added

- Added an English-primary, bilingual README with a Simplified Chinese edition.
- Added generic integration for button-style extensions in future
  `conversation.input.*` and `composer.*` slots.
- Added constrained discovery for marked and nested composer button plugins.
- Added DOM behavior tests for discovery boundaries and stable candidate IDs.

### Changed

- Reworked the package root to the template-style TypeScript Cordis contract:
  `name`, typed `Config`, and `apply`, with no default export.
- Adopted pnpm, declaration output, and an explicit Cordis peer dependency.
- Declared says693 as the sole author and copyright holder.

### Security

- Text-entry controls and ordinary forms outside the composer are explicitly
  excluded from button integration.

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
