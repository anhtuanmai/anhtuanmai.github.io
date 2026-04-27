```
anhtuanmai.github.io/                ← git repository root
│
├── docs/                            ← GitHub Pages source (Jekyll root)
│   │
│   ├── _config.yml                  ← Jekyll configuration (production)
│   ├── _config.dev.yml              ← Development overrides (consumed by Rakefile)
│   ├── Gemfile                      ← Ruby dependencies (github-pages gem)
│   ├── Gemfile.lock
│   ├── Rakefile                     ← `rake serve` / `rake build` with dev config
│   ├── favicon.ico
│   │
│   ├── _data/                       ← Site-wide data files
│   │   ├── authors.yml
│   │   ├── navigation.yml           ← Top-nav menu
│   │   └── theme.yml
│   │
│   ├── _pages/                      ← Standalone pages
│   │   ├── home.html                ← Landing page (splash)
│   │   ├── cv.html                  ← Resume / CV
│   │   ├── blog.md                  ← Blog listing
│   │   ├── contact.md
│   │   ├── category-archive.md
│   │   ├── tag-archive.md
│   │   ├── sitemap.md
│   │   └── 404.md
│   │
│   ├── _posts/                      ← Published blog articles
│   │
│   ├── _drafts/                     ← Unpublished drafts
│   │
│   ├── _portfolio/                  ← Portfolio collection (excluded from build)
│   │
│   ├── _includes/                   ← Theme override partials
│   │   └── head/custom.html         ← Favicon, round avatar, base font-size
│   │
│   └── assets/
│       ├── css/
│       │   └── main.scss            ← Theme override SCSS (overrides search-input, etc.)
│       └── images/
│
├── local.sh                         ← Shortcut: runs `bundle exec rake serve` in docs/
├── architecture.md
└── README.md
```

## Notes

- **Theme**: [`mmistakes/minimal-mistakes`](https://github.com/mmistakes/minimal-mistakes) `@4.28.0`, pulled via `jekyll-remote-theme`. No `_layouts/` or `_sass/` are vendored — overrides go through `_includes/` and `_data/`.
- **Build**: GitHub Pages auto-builds from `docs/` on push. Dev workflow: `./local.sh` from the repo root, or `cd docs && bundle exec rake serve` (live server, LAN-reachable on `:4000`). One-shot dev build: `bundle exec rake build`. The Rakefile and `_config.dev.yml` are not used in production.
- **URL**: <https://anhtuanmai.github.io>
- **Search**: lunr, full-content indexing enabled.
- **Excluded from build** (see `_config.yml`): `_portfolio`, `Gemfile`, `Rakefile`, `README`, vendor and cache dirs.
