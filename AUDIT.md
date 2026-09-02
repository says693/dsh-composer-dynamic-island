# Release audit — 2.0.0

Audit date: 2026-09-02

## Scope

This audit covers the source tree intended for the initial public GitHub
release of `dsh-composer-dynamic-island` 2.0.0. It focuses on removal of the
user-facing button-position editor, the Community v0.15 declaration boundary,
privacy, dependencies, lifecycle cleanup, tests, and package contents.

## Results

### Removed positioning capability

The following behavior is absent from the release:

- long-press or pointer-drag handlers for composer controls;
- layout-editing and dragging attributes or styles;
- user-defined x/y coordinates;
- coordinate persistence, restoration, or reset controls;
- composer-frame expansion for free-form button layouts.

The island still calculates transient viewport coordinates for its own panel
and collapsed controls. This is internal rendering beside a fixed trigger, not
a user-configurable button-position capability.

### Protocol boundary

- `dsh-plugin.json` declares Community v0.15 and only `facets.host`.
- Required contracts, permissions, subscriptions, and command contributions
  are empty.
- The host entry is DOM-free and has no effects.
- The DSH Web code is explicitly marked as an optional compatibility adapter,
  not a standard client facet or a cross-host conformance claim.
- The manifest's pinned JSON Schema URL returned HTTP 200 during the audit.

### Privacy and permissions

- No network APIs or filesystem APIs are used by the plugin.
- No conversation content, provider settings, API keys, or credentials are
  read or persisted.
- Browser storage is limited to a configured flag and selected control IDs.
- Legacy stored coordinates and cached labels are discarded on load.

### Dependency and supply-chain review

- Runtime dependency: `@deepseek-ai/schemastery` 3.18.1, pinned exactly in
  `package.json` and transitively locked by `package-lock.json`.
- `npm audit --omit=dev --audit-level=high` against the official npm registry:
  0 vulnerabilities.
- The package lock records integrity hashes and official npm registry sources.
- A secret-pattern scan of the release tree returned no matches.

### Verification

- JavaScript syntax checks: passed.
- Host entry runtime import and export check: passed.
- Node test suite: 11 passed, 0 failed.
- `npm pack --dry-run`: passed; 9 package files, approximately 46 kB unpacked.

## Known limitations

- No official DSH or Community v0.15 certification is claimed.
- The optional Web adapter still requires a real-host interaction test for each
  supported DSH Web release; this source snapshot did not include a runnable
  host fixture or browser-level verifier.
- In-process DSH plugins share their host's trust boundary and are not a
  security sandbox.

## Release decision

No critical or high-severity issue was found in the reviewed source. The
release is suitable for public source distribution with the compatibility and
runtime-testing limitations above disclosed.
