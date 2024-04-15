'use babel'

import { CompositeDisposable, Disposable } from 'atom';

async function checkLpLineEndings(buffer, dbg_where) {
	let lp = buffer.getLanguageMode().grammar.scopeName.match(/([a-z]+)$/);
	// console.log(`language-lifeplay::checkLpLineEndings: buffer Language-Mode = ${buffer.getLanguageMode().grammar.scopeName}; lp = ${lp ? lp[1] : lp}; is CrLf enforced = ${lp ? lifeplay_settings[lp[1]].enforced_crLf : 'UNKNOWN'}; is tab-type enforced = ${lp ? lifeplay_settings[lp[1]].enforced_tabType : 'UNKNOWN'}`);
	if (lp && lifeplay_settings[lp[1]]) {
		if (lifeplay_settings[lp[1]].enforced_crLf && buffer.getText().match(/(?:\A|[^\r])\n/)) {
			// console.log(`Language-LifePlay ${dbg_where} buffer LF to CRLF`);
			buffer.setPreferredLineEnding('\r\n');
			buffer.setText(buffer.getText().replace(/(?<=\A|[^\r])\n|\n/g, '\r\n'));
		}
		if (lifeplay_settings[lp[1]].enforced_tabType && buffer.getText().match(/^\t/m)) {
			// console.log(`Language-LifePlay ${dbg_where} buffer TAB to 4-SPACES`);
			let text = buffer.getText();
			while (text.match(/^(?: {4})*\t/m)) text = text.replace(/^((?:\t| {4})*)\t/gm, '$1    ');
			buffer.setText(text);
		}
	}
}
async function enableLpObserver(self, buffer) {
	if (!self.currentObserver) self.currentObserver = new CompositeDisposable();
	let lp = buffer.getLanguageMode().grammar.scopeName.match(/([a-z]+)$/);
	if (lp && lifeplay_settings[lp[1]]) {
		lp = lifeplay_settings[lp[1]];
		self.currentObserver.add(atom.commands.add('atom-workspace',
			{ 'language-lifeplay:toggle-enforced-tabType': (async function () {
				let enforceTT = this.enforced_tabType,
					r_enforceTT = atom.config.get('language-lifeplay.enforceTabType');
				// console.log(`DEBUG::LpObserver: on-command toggle-enforced-tabType for ${this} from { ${enforceTT}, ${r_enforceTT} }`);
				if (enforceTT===undefined || r_enforceTT==enforceTT)
					atom.config.set('language-lifeplay.enforceTabType', !r_enforceTT, { scopeSelector: this.scope });
				else {
					atom.config.unset('language-lifeplay.enforceTabType', { scopeSelector: this.scope });
					if (r_enforceTT) await this.enforceTabTypeSettings();
				}
			}).bind(lp) }
		));
		self.currentObserver.add(atom.commands.add('atom-workspace',
			{ 'language-lifeplay:toggle-enforced-crlf': (async function () {
				let enforceCrLf = this.enforced_crLf,
					r_enforceCrLf = atom.config.get('language-lifeplay.enforceCrLf');
				// console.log(`DEBUG::LpObserver: on-command toggle-enforced-crlf for ${this} from { ${enforceCrLf}, ${r_enforceCrLf} }`);
				if (enforceCrLf===undefined || r_enforceCrLf==enforceCrLf)
					atom.config.set('language-lifeplay.enforceCrLf', !r_enforceCrLf, { scopeSelector: this.scope });
				else {
					atom.config.unset('language-lifeplay.enforceCrLf', { scopeSelector: this.scope });
					if (r_enforceCrLf) await this.enforceTabTypeSettings();
				}
			}).bind(lp) }
		));
		await checkLpLineEndings(buffer, "TextEditor");
		self.currentObserver.add(buffer.onDidChange(async ({oldText, newText}) => {
			await checkLpLineEndings(buffer, "TextEditor onDidChange"); stop();
		}));
	}
}

