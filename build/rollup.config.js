import path from 'path'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'

export default {
    input: 'src/index.js',
    output: {
        file: path.resolve(__dirname, '../dist/vue-elastic-table.esm.js'),
        name: 'VueElasticTable',
        format: 'es',
        interop: false,
    },
    plugins: [
        vue({
            css: false,
            compileTemplate: true,
        }),
        buble({
            objectAssign: 'Object.assign',
        }),
    ],
}