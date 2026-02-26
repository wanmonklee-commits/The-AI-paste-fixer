# Unicode Cleaner

A lightweight browser-based utility to detect and remove invisible Unicode characters that break JSON, APIs, and databases.

## Why This Tool Exists

Developers frequently encounter:

- `SyntaxError: Unexpected token`
- `JSON.parse()` failures
- Invisible characters breaking string comparison
- Copy-paste errors from AI tools or rich text editors

These issues are often caused by hidden characters such as:

- Zero Width Space (U+200B)
- Non-Breaking Space (U+00A0)
- Byte Order Mark (U+FEFF)
- Line Separator (U+2028)
- Orphaned surrogate pairs

## Features

- Removes zero-width characters
- Converts NBSP to standard spaces
- Fixes smart quotes
- NFC normalization
- Removes orphan surrogate pairs
- 100% client-side processing (no uploads)

## Live Tool

https://unicodecleaner.online/

## Example

```js
JSON.parse('{"name":"John\u200BDoe"}')
