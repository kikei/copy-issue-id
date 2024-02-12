const STORAGE_KEY_RULES = 'rules';

export async function loadRules() {
    const loadedRules = await browser.storage.local.get(STORAGE_KEY_RULES);
  // console.debug('loadedRules: ' + JSON.stringify(loadedRules));
    return loadedRules[STORAGE_KEY_RULES] ?? [];
}

export async function saveRules(rules) {
    // console.debug('save rules:', rules);
    browser.storage.local.set({ [STORAGE_KEY_RULES]: rules });
}
