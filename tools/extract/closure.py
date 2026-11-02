"""Cut a verbatim closure of the client renderer out of the bundle.

src/mesh/ holds readable transcriptions of individual functions, each checked
against the bundle text by test/port-*.test.mjs. The renderer below that is a
hundred-odd small functions whose differences only show up in the final pixels,
so they are lifted out untouched instead of retyped: data/extracted/src/
avatar-engine.js is the client's code byte for byte, one provenance comment per
declaration, offsets and hashes listed in data/extracted/avatar-engine.json.

  python3 tools/extract/closure.py                 # rebuild
  python3 tools/extract/closure.py --why Dp kp     # show which seed pulls a symbol in

Only declarations sitting at brace depth 0 in the bundle are eligible, so a
nested `function t(` can never be mistaken for a top-level one. The graph walks
references minus names bound inside the declaration; anything that walks too far
is dropped again by deleting it from the deny list, and anything it misses shows
up as a ReferenceError when the engine is run.
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import asar  # noqa: E402
import slice as S  # noqa: E402

SEEDS = os.path.join(HERE, 'closure-seeds.txt')
EXTRAS = os.path.join(HERE, 'closure-extra.txt')
DENY = os.path.join(HERE, 'closure-deny.txt')
TARGET = os.path.join(HERE, '../../data/extracted/src/avatar-engine.js')
REPORT = os.path.join(HERE, '../../data/extracted/avatar-engine.json')

IDENT = re.compile(r'(?<![\w$.])([A-Za-z_$][\w$]*)')
JS_GLOBALS = {
    'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'JSON', 'Map', 'Set', 'WeakMap', 'WeakSet',
    'Float32Array', 'Float64Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
    'Uint16Array', 'Int32Array', 'Uint32Array', 'Symbol', 'Promise', 'RegExp', 'Date', 'Error',
    'TypeError', 'RangeError', 'Infinity', 'NaN', 'undefined', 'null', 'true', 'false', 'this',
    'console', 'document', 'window', 'navigator', 'performance', 'requestAnimationFrame',
    'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'queueMicrotask', 'structuredClone',
    'globalThis', 'arguments', 'encodeURIComponent', 'decodeURIComponent', 'isNaN', 'isFinite',
    'parseInt', 'parseFloat', 'CSS', 'DOMParser', 'XMLSerializer', 'Image', 'Node', 'Element',
}


def read_list(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding='utf8') as handle:
        return [line.split('#')[0].strip() for line in handle if line.split('#')[0].strip()]


def depth_zero_mask(text):
    """True at positions that are not inside any brace, bracket or paren.

    Only syntax counts: slice.code_mask already marks the bytes sitting inside
    strings, template text, regex literals and comments, and a `function t(`
    living in one of those is not a declaration.
    """
    code = S.code_mask(text)
    top = [False] * len(text)
    depth = 0
    for index, char in enumerate(text):
        if code[index] == S.CODE:
            if char in '([{':
                depth += 1
            elif char in ')]}':
                depth -= 1
        top[index] = depth == 0
    return top


def index_declarations(text):
    """Every top-level `function f(`, `class C`, and `name = value` in the bundle."""
    mask = depth_zero_mask(text)
    out = {}

    def put(name, start, end):
        out.setdefault(name, (start, end))

    for match in re.finditer(r'function\s+([A-Za-z_$][\w$]*)\s*\(', text):
        if not mask[match.start()]:
            continue
        start = match.start()
        put(match.group(1), start, S.function_span(text, start))
    for match in re.finditer(r'class\s+([A-Za-z_$][\w$]*)\s*\{', text):
        if not mask[match.start()]:
            continue
        put(match.group(1), match.start(), S.balanced(text, text.index('{', match.end() - 1)))
    # `var{abs:Xu,hypot:Qu}=Math` binds names without an `=` after each of them,
    # so the assignment scan below would never see Xu or Qu.
    for match in re.finditer(r'(?:var|let|const)\s*([{\[])', text):
        if not mask[match.start()]:
            continue
        open_at = match.end() - 1
        close_at = S.balanced(text, open_at) - 1
        after = text[close_at + 1:close_at + 40]
        equals = re.match(r'\s*=\s*', after)
        if not equals:
            continue
        value = close_at + 1 + equals.end()
        span = (match.start(), value_span(text, value))
        for name in pattern_names(text[open_at + 1:close_at]):
            put(name, *span)
    for match in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*=(?!=)', text):
        if not mask[match.start()]:
            continue
        name = match.group(1)
        if name in out:
            continue
        out[name] = (match.start(), value_span(text, match.end()))
    return out


def pattern_names(pattern):
    """The identifiers a destructuring pattern binds: the alias of `key:alias`
    and the target of `alias=default`."""
    names = []
    depth = 0
    current = ''
    parts = []
    for char in pattern + ',':
        if char in '[{(':
            depth += 1
        elif char in ']})':
            depth -= 1
        if char == ',' and depth == 0:
            parts.append(current)
            current = ''
            continue
        current += char
    for part in parts:
        part = part.split('=')[0]
        if ':' in part:
            part = part.rsplit(':', 1)[1]
        match = re.search(r'[A-Za-z_$][\w$]*', part)
        if match and match.group(0) not in names:
            names.append(match.group(0))
    return names


def value_span(text, value):
    """End of the right-hand side of a top-level assignment.

    Minified bundles write `a=(()=>{...})(),b=[1,2].map(f),c=x=>y?z:w`, so after
    the opening bracket the value can keep going through calls, member access,
    arrows and ternaries. Cutting at the first bracket leaves a declaration that
    is a different program than the one in the app.
    """
    opener = text[value]
    if opener in '[{(':
        end = S.balanced(text, value)
    elif re.match(r'new\s+[A-Za-z_$][\w$.]*\s*\(', text[value:value + 60]):
        end = S.balanced(text, text.index('(', value))
    elif re.match(r'new\s+[A-Za-z_$][\w$.]*(\s*[,;)\n]|$)', text[value:value + 60]):
        end = value + re.match(r'new\s+[A-Za-z_$][\w$.]*', text[value:value + 60]).end()
    elif re.match(r'function\b', text[value:value + 12]):
        end = S.function_span(text, value)
    elif re.match(r'class\b', text[value:value + 12]):
        end = S.balanced(text, text.index('{', value))
    else:
        end = arrow_tail(text, scalar_end(text, value))
        return end
    return chain_end(text, end)


def chain_end(text, end):
    """Walk calls, member access and arrow bodies that continue a value."""
    for _ in range(64):
        if text.startswith('=>', end):
            end = arrow_tail(text, end)
            continue
        char = text[end]
        if char == '(':
            end = S.balanced(text, end)
            continue
        if char == '.':
            tail = re.match(r'\.[A-Za-z_$][\w$]*\s*(\()?', text[end:])
            if not tail:
                return end
            end += tail.end()
            if tail.group(1):
                end = S.balanced(text, end - 1)
            continue
        return end
    return end


def arrow_tail(text, end):
    """`f=(a,b)=>{...}` was cut at the parameter list; pull in the body."""
    rest = text[end:end + 40].lstrip()
    if not rest.startswith('=>'):
        return end
    body = end + text[end:].index('=>') + 2
    while body < len(text) and text[body].isspace():
        body += 1
    if text[body] == '{':
        return chain_end(text, S.balanced(text, body))
    return scalar_end(text, body)


def scalar_end(text, start):
    """End of a value that does not open with a bracket: stop at the next
    comma, semicolon or closing bracket that is actual syntax."""
    code = S.code_mask(text)
    depth = 0
    for index in range(start, len(text)):
        if code[index] != S.CODE:
            continue
        char = text[index]
        if char in '([{':
            depth += 1
        elif char in ')]}':
            if depth == 0:
                return index
            depth -= 1
        elif char in ',;' and depth == 0:
            return index
    return len(text)


def bound_names(source):
    """Names the declaration binds itself, so they are not treated as imports."""
    names = set()
    for pattern in (r'(?:^|[^.\w$])function\s+[A-Za-z_$][\w$]*\s*\(([^)]*)\)',
                    r'(?:^|[^.\w$])function\s*\(([^)]*)\)',
                    r'\(([^()]*)\)\s*=>',
                    r'(?:let|const|var)\s+([A-Za-z_$][\w$]*)',
                    r'(?:let|const|var)\s*\{([^{}]*)\}',
                    r'(?:let|const|var)\s*\[([^\[\]]*)\]',
                    r'catch\s*\(\s*([A-Za-z_$][\w$]*)',
                    r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>'):
        for match in re.finditer(pattern, source):
            names.update(IDENT.findall(match.group(1) or ''))
    # Object literal keys read as `{body:` are properties, not references.
    stripped = re.sub(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*:', ' ', source)
    return names, stripped


def references(source):
    names, stripped = bound_names(source)
    found = set()
    for token in IDENT.findall(stripped):
        if token not in names and token not in JS_GLOBALS:
            found.add(token)
    return found


def main():
    seeds = read_list(SEEDS) + read_list(EXTRAS)
    deny = set(read_list(DENY))
    text = S.read(S.COMMON)
    table = index_declarations(text)
    if '--why' in sys.argv:
        at = sys.argv.index('--why')
        for target in sys.argv[at + 1:]:
            print(target, 'in index' if target in table else 'MISSING')
        return
    follow = '--follow' in sys.argv
    order = []
    seen = {name for name in deny}
    frontier = list(seeds)
    parents = {}
    while frontier:
        name = frontier.pop(0)
        if name in seen or name not in table:
            continue
        seen.add(name)
        order.append(name)
        if not follow:
            continue
        start, end = table[name]
        for child in references(text[start:end]):
            if child not in seen and child not in deny:
                parents.setdefault(child, name)
                frontier.append(child)
    by_offset = sorted((name for name in order if name in table), key=lambda name: table[name][0])
    chunks, report = [], []
    emitted = set()
    for name in by_offset:
        start, end = table[name]
        if start in emitted:
            # One destructured declaration covers several names; its bytes go in
            # once, and the report lists every binding it provides.
            for item in report:
                if item['offset'] == start:
                    item['alsoBinds'] = item.get('alsoBinds', []) + [name]
            continue
        emitted.add(start)
        source = text[start:end]
        digest = hashlib.sha1(source.encode('utf8')).hexdigest()[:12]
        if not re.match(r'(function|class|var|let|const)\b', source):
            # The bundle declares these inside a `var a=1,b=2` chain; standing on
            # their own they would assign to an undeclared name, and a module is
            # strict, so the keyword has to come back. The hash above is of the
            # bundle bytes, not of this line.
            source = 'var ' + source
        chunks.append('// %s offset %d length %d sha1 %s\n%s' % (S.COMMON, start, end - start, digest, source))
        report.append({'symbol': name, 'offset': start, 'length': end - start, 'sha1': digest,
                       'seeded': name in seeds, 'pulledBy': parents.get(name)})
    header = [
        '// Verbatim slice of the Grok Bot avatar renderer, produced by tools/extract/closure.py.',
        '// Every declaration below is copied untouched from the unpacked app bundle; the comment',
        '// above it gives the byte offset, length and sha1 recorded in data/extracted/avatar-engine.json.',
        '// Nothing here was rewritten, renamed, reformatted or hand-corrected.',
        '// Do not edit: regenerate with `python3 tools/extract/closure.py`.',
    ]
    root, version = asar.unpack()
    exports = [name for name in by_offset if name in seeds]
    body = '\n\n'.join(header + chunks) + '\n\nexport { %s };\n' % ', '.join(exports)
    os.makedirs(os.path.dirname(TARGET), exist_ok=True)
    with open(TARGET, 'w', encoding='utf8') as handle:
        handle.write(body)
    digest = hashlib.sha1(body.encode('utf8')).hexdigest()[:12]
    with open(REPORT, 'w', encoding='utf8') as handle:
        json.dump({'appVersion': version, 'bundle': S.COMMON, 'bytes': len(body),
                   'sha1': digest, 'declarations': report}, handle, indent=2)
        handle.write('\n')
    manifest = S.load_manifest()
    manifest['entries']['avatar-engine'] = {
        'bundle': 'app.asar!dist/' + S.COMMON, 'kind': 'closure',
        'count': len(report), 'sha1': digest, 'appVersion': version,
    }
    S.save_manifest(manifest)
    print('declarations: %d | chars: %d | sha1 %s' % (len(report), len(body), digest))
    print('exports: %s' % ', '.join(exports))
    absent = [name for name in seeds if name not in table]
    if absent:
        print('SEEDS NOT FOUND AT TOP LEVEL: %s' % ', '.join(absent))


if __name__ == '__main__':
    main()
