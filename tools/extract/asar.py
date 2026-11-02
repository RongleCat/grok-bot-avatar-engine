"""Unpack the installed Grok Bot app.asar and record exactly where it came from."""
import json, os, struct, shutil, subprocess, sys

APP = '/Applications/Grok Bot.app'
ASAR = os.path.join(APP, 'Contents/Resources/app.asar')
OUT = os.environ.get('GB_EXTRACT_DIR', '/tmp/gb-extract')


def bundle_version():
    plist = os.path.join(APP, 'Contents/Info.plist')
    out = subprocess.run(['plutil', '-extract', 'CFBundleShortVersionString', 'raw', plist],
                         capture_output=True, text=True, check=True)
    return out.stdout.strip()


def header(handle):
    handle.seek(0)
    block = handle.read(16)
    payload = struct.unpack('<I', block[4:8])[0]
    json_len = struct.unpack('<I', block[12:16])[0]
    handle.seek(16)
    return json.loads(handle.read(json_len).decode('utf8')), 8 + payload


def unpack(force=False):
    version = bundle_version()
    stamp = os.path.join(OUT, '.gb-version')
    if os.path.isdir(OUT) and not force:
        if os.path.isfile(stamp) and open(stamp).read().strip() == version:
            return OUT, version
    shutil.rmtree(OUT, ignore_errors=True)
    with open(ASAR, 'rb') as handle:
        tree, base = header(handle)
        entries = []

        def walk(node, path):
            if 'files' in node:
                for name, child in node['files'].items():
                    walk(child, path + '/' + name)
            else:
                entries.append((path, int(node.get('size', 0)), str(node.get('offset')), node.get('unpacked', False)))
        walk(tree, '')
        for path, size, offset, loose in entries:
            target = os.path.join(OUT, path.lstrip('/'))
            os.makedirs(os.path.dirname(target), exist_ok=True)
            if loose:
                source = os.path.join(APP, 'Contents/Resources/app.asar.unpacked', path.lstrip('/'))
                if os.path.exists(source):
                    shutil.copyfile(source, target)
                continue
            handle.seek(base + int(offset))
            with open(target, 'wb') as write:
                write.write(handle.read(size))
    with open(stamp, 'w') as write:
        write.write(version + '\n')
    return OUT, version


if __name__ == '__main__':
    directory, version = unpack('--force' in sys.argv)
    print(json.dumps({'dir': directory, 'version': version}))
