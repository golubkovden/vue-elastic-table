<template>
    <table>
        <thead>
        <tr v-for="row in headers">
            <template v-for="column in row">
                <component :is="column.title"
                           v-if="isObject(column.title)"
                           v-bind="column.attributes"
                           :class="columnClasses(column)"
                           @click="onColumnClick(column)"/>
                <th v-else v-bind="column.attributes"
                    :class="columnClasses(column)"
                    @click="onColumnClick(column)">
                    {{ column.title || column.key }}
                </th>
            </template>
        </tr>
        </thead>
        <tbody>
        <template v-if="data.length > 0">
            <tr v-for="(item, index) in data" :class="resolveRowClass(item, index)">
                <template v-for="leaf in leaves">
                    <component :is="leaf.component"
                               v-if="isObject(leaf.component)"
                               :data="display(item, leaf)"
                               v-bind="value(leaf.props)"/>
                    <td v-else>{{ display(item, leaf) }}</td>
                </template>
            </tr>
        </template>
        <template v-else>
            <tr>
                <td :colspan="leaves.length">{{ emptyText }}</td>
            </tr>
        </template>
        </tbody>
    </table>
</template>

<script>
    import {get, decompose, leaves, updateSorting, sortBy} from '../helpers'

    export default {
        props: {
            columns: {
                type: Array,
                required: true,
            },
            data: {
                type: Array,
                default: () => [],
            },
            rowClass: {
                type: [String, Function],
            },
            emptyText: {
                type: String,
                default: 'No data',
            },
            multipleSort: Boolean,
        },
        data: () => ({
            headers: [],
            leaves: [],
            sorted: {},
        }),
        methods: {
            resolveRowClass(item, index) {
                if (typeof this.rowClass === 'function') {
                    return this.rowClass(item, index)
                }

                return this.rowClass
            },
            value(value) {
                if (typeof value === 'function') {
                    return value()
                }

                return value
            },
            display(item, column) {
                const value = get(item, column.key)

                if (column.hasOwnProperty('transform') && typeof column.transform === 'function') {
                    return column.transform(value)
                }

                return value
            },
            isObject(value) {
                return value !== null && typeof value === 'object'
            },
            onColumnClick(column) {
                if (column.sortable) {
                    const field = sortBy(column)

                    const direction = this.sorted.hasOwnProperty(field)
                        ? this.sorted[field] === 'desc' ? 'asc' : null
                        : 'desc'

                    this.sorted = updateSorting(this.sorted, field, direction, this.multipleSort)

                    this.$emit('sort:changed', this.sorted)
                }
            },
            columnClasses(column) {
                return [
                    {sortable: column.sortable},
                    this.sorted[sortBy(column)],
                ]
            },
        },
        watch: {
            columns: {
                handler(columns) {
                    this.headers = decompose(columns)
                    this.leaves = leaves(columns)
                },
                immediate: true,
                deep: true,
            },
        },
    }
</script>
