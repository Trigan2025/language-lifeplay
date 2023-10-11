# language-lifeplay
## LifePlay modding’s language grammar

Well, it’is a syntax-highlighting package for the modding files of a certain nsfw game named LifePlay,  writes for the [Pulsar text editor](https://pulsar-edit.dev/).  
*It also include some snippets.*

#### Some notes to take into consideration:

- Since LifePlay only support CRLF (`\r\n`) as line endings, it will be enforced and all existing LF (`\n`) line endings will be automatically converted.
- Since LifePlay only support 4-spaces indentations, there will be enforced and all TAB indentations (`\t`) will be automatically converted.
    - *Apart for the lp-character of course, since it is not supposed to have any indentation anyway, so we don’t care.*
- All modification in the settings concerning the two mentioned above will be reset instantly[*][1].

All this is of course to ensure we not ends up wandering on wondering why our mod don’t seems to work.

One of the files I don’t include the support for is the lpworld one, but:
1. there is very rare case where we would want to modify them manually
2. we can choose the C# grammar to get something somewhat readable

[1]: # (Although the revert changes of "auto" or "hard" to "soft" only appears in the config file and not in the Settings panel.)

---

Finally, please note that it is a simple TextMate-like grammar and not a tree-sitter grammar since this latter require some additional work like compiling and publishing the parser to the NPM registry before packaging it back in the grammar package.  
So, maybe I will do it later, but for now I find simple is sufficient.
