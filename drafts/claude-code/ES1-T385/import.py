#!/usr/bin/env python3
"""ES1-T507: dữ liệu blog TE-20 trên store dev hoa-qua-nhap-khau (idempotent theo handle). Chỉ tạo, không xoá."""
import json, subprocess, sys

STORE = "hoa-qua-nhap-khau.myshopify.com"
assert STORE == "hoa-qua-nhap-khau.myshopify.com"


def gql(query, variables=None, mutate=False):
    cmd = ["shopify", "store", "execute", "-s", STORE, "--no-input", "-j", "-q", query]
    if variables is not None:
        cmd += ["-v", json.dumps(variables)]
    if mutate:
        cmd.append("--allow-mutations")
    r = subprocess.run(cmd, capture_output=True, text=True)
    out = r.stdout
    start = out.find("\n{")
    body = out[start + 1:] if start >= 0 else out[out.find("{"):]
    try:
        return json.loads(body)
    except Exception:
        print("ERR", r.returncode, out[-2000:], r.stderr[-2000:], file=sys.stderr)
        raise


IMG = [f"https://cdn.shopify.com/s/files/1/0625/5335/8433/articles/efx-blog-{i}.jpg" for i in range(1, 4)]

PARA = (
    "<p>Consistent training beats occasional heroics. Start every session with five minutes of easy movement, "
    "then work through two or three compound lifts at a weight you can control for every rep. "
    "Track your sets so you know when to add load, and leave one or two reps in reserve on most days.</p>"
    "<p>Recovery is part of the plan, not a break from it. Sleep, hydration and a short mobility routine after "
    "each workout keep joints happy and help you show up again tomorrow. "
    "Read more in our <a href=\"/blogs/figma-blog\">Training Tips</a> blog.</p>"
    "<p>Equipment does not need to be complicated: a pair of adjustable dumbbells, a bench and a mat cover most "
    "home programs. Add bands or a speed rope when you want variety, and keep the space clear so every session "
    "starts quickly.</p>"
)


def summary(title):
    return f"<p>{title}: a short guide from the Efitco team for training at home.</p>"


def art(handle, title, day, tags=None, image=True, body=PARA, img_i=0):
    return {
        "handle": handle,
        "title": title,
        "body": body,
        "summary": summary(title) if body else "",
        "tags": tags or [],
        "image": {"url": IMG[img_i % 3], "altText": title} if image else None,
        "isPublished": True,
        "publishDate": f"2026-10-{day:02d}T08:00:00Z",
        "author": {"name": "Efitco"},
    }


TAGS = ["Strength", "Cardio", "Recovery"]
PAGED_TITLES = [
    "Build a Morning Routine", "Five Kettlebell Basics", "Bench Press at Home", "Speed Rope Intervals",
    "Mobility in Ten Minutes", "Choosing Plate Weights", "Rack Safety Checklist", "Bands for Warm Ups",
    "Rest Days That Work", "Grip Strength Simple Plan", "Small Space Home Gym", "Tracking Your Progress",
]

BLOGS = [
    {"handle": "te20-empty", "title": "TE20 Empty Blog", "commentPolicy": "CLOSED", "articles": []},
    {"handle": "te20-paged", "title": "TE20 Paged Blog", "commentPolicy": "MODERATED", "articles": [
        art(f"te20-paged-{i + 1:02d}", t, i + 1, [TAGS[i % 3]], True, PARA, i) for i, t in enumerate(PAGED_TITLES)
    ]},
    {"handle": "te20-no-tag", "title": "TE20 No Tag Blog", "commentPolicy": "MODERATED", "articles": [
        art("te20-no-tag-01", "Warm Up Without Tags", 1, [], True, PARA, 0),
        art("te20-no-tag-02", "Cool Down Without Tags", 2, [], True, PARA, 1),
        art("te20-no-tag-03", "Stretching Without Tags", 3, [], True, PARA, 2),
    ]},
    {"handle": "te20-edge", "title": "TE20 Edge Blog", "commentPolicy": "MODERATED", "articles": [
        art("te20-edge-no-image", "Edge Article Without Image", 1, ["Strength"], False, PARA),
        art("te20-edge-empty-content", "Edge Article With Empty Content", 2, ["Cardio"], True, "", 1),
        art("te20-edge-no-tag", "Edge Article Without Tag", 3, [], True, PARA, 2),
        art("te20-edge-normal", "Edge Article Normal", 4, ["Recovery"], True, PARA, 0),
    ]},
    {"handle": "te20-single", "title": "TE20 Single Blog", "commentPolicy": "MODERATED", "articles": [
        art("te20-single-only", "The Only Article Here", 1, ["Strength"], True, PARA, 0),
    ]},
    {"handle": "te20-closed", "title": "TE20 Comments Closed", "commentPolicy": "CLOSED", "articles": [
        art("te20-closed-article", "Article With Comments Closed", 1, ["Cardio"], True, PARA, 1),
    ]},
    {"handle": "te20-comments", "title": "TE20 Comments Blog", "commentPolicy": "AUTO_PUBLISHED", "articles": [
        art("te20-comments-paged", "Article With Many Comments", 1, ["Recovery"], True, PARA, 2),
    ]},
]

Q_BLOG = "query($q:String!){ blogs(first:5, query:$q){ nodes { id handle title commentPolicy articles(first:50){ nodes { id handle } } } } }"
M_BLOG = "mutation($b:BlogCreateInput!){ blogCreate(blog:$b){ blog { id handle commentPolicy } userErrors { field message } } }"
M_ART = "mutation($a:ArticleCreateInput!){ articleCreate(article:$a){ article { id handle } userErrors { field message } } }"

result = []
for b in BLOGS:
    found = [n for n in gql(Q_BLOG, {"q": f"handle:{b['handle']}"})["blogs"]["nodes"] if n["handle"] == b["handle"]]
    if found:
        blog = found[0]
        status = "có sẵn"
        if blog["commentPolicy"] != b["commentPolicy"]:
            print("CẢNH BÁO commentPolicy khác", b["handle"], blog["commentPolicy"], file=sys.stderr)
        existing = {a["handle"]: a["id"] for a in blog["articles"]["nodes"]}
    else:
        r = gql(M_BLOG, {"b": {"handle": b["handle"], "title": b["title"], "commentPolicy": b["commentPolicy"]}}, True)["blogCreate"]
        if r["userErrors"]:
            sys.exit(f"blogCreate {b['handle']}: {r['userErrors']}")
        blog = r["blog"]
        status = "tạo mới"
        existing = {}
    result.append({"type": "blog", "handle": b["handle"], "id": blog["id"], "status": status, "commentPolicy": b["commentPolicy"]})
    for a in b["articles"]:
        if a["handle"] in existing:
            result.append({"type": "article", "handle": f"{b['handle']}/{a['handle']}", "id": existing[a["handle"]], "status": "có sẵn"})
            continue
        inp = {k: v for k, v in a.items() if v is not None}
        if not inp.get("summary"):
            inp.pop("summary", None)
        inp["blogId"] = blog["id"]
        r = gql(M_ART, {"a": inp}, True)["articleCreate"]
        if r["userErrors"]:
            sys.exit(f"articleCreate {a['handle']}: {r['userErrors']}")
        result.append({"type": "article", "handle": f"{b['handle']}/{a['handle']}", "id": r["article"]["id"], "status": "tạo mới"})

print(json.dumps(result, ensure_ascii=False, indent=1))
