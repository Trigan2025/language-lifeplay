'use babel'

import { CompositeDisposable } from 'atom';

function checkLPLineEndings(buffer, dbg_where) {
	if (buffer.getText().match(/(?:\A|[^\r])\n/)) {
		// console.log(`Language-LifePlay ${TextEditor} buffer LF to CRLF`);
		buffer.setPreferredLineEnding('\r\n');
		buffer.setText(buffer.getText().replace(/\r\n|\n/g, '\r\n'));
	}
	if (buffer.getText().match(/^\t/m)) {
		// console.log(`Language-LifePlay ${TextEditor} buffer TAB to 4-SPACES`);
		while (buffer.getText().match(/^\t/m))
			buffer.setText(buffer.getText().replace(/^((?:\t| {4})*)\t/gm, '$1    '));
	}
}
function enableLPLineEndings(self, buffer) {
	checkLPLineEndings(buffer, "TextEditor");
	self.currentBufferDisposable = buffer.onDidChange(({oldText, newText}) => {
		checkLPLineEndings(buffer, "TextEditor onDidChange");
		stop();
	});
}

const lpscopes = [
	'source.lifeplay-mod',
	'source.lifeplay-scene',
	'source.lifeplay-talkdesc',
	'source.lifeplay-character'
];
export default {
	disposables: null,
	currentBufferDisposable: null,

	provideGrammar() { return [{ grammarScopes: lpscopes }]; },

	activate() {
		this.disposables = new CompositeDisposable();

		this.disposables.add(atom.workspace.observeActiveTextEditor((editor) => {
			if (editor && editor.getBuffer) {
				if (this.currentBufferDisposable) this.currentBufferDisposable.dispose();
				if (this.currentGrammarWatcher) this.currentGrammarWatcher.dispose();

				let editorGrammar = editor.getGrammar(), buffer = editor.getBuffer();
				// console.log("Language-LifePlay TextEditor grammar: ", {name: editorGrammar.name, scopeName: editorGrammar.scopeName});

				this.currentGrammarWatcher = buffer.onDidChangeLanguageMode(() => {
					if (lpscopes.includes(editorGrammar.scopeName)) {
						if (!this.currentBufferDisposable) enableLPLineEndings(this, buffer);
					} else if (this.currentBufferDisposable) this.currentBufferDisposable.dispose();
					stop();
				});

				if (lpscopes.includes(editorGrammar.scopeName)) enableLPLineEndings(this, buffer);
			}
		}));
		let lifeplay_settings = {
			mod: {
				tabLength: atom.config.get('editor.tabLength', { scope: ['source.lifeplay-mod'] }),
				tabType: atom.config.get('editor.tabType', { scope: ['source.lifeplay-mod'] })
			},
			scene: {
				tabLength: atom.config.get('editor.tabLength', { scope: ['source.lifeplay-scene'] }),
				tabType: atom.config.get('editor.tabType', { scope: ['source.lifeplay-scene'] })
			},
			talkdesc: {
				tabLength: atom.config.get('editor.tabLength', { scope: ['source.lifeplay-talkdesc'] }),
				tabType: atom.config.get('editor.tabType', { scope: ['source.lifeplay-talkdesc'] })
			}
		};
		// console.log("LifePlay current settings:", lifeplay_settings);
		if (lifeplay_settings.mod.tabLength != 4)
			atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-mod' });
		if (lifeplay_settings.mod.tabType != "soft")
			atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-mod' });
		if (lifeplay_settings.scene.tabLength != 4)
			atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-scene' });
		if (lifeplay_settings.scene.tabType != "soft")
			atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-scene' });
		if (lifeplay_settings.talkdesc.tabLength != 4)
			atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-talkdesc' });
		if (lifeplay_settings.talkdesc.tabType != "soft")
			atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-talkdesc' });
		this.disposables.add(atom.config.onDidChange('editor.tabLength',
			{ scope: ['source.lifeplay-mod'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of mod.tabLength to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-mod' });
			}
		));
		this.disposables.add(atom.config.onDidChange('editor.tabType',
			{ scope: ['source.lifeplay-mod'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of mod.tabType to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-mod' });
			}
		));
		this.disposables.add(atom.config.onDidChange('editor.tabLength',
			{ scope: ['source.lifeplay-scene'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of scene.tabLength to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-scene' });
			}
		));
		this.disposables.add(atom.config.onDidChange('editor.tabType',
			{ scope: ['source.lifeplay-scene'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of scene.tabType to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-scene' });
			}
		));
		this.disposables.add(atom.config.onDidChange('editor.tabLength',
			{ scope: ['source.lifeplay-talkdesc'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of talkdesc.tabLength to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabLength', 4, { scopeSelector: '.source.lifeplay-talkdesc' });
			}
		));
		this.disposables.add(atom.config.onDidChange('editor.tabType',
			{ scope: ['source.lifeplay-talkdesc'] }, ({newValue, oldValue}) => {
				// console.log("LifePlay: on config change of talkdesc.tabType to %o, try to restore the default value.", newValue);
				atom.config.set('editor.tabType', "soft", { scopeSelector: '.source.lifeplay-talkdesc' });
			}
		));
	},

	deactivate() {
		if (this.currentBufferDisposable) this.currentBufferDisposable.dispose();
		if (this.currentGrammarWatcher) this.currentGrammarWatcher.dispose();
		this.disposables.dispose();
	}
}
