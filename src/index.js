import Table from './components/Table.vue'

function install(Vue) {
    if (install.installed) return

    install.installed = true

    Vue.component('VueElasticTable', Table)
}

const plugin = {
    install,
}

let _Vue = null

if (typeof window !== 'undefined') {
    _Vue = window.Vue
} else if (typeof global !== 'undefined') {
    _Vue = global.Vue
}

if (_Vue) {
    _Vue.use(plugin)
}