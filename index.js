'use strict';

module.exports = {
  name: require('./package').name,
  config(env, config) {
    let app = this._findHost()
    if (!app) {
      return;
    }
    app.options.storeConfigInMeta = false;
    app.options.autoRun = false;

    let assets = this._findAssets(app.options.outputPaths)
    return {
      webComponentsAssets : assets

    }
  },
  included(addon) {
    this.app.import('vendor/register-components.js')
  },
  _findAssets(paths) {
    let {
      app: {
        css: appCss,
        js: appJs
      },
      vendor: {
        css: vendorCss,
        js: vendorJs
      }
    } = paths
    return {
      css: { ...appCss, vendor: vendorCss },
      js: { app: appJs, vendor: vendorJs }
    }

  }
};
