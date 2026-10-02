// Adds a "Go to Link…" item to pake's File menu, which the injected go-to-link.js draws as a paste
// field. The item has to be added in Rust because the menu is built there; everything after the
// click lives in the page. Fails loudly if pake's menu has moved, so an upgrade cannot drop it.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'node_modules/pake-cli/src-tauri/src/app/menu.rs';
const MENU_ANCHOR = '    Ok(file_menu)\n';
const MATCH_ANCHOR = '        "zoom_in" => {\n';

const ITEM = `    file_menu.append(&PredefinedMenuItem::separator(app)?)?;
    file_menu.append(&MenuItem::with_id(
        app,
        "go_to_link",
        "Go to Link…",
        true,
        Some("CmdOrCtrl+Shift+L"),
    )?)?;
`;

const ARM = `        "go_to_link" => {
            if let Some(window) = focused_webview_window(app_handle) {
                let _ = window.eval("window.__pakeGoToLink && window.__pakeGoToLink()");
            }
        }
`;

const source = readFileSync(FILE, 'utf8');
const once = (marker) =>
    source.indexOf(marker) >= 0 && source.indexOf(marker) === source.lastIndexOf(marker);

if (source.includes('"go_to_link"')) {
    console.error(`${FILE}: already patched`);
    process.exit(1);
}

if (!once(MENU_ANCHOR) || !once(MATCH_ANCHOR)) {
    console.error(`${FILE}: pake's File menu or its click handler has moved — read menu.rs by hand`);
    process.exit(1);
}

writeFileSync(
    FILE,
    source.replace(MENU_ANCHOR, ITEM + MENU_ANCHOR).replace(MATCH_ANCHOR, ARM + MATCH_ANCHOR),
);
console.log(`added the Go to Link item and its handler to ${FILE}`);
