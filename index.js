'use strict';

const writeFile = require('broccoli-file-creator');
const funnel = require('broccoli-funnel')
const merge = require('broccoli-merge-trees')
const path = require('path')
const rollup = require('broccoli-rollup')
const json = require('rollup-plugin-json')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')

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
      css: [ vendorCss, appCss.app ],
      js: [ vendorJs, appJs ]
    }

  },
  treeForPublic() {
    let componentConfig = {
      name: this.app.name,
      assets: this.config().webComponentsAssets
    }
    let loader = funnel(path.resolve(__dirname, './loader'))
    const data = writeFile('/loader/component.json', JSON.stringify(componentConfig))
    const tree = merge([data, loader])
    const loaderRollup = rollup(tree, {
      rollup: {
        input: 'index.js',
        output: {
          format: 'umd',
          file: 'loader.js'
        },
        plugins: [
          resolve(),
          json(),
          babel({
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ],
            presets: [['@babel/env', {
              targets: 'last 2 version, ie 11',
              useBuiltIns: "entry",
              corejs: 3
            }]]
          })
        ]
      }
    });
    return loaderRollup
  }
};
