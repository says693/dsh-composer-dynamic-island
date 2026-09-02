# Release audit — 2.1.0

Audit date: 2026-09-02

## Scope

This audit covers the source tree intended for release as
`dsh-composer-dynamic-island` 2.1.0. It focuses on the template-style Cordis
root contract, generic input-surface button integration, removal of the
user-facing position editor, protocol boundaries, authorship, privacy,
dependencies, tests, and package contents.

## Authorship

- Sole plugin author and maintainer: `says693`.
- `package.json` contains one `author` value and no contributors list.
- The MIT copyright notice names only `says693`.
- Both README editions state the same sole authorship.
- Upstream package and project attribution is dependency attribution, not
  plugin authorship.

## Results

### Template-style package root

- Pure ESM TypeScript source in `src/index.ts`.
- Package root exports `name`, typed `Config`, and `apply`, with no default
  export.
- Declaration files and declaration maps are generated into `lib/types/`.
- `cordis.patch.yml` loads that package root with an explicit empty config.
- Cordis is declared as a peer and development dependency.
- pnpm and a committed `pnpm-lock.yaml` are used for reproducible installation.

The root remains a no-op in headless hosts. Browser behavior stays in the
optional DSH Web adapter and is not represented as a Community v0.15 client
facet.

### Button-extension integration

Discovery remains bounded to a confirmed DSH input/composer surface. It
supports:

- known left, right, and model input slots;
- future `conversation.input.*` and `composer.*` slots;
- nested button contributions with plugin or extension data markers;
- unmarked direct composer-toolbar buttons as manual opt-in controls.

Text-entry controls (`textarea`, contenteditable, ARIA textbox, and text-like
input types) are rejected even if marked as plugins. Settings, search, and
ordinary forms outside the composer are not scanned. Candidate node IDs remain
stable while a surviving DOM node remains mounted.

### Removed positioning capability

The release contains no long-press dragging, layout editor, user-defined x/y
coordinates, coordinate persistence, or reset-position controls. The island
still calculates transient viewport coordinates for rendering beside its fixed
trigger; this is not a user-configurable positioning capability.

### Protocol boundary

- `dsh-plugin.json` declares Community v0.15 and only `facets.host`.
- Required contracts, permissions, subscriptions, and command contributions
  are empty.
- The host entry is DOM-free and effect-free.
- The DSH Web code is explicitly an optional compatibility adapter, not a
  standard client facet or cross-host conformance claim.

### Privacy and permissions

- No network or filesystem APIs are used by the plugin runtime.
- No conversation content, provider settings, API keys, or credentials are
  read or persisted.
- Browser storage is limited to a configured flag and selected control IDs.
- Legacy stored coordinates and cached labels are discarded on load.

## Verification results

- TypeScript build and declaration generation: passed.
- TypeScript no-emit check and JavaScript syntax check: passed.
- Node behavior tests, including DOM discovery fixtures: 18 passed, 0 failed.
- Community v0.15 JSON Schema validation: passed.
- pnpm audit against the official npm registry: no known vulnerabilities.
- Package inspection: passed; 11 files, approximately 58.4 kB unpacked.
- Secret-pattern scan: no source match.
- Authorship assertions: passed; only `says693` is declared as plugin author.

## Known limitations

- No official DSH or Community v0.15 certification is claimed.
- A real DSH Web host interaction test is still required for each supported host
  release; fixture tests validate discovery policy, not every third-party UI.
- The adapter trigger still depends on the DSH Web slot service and its right
  input slot.
- In-process DSH plugins share their host's trust boundary and are not a
  security sandbox.

## Release decision

No critical or high-severity issue was found in the reviewed source. Version
2.1.0 is suitable for public source distribution with the documented host-test
limitations. Compatibility is claimed for the documented discovery policy,
not for arbitrary controls elsewhere on a page.
