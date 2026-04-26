```
anhtuanmai.github.io/                ← git repository root
│
├── docs/                            ← GitHub Pages source (Jekyll root)
│   │
│   ├── _config.yml                  ← Jekyll configuration (production)
│   ├── _config.dev.yml              ← Local development overrides
│   ├── Gemfile                      ← Ruby dependencies (github-pages gem)
│   ├── Gemfile.lock
│   ├── Rakefile                     ← `rake build` → jekyll build with dev config
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
│   │   └── 2018-12-25-voeux-pour-exyzt.md
│   │
│   ├── _drafts/                     ← Unpublished drafts
│   │   └── post-draft.md
│   │
│   ├── _portfolio/                  ← Portfolio collection (excluded from build)
│   │   └── _template.md
│   │
│   ├── _includes/                   ← Theme override partials
│   │   ├── head/custom.html
│   │   ├── after-content.html
│   │   ├── before-related.html
│   │   └── comments-providers/scripts.html
│   │
│   ├── _docs/                       ← Vendored Minimal Mistakes theme docs (reference)
│   │   └── 01-quick-start-guide.md … 22-faq.md
│   │
│   └── assets/
│       └── images/
│           ├── anhtuan-profile-picture.jpeg
│           ├── bg.jpg / bg.webp / bg-sunrise.webp / bg-sunset.webp
│           └── favicon-*.png / favicon.svg / favicon.ico
│
├── architecture.md
└── README.md
```

## Notes

- **Theme**: [`mmistakes/minimal-mistakes`](https://github.com/mmistakes/minimal-mistakes) `@4.28.0`, pulled via `jekyll-remote-theme`. No `_layouts/` or `_sass/` are vendored — overrides go through `_includes/` and `_data/`.
- **Build**: GitHub Pages auto-builds from `docs/` on push. Local dev: `cd docs && bundle exec jekyll serve --config _config.yml,_config.dev.yml` (or `rake build`).
- **URL**: <https://anhtuanmai.github.io>
- **Search**: lunr, full-content indexing enabled.
- **Excluded from build** (see `_config.yml`): `_portfolio`, `Gemfile`, `Rakefile`, `README`, vendor and cache dirs.
