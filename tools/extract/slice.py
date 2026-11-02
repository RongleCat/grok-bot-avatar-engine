"""Cut named symbols out of the unpacked client bundle and record where each came from.

Every constant that lands in this repository must pass through here first, so a
number can always be traced back to a byte offset in a specific bundle. Nothing
in src/ should carry a literal that has no matching entry in the manifest.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import asar  # noqa: E402

COMMON = 'renderer/assets/index.eager-common-DbK3Oi_r.js'
APP_BUNDLE = 'renderer/assets/index.eager-app-D1juOWZp.js'
PLATFORM = 'renderer/assets/index.eager-platform-C2su3Zzb.js'
PANEL = 'renderer/assets/desktop-mount-panel-BJHydUwA.js'

MANIFEST = os.path.join(HERE, '../../data/extracted/manifest.json')
SRC_OUT = os.path.join(HERE, '../../data/extracted/src')

TOKEN = re.compile(r'-?\d*\.?\d+(?:e[-+]?\d+)?')


def bundle_path(name):
    root, _version = asar.unpack()
    return os.path.join(root, 'dist', name)


def read(name):
    with open(bundle_path(name), encoding='utf8', errors='replace') as handle:
        return handle.read()


def regex_end(text, start):
    """Index just past a regex literal and its flags. Quotes inside `/[&<>"]/g`
    are characters, not the start of a string, so they are not tracked."""
    index = start + 1
    class_open = False
    while index < len(text):
        char = text[index]
        if char == '\\':
            index += 2
            continue
        if char == '[':
            class_open = True
        elif char == ']':
            class_open = False
        elif char == '\n':
            return index
        elif char == '/' and not class_open:
            index += 1
            while index < len(text) and text[index].isalpha():
                index += 1
            return index
        index += 1
    return len(text)


REGEX_PRECEDERS = frozenset('(,=:[!&|?{};~^<>')
CODE = 0
NOT_CODE = 1

_MASKS = {}


def code_mask(text):
    """A byte per character: CODE where real syntax sits, NOT_CODE inside a
    string, a template literal's text, a regex body or a comment.

    Template interpolations go back to CODE between `${` and its `}`; without
    that rule the backtick inside ``replaceAll(`/`, `-`)`` closes the enclosing
    template and every span computed from there on is wrong. Braces that belong
    to an interpolation are marked NOT_CODE so bracket counting can ignore them.
    """
    entry = _MASKS.get(id(text))
    if entry is not None and entry[0] is text:
        return entry[1]
    mask = bytearray([CODE]) * len(text)
    quote = None
    in_template = False
    pending = []
    braces = []
    previous = ''
    index = 0
    length = len(text)
    while index < length:
        char = text[index]
        if quote:
            mask[index] = NOT_CODE
            if char == '\\':
                if index + 1 < length:
                    mask[index + 1] = NOT_CODE
                index += 2
                continue
            if char == quote:
                quote = None
            index += 1
            continue
        if in_template:
            mask[index] = NOT_CODE
            if char == '\\':
                if index + 1 < length:
                    mask[index + 1] = NOT_CODE
                index += 2
                continue
            if char == '`':
                in_template = False
                index += 1
                continue
            if char == '$' and text.startswith('{', index + 1):
                mask[index + 1] = NOT_CODE
                braces.append(0)
                in_template = False
                index += 2
                previous = ''
                continue
            index += 1
            continue
        if char == '/' and previous in REGEX_PRECEDERS:
            if text.startswith('//', index):
                jump = text.find('\n', index)
                jump = length if jump < 0 else jump
                mask[index:jump] = bytearray([NOT_CODE]) * (jump - index)
                index = jump
                continue
            if text.startswith('/*', index):
                jump = text.find('*/', index)
                jump = length if jump < 0 else jump + 2
                mask[index:jump] = bytearray([NOT_CODE]) * (jump - index)
                index = jump
                continue
            jump = regex_end(text, index)
            mask[index:jump] = bytearray([NOT_CODE]) * (jump - index)
            previous = '/'
            index = jump
            continue
        if char in '\'"':
            quote = char
            mask[index] = NOT_CODE
            index += 1
            continue
        if char == '`':
            in_template = True
            mask[index] = NOT_CODE
            index += 1
            continue
        if char == '{':
            if braces:
                braces[-1] += 1
        elif char == '}':
            if braces:
                if braces[-1] == 0:
                    braces.pop()
                    mask[index] = NOT_CODE
                    in_template = True
                    index += 1
                    previous = ''
                    continue
                braces[-1] -= 1
        if not char.isspace():
            previous = char
        index += 1
    _MASKS[id(text)] = (text, mask)
    return mask


def balanced(text, start):
    """Return the index just past the bracket expression opening at `start`."""
    pairs = {'[': ']', '{': '}', '(': ')'}
    open_char = text[start]
    if open_char not in pairs:
        raise ValueError('not an opening bracket at %d' % start)
    close = pairs[open_char]
    mask = code_mask(text)
    depth = 0
    previous = ''
    index = start
    while index < len(text):
        char = text[index]
        position = index
        index += 1
        if mask[position] != CODE:
            continue
        if char == open_char:
            depth += 1
        elif char == close:
            depth -= 1
            if depth == 0:
                return index
        elif char in '([{':
            depth += 1
        elif char in ')]}':
            depth -= 1
        if not char.isspace():
            previous = char
    raise ValueError('unbalanced from %d' % start)


def find_assignment(text, symbol, after=0):
    """Locate `symbol=` and return the index just past the `=`.

    The value may be a literal, a `new` expression, or an arrow function, which
    starts with its parameter name, so plain identifiers are allowed too.
    """
    pattern = re.compile(r'(?<![\w$.])' + re.escape(symbol) + r'\s*=\s*(?=[\[({"`\-\w$.])')
    for match in pattern.finditer(text, after):
        value = match.end()
        if text.startswith('=>', value):
            continue
        return value, value
    return None, None


def find_function(text, name, after=0):
    """Locate `function name(` and return the index of the opening brace."""
    match = re.search(r'function\s+' + re.escape(name) + r'\s*\(', text[after:])
    if not match:
        return None
    return after + match.start()


def function_span(text, start):
    """End of `function name(params){body}`. The body brace is the one that
    follows the parameter list, not the first brace inside the parameters."""
    paren = text.index('(', start)
    close = balanced(text, paren)
    brace = text.index('{', close)
    return balanced(text, brace)


def to_json(source):
    """Convert a minified JS literal into something json.loads accepts."""
    text = source.replace('`', '"')
    text = re.sub(r'(?<![\w$])!0(?![\w$])', 'true', text)
    text = re.sub(r'(?<![\w$])!1(?![\w$])', 'false', text)
    text = re.sub(r'(?<![\w$])void 0(?![\w$])', 'null', text)
    text = re.sub(r'([{,]\s*)([a-zA-Z_$][A-Za-z0-9_$]*)\s*:', r'\1"\2":', text)
    text = re.sub(r'(?<=[\s[,:])(-?)\.(\d)', r'\g<1>0.\g<2>', text)
    return json.loads(text)


def load_manifest():
    if os.path.exists(MANIFEST):
        with open(MANIFEST, encoding='utf8') as handle:
            return json.load(handle)
    return {'bundleVersion': None, 'entries': {}}


def save_manifest(manifest):
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    with open(MANIFEST, 'w', encoding='utf8') as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)
        handle.write('\n')


def record(name, symbol, bundle, kind, value=None, search_from=0, notes=None, fn=False, near=None):
    """Pull `symbol` out of `bundle`, record its offset, and return the payload."""
    text = read(bundle)
    is_declaration = False
    if fn:
        start = find_function(text, symbol, search_from)
        is_declaration = start is not None
        if is_declaration:
            end = function_span(text, start)
        else:
            # An arrow function bound to a name: `Is=e=>...`
            start, _ = find_assignment(text, symbol, search_from)
            if start is None:
                raise SystemExit('function not found: %s in %s' % (symbol, bundle))
            end = _arrow_end(text, start)
    else:
        start, _expr = find_assignment(text, symbol, search_from)
        if start is None:
            raise SystemExit('symbol not found: %s in %s' % (symbol, bundle))
        if text.startswith('new ', start):
            end = balanced(text, text.index('(', start))
        elif text[start] in '[{':
            end = balanced(text, start)
        else:
            end = _scalar_end(text, start)
    source = text[start:end]
    if near is not None and near not in source:
        raise SystemExit('%s: witness %r absent from the slice of %s (offset %d); '
                         'the name collides with another symbol' % (name, near, symbol, start))
    if fn and is_declaration and not source.startswith('function ' + symbol + '('):
        raise SystemExit('%s: slice does not start at function %s' % (name, symbol))
    constructor = re.match(r'new (Set|Map)\(', source)
    if constructor:
        inner = source.index('(') + 1
        tail = balanced(source, inner)
        source = source[inner:tail - 1]
    root, version = asar.unpack()
    entry = {
        'bundle': 'app.asar!dist/' + bundle,
        'offset': start,
        'length': end - start,
        'kind': kind,
        'sha1': __import__('hashlib').sha1(source.encode('utf8')).hexdigest()[:12],
    }
    if notes:
        entry['notes'] = notes
    manifest = load_manifest()
    manifest['bundleVersion'] = version
    manifest['entries'][name] = entry
    save_manifest(manifest)
    if kind == 'data':
        if value is None:
            try:
                value = to_json(source)
            except Exception as error:  # noqa: BLE001
                raise SystemExit('%s is not a plain literal (%s); record it as code' % (name, error))
        os.makedirs(os.path.dirname(_data_target(name)), exist_ok=True)
        with open(_data_target(name), 'w', encoding='utf8') as handle:
            json.dump({'provenance': entry, 'value': value}, handle, indent=2)
            handle.write('\n')
    else:
        os.makedirs(SRC_OUT, exist_ok=True)
        with open(os.path.join(SRC_OUT, name + '.js'), 'w', encoding='utf8') as handle:
            handle.write('// %s  offset %d  length %d  sha1 %s\n' % (bundle, start, entry['length'], entry['sha1']))
            handle.write(source)
    return entry


def _data_target(name):
    return os.path.join(HERE, '../../data/extracted', name + '.json')


def _arrow_end(text, start):
    """End of an assigned function/expression: stop at the top-level comma that
    separates it from the next declaration."""
    index = start
    depth = 0
    quote = None
    while index < len(text):
        char = text[index]
        if quote:
            if char == '\\':
                index += 2
                continue
            if char == quote:
                quote = None
        elif char in '`\'"':
            quote = char
        elif char in '([{':
            depth += 1
        elif char in ')]}':
            depth -= 1
        elif char in ',;' and depth == 0:
            break
        elif char == '\n' and depth == 0 and text[index - 1] == '}':
            break
        index += 1
    return index


def _scalar_end(text, start):
    match = re.search(r'[,;)\]}]', text[start:start + 400])
    if not match:
        raise ValueError('cannot end scalar at %d' % start)
    return start + match.start()


if __name__ == '__main__':
    print(json.dumps({'bundleVersion': load_manifest()['bundleVersion'],
                      'recorded': len(load_manifest()['entries'])}))
