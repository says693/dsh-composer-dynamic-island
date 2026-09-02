/**
 * DSH Web bundle anchor.
 *
 * The browser feature lives in lib/client.js. Keeping this host entry inert
 * makes a missing or unsupported browser surface degrade to a no-op.
 */
const name = "dsh-composer-dynamic-island";
function apply() {}

export { apply, name };
