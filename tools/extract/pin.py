"""Print run.py table rows for symbols that are not registered yet.

The witness is the first chunk of the function body, so it is a literal the
slice is guaranteed to contain; offset and sha1 in the manifest are the real
pin. Used once per porting layer, then the rows are edited by hand where a
symbol is declared more than once in the bundle.

  python3 tools/extract/pin.py el nl Qc ...
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import slice as S  # noqa: E402


def body(text, name):
    index = text.index('function %s(' % name)
    brace = text.index('{', S.balanced(text, text.index('(', index)))
    end = S.balanced(text, brace)
    return index, text[brace + 1:end - 1]


def main(names):
    text = S.read(S.COMMON)
    for name in names:
        pattern = 'function %s\\(' % re.escape(name)
        hits = [m.start() for m in re.finditer(pattern, text)]
        note = '' if len(hits) == 1 else '  # declared %d times' % len(hits)
        if not hits:
            print("    ('%s', '%s', 'common', TODO)," % (name, name))
            continue
        offset, inner = body(text, name)
        witness = inner[:26].strip()
        print("    ('%s', '%s', 'common', %r),%s" % (name, name, witness, note))


if __name__ == '__main__':
    main(sys.argv[1:])
