/**
 * Wrap-aware Home / End for pi's editor.
 *
 * First press of Home/End jumps to the start/end of the current *visual*
 * (wrapped) line. A second consecutive press jumps to the start/end of the
 * logical line. This matches the behaviour that was previously patched
 * directly into pi-tui's Editor class.
 *
 * Implementation note: the internal state needed here (lastWidth, state,
 * setCursorCol, buildVisualLineMap, findCurrentVisualLine) is private on
 * Editor. We access it via `(this as any)` intentionally, accepting the
 * coupling in exchange for keeping pi-tui unmodified.
 */

import { CustomEditor, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getKeybindings } from "@mariozechner/pi-tui";
import type { EditorTheme, TUI } from "@mariozechner/pi-tui";
import type { KeybindingsManager } from "@mariozechner/pi-coding-agent";

class WrapAwareEditor extends CustomEditor {
	onInternalsMissing?: (method: string) => void;

	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager) {
		super(tui, theme, keybindings);
	}

	handleInput(data: string): void {
		const kb = getKeybindings();

		if (kb.matches(data, "tui.editor.cursorLineStart")) {
			this.wrapAwareLineStart();
			return;
		}
		if (kb.matches(data, "tui.editor.cursorLineEnd")) {
			this.wrapAwareLineEnd();
			return;
		}

		super.handleInput(data);
	}

	private wrapAwareLineStart(): void {
		const self = this as any;
		if (typeof self.buildVisualLineMap !== "function") {
			this.onInternalsMissing?.("buildVisualLineMap");
			self.setCursorCol(0);
			return;
		}
		if (self.lastWidth > 0) {
			const visualLines = self.buildVisualLineMap(self.lastWidth);
			const idx = self.findCurrentVisualLine(visualLines);
			const vl = visualLines[idx];
			if (vl) {
				// Already at visual line start → fall back to logical line start
				self.setCursorCol(self.state.cursorCol === vl.startCol ? 0 : vl.startCol);
				return;
			}
		}
		self.setCursorCol(0);
	}

	private wrapAwareLineEnd(): void {
		const self = this as any;
		const currentLine: string = self.state.lines[self.state.cursorLine] ?? "";
		if (typeof self.buildVisualLineMap !== "function") {
			this.onInternalsMissing?.("buildVisualLineMap");
			self.setCursorCol(currentLine.length);
			return;
		}
		if (self.lastWidth > 0) {
			const visualLines = self.buildVisualLineMap(self.lastWidth);
			const idx = self.findCurrentVisualLine(visualLines);
			const vl = visualLines[idx];
			if (vl) {
				const isLastSegment =
					idx === visualLines.length - 1 || visualLines[idx + 1]?.logicalLine !== vl.logicalLine;
				let visualEnd: number;
				if (isLastSegment) {
					visualEnd = vl.startCol + vl.length;
				} else {
					// For non-final wrapped segments, trim trailing whitespace so
					// the cursor lands at the visible end of the visual line rather
					// than the start of the next one.
					const segText = currentLine.slice(vl.startCol, vl.startCol + vl.length);
					visualEnd = vl.startCol + segText.replace(/\s+$/, "").length;
				}
				// Already at visual line end → fall back to logical line end
				self.setCursorCol(self.state.cursorCol === visualEnd ? currentLine.length : visualEnd);
				return;
			}
		}
		self.setCursorCol(currentLine.length);
	}
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		const previous = ctx.ui.getEditorComponent();
		ctx.ui.setEditorComponent((tui, theme, keybindings) => {
			const editor = new WrapAwareEditor(tui, theme, keybindings);
			editor.onInternalsMissing = (method) => {
				ctx.ui.notify(
					`pi-wrap-aware-home-end: Editor.${method} is no longer accessible -- wrap-aware Home/End fell back to default behaviour. The extension needs updating.`,
					"warning",
				);
			};
			// Copy any handlers that a previously-set custom editor had registered,
			// so this extension composes correctly with others.
			const base = previous?.(tui, theme, keybindings);
			if (base instanceof CustomEditor) {
				editor.actionHandlers = base.actionHandlers;
				editor.onEscape = base.onEscape;
				editor.onCtrlD = base.onCtrlD;
				editor.onPasteImage = base.onPasteImage;
				editor.onExtensionShortcut = base.onExtensionShortcut;
			}
			return editor;
		});
	});
}