class LpSettings {
	constructor(scope_name) { this.scope = scope_name=='*' ? '*' : '.'+lpscopes[scope_name]; }
	toString() { return this.scope=='*' ? 'language-lifeplay' : this.scope; }
	get enforced_tabType() {
		if (this.scope=='*') return atom.config.get('language-lifeplay.enforceTabType');
		return atom.config.get('language-lifeplay.enforceTabType', { scope: [this.scope] });
	}
	get enforced_crLf() {
		if (this.scope=='*') return atom.config.get('language-lifeplay.enforceCrLf');
		return atom.config.get('language-lifeplay.enforceCrLf', { scope: [this.scope] });
	}
	get tabLength() {
		if (this.scope=='*') return atom.config.get('editor.tabLength');
		return atom.config.get('editor.tabLength', { scope: [this.scope] });
	}
	get tabType() {
		if (this.scope=='*') return atom.config.get('editor.tabType');
		return atom.config.get('editor.tabType', { scope: [this.scope] });
	}
	async enforceTabTypeSettings(from_root) {
		if (this.scope=='*') {
			let tl = this.tabLength, tt = this.tabType;
			await Promise.all(Object.keys(lpscopes).map((scope) => {
				return Promise.all([
					lifeplay_settings[scope].tabLengthCallback({ newValue: tl, root: true }),
					lifeplay_settings[scope].tabTypeCallback({ newValue: tt, root: true })
				]);
			}));
		} else {
			atom.config.set('editor.tabLength', 4, { scopeSelector: this.scope });
			atom.config.set('editor.tabType', "soft", { scopeSelector: this.scope });
		}
		// console.log(`DEBUG::enforceTabTypeSettings: from_root is ${from_root}`);
		if (from_root!=true) {
			const buffer = atom.workspace.getActiveTextEditor()?.getBuffer();
			// console.log(`DEBUG: the buffer was ${buffer} during enforceTabTypeSettings did-change.`);
			if (buffer) await checkLpLineEndings(buffer, "enforceTabTypeSettings did-change");
		}
	}
	async tabLengthCallback({oldValue, newValue, root}) {
		if (this.scope=='*') atom.config.unset('language-lifeplay.editor.tabLength');
		else if (((newValue!==undefined && newValue!=4)||(newValue===undefined && this.tabLength!=4))
			&& this.enforced_tabType) {
			// console.log(`LifePlay: on config change of ${this}.tabLength to ${newValue}, try to restore the default value.`);
			await this.enforceTabTypeSettings(root);
		} else if (newValue===undefined||(root===true && newValue==4)) {
			atom.config.unset('editor.tabLength', { scope: [this.scope] });
		}
	}
	async tabTypeCallback({oldValue, newValue, root}) {
		if (this.scope=='*') atom.config.unset('language-lifeplay.editor.tabType');
		else if (((newValue!==undefined && newValue!="soft")||(newValue===undefined && this.tabType!="soft"))
			&& this.enforced_tabType) {
			// console.log(`LifePlay: on config change of ${this}.tabType to ${newValue}, try to restore the default value.`);
			await this.enforceTabTypeSettings(root);
		} else if (newValue===undefined||(root===true && newValue=="soft")) {
			atom.config.unset('editor.tabType', { scope: [this.scope] });
		}
	}
}

