function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
var get = function (object, path, fallback) {
    if (object === null || typeof object !== 'object') {
        return fallback
    }

    var result = object;

    var pieces = typeof path === 'string' ? path.split('.') : [];

    for (var i = 0; i < pieces.length; i++) {
        if (result.hasOwnProperty(pieces[i])) {
            result = result[pieces[i]];
        } else {
            return fallback
        }
    }

    return result
};

var combine = function (first, second) {
    if (first && second) {
        return (first + "." + second)
    }

    return first || second
};

var depthOf = function (columns) { return columns.reduce(function (level, column) {
    if (Array.isArray(column.children) && column.children.length > 0) {
        return Math.max(depthOf(column.children) + 1, level)
    }

    return level
}, 1); };

var leaves = function (items, prefix) { return items.reduce(function (result, ref) {
    var children = ref.children;
    var key = ref.key;
    var rest = objectWithoutProperties( ref, ["children", "key"] );
    var properties = rest;

    var resolved = combine(prefix, key);

    if (Array.isArray(children) && children.length > 0) {
        return result.concat(leaves(children, resolved))
    }

    result.push(Object.assign({}, {key: resolved},
        properties));

    return result
}, []); };

var decompose = function (items) {
    // find max depth of initial items
    var depth = depthOf(items);
    // initialize empty depth-leveled array
    var result = Array.from({length: depth}).map(function () { return []; });

    var handle = function (items, depth, level, prefix) {
        items.forEach(function (ref) {
            var children = ref.children;
            var key = ref.key;
            var rest = objectWithoutProperties( ref, ["children", "key"] );
            var properties = rest;

            var resolved = combine(prefix, key);

            var rowSpan = depth;
            var colSpan = 1;

            if (Array.isArray(children) && children.length > 0) {
                rowSpan = 1;
                colSpan = leaves(children).length;
                handle(children, depth - 1, level + 1, resolved);
            }

            result[level].push(Object.assign({}, {attributes: {rowSpan: rowSpan, colSpan: colSpan},
                key: resolved},
                properties));
        });

        return result
    };

    return handle(items, depth, 0)
};

var updateSorting = function (object, key, direction, multiple) {
    if ( multiple === void 0 ) multiple = false;

    if (direction === null) {
        return Object.keys(object).reduce(function (accumulator, current) {
            if (current !== key) {
                accumulator[current] = object[current];
            }

            return accumulator
        }, {})
    }

    var result = {};
    result[key] = direction;

    return multiple
        ? Object.assign({}, object, result)
        : result
};

var sortBy = function (ref) {
    var key = ref.key;
    var sortable = ref.sortable;

    return typeof sortable == 'string' ? sortable : key;
};

//

var script = {
    props: {
        columns: {
            type: Array,
            required: true,
        },
        data: {
            type: Array,
            default: function () { return []; },
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
    data: function () { return ({
        headers: [],
        leaves: [],
        sorted: {},
    }); },
    methods: {
        resolveRowClass: function resolveRowClass(item, index) {
            if (typeof this.rowClass === 'function') {
                return this.rowClass(item, index)
            }

            return this.rowClass
        },
        value: function value(value$1) {
            if (typeof value$1 === 'function') {
                return value$1()
            }

            return value$1
        },
        display: function display(item, column) {
            var value = get(item, column.key);

            if (column.hasOwnProperty('transform') && typeof column.transform === 'function') {
                return column.transform(value)
            }

            return value
        },
        isObject: function isObject(value) {
            return value !== null && typeof value === 'object'
        },
        onColumnClick: function onColumnClick(column) {
            if (column.sortable) {
                var field = sortBy(column);

                var direction = this.sorted.hasOwnProperty(field)
                    ? this.sorted[field] === 'desc' ? 'asc' : null
                    : 'desc';

                this.sorted = updateSorting(this.sorted, field, direction, this.multipleSort);

                this.$emit('sort:changed', this.sorted);
            }
        },
        columnClasses: function columnClasses(column) {
            return [
                {sortable: column.sortable},
                this.sorted[sortBy(column)] ]
        },
    },
    watch: {
        columns: {
            handler: function handler(columns) {
                this.headers = decompose(columns);
                this.leaves = leaves(columns);
            },
            immediate: true,
            deep: true,
        },
    },
};

/* script */
            var __vue_script__ = script;
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("table", [
    _c(
      "thead",
      _vm._l(_vm.headers, function(row) {
        return _c(
          "tr",
          [
            _vm._l(row, function(column) {
              return [
                _vm.isObject(column.title)
                  ? _c(
                      column.title,
                      _vm._b(
                        {
                          tag: "component",
                          class: _vm.columnClasses(column),
                          on: {
                            click: function($event) {
                              _vm.onColumnClick(column);
                            }
                          }
                        },
                        "component",
                        column.attributes,
                        false
                      )
                    )
                  : _c(
                      "th",
                      _vm._b(
                        {
                          class: _vm.columnClasses(column),
                          on: {
                            click: function($event) {
                              _vm.onColumnClick(column);
                            }
                          }
                        },
                        "th",
                        column.attributes,
                        false
                      ),
                      [
                        _vm._v(
                          "\n                " +
                            _vm._s(column.title || column.key) +
                            "\n            "
                        )
                      ]
                    )
              ]
            })
          ],
          2
        )
      }),
      0
    ),
    _vm._v(" "),
    _c(
      "tbody",
      [
        _vm.data.length > 0
          ? _vm._l(_vm.data, function(item, index) {
              return _c(
                "tr",
                { class: _vm.resolveRowClass(item, index) },
                [
                  _vm._l(_vm.leaves, function(leaf) {
                    return [
                      _vm.isObject(leaf.component)
                        ? _c(
                            leaf.component,
                            _vm._b(
                              {
                                tag: "component",
                                attrs: { data: _vm.display(item, leaf) }
                              },
                              "component",
                              _vm.value(leaf.props),
                              false
                            )
                          )
                        : _c("td", [_vm._v(_vm._s(_vm.display(item, leaf)))])
                    ]
                  })
                ],
                2
              )
            })
          : [
              _c("tr", [
                _c("td", { attrs: { colspan: _vm.leaves.length } }, [
                  _vm._v(_vm._s(_vm.emptyText))
                ])
              ])
            ]
      ],
      2
    )
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = "data-v-263b7919";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "/Users/denisgolubkov/Projects/own/elastic-table/src/components/Table.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var ElasticTable = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

var index = {
    installed: false,
    install: function install(Vue) {
        if (this.installed) { return }

        this.installed = true;

        Vue.component('VueElasticTable', ElasticTable);
    },
};

export default index;
