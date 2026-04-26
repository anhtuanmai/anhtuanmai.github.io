# MAI Anh Tuan — Personal Site

Personal site, blog, and resume — live at [https://anhtuanmai.github.io](https://anhtuanmai.github.io).

---

## Project structure

```
.
├── docs/                # Jekyll source — served by GitHub Pages
│   ├── _config.yml      # Site configuration
│   ├── _config.dev.yml  # Local dev overrides
│   ├── _data/           # authors, navigation, theme data
│   ├── _pages/          # home, cv, blog, contact, archives, 404
│   ├── _posts/          # Published articles
│   ├── _drafts/         # Unpublished drafts
│   ├── _includes/       # Theme override partials
│   ├── assets/images/   # Profile picture, backgrounds, favicons
│   ├── Gemfile          # Ruby dependencies
│   └── Rakefile         # `rake build` shortcut
├── architecture.md      # Detailed layout & build notes
└── README.md            # This file
```

See [`architecture.md`](./architecture.md) for the full directory layout.

---

## Tech stack

- **Jekyll** static site generator, built and served by **GitHub Pages**
- **Minimal Mistakes** theme (`mmistakes/minimal-mistakes@4.28.0`) via `jekyll-remote-theme`
- **kramdown** (GFM) + **Rouge** for Markdown and syntax highlighting
- **lunr** client-side search (full content)
- Plugins: `jekyll-feed`, `jekyll-sitemap`, `jekyll-paginate`, `jekyll-gist`, `jemoji`, `jekyll-include-cache`

---

## Local development

```bash
cd docs
bundle install
bundle exec jekyll serve --config _config.yml,_config.dev.yml
# or:
bundle exec rake build
```

The dev override (`_config.dev.yml`) swaps the remote theme for the local `minimal-mistakes-jekyll` gem and points `url` at `http://localhost:4000`.

---

## License

Personal use. Feel free to adapt the structure for your own site.
