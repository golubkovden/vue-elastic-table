const get = (object, path, fallback) => {
    if (object === null || typeof object !== 'object') {
        return fallback
    }

    let result = object

    const pieces = typeof path === 'string' ? path.split('.') : []

    for (let i = 0; i < pieces.length; i++) {
        if (result.hasOwnProperty(pieces[i])) {
            result = result[pieces[i]]
        } else {
            return fallback
        }
    }

    return result
}

const combine = (first, second) => {
    if (first && second) {
        return `${first}.${second}`
    }

    return first || second
}

const depthOf = columns => columns.reduce((level, column) => {
    if (Array.isArray(column.children) && column.children.length > 0) {
        return Math.max(depthOf(column.children) + 1, level)
    }

    return level
}, 1)

const leaves = (items, prefix) => items.reduce((result, {children, key, ...properties}) => {
    const resolved = combine(prefix, key)

    if (Array.isArray(children) && children.length > 0) {
        return result.concat(leaves(children, resolved))
    }

    result.push({
        key: resolved,
        ...properties,
    })

    return result
}, [])

const decompose = items => {
    // find max depth of initial items
    const depth = depthOf(items)
    // initialize empty depth-leveled array
    const result = Array.from({length: depth}).map(() => [])

    const handle = (items, depth, level, prefix) => {
        items.forEach(({children, key, ...properties}) => {
            const resolved = combine(prefix, key)

            let rowSpan = depth
            let colSpan = 1

            if (Array.isArray(children) && children.length > 0) {
                rowSpan = 1
                colSpan = leaves(children).length
                handle(children, depth - 1, level + 1, resolved)
            }

            result[level].push({
                attributes: {rowSpan, colSpan},
                key: resolved,
                ...properties,
            })
        })

        return result
    }

    return handle(items, depth, 0)
}

const updateSorting = (object, key, direction, multiple = false) => {
    if (direction === null) {
        return Object.keys(object).reduce((accumulator, current) => {
            if (current !== key) {
                accumulator[current] = object[current]
            }

            return accumulator
        }, {})
    }

    const result = {[key]: direction}

    return multiple
        ? Object.assign({}, object, result)
        : result
}

export {
    get,
    leaves,
    decompose,
    updateSorting,
}