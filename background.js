/**
 * This extension adds a context menu item to the browser, which allows the
 * user to copy the selected text as a predefined patterns such as URL.
 */
import { loadRules } from './storage.js';

const PATTERN_ISSUE_ID = /([A-Za-z][A-Za-z0-9]*)-(\d+)/;
const MENU_ID_COPY_AS_URL = "copy-as-url";
const MENU_ID_COPY_AS_HTML = "copy-as-html";

const CONVERT_KEY_PROJECT = 'pk';
const CONVERT_KEY_NO = 'no';

browser.contextMenus.create({
  id: MENU_ID_COPY_AS_URL,
  title: "...As an URL",
  contexts: ["selection"],
},
  () => {
    if (browser.runtime.lastError) {
      console.warn(
        'Failed to register context menu item: ' + browser.runtime.lastError
      );
    }
  }
);

browser.contextMenus.create({
  id: MENU_ID_COPY_AS_HTML,
  title: "...As a link to the issue",
  contexts: ["selection"],
},
  () => {
    if (browser.runtime.lastError) {
      console.warn(
        'Failed to register context menu item: ' + browser.runtime.lastError
      );
    }
  }
);

function extractIssueId(text) {
  const m = text.match(PATTERN_ISSUE_ID);
  if (!m) {
    // console.debug('No patterns matched');
    return null;
  }
  return { projectKey: m[1], no: m[2] };
}

function extractIssueIds(text) {
  return Array.from(text.matchAll(/([A-Z]+)-(\d+)/g))
    .map(m => ({ projectKey: m[1], no: m[2] }));
}

function convert(rules, projectKey, no) {
  const rule = rules.get(projectKey);
  if (!rule) {
    // console.debug('convert: No rule found for ' + projectKey);
    return null;
  }
  return rule
    .replace(`{${CONVERT_KEY_PROJECT}}`, projectKey)
    .replace(`{${CONVERT_KEY_NO}}`, no);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const rules = await loadRules()
    .then(rules => new Map(rules.map(rule => [rule.pk, rule.rw])));

  switch (info.menuItemId) {
    case MENU_ID_COPY_AS_URL:
      const result = extractIssueIds(info.selectionText)
        .map(({ projectKey, no }) => {
          return convert(rules, projectKey, no);
        });
      if (result.length > 0)
        await navigator.clipboard.writeText(result.join('\n'));
      break;
    case MENU_ID_COPY_AS_HTML:
      const issue = extractIssueId(info.selectionText);
      if (!issue) {
        // console.debug('No patterns matched');
        return;
      }
      const url = convert(rules, issue.projectKey, issue.no);
      // On firefox,
      // * the clipboard write is only supported with one ClipboardItem at the moment.
      // * you have to enable dom.events.asyncClipboard.clipboardItem in about:config.
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([url], { type: 'text/plain' }),
          'text/html': new Blob(
            [`<a href="${url}">${escapeHtml(info.selectionText)}</a>`],
            { type: 'text/html' }
          ),
        }),
      ]);
      break;
  }
});
