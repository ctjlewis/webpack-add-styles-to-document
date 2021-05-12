const crypto = require('crypto')
const { sources, Compilation } = require('webpack')

const appendToHead = (styles, hexDigest) => `
/** Embedded by add-styles-to-document */
(function() {
  var COMPONENT_ID = "__STYLES_${hexDigest}";
  
  if (
    typeof window === 'undefined' ||
    COMPONENT_ID in window
    ) return;
    
  var STYLE_TAG_ID = '__WEBPACK_ADD_STYLES';
  var STYLE_TAG = document.getElementById('__WEBPACK_ADD_STYLES');
  var STYLES = "${styles.replace(/[\n\r]/g, '').replace(/"/g, '\"')}";
  
  if (STYLE_TAG) {
    STYLE_TAG.append(STYLES);
  } else {
    STYLE_TAG = document.createElement('style');
    STYLE_TAG.setAttribute('id', STYLE_TAG_ID);
    STYLE_TAG.innerHTML = STYLES;
    document.head.append(STYLE_TAG);
  }

  window[COMPONENT_ID] = true;
})();
`;

const embedStyles = (styles) => {
  const hash = crypto.createHash('md4');
  const hexDigest = hash.update(styles).digest('hex');
  return appendToHead(styles, hexDigest);
}

const jsPattern = /\.[cm]?js$/;

class AddStylesToDocument {
  apply(compiler) {
    compiler.hooks.compilation.tap('add-styles-to-document', (
      compilation
    ) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'add-styles-to-document',
          stage: Compilation.PROCESS_ASSETS_STAGE_DERIVED
        },
        () => {
          for (const chunk of compilation.chunks) {
            for (const file of chunk.files) {
              /**
               * In each output chunk, for all emitted JS files, look for
               * matching CSS files, i.e. add the runtime loader for styles in
               * path/to/file.css to a file called path/to/file.js.
               */
              if (jsPattern.test(file)) {
                const matchingCssFile = file.replace(jsPattern, '') + '.css';
                if (Array.from(chunk.files).includes(matchingCssFile)) {
                  const jsFile = compilation.getAsset(file);
                  const cssFile = compilation.getAsset(matchingCssFile);
                  /**
                   * Create the style embed declaration and updated JS source.
                   */
                  const styleEmbedIife = embedStyles(cssFile.source.source());
                  const updatedJs = jsFile.source.source() + '\n' + styleEmbedIife;
                  /**
                   * Tell Webpack to update the asset.
                   */
                  compilation.updateAsset(file, new sources.RawSource(updatedJs));
                }
              }
            }
          }
        }
      );
    });
  }
}

module.exports = AddStylesToDocument;