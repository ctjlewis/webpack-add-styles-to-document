# Webpack: Add styles to document

Does exactly what it says on the label. Reads the CSS output chunks from
Webpack, minimizes the styles, and appends them to a `<style>` element in
`document.head` for files that share the same name as the CSS file, i.e.,
`path/to/file.css` matches `path/to/file.js`.

Basically the same as
[`style-loader`](https://webpack.js.org/loaders/style-loader/), but doesn't
break on Next.

```js
const AddStylesToDocumentPlugin = require('webpack-add-styles-to-document');

module.exports = {
  ...,
  plugins: [
    AddStylesToDocumentPlugin,
    ...,
  ]
}
```

`path/to/file/index.css` styles are minified and embedded in the document for
the output JS chunk at `path/to/file/index.js`:

```html
<style id="__WEBPACK_ADD_STYLES">._1hVOKtRGlREl5YHXSURo2-{background:#f0f8ff;border:2px solid #2f4f4f;border-radius:8px;padding:8px;width:128px}/*# sourceMappingURL=index.css.map*/._1n50EFygTGWJGYZWBlGF8m{font-size:2.25rem;line-height:2.5rem}/*# sourceMappingURL=index.css.map*/</style>
```

And the styles are available to the DOM.