const lpscopes = {
	mod: 'source.lifeplay-mod',
	scene: 'source.lifeplay-scene',
	talkdesc: 'source.lifeplay-talkdesc',
	character: 'source.lifeplay-character'
}, lifeplay_settings = {
	'*': new LpSettings('*'),
	mod: new LpSettings('mod'),
	scene: new LpSettings('scene'),
	talkdesc: new LpSettings('talkdesc'),
	character: new LpSettings('character')
};
export default {
	disposables: null,
	currentObserver: null,
	currentGrammarWatcher: null,

	provideGrammar() { return [{ grammarScopes: Object.values(lpscopes) }]; },

	activate() {
		this.disposables = new CompositeDisposable();

		this.disposables.add(atom.workspace.observeActiveTextEditor(async (editor) => {
			if (editor && editor.getBuffer) {
				if (this.currentObserver) this.currentObserver.dispose();
				if (this.currentGrammarWatcher) this.currentGrammarWatcher.dispose();

				let editorGrammar = editor.getGrammar(), buffer = editor.getBuffer();
				// console.log("Language-LifePlay TextEditor grammar: ", {name: editorGrammar.name, scopeName: editorGrammar.scopeName});

				this.currentGrammarWatcher = buffer.onDidChangeLanguageMode(async () => {
					if (this.currentObserver) this.currentObserver.dispose();
					if (Object.values(lpscopes).includes(editorGrammar.scopeName)) await enableLpObserver(this, buffer);
					stop();
				});

				if (Object.values(lpscopes).includes(editorGrammar.scopeName)) await enableLpObserver(this, buffer);
			}
		}));
		let lp = lifeplay_settings['*'];
		if (lp.enforced_tabType) {
			if (lp.tabLength != 4 || lp.tabType != "soft") lp.enforceTabTypeSettings();
		}
		this.disposables.add(atom.config.onDidChange('language-lifeplay.enforceTabType',
			lp.enforceTabTypeSettings.bind(lp)
		));
		this.disposables.add(atom.config.onDidChange('language-lifeplay.enforceCrLf',
			lp.enforceTabTypeSettings.bind(lp)
		));
		this.disposables.add(atom.config.onDidChange('editor.tabLength',
			lp.enforceTabTypeSettings.bind(lp)
		));
		this.disposables.add(atom.config.onDidChange('editor.tabType',
			lp.enforceTabTypeSettings.bind(lp)
		));
		this.disposables.add(atom.config.onDidChange('language-lifeplay.editor.tabLength',
			lp.tabLengthCallback.bind(lp)
		));
		this.disposables.add(atom.config.onDidChange('language-lifeplay.editor.tabType',
			lp.tabTypeCallback.bind(lp)
		));
		for (let _lp of Object.keys(lpscopes)) {
			lp = lifeplay_settings[_lp];
			if (lp.enforced_tabType) {
				if (lp.tabLength != 4 || lp.tabType != "soft") lp.enforceTabTypeSettings();
			}
			this.disposables.add(atom.config.onDidChange('language-lifeplay.enforceTabType', { scope: [lp.scope] },
				(async function ({oldValue, newValue}) {
					const buffer = atom.workspace.getActiveTextEditor()?.getBuffer();
					// console.log(`DEBUG: the buffer was ${buffer} during enforceTabType of ${this} did-change.`);
					if (buffer) await checkLpLineEndings(buffer, `enforceTabType of ${this} did-change`);
				}).bind(lp)
			));
			this.disposables.add(atom.config.onDidChange('language-lifeplay.enforceCrLf', { scope: [lp.scope] },
				(async function ({oldValue, newValue}) {
					const buffer = atom.workspace.getActiveTextEditor()?.getBuffer();
					// console.log(`DEBUG: the buffer was ${buffer} during enforceCrLf of ${this} did-change.`);
					if (buffer) await checkLpLineEndings(buffer, `enforceCrLf of ${this} did-change`);
				}).bind(lp)
			));
			this.disposables.add(atom.config.onDidChange('editor.tabLength', { scope: [lp.scope] },
				lp.tabLengthCallback.bind(lp)
			));
			this.disposables.add(atom.config.onDidChange('editor.tabType', { scope: [lp.scope] },
				lp.tabTypeCallback.bind(lp)
			));
		}
	},

	deactivate() {
		if (this.currentObserver) this.currentObserver.dispose();
		if (this.currentGrammarWatcher) this.currentGrammarWatcher.dispose();
		this.disposables.dispose();
	}
}
