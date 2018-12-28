import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'

export default [
    {
        input: 'src/components/Table.vue',
        output: {
            file: 'dist/vue-elastic-table.esm.js',
            format: 'esm',
        },
        plugins: [
            vue(),
            buble({
                objectAssign: 'Object.assign',
            }),
        ],
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/vue-elastic-table.js',
            format: 'iife',
        },
        plugins: [
            vue(),
            buble({
                objectAssign: 'Object.assign',
            }),
        ],
    },
]