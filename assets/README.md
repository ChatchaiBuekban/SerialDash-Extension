# Assets

Static files used by the Serial Dash extension and its documentation.

## Structure

```
assets/
├── icons/    # Extension marketplace icon + any SVG/PNG icons
│   └── icon.png       (128x128 recommended for marketplace)
└── images/   # Screenshots, banners, and docs images
    └── screenshot-dashboard.png
```

## Usage

- **Marketplace icon**: referenced from `package.json` via the `icon` field (e.g. `"icon": "assets/icons/icon.png"`).
- **Docs images**: reference from `README.md` with relative paths, e.g.
  ```markdown
  ![Dashboard](assets/images/screenshot-dashboard.png)
  ```
