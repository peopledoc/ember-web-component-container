import config from 'ember-get-config'
import Ember from 'ember'

let name = config.modulePrefix;

// fake private method
function _appendStyles(dest, styles) {
  let files = Object.values(styles)
  files.forEach((f)=> {
    let style = document.createElement('link')
    style.setAttribute('href', f)
    style.setAttribute('rel', 'stylesheet')
    dest.appendChild(style)
  })
}

class ApplicationContainer extends HTMLElement {
  #styles = (config.webComponentsAssets || {}).styles
  #shadowRoot
  #application

  constructor() {
    super()
    this.#shadowRoot = this.attachShadow({mode: 'closed'})
    // The 2 divs are a trick in how Ember finds their parent
    let rootParent = document.createElement('div')
    _appendStyles(rootParent, this.#styles)
    let rootElement = document.createElement('div')
    rootElement.setAttribute('data-ember-root-element', Ember.guidFor(this))
    this.#shadowRoot.appendChild(rootParent)
    rootParent.appendChild(rootElement)

  }

  connectedCallback() {
    if (this.#application || !this.isConnected) {
      return
    }

    let app = require(`${name}/app`).default.create({
      rootElement: this.#shadowRoot.querySelector(`[data-ember-root-element="${Ember.guidFor(this)}"]`)
    })
    this.#application = app
  }

  disconnectedCallback() {
    if (!this.#application.isDestroyed && !this.#application.isDestroying) {
      this.#application.destroy()
    }
  }

  // That makes the application accessible via:
  // document.querySelector('application-name').__EMBER_APPLICATION
  get __EMBER_APPLICATION() {
    return this.#application
  }
}

let componentName = name
if (-1 === config.modulePrefix.indexOf('-')) {
  componentName += '-app'
}

customElements.define(componentName, ApplicationContainer)


/**
 * TODO
 *    RECOMMEND to remove export-application-global
 *    Attributes and slots
 *    More isolation
 */
