"""Record the client symbols this repository ports, with byte offsets.

Run after unpacking:  python3 tools/extract/run.py
Adds a symbol to the list when src/ starts depending on it.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import slice as S  # noqa: E402

# --- data tables: parsed to JSON, value and offset both recorded -----------------
DATA = [
    ('bodies', 'ei', S.COMMON),
    ('pinned-bodies', 'ti', S.COMMON),
    ('picker-shapes', 'sn', S.COMMON),
    ('gated-shapes', 'cn', S.COMMON),
    ('flat-shape-pool', 'dn', S.COMMON),
    ('mesh-shape-pool', 'fn', S.COMMON),
    ('all-shapes', 'ln', S.COMMON),
    ('color-table', 'nn', S.COMMON),
    ('ink-pair', 'dr', S.COMMON),
    ('plate-stops', 'lr', S.COMMON),
    ('eye-reference', 'Do', S.COMMON),
    ('eye-seats', 'Oo', S.COMMON),
    ('faces', 'ni', S.COMMON),
    ('expression-aliases', 'ai', S.COMMON),
    ('held-faces', 'oi', S.COMMON),
    ('body-recipes', 'cc', S.COMMON),
    ('silhouette-kinds', '_l', S.COMMON),
    ('extrusion-default', 'gl', S.COMMON),
    ('state-groups', None, S.COMMON),
    ('state-table', 'lo', S.COMMON),
    ('morph-overlays', 'pa', S.COMMON),
    ('morph-retrigger', '_a', S.COMMON),
    ('channel-alias', None, S.COMMON),
    ('body-alias', 'wa', S.COMMON),
    ('gaze-presets', 'Ua', S.COMMON),
    ('clip-durations', None, S.COMMON),
    ('pumpkin-constants', None, S.COMMON),
    ('sprite-constants', None, S.COMMON),
]

# Scalars the mesh and motion layers depend on. Recorded so a literal in src/
# can always be traced to an offset instead of to somebody's reading of a report.
SCALARS = [
    ('canvas-centre', 'L', 'common', '114.2705'),
    ('tau-body', 'Js', 'common', 'Math.PI*2'),
    ('tau-path', 'ss', 'common', 'Math.PI*2'),
    ('loft-rings', 'rc', 'common', '16'),
    ('loft-resample', 'ic', 'common', '160'),
    ('loft-power', 'nc', 'common', '.72'),
    ('ball-grid', 'tc', 'common', '40'),
    ('revolve-radial', '$s', 'common', '64'),
    ('scan-epsilon', 'sc', 'common', '1e-5'),
    ('lid-morph-dur', 'wr', 'common', '.35'),
    ('face-morph-dur', 'Cr', 'common', '.28'),
    ('blink-dur', 'Tr', 'common', '.26'),
    ('close-full', 'Er', 'common', '4.25/60'),
    ('close-blink', 'Dr', 'common', '2/60'),
    ('reopen-peak', 'Or', 'common', '1.06'),
    ('zoom-rest', 'Ea', 'common', '.6'),
    ('bridge-ease', 'Ta', 'common', '[.4,0,.2,1]'),
    ('default-ease', 'xr', 'common', '[.42,0,.58,1]'),
    ('morph-ease', 'Sr', 'common', '[.4,.06,.18,1]'),
    ('substep', 'gr', 'common', '1/120'),
    ('gaze-kinds', 'ca', 'common', 'heartChubby:.6'),
    ('morph-durations', 'va', 'common', 'progress:2.5'),
    ('deg-per-rad', 'vp', 'common', '180/Math.PI'),
    ('pumpkin-paints', 'Ed', 'common', '#3d3d3d'),
    ('pumpkin-trace', 'Dd', 'common', 'deviation:.5'),
]


# --- functions: kept verbatim so a port can be diffed against them --------------
# (name, symbol, bundle, witness) — the witness is a literal that only appears in
# the body we want, because minified names repeat across and within bundles.
FUNCTIONS = [
    # geometry kernel
    ('fit-params', 'zs', 'common', '1.35'),
    ('fit-apply', 'Bs', 'common', 'Ls(e,n,r,i)'),
    ('fit-rewrite', 'Ls', 'common', 'i^=1'),
    ('fit-and-ring', 'Vs', 'common', 'outerAt'),
    ('ring-resample', 'Is', 'common', 'Fs'),
    ('scanlines', 'Ps', 'common', 'spanAt'),
    ('sample-path', 'Ns', 'common', 'MLCQZmlcqz'),
    # 3D maths
    ('quat-mul', 'Lr', 'common', 'e[0]*t[0]-e[1]*t[1]-e[2]*t[2]'),
    ('quat-axis', 'Rr', 'common', 'Math.sin(t/2)'),
    ('quat-normalise', 'zr', 'common', 'Math.hypot(e[0],e[1],e[2],e[3])'),
    ('quat-between', 'Br', 'common', '1+(e[0]*t[0]+e[1]*t[1]+e[2]*t[2])'),
    ('quat-to-mat3', 'Vr', 'common', '1-2*(r*r+i*i)'),
    ('quat-from-euler', 'Hr', 'common', 'Rr([1,0,0],e)'),
    ('mat3-to-euler', 'Ur', 'common', '.999999'),
    ('quat-to-euler', 'Wr', 'common', 'Ur(Vr(e))'),
    ('mat3-apply', 'Gr', 'common', 'e[0]*t[0]+e[1]*t[1]+e[2]*t[2]'),
    ('angle-basis', 'Af', 'common', 'k:1-t'),
    ('view-body-transform', 'jf', 'common', 'toView'),
    ('to-view', 'Mf', 'common', 'n.c-u*n.s'),
    ('to-body', 'Nf', 'common', 'l*n.c+d*n.s'),
    ('euler-snap', 'Mp', 'common', 'Math.round(e/t)*t'),
    ('pitch-clamp', 'Pp', 'common', '89.5-t'),
    ('angle-step', 'Np', 'common', 'Math.log2(n)'),
    # motion core
    ('prng', 'ba', 'common', '1831565813'),
    ('shuffle-order', 'mo', 'common', 'findIndex'),
    ('state-driver', 'go', 'common', 'setEmphasis'),
    ('spring', 'hr', 'common', 'e.v+='),
    ('spring-substeps', '_r', 'common', 'gr'),
    ('bridge-recipe', 'Ha', 'common', 'za(t.rot[0]'),
    ('poke-names', 'Xi', 'common', 'bounce'),
    ('gaze-delta', 'da', 'common', 'rx:-(r?19:14)'),
    ('load-recipe', 'Ia', 'common', 'isThroughBlink'),
    ('blink-triplet', 'Pa', 'common', 'Tr*.45'),
    ('rest-pose', 'Ra', 'common', 'squashAnchor'),
    ('morph-window', 'Nr', 'common', '.42'),
    ('reopen-overshoot', 'Pr', 'common', 'Or'),
    ('eye-asymmetry', 'Gi', 'common', 'isFollowingTurn'),
    ('morph-system', 'Sa', 'common', 'isReducedMotion'),
    ('lid-machine', 'Yi', 'common', 'lidMorph'),
    # pumpkin field
    ('pumpkin-radius', 'Tf', 'common', 'Fd'),
    ('pumpkin-table', 'Ef', 'common', '51681'),
    ('pumpkin-lookup', 'kf', 'common', 'radii'),
    ('pumpkin-stem', 'op', 'common', '3456'),
    ('pumpkin-silhouette', 'Ff', 'common', 'stem:sp('),
    ('pumpkin-contours', 'Lf', 'common', 'paints'),
    ('pumpkin-contour-walk', 'up', 'common', 'outerBands'),
    # mesh construction
    ('contour-extent', 'Dc', 'common', 'Math.min(63'),
    ('ring-points', 'Ac', 'common', 't*Math.sin(i)'),
    ('sample-step', 'z', 'common', 'Ns(Ws(e).path'),
    ('outline-cache', 'Ws', 'common', 'Vs(Hs[e]())'),
    ('revolve', 'kc', 'common', '-(t-L)/L'),
    ('loft', 'Rc', 'common', 'length:ic'),
    ('inscribed-balls', 'Fc', 'common', 'Math.min(n,e)'),
    ('crystal-balls', 'Ec', 'common', 'y:1.04'),
    ('star-flower', 'Lc', 'common', 'r:.36'),
    ('polar-reach', 'tm', 'common', 'mm(t,e,n)'),
    ('reach-at', 'gm', 'common', 'findIndex'),
    # projection and path emit
    ('round-2dp-str', 'Oh', 'common', 'Math.round(e*100)/100'),
    ('poly-round', 'gu', 'common', 'Math.round(e*100)/100'),
    ('ellipse-point', 'wm', 'common', '1/Math.sqrt'),
    ('arc-winds', 'Mm', 'common', 'Im(t-n)'),
    ('wrap-tau', 'Im', 'common', 't<0?t+2*Math.PI:t'),
    ('arc-split-max', '$m', 'common', 'Math.PI*.999'),
    ('ellipse-arcs', 'Cm', 'common', 'radii:e,sweep:t*Math.PI'),
    ('arc-emit', '_h', 'common', 't.sweep>0?0:1'),
    ('segment-path', 'gh', 'common', 'i}Z'),
    ('loop-path', 'um', 'common', 'join(`L`)'),
    ('poly-path', 'nu', 'common', 'M${gu(n[0])}'),
    ('contour-with-holes', 'Sm', 'common', 'Nm(['),
    ('stitch-loops', 'Nm', 'common', 'r.has(o)'),
    ('reverse-arc', 'Am', 'common', 'sweep:-e.sweep'),
    ('bridge-arcs', 'jm', 'common', 'Mm(t,c)'),
    ('rgb-hex', 'ro', 'common', 'padStart(2,'),
    ('body-fill', 'io', 'common', 'inkPaint'),
    ('spot-fill', 'ao', 'common', 'spotPaint'),
    ('dom-node', 'Y', 'common', 'children:n'),
    ('render-payload', 'Fp', 'common', 'stem:[]'),
    ('pumpkin-payload', 'Ip', 'common', 'body:[nu('),
    ('shape-body', 'Rp', 'common', 'yawPeriod'),
    ('eye-payload', 'Lp', 'common', 'JSON.stringify(r)'),
    # identity
    ('hash-id', 'bn', 'common', '16777619'),
    ('shape-hash', 'En', 'common', '73244475'),
    ('default-shape', 'Dn', 'common', 'dn['),
    ('default-color', 'Tn', 'common', '_n['),
    ('resolve-character', 'An', 'common', 'avatarShape'),
    ('resolve-gated', 'jn', 'common', 'mn(e.avatarShape)'),
    ('resolve-mesh', 'Mn', 'common', 'fn['),
    ('to-body-map', 'i_', 'common', 'starFlower'),
    ('compact-threshold', 's_', 'common', '48'),
    # svg emit
    ('fill-clamp', 'yM', 'platform', '_M'),
    ('body-path', 'CM', 'platform', 'eyes:'),
    ('body-markup', 'SM', 'platform', 'stroke-linejoin'),
    ('still-svg', 'bM', 'platform', 'grok-bot-still'),
    ('paint-mode', 'o_', 'common', 'cutout'),
    # linked avatars
    ('picker-color', 'wu', 'app', 'pickerColor'),
    ('mark-svg', 'THe', 'app', 'data:image/svg+xml'),
    ('stack-layout', 'NHe', 'app', '5/9'),
    ('stack-cut', 'PHe', 'app', '.216'),
    ('slots-overlap', 'FHe', 'app', 'Math.hypot'),
    ('indicator-box', 'HHe', 'app', 'working'),
    ('indicator-geometry', 'UHe', 'app', 'hole:'),
    ('unread-width', 'VHe', 'app', '>99?34'),
    ('initials-size', 'kHe', 'app', 'isPerson'),
    ('initials-words', 'xZe', 'app', 'hZe'),
    ('initials-pick', 'bZe', 'app', 'yZe'),
    ('ink-contrast', 'aHe', 'app', '.05'),
    ('resolve-ink', 'CHe', 'app', 'light:'),
    ('ink-on-surface', 'SHe', 'app', 'rrggbb'),
]


BUNDLES = {'common': S.COMMON, 'app': S.APP_BUNDLE, 'platform': S.PLATFORM}


def main():
    os.makedirs(S.SRC_OUT, exist_ok=True)
    recorded = {'data': [], 'functions': [], 'tableAsCode': [], 'scalars': [], 'skipped': []}
    for name, symbol, bundle in DATA:
        if symbol is None:
            continue
        try:
            entry = S.record(name, symbol, bundle, 'data')
            recorded['data'].append((name, entry['offset'], entry['length'], entry['sha1']))
        except SystemExit as error:
            # A table that calls builders is code, not data: keep it verbatim.
            if 'not a plain literal' not in str(error):
                raise
            entry = S.record(name, symbol, bundle, 'code')
            recorded['tableAsCode'].append((name, entry['offset'], entry['length'], entry['sha1']))
    for name, symbol, bundle_key, witness in SCALARS:
        bundle = BUNDLES[bundle_key]
        try:
            entry = S.record(name, symbol, bundle, 'scalar', near=witness)
        except SystemExit as error:
            recorded['skipped'].append((name, str(error)))
            continue
        recorded['scalars'].append((name, bundle_key, entry['offset'], entry['value'] if 'value' in entry else entry['length']))
    for name, symbol, bundle_key, witness in FUNCTIONS:
        bundle = BUNDLES[bundle_key]
        try:
            entry = S.record(name, symbol, bundle, 'code', fn=True, near=witness)
        except SystemExit as error:
            recorded['skipped'].append((name, str(error)))
            continue
        recorded['functions'].append((name, bundle_key, entry['offset'], entry['length'], entry['sha1']))
    print(json.dumps({k: v for k, v in recorded.items() if k != 'functions'}, indent=2))
    print('functions recorded:', len(recorded['functions']))


if __name__ == '__main__':
    main()
