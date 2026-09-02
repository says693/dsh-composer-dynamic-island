import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const protocolManifest = JSON.parse(fs.readFileSync(new URL('../dsh-plugin.json', import.meta.url), 'utf8'));
const hostSource = fs.readFileSync(new URL('../lib/host.js', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const compatibility = fs.readFileSync(new URL('../docs/COMPATIBILITY.md', import.meta.url), 'utf8');

test('publishes a portable package with an optional DSH Web adapter', () => {
  assert.equal(manifest.name, 'dsh-composer-dynamic-island');
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.dsh.client.platform, 'web');
  assert.equal(manifest.repository.url, 'git+https://github.com/says693/dsh-composer-dynamic-island.git');
  assert.match(source, /window\.__ModuleLoader__\.load/);
});

test('declares only the Community v0.15 host facet', () => {
  assert.equal(protocolManifest.manifestVersion, '0.15');
  assert.equal(protocolManifest.version, manifest.version);
  assert.equal(protocolManifest.id, 'io.github.says693.composer-dynamic-island');
  assert.deepEqual(Object.keys(protocolManifest.facets), ['host']);
  assert.equal(protocolManifest.facets.host.entry, 'lib/host.js');
  assert.deepEqual(protocolManifest.requires.contracts, []);
  assert.deepEqual(protocolManifest.permissions, []);
  assert.deepEqual(protocolManifest.subscriptions, []);
  assert.equal(protocolManifest['x-dsh-web-adapter'].standardFacet, false);
  assert.doesNotMatch(hostSource, /\b(?:window|document|HTMLElement|MutationObserver)\b/);
});

test('targets the composer contract without hashed class names', () => {
  assert.match(source, /\[data-composer-card\]/);
  assert.doesNotMatch(source, /(?:^|[\s"'`.])(?:uV2eYG|_[a-z0-9]{6}_)(?=[\s"'`.,:[\]{}])/m);
});

test('discovers controls by semantic composer zones', () => {
  assert.match(source, /const tools = groups\[0\]/);
  assert.match(source, /const trailing = groups\.at\(-1\)/);
  assert.match(source, /conversation\.input\.left/);
  assert.match(source, /conversation\.input\.right/);
  assert.match(source, /conversation\.input\.model/);
  assert.match(source, /\.team-seat/);
  assert.match(source, /discoverCandidates/);
  assert.match(source, /interactiveOf/);
  assert.match(source, /item\.node\.setAttribute\(ITEM_ATTR/);
  assert.match(source, /ctx\.slots\.inject\(RIGHT_SLOT/);
  assert.doesNotMatch(source, /(?:panel|trigger)\.appendChild\([^)]*\.node\)/);
  assert.doesNotMatch(source, /insertBefore\([^)]*\.node/);
});

test('supports pointer, keyboard and cleanup lifecycles', () => {
  assert.match(source, /pointerenter/);
  assert.match(source, /event\.defaultPrevented/);
  assert.match(source, /aria-controls/);
  assert.match(source, /observer\.disconnect\(\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /document\.removeEventListener\("pointerdown"/);
});

test('repairs composer-local React rerenders', () => {
  assert.match(source, /stateIsCurrent/);
  assert.match(source, /selectedNow\.get\(item\.candidate\.id\)\?\.node !== item\.node/);
  assert.match(source, /surface\.contains\(trigger\)/);
  assert.match(source, /state\.cleanup\(\)/);
  assert.match(source, /mutationTouchesComposer/);
});

test('sizes to its contents and closes after pointer exit', () => {
  assert.match(source, /function packItems/);
  assert.match(source, /panelWidth/);
  assert.match(source, /panelHeight/);
  assert.match(source, /fixedPositionIsReliable/);
  assert.match(source, /resizeObserver\.observe\(item\.node\)/);
  assert.match(source, /overflow:visible/);
  assert.match(source, /schedulePointerClose/);
  assert.match(source, /pinned = false;\s*setOpen\(false\)/);
  assert.match(source, /\[data-dsh-island-item\]\.team-seat \.team-pop/);
});

test('provides a persistent settings section for each detected control', () => {
  assert.match(source, /require\("react"\)/);
  assert.match(source, /localStorage\.setItem\(STORE_KEY/);
  assert.match(source, /settings\.section/);
  assert.match(source, /IslandSettingsSection/);
  assert.match(source, /type: "checkbox"/);
  assert.match(source, /setCandidateSelected/);
  assert.match(source, /resetCandidateSelection/);
  assert.match(source, /exports\.inject = \["slots"\]/);
});

test('does not expose or persist user-defined button positions', () => {
  assert.doesNotMatch(source, /LONG_PRESS_MS|installLongPressDrag|layoutPositions|setLayoutPosition|resetLayoutPositions/);
  assert.doesNotMatch(source, /data-dsh-layout-|dshi-layout|savedPositions|positions:/);
  assert.doesNotMatch(source, /setPointerCapture|releasePointerCapture|pointercancel/);
  assert.doesNotMatch(source, /aria-label": "重置输入按钮位置|开启输入按钮布局调整/);
  assert.doesNotMatch(readme, /long-press any|420 ms|positions persist|reset button restores/i);
  assert.match(readme, /does \*\*not\*\* provide drag-and-drop/);
  assert.match(compatibility, /exposes no\s+button-position editor/);
});

test('keeps island placement internal and anchored to the fixed trigger', () => {
  assert.match(source, /function packItems\(items, rowRect, triggerRect\)/);
  assert.match(source, /const anchorCenter = triggerRect\.left \+ triggerRect\.width \/ 2/);
  assert.match(source, /let y = padding/);
  assert.match(source, /data-dshi-direction/);
  assert.match(source, /packItems\(measuredItems, row\.getBoundingClientRect\(\), trigger\.getBoundingClientRect\(\)\)/);
});

test('minimizes browser storage and migrates legacy layout data away', () => {
  assert.match(source, /const sanitized = \{/);
  assert.match(source, /configured: parsed\.configured === true/);
  assert.match(source, /selected: Array\.isArray\(parsed\.selected\)/);
  assert.doesNotMatch(source, /savedCatalog|catalog: savedCatalog|parsed\.positions/);
});
