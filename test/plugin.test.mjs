import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { parseHTML } from 'linkedom';

const source = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const protocolManifest = JSON.parse(fs.readFileSync(new URL('../dsh-plugin.json', import.meta.url), 'utf8'));
const hostSource = fs.readFileSync(new URL('../lib/types/index.js', import.meta.url), 'utf8');
const hostDeclarations = fs.readFileSync(new URL('../lib/types/index.d.ts', import.meta.url), 'utf8');
const sourceEntry = fs.readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const chineseReadme = fs.readFileSync(new URL('../README.zh-CN.md', import.meta.url), 'utf8');
const compatibility = fs.readFileSync(new URL('../docs/COMPATIBILITY.md', import.meta.url), 'utf8');
const rootModule = await import('../lib/types/index.js');

function loadClientTestingApi() {
  const { window } = parseHTML('<html><head></head><body></body></html>');
  const storage = new Map();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
  });
  let definition;
  window.__ModuleLoader__ = {
    load(value) {
      definition = value;
    },
  };
  vm.runInNewContext(source, {
    window,
    document: window.document,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    HTMLButtonElement: window.HTMLButtonElement,
    HTMLSelectElement: window.HTMLSelectElement,
    MutationObserver: window.MutationObserver,
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  }, { filename: 'lib/client.js' });
  assert.ok(definition, 'client module definition must be registered');
  const client = definition.factory((id) => {
    if (id !== 'react') throw new Error(`unexpected client dependency: ${id}`);
    return {
      createElement: () => null,
      useMemo: (factory) => factory(),
      useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
    };
  });
  return { window, client, testing: client.__testing };
}

const clientHarness = loadClientTestingApi();

test('publishes a portable package with an optional DSH Web adapter', () => {
  assert.equal(manifest.name, 'dsh-composer-dynamic-island');
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.main, 'lib/types/index.js');
  assert.equal(manifest.types, 'lib/types/index.d.ts');
  assert.equal(manifest.dsh.client.platform, 'web');
  assert.equal(manifest.repository.url, 'git+https://github.com/says693/dsh-composer-dynamic-island.git');
  assert.match(source, /window\.__ModuleLoader__\.load/);
});

test('implements the complete template-style root Cordis contract', () => {
  assert.equal(rootModule.name, 'dsh-composer-dynamic-island');
  assert.ok(rootModule.Config);
  assert.equal(typeof rootModule.apply, 'function');
  assert.equal('default' in rootModule, false);
  assert.match(sourceEntry, /export type Config/);
  assert.match(sourceEntry, /export const Config: Schemastery<Config>/);
  assert.match(hostDeclarations, /export declare const Config/);
  assert.match(hostDeclarations, /export declare function apply/);
  assert.equal(manifest.peerDependencies['@deepseek-ai/cordis'], '^4.0.1');
});

test('keeps English as the main README and links the Chinese translation', () => {
  assert.match(readme, /\*\*English\*\* \| \[简体中文\]\(README\.zh-CN\.md\)/);
  assert.match(chineseReadme, /\[English\]\(README\.md\) \| \*\*简体中文\*\*/);
  assert.match(chineseReadme, /本插件有意\*\*不提供\*\*拖放、坐标存储/);
  assert.ok(manifest.files.includes('README.md'));
  assert.ok(manifest.files.includes('README.zh-CN.md'));
  assert.doesNotMatch(readme, /`lib\/host\.js`/);
  assert.doesNotMatch(chineseReadme, /`lib\/host\.js`/);
});

test('declares only the Community v0.15 host facet', () => {
  assert.equal(protocolManifest.manifestVersion, '0.15');
  assert.equal(protocolManifest.version, manifest.version);
  assert.equal(protocolManifest.id, 'io.github.says693.composer-dynamic-island');
  assert.deepEqual(Object.keys(protocolManifest.facets), ['host']);
  assert.equal(protocolManifest.facets.host.entry, 'lib/types/index.js');
  assert.deepEqual(protocolManifest.requires.contracts, []);
  assert.deepEqual(protocolManifest.permissions, []);
  assert.deepEqual(protocolManifest.subscriptions, []);
  assert.equal(protocolManifest['x-dsh-web-adapter'].standardFacet, false);
  assert.doesNotMatch(hostSource, /\b(?:window|document|HTMLElement|MutationObserver)\b/);
});

