"""Bake the player pool for the embeddings article's radar (interactive 5).

Reads two sibling projects and never writes to them:

  ../pes-avatars     PES 6 heads, hair, skins, boots, kits and the shared
                     animated body, already converted to glTF/WebP
  ../fifa-embeddings the frozen EA FC26 ratings the article's search uses

Writes the assets for a curated pool to public/figures/what-are-embeddings/pes/
and the ratings to components/mdx/player-radar/players.json. The pool is
curated because each avatar costs ~300 KB: the full 706 would be ~200 MB.

    python3 scripts/bake-pes-players.py
"""

import csv
import json
from datetime import date, datetime
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PES = ROOT.parent / "pes-avatars"
FIFA = ROOT.parent / "fifa-embeddings" / "data" / "ea_fc26_players.csv"
OUT_ASSETS = ROOT / "public/figures/what-are-embeddings/pes"
OUT_DATA = ROOT / "components/mdx/player-radar/players.json"

# Wirtz, the search's shortlist where PES has a face, then contrasting shapes.
POOL = [
    "deu-wirtz", "nld-dijk",
    "fra-olise", "eng-saka", "esp-olmo",
    "deu-musiala", "esp-pedri", "eng-bellingham", "hrv-modric", "prt-fernandes",
    "esp-rodri", "eng-rice", "fra-kante",
    "deu-rudiger", "fra-saliba", "hrv-gvardiol", "mar-hakimi",
    "nor-haaland", "eng-kane", "fra-mbappe", "egy-salah", "esp-yamal", "arg-messi", "bra-junior",
]

# Squad rows the pes-avatars matcher left without an FC26 id, checked by hand.
FC_OVERRIDES = {"bra-junior": "238794"}

# Ages are given on the day of the FC26 value snapshot the search uses.
AGE_ON = date(2025, 9, 19)

HEADLINE = ["pac", "sho", "pas", "dri", "def", "phy"]


def detailed_columns(header: list[str]) -> list[str]:
    """The 29 search attributes: acceleration through strength, inclusive."""
    cols = header[header.index("acceleration") : header.index("strength") + 1]
    assert len(cols) == 29, cols
    return cols


def age(birthdate: str) -> int:
    born = datetime.strptime(birthdate.split()[0], "%m/%d/%Y").date()
    return AGE_ON.year - born.year - ((AGE_ON.month, AGE_ON.day) < (born.month, born.day))


def main() -> None:
    pes = json.loads((PES / "public/assets/players.json").read_text())
    by_id = {p["id"]: p for p in pes["players"]}

    squads = list(csv.DictReader((PES / "pipeline/data/wc2026_squads_matched.csv").open()))
    fc_of = {}
    for row in squads:
        fc_of[(row["team"], row["shirt_no"], row["player"])] = (row["player_id"] or "").split(".")[0]

    with FIFA.open() as fh:
        reader = csv.DictReader(fh)
        detailed = detailed_columns(reader.fieldnames or [])
        fifa = {row["id"]: row for row in reader}

    if OUT_ASSETS.exists():
        shutil.rmtree(OUT_ASSETS)
    (OUT_ASSETS / "body").mkdir(parents=True)
    shutil.copy(PES / "public/assets/body/body.glb", OUT_ASSETS / "body/body.glb")

    players = []
    for pid in POOL:
        p = by_id[pid]
        team = pes["teams"][p["iso3"]]
        fc_id = FC_OVERRIDES.get(pid) or fc_of[(team["name"], str(p["shirtNumber"]), p["name"])]
        row = fifa[fc_id]
        assert row["position"] != "GK", pid
        assert p["head"] and p["hair"], pid

        assets = {}
        for key in ("head", "hair", "skin", "boot"):
            if p.get(key):
                src = PES / "public/assets" / p[key]
                dst = OUT_ASSETS / p[key]
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(src, dst)
                assets[key] = p[key]
        kit = team["kit"]["home"]
        (OUT_ASSETS / kit).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(PES / "public/assets" / kit, OUT_ASSETS / kit)
        assets["kit"] = kit

        players.append({
            "id": int(fc_id),
            "slug": pid,
            "name": p["name"],
            "team": team["name"],
            "club": row["team"],
            "position": row["position"],
            "shirt": p["shirtNumber"],
            "nation": p["iso3"],
            "height": int(row["height"]),
            "age": age(row["birthdate"]),
            "foot": "R" if row["preferredFoot"] == "1" else "L",
            "overall": int(row["overallRating"]),
            "headline": [int(row[c]) for c in HEADLINE],
            "detailed": [int(row[c]) for c in detailed],
            "assets": assets,
        })

    OUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    OUT_DATA.write_text(json.dumps({
        "source": "EA FC26 ratings (fifa-embeddings/data/ea_fc26_players.csv); PES 6 avatars (pes-avatars)",
        "detailed": detailed,
        "players": players,
    }, ensure_ascii=False, indent=1) + "\n")
    size = sum(f.stat().st_size for f in OUT_ASSETS.rglob("*") if f.is_file())
    print(f"{len(players)} players, {size / 1e6:.1f} MB of assets")


if __name__ == "__main__":
    main()
