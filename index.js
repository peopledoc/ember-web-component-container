'use strict';

module.exports = {
  name: require('./package').name,
  config(env, config) {
    if (!this.app) {
      return;
    }
    this.app.options.storeConfigInMeta = false;
    this.app.options.autoRun = false;
    return {
      webComponentsAssets : {
        styles: this._styles
      }
    }
  },
  included(addon) {
    let { options } = addon
    let styles = {
      // Why tho?? The structure of options.outputPaths is weird and inconsistent
      ...options.outputPaths.app.css,
      vendor: options.outputPaths.vendor.css
    }

    this._styles = styles

    this.app.import('vendor/register-components.js')
  }
};