test('targets input surfaces without hashed class names', () => {
  assert.match(source, /\[data-composer-card\]/);
  assert.match(source, /textarea,\[contenteditable=true\],\[role=textbox\]/);
  assert.doesNotMatch(source, /(?:^|[\s"'`.])(?:uV2eYG|_[a-z0-9]{6}_)(?=[\s"'`.,:[\]{}])/m);
});

test('discovers semantic and marked button extensions inside a composer only', () => {
  const { document } = clientHarness.window;
  document.body.innerHTML = `
    <div data-composer-card id="composer">
      <div data-input-scroll><textarea aria-label="Prompt"></textarea></div>
      <div class="composer-row">
        <div id="tools">
          <div data-slot="conversation.input.left">
            <span data-plugin="left-plugin"><button aria-label="Left plugin"></button></span>
          </div>
          <div data-slot="conversation.input.extra">
            <span><button aria-label="Extra slot plugin"></button></span>
          </div>
          <div data-extension-id="loose-plugin"><span><button aria-label="Loose plugin"></button></span></div>
          <button id="native-tool" aria-label="Native tool"></button>
        </div>
        <div id="trailing">
          <div data-slot="conversation.input.right">
            <div class="team-seat"><button aria-label="Team mode"></button></div>
          </div>
          <button id="send" aria-label="Send"></button>
        </div>
      </div>
    </div>
    <form id="outside"><input aria-label="Search"><button data-plugin="outside">Outside form</button></form>`;
  const card = document.querySelector('#composer');
  const parts = clientHarness.testing.findComposerParts(card);
  assert.ok(parts);
  const candidates = clientHarness.testing.discoverCandidates(parts);
  const byLabel = new Map(candidates.map((candidate) => [candidate.label, candidate]));

  assert.equal(byLabel.get('Left plugin').zone, 'left');
  assert.equal(byLabel.get('Extra slot plugin').zone, 'extension');
  assert.equal(byLabel.get('Loose plugin').zone, 'extension');
  assert.equal(byLabel.get('Team mode').zone, 'team');
  assert.equal(byLabel.get('Native tool').zone, 'native');
  assert.equal(byLabel.get('Send').zone, 'action');
  assert.equal(byLabel.has('Outside form'), false);
  assert.equal(byLabel.get('Left plugin').defaultCollapsed, true);
  assert.equal(byLabel.get('Extra slot plugin').defaultCollapsed, true);
  assert.equal(byLabel.get('Loose plugin').defaultCollapsed, true);
  assert.equal(byLabel.get('Native tool').defaultCollapsed, false);
  assert.equal(byLabel.get('Send').defaultCollapsed, false);
});

test('maps future input and composer slot names to extension integration', () => {
  assert.equal(clientHarness.testing.inputSlotZone('conversation.input.left'), 'left');
  assert.equal(clientHarness.testing.inputSlotZone('conversation.input.model'), 'model');
  assert.equal(clientHarness.testing.inputSlotZone('conversation.input.future-tools'), 'extension');
  assert.equal(clientHarness.testing.inputSlotZone('composer.actions'), 'extension');
});

test('rejects text-entry widgets even when they carry plugin markers', () => {
  const { document } = clientHarness.window;
  document.body.innerHTML = `
    <div data-composer-card id="composer-text-veto">
      <div data-input-scroll><textarea></textarea></div>
      <div><div>
        <div data-slot="conversation.input.widgets">
          <div data-plugin="search-plugin"><input type="search" aria-label="Plugin search"><button>Search</button></div>
          <div data-plugin="button-plugin"><button aria-label="Button only"></button></div>
        </div>
      </div><div><button aria-label="Send"></button></div></div>
    </div>`;
  const parts = clientHarness.testing.findComposerParts(document.querySelector('#composer-text-veto'));
  const candidates = clientHarness.testing.discoverCandidates(parts);
  assert.equal(candidates.some((candidate) => candidate.label === 'Plugin search'), false);
  assert.equal(candidates.some((candidate) => candidate.label === 'Button only'), true);
});

test('keeps a surviving button contribution id stable when a sibling disappears', () => {
  const { document } = clientHarness.window;
  document.body.innerHTML = `
    <div data-composer-card id="composer-stable-id">
      <div data-input-scroll><textarea></textarea></div>
      <div><div><div data-slot="conversation.input.extra">
        <span data-plugin="same"><button aria-label="Same"></button></span>
        <span data-plugin="same"><button aria-label="Same"></button></span>
      </div></div><div><button aria-label="Send"></button></div></div>
    </div>`;
  const card = document.querySelector('#composer-stable-id');
  const firstParts = clientHarness.testing.findComposerParts(card);
  const firstCandidates = clientHarness.testing.discoverCandidates(firstParts).filter((candidate) => candidate.label === 'Same');
  assert.equal(firstCandidates.length, 2);
  assert.notEqual(firstCandidates[0].id, firstCandidates[1].id);
  const survivor = firstCandidates[1].node;
  const survivorId = firstCandidates[1].id;
  firstCandidates[0].node.remove();
  const secondParts = clientHarness.testing.findComposerParts(card);
  const secondCandidates = clientHarness.testing.discoverCandidates(secondParts).filter((candidate) => candidate.label === 'Same');
  assert.equal(secondCandidates.length, 1);
  assert.equal(secondCandidates[0].node, survivor);
  assert.equal(secondCandidates[0].id, survivorId);
});

test('declares says693 as the sole plugin author', () => {
  assert.equal(manifest.author, 'says693');
  assert.equal('contributors' in manifest, false);
  assert.match(readme, /written and maintained solely by \[says693\]/);
  assert.match(chineseReadme, /由 \[says693\].*独立撰写并维护，无其他撰写者/);
  assert.match(fs.readFileSync(new URL('../LICENSE', import.meta.url), 'utf8'), /Copyright \(c\) 2026 says693/);
});

test('discovers controls by semantic composer zones', () => {
  assert.match(source, /INPUT_SLOT_PATTERN/);
  assert.match(source, /conversation\.input\.left/);
  assert.match(source, /conversation\.input\.right/);
  assert.match(source, /conversation\.input\.model/);
  assert.match(source, /PLUGIN_MARKER_SELECTOR/);
  assert.match(source, /BUTTON_CONTROL_SELECTOR/);
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

function mountInteractiveIsland(t) {
  const { window, client } = loadClientTestingApi();
  const { document } = window;
  document.body.innerHTML = `
    <div data-composer-card>
      <div data-input-scroll><textarea></textarea></div>
      <div class="composer-row">
        <div><div data-slot="conversation.input.left">
          <button data-plugin="test" aria-label="Plugin action"></button>
        </div></div>
        <div><span data-dsh-island-surface>
          <button data-dsh-island-trigger aria-expanded="false" aria-controls="test-panel"></button>
          <section data-dsh-island-panel id="test-panel"></section>
        </span><button aria-label="Send"></button></div>
      </div>
    </div><button id="outside">Outside</button>`;
  const trigger = document.querySelector('[data-dsh-island-trigger]');
  const row = trigger.closest('.composer-row');
  const item = document.querySelector('[data-plugin]');
  const outside = document.querySelector('#outside');
  const hovered = new Set();
  let activeElement = null;
  const dispatch = (node, type, properties = {}) => {
    const event = new window.Event(type, { bubbles: !['pointerenter', 'pointerleave', 'focus'].includes(type), cancelable: true });
    Object.assign(event, properties);
    node.dispatchEvent(event);
  };
  // linkedom does not model layout, hover state or browser focus transitions.
  for (const node of document.querySelectorAll('*')) {
    node.getBoundingClientRect = () => ({ left: 100, top: 300, right: 200, bottom: 336, width: 100, height: 36 });
    const matches = node.matches.bind(node);
    node.matches = (selector) => selector === ':hover' ? hovered.has(node)
      : selector === ':focus-within' ? node.contains(activeElement) : matches(selector);
    node.focus = () => {
      if (activeElement === node) return;
      const previous = activeElement;
      activeElement = node;
      if (previous) dispatch(previous, 'focusout');
      dispatch(node, 'focus');
      dispatch(node, 'focusin');
    };
  }
  Object.defineProperty(document, 'activeElement', { get: () => activeElement });
  window.getComputedStyle = () => ({ transform: 'none', filter: 'none', perspective: 'none', contain: 'none' });
  window.innerWidth = 1024;
  window.innerHeight = 768;
  window.requestAnimationFrame = () => 1;
  window.cancelAnimationFrame = () => {};
  client.apply({
    slots: { inject() {} },
    effect: (effect) => t.after(effect()),
  });
  assert.ok(item.hasAttribute('data-dsh-island-item'));
  return {
    document, trigger, row, item, outside, dispatch,
    enter(node) { hovered.add(node); dispatch(node, 'pointerenter'); },
    leave(node) { hovered.delete(node); dispatch(node, 'pointerleave'); },
    assertOpen(open) {
      assert.equal(row.dataset.dshIslandOpen, String(open));
      assert.equal(trigger.getAttribute('aria-expanded'), String(open));
    },
  };
}

test('first touch pins a preview-open island and the next click closes it', (t) => {
  const island = mountInteractiveIsland(t);
  island.dispatch(island.trigger, 'pointerenter', { pointerType: 'touch' });
  island.trigger.focus();
  island.assertOpen(true);
  island.dispatch(island.trigger, 'click');
  island.assertOpen(true);
  island.dispatch(island.trigger, 'click');
  island.assertOpen(false);

  island.dispatch(island.trigger, 'click');
  island.assertOpen(true);
  island.dispatch(island.item, 'pointerdown');
  island.assertOpen(true);
  island.dispatch(island.outside, 'pointerdown');
  island.assertOpen(false);
});

test('Escape from an island item restores trigger focus without reopening', async (t) => {
  const island = mountInteractiveIsland(t);
  island.trigger.focus();
  island.assertOpen(true);
  island.item.focus();
  island.dispatch(island.item, 'keydown', { key: 'Escape' });
  assert.equal(island.document.activeElement, island.trigger);
  island.assertOpen(false);
  await new Promise((resolve) => setTimeout(resolve, 10));
  island.assertOpen(false);
  island.outside.focus();
  island.trigger.focus();
  island.assertOpen(true);
});

test('desktop hover and pinned islands still close after pointer exit', async (t) => {
  const island = mountInteractiveIsland(t);
  island.enter(island.trigger);
  island.assertOpen(true);
  island.leave(island.trigger);
  await new Promise((resolve) => setTimeout(resolve, 140));
  island.assertOpen(false);
  island.enter(island.trigger);
  island.dispatch(island.trigger, 'click');
  island.assertOpen(true);
  island.leave(island.trigger);
  await new Promise((resolve) => setTimeout(resolve, 140));
  island.assertOpen(false);
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

test('provides persistent settings for every detected control', () => {
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
