/*
  Layer manifest. Each name loads data/layer-<name>.js in order; later layers
  add to or override earlier ones (matched by id).

  PUBLIC REPO: keep this as ['public'] and never commit any other layer file.
  INTERNAL BUILD: ['public', 'corporate'] and add data/layer-corporate.js.
*/
window.PORTFOLIO_LAYERS = ['public'];
