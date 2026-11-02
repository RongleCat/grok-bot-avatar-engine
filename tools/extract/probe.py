"""Where does each minified symbol actually live, and what proves we got the right one?

Prints every bundle that declares `function NAME(` with the opening of its body,
so the extraction table can pin one bundle and one witness per symbol instead of
guessing. Minified names repeat across bundles, so an unpinned name is meaningless.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import slice as S  # noqa: E402

BUNDLES = [('common', S.COMMON), ('app', S.APP_BUNDLE), ('platform', S.PLATFORM), ('panel', S.PANEL)]


def probe(name):
    print('##', name)
    for label, bundle in BUNDLES:
        text = S.read(bundle)
        index = 0
        found = 0
        while True:
            start = S.find_function(text, name, index)
            if start is None:
                break
            end = S.function_span(text, start)
            print('   [%s @%d] %s' % (label, start, text[start:min(end, start + 150)].replace('\n', ' ')))
            found += 1
            index = end
            if found > 3:
                break
        if not found:
            print('   [%s] none' % label)


if __name__ == '__main__':
    for symbol in sys.argv[1:]:
        probe(symbol)
