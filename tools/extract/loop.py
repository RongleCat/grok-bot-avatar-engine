"""Grow the transplanted engine until it runs, one ReferenceError at a time.

tools/verify/engine.mjs calls the client's own driver and emitter. Whatever it
says is undefined is a bundle symbol the closure still lacks, so it goes into
tools/extract/closure-extra.txt and the closure is rebuilt. The loop stops when
the render succeeds, when no new symbol can be identified, or after 400 rounds.

  python3 tools/extract/loop.py
"""
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
EXTRAS = os.path.join(HERE, 'closure-extra.txt')
NODE = os.environ.get('NODE', '/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node')

PATTERNS = [
    re.compile(r'MISSING ([A-Za-z_$][\w$]*)'),
    re.compile(r'ReferenceError: ([A-Za-z_$][\w$]*) is not defined'),
    re.compile(r'(\w+): ([A-Za-z_$][\w$]*) is not defined'),
    re.compile(r'TypeError: ([A-Za-z_$][\w$]*) is not a function'),
]


def known():
    if not os.path.exists(EXTRAS):
        return set()
    with open(EXTRAS, encoding='utf8') as handle:
        return {line.split('#')[0].strip() for line in handle if line.split('#')[0].strip()}


def remember(name):
    with open(EXTRAS, 'a', encoding='utf8') as handle:
        handle.write(name + '\n')


def run(command):
    return subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=300)


def main():
    for round_index in range(400):
        built = run([sys.executable, os.path.join(HERE, 'closure.py')])
        if built.returncode != 0:
            print(built.stdout, built.stderr)
            raise SystemExit('closure.py failed')
        probe = run([NODE, os.path.join('tools', 'verify', 'engine.mjs')])
        output = probe.stdout + probe.stderr
        if probe.returncode == 0:
            print(output.strip())
            print('converged after %d rounds' % round_index)
            return
        names = []
        for pattern in PATTERNS:
            names.extend(match.group(2) if pattern.groups == 2 else match.group(1)
                         for match in pattern.finditer(output))
        pool = known()
        fresh = [name for name in dict.fromkeys(names) if name not in pool]
        if not fresh:
            print(output[-4000:])
            raise SystemExit('stuck: no new symbol to add (extra=%d)' % len(pool))
        for name in fresh:
            remember(name)
        print('round %d +%s' % (round_index, ' '.join(fresh)))
    raise SystemExit('did not converge')


if __name__ == '__main__':
    main()
