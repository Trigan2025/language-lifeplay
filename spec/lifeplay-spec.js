'use babel'

// LifePlay mod files only accepted CRLF (\r\n) endings, but tokenizeLines will not support it, so, letting it just as an option for other uses.
function t(nb) { return '    '.repeat(nb); }
function l(txt, rn=false) { return txt+(rn ? '\r\n' : '\n'); }
function li(i, txt, rn=false) { return t(i)+txt+(rn ? '\r\n' : '\n'); }
function S(A) { return A.reduce((acc, i) => { acc.push(i.scopes); return acc; }, []); }
function txt(A, extra_scopes=0) {
	return A.filter((v) => { return v.value.trim() != "" || v.scopes.length-extra_scopes > 1; });
}

describe('Language-LifePlay', () => {
	let editor=atom, grammar;

	beforeEach(() => {
		waitsForPromise({timeout: 400, label: 'language activation'},
			() => editor.packages.activatePackage('language-lifeplay')
		);
	});

	describe('Line endings managing', () => {
		it("should be activated", () => {
			expect(editor.packages.isPackageActive("language-lifeplay")).toBe(true);
		});

		beforeEach(() => {
			waitsForPromise({timeout: 400, label: 'opening sample'}, () => {
				return editor.workspace.open('sample-LF.lpscene').then((e) => {
					// console.log("sample-LF.lpscene loading returns: ", e);
				});
			});
		});

		it('verify line endings', () => {
			expect(atom.workspace.getActiveTextEditor().getText()).toBe(''+
				li(0,'WHAT: none', true)+
				li(1,'SceneStart()', true)+
				li(1,'continue = true', true)+
				li(1,'while continue', true)+
				li(2,'if true', true)+
				li(3,'continue = false', true)+
				li(3,'//...', true)+
				li(2,'endIf', true)+
				li(1,'endWhile', true)+
				li(1,'SceneEnd()', true)
			);
		});
	});

	describe('Settings managing', () => {
		it("should be activated", () => {
			expect(editor.packages.isPackageActive("language-lifeplay")).toBe(true);
		});

		it('verify initial settings', () => {
			expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-mod'] })).toBe(4);
			expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-scene'] })).toBe(4);
			expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-talkdesc'] })).toBe(4);
			expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-mod'] })).toBe("soft");
			expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-scene'] })).toBe("soft");
			expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-talkdesc'] })).toBe("soft");
		});

		describe('modifying settings', () => {
			beforeEach(() => {
				editor.config.set('editor.tabLength', 7, { scopeSelector: '.source.lifeplay-mod' });
				editor.config.set('editor.tabLength', 7, { scopeSelector: '.source.lifeplay-scene' });
				editor.config.set('editor.tabLength', 7, { scopeSelector: '.source.lifeplay-talkdesc' });
				editor.config.set('editor.tabType', "hard", { scopeSelector: '.source.lifeplay-mod' });
				editor.config.set('editor.tabType', "auto", { scopeSelector: '.source.lifeplay-scene' });
				editor.config.set('editor.tabType', "hard", { scopeSelector: '.source.lifeplay-talkdesc' });
			});

			it('verify that the settings have been correctly enforced', () => {
				expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-mod'] })).toBe(4);
				expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-scene'] })).toBe(4);
				expect(editor.config.get('editor.tabLength', { scope: ['source.lifeplay-talkdesc'] })).toBe(4);
				expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-mod'] })).toBe("soft");
				expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-scene'] })).toBe("soft");
				expect(editor.config.get('editor.tabType', { scope: ['source.lifeplay-talkdesc'] })).toBe("soft");
			});
		});
	});

	describe('Grammars', () => {
		it("should be activated", () => {
			expect(editor.packages.isPackageActive("language-lifeplay")).toBe(true);
		});

		describe('LifePlay-Mod grammar', () => {
			beforeEach(() => {
				runs(() => {
					grammar = editor.grammars.grammarForScopeName('source.lifeplay-mod');
				});
			});

			it('load the grammar', () => {
				expect(grammar).toBeDefined();
				expect(grammar.scopeName).toBe('source.lifeplay-mod');
			});

			it('tokenizes LP-Mod', () => {
				const tokens = grammar.tokenizeLines(''+
					l("MODULE_ID: vin_VanillaRealistic")+
					l("MODULE_NAME: Official Vanilla Adult Module")+
					l("MODULE_AUTHOR:@Vinfamy")+
					l("MODULE_LINK: https://www.patreon.com/vinfamy")+
					l("MODULE_DESCRIPTION: Vanilla sexual situations that can happen in an average person's real life.")+
					l("MODULE_VERSION: 1.0.0")+
					l("MODULE_REQUIREMENTS: @_Base")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "MODULE_", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: "ID", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold', 'invalid'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "vin_VanillaRealistic", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "MODULE_NAME", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "Official Vanilla Adult Module", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "MODULE_AUTHOR", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "@", scopes: [grammar.scopeName, 'invalid'] },
					{ value: "Vinfamy", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "MODULE_LINK", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "https", scopes: [grammar.scopeName, 'meta.link', 'constant'] },
					{ value: "://", scopes: [grammar.scopeName, 'meta.link'] },
					{ value: "www.patreon.com", scopes: [grammar.scopeName, 'meta.link', 'string'] },
					{ value: "/", scopes: [grammar.scopeName, 'meta.link', 'meta.separator'] },
					{ value: "vinfamy", scopes: [grammar.scopeName, 'meta.link'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "MODULE_DESCRIPTION", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: " Vanilla sexual situations that can happen in an average person's real life.", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "MODULE_VERSION", scopes: [grammar.scopeName, 'punctuation.definition.heading'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "1.0.0", scopes: [grammar.scopeName, 'none'] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "MODULE_REQUIREMENTS", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "@", scopes: [grammar.scopeName, 'invalid'] },
					{ value: "_Base", scopes: [grammar.scopeName] }
				]);
			});

			it('tokenizes LP-Quest', () => {
				const tokens = grammar.tokenizeLines(''+
					l("QUEST_ID: mpwill")+
					l("NAME: Missing Person - William M")+
					l("DESCRIPTION: Take part in a missing person investigation for William M, …")+
					l("ONCE: true")+
					l("CONDITIONS: none")+
					l("START: mpwill_start")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "QUEST_", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold', 'invalid'] },
					{ value: "ID", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "mpwill", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "NAME", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "Missing Person - William M", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "DESC", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: "RIPTION", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold', 'invalid'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: " Take part in a missing person investigation for William M, …", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "ONCE", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "true", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "CONDITIONS", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "none", scopes: [grammar.scopeName, 'constant.none'] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "START", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "mpwill_start", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
			});

			it('tokenizes LP-Action', () => {
				const tokens = grammar.tokenizeLines(''+
					l("ACTION_UNIQUEID: drink_coffee")+
					l("ACTION_NAME: Drink coffee")+
					l("WHERE: cafe, coffee ,department_store, fast_food, hotel")+
					l("WHEN: 0 -24")+
					l("MINUTES: 5 - 20")+
					l("TIMEOUT_MINUTES: 120")+
					l("ALSO_TIMEOUT: drink_coffee_in, drink_tea, drink_tea_in")+
					l("EFFECTS: money -2 (START), mood +2 (END), energy +10 (DURATION), intoxication -25 (DURATION)")+
					l("ACTION_UNIQUEID:")+
					l("CONDITIONS: money >= 2 (STAT_COMPARE)")+
					l("MOVE_FIRST: true")+
					l("SCENE_ALWAYS:")+
					l("ANIMATION: drinktea")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "ACTION_UNIQUEID", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "drink_coffee", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "ACTION_NAME", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "Drink coffee", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "WHERE", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "cafe", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "coffee", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "department_store", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "fast_food", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "hotel", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "WHEN", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "0", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "-", scopes: [grammar.scopeName, 'meta.separator.dash'] },
					{ value: "24", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "MINUTES", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "5", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "-", scopes: [grammar.scopeName, 'meta.separator.dash'] },
					{ value: "20", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "TIMEOUT_MINUTES", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "120", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "ALSO_TIMEOUT", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "drink_coffee_in", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "drink_tea", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "drink_tea_in", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[7])).toEqual([
					{ value: "EFFECTS", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "money", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: "-", scopes: [grammar.scopeName, 'constant.numeric', 'keyword.operator.other.unit'] },
					{ value: "2", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.section.parens.open'] },
					{ value: "START", scopes: [grammar.scopeName, 'constant'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.section.parens.close'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "mood", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: "+", scopes: [grammar.scopeName, 'constant.numeric', 'keyword.operator.other.unit'] },
					{ value: "2", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.section.parens.open'] },
					{ value: "END", scopes: [grammar.scopeName, 'constant'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.section.parens.close'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "energy", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: "+", scopes: [grammar.scopeName, 'constant.numeric', 'keyword.operator.other.unit'] },
					{ value: "10", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.section.parens.open'] },
					{ value: "DURATION", scopes: [grammar.scopeName, 'constant'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.section.parens.close'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "intoxication", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: "-", scopes: [grammar.scopeName, 'constant.numeric', 'keyword.operator.other.unit'] },
					{ value: "25", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.section.parens.open'] },
					{ value: "DURATION", scopes: [grammar.scopeName, 'constant'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.section.parens.close'] }
				]);
				expect(txt(tokens[8])).toEqual([
					{ value: "ACTION_UNIQUEID", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] }
				]);
				expect(txt(tokens[9])).toEqual([
					{ value: "CONDITIONS", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "money", scopes: [grammar.scopeName, 'entity.name.section.label'] },
					{ value: ">=", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "2", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.section.parens.open'] },
					{ value: "STAT_COMPARE", scopes: [grammar.scopeName, 'constant'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.section.parens.close'] }
				]);
				expect(txt(tokens[10])).toEqual([
					{ value: "MOVE_FIRST", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "true", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
				expect(txt(tokens[11])).toEqual([
					{ value: "SCENE_ALWAYS", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] }
				]);
				expect(txt(tokens[12])).toEqual([
					{ value: "ANIMATION", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "drinktea", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
			});

			it('tokenizes LP-Stat', () => {
				const tokens = grammar.tokenizeLines(''+
					l("STAT_UNIQUEID: age")+
					l("STAT_NAME: Age; How many years old is this person?")+
					l("PLAYER_ONLY: false")+
					l("HIGHER_BETTER: no_difficulty_adjustment")+
					l("STAT_MIN: 18")+
					l("STAT_MAX: 111")+
					l("DAILY_CHANGE: 0.00273972602")+
					l("DEFAULT_VALUE: 33")+
					l("NPC_ONLY: false")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "STAT_", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: "UNIQUE", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold', 'invalid'] },
					{ value: "ID", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "age", scopes: [grammar.scopeName, 'entity.name.section.label'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "STAT_NAME", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "Age", scopes: [grammar.scopeName, 'string'] },
					{ value: ";", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: " How many years old is this person?", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "PLAYER_ONLY", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "false", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "HIGHER_BETTER", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "no_difficulty_adjustment", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "STAT_MIN", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "18", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "STAT_MAX", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "111", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "DAILY_CHANGE", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "0.00273972602", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[7])).toEqual([
					{ value: "DEFAULT_VALUE", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[8])).toEqual([
					{ value: "NPC_ONLY", scopes: [grammar.scopeName, 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "false", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
			});
		});

		describe('LifePlay-Scene grammar', () => {
			beforeEach(() => {
				runs(() => {
					grammar = editor.grammars.grammarForScopeName('source.lifeplay-scene');
				});
			});

			it('load the grammar', () => {
				expect(grammar).toBeDefined();
				expect(grammar.scopeName).toBe('source.lifeplay-scene');
			});

			it('tokenizes LP-Scene', () => {
				const tokens = grammar.tokenizeLines(''+
					l("WHAT: all, -sleep, -nap ")+
					l("WHERE: home")+
					l("WHEN: 8 - 20")+
					l("WHO: Actor = getSpecific(Neighbour); If Actor:age > 45 && !Actor.hasRelationship(ParentChild) && Random(20, 100) < Actor:rapportwithplayer")+
					l("OTHER: isAtHome() && !isWithCompanion()")+
					li(1,"SceneStart() // Brings up all the necessities")+
					li(1,"\"I was walking past my neighbour <Actor.name>'s apartment.\"")+
					li(1,"dice = Random(0, 100)")+
					li(1,"Actor2 = Actor.generatePersonMatchRace()")+
					li(1,"Actor2.matchLastName(Actor)")+
					li(1,"Actor2:age => Actor:age - Random(20, 27)")+
					li(1,"addNpcRelationship(ParentChild, Actor, Actor2)")+
					li(1,"Actor(Happy)::\"<Player.name>, come over, let me introduce you to my <Actor2.son_or_daughter>, <Actor2.name>. <Actor2.name>, this is my neighbour <Player.name>.\"")+
					li(1,"If dice >= 70 && Player:attractiveness > [Actor2:attractiveness + 10]] && Actor2.isInterestedIn(Player)")+
					li(2,"Actor2:rapportwithplayer += [dice - 70] / 20")+
					li(2,"Actor2(Excited) :: \"Damn, you look good! Fancy a date with me?\"")+
					li(2,"0:: Player.isInterestedIn(Actor2) :: \"Of course, why not.\"")+
					li(2,"1:: \"Sorry but it will be a no.\"")+
					li(2,"")+
					li(1,"Else")+
					li(2,"Actor2:: \"Hi, nice to meet you <Player.name>\".")+
					li(1,"EndIf")+
					li(1,"SceneEnd()")
				);

				expect(txt(tokens[0],1)).toEqual([
					{ value: "WHAT", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "all", scopes: [grammar.scopeName, 'lpscene', 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'meta.separator'] },
					{ value: "-", scopes: [grammar.scopeName, 'lpscene', 'keyword.other.unit'] },
					{ value: "sleep", scopes: [grammar.scopeName, 'lpscene', 'entity.name.section.label'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'meta.separator'] },
					{ value: "-", scopes: [grammar.scopeName, 'lpscene', 'keyword.other.unit'] },
					{ value: "nap", scopes: [grammar.scopeName, 'lpscene', 'entity.name.section.label'] }
				]);
				expect(txt(tokens[1],1)).toEqual([
					{ value: "WHERE", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "home", scopes: [grammar.scopeName, 'lpscene', 'entity.name.section.label'] }
				]);
				expect(txt(tokens[2],1)).toEqual([
					{ value: "WHEN", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "8", scopes: [grammar.scopeName, 'lpscene', 'constant.numeric'] },
					{ value: "-", scopes: [grammar.scopeName, 'lpscene', 'meta.separator.dash'] },
					{ value: "20", scopes: [grammar.scopeName, 'lpscene', 'constant.numeric'] }
				]);
				expect(txt(tokens[3],1)).toEqual([
					{ value: "WHO", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator'] },
					{ value: "getSpecific", scopes: [grammar.scopeName, 'lpscene', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Neighbour", scopes: [grammar.scopeName, 'lpscene', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: ";", scopes: [grammar.scopeName, 'lpscene', 'keyword.control.separator'] },
					{ value: "If", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'meta.delimiter.colon'] },
					{ value: "age", scopes: [grammar.scopeName, 'lpscene', 'variable.other.member'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator'] },
					{ value: "45", scopes: [grammar.scopeName, 'lpscene', 'constant.numeric'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator.control'] },
					{ value: "!", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'meta.delimiter.period'] },
					{ value: "hasRelationship", scopes: [grammar.scopeName, 'lpscene', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "ParentChild", scopes: [grammar.scopeName, 'lpscene', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator.control'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpscene', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "20", scopes: [grammar.scopeName, 'lpscene', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'meta.separator'] },
					{ value: "100", scopes: [grammar.scopeName, 'lpscene', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'meta.delimiter.colon'] },
					{ value: "rapportwithplayer", scopes: [grammar.scopeName, 'lpscene', 'variable.other.member'] }
				]);
				expect(txt(tokens[4],1)).toEqual([
					{ value: "OTHER", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.heading.bold'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'keyword'] },
					{ value: "isAtHome", scopes: [grammar.scopeName, 'lpscene', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator.control'] },
					{ value: "!", scopes: [grammar.scopeName, 'lpscene', 'keyword.operator'] },
					{ value: "isWithCompanion", scopes: [grammar.scopeName, 'lpscene', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[5],2)).toEqual([
					{ value: "SceneStart", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "// Brings up all the necessities", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'comment'] }
				]);
				expect(txt(tokens[6],2)).toEqual([
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "I was walking past my neighbour ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: "'s apartment.", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] }
				]);
				expect(txt(tokens[7],2)).toEqual([
					{ value: "dice", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "0", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.separator'] },
					{ value: "100", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[8],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.period'] },
					{ value: "generatePersonMatchRace", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[9],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.period'] },
					{ value: "matchLastName", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[10],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.colon'] },
					{ value: "age", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable.other.member'] },
					{ value: "=>", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.colon'] },
					{ value: "age", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable.other.member'] },
					{ value: "-", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "20", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.separator'] },
					{ value: "27", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[11],2)).toEqual([
					{ value: "addNpcRelationship", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "ParentChild", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.separator'] },
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.separator'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[12],2)).toEqual([
					{ value: "Actor", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.section.parens.begin'] },
					{ value: "Happy", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.section.label'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.section.parens.end'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ", come over, let me introduce you to my ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "son_or_daughter", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ", ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ". ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ", this is my neighbour ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] }
				]);
				expect(txt(tokens[13],2)).toEqual([
					{ value: "If", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword'] },
					{ value: "dice", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable'] },
					{ value: ">=", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "70", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator.control'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.colon'] },
					{ value: "attractiveness", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable.other.member'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "[", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control.storage.begin.bracket.square'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.colon'] },
					{ value: "attractiveness", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable.other.member'] },
					{ value: "+", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "10", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: "]", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control.storage.end.bracket.square'] },
					{ value: "]", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'invalid.illegal'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator.control'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.period'] },
					{ value: "isInterestedIn", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[14],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.colon'] },
					{ value: "rapportwithplayer", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable.other.member'] },
					{ value: "+=", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "[", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control.storage.begin.bracket.square'] },
					{ value: "dice", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'variable'] },
					{ value: "-", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "70", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: "]", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control.storage.end.bracket.square'] },
					{ value: "/", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.operator'] },
					{ value: "20", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] }
				]);
				expect(txt(tokens[15],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.section.parens.begin'] },
					{ value: "Excited", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.section.label'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.section.parens.end'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "Damn, you look good! Fancy a date with me?", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] }
				]);
				expect(txt(tokens[16],2)).toEqual([
					{ value: "0", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.delimiter.period'] },
					{ value: "isInterestedIn", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "Of course, why not.", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] }
				]);
				expect(txt(tokens[17],2)).toEqual([
					{ value: "1", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'constant.numeric'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "Sorry but it will be a no.", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] }
				]);
				expect(txt(tokens[19],2)).toEqual([
					{ value: "Else", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword'] }
				]);
				expect(txt(tokens[20],2)).toEqual([
					{ value: "Actor2", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'meta.class.variable'] },
					{ value: "::", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword.control'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.begin'] },
					{ value: "Hi, nice to meet you ", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "Player", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: "\"", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'string.quote.double.end'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'invalid.illegal'] }
				]);
				expect(txt(tokens[21],2)).toEqual([
					{ value: "EndIf", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'keyword'] }
				]);
				expect(txt(tokens[22],2)).toEqual([
					{ value: "SceneEnd", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpscene', 'lpscene-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
			});

			it('tokenizes LP-AI', () => {
				const tokens = grammar.tokenizeLines(''+
					l("UNKNOWN: line1")+
					l("WHAT: line2")+
					l("line3")+
					l("    line4")+
					l("line5")+
					li(1,"ThisWeek = AI.getActorVar(groceries_thisweek)")+
					li(1,"Today = AI.getActorVar(groceries_today)")+
					li(1,"If Today == 0 && ThisWeek < AI:cooking*Random(0.04, 0.08)")+
					li(2,"Home = AI.getBuilding(home) // Home, sweet home")+
					li(2,"If Random(0, 100) < 50 // 50% chances")+
					li(3,"Dest = Home.findNearbyBuilding(convenience, greengrocer, marketplace, supermarket, variety_store)")+
					li(3,"ThisWeek += 1")+
					li(3,"Add = Random(1, 2.5)")+
					li(2,"else")+
					li(3,"Dest = Home.findNearbyBuilding(alcohol, bakery, beverages, butcher, confectionery, deli, florist, pet, seafood, tobacco)")+
					li(3,"ThisWeek += 0.5")+
					li(3,"Add = Random(0.5, 1.5)")+
					li(2,"Endif")+
					li(2,"Today += 1")+
					li(2,"AI.setActorVar(groceries_thisweek, ThisWeek)")+
					li(2,"AI.setActorVar(groceries_today, Today)")+
					li(2,"Until = HoursElapsed + Add                     ")+
					li(2,"AI.setCurrentLocation(Dest)")+
					li(2,"AI.setUntil(Until)")+
					li(1,"endIf")
				);

				expect(txt(tokens[0],1)[0]).toEqual({ value: "UNKNOWN: line1", scopes: [grammar.scopeName, 'lpai', 'comment.line1'] });
				expect(txt(tokens[1],1)[0]).toEqual({ value: "WHAT: line2", scopes: [grammar.scopeName, 'lpai', 'comment.line2'] });
				expect(txt(tokens[2],1)[0]).toEqual({ value: "line3", scopes: [grammar.scopeName, 'lpai', 'comment.line3'] });
				expect(txt(tokens[3],1)[0]).toEqual({ value: "    line4", scopes: [grammar.scopeName, 'lpai', 'comment.line4'] });
				expect(txt(tokens[4],1)[0]).toEqual({ value: "line5", scopes: [grammar.scopeName, 'lpai', 'comment.line5'] });
				expect(txt(tokens[5],2)).toEqual([
					{ value: "ThisWeek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "getActorVar", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "groceries_thisweek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[6],2)).toEqual([
					{ value: "Today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "getActorVar", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "groceries_today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[7],2)).toEqual([
					{ value: "If", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword'] },
					{ value: "Today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "==", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "0", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: "&&", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator.control'] },
					{ value: "ThisWeek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.colon'] },
					{ value: "cooking", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'variable.other.member'] },
					{ value: "*", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "0.04", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "0.08", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[8],2)).toEqual([
					{ value: "Home", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "getBuilding", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "home", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "// Home, sweet home", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'comment'] }
				]);
				expect(txt(tokens[9],2)).toEqual([
					{ value: "If", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "0", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "100", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "<", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "50", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: "// 50% chances", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'comment'] }
				]);
				expect(txt(tokens[10],2)).toEqual([
					{ value: "Dest", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Home", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "findNearbyBuilding", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "convenience", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "greengrocer", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "marketplace", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "supermarket", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "variety_store", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[11],2)).toEqual([
					{ value: "ThisWeek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "+=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "1", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] }
				]);
				expect(txt(tokens[12],2)).toEqual([
					{ value: "Add", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "1", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "2.5", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[13],2)).toEqual([
					{ value: "else", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword'] }
				]);
				expect(txt(tokens[14],2)).toEqual([
					{ value: "Dest", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Home", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "findNearbyBuilding", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "alcohol", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "bakery", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "beverages", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "butcher", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "confectionery", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "deli", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "florist", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "pet", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "seafood", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "tobacco", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[15],2)).toEqual([
					{ value: "ThisWeek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "+=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "0.5", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] }
				]);
				expect(txt(tokens[16],2)).toEqual([
					{ value: "Add", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "0.5", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "1.5", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[17],2)).toEqual([
					{ value: "Endif", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword'] }
				]);
				expect(txt(tokens[18],2)).toEqual([
					{ value: "Today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "+=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "1", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'constant.numeric'] }
				]);
				expect(txt(tokens[19],2)).toEqual([
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "setActorVar", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "groceries_thisweek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "ThisWeek", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[20],2)).toEqual([
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "setActorVar", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.support.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "groceries_today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.separator'] },
					{ value: "Today", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[21],2)).toEqual([
					{ value: "Until", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "=", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "HoursElapsed", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: "+", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword.operator'] },
					{ value: "Add", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] }
				]);
				expect(txt(tokens[22],2)).toEqual([
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "setCurrentLocation", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Dest", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[23],2)).toEqual([
					{ value: "AI", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'meta.delimiter.period'] },
					{ value: "setUntil", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Until", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[24],2)).toEqual([
					{ value: "endIf", scopes: [grammar.scopeName, 'lpai', 'lpai-body', 'keyword'] }
				]);
			});
		});

		describe('LifePlay-TalkDesc grammar', () => {
			beforeEach(() => {
				runs(() => {
					grammar = editor.grammars.grammarForScopeName('source.lifeplay-talkdesc');
				});
			});

			it('load the grammar', () => {
				expect(grammar).toBeDefined();
				expect(grammar.scopeName).toBe('source.lifeplay-talkdesc');
			});

			it('tokenizes LP-Desc', () => {
				const tokens = grammar.tokenizeLines(''+
					l("*START* Tag(Solo)")+
					li(1,"I don’t know what came in my mind.")+
					l("## // And a desc start")+
					l("Tag(Solo, NonSexual) && [A1:perversion + [A1:intelligence)*2]] / 3 < Random(30, 50)")+
					li(1,"I begin to search a chair.")+
					li(1,"But I ended up wandering aimlessly.")+
					l("##")+
					l("*END* Tag(Solo) // To be continued")+
					li(1,"So I let it go.")+
					l("##")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "START", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Solo", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "I don’t know what came in my mind.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "// And a desc start", scopes: [grammar.scopeName, 'comment'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Solo", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "NonSexual", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "&&", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "[", scopes: [grammar.scopeName, 'keyword.control.storage.begin.bracket.square'] },
					{ value: "A1", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "perversion", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: "+", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "[", scopes: [grammar.scopeName, 'keyword.control.storage.begin.bracket.square'] },
					{ value: "A1", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "intelligence", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: ")", scopes: [grammar.scopeName, 'invalid.illegal'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "2", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "]", scopes: [grammar.scopeName, 'keyword.control.storage.end.bracket.square'] },
					{ value: "]", scopes: [grammar.scopeName, 'keyword.control.storage.end.bracket.square'] },
					{ value: "/", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "3", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "<", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "Random", scopes: [grammar.scopeName, 'entity.name.support.function.any-method'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "30", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "50", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "I begin to search a chair.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "  ", scopes: [grammar.scopeName, 'invalid.illegal'] },
					{ value: "  But I ended up wandering aimlessly.", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'keyword.control'] }
				]);
				expect(txt(tokens[7])).toEqual([
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "END", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Solo", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "// To be continued", scopes: [grammar.scopeName, 'comment'] }
				]);
				expect(txt(tokens[8])).toEqual([
					{ value: "So I let it go.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[9])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'keyword.control'] }
				]);
			});

			it('tokenizes LP-Talk', () => {
				const tokens = grammar.tokenizeLines(''+
					l("Tag(Threesome, Hugging) && [Tag(Gay)||Tag(Lesbian) || Tag(Bisexual)]")+
					li(1,"Yeah, touch me babies.")+
					li(1,"I like the feeling of your hands upon me.")+
					li(2,"Its my pleasure to touch you.")+
					l("##")+
					l("*START* Tag(Threesome, Hugging)")+
					li(1,"We position ourselves for a group hugging.")+
					l("##")+
					l("*START* Tag(Threesome, Hugging) && [Tag(Gay)||Tag(Lesbian) || Tag(Bisexual)]")+
					li(1,"Came here and touch my body, my little babies.")+
					li(1,"Huhu, you’re not the only one that going be touch, here.")+
					li(1,"Be ready for my magic hands! Haha")+
					l("  ##")+
					l("*END* Tag(Threesome, Hugging) && A1:attractiveness > 74 && [A3:sneak*4 + A3:martial*3 + A3:fitness]/8 > 74")+
					li(1,"Your hands were nimble, <A3.name>.")+
					li(1,"I feel really thingy now.")+
					li(1,"Haha, thanks. And your skin were very smooth, <A2.name>.")+
					l("##")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Threesome", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "Hugging", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "&&", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "[", scopes: [grammar.scopeName, 'keyword.control.storage.begin.bracket.square'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Gay", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "||", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Lesbian", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "||", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Bisexual", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "]", scopes: [grammar.scopeName, 'keyword.control.storage.end.bracket.square'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "Yeah, touch me babies.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "I like the feeling of your hands upon me.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: t(1), scopes: [grammar.scopeName, 'blank'] },
					{ value: "Its my pleasure to touch you.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'keyword.control'] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "START", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Threesome", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "Hugging", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "We position ourselves for a group hugging.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[7])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'invalid.illegal'] }
				]);
				expect(txt(tokens[8]).slice(0, 3)).toEqual([
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "START", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] }
				]);
				expect(txt(tokens[8]).slice(3)).toEqual(txt(tokens[0]));
				expect(txt(tokens[9])).toEqual([
					{ value: "Came here and touch my body, my little babies.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[10])).toEqual([
					{ value: "Huhu, you’re not the only one that going be touch, here.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[11])).toEqual([
					{ value: "Be ready for my magic hands! Haha", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[12])).toEqual([
					{ value: "  #", scopes: [grammar.scopeName, 'invalid.illegal'] },
					{ value: "#", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[13])).toEqual([
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "END", scopes: [grammar.scopeName, 'keyword'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword', 'meta.selector'] },
					{ value: "Tag", scopes: [grammar.scopeName, 'entity.name.function'] },
					{ value: "(", scopes: [grammar.scopeName, 'punctuation.definition.parameters.begin.bracket.round'] },
					{ value: "Threesome", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "Hugging", scopes: [grammar.scopeName, 'function.parameter.variable'] },
					{ value: ")", scopes: [grammar.scopeName, 'punctuation.definition.parameters.end.bracket.round'] },
					{ value: "&&", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "A1", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "attractiveness", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: ">", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "74", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "&&", scopes: [grammar.scopeName, 'keyword.operator.control'] },
					{ value: "[", scopes: [grammar.scopeName, 'keyword.control.storage.begin.bracket.square'] },
					{ value: "A3", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "sneak", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "4", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "+", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "A3", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "martial", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: "*", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "3", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "+", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "A3", scopes: [grammar.scopeName, 'meta.class.variable'] },
					{ value: ":", scopes: [grammar.scopeName, 'meta.delimiter.colon'] },
					{ value: "fitness", scopes: [grammar.scopeName, 'variable.other.member'] },
					{ value: "]", scopes: [grammar.scopeName, 'keyword.control.storage.end.bracket.square'] },
					{ value: "/", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "8", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: ">", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "74", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[14])).toEqual([
					{ value: "Your hands were nimble, ", scopes: [grammar.scopeName, 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "A3", scopes: [grammar.scopeName, 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ".", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[15])).toEqual([
					{ value: "I feel really thingy now.", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[16])).toEqual([
					{ value: "Haha, thanks. And your skin were very smooth, ", scopes: [grammar.scopeName, 'string'] },
					{ value: "<", scopes: [grammar.scopeName, 'string', 'punctuation.section.embedded.begin.bracket.angle'] },
					{ value: "A2", scopes: [grammar.scopeName, 'string', 'meta.class.variable'] },
					{ value: ".", scopes: [grammar.scopeName, 'string', 'meta.delimiter.period'] },
					{ value: "name", scopes: [grammar.scopeName, 'string', 'variable'] },
					{ value: ">", scopes: [grammar.scopeName, 'string', 'punctuation.section.embedded.end.bracket.angle'] },
					{ value: ".", scopes: [grammar.scopeName, 'string'] }
				]);
				expect(txt(tokens[17])).toEqual([
					{ value: "##", scopes: [grammar.scopeName, 'keyword.control'] }
				]);
			});
		});

		describe('LifePlay-Character grammar', () => {
			beforeEach(() => {
				runs(() => {
					grammar = editor.grammars.grammarForScopeName('source.lifeplay-character');
				});
			});

			it('load the grammar', () => {
				expect(grammar).toBeDefined();
				expect(grammar.scopeName).toBe('source.lifeplay-character');
			});

			it('tokenizes LP-Character', () => {
				const tokens = grammar.tokenizeLines(''+
					l("INFO Is_Male: 50% true, 50% false")+
					l("INFO First_Name: 33% Giffe, 33% Paièngé, 33% Jipègue, 1% Wébemme")+
					l("INFO Last_Name: 25% X, 25% Y, 25% Z, 25% W")+
					l("INFO Race: 1% DAZ, 33% African, 33% Asian, 33% Caucasian")+
					l("INFO Genital: 42.5% Penis, 42.5% Vagina, 6% None, 9% Both")+
					l("MORPH Genesis8Female__Cheeks Bones Size: 100% 0.156044 => 0.762931")+
					l("SCALE W: 100% 1.0")+
					l("HAIR Hair_Thickness: 100% 1.054545=>1.251058")+
					l("SKIN Torso_Overlay: 100% NoHair")+
					l("STAT age: 80% 18=>32.999999, 20% 33=>100")+
					l("STAT likes_rough: 100% -50.0=>0.1")+
					l("BLOOD Color: 100% Red")
				);

				expect(txt(tokens[0])).toEqual([
					{ value: "INFO", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Is_Male", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "50", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "true", scopes: [grammar.scopeName, 'constant.boolean'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "50", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "false", scopes: [grammar.scopeName, 'constant.boolean'] }
				]);
				expect(txt(tokens[1])).toEqual([
					{ value: "INFO", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "First_Name", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Giffe", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Paièngé", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Jipègue", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "1", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Wébemme", scopes: [grammar.scopeName, 'none'] }
				]);
				expect(txt(tokens[2])).toEqual([
					{ value: "INFO", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Last_Name", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "25", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "X", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "25", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Y", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "25", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Z", scopes: [grammar.scopeName, 'none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "25", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "W", scopes: [grammar.scopeName, 'none'] }
				]);
				expect(txt(tokens[3])).toEqual([
					{ value: "INFO", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Race", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "1", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "DAZ", scopes: [grammar.scopeName, 'constant.keyword'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "African", scopes: [grammar.scopeName, 'constant.keyword'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Asian", scopes: [grammar.scopeName, 'constant.keyword'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Caucasian", scopes: [grammar.scopeName, 'constant.keyword'] }
				]);
				expect(txt(tokens[4])).toEqual([
					{ value: "INFO", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Genital", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "42.5", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Penis", scopes: [grammar.scopeName, 'constant.keyword'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "42.5", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Vagina", scopes: [grammar.scopeName, 'constant.keyword'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "6", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "None", scopes: [grammar.scopeName, 'constant.none'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "9", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Both", scopes: [grammar.scopeName] }
				]);
				expect(txt(tokens[5])).toEqual([
					{ value: "MORPH", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Genesis8Female__Cheeks", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: "Bones Size", scopes: [grammar.scopeName, 'storage.entity.name.section.label'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "0.156044", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "=>", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "0.762931", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[6])).toEqual([
					{ value: "SCALE", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "W", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "1.0", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[7])).toEqual([
					{ value: "HAIR", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Hair_Thickness", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "1.054545", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "=>", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "1.251058", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[8])).toEqual([
					{ value: "SKIN", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "Torso_Overlay", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "NoHair", scopes: [grammar.scopeName, 'none'] }
				]);
				expect(txt(tokens[9])).toEqual([
					{ value: "STAT", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "age", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "80", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "18", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "=>", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "32.999999", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: ",", scopes: [grammar.scopeName, 'meta.separator'] },
					{ value: "20", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "33", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "=>", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[10])).toEqual([
					{ value: "STAT", scopes: [grammar.scopeName, 'storage.entity.name.tag'] },
					{ value: "likes_rough", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "-", scopes: [grammar.scopeName, 'constant.numeric', 'keyword.operator.other.unit'] },
					{ value: "50.0", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "=>", scopes: [grammar.scopeName, 'keyword.operator'] },
					{ value: "0.1", scopes: [grammar.scopeName, 'constant.numeric'] }
				]);
				expect(txt(tokens[11])).toEqual([
					{ value: "BLOOD", scopes: [grammar.scopeName, 'storage.name'] },
					{ value: "Color", scopes: [grammar.scopeName, 'storage.entity.name.section'] },
					{ value: ":", scopes: [grammar.scopeName, 'keyword.control'] },
					{ value: "100", scopes: [grammar.scopeName, 'constant.numeric'] },
					{ value: "%", scopes: [grammar.scopeName, 'keyword.operator.other.unit'] },
					{ value: "Red", scopes: [grammar.scopeName, 'none'] }
				]);
			});
		});
	});
});
