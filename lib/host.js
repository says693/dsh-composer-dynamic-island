import z from "@deepseek-ai/schemastery";

export const name = "dsh-composer-dynamic-island";

/** The Community v0.15 host facet has no required configuration or effects. */
export const Config = z.object({});

/**
 * Headless host facet.
 *
 * Composer rendering is deliberately not implemented here because Community
 * v0.15 has no client facet. A conforming headless host can activate this
 * entry without a DOM, browser, credential, service, or persistent resource.
 */
export function apply() {}
