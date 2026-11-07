"""打包插件产物 → dist/<name>.zip，算 sha256 并写回 index.json。

用法：
    python scripts/release.py            # 只打包 + 回填 sha256
    python scripts/release.py --tag v1   # 同时把 downloadUrl 指到 <仓库>/releases/download/v1/

配套发布：
    python scripts/release.py --tag v1
    gh release create v1 dist/*.zip --title v1 --notes "插件包"
    git commit -am "release: v1" && git push

约束（与引擎的解压逻辑一致）：zip 内顶层目录必须等于插件名，且与该目录里的
manifest.json 的 name 相同；否则应用侧安装会以「插件名不匹配」拒绝。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGINS = ROOT / "plugins"
INDEX = ROOT / "index.json"
DIST = ROOT / "dist"


def repo_slug() -> str:
    """从 origin 取 owner/repo；取不到就报错（downloadUrl 必须是绝对地址）。"""
    try:
        url = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        raise SystemExit(f"无法读取 git origin：{e}")
    m = re.search(r"github\.com[:/]([^/]+/[^/.]+)", url)
    if not m:
        raise SystemExit(f"origin 不是 github 地址：{url}")
    return m.group(1)


def build_zip(name: str) -> Path:
    src = PLUGINS / name
    if not (src / "manifest.json").is_file():
        raise SystemExit(f"缺少 manifest：{src}")
    manifest = json.loads((src / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("name") != name:
        raise SystemExit(f"目录名与 manifest.name 不一致：{name} != {manifest.get('name')}")

    DIST.mkdir(exist_ok=True)
    out = DIST / f"{name}.zip"
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(src.rglob("*")):
            if path.is_file():
                # 顶层目录必须是插件名，与引擎解压校验一致
                z.write(path, arcname=f"{name}/{path.relative_to(src).as_posix()}")
    return out


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--tag", help="发布 tag；给了就把 downloadUrl 改写成该 tag 的地址")
    args = ap.parse_args()

    index = json.loads(INDEX.read_text(encoding="utf-8"))
    slug = repo_slug()
    tag = args.tag
    if tag is None:
        # 沿用 index.json 里已有的 tag（没有就报错，避免写出半套地址）
        first = index["plugins"][0].get("downloadUrl", "")
        m = re.search(r"/releases/download/([^/]+)/", first)
        tag = m.group(1) if m else None

    for entry in index["plugins"]:
        name = entry["name"]
        zpath = build_zip(name)
        digest = sha256(zpath)
        entry["sha256"] = digest
        if tag:
            entry["downloadUrl"] = (
                f"https://github.com/{slug}/releases/download/{tag}/{name}.zip"
            )
        print(f"{name:<18} {zpath.stat().st_size:>7} B  sha256={digest[:16]}…")

    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n已写回 {INDEX}（{len(index['plugins'])} 个插件，tag={tag or '未变'}）")
    if tag is None:
        print("提示：未指定 --tag，downloadUrl 保持原样；发布前请确认它与实际 release 一致。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
