import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

/** Cordis row identifier used by cordis.patch.yml. */
export const name = 'dsh-composer-dynamic-island'

/**
 * The headless bundle entry has no configuration knobs.
 * Browser behavior remains in the optional DSH Web client adapter.
 */
export type Config = {}

/** Empty schema keeps the complete Cordis plugin contract explicit. */
export const Config: Schemastery<Config> = z.object({})

/**
 * Activate the portable headless facet.
 *
 * The function intentionally has no effects: hosts without the DSH Web client
 * surface must be able to install and remove this bundle without failing boot.
 */
export function apply(_ctx: Context, _config: Config = {}): void {}
