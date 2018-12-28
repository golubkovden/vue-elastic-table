import ElasticTable from './components/Table.vue'

export default {
    installed: false,
    install(Vue) {
        if (this.installed) return

        this.installed = true

        Vue.component('VueElasticTable', ElasticTable)
    },
}