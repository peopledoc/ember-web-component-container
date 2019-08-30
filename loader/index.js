import "regenerator-runtime/runtime";
import data from './loader/component.json'

let name = data.name;

// fake private method
function _appendCss(dest, css) {
  let files = Object.values(css)
  files.forEach((f)=> {
    let style = document.createElement('link')
    style.setAttribute('href', f)
    style.setAttribute('rel', 'stylesheet')
    dest.appendChild(style)
  })
}

// fake private method
async function _appendJs(dest, js) {
  let files = Object.values(js)
  return files.reduce(async (p, f)=> {
    await p
    return new Promise(function(resolve) {
      let js = document.createElement('script')
      js.defer = true
      js.setAttribute('src', f)
      dest.appendChild(js)
      js.onload = ()=> resolve()
    })
  }, Promise.resolve())
}

let css = (data.assets || {}).css
let js = (data.assets || {}).js

class ApplicationContainer extends HTMLElement {
  #css = css
  #js = js
  #shadowRoot
  #application

  constructor() {
    super()
    this.#shadowRoot = this.attachShadow({mode: 'closed'})

    // The 2 divs are a trick in how Ember finds their parent
    let rootParent = document.createElement('div')
    _appendCss(rootParent, this.#css)
    this._loading = _appendJs(rootParent, this.#js)
    let rootElement = document.createElement('div')
    rootElement.setAttribute('data-ember-root-element', '')
    this.#shadowRoot.appendChild(rootParent)
    rootParent.appendChild(rootElement)
  }

  // Starts the app when an element is connected
  async connectedCallback() {
    if (this._application || !this.isConnected) {
      return
    }

    await this._loading

    // Handle inner config
    let configSource = this.querySelector('[data-json-config]').textContent
    let appConfig = JSON.parse(configSource)

    // Handle attribute-based config
    let attributes = [...this.attributes].reduce((acc, a)=> {
      return {...acc, [a.nodeName]: a.nodeValue }
    }, {})
    let config = { ...appConfig, ...attributes }

    // Create the app
    let app = require(`${name}/app`).default.create({
      rootElement: this.#shadowRoot.querySelector(`[data-ember-root-element]`),
      config
    })
    this._application = app

    // Register the attributes
    app.register('service:context', config, { instantiate: false })
  }

  // Destroy the app on disconnection of the node
  disconnectedCallback() {
    if (!this._application.isDestroyed && !this._application.isDestroying) {
      this._application.destroy()
    }
  }

  // That makes the application accessible via:
  // document.querySelector('application-name').__EMBER_APPLICATION
  get __EMBER_APPLICATION() {
    return this._application
  }
}

let componentName = name
if (-1 === name.indexOf('-')) {
  componentName += '-app'
}

customElements.define(componentName, ApplicationContainer)
