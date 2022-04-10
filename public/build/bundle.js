
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.6' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop$1;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop$1;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.46.6 */

    function create_fragment$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.46.6 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.46.6 */
    const file$4 = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$4(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$4, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\views\Home.svelte generated by Svelte v3.46.6 */

    const file$3 = "src\\views\\Home.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte, Firebase & Tailwind";
    			attr_dev(h1, "class", "text-4xl font-bold");
    			add_location(h1, file$3, 3, 6, 113);
    			attr_dev(div0, "class", "max-w-md");
    			add_location(div0, file$3, 2, 4, 83);
    			attr_dev(div1, "class", "hero-content text-center");
    			add_location(div1, file$3, 1, 2, 39);
    			attr_dev(div2, "class", "hero mt-5 bg-base-100");
    			add_location(div2, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const stringToByteArray$1 = function (str) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if ((c & 0xfc00) === 0xd800 &&
                i + 1 < str.length &&
                (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };
    /**
     * Turns an array of numbers into the string given by the concatenation of the
     * characters to which the numbers correspond.
     * @param bytes Array of numbers representing characters.
     * @return Stringification of the array.
     */
    const byteArrayToString = function (bytes) {
        // TODO(user): Use native implementations if/when available
        const out = [];
        let pos = 0, c = 0;
        while (pos < bytes.length) {
            const c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            }
            else if (c1 > 191 && c1 < 224) {
                const c2 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            }
            else if (c1 > 239 && c1 < 365) {
                // Surrogate Pair
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                const c4 = bytes[pos++];
                const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                    0x10000;
                out[c++] = String.fromCharCode(0xd800 + (u >> 10));
                out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
            }
            else {
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return out.join('');
    };
    // We define it as an object literal instead of a class because a class compiled down to es5 can't
    // be treeshaked. https://github.com/rollup/rollup/issues/1691
    // Static lookup maps, lazily populated by init_()
    const base64 = {
        /**
         * Maps bytes to characters.
         */
        byteToCharMap_: null,
        /**
         * Maps characters to bytes.
         */
        charToByteMap_: null,
        /**
         * Maps bytes to websafe characters.
         * @private
         */
        byteToCharMapWebSafe_: null,
        /**
         * Maps websafe characters to bytes.
         * @private
         */
        charToByteMapWebSafe_: null,
        /**
         * Our default alphabet, shared between
         * ENCODED_VALS and ENCODED_VALS_WEBSAFE
         */
        ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
        /**
         * Our default alphabet. Value 64 (=) is special; it means "nothing."
         */
        get ENCODED_VALS() {
            return this.ENCODED_VALS_BASE + '+/=';
        },
        /**
         * Our websafe alphabet.
         */
        get ENCODED_VALS_WEBSAFE() {
            return this.ENCODED_VALS_BASE + '-_.';
        },
        /**
         * Whether this browser supports the atob and btoa functions. This extension
         * started at Mozilla but is now implemented by many browsers. We use the
         * ASSUME_* variables to avoid pulling in the full useragent detection library
         * but still allowing the standard per-browser compilations.
         *
         */
        HAS_NATIVE_SUPPORT: typeof atob === 'function',
        /**
         * Base64-encode an array of bytes.
         *
         * @param input An array of bytes (numbers with
         *     value in [0, 255]) to encode.
         * @param webSafe Boolean indicating we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeByteArray(input, webSafe) {
            if (!Array.isArray(input)) {
                throw Error('encodeByteArray takes an array as a parameter');
            }
            this.init_();
            const byteToCharMap = webSafe
                ? this.byteToCharMapWebSafe_
                : this.byteToCharMap_;
            const output = [];
            for (let i = 0; i < input.length; i += 3) {
                const byte1 = input[i];
                const haveByte2 = i + 1 < input.length;
                const byte2 = haveByte2 ? input[i + 1] : 0;
                const haveByte3 = i + 2 < input.length;
                const byte3 = haveByte3 ? input[i + 2] : 0;
                const outByte1 = byte1 >> 2;
                const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
                let outByte4 = byte3 & 0x3f;
                if (!haveByte3) {
                    outByte4 = 64;
                    if (!haveByte2) {
                        outByte3 = 64;
                    }
                }
                output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join('');
        },
        /**
         * Base64-encode a string.
         *
         * @param input A string to encode.
         * @param webSafe If true, we should use the
         *     alternative alphabet.
         * @return The base64 encoded string.
         */
        encodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return btoa(input);
            }
            return this.encodeByteArray(stringToByteArray$1(input), webSafe);
        },
        /**
         * Base64-decode a string.
         *
         * @param input to decode.
         * @param webSafe True if we should use the
         *     alternative alphabet.
         * @return string representing the decoded value.
         */
        decodeString(input, webSafe) {
            // Shortcut for Mozilla browsers that implement
            // a native base64 encoder in the form of "btoa/atob"
            if (this.HAS_NATIVE_SUPPORT && !webSafe) {
                return atob(input);
            }
            return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
        },
        /**
         * Base64-decode a string.
         *
         * In base-64 decoding, groups of four characters are converted into three
         * bytes.  If the encoder did not apply padding, the input length may not
         * be a multiple of 4.
         *
         * In this case, the last group will have fewer than 4 characters, and
         * padding will be inferred.  If the group has one or two characters, it decodes
         * to one byte.  If the group has three characters, it decodes to two bytes.
         *
         * @param input Input to decode.
         * @param webSafe True if we should use the web-safe alphabet.
         * @return bytes representing the decoded value.
         */
        decodeStringToByteArray(input, webSafe) {
            this.init_();
            const charToByteMap = webSafe
                ? this.charToByteMapWebSafe_
                : this.charToByteMap_;
            const output = [];
            for (let i = 0; i < input.length;) {
                const byte1 = charToByteMap[input.charAt(i++)];
                const haveByte2 = i < input.length;
                const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
                ++i;
                const haveByte3 = i < input.length;
                const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                const haveByte4 = i < input.length;
                const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
                ++i;
                if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                    throw Error();
                }
                const outByte1 = (byte1 << 2) | (byte2 >> 4);
                output.push(outByte1);
                if (byte3 !== 64) {
                    const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                    output.push(outByte2);
                    if (byte4 !== 64) {
                        const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                        output.push(outByte3);
                    }
                }
            }
            return output;
        },
        /**
         * Lazy static initialization function. Called before
         * accessing any of the static map variables.
         * @private
         */
        init_() {
            if (!this.byteToCharMap_) {
                this.byteToCharMap_ = {};
                this.charToByteMap_ = {};
                this.byteToCharMapWebSafe_ = {};
                this.charToByteMapWebSafe_ = {};
                // We want quick mappings back and forth, so we precompute two maps.
                for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                    this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                    this.charToByteMap_[this.byteToCharMap_[i]] = i;
                    this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                    this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                    // Be forgiving when decoding and correctly decode both encodings.
                    if (i >= this.ENCODED_VALS_BASE.length) {
                        this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                        this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                    }
                }
            }
        }
    };
    /**
     * URL-safe base64 encoding
     */
    const base64Encode = function (str) {
        const utf8Bytes = stringToByteArray$1(str);
        return base64.encodeByteArray(utf8Bytes, true);
    };
    /**
     * URL-safe base64 encoding (without "." padding in the end).
     * e.g. Used in JSON Web Token (JWT) parts.
     */
    const base64urlEncodeWithoutPadding = function (str) {
        // Use base64url encoding and remove padding in the end (dot characters).
        return base64Encode(str).replace(/\./g, '');
    };
    /**
     * URL-safe base64 decoding
     *
     * NOTE: DO NOT use the global atob() function - it does NOT support the
     * base64Url variant encoding.
     *
     * @param str To be decoded
     * @return Decoded result, if possible
     */
    const base64Decode = function (str) {
        try {
            return base64.decodeString(str, true);
        }
        catch (e) {
            console.error('base64Decode failed: ', e);
        }
        return null;
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Deferred {
        constructor() {
            this.reject = () => { };
            this.resolve = () => { };
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
        /**
         * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
         * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
         * and returns a node-style callback which will resolve or reject the Deferred's promise.
         */
        wrapCallback(callback) {
            return (error, value) => {
                if (error) {
                    this.reject(error);
                }
                else {
                    this.resolve(value);
                }
                if (typeof callback === 'function') {
                    // Attaching noop handler just in case developer wasn't expecting
                    // promises
                    this.promise.catch(() => { });
                    // Some of our callbacks don't expect a value and our own tests
                    // assert that the parameter length is 1
                    if (callback.length === 1) {
                        callback(error);
                    }
                    else {
                        callback(error, value);
                    }
                }
            };
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns navigator.userAgent string or '' if it's not defined.
     * @return user agent string
     */
    function getUA() {
        if (typeof navigator !== 'undefined' &&
            typeof navigator['userAgent'] === 'string') {
            return navigator['userAgent'];
        }
        else {
            return '';
        }
    }
    /**
     * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
     *
     * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
     * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
     * wait for a callback.
     */
    function isMobileCordova() {
        return (typeof window !== 'undefined' &&
            // @ts-ignore Setting up an broadly applicable index signature for Window
            // just to deal with this case would probably be a bad idea.
            !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
            /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
    }
    function isBrowserExtension() {
        const runtime = typeof chrome === 'object'
            ? chrome.runtime
            : typeof browser === 'object'
                ? browser.runtime
                : undefined;
        return typeof runtime === 'object' && runtime.id !== undefined;
    }
    /**
     * Detect React Native.
     *
     * @return true if ReactNative environment is detected.
     */
    function isReactNative() {
        return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
    }
    /** Detects Electron apps. */
    function isElectron() {
        return getUA().indexOf('Electron/') >= 0;
    }
    /** Detects Internet Explorer. */
    function isIE() {
        const ua = getUA();
        return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
    }
    /** Detects Universal Windows Platform apps. */
    function isUWP() {
        return getUA().indexOf('MSAppHost/') >= 0;
    }
    /**
     * This method checks if indexedDB is supported by current browser/service worker context
     * @return true if indexedDB is supported by current browser/service worker context
     */
    function isIndexedDBAvailable() {
        return typeof indexedDB === 'object';
    }
    /**
     * This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
     * if errors occur during the database open operation.
     *
     * @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
     * private browsing)
     */
    function validateIndexedDBOpenable() {
        return new Promise((resolve, reject) => {
            try {
                let preExist = true;
                const DB_CHECK_NAME = 'validate-browser-context-for-indexeddb-analytics-module';
                const request = self.indexedDB.open(DB_CHECK_NAME);
                request.onsuccess = () => {
                    request.result.close();
                    // delete database only when it doesn't pre-exist
                    if (!preExist) {
                        self.indexedDB.deleteDatabase(DB_CHECK_NAME);
                    }
                    resolve(true);
                };
                request.onupgradeneeded = () => {
                    preExist = false;
                };
                request.onerror = () => {
                    var _a;
                    reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || '');
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @fileoverview Standardized Firebase Error.
     *
     * Usage:
     *
     *   // Typescript string literals for type-safe codes
     *   type Err =
     *     'unknown' |
     *     'object-not-found'
     *     ;
     *
     *   // Closure enum for type-safe error codes
     *   // at-enum {string}
     *   var Err = {
     *     UNKNOWN: 'unknown',
     *     OBJECT_NOT_FOUND: 'object-not-found',
     *   }
     *
     *   let errors: Map<Err, string> = {
     *     'generic-error': "Unknown error",
     *     'file-not-found': "Could not find file: {$file}",
     *   };
     *
     *   // Type-safe function - must pass a valid error code as param.
     *   let error = new ErrorFactory<Err>('service', 'Service', errors);
     *
     *   ...
     *   throw error.create(Err.GENERIC);
     *   ...
     *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
     *   ...
     *   // Service: Could not file file: foo.txt (service/file-not-found).
     *
     *   catch (e) {
     *     assert(e.message === "Could not find file: foo.txt.");
     *     if (e.code === 'service/file-not-found') {
     *       console.log("Could not read file: " + e['file']);
     *     }
     *   }
     */
    const ERROR_NAME = 'FirebaseError';
    // Based on code from:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
    class FirebaseError extends Error {
        constructor(
        /** The error code for this error. */
        code, message, 
        /** Custom data for this error. */
        customData) {
            super(message);
            this.code = code;
            this.customData = customData;
            /** The custom name for all FirebaseErrors. */
            this.name = ERROR_NAME;
            // Fix For ES5
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, FirebaseError.prototype);
            // Maintains proper stack trace for where our error was thrown.
            // Only available on V8.
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, ErrorFactory.prototype.create);
            }
        }
    }
    class ErrorFactory {
        constructor(service, serviceName, errors) {
            this.service = service;
            this.serviceName = serviceName;
            this.errors = errors;
        }
        create(code, ...data) {
            const customData = data[0] || {};
            const fullCode = `${this.service}/${code}`;
            const template = this.errors[code];
            const message = template ? replaceTemplate(template, customData) : 'Error';
            // Service Name: Error message (service/code).
            const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
            const error = new FirebaseError(fullCode, fullMessage, customData);
            return error;
        }
    }
    function replaceTemplate(template, data) {
        return template.replace(PATTERN, (_, key) => {
            const value = data[key];
            return value != null ? String(value) : `<${key}?>`;
        });
    }
    const PATTERN = /\{\$([^}]+)}/g;
    function isEmpty(obj) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Deep equal two objects. Support Arrays and Objects.
     */
    function deepEqual(a, b) {
        if (a === b) {
            return true;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        for (const k of aKeys) {
            if (!bKeys.includes(k)) {
                return false;
            }
            const aProp = a[k];
            const bProp = b[k];
            if (isObject(aProp) && isObject(bProp)) {
                if (!deepEqual(aProp, bProp)) {
                    return false;
                }
            }
            else if (aProp !== bProp) {
                return false;
            }
        }
        for (const k of bKeys) {
            if (!aKeys.includes(k)) {
                return false;
            }
        }
        return true;
    }
    function isObject(thing) {
        return thing !== null && typeof thing === 'object';
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
     * params object (e.g. {arg: 'val', arg2: 'val2'})
     * Note: You must prepend it with ? when adding it to a URL.
     */
    function querystring(querystringParams) {
        const params = [];
        for (const [key, value] of Object.entries(querystringParams)) {
            if (Array.isArray(value)) {
                value.forEach(arrayVal => {
                    params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
                });
            }
            else {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return params.length ? '&' + params.join('&') : '';
    }

    /**
     * Helper to make a Subscribe function (just like Promise helps make a
     * Thenable).
     *
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function createSubscribe(executor, onNoObservers) {
        const proxy = new ObserverProxy(executor, onNoObservers);
        return proxy.subscribe.bind(proxy);
    }
    /**
     * Implement fan-out for any number of Observers attached via a subscribe
     * function.
     */
    class ObserverProxy {
        /**
         * @param executor Function which can make calls to a single Observer
         *     as a proxy.
         * @param onNoObservers Callback when count of Observers goes to zero.
         */
        constructor(executor, onNoObservers) {
            this.observers = [];
            this.unsubscribes = [];
            this.observerCount = 0;
            // Micro-task scheduling by calling task.then().
            this.task = Promise.resolve();
            this.finalized = false;
            this.onNoObservers = onNoObservers;
            // Call the executor asynchronously so subscribers that are called
            // synchronously after the creation of the subscribe function
            // can still receive the very first value generated in the executor.
            this.task
                .then(() => {
                executor(this);
            })
                .catch(e => {
                this.error(e);
            });
        }
        next(value) {
            this.forEachObserver((observer) => {
                observer.next(value);
            });
        }
        error(error) {
            this.forEachObserver((observer) => {
                observer.error(error);
            });
            this.close(error);
        }
        complete() {
            this.forEachObserver((observer) => {
                observer.complete();
            });
            this.close();
        }
        /**
         * Subscribe function that can be used to add an Observer to the fan-out list.
         *
         * - We require that no event is sent to a subscriber sychronously to their
         *   call to subscribe().
         */
        subscribe(nextOrObserver, error, complete) {
            let observer;
            if (nextOrObserver === undefined &&
                error === undefined &&
                complete === undefined) {
                throw new Error('Missing Observer.');
            }
            // Assemble an Observer object when passed as callback functions.
            if (implementsAnyMethods(nextOrObserver, [
                'next',
                'error',
                'complete'
            ])) {
                observer = nextOrObserver;
            }
            else {
                observer = {
                    next: nextOrObserver,
                    error,
                    complete
                };
            }
            if (observer.next === undefined) {
                observer.next = noop;
            }
            if (observer.error === undefined) {
                observer.error = noop;
            }
            if (observer.complete === undefined) {
                observer.complete = noop;
            }
            const unsub = this.unsubscribeOne.bind(this, this.observers.length);
            // Attempt to subscribe to a terminated Observable - we
            // just respond to the Observer with the final error or complete
            // event.
            if (this.finalized) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.task.then(() => {
                    try {
                        if (this.finalError) {
                            observer.error(this.finalError);
                        }
                        else {
                            observer.complete();
                        }
                    }
                    catch (e) {
                        // nothing
                    }
                    return;
                });
            }
            this.observers.push(observer);
            return unsub;
        }
        // Unsubscribe is synchronous - we guarantee that no events are sent to
        // any unsubscribed Observer.
        unsubscribeOne(i) {
            if (this.observers === undefined || this.observers[i] === undefined) {
                return;
            }
            delete this.observers[i];
            this.observerCount -= 1;
            if (this.observerCount === 0 && this.onNoObservers !== undefined) {
                this.onNoObservers(this);
            }
        }
        forEachObserver(fn) {
            if (this.finalized) {
                // Already closed by previous event....just eat the additional values.
                return;
            }
            // Since sendOne calls asynchronously - there is no chance that
            // this.observers will become undefined.
            for (let i = 0; i < this.observers.length; i++) {
                this.sendOne(i, fn);
            }
        }
        // Call the Observer via one of it's callback function. We are careful to
        // confirm that the observe has not been unsubscribed since this asynchronous
        // function had been queued.
        sendOne(i, fn) {
            // Execute the callback asynchronously
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(() => {
                if (this.observers !== undefined && this.observers[i] !== undefined) {
                    try {
                        fn(this.observers[i]);
                    }
                    catch (e) {
                        // Ignore exceptions raised in Observers or missing methods of an
                        // Observer.
                        // Log error to console. b/31404806
                        if (typeof console !== 'undefined' && console.error) {
                            console.error(e);
                        }
                    }
                }
            });
        }
        close(err) {
            if (this.finalized) {
                return;
            }
            this.finalized = true;
            if (err !== undefined) {
                this.finalError = err;
            }
            // Proxy is no longer needed - garbage collect references
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(() => {
                this.observers = undefined;
                this.onNoObservers = undefined;
            });
        }
    }
    /**
     * Return true if the object passed in implements any of the named methods.
     */
    function implementsAnyMethods(obj, methods) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        for (const method of methods) {
            if (method in obj && typeof obj[method] === 'function') {
                return true;
            }
        }
        return false;
    }
    function noop() {
        // do nothing
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function getModularInstance(service) {
        if (service && service._delegate) {
            return service._delegate;
        }
        else {
            return service;
        }
    }

    /**
     * @license
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @internal
     */
    function promisifyRequest(request, errorMessage) {
        return new Promise((resolve, reject) => {
            request.onsuccess = event => {
                resolve(event.target.result);
            };
            request.onerror = event => {
                var _a;
                reject(`${errorMessage}: ${(_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message}`);
            };
        });
    }
    /**
     * @internal
     */
    class DBWrapper {
        constructor(_db) {
            this._db = _db;
            this.objectStoreNames = this._db.objectStoreNames;
        }
        transaction(storeNames, mode) {
            return new TransactionWrapper(this._db.transaction.call(this._db, storeNames, mode));
        }
        createObjectStore(storeName, options) {
            return new ObjectStoreWrapper(this._db.createObjectStore(storeName, options));
        }
        close() {
            this._db.close();
        }
    }
    /**
     * @internal
     */
    class TransactionWrapper {
        constructor(_transaction) {
            this._transaction = _transaction;
            this.complete = new Promise((resolve, reject) => {
                this._transaction.oncomplete = function () {
                    resolve();
                };
                this._transaction.onerror = () => {
                    reject(this._transaction.error);
                };
                this._transaction.onabort = () => {
                    reject(this._transaction.error);
                };
            });
        }
        objectStore(storeName) {
            return new ObjectStoreWrapper(this._transaction.objectStore(storeName));
        }
    }
    /**
     * @internal
     */
    class ObjectStoreWrapper {
        constructor(_store) {
            this._store = _store;
        }
        index(name) {
            return new IndexWrapper(this._store.index(name));
        }
        createIndex(name, keypath, options) {
            return new IndexWrapper(this._store.createIndex(name, keypath, options));
        }
        get(key) {
            const request = this._store.get(key);
            return promisifyRequest(request, 'Error reading from IndexedDB');
        }
        put(value, key) {
            const request = this._store.put(value, key);
            return promisifyRequest(request, 'Error writing to IndexedDB');
        }
        delete(key) {
            const request = this._store.delete(key);
            return promisifyRequest(request, 'Error deleting from IndexedDB');
        }
        clear() {
            const request = this._store.clear();
            return promisifyRequest(request, 'Error clearing IndexedDB object store');
        }
    }
    /**
     * @internal
     */
    class IndexWrapper {
        constructor(_index) {
            this._index = _index;
        }
        get(key) {
            const request = this._index.get(key);
            return promisifyRequest(request, 'Error reading from IndexedDB');
        }
    }
    /**
     * @internal
     */
    function openDB(dbName, dbVersion, upgradeCallback) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(dbName, dbVersion);
                request.onsuccess = event => {
                    resolve(new DBWrapper(event.target.result));
                };
                request.onerror = event => {
                    var _a;
                    reject(`Error opening indexedDB: ${(_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message}`);
                };
                request.onupgradeneeded = event => {
                    upgradeCallback(new DBWrapper(request.result), event.oldVersion, event.newVersion, new TransactionWrapper(request.transaction));
                };
            }
            catch (e) {
                reject(`Error opening indexedDB: ${e.message}`);
            }
        });
    }

    /**
     * Component for service name T, e.g. `auth`, `auth-internal`
     */
    class Component {
        /**
         *
         * @param name The public service name, e.g. app, auth, firestore, database
         * @param instanceFactory Service factory responsible for creating the public interface
         * @param type whether the service provided by the component is public or private
         */
        constructor(name, instanceFactory, type) {
            this.name = name;
            this.instanceFactory = instanceFactory;
            this.type = type;
            this.multipleInstances = false;
            /**
             * Properties to be added to the service namespace
             */
            this.serviceProps = {};
            this.instantiationMode = "LAZY" /* LAZY */;
            this.onInstanceCreated = null;
        }
        setInstantiationMode(mode) {
            this.instantiationMode = mode;
            return this;
        }
        setMultipleInstances(multipleInstances) {
            this.multipleInstances = multipleInstances;
            return this;
        }
        setServiceProps(props) {
            this.serviceProps = props;
            return this;
        }
        setInstanceCreatedCallback(callback) {
            this.onInstanceCreated = callback;
            return this;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
     * NameServiceMapping[T] is an alias for the type of the instance
     */
    class Provider {
        constructor(name, container) {
            this.name = name;
            this.container = container;
            this.component = null;
            this.instances = new Map();
            this.instancesDeferred = new Map();
            this.instancesOptions = new Map();
            this.onInitCallbacks = new Map();
        }
        /**
         * @param identifier A provider can provide mulitple instances of a service
         * if this.component.multipleInstances is true.
         */
        get(identifier) {
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            if (!this.instancesDeferred.has(normalizedIdentifier)) {
                const deferred = new Deferred();
                this.instancesDeferred.set(normalizedIdentifier, deferred);
                if (this.isInitialized(normalizedIdentifier) ||
                    this.shouldAutoInitialize()) {
                    // initialize the service if it can be auto-initialized
                    try {
                        const instance = this.getOrInitializeService({
                            instanceIdentifier: normalizedIdentifier
                        });
                        if (instance) {
                            deferred.resolve(instance);
                        }
                    }
                    catch (e) {
                        // when the instance factory throws an exception during get(), it should not cause
                        // a fatal error. We just return the unresolved promise in this case.
                    }
                }
            }
            return this.instancesDeferred.get(normalizedIdentifier).promise;
        }
        getImmediate(options) {
            var _a;
            // if multipleInstances is not supported, use the default name
            const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
            const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
            if (this.isInitialized(normalizedIdentifier) ||
                this.shouldAutoInitialize()) {
                try {
                    return this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                }
                catch (e) {
                    if (optional) {
                        return null;
                    }
                    else {
                        throw e;
                    }
                }
            }
            else {
                // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
                if (optional) {
                    return null;
                }
                else {
                    throw Error(`Service ${this.name} is not available`);
                }
            }
        }
        getComponent() {
            return this.component;
        }
        setComponent(component) {
            if (component.name !== this.name) {
                throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
            }
            if (this.component) {
                throw Error(`Component for ${this.name} has already been provided`);
            }
            this.component = component;
            // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
            if (!this.shouldAutoInitialize()) {
                return;
            }
            // if the service is eager, initialize the default instance
            if (isComponentEager(component)) {
                try {
                    this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
                }
                catch (e) {
                    // when the instance factory for an eager Component throws an exception during the eager
                    // initialization, it should not cause a fatal error.
                    // TODO: Investigate if we need to make it configurable, because some component may want to cause
                    // a fatal error in this case?
                }
            }
            // Create service instances for the pending promises and resolve them
            // NOTE: if this.multipleInstances is false, only the default instance will be created
            // and all promises with resolve with it regardless of the identifier.
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                try {
                    // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                    const instance = this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                    instanceDeferred.resolve(instance);
                }
                catch (e) {
                    // when the instance factory throws an exception, it should not cause
                    // a fatal error. We just leave the promise unresolved.
                }
            }
        }
        clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
            this.instancesDeferred.delete(identifier);
            this.instancesOptions.delete(identifier);
            this.instances.delete(identifier);
        }
        // app.delete() will call this method on every provider to delete the services
        // TODO: should we mark the provider as deleted?
        async delete() {
            const services = Array.from(this.instances.values());
            await Promise.all([
                ...services
                    .filter(service => 'INTERNAL' in service) // legacy services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service.INTERNAL.delete()),
                ...services
                    .filter(service => '_delete' in service) // modularized services
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map(service => service._delete())
            ]);
        }
        isComponentSet() {
            return this.component != null;
        }
        isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instances.has(identifier);
        }
        getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
            return this.instancesOptions.get(identifier) || {};
        }
        initialize(opts = {}) {
            const { options = {} } = opts;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
            if (this.isInitialized(normalizedIdentifier)) {
                throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
            }
            if (!this.isComponentSet()) {
                throw Error(`Component ${this.name} has not been registered yet`);
            }
            const instance = this.getOrInitializeService({
                instanceIdentifier: normalizedIdentifier,
                options
            });
            // resolve any pending promise waiting for the service instance
            for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
                const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                if (normalizedIdentifier === normalizedDeferredIdentifier) {
                    instanceDeferred.resolve(instance);
                }
            }
            return instance;
        }
        /**
         *
         * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
         * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
         *
         * @param identifier An optional instance identifier
         * @returns a function to unregister the callback
         */
        onInit(callback, identifier) {
            var _a;
            const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
            const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
            existingCallbacks.add(callback);
            this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
            const existingInstance = this.instances.get(normalizedIdentifier);
            if (existingInstance) {
                callback(existingInstance, normalizedIdentifier);
            }
            return () => {
                existingCallbacks.delete(callback);
            };
        }
        /**
         * Invoke onInit callbacks synchronously
         * @param instance the service instance`
         */
        invokeOnInitCallbacks(instance, identifier) {
            const callbacks = this.onInitCallbacks.get(identifier);
            if (!callbacks) {
                return;
            }
            for (const callback of callbacks) {
                try {
                    callback(instance, identifier);
                }
                catch (_a) {
                    // ignore errors in the onInit callback
                }
            }
        }
        getOrInitializeService({ instanceIdentifier, options = {} }) {
            let instance = this.instances.get(instanceIdentifier);
            if (!instance && this.component) {
                instance = this.component.instanceFactory(this.container, {
                    instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                    options
                });
                this.instances.set(instanceIdentifier, instance);
                this.instancesOptions.set(instanceIdentifier, options);
                /**
                 * Invoke onInit listeners.
                 * Note this.component.onInstanceCreated is different, which is used by the component creator,
                 * while onInit listeners are registered by consumers of the provider.
                 */
                this.invokeOnInitCallbacks(instance, instanceIdentifier);
                /**
                 * Order is important
                 * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
                 * makes `isInitialized()` return true.
                 */
                if (this.component.onInstanceCreated) {
                    try {
                        this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                    }
                    catch (_a) {
                        // ignore errors in the onInstanceCreatedCallback
                    }
                }
            }
            return instance || null;
        }
        normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
            if (this.component) {
                return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
            }
            else {
                return identifier; // assume multiple instances are supported before the component is provided.
            }
        }
        shouldAutoInitialize() {
            return (!!this.component &&
                this.component.instantiationMode !== "EXPLICIT" /* EXPLICIT */);
        }
    }
    // undefined should be passed to the service factory for the default instance
    function normalizeIdentifierForFactory(identifier) {
        return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
    }
    function isComponentEager(component) {
        return component.instantiationMode === "EAGER" /* EAGER */;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
     */
    class ComponentContainer {
        constructor(name) {
            this.name = name;
            this.providers = new Map();
        }
        /**
         *
         * @param component Component being added
         * @param overwrite When a component with the same name has already been registered,
         * if overwrite is true: overwrite the existing component with the new component and create a new
         * provider with the new component. It can be useful in tests where you want to use different mocks
         * for different tests.
         * if overwrite is false: throw an exception
         */
        addComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
            }
            provider.setComponent(component);
        }
        addOrOverwriteComponent(component) {
            const provider = this.getProvider(component.name);
            if (provider.isComponentSet()) {
                // delete the existing provider from the container, so we can register the new component
                this.providers.delete(component.name);
            }
            this.addComponent(component);
        }
        /**
         * getProvider provides a type safe interface where it can only be called with a field name
         * present in NameServiceMapping interface.
         *
         * Firebase SDKs providing services should extend NameServiceMapping interface to register
         * themselves.
         */
        getProvider(name) {
            if (this.providers.has(name)) {
                return this.providers.get(name);
            }
            // create a Provider for a service that hasn't registered with Firebase
            const provider = new Provider(name, this);
            this.providers.set(name, provider);
            return provider;
        }
        getProviders() {
            return Array.from(this.providers.values());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The JS SDK supports 5 log levels and also allows a user the ability to
     * silence the logs altogether.
     *
     * The order is a follows:
     * DEBUG < VERBOSE < INFO < WARN < ERROR
     *
     * All of the log types above the current log level will be captured (i.e. if
     * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
     * `VERBOSE` logs will not)
     */
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
    })(LogLevel || (LogLevel = {}));
    const levelStringToEnum = {
        'debug': LogLevel.DEBUG,
        'verbose': LogLevel.VERBOSE,
        'info': LogLevel.INFO,
        'warn': LogLevel.WARN,
        'error': LogLevel.ERROR,
        'silent': LogLevel.SILENT
    };
    /**
     * The default log level
     */
    const defaultLogLevel = LogLevel.INFO;
    /**
     * By default, `console.debug` is not displayed in the developer console (in
     * chrome). To avoid forcing users to have to opt-in to these logs twice
     * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
     * logs to the `console.log` function.
     */
    const ConsoleMethod = {
        [LogLevel.DEBUG]: 'log',
        [LogLevel.VERBOSE]: 'log',
        [LogLevel.INFO]: 'info',
        [LogLevel.WARN]: 'warn',
        [LogLevel.ERROR]: 'error'
    };
    /**
     * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
     * messages on to their corresponding console counterparts (if the log method
     * is supported by the current log level)
     */
    const defaultLogHandler = (instance, logType, ...args) => {
        if (logType < instance.logLevel) {
            return;
        }
        const now = new Date().toISOString();
        const method = ConsoleMethod[logType];
        if (method) {
            console[method](`[${now}]  ${instance.name}:`, ...args);
        }
        else {
            throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
        }
    };
    class Logger {
        /**
         * Gives you an instance of a Logger to capture messages according to
         * Firebase's logging scheme.
         *
         * @param name The name that the logs will be associated with
         */
        constructor(name) {
            this.name = name;
            /**
             * The log level of the given Logger instance.
             */
            this._logLevel = defaultLogLevel;
            /**
             * The main (internal) log handler for the Logger instance.
             * Can be set to a new function in internal package code but not by user.
             */
            this._logHandler = defaultLogHandler;
            /**
             * The optional, additional, user-defined log handler for the Logger instance.
             */
            this._userLogHandler = null;
        }
        get logLevel() {
            return this._logLevel;
        }
        set logLevel(val) {
            if (!(val in LogLevel)) {
                throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
            }
            this._logLevel = val;
        }
        // Workaround for setter/getter having to be the same type.
        setLogLevel(val) {
            this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
        }
        get logHandler() {
            return this._logHandler;
        }
        set logHandler(val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        }
        get userLogHandler() {
            return this._userLogHandler;
        }
        set userLogHandler(val) {
            this._userLogHandler = val;
        }
        /**
         * The functions below are all based on the `console` interface
         */
        debug(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
            this._logHandler(this, LogLevel.DEBUG, ...args);
        }
        log(...args) {
            this._userLogHandler &&
                this._userLogHandler(this, LogLevel.VERBOSE, ...args);
            this._logHandler(this, LogLevel.VERBOSE, ...args);
        }
        info(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
            this._logHandler(this, LogLevel.INFO, ...args);
        }
        warn(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
            this._logHandler(this, LogLevel.WARN, ...args);
        }
        error(...args) {
            this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
            this._logHandler(this, LogLevel.ERROR, ...args);
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PlatformLoggerServiceImpl {
        constructor(container) {
            this.container = container;
        }
        // In initial implementation, this will be called by installations on
        // auth token refresh, and installations will send this string.
        getPlatformInfoString() {
            const providers = this.container.getProviders();
            // Loop through providers and get library/version pairs from any that are
            // version components.
            return providers
                .map(provider => {
                if (isVersionServiceProvider(provider)) {
                    const service = provider.getImmediate();
                    return `${service.library}/${service.version}`;
                }
                else {
                    return null;
                }
            })
                .filter(logString => logString)
                .join(' ');
        }
    }
    /**
     *
     * @param provider check if this provider provides a VersionService
     *
     * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
     * provides VersionService. The provider is not necessarily a 'app-version'
     * provider.
     */
    function isVersionServiceProvider(provider) {
        const component = provider.getComponent();
        return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* VERSION */;
    }

    const name$o = "@firebase/app";
    const version$1$1 = "0.7.20";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const logger = new Logger('@firebase/app');

    const name$n = "@firebase/app-compat";

    const name$m = "@firebase/analytics-compat";

    const name$l = "@firebase/analytics";

    const name$k = "@firebase/app-check-compat";

    const name$j = "@firebase/app-check";

    const name$i = "@firebase/auth";

    const name$h = "@firebase/auth-compat";

    const name$g = "@firebase/database";

    const name$f = "@firebase/database-compat";

    const name$e = "@firebase/functions";

    const name$d = "@firebase/functions-compat";

    const name$c = "@firebase/installations";

    const name$b = "@firebase/installations-compat";

    const name$a = "@firebase/messaging";

    const name$9 = "@firebase/messaging-compat";

    const name$8 = "@firebase/performance";

    const name$7 = "@firebase/performance-compat";

    const name$6 = "@firebase/remote-config";

    const name$5 = "@firebase/remote-config-compat";

    const name$4 = "@firebase/storage";

    const name$3 = "@firebase/storage-compat";

    const name$2 = "@firebase/firestore";

    const name$1$1 = "@firebase/firestore-compat";

    const name$p = "firebase";
    const version$2 = "9.6.10";

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The default app name
     *
     * @internal
     */
    const DEFAULT_ENTRY_NAME = '[DEFAULT]';
    const PLATFORM_LOG_STRING = {
        [name$o]: 'fire-core',
        [name$n]: 'fire-core-compat',
        [name$l]: 'fire-analytics',
        [name$m]: 'fire-analytics-compat',
        [name$j]: 'fire-app-check',
        [name$k]: 'fire-app-check-compat',
        [name$i]: 'fire-auth',
        [name$h]: 'fire-auth-compat',
        [name$g]: 'fire-rtdb',
        [name$f]: 'fire-rtdb-compat',
        [name$e]: 'fire-fn',
        [name$d]: 'fire-fn-compat',
        [name$c]: 'fire-iid',
        [name$b]: 'fire-iid-compat',
        [name$a]: 'fire-fcm',
        [name$9]: 'fire-fcm-compat',
        [name$8]: 'fire-perf',
        [name$7]: 'fire-perf-compat',
        [name$6]: 'fire-rc',
        [name$5]: 'fire-rc-compat',
        [name$4]: 'fire-gcs',
        [name$3]: 'fire-gcs-compat',
        [name$2]: 'fire-fst',
        [name$1$1]: 'fire-fst-compat',
        'fire-js': 'fire-js',
        [name$p]: 'fire-js-all'
    };

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @internal
     */
    const _apps = new Map();
    /**
     * Registered components.
     *
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _components = new Map();
    /**
     * @param component - the component being added to this app's container
     *
     * @internal
     */
    function _addComponent(app, component) {
        try {
            app.container.addComponent(component);
        }
        catch (e) {
            logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
        }
    }
    /**
     *
     * @param component - the component to register
     * @returns whether or not the component is registered successfully
     *
     * @internal
     */
    function _registerComponent(component) {
        const componentName = component.name;
        if (_components.has(componentName)) {
            logger.debug(`There were multiple attempts to register component ${componentName}.`);
            return false;
        }
        _components.set(componentName, component);
        // add the component to existing app instances
        for (const app of _apps.values()) {
            _addComponent(app, component);
        }
        return true;
    }
    /**
     *
     * @param app - FirebaseApp instance
     * @param name - service name
     *
     * @returns the provider for the service with the matching name
     *
     * @internal
     */
    function _getProvider(app, name) {
        const heartbeatController = app.container
            .getProvider('heartbeat')
            .getImmediate({ optional: true });
        if (heartbeatController) {
            void heartbeatController.triggerHeartbeat();
        }
        return app.container.getProvider(name);
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ERRORS = {
        ["no-app" /* NO_APP */]: "No Firebase App '{$appName}' has been created - " +
            'call Firebase App.initializeApp()',
        ["bad-app-name" /* BAD_APP_NAME */]: "Illegal App name: '{$appName}",
        ["duplicate-app" /* DUPLICATE_APP */]: "Firebase App named '{$appName}' already exists with different options or config",
        ["app-deleted" /* APP_DELETED */]: "Firebase App named '{$appName}' already deleted",
        ["invalid-app-argument" /* INVALID_APP_ARGUMENT */]: 'firebase.{$appName}() takes either no argument or a ' +
            'Firebase App instance.',
        ["invalid-log-argument" /* INVALID_LOG_ARGUMENT */]: 'First argument to `onLog` must be null or a function.',
        ["storage-open" /* STORAGE_OPEN */]: 'Error thrown when opening storage. Original error: {$originalErrorMessage}.',
        ["storage-get" /* STORAGE_GET */]: 'Error thrown when reading from storage. Original error: {$originalErrorMessage}.',
        ["storage-set" /* STORAGE_WRITE */]: 'Error thrown when writing to storage. Original error: {$originalErrorMessage}.',
        ["storage-delete" /* STORAGE_DELETE */]: 'Error thrown when deleting from storage. Original error: {$originalErrorMessage}.'
    };
    const ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class FirebaseAppImpl {
        constructor(options, config, container) {
            this._isDeleted = false;
            this._options = Object.assign({}, options);
            this._config = Object.assign({}, config);
            this._name = config.name;
            this._automaticDataCollectionEnabled =
                config.automaticDataCollectionEnabled;
            this._container = container;
            this.container.addComponent(new Component('app', () => this, "PUBLIC" /* PUBLIC */));
        }
        get automaticDataCollectionEnabled() {
            this.checkDestroyed();
            return this._automaticDataCollectionEnabled;
        }
        set automaticDataCollectionEnabled(val) {
            this.checkDestroyed();
            this._automaticDataCollectionEnabled = val;
        }
        get name() {
            this.checkDestroyed();
            return this._name;
        }
        get options() {
            this.checkDestroyed();
            return this._options;
        }
        get config() {
            this.checkDestroyed();
            return this._config;
        }
        get container() {
            return this._container;
        }
        get isDeleted() {
            return this._isDeleted;
        }
        set isDeleted(val) {
            this._isDeleted = val;
        }
        /**
         * This function will throw an Error if the App has already been deleted -
         * use before performing API actions on the App.
         */
        checkDestroyed() {
            if (this.isDeleted) {
                throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this._name });
            }
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The current SDK version.
     *
     * @public
     */
    const SDK_VERSION = version$2;
    function initializeApp(options, rawConfig = {}) {
        if (typeof rawConfig !== 'object') {
            const name = rawConfig;
            rawConfig = { name };
        }
        const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
        const name = config.name;
        if (typeof name !== 'string' || !name) {
            throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                appName: String(name)
            });
        }
        const existingApp = _apps.get(name);
        if (existingApp) {
            // return the existing app if options and config deep equal the ones in the existing app.
            if (deepEqual(options, existingApp.options) &&
                deepEqual(config, existingApp.config)) {
                return existingApp;
            }
            else {
                throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
            }
        }
        const container = new ComponentContainer(name);
        for (const component of _components.values()) {
            container.addComponent(component);
        }
        const newApp = new FirebaseAppImpl(options, config, container);
        _apps.set(name, newApp);
        return newApp;
    }
    /**
     * Retrieves a {@link @firebase/app#FirebaseApp} instance.
     *
     * When called with no arguments, the default app is returned. When an app name
     * is provided, the app corresponding to that name is returned.
     *
     * An exception is thrown if the app being retrieved has not yet been
     * initialized.
     *
     * @example
     * ```javascript
     * // Return the default app
     * const app = getApp();
     * ```
     *
     * @example
     * ```javascript
     * // Return a named app
     * const otherApp = getApp("otherApp");
     * ```
     *
     * @param name - Optional name of the app to return. If no name is
     *   provided, the default is `"[DEFAULT]"`.
     *
     * @returns The app corresponding to the provided app name.
     *   If no app name is provided, the default app is returned.
     *
     * @public
     */
    function getApp(name = DEFAULT_ENTRY_NAME) {
        const app = _apps.get(name);
        if (!app) {
            throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
        }
        return app;
    }
    /**
     * Registers a library's name and version for platform logging purposes.
     * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
     * @param version - Current version of that library.
     * @param variant - Bundle variant, e.g., node, rn, etc.
     *
     * @public
     */
    function registerVersion(libraryKeyOrName, version, variant) {
        var _a;
        // TODO: We can use this check to whitelist strings when/if we set up
        // a good whitelist system.
        let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
        if (variant) {
            library += `-${variant}`;
        }
        const libraryMismatch = library.match(/\s|\//);
        const versionMismatch = version.match(/\s|\//);
        if (libraryMismatch || versionMismatch) {
            const warning = [
                `Unable to register library "${library}" with version "${version}":`
            ];
            if (libraryMismatch) {
                warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
            }
            if (libraryMismatch && versionMismatch) {
                warning.push('and');
            }
            if (versionMismatch) {
                warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
            }
            logger.warn(warning.join(' '));
            return;
        }
        _registerComponent(new Component(`${library}-version`, () => ({ library, version }), "VERSION" /* VERSION */));
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DB_NAME$1 = 'firebase-heartbeat-database';
    const DB_VERSION$1 = 1;
    const STORE_NAME = 'firebase-heartbeat-store';
    let dbPromise = null;
    function getDbPromise() {
        if (!dbPromise) {
            dbPromise = openDB(DB_NAME$1, DB_VERSION$1, (db, oldVersion) => {
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch (oldVersion) {
                    case 0:
                        db.createObjectStore(STORE_NAME);
                }
            }).catch(e => {
                throw ERROR_FACTORY.create("storage-open" /* STORAGE_OPEN */, {
                    originalErrorMessage: e.message
                });
            });
        }
        return dbPromise;
    }
    async function readHeartbeatsFromIndexedDB(app) {
        try {
            const db = await getDbPromise();
            return db
                .transaction(STORE_NAME)
                .objectStore(STORE_NAME)
                .get(computeKey(app));
        }
        catch (e) {
            throw ERROR_FACTORY.create("storage-get" /* STORAGE_GET */, {
                originalErrorMessage: e.message
            });
        }
    }
    async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
        try {
            const db = await getDbPromise();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const objectStore = tx.objectStore(STORE_NAME);
            await objectStore.put(heartbeatObject, computeKey(app));
            return tx.complete;
        }
        catch (e) {
            throw ERROR_FACTORY.create("storage-set" /* STORAGE_WRITE */, {
                originalErrorMessage: e.message
            });
        }
    }
    function computeKey(app) {
        return `${app.name}!${app.options.appId}`;
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MAX_HEADER_BYTES = 1024;
    // 30 days
    const STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1000;
    class HeartbeatServiceImpl {
        constructor(container) {
            this.container = container;
            /**
             * In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
             * the header string.
             * Stores one record per date. This will be consolidated into the standard
             * format of one record per user agent string before being sent as a header.
             * Populated from indexedDB when the controller is instantiated and should
             * be kept in sync with indexedDB.
             * Leave public for easier testing.
             */
            this._heartbeatsCache = null;
            const app = this.container.getProvider('app').getImmediate();
            this._storage = new HeartbeatStorageImpl(app);
            this._heartbeatsCachePromise = this._storage.read().then(result => {
                this._heartbeatsCache = result;
                return result;
            });
        }
        /**
         * Called to report a heartbeat. The function will generate
         * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
         * to IndexedDB.
         * Note that we only store one heartbeat per day. So if a heartbeat for today is
         * already logged, subsequent calls to this function in the same day will be ignored.
         */
        async triggerHeartbeat() {
            const platformLogger = this.container
                .getProvider('platform-logger')
                .getImmediate();
            // This is the "Firebase user agent" string from the platform logger
            // service, not the browser user agent.
            const agent = platformLogger.getPlatformInfoString();
            const date = getUTCDateString();
            if (this._heartbeatsCache === null) {
                this._heartbeatsCache = await this._heartbeatsCachePromise;
            }
            // Do not store a heartbeat if one is already stored for this day
            // or if a header has already been sent today.
            if (this._heartbeatsCache.lastSentHeartbeatDate === date ||
                this._heartbeatsCache.heartbeats.some(singleDateHeartbeat => singleDateHeartbeat.date === date)) {
                return;
            }
            else {
                // There is no entry for this date. Create one.
                this._heartbeatsCache.heartbeats.push({ date, agent });
            }
            // Remove entries older than 30 days.
            this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter(singleDateHeartbeat => {
                const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
                const now = Date.now();
                return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
            });
            return this._storage.overwrite(this._heartbeatsCache);
        }
        /**
         * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
         * It also clears all heartbeats from memory as well as in IndexedDB.
         *
         * NOTE: Consuming product SDKs should not send the header if this method
         * returns an empty string.
         */
        async getHeartbeatsHeader() {
            if (this._heartbeatsCache === null) {
                await this._heartbeatsCachePromise;
            }
            // If it's still null or the array is empty, there is no data to send.
            if (this._heartbeatsCache === null ||
                this._heartbeatsCache.heartbeats.length === 0) {
                return '';
            }
            const date = getUTCDateString();
            // Extract as many heartbeats from the cache as will fit under the size limit.
            const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
            const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
            // Store last sent date to prevent another being logged/sent for the same day.
            this._heartbeatsCache.lastSentHeartbeatDate = date;
            if (unsentEntries.length > 0) {
                // Store any unsent entries if they exist.
                this._heartbeatsCache.heartbeats = unsentEntries;
                // This seems more likely than emptying the array (below) to lead to some odd state
                // since the cache isn't empty and this will be called again on the next request,
                // and is probably safest if we await it.
                await this._storage.overwrite(this._heartbeatsCache);
            }
            else {
                this._heartbeatsCache.heartbeats = [];
                // Do not wait for this, to reduce latency.
                void this._storage.overwrite(this._heartbeatsCache);
            }
            return headerString;
        }
    }
    function getUTCDateString() {
        const today = new Date();
        // Returns date format 'YYYY-MM-DD'
        return today.toISOString().substring(0, 10);
    }
    function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
        // Heartbeats grouped by user agent in the standard format to be sent in
        // the header.
        const heartbeatsToSend = [];
        // Single date format heartbeats that are not sent.
        let unsentEntries = heartbeatsCache.slice();
        for (const singleDateHeartbeat of heartbeatsCache) {
            // Look for an existing entry with the same user agent.
            const heartbeatEntry = heartbeatsToSend.find(hb => hb.agent === singleDateHeartbeat.agent);
            if (!heartbeatEntry) {
                // If no entry for this user agent exists, create one.
                heartbeatsToSend.push({
                    agent: singleDateHeartbeat.agent,
                    dates: [singleDateHeartbeat.date]
                });
                if (countBytes(heartbeatsToSend) > maxSize) {
                    // If the header would exceed max size, remove the added heartbeat
                    // entry and stop adding to the header.
                    heartbeatsToSend.pop();
                    break;
                }
            }
            else {
                heartbeatEntry.dates.push(singleDateHeartbeat.date);
                // If the header would exceed max size, remove the added date
                // and stop adding to the header.
                if (countBytes(heartbeatsToSend) > maxSize) {
                    heartbeatEntry.dates.pop();
                    break;
                }
            }
            // Pop unsent entry from queue. (Skipped if adding the entry exceeded
            // quota and the loop breaks early.)
            unsentEntries = unsentEntries.slice(1);
        }
        return {
            heartbeatsToSend,
            unsentEntries
        };
    }
    class HeartbeatStorageImpl {
        constructor(app) {
            this.app = app;
            this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
        }
        async runIndexedDBEnvironmentCheck() {
            if (!isIndexedDBAvailable()) {
                return false;
            }
            else {
                return validateIndexedDBOpenable()
                    .then(() => true)
                    .catch(() => false);
            }
        }
        /**
         * Read all heartbeats.
         */
        async read() {
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return { heartbeats: [] };
            }
            else {
                const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
                return idbHeartbeatObject || { heartbeats: [] };
            }
        }
        // overwrite the storage with the provided heartbeats
        async overwrite(heartbeatsObject) {
            var _a;
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                const existingHeartbeatsObject = await this.read();
                return writeHeartbeatsToIndexedDB(this.app, {
                    lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                    heartbeats: heartbeatsObject.heartbeats
                });
            }
        }
        // add heartbeats
        async add(heartbeatsObject) {
            var _a;
            const canUseIndexedDB = await this._canUseIndexedDBPromise;
            if (!canUseIndexedDB) {
                return;
            }
            else {
                const existingHeartbeatsObject = await this.read();
                return writeHeartbeatsToIndexedDB(this.app, {
                    lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                    heartbeats: [
                        ...existingHeartbeatsObject.heartbeats,
                        ...heartbeatsObject.heartbeats
                    ]
                });
            }
        }
    }
    /**
     * Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
     * in a platform logging header JSON object, stringified, and converted
     * to base 64.
     */
    function countBytes(heartbeatsCache) {
        // base64 has a restricted set of characters, all of which should be 1 byte.
        return base64urlEncodeWithoutPadding(
        // heartbeatsCache wrapper properties
        JSON.stringify({ version: 2, heartbeats: heartbeatsCache })).length;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function registerCoreComponents(variant) {
        _registerComponent(new Component('platform-logger', container => new PlatformLoggerServiceImpl(container), "PRIVATE" /* PRIVATE */));
        _registerComponent(new Component('heartbeat', container => new HeartbeatServiceImpl(container), "PRIVATE" /* PRIVATE */));
        // Register `app` package.
        registerVersion(name$o, version$1$1, variant);
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name$o, version$1$1, 'esm2017');
        // Register platform SDK identifier (no version).
        registerVersion('fire-js', '');
    }

    /**
     * Firebase App
     *
     * @remarks This package coordinates the communication between the different Firebase components
     * @packageDocumentation
     */
    registerCoreComponents('');

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    /*

     Copyright The Closure Library Authors.
     SPDX-License-Identifier: Apache-2.0
    */
    var k$1,goog=goog||{},l=commonjsGlobal||self;function aa$1(){}function ba(a){var b=typeof a;b="object"!=b?b:a?Array.isArray(a)?"array":b:"null";return "array"==b||"object"==b&&"number"==typeof a.length}function p(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}function da$1(a){return Object.prototype.hasOwnProperty.call(a,ea$1)&&a[ea$1]||(a[ea$1]=++fa$1)}var ea$1="closure_uid_"+(1E9*Math.random()>>>0),fa$1=0;function ha$1(a,b,c){return a.call.apply(a.bind,arguments)}
    function ia$1(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?q=ha$1:q=ia$1;return q.apply(null,arguments)}
    function ja(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}function t(a,b){function c(){}c.prototype=b.prototype;a.Z=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Vb=function(d,e,f){for(var h=Array(arguments.length-2),n=2;n<arguments.length;n++)h[n-2]=arguments[n];return b.prototype[e].apply(d,h)};}function v(){this.s=this.s;this.o=this.o;}var ka=0,la$1={};v.prototype.s=!1;v.prototype.na=function(){if(!this.s&&(this.s=!0,this.M(),0!=ka)){var a=da$1(this);delete la$1[a];}};v.prototype.M=function(){if(this.o)for(;this.o.length;)this.o.shift()();};const ma=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return "string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(let c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return -1},na$1=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c);}:function(a,b,c){const d=a.length,e="string"===typeof a?a.split(""):a;for(let f=0;f<d;f++)f in e&&b.call(c,e[f],f,a);};
    function oa$1(a){a:{var b=pa;const c=a.length,d="string"===typeof a?a.split(""):a;for(let e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1;}return 0>b?null:"string"===typeof a?a.charAt(b):a[b]}function qa(a){return Array.prototype.concat.apply([],arguments)}function ra$1(a){const b=a.length;if(0<b){const c=Array(b);for(let d=0;d<b;d++)c[d]=a[d];return c}return []}function sa(a){return /^[\s\xa0]*$/.test(a)}var ta$1=String.prototype.trim?function(a){return a.trim()}:function(a){return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]};function w(a,b){return -1!=a.indexOf(b)}function ua$1(a,b){return a<b?-1:a>b?1:0}var x$1;a:{var va=l.navigator;if(va){var wa=va.userAgent;if(wa){x$1=wa;break a}}x$1="";}function xa(a,b,c){for(const d in a)b.call(c,a[d],d,a);}function ya(a){const b={};for(const c in a)b[c]=a[c];return b}var za="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Aa$1(a,b){let c,d;for(let e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(let f=0;f<za.length;f++)c=za[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}function Ca$1(a){Ca$1[" "](a);return a}Ca$1[" "]=aa$1;function Fa$1(a){var b=Ga$1;return Object.prototype.hasOwnProperty.call(b,9)?b[9]:b[9]=a(9)}var Ha=w(x$1,"Opera"),y=w(x$1,"Trident")||w(x$1,"MSIE"),Ia=w(x$1,"Edge"),Ja=Ia||y,Ka$1=w(x$1,"Gecko")&&!(w(x$1.toLowerCase(),"webkit")&&!w(x$1,"Edge"))&&!(w(x$1,"Trident")||w(x$1,"MSIE"))&&!w(x$1,"Edge"),La=w(x$1.toLowerCase(),"webkit")&&!w(x$1,"Edge");function Ma$1(){var a=l.document;return a?a.documentMode:void 0}var Na;
    a:{var Oa$1="",Pa$1=function(){var a=x$1;if(Ka$1)return /rv:([^\);]+)(\)|;)/.exec(a);if(Ia)return /Edge\/([\d\.]+)/.exec(a);if(y)return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(La)return /WebKit\/(\S+)/.exec(a);if(Ha)return /(?:Version)[ \/]?(\S+)/.exec(a)}();Pa$1&&(Oa$1=Pa$1?Pa$1[1]:"");if(y){var Qa=Ma$1();if(null!=Qa&&Qa>parseFloat(Oa$1)){Na=String(Qa);break a}}Na=Oa$1;}var Ga$1={};
    function Ra$1(){return Fa$1(function(){let a=0;const b=ta$1(String(Na)).split("."),c=ta$1("9").split("."),d=Math.max(b.length,c.length);for(let h=0;0==a&&h<d;h++){var e=b[h]||"",f=c[h]||"";do{e=/(\d*)(\D*)(.*)/.exec(e)||["","","",""];f=/(\d*)(\D*)(.*)/.exec(f)||["","","",""];if(0==e[0].length&&0==f[0].length)break;a=ua$1(0==e[1].length?0:parseInt(e[1],10),0==f[1].length?0:parseInt(f[1],10))||ua$1(0==e[2].length,0==f[2].length)||ua$1(e[2],f[2]);e=e[3];f=f[3];}while(0==a)}return 0<=a})}var Sa$1;
    if(l.document&&y){var Ta=Ma$1();Sa$1=Ta?Ta:parseInt(Na,10)||void 0;}else Sa$1=void 0;var Ua=Sa$1;var Va=function(){if(!l.addEventListener||!Object.defineProperty)return !1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0;}});try{l.addEventListener("test",aa$1,b),l.removeEventListener("test",aa$1,b);}catch(c){}return a}();function z$1(a,b){this.type=a;this.g=this.target=b;this.defaultPrevented=!1;}z$1.prototype.h=function(){this.defaultPrevented=!0;};function A(a,b){z$1.call(this,a?a.type:"");this.relatedTarget=this.g=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.i=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.g=b;if(b=a.relatedTarget){if(Ka$1){a:{try{Ca$1(b.nodeName);var e=!0;break a}catch(f){}e=
    !1;}e||(b=null);}}else "mouseover"==c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=
    a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType="string"===typeof a.pointerType?a.pointerType:Wa[a.pointerType]||"";this.state=a.state;this.i=a;a.defaultPrevented&&A.Z.h.call(this);}}t(A,z$1);var Wa={2:"touch",3:"pen",4:"mouse"};A.prototype.h=function(){A.Z.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1;};var B$1="closure_listenable_"+(1E6*Math.random()|0);var Xa=0;function Ya(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.ia=e;this.key=++Xa;this.ca=this.fa=!1;}function Za(a){a.ca=!0;a.listener=null;a.proxy=null;a.src=null;a.ia=null;}function $a$1(a){this.src=a;this.g={};this.h=0;}$a$1.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.g[f];a||(a=this.g[f]=[],this.h++);var h=ab(a,b,d,e);-1<h?(b=a[h],c||(b.fa=!1)):(b=new Ya(b,this.src,f,!!d,e),b.fa=c,a.push(b));return b};function bb(a,b){var c=b.type;if(c in a.g){var d=a.g[c],e=ma(d,b),f;(f=0<=e)&&Array.prototype.splice.call(d,e,1);f&&(Za(b),0==a.g[c].length&&(delete a.g[c],a.h--));}}
    function ab(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.ca&&f.listener==b&&f.capture==!!c&&f.ia==d)return e}return -1}var cb="closure_lm_"+(1E6*Math.random()|0),db$1={};function fb(a,b,c,d,e){if(d&&d.once)return gb(a,b,c,d,e);if(Array.isArray(b)){for(var f=0;f<b.length;f++)fb(a,b[f],c,d,e);return null}c=hb(c);return a&&a[B$1]?a.N(b,c,p(d)?!!d.capture:!!d,e):ib(a,b,c,!1,d,e)}
    function ib(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var h=p(e)?!!e.capture:!!e,n=jb(a);n||(a[cb]=n=new $a$1(a));c=n.add(b,c,d,h,f);if(c.proxy)return c;d=kb();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)Va||(e=h),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(lb(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");return c}
    function kb(){function a(c){return b.call(a.src,a.listener,c)}var b=mb;return a}function gb(a,b,c,d,e){if(Array.isArray(b)){for(var f=0;f<b.length;f++)gb(a,b[f],c,d,e);return null}c=hb(c);return a&&a[B$1]?a.O(b,c,p(d)?!!d.capture:!!d,e):ib(a,b,c,!0,d,e)}
    function nb(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)nb(a,b[f],c,d,e);else (d=p(d)?!!d.capture:!!d,c=hb(c),a&&a[B$1])?(a=a.i,b=String(b).toString(),b in a.g&&(f=a.g[b],c=ab(f,c,d,e),-1<c&&(Za(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.g[b],a.h--)))):a&&(a=jb(a))&&(b=a.g[b.toString()],a=-1,b&&(a=ab(b,c,d,e)),(c=-1<a?b[a]:null)&&ob(c));}
    function ob(a){if("number"!==typeof a&&a&&!a.ca){var b=a.src;if(b&&b[B$1])bb(b.i,a);else {var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(lb(c),d):b.addListener&&b.removeListener&&b.removeListener(d);(c=jb(b))?(bb(c,a),0==c.h&&(c.src=null,b[cb]=null)):Za(a);}}}function lb(a){return a in db$1?db$1[a]:db$1[a]="on"+a}function mb(a,b){if(a.ca)a=!0;else {b=new A(b,this);var c=a.listener,d=a.ia||a.src;a.fa&&ob(a);a=c.call(d,b);}return a}
    function jb(a){a=a[cb];return a instanceof $a$1?a:null}var pb="__closure_events_fn_"+(1E9*Math.random()>>>0);function hb(a){if("function"===typeof a)return a;a[pb]||(a[pb]=function(b){return a.handleEvent(b)});return a[pb]}function C$1(){v.call(this);this.i=new $a$1(this);this.P=this;this.I=null;}t(C$1,v);C$1.prototype[B$1]=!0;C$1.prototype.removeEventListener=function(a,b,c,d){nb(this,a,b,c,d);};
    function D$1(a,b){var c,d=a.I;if(d)for(c=[];d;d=d.I)c.push(d);a=a.P;d=b.type||b;if("string"===typeof b)b=new z$1(b,a);else if(b instanceof z$1)b.target=b.target||a;else {var e=b;b=new z$1(d,a);Aa$1(b,e);}e=!0;if(c)for(var f=c.length-1;0<=f;f--){var h=b.g=c[f];e=qb(h,d,!0,b)&&e;}h=b.g=a;e=qb(h,d,!0,b)&&e;e=qb(h,d,!1,b)&&e;if(c)for(f=0;f<c.length;f++)h=b.g=c[f],e=qb(h,d,!1,b)&&e;}
    C$1.prototype.M=function(){C$1.Z.M.call(this);if(this.i){var a=this.i,c;for(c in a.g){for(var d=a.g[c],e=0;e<d.length;e++)Za(d[e]);delete a.g[c];a.h--;}}this.I=null;};C$1.prototype.N=function(a,b,c,d){return this.i.add(String(a),b,!1,c,d)};C$1.prototype.O=function(a,b,c,d){return this.i.add(String(a),b,!0,c,d)};
    function qb(a,b,c,d){b=a.i.g[String(b)];if(!b)return !0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var h=b[f];if(h&&!h.ca&&h.capture==c){var n=h.listener,u=h.ia||h.src;h.fa&&bb(a.i,h);e=!1!==n.call(u,d)&&e;}}return e&&!d.defaultPrevented}var rb=l.JSON.stringify;function sb(){var a=tb;let b=null;a.g&&(b=a.g,a.g=a.g.next,a.g||(a.h=null),b.next=null);return b}class ub{constructor(){this.h=this.g=null;}add(a,b){const c=vb.get();c.set(a,b);this.h?this.h.next=c:this.g=c;this.h=c;}}var vb=new class{constructor(a,b){this.i=a;this.j=b;this.h=0;this.g=null;}get(){let a;0<this.h?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i();return a}}(()=>new wb,a=>a.reset());
    class wb{constructor(){this.next=this.g=this.h=null;}set(a,b){this.h=a;this.g=b;this.next=null;}reset(){this.next=this.g=this.h=null;}}function yb(a){l.setTimeout(()=>{throw a;},0);}function zb(a,b){Ab||Bb();Cb||(Ab(),Cb=!0);tb.add(a,b);}var Ab;function Bb(){var a=l.Promise.resolve(void 0);Ab=function(){a.then(Db);};}var Cb=!1,tb=new ub;function Db(){for(var a;a=sb();){try{a.h.call(a.g);}catch(c){yb(c);}var b=vb;b.j(a);100>b.h&&(b.h++,a.next=b.g,b.g=a);}Cb=!1;}function Eb(a,b){C$1.call(this);this.h=a||1;this.g=b||l;this.j=q(this.kb,this);this.l=Date.now();}t(Eb,C$1);k$1=Eb.prototype;k$1.da=!1;k$1.S=null;k$1.kb=function(){if(this.da){var a=Date.now()-this.l;0<a&&a<.8*this.h?this.S=this.g.setTimeout(this.j,this.h-a):(this.S&&(this.g.clearTimeout(this.S),this.S=null),D$1(this,"tick"),this.da&&(Fb(this),this.start()));}};k$1.start=function(){this.da=!0;this.S||(this.S=this.g.setTimeout(this.j,this.h),this.l=Date.now());};
    function Fb(a){a.da=!1;a.S&&(a.g.clearTimeout(a.S),a.S=null);}k$1.M=function(){Eb.Z.M.call(this);Fb(this);delete this.g;};function Gb(a,b,c){if("function"===typeof a)c&&(a=q(a,c));else if(a&&"function"==typeof a.handleEvent)a=q(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)}function Hb(a){a.g=Gb(()=>{a.g=null;a.i&&(a.i=!1,Hb(a));},a.j);const b=a.h;a.h=null;a.m.apply(null,b);}class Ib extends v{constructor(a,b){super();this.m=a;this.j=b;this.h=null;this.i=!1;this.g=null;}l(a){this.h=arguments;this.g?this.i=!0:Hb(this);}M(){super.M();this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null);}}function E(a){v.call(this);this.h=a;this.g={};}t(E,v);var Jb=[];function Kb(a,b,c,d){Array.isArray(c)||(c&&(Jb[0]=c.toString()),c=Jb);for(var e=0;e<c.length;e++){var f=fb(b,c[e],d||a.handleEvent,!1,a.h||a);if(!f)break;a.g[f.key]=f;}}function Lb(a){xa(a.g,function(b,c){this.g.hasOwnProperty(c)&&ob(b);},a);a.g={};}E.prototype.M=function(){E.Z.M.call(this);Lb(this);};E.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented");};function Mb(){this.g=!0;}Mb.prototype.Aa=function(){this.g=!1;};function Nb(a,b,c,d,e,f){a.info(function(){if(a.g)if(f){var h="";for(var n=f.split("&"),u=0;u<n.length;u++){var m=n[u].split("=");if(1<m.length){var r=m[0];m=m[1];var G=r.split("_");h=2<=G.length&&"type"==G[1]?h+(r+"="+m+"&"):h+(r+"=redacted&");}}}else h=null;else h=f;return "XMLHTTP REQ ("+d+") [attempt "+e+"]: "+b+"\n"+c+"\n"+h});}
    function Ob(a,b,c,d,e,f,h){a.info(function(){return "XMLHTTP RESP ("+d+") [ attempt "+e+"]: "+b+"\n"+c+"\n"+f+" "+h});}function F$1(a,b,c,d){a.info(function(){return "XMLHTTP TEXT ("+b+"): "+Pb(a,c)+(d?" "+d:"")});}function Qb(a,b){a.info(function(){return "TIMEOUT: "+b});}Mb.prototype.info=function(){};
    function Pb(a,b){if(!a.g)return b;if(!b)return null;try{var c=JSON.parse(b);if(c)for(a=0;a<c.length;a++)if(Array.isArray(c[a])){var d=c[a];if(!(2>d.length)){var e=d[1];if(Array.isArray(e)&&!(1>e.length)){var f=e[0];if("noop"!=f&&"stop"!=f&&"close"!=f)for(var h=1;h<e.length;h++)e[h]="";}}}return rb(c)}catch(n){return b}}var H={},Rb=null;function Sb(){return Rb=Rb||new C$1}H.Ma="serverreachability";function Tb(a){z$1.call(this,H.Ma,a);}t(Tb,z$1);function I(a){const b=Sb();D$1(b,new Tb(b,a));}H.STAT_EVENT="statevent";function Ub(a,b){z$1.call(this,H.STAT_EVENT,a);this.stat=b;}t(Ub,z$1);function J$1(a){const b=Sb();D$1(b,new Ub(b,a));}H.Na="timingevent";function Vb(a,b){z$1.call(this,H.Na,a);this.size=b;}t(Vb,z$1);
    function K$1(a,b){if("function"!==typeof a)throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a();},b)}var Wb={NO_ERROR:0,lb:1,yb:2,xb:3,sb:4,wb:5,zb:6,Ja:7,TIMEOUT:8,Cb:9};var Xb={qb:"complete",Mb:"success",Ka:"error",Ja:"abort",Eb:"ready",Fb:"readystatechange",TIMEOUT:"timeout",Ab:"incrementaldata",Db:"progress",tb:"downloadprogress",Ub:"uploadprogress"};function Yb(){}Yb.prototype.h=null;function Zb(a){return a.h||(a.h=a.i())}function $b(){}var L$1={OPEN:"a",pb:"b",Ka:"c",Bb:"d"};function ac(){z$1.call(this,"d");}t(ac,z$1);function bc(){z$1.call(this,"c");}t(bc,z$1);var cc$1;function dc$1(){}t(dc$1,Yb);dc$1.prototype.g=function(){return new XMLHttpRequest};dc$1.prototype.i=function(){return {}};cc$1=new dc$1;function M(a,b,c,d){this.l=a;this.j=b;this.m=c;this.X=d||1;this.V=new E(this);this.P=ec$1;a=Ja?125:void 0;this.W=new Eb(a);this.H=null;this.i=!1;this.s=this.A=this.v=this.K=this.F=this.Y=this.B=null;this.D=[];this.g=null;this.C=0;this.o=this.u=null;this.N=-1;this.I=!1;this.O=0;this.L=null;this.aa=this.J=this.$=this.U=!1;this.h=new fc$1;}function fc$1(){this.i=null;this.g="";this.h=!1;}var ec$1=45E3,gc$1={},hc$1={};k$1=M.prototype;k$1.setTimeout=function(a){this.P=a;};
    function ic$1(a,b,c){a.K=1;a.v=jc$1(N$1(b));a.s=c;a.U=!0;kc(a,null);}function kc(a,b){a.F=Date.now();lc(a);a.A=N$1(a.v);var c=a.A,d=a.X;Array.isArray(d)||(d=[String(d)]);mc(c.h,"t",d);a.C=0;c=a.l.H;a.h=new fc$1;a.g=nc$1(a.l,c?b:null,!a.s);0<a.O&&(a.L=new Ib(q(a.Ia,a,a.g),a.O));Kb(a.V,a.g,"readystatechange",a.gb);b=a.H?ya(a.H):{};a.s?(a.u||(a.u="POST"),b["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.s,b)):(a.u="GET",a.g.ea(a.A,a.u,null,b));I(1);Nb(a.j,a.u,a.A,a.m,a.X,a.s);}
    k$1.gb=function(a){a=a.target;const b=this.L;b&&3==O$1(a)?b.l():this.Ia(a);};
    k$1.Ia=function(a){try{if(a==this.g)a:{const r=O$1(this.g);var b=this.g.Da();const G=this.g.ba();if(!(3>r)&&(3!=r||Ja||this.g&&(this.h.h||this.g.ga()||oc$1(this.g)))){this.I||4!=r||7==b||(8==b||0>=G?I(3):I(2));pc(this);var c=this.g.ba();this.N=c;b:if(qc$1(this)){var d=oc$1(this.g);a="";var e=d.length,f=4==O$1(this.g);if(!this.h.i){if("undefined"===typeof TextDecoder){P(this);rc$1(this);var h="";break b}this.h.i=new l.TextDecoder;}for(b=0;b<e;b++)this.h.h=!0,a+=this.h.i.decode(d[b],{stream:f&&b==e-1});d.splice(0,
    e);this.h.g+=a;this.C=0;h=this.h.g;}else h=this.g.ga();this.i=200==c;Ob(this.j,this.u,this.A,this.m,this.X,r,c);if(this.i){if(this.$&&!this.J){b:{if(this.g){var n,u=this.g;if((n=u.g?u.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!sa(n)){var m=n;break b}}m=null;}if(c=m)F$1(this.j,this.m,c,"Initial handshake response via X-HTTP-Initial-Response"),this.J=!0,sc$1(this,c);else {this.i=!1;this.o=3;J$1(12);P(this);rc$1(this);break a}}this.U?(tc(this,r,h),Ja&&this.i&&3==r&&(Kb(this.V,this.W,"tick",this.fb),
    this.W.start())):(F$1(this.j,this.m,h,null),sc$1(this,h));4==r&&P(this);this.i&&!this.I&&(4==r?uc$1(this.l,this):(this.i=!1,lc(this)));}else 400==c&&0<h.indexOf("Unknown SID")?(this.o=3,J$1(12)):(this.o=0,J$1(13)),P(this),rc$1(this);}}}catch(r){}finally{}};function qc$1(a){return a.g?"GET"==a.u&&2!=a.K&&a.l.Ba:!1}
    function tc(a,b,c){let d=!0,e;for(;!a.I&&a.C<c.length;)if(e=vc$1(a,c),e==hc$1){4==b&&(a.o=4,J$1(14),d=!1);F$1(a.j,a.m,null,"[Incomplete Response]");break}else if(e==gc$1){a.o=4;J$1(15);F$1(a.j,a.m,c,"[Invalid Chunk]");d=!1;break}else F$1(a.j,a.m,e,null),sc$1(a,e);qc$1(a)&&e!=hc$1&&e!=gc$1&&(a.h.g="",a.C=0);4!=b||0!=c.length||a.h.h||(a.o=1,J$1(16),d=!1);a.i=a.i&&d;d?0<c.length&&!a.aa&&(a.aa=!0,b=a.l,b.g==a&&b.$&&!b.L&&(b.h.info("Great, no buffering proxy detected. Bytes received: "+c.length),wc$1(b),b.L=!0,J$1(11))):(F$1(a.j,a.m,
    c,"[Invalid Chunked Response]"),P(a),rc$1(a));}k$1.fb=function(){if(this.g){var a=O$1(this.g),b=this.g.ga();this.C<b.length&&(pc(this),tc(this,a,b),this.i&&4!=a&&lc(this));}};function vc$1(a,b){var c=a.C,d=b.indexOf("\n",c);if(-1==d)return hc$1;c=Number(b.substring(c,d));if(isNaN(c))return gc$1;d+=1;if(d+c>b.length)return hc$1;b=b.substr(d,c);a.C=d+c;return b}k$1.cancel=function(){this.I=!0;P(this);};function lc(a){a.Y=Date.now()+a.P;xc(a,a.P);}
    function xc(a,b){if(null!=a.B)throw Error("WatchDog timer not null");a.B=K$1(q(a.eb,a),b);}function pc(a){a.B&&(l.clearTimeout(a.B),a.B=null);}k$1.eb=function(){this.B=null;const a=Date.now();0<=a-this.Y?(Qb(this.j,this.A),2!=this.K&&(I(3),J$1(17)),P(this),this.o=2,rc$1(this)):xc(this,this.Y-a);};function rc$1(a){0==a.l.G||a.I||uc$1(a.l,a);}function P(a){pc(a);var b=a.L;b&&"function"==typeof b.na&&b.na();a.L=null;Fb(a.W);Lb(a.V);a.g&&(b=a.g,a.g=null,b.abort(),b.na());}
    function sc$1(a,b){try{var c=a.l;if(0!=c.G&&(c.g==a||yc(c.i,a)))if(c.I=a.N,!a.J&&yc(c.i,a)&&3==c.G){try{var d=c.Ca.g.parse(b);}catch(m){d=null;}if(Array.isArray(d)&&3==d.length){var e=d;if(0==e[0])a:{if(!c.u){if(c.g)if(c.g.F+3E3<a.F)zc$1(c),Ac(c);else break a;Bc(c);J$1(18);}}else c.ta=e[1],0<c.ta-c.U&&37500>e[2]&&c.N&&0==c.A&&!c.v&&(c.v=K$1(q(c.ab,c),6E3));if(1>=Cc(c.i)&&c.ka){try{c.ka();}catch(m){}c.ka=void 0;}}else Q$1(c,11);}else if((a.J||c.g==a)&&zc$1(c),!sa(b))for(e=c.Ca.g.parse(b),b=0;b<e.length;b++){let m=e[b];
    c.U=m[0];m=m[1];if(2==c.G)if("c"==m[0]){c.J=m[1];c.la=m[2];const r=m[3];null!=r&&(c.ma=r,c.h.info("VER="+c.ma));const G=m[4];null!=G&&(c.za=G,c.h.info("SVER="+c.za));const Da=m[5];null!=Da&&"number"===typeof Da&&0<Da&&(d=1.5*Da,c.K=d,c.h.info("backChannelRequestTimeoutMs_="+d));d=c;const ca=a.g;if(ca){const Ea=ca.g?ca.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ea){var f=d.i;!f.g&&(w(Ea,"spdy")||w(Ea,"quic")||w(Ea,"h2"))&&(f.j=f.l,f.g=new Set,f.h&&(Dc(f,f.h),f.h=null));}if(d.D){const xb=
    ca.g?ca.g.getResponseHeader("X-HTTP-Session-Id"):null;xb&&(d.sa=xb,R(d.F,d.D,xb));}}c.G=3;c.j&&c.j.xa();c.$&&(c.O=Date.now()-a.F,c.h.info("Handshake RTT: "+c.O+"ms"));d=c;var h=a;d.oa=Ec(d,d.H?d.la:null,d.W);if(h.J){Fc(d.i,h);var n=h,u=d.K;u&&n.setTimeout(u);n.B&&(pc(n),lc(n));d.g=h;}else Gc$1(d);0<c.l.length&&Hc$1(c);}else "stop"!=m[0]&&"close"!=m[0]||Q$1(c,7);else 3==c.G&&("stop"==m[0]||"close"==m[0]?"stop"==m[0]?Q$1(c,7):Ic$1(c):"noop"!=m[0]&&c.j&&c.j.wa(m),c.A=0);}I(4);}catch(m){}}function Jc$1(a){if(a.R&&"function"==typeof a.R)return a.R();if("string"===typeof a)return a.split("");if(ba(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}
    function Kc$1(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(ba(a)||"string"===typeof a)na$1(a,b,void 0);else {if(a.T&&"function"==typeof a.T)var c=a.T();else if(a.R&&"function"==typeof a.R)c=void 0;else if(ba(a)||"string"===typeof a){c=[];for(var d=a.length,e=0;e<d;e++)c.push(e);}else for(e in c=[],d=0,a)c[d++]=e;d=Jc$1(a);e=d.length;for(var f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a);}}function S(a,b){this.h={};this.g=[];this.i=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1]);}else if(a)if(a instanceof S)for(c=a.T(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d]);}k$1=S.prototype;k$1.R=function(){Lc$1(this);for(var a=[],b=0;b<this.g.length;b++)a.push(this.h[this.g[b]]);return a};k$1.T=function(){Lc$1(this);return this.g.concat()};
    function Lc$1(a){if(a.i!=a.g.length){for(var b=0,c=0;b<a.g.length;){var d=a.g[b];T(a.h,d)&&(a.g[c++]=d);b++;}a.g.length=c;}if(a.i!=a.g.length){var e={};for(c=b=0;b<a.g.length;)d=a.g[b],T(e,d)||(a.g[c++]=d,e[d]=1),b++;a.g.length=c;}}k$1.get=function(a,b){return T(this.h,a)?this.h[a]:b};k$1.set=function(a,b){T(this.h,a)||(this.i++,this.g.push(a));this.h[a]=b;};k$1.forEach=function(a,b){for(var c=this.T(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this);}};
    function T(a,b){return Object.prototype.hasOwnProperty.call(a,b)}var Mc=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function Nc(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1);}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"");}}}function U$1(a,b){this.i=this.s=this.j="";this.m=null;this.o=this.l="";this.g=!1;if(a instanceof U$1){this.g=void 0!==b?b:a.g;Oc(this,a.j);this.s=a.s;Pc$1(this,a.i);Qc$1(this,a.m);this.l=a.l;b=a.h;var c=new Rc$1;c.i=b.i;b.g&&(c.g=new S(b.g),c.h=b.h);Sc(this,c);this.o=a.o;}else a&&(c=String(a).match(Mc))?(this.g=!!b,Oc(this,c[1]||"",!0),this.s=Tc$1(c[2]||""),Pc$1(this,c[3]||"",!0),Qc$1(this,c[4]),this.l=Tc$1(c[5]||"",!0),Sc(this,c[6]||"",!0),this.o=Tc$1(c[7]||"")):(this.g=!!b,this.h=new Rc$1(null,this.g));}
    U$1.prototype.toString=function(){var a=[],b=this.j;b&&a.push(Uc(b,Vc$1,!0),":");var c=this.i;if(c||"file"==b)a.push("//"),(b=this.s)&&a.push(Uc(b,Vc$1,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.m,null!=c&&a.push(":",String(c));if(c=this.l)this.i&&"/"!=c.charAt(0)&&a.push("/"),a.push(Uc(c,"/"==c.charAt(0)?Wc$1:Xc$1,!0));(c=this.h.toString())&&a.push("?",c);(c=this.o)&&a.push("#",Uc(c,Yc$1));return a.join("")};function N$1(a){return new U$1(a)}
    function Oc(a,b,c){a.j=c?Tc$1(b,!0):b;a.j&&(a.j=a.j.replace(/:$/,""));}function Pc$1(a,b,c){a.i=c?Tc$1(b,!0):b;}function Qc$1(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.m=b;}else a.m=null;}function Sc(a,b,c){b instanceof Rc$1?(a.h=b,Zc$1(a.h,a.g)):(c||(b=Uc(b,$c)),a.h=new Rc$1(b,a.g));}function R(a,b,c){a.h.set(b,c);}function jc$1(a){R(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36));return a}
    function ad(a){return a instanceof U$1?N$1(a):new U$1(a,void 0)}function bd(a,b,c,d){var e=new U$1(null,void 0);a&&Oc(e,a);b&&Pc$1(e,b);c&&Qc$1(e,c);d&&(e.l=d);return e}function Tc$1(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Uc(a,b,c){return "string"===typeof a?(a=encodeURI(a).replace(b,cd),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function cd(a){a=a.charCodeAt(0);return "%"+(a>>4&15).toString(16)+(a&15).toString(16)}
    var Vc$1=/[#\/\?@]/g,Xc$1=/[#\?:]/g,Wc$1=/[#\?]/g,$c=/[#\?@]/g,Yc$1=/#/g;function Rc$1(a,b){this.h=this.g=null;this.i=a||null;this.j=!!b;}function V(a){a.g||(a.g=new S,a.h=0,a.i&&Nc(a.i,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c);}));}k$1=Rc$1.prototype;k$1.add=function(a,b){V(this);this.i=null;a=W$1(this,a);var c=this.g.get(a);c||this.g.set(a,c=[]);c.push(b);this.h+=1;return this};
    function dd(a,b){V(a);b=W$1(a,b);T(a.g.h,b)&&(a.i=null,a.h-=a.g.get(b).length,a=a.g,T(a.h,b)&&(delete a.h[b],a.i--,a.g.length>2*a.i&&Lc$1(a)));}function ed(a,b){V(a);b=W$1(a,b);return T(a.g.h,b)}k$1.forEach=function(a,b){V(this);this.g.forEach(function(c,d){na$1(c,function(e){a.call(b,e,d,this);},this);},this);};k$1.T=function(){V(this);for(var a=this.g.R(),b=this.g.T(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
    k$1.R=function(a){V(this);var b=[];if("string"===typeof a)ed(this,a)&&(b=qa(b,this.g.get(W$1(this,a))));else {a=this.g.R();for(var c=0;c<a.length;c++)b=qa(b,a[c]);}return b};k$1.set=function(a,b){V(this);this.i=null;a=W$1(this,a);ed(this,a)&&(this.h-=this.g.get(a).length);this.g.set(a,[b]);this.h+=1;return this};k$1.get=function(a,b){if(!a)return b;a=this.R(a);return 0<a.length?String(a[0]):b};function mc(a,b,c){dd(a,b);0<c.length&&(a.i=null,a.g.set(W$1(a,b),ra$1(c)),a.h+=c.length);}
    k$1.toString=function(){if(this.i)return this.i;if(!this.g)return "";for(var a=[],b=this.g.T(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.R(d);for(var f=0;f<d.length;f++){var h=e;""!==d[f]&&(h+="="+encodeURIComponent(String(d[f])));a.push(h);}}return this.i=a.join("&")};function W$1(a,b){b=String(b);a.j&&(b=b.toLowerCase());return b}function Zc$1(a,b){b&&!a.j&&(V(a),a.i=null,a.g.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(dd(this,d),mc(this,e,c));},a));a.j=b;}var fd=class{constructor(a,b){this.h=a;this.g=b;}};function gd(a){this.l=a||hd;l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&("hq"==a[0].nextHopProtocol||"h2"==a[0].nextHopProtocol)):a=!!(l.g&&l.g.Ea&&l.g.Ea()&&l.g.Ea().Zb);this.j=a?this.l:1;this.g=null;1<this.j&&(this.g=new Set);this.h=null;this.i=[];}var hd=10;function id(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Cc(a){return a.h?1:a.g?a.g.size:0}function yc(a,b){return a.h?a.h==b:a.g?a.g.has(b):!1}function Dc(a,b){a.g?a.g.add(b):a.h=b;}
    function Fc(a,b){a.h&&a.h==b?a.h=null:a.g&&a.g.has(b)&&a.g.delete(b);}gd.prototype.cancel=function(){this.i=jd(this);if(this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const a of this.g.values())a.cancel();this.g.clear();}};function jd(a){if(null!=a.h)return a.i.concat(a.h.D);if(null!=a.g&&0!==a.g.size){let b=a.i;for(const c of a.g.values())b=b.concat(c.D);return b}return ra$1(a.i)}function kd(){}kd.prototype.stringify=function(a){return l.JSON.stringify(a,void 0)};kd.prototype.parse=function(a){return l.JSON.parse(a,void 0)};function ld(){this.g=new kd;}function md(a,b,c){const d=c||"";try{Kc$1(a,function(e,f){let h=e;p(e)&&(h=rb(e));b.push(d+f+"="+encodeURIComponent(h));});}catch(e){throw b.push(d+"type="+encodeURIComponent("_badmap")),e;}}function nd(a,b){const c=new Mb;if(l.Image){const d=new Image;d.onload=ja(od,c,d,"TestLoadImage: loaded",!0,b);d.onerror=ja(od,c,d,"TestLoadImage: error",!1,b);d.onabort=ja(od,c,d,"TestLoadImage: abort",!1,b);d.ontimeout=ja(od,c,d,"TestLoadImage: timeout",!1,b);l.setTimeout(function(){if(d.ontimeout)d.ontimeout();},1E4);d.src=a;}else b(!1);}function od(a,b,c,d,e){try{b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null,e(d);}catch(f){}}function pd(a){this.l=a.$b||null;this.j=a.ib||!1;}t(pd,Yb);pd.prototype.g=function(){return new qd(this.l,this.j)};pd.prototype.i=function(a){return function(){return a}}({});function qd(a,b){C$1.call(this);this.D=a;this.u=b;this.m=void 0;this.readyState=rd;this.status=0;this.responseType=this.responseText=this.response=this.statusText="";this.onreadystatechange=null;this.v=new Headers;this.h=null;this.C="GET";this.B="";this.g=!1;this.A=this.j=this.l=null;}t(qd,C$1);var rd=0;k$1=qd.prototype;
    k$1.open=function(a,b){if(this.readyState!=rd)throw this.abort(),Error("Error reopening a connection");this.C=a;this.B=b;this.readyState=1;sd(this);};k$1.send=function(a){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const b={headers:this.v,method:this.C,credentials:this.m,cache:void 0};a&&(b.body=a);(this.D||l).fetch(new Request(this.B,b)).then(this.Va.bind(this),this.ha.bind(this));};
    k$1.abort=function(){this.response=this.responseText="";this.v=new Headers;this.status=0;this.j&&this.j.cancel("Request was aborted.");1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,td(this));this.readyState=rd;};
    k$1.Va=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,sd(this)),this.g&&(this.readyState=3,sd(this),this.g)))if("arraybuffer"===this.responseType)a.arrayBuffer().then(this.Ta.bind(this),this.ha.bind(this));else if("undefined"!==typeof l.ReadableStream&&"body"in a){this.j=a.body.getReader();if(this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=
    [];}else this.response=this.responseText="",this.A=new TextDecoder;ud(this);}else a.text().then(this.Ua.bind(this),this.ha.bind(this));};function ud(a){a.j.read().then(a.Sa.bind(a)).catch(a.ha.bind(a));}k$1.Sa=function(a){if(this.g){if(this.u&&a.value)this.response.push(a.value);else if(!this.u){var b=a.value?a.value:new Uint8Array(0);if(b=this.A.decode(b,{stream:!a.done}))this.response=this.responseText+=b;}a.done?td(this):sd(this);3==this.readyState&&ud(this);}};
    k$1.Ua=function(a){this.g&&(this.response=this.responseText=a,td(this));};k$1.Ta=function(a){this.g&&(this.response=a,td(this));};k$1.ha=function(){this.g&&td(this);};function td(a){a.readyState=4;a.l=null;a.j=null;a.A=null;sd(a);}k$1.setRequestHeader=function(a,b){this.v.append(a,b);};k$1.getResponseHeader=function(a){return this.h?this.h.get(a.toLowerCase())||"":""};
    k$1.getAllResponseHeaders=function(){if(!this.h)return "";const a=[],b=this.h.entries();for(var c=b.next();!c.done;)c=c.value,a.push(c[0]+": "+c[1]),c=b.next();return a.join("\r\n")};function sd(a){a.onreadystatechange&&a.onreadystatechange.call(a);}Object.defineProperty(qd.prototype,"withCredentials",{get:function(){return "include"===this.m},set:function(a){this.m=a?"include":"same-origin";}});var vd=l.JSON.parse;function X$1(a){C$1.call(this);this.headers=new S;this.u=a||null;this.h=!1;this.C=this.g=null;this.H="";this.m=0;this.j="";this.l=this.F=this.v=this.D=!1;this.B=0;this.A=null;this.J=wd;this.K=this.L=!1;}t(X$1,C$1);var wd="",xd=/^https?$/i,yd=["POST","PUT"];k$1=X$1.prototype;
    k$1.ea=function(a,b,c,d){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.H+"; newUri="+a);b=b?b.toUpperCase():"GET";this.H=a;this.j="";this.m=0;this.D=!1;this.h=!0;this.g=this.u?this.u.g():cc$1.g();this.C=this.u?Zb(this.u):Zb(cc$1);this.g.onreadystatechange=q(this.Fa,this);try{this.F=!0,this.g.open(b,String(a),!0),this.F=!1;}catch(f){zd(this,f);return}a=c||"";const e=new S(this.headers);d&&Kc$1(d,function(f,h){e.set(h,f);});d=oa$1(e.T());c=l.FormData&&a instanceof l.FormData;
    !(0<=ma(yd,b))||d||c||e.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");e.forEach(function(f,h){this.g.setRequestHeader(h,f);},this);this.J&&(this.g.responseType=this.J);"withCredentials"in this.g&&this.g.withCredentials!==this.L&&(this.g.withCredentials=this.L);try{Ad(this),0<this.B&&((this.K=Bd(this.g))?(this.g.timeout=this.B,this.g.ontimeout=q(this.pa,this)):this.A=Gb(this.pa,this.B,this)),this.v=!0,this.g.send(a),this.v=!1;}catch(f){zd(this,f);}};
    function Bd(a){return y&&Ra$1()&&"number"===typeof a.timeout&&void 0!==a.ontimeout}function pa(a){return "content-type"==a.toLowerCase()}k$1.pa=function(){"undefined"!=typeof goog&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,D$1(this,"timeout"),this.abort(8));};function zd(a,b){a.h=!1;a.g&&(a.l=!0,a.g.abort(),a.l=!1);a.j=b;a.m=5;Cd(a);Dd(a);}function Cd(a){a.D||(a.D=!0,D$1(a,"complete"),D$1(a,"error"));}
    k$1.abort=function(a){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=a||7,D$1(this,"complete"),D$1(this,"abort"),Dd(this));};k$1.M=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),Dd(this,!0));X$1.Z.M.call(this);};k$1.Fa=function(){this.s||(this.F||this.v||this.l?Ed(this):this.cb());};k$1.cb=function(){Ed(this);};
    function Ed(a){if(a.h&&"undefined"!=typeof goog&&(!a.C[1]||4!=O$1(a)||2!=a.ba()))if(a.v&&4==O$1(a))Gb(a.Fa,0,a);else if(D$1(a,"readystatechange"),4==O$1(a)){a.h=!1;try{const n=a.ba();a:switch(n){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var b=!0;break a;default:b=!1;}var c;if(!(c=b)){var d;if(d=0===n){var e=String(a.H).match(Mc)[1]||null;if(!e&&l.self&&l.self.location){var f=l.self.location.protocol;e=f.substr(0,f.length-1);}d=!xd.test(e?e.toLowerCase():"");}c=d;}if(c)D$1(a,"complete"),D$1(a,
    "success");else {a.m=6;try{var h=2<O$1(a)?a.g.statusText:"";}catch(u){h="";}a.j=h+" ["+a.ba()+"]";Cd(a);}}finally{Dd(a);}}}function Dd(a,b){if(a.g){Ad(a);const c=a.g,d=a.C[0]?aa$1:null;a.g=null;a.C=null;b||D$1(a,"ready");try{c.onreadystatechange=d;}catch(e){}}}function Ad(a){a.g&&a.K&&(a.g.ontimeout=null);a.A&&(l.clearTimeout(a.A),a.A=null);}function O$1(a){return a.g?a.g.readyState:0}k$1.ba=function(){try{return 2<O$1(this)?this.g.status:-1}catch(a){return -1}};
    k$1.ga=function(){try{return this.g?this.g.responseText:""}catch(a){return ""}};k$1.Qa=function(a){if(this.g){var b=this.g.responseText;a&&0==b.indexOf(a)&&(b=b.substring(a.length));return vd(b)}};function oc$1(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.J){case wd:case "text":return a.g.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch(b){return null}}k$1.Da=function(){return this.m};
    k$1.La=function(){return "string"===typeof this.j?this.j:String(this.j)};function Fd(a){let b="";xa(a,function(c,d){b+=d;b+=":";b+=c;b+="\r\n";});return b}function Gd(a,b,c){a:{for(d in c){var d=!1;break a}d=!0;}d||(c=Fd(c),"string"===typeof a?(null!=c&&encodeURIComponent(String(c))):R(a,b,c));}function Hd(a,b,c){return c&&c.internalChannelParams?c.internalChannelParams[a]||b:b}
    function Id(a){this.za=0;this.l=[];this.h=new Mb;this.la=this.oa=this.F=this.W=this.g=this.sa=this.D=this.aa=this.o=this.P=this.s=null;this.Za=this.V=0;this.Xa=Hd("failFast",!1,a);this.N=this.v=this.u=this.m=this.j=null;this.X=!0;this.I=this.ta=this.U=-1;this.Y=this.A=this.C=0;this.Pa=Hd("baseRetryDelayMs",5E3,a);this.$a=Hd("retryDelaySeedMs",1E4,a);this.Ya=Hd("forwardChannelMaxRetries",2,a);this.ra=Hd("forwardChannelRequestTimeoutMs",2E4,a);this.qa=a&&a.xmlHttpFactory||void 0;this.Ba=a&&a.Yb||!1;
    this.K=void 0;this.H=a&&a.supportsCrossDomainXhr||!1;this.J="";this.i=new gd(a&&a.concurrentRequestLimit);this.Ca=new ld;this.ja=a&&a.fastHandshake||!1;this.Ra=a&&a.Wb||!1;a&&a.Aa&&this.h.Aa();a&&a.forceLongPolling&&(this.X=!1);this.$=!this.ja&&this.X&&a&&a.detectBufferingProxy||!1;this.ka=void 0;this.O=0;this.L=!1;this.B=null;this.Wa=!a||!1!==a.Xb;}k$1=Id.prototype;k$1.ma=8;k$1.G=1;
    function Ic$1(a){Jd(a);if(3==a.G){var b=a.V++,c=N$1(a.F);R(c,"SID",a.J);R(c,"RID",b);R(c,"TYPE","terminate");Kd(a,c);b=new M(a,a.h,b,void 0);b.K=2;b.v=jc$1(N$1(c));c=!1;l.navigator&&l.navigator.sendBeacon&&(c=l.navigator.sendBeacon(b.v.toString(),""));!c&&l.Image&&((new Image).src=b.v,c=!0);c||(b.g=nc$1(b.l,null),b.g.ea(b.v));b.F=Date.now();lc(b);}Ld(a);}k$1.hb=function(a){try{this.h.info("Origin Trials invoked: "+a);}catch(b){}};function Ac(a){a.g&&(wc$1(a),a.g.cancel(),a.g=null);}
    function Jd(a){Ac(a);a.u&&(l.clearTimeout(a.u),a.u=null);zc$1(a);a.i.cancel();a.m&&("number"===typeof a.m&&l.clearTimeout(a.m),a.m=null);}function Md(a,b){a.l.push(new fd(a.Za++,b));3==a.G&&Hc$1(a);}function Hc$1(a){id(a.i)||a.m||(a.m=!0,zb(a.Ha,a),a.C=0);}function Nd(a,b){if(Cc(a.i)>=a.i.j-(a.m?1:0))return !1;if(a.m)return a.l=b.D.concat(a.l),!0;if(1==a.G||2==a.G||a.C>=(a.Xa?0:a.Ya))return !1;a.m=K$1(q(a.Ha,a,b),Od(a,a.C));a.C++;return !0}
    k$1.Ha=function(a){if(this.m)if(this.m=null,1==this.G){if(!a){this.V=Math.floor(1E5*Math.random());a=this.V++;const e=new M(this,this.h,a,void 0);let f=this.s;this.P&&(f?(f=ya(f),Aa$1(f,this.P)):f=this.P);null===this.o&&(e.H=f);if(this.ja)a:{var b=0;for(var c=0;c<this.l.length;c++){b:{var d=this.l[c];if("__data__"in d.g&&(d=d.g.__data__,"string"===typeof d)){d=d.length;break b}d=void 0;}if(void 0===d)break;b+=d;if(4096<b){b=c;break a}if(4096===b||c===this.l.length-1){b=c+1;break a}}b=1E3;}else b=1E3;b=
    Pd(this,e,b);c=N$1(this.F);R(c,"RID",a);R(c,"CVER",22);this.D&&R(c,"X-HTTP-Session-Id",this.D);Kd(this,c);this.o&&f&&Gd(c,this.o,f);Dc(this.i,e);this.Ra&&R(c,"TYPE","init");this.ja?(R(c,"$req",b),R(c,"SID","null"),e.$=!0,ic$1(e,c,null)):ic$1(e,c,b);this.G=2;}}else 3==this.G&&(a?Qd(this,a):0==this.l.length||id(this.i)||Qd(this));};
    function Qd(a,b){var c;b?c=b.m:c=a.V++;const d=N$1(a.F);R(d,"SID",a.J);R(d,"RID",c);R(d,"AID",a.U);Kd(a,d);a.o&&a.s&&Gd(d,a.o,a.s);c=new M(a,a.h,c,a.C+1);null===a.o&&(c.H=a.s);b&&(a.l=b.D.concat(a.l));b=Pd(a,c,1E3);c.setTimeout(Math.round(.5*a.ra)+Math.round(.5*a.ra*Math.random()));Dc(a.i,c);ic$1(c,d,b);}function Kd(a,b){a.j&&Kc$1({},function(c,d){R(b,d,c);});}
    function Pd(a,b,c){c=Math.min(a.l.length,c);var d=a.j?q(a.j.Oa,a.j,a):null;a:{var e=a.l;let f=-1;for(;;){const h=["count="+c];-1==f?0<c?(f=e[0].h,h.push("ofs="+f)):f=0:h.push("ofs="+f);let n=!0;for(let u=0;u<c;u++){let m=e[u].h;const r=e[u].g;m-=f;if(0>m)f=Math.max(0,e[u].h-100),n=!1;else try{md(r,h,"req"+m+"_");}catch(G){d&&d(r);}}if(n){d=h.join("&");break a}}}a=a.l.splice(0,c);b.D=a;return d}function Gc$1(a){a.g||a.u||(a.Y=1,zb(a.Ga,a),a.A=0);}
    function Bc(a){if(a.g||a.u||3<=a.A)return !1;a.Y++;a.u=K$1(q(a.Ga,a),Od(a,a.A));a.A++;return !0}k$1.Ga=function(){this.u=null;Rd(this);if(this.$&&!(this.L||null==this.g||0>=this.O)){var a=2*this.O;this.h.info("BP detection timer enabled: "+a);this.B=K$1(q(this.bb,this),a);}};k$1.bb=function(){this.B&&(this.B=null,this.h.info("BP detection timeout reached."),this.h.info("Buffering proxy detected and switch to long-polling!"),this.N=!1,this.L=!0,J$1(10),Ac(this),Rd(this));};
    function wc$1(a){null!=a.B&&(l.clearTimeout(a.B),a.B=null);}function Rd(a){a.g=new M(a,a.h,"rpc",a.Y);null===a.o&&(a.g.H=a.s);a.g.O=0;var b=N$1(a.oa);R(b,"RID","rpc");R(b,"SID",a.J);R(b,"CI",a.N?"0":"1");R(b,"AID",a.U);Kd(a,b);R(b,"TYPE","xmlhttp");a.o&&a.s&&Gd(b,a.o,a.s);a.K&&a.g.setTimeout(a.K);var c=a.g;a=a.la;c.K=1;c.v=jc$1(N$1(b));c.s=null;c.U=!0;kc(c,a);}k$1.ab=function(){null!=this.v&&(this.v=null,Ac(this),Bc(this),J$1(19));};function zc$1(a){null!=a.v&&(l.clearTimeout(a.v),a.v=null);}
    function uc$1(a,b){var c=null;if(a.g==b){zc$1(a);wc$1(a);a.g=null;var d=2;}else if(yc(a.i,b))c=b.D,Fc(a.i,b),d=1;else return;a.I=b.N;if(0!=a.G)if(b.i)if(1==d){c=b.s?b.s.length:0;b=Date.now()-b.F;var e=a.C;d=Sb();D$1(d,new Vb(d,c,b,e));Hc$1(a);}else Gc$1(a);else if(e=b.o,3==e||0==e&&0<a.I||!(1==d&&Nd(a,b)||2==d&&Bc(a)))switch(c&&0<c.length&&(b=a.i,b.i=b.i.concat(c)),e){case 1:Q$1(a,5);break;case 4:Q$1(a,10);break;case 3:Q$1(a,6);break;default:Q$1(a,2);}}
    function Od(a,b){let c=a.Pa+Math.floor(Math.random()*a.$a);a.j||(c*=2);return c*b}function Q$1(a,b){a.h.info("Error code "+b);if(2==b){var c=null;a.j&&(c=null);var d=q(a.jb,a);c||(c=new U$1("//www.google.com/images/cleardot.gif"),l.location&&"http"==l.location.protocol||Oc(c,"https"),jc$1(c));nd(c.toString(),d);}else J$1(2);a.G=0;a.j&&a.j.va(b);Ld(a);Jd(a);}k$1.jb=function(a){a?(this.h.info("Successfully pinged google.com"),J$1(2)):(this.h.info("Failed to ping google.com"),J$1(1));};
    function Ld(a){a.G=0;a.I=-1;if(a.j){if(0!=jd(a.i).length||0!=a.l.length)a.i.i.length=0,ra$1(a.l),a.l.length=0;a.j.ua();}}function Ec(a,b,c){let d=ad(c);if(""!=d.i)b&&Pc$1(d,b+"."+d.i),Qc$1(d,d.m);else {const e=l.location;d=bd(e.protocol,b?b+"."+e.hostname:e.hostname,+e.port,c);}a.aa&&xa(a.aa,function(e,f){R(d,f,e);});b=a.D;c=a.sa;b&&c&&R(d,b,c);R(d,"VER",a.ma);Kd(a,d);return d}
    function nc$1(a,b,c){if(b&&!a.H)throw Error("Can't create secondary domain capable XhrIo object.");b=c&&a.Ba&&!a.qa?new X$1(new pd({ib:!0})):new X$1(a.qa);b.L=a.H;return b}function Sd(){}k$1=Sd.prototype;k$1.xa=function(){};k$1.wa=function(){};k$1.va=function(){};k$1.ua=function(){};k$1.Oa=function(){};function Td(){if(y&&!(10<=Number(Ua)))throw Error("Environmental error: no available transport.");}Td.prototype.g=function(a,b){return new Y$1(a,b)};
    function Y$1(a,b){C$1.call(this);this.g=new Id(b);this.l=a;this.h=b&&b.messageUrlParams||null;a=b&&b.messageHeaders||null;b&&b.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"});this.g.s=a;a=b&&b.initMessageHeaders||null;b&&b.messageContentType&&(a?a["X-WebChannel-Content-Type"]=b.messageContentType:a={"X-WebChannel-Content-Type":b.messageContentType});b&&b.ya&&(a?a["X-WebChannel-Client-Profile"]=b.ya:a={"X-WebChannel-Client-Profile":b.ya});this.g.P=
    a;(a=b&&b.httpHeadersOverwriteParam)&&!sa(a)&&(this.g.o=a);this.A=b&&b.supportsCrossDomainXhr||!1;this.v=b&&b.sendRawJson||!1;(b=b&&b.httpSessionIdParam)&&!sa(b)&&(this.g.D=b,a=this.h,null!==a&&b in a&&(a=this.h,b in a&&delete a[b]));this.j=new Z$1(this);}t(Y$1,C$1);Y$1.prototype.m=function(){this.g.j=this.j;this.A&&(this.g.H=!0);var a=this.g,b=this.l,c=this.h||void 0;a.Wa&&(a.h.info("Origin Trials enabled."),zb(q(a.hb,a,b)));J$1(0);a.W=b;a.aa=c||{};a.N=a.X;a.F=Ec(a,null,a.W);Hc$1(a);};Y$1.prototype.close=function(){Ic$1(this.g);};
    Y$1.prototype.u=function(a){if("string"===typeof a){var b={};b.__data__=a;Md(this.g,b);}else this.v?(b={},b.__data__=rb(a),Md(this.g,b)):Md(this.g,a);};Y$1.prototype.M=function(){this.g.j=null;delete this.j;Ic$1(this.g);delete this.g;Y$1.Z.M.call(this);};function Ud(a){ac.call(this);var b=a.__sm__;if(b){a:{for(const c in b){a=c;break a}a=void 0;}if(this.i=a)a=this.i,b=null!==b&&a in b?b[a]:void 0;this.data=b;}else this.data=a;}t(Ud,ac);function Vd(){bc.call(this);this.status=1;}t(Vd,bc);function Z$1(a){this.g=a;}
    t(Z$1,Sd);Z$1.prototype.xa=function(){D$1(this.g,"a");};Z$1.prototype.wa=function(a){D$1(this.g,new Ud(a));};Z$1.prototype.va=function(a){D$1(this.g,new Vd(a));};Z$1.prototype.ua=function(){D$1(this.g,"b");};/*

     Copyright 2017 Google LLC

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
    */
    Td.prototype.createWebChannel=Td.prototype.g;Y$1.prototype.send=Y$1.prototype.u;Y$1.prototype.open=Y$1.prototype.m;Y$1.prototype.close=Y$1.prototype.close;Wb.NO_ERROR=0;Wb.TIMEOUT=8;Wb.HTTP_ERROR=6;Xb.COMPLETE="complete";$b.EventType=L$1;L$1.OPEN="a";L$1.CLOSE="b";L$1.ERROR="c";L$1.MESSAGE="d";C$1.prototype.listen=C$1.prototype.N;X$1.prototype.listenOnce=X$1.prototype.O;X$1.prototype.getLastError=X$1.prototype.La;X$1.prototype.getLastErrorCode=X$1.prototype.Da;X$1.prototype.getStatus=X$1.prototype.ba;X$1.prototype.getResponseJson=X$1.prototype.Qa;
    X$1.prototype.getResponseText=X$1.prototype.ga;X$1.prototype.send=X$1.prototype.ea;var createWebChannelTransport = function(){return new Td};var getStatEventTarget = function(){return Sb()};var ErrorCode = Wb;var EventType = Xb;var Event = H;var Stat = {rb:0,ub:1,vb:2,Ob:3,Tb:4,Qb:5,Rb:6,Pb:7,Nb:8,Sb:9,PROXY:10,NOPROXY:11,Lb:12,Hb:13,Ib:14,Gb:15,Jb:16,Kb:17,nb:18,mb:19,ob:20};var FetchXmlHttpFactory = pd;var WebChannel = $b;
    var XhrIo = X$1;

    const D = "@firebase/firestore";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Simple wrapper around a nullable UID. Mostly exists to make code more
     * readable.
     */
    class C {
        constructor(t) {
            this.uid = t;
        }
        isAuthenticated() {
            return null != this.uid;
        }
        /**
         * Returns a key representing this user, suitable for inclusion in a
         * dictionary.
         */    toKey() {
            return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
        }
        isEqual(t) {
            return t.uid === this.uid;
        }
    }

    /** A user with a null UID. */ C.UNAUTHENTICATED = new C(null), 
    // TODO(mikelehen): Look into getting a proper uid-equivalent for
    // non-FirebaseAuth providers.
    C.GOOGLE_CREDENTIALS = new C("google-credentials-uid"), C.FIRST_PARTY = new C("first-party-uid"), 
    C.MOCK_USER = new C("mock-user");

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let x = "9.6.10";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const N = new Logger("@firebase/firestore");

    // Helper methods are needed because variables can't be exported as read/write
    function k() {
        return N.logLevel;
    }

    function O(t, ...e) {
        if (N.logLevel <= LogLevel.DEBUG) {
            const n = e.map(B);
            N.debug(`Firestore (${x}): ${t}`, ...n);
        }
    }

    function F(t, ...e) {
        if (N.logLevel <= LogLevel.ERROR) {
            const n = e.map(B);
            N.error(`Firestore (${x}): ${t}`, ...n);
        }
    }

    /**
     * @internal
     */ function $(t, ...e) {
        if (N.logLevel <= LogLevel.WARN) {
            const n = e.map(B);
            N.warn(`Firestore (${x}): ${t}`, ...n);
        }
    }

    /**
     * Converts an additional log parameter to a string representation.
     */ function B(t) {
        if ("string" == typeof t) return t;
        try {
            return e = t, JSON.stringify(e);
        } catch (e) {
            // Converting to JSON failed, just log the object directly
            return t;
        }
        /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /** Formats an object as a JSON string, suitable for logging. */
        var e;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Unconditionally fails, throwing an Error with the given message.
     * Messages are stripped in production builds.
     *
     * Returns `never` and can be used in expressions:
     * @example
     * let futureVar = fail('not implemented yet');
     */ function L(t = "Unexpected state") {
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
        const e = `FIRESTORE (${x}) INTERNAL ASSERTION FAILED: ` + t;
        // NOTE: We don't use FirestoreError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
        throw F(e), new Error(e);
    }

    /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * Messages are stripped in production builds.
     */ function U(t, e) {
        t || L();
    }

    /**
     * Casts `obj` to `T`. In non-production builds, verifies that `obj` is an
     * instance of `T` before casting.
     */ function G(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        return t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const K = {
        // Causes are copied from:
        // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
        /** Not an error; returned on success. */
        OK: "ok",
        /** The operation was cancelled (typically by the caller). */
        CANCELLED: "cancelled",
        /** Unknown error or an error from a different error domain. */
        UNKNOWN: "unknown",
        /**
         * Client specified an invalid argument. Note that this differs from
         * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
         * problematic regardless of the state of the system (e.g., a malformed file
         * name).
         */
        INVALID_ARGUMENT: "invalid-argument",
        /**
         * Deadline expired before operation could complete. For operations that
         * change the state of the system, this error may be returned even if the
         * operation has completed successfully. For example, a successful response
         * from a server could have been delayed long enough for the deadline to
         * expire.
         */
        DEADLINE_EXCEEDED: "deadline-exceeded",
        /** Some requested entity (e.g., file or directory) was not found. */
        NOT_FOUND: "not-found",
        /**
         * Some entity that we attempted to create (e.g., file or directory) already
         * exists.
         */
        ALREADY_EXISTS: "already-exists",
        /**
         * The caller does not have permission to execute the specified operation.
         * PERMISSION_DENIED must not be used for rejections caused by exhausting
         * some resource (use RESOURCE_EXHAUSTED instead for those errors).
         * PERMISSION_DENIED must not be used if the caller can not be identified
         * (use UNAUTHENTICATED instead for those errors).
         */
        PERMISSION_DENIED: "permission-denied",
        /**
         * The request does not have valid authentication credentials for the
         * operation.
         */
        UNAUTHENTICATED: "unauthenticated",
        /**
         * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
         * entire file system is out of space.
         */
        RESOURCE_EXHAUSTED: "resource-exhausted",
        /**
         * Operation was rejected because the system is not in a state required for
         * the operation's execution. For example, directory to be deleted may be
         * non-empty, an rmdir operation is applied to a non-directory, etc.
         *
         * A litmus test that may help a service implementor in deciding
         * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
         *  (a) Use UNAVAILABLE if the client can retry just the failing call.
         *  (b) Use ABORTED if the client should retry at a higher-level
         *      (e.g., restarting a read-modify-write sequence).
         *  (c) Use FAILED_PRECONDITION if the client should not retry until
         *      the system state has been explicitly fixed. E.g., if an "rmdir"
         *      fails because the directory is non-empty, FAILED_PRECONDITION
         *      should be returned since the client should not retry unless
         *      they have first fixed up the directory by deleting files from it.
         *  (d) Use FAILED_PRECONDITION if the client performs conditional
         *      REST Get/Update/Delete on a resource and the resource on the
         *      server does not match the condition. E.g., conflicting
         *      read-modify-write on the same resource.
         */
        FAILED_PRECONDITION: "failed-precondition",
        /**
         * The operation was aborted, typically due to a concurrency issue like
         * sequencer check failures, transaction aborts, etc.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        ABORTED: "aborted",
        /**
         * Operation was attempted past the valid range. E.g., seeking or reading
         * past end of file.
         *
         * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
         * if the system state changes. For example, a 32-bit file system will
         * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
         * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
         * an offset past the current file size.
         *
         * There is a fair bit of overlap between FAILED_PRECONDITION and
         * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
         * when it applies so that callers who are iterating through a space can
         * easily look for an OUT_OF_RANGE error to detect when they are done.
         */
        OUT_OF_RANGE: "out-of-range",
        /** Operation is not implemented or not supported/enabled in this service. */
        UNIMPLEMENTED: "unimplemented",
        /**
         * Internal errors. Means some invariants expected by underlying System has
         * been broken. If you see one of these errors, Something is very broken.
         */
        INTERNAL: "internal",
        /**
         * The service is currently unavailable. This is a most likely a transient
         * condition and may be corrected by retrying with a backoff.
         *
         * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
         * and UNAVAILABLE.
         */
        UNAVAILABLE: "unavailable",
        /** Unrecoverable data loss or corruption. */
        DATA_LOSS: "data-loss"
    };

    /** An error returned by a Firestore operation. */ class Q extends FirebaseError {
        /** @hideconstructor */
        constructor(
        /**
         * The backend error code associated with this error.
         */
        t, 
        /**
         * A custom error description.
         */
        e) {
            super(t, e), this.code = t, this.message = e, 
            // HACK: We write a toString property directly because Error is not a real
            // class and so inheritance does not work correctly. We could alternatively
            // do the same "back-door inheritance" trick that FirebaseError does.
            this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class j {
        constructor() {
            this.promise = new Promise(((t, e) => {
                this.resolve = t, this.reject = e;
            }));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class W {
        constructor(t, e) {
            this.user = e, this.type = "OAuth", this.headers = new Map, this.headers.set("Authorization", `Bearer ${t}`);
        }
    }

    /**
     * A CredentialsProvider that always yields an empty token.
     * @internal
     */ class z {
        getToken() {
            return Promise.resolve(null);
        }
        invalidateToken() {}
        start(t, e) {
            // Fire with initial user.
            t.enqueueRetryable((() => e(C.UNAUTHENTICATED)));
        }
        shutdown() {}
    }

    class J {
        constructor(t) {
            this.t = t, 
            /** Tracks the current User. */
            this.currentUser = C.UNAUTHENTICATED, 
            /**
             * Counter used to detect if the token changed while a getToken request was
             * outstanding.
             */
            this.i = 0, this.forceRefresh = !1, this.auth = null;
        }
        start(t, e) {
            let n = this.i;
            // A change listener that prevents double-firing for the same token change.
                    const s = t => this.i !== n ? (n = this.i, e(t)) : Promise.resolve();
            // A promise that can be waited on to block on the next token change.
            // This promise is re-created after each change.
                    let i = new j;
            this.o = () => {
                this.i++, this.currentUser = this.u(), i.resolve(), i = new j, t.enqueueRetryable((() => s(this.currentUser)));
            };
            const r = () => {
                const e = i;
                t.enqueueRetryable((async () => {
                    await e.promise, await s(this.currentUser);
                }));
            }, o = t => {
                O("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = t, this.auth.addAuthTokenListener(this.o), 
                r();
            };
            this.t.onInit((t => o(t))), 
            // Our users can initialize Auth right after Firestore, so we give it
            // a chance to register itself with the component framework before we
            // determine whether to start up in unauthenticated mode.
            setTimeout((() => {
                if (!this.auth) {
                    const t = this.t.getImmediate({
                        optional: !0
                    });
                    t ? o(t) : (
                    // If auth is still not available, proceed with `null` user
                    O("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new j);
                }
            }), 0), r();
        }
        getToken() {
            // Take note of the current value of the tokenCounter so that this method
            // can fail (with an ABORTED error) if there is a token change while the
            // request is outstanding.
            const t = this.i, e = this.forceRefresh;
            return this.forceRefresh = !1, this.auth ? this.auth.getToken(e).then((e => 
            // Cancel the request since the token changed while the request was
            // outstanding so the response is potentially for a previous user (which
            // user, we can't be sure).
            this.i !== t ? (O("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), 
            this.getToken()) : e ? (U("string" == typeof e.accessToken), new W(e.accessToken, this.currentUser)) : null)) : Promise.resolve(null);
        }
        invalidateToken() {
            this.forceRefresh = !0;
        }
        shutdown() {
            this.auth && this.auth.removeAuthTokenListener(this.o);
        }
        // Auth.getUid() can return null even with a user logged in. It is because
        // getUid() is synchronous, but the auth code populating Uid is asynchronous.
        // This method should only be called in the AuthTokenListener callback
        // to guarantee to get the actual user.
        u() {
            const t = this.auth && this.auth.getUid();
            return U(null === t || "string" == typeof t), new C(t);
        }
    }

    /*
     * FirstPartyToken provides a fresh token each time its value
     * is requested, because if the token is too old, requests will be rejected.
     * Technically this may no longer be necessary since the SDK should gracefully
     * recover from unauthenticated errors (see b/33147818 for context), but it's
     * safer to keep the implementation as-is.
     */ class Y {
        constructor(t, e, n) {
            this.type = "FirstParty", this.user = C.FIRST_PARTY, this.headers = new Map, this.headers.set("X-Goog-AuthUser", e);
            const s = t.auth.getAuthHeaderValueForFirstParty([]);
            s && this.headers.set("Authorization", s), n && this.headers.set("X-Goog-Iam-Authorization-Token", n);
        }
    }

    /*
     * Provides user credentials required for the Firestore JavaScript SDK
     * to authenticate the user, using technique that is only available
     * to applications hosted by Google.
     */ class X {
        constructor(t, e, n) {
            this.h = t, this.l = e, this.m = n;
        }
        getToken() {
            return Promise.resolve(new Y(this.h, this.l, this.m));
        }
        start(t, e) {
            // Fire with initial uid.
            t.enqueueRetryable((() => e(C.FIRST_PARTY)));
        }
        shutdown() {}
        invalidateToken() {}
    }

    class Z {
        constructor(t) {
            this.value = t, this.type = "AppCheck", this.headers = new Map, t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
        }
    }

    class tt {
        constructor(t) {
            this.g = t, this.forceRefresh = !1, this.appCheck = null, this.p = null;
        }
        start(t, e) {
            const n = t => {
                null != t.error && O("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`);
                const n = t.token !== this.p;
                return this.p = t.token, O("FirebaseAppCheckTokenProvider", `Received ${n ? "new" : "existing"} token.`), 
                n ? e(t.token) : Promise.resolve();
            };
            this.o = e => {
                t.enqueueRetryable((() => n(e)));
            };
            const s = t => {
                O("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = t, this.appCheck.addTokenListener(this.o);
            };
            this.g.onInit((t => s(t))), 
            // Our users can initialize AppCheck after Firestore, so we give it
            // a chance to register itself with the component framework.
            setTimeout((() => {
                if (!this.appCheck) {
                    const t = this.g.getImmediate({
                        optional: !0
                    });
                    t ? s(t) : 
                    // If AppCheck is still not available, proceed without it.
                    O("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
                }
            }), 0);
        }
        getToken() {
            const t = this.forceRefresh;
            return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(t).then((t => t ? (U("string" == typeof t.token), 
            this.p = t.token, new Z(t.token)) : null)) : Promise.resolve(null);
        }
        invalidateToken() {
            this.forceRefresh = !0;
        }
        shutdown() {
            this.appCheck && this.appCheck.removeTokenListener(this.o);
        }
    }

    /**
     * Builds a CredentialsProvider depending on the type of
     * the credentials passed in.
     */
    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * `ListenSequence` is a monotonic sequence. It is initialized with a minimum value to
     * exceed. All subsequent calls to next will return increasing values. If provided with a
     * `SequenceNumberSyncer`, it will additionally bump its next value when told of a new value, as
     * well as write out sequence numbers that it produces via `next()`.
     */
    class nt {
        constructor(t, e) {
            this.previousValue = t, e && (e.sequenceNumberHandler = t => this.I(t), this.T = t => e.writeSequenceNumber(t));
        }
        I(t) {
            return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
        }
        next() {
            const t = ++this.previousValue;
            return this.T && this.T(t), t;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Generates `nBytes` of random bytes.
     *
     * If `nBytes < 0` , an error will be thrown.
     */
    function st(t) {
        // Polyfills for IE and WebWorker by using `self` and `msCrypto` when `crypto` is not available.
        const e = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "undefined" != typeof self && (self.crypto || self.msCrypto), n = new Uint8Array(t);
        if (e && "function" == typeof e.getRandomValues) e.getRandomValues(n); else 
        // Falls back to Math.random
        for (let e = 0; e < t; e++) n[e] = Math.floor(256 * Math.random());
        return n;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ nt.A = -1;

    class it {
        static R() {
            // Alphanumeric characters
            const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
            // The largest byte value that is a multiple of `char.length`.
                    let n = "";
            for (;n.length < 20; ) {
                const s = st(40);
                for (let i = 0; i < s.length; ++i) 
                // Only accept values that are [0, maxMultiple), this ensures they can
                // be evenly mapped to indices of `chars` via a modulo operation.
                n.length < 20 && s[i] < e && (n += t.charAt(s[i] % t.length));
            }
            return n;
        }
    }

    function rt(t, e) {
        return t < e ? -1 : t > e ? 1 : 0;
    }

    /** Helper to compare arrays using isEqual(). */ function ot(t, e, n) {
        return t.length === e.length && t.every(((t, s) => n(t, e[s])));
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The earliest date supported by Firestore timestamps (0001-01-01T00:00:00Z).
    /**
     * A `Timestamp` represents a point in time independent of any time zone or
     * calendar, represented as seconds and fractions of seconds at nanosecond
     * resolution in UTC Epoch time.
     *
     * It is encoded using the Proleptic Gregorian Calendar which extends the
     * Gregorian calendar backwards to year one. It is encoded assuming all minutes
     * are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second
     * table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
     * 9999-12-31T23:59:59.999999999Z.
     *
     * For examples and further specifications, refer to the
     * {@link https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto | Timestamp definition}.
     */
    class at {
        /**
         * Creates a new timestamp.
         *
         * @param seconds - The number of seconds of UTC time since Unix epoch
         *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
         *     9999-12-31T23:59:59Z inclusive.
         * @param nanoseconds - The non-negative fractions of a second at nanosecond
         *     resolution. Negative second values with fractions must still have
         *     non-negative nanoseconds values that count forward in time. Must be
         *     from 0 to 999,999,999 inclusive.
         */
        constructor(
        /**
         * The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
         */
        t, 
        /**
         * The fractions of a second at nanosecond resolution.*
         */
        e) {
            if (this.seconds = t, this.nanoseconds = e, e < 0) throw new Q(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (e >= 1e9) throw new Q(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
            if (t < -62135596800) throw new Q(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
            // This will break in the year 10,000.
                    if (t >= 253402300800) throw new Q(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
        }
        /**
         * Creates a new timestamp with the current date, with millisecond precision.
         *
         * @returns a new timestamp representing the current date.
         */    static now() {
            return at.fromMillis(Date.now());
        }
        /**
         * Creates a new timestamp from the given date.
         *
         * @param date - The date to initialize the `Timestamp` from.
         * @returns A new `Timestamp` representing the same point in time as the given
         *     date.
         */    static fromDate(t) {
            return at.fromMillis(t.getTime());
        }
        /**
         * Creates a new timestamp from the given number of milliseconds.
         *
         * @param milliseconds - Number of milliseconds since Unix epoch
         *     1970-01-01T00:00:00Z.
         * @returns A new `Timestamp` representing the same point in time as the given
         *     number of milliseconds.
         */    static fromMillis(t) {
            const e = Math.floor(t / 1e3), n = Math.floor(1e6 * (t - 1e3 * e));
            return new at(e, n);
        }
        /**
         * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
         * causes a loss of precision since `Date` objects only support millisecond
         * precision.
         *
         * @returns JavaScript `Date` object representing the same point in time as
         *     this `Timestamp`, with millisecond precision.
         */    toDate() {
            return new Date(this.toMillis());
        }
        /**
         * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
         * epoch). This operation causes a loss of precision.
         *
         * @returns The point in time corresponding to this timestamp, represented as
         *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
         */    toMillis() {
            return 1e3 * this.seconds + this.nanoseconds / 1e6;
        }
        _compareTo(t) {
            return this.seconds === t.seconds ? rt(this.nanoseconds, t.nanoseconds) : rt(this.seconds, t.seconds);
        }
        /**
         * Returns true if this `Timestamp` is equal to the provided one.
         *
         * @param other - The `Timestamp` to compare against.
         * @returns true if this `Timestamp` is equal to the provided one.
         */    isEqual(t) {
            return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
        }
        /** Returns a textual representation of this `Timestamp`. */    toString() {
            return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
        }
        /** Returns a JSON-serializable representation of this `Timestamp`. */    toJSON() {
            return {
                seconds: this.seconds,
                nanoseconds: this.nanoseconds
            };
        }
        /**
         * Converts this object to a primitive string, which allows `Timestamp` objects
         * to be compared using the `>`, `<=`, `>=` and `>` operators.
         */    valueOf() {
            // This method returns a string of the form <seconds>.<nanoseconds> where
            // <seconds> is translated to have a non-negative value and both <seconds>
            // and <nanoseconds> are left-padded with zeroes to be a consistent length.
            // Strings with this format then have a lexiographical ordering that matches
            // the expected ordering. The <seconds> translation is done to avoid having
            // a leading negative sign (i.e. a leading '-' character) in its string
            // representation, which would affect its lexiographical ordering.
            const t = this.seconds - -62135596800;
            // Note: Up to 12 decimal digits are required to represent all valid
            // 'seconds' values.
                    return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A version of a document in Firestore. This corresponds to the version
     * timestamp, such as update_time or read_time.
     */ class ct {
        constructor(t) {
            this.timestamp = t;
        }
        static fromTimestamp(t) {
            return new ct(t);
        }
        static min() {
            return new ct(new at(0, 0));
        }
        static max() {
            return new ct(new at(253402300799, 999999999));
        }
        compareTo(t) {
            return this.timestamp._compareTo(t.timestamp);
        }
        isEqual(t) {
            return this.timestamp.isEqual(t.timestamp);
        }
        /** Returns a number representation of the version for use in spec tests. */    toMicroseconds() {
            // Convert to microseconds.
            return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
        }
        toString() {
            return "SnapshotVersion(" + this.timestamp.toString() + ")";
        }
        toTimestamp() {
            return this.timestamp;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function ht(t) {
        let e = 0;
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
        return e;
    }

    function lt(t, e) {
        for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
    }

    function ft(t) {
        for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
        return !0;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Path represents an ordered sequence of string segments.
     */
    class dt {
        constructor(t, e, n) {
            void 0 === e ? e = 0 : e > t.length && L(), void 0 === n ? n = t.length - e : n > t.length - e && L(), 
            this.segments = t, this.offset = e, this.len = n;
        }
        get length() {
            return this.len;
        }
        isEqual(t) {
            return 0 === dt.comparator(this, t);
        }
        child(t) {
            const e = this.segments.slice(this.offset, this.limit());
            return t instanceof dt ? t.forEach((t => {
                e.push(t);
            })) : e.push(t), this.construct(e);
        }
        /** The index of one past the last segment of the path. */    limit() {
            return this.offset + this.length;
        }
        popFirst(t) {
            return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
        }
        popLast() {
            return this.construct(this.segments, this.offset, this.length - 1);
        }
        firstSegment() {
            return this.segments[this.offset];
        }
        lastSegment() {
            return this.get(this.length - 1);
        }
        get(t) {
            return this.segments[this.offset + t];
        }
        isEmpty() {
            return 0 === this.length;
        }
        isPrefixOf(t) {
            if (t.length < this.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        isImmediateParentOf(t) {
            if (this.length + 1 !== t.length) return !1;
            for (let e = 0; e < this.length; e++) if (this.get(e) !== t.get(e)) return !1;
            return !0;
        }
        forEach(t) {
            for (let e = this.offset, n = this.limit(); e < n; e++) t(this.segments[e]);
        }
        toArray() {
            return this.segments.slice(this.offset, this.limit());
        }
        static comparator(t, e) {
            const n = Math.min(t.length, e.length);
            for (let s = 0; s < n; s++) {
                const n = t.get(s), i = e.get(s);
                if (n < i) return -1;
                if (n > i) return 1;
            }
            return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
        }
    }

    /**
     * A slash-separated path for navigating resources (documents and collections)
     * within Firestore.
     *
     * @internal
     */ class _t extends dt {
        construct(t, e, n) {
            return new _t(t, e, n);
        }
        canonicalString() {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            return this.toArray().join("/");
        }
        toString() {
            return this.canonicalString();
        }
        /**
         * Creates a resource path from the given slash-delimited string. If multiple
         * arguments are provided, all components are combined. Leading and trailing
         * slashes from all components are ignored.
         */    static fromString(...t) {
            // NOTE: The client is ignorant of any path segments containing escape
            // sequences (e.g. __id123__) and just passes them through raw (they exist
            // for legacy reasons and should not be used frequently).
            const e = [];
            for (const n of t) {
                if (n.indexOf("//") >= 0) throw new Q(K.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
                // Strip leading and traling slashed.
                            e.push(...n.split("/").filter((t => t.length > 0)));
            }
            return new _t(e);
        }
        static emptyPath() {
            return new _t([]);
        }
    }

    const wt = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

    /**
     * A dot-separated path for navigating sub-objects within a document.
     * @internal
     */ class mt extends dt {
        construct(t, e, n) {
            return new mt(t, e, n);
        }
        /**
         * Returns true if the string could be used as a segment in a field path
         * without escaping.
         */    static isValidIdentifier(t) {
            return wt.test(t);
        }
        canonicalString() {
            return this.toArray().map((t => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), 
            mt.isValidIdentifier(t) || (t = "`" + t + "`"), t))).join(".");
        }
        toString() {
            return this.canonicalString();
        }
        /**
         * Returns true if this field references the key of a document.
         */    isKeyField() {
            return 1 === this.length && "__name__" === this.get(0);
        }
        /**
         * The field designating the key of a document.
         */    static keyField() {
            return new mt([ "__name__" ]);
        }
        /**
         * Parses a field string from the given server-formatted string.
         *
         * - Splitting the empty string is not allowed (for now at least).
         * - Empty segments within the string (e.g. if there are two consecutive
         *   separators) are not allowed.
         *
         * TODO(b/37244157): we should make this more strict. Right now, it allows
         * non-identifier path components, even if they aren't escaped.
         */    static fromServerFormat(t) {
            const e = [];
            let n = "", s = 0;
            const i = () => {
                if (0 === n.length) throw new Q(K.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
                e.push(n), n = "";
            };
            let r = !1;
            for (;s < t.length; ) {
                const e = t[s];
                if ("\\" === e) {
                    if (s + 1 === t.length) throw new Q(K.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
                    const e = t[s + 1];
                    if ("\\" !== e && "." !== e && "`" !== e) throw new Q(K.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
                    n += e, s += 2;
                } else "`" === e ? (r = !r, s++) : "." !== e || r ? (n += e, s++) : (i(), s++);
            }
            if (i(), r) throw new Q(K.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
            return new mt(e);
        }
        static emptyPath() {
            return new mt([]);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a set of fields that can be used to partially patch a document.
     * FieldMask is used in conjunction with ObjectValue.
     * Examples:
     *   foo - Overwrites foo entirely with the provided value. If foo is not
     *         present in the companion ObjectValue, the field is deleted.
     *   foo.bar - Overwrites only the field bar of the object foo.
     *             If foo is not an object, foo is replaced with an object
     *             containing foo
     */ class gt {
        constructor(t) {
            this.fields = t, 
            // TODO(dimond): validation of FieldMask
            // Sort the field mask to support `FieldMask.isEqual()` and assert below.
            t.sort(mt.comparator);
        }
        /**
         * Verifies that `fieldPath` is included by at least one field in this field
         * mask.
         *
         * This is an O(n) operation, where `n` is the size of the field mask.
         */    covers(t) {
            for (const e of this.fields) if (e.isPrefixOf(t)) return !0;
            return !1;
        }
        isEqual(t) {
            return ot(this.fields, t.fields, ((t, e) => t.isEqual(e)));
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Immutable class that represents a "proto" byte string.
     *
     * Proto byte strings can either be Base64-encoded strings or Uint8Arrays when
     * sent on the wire. This class abstracts away this differentiation by holding
     * the proto byte string in a common class that must be converted into a string
     * before being sent as a proto.
     * @internal
     */ class pt {
        constructor(t) {
            this.binaryString = t;
        }
        static fromBase64String(t) {
            const e = atob(t);
            return new pt(e);
        }
        static fromUint8Array(t) {
            // TODO(indexing); Remove the copy of the byte string here as this method
            // is frequently called during indexing.
            const e = 
            /**
     * Helper function to convert an Uint8array to a binary string.
     */
            function(t) {
                let e = "";
                for (let n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
                return e;
            }
            /**
     * Helper function to convert a binary string to an Uint8Array.
     */ (t);
            return new pt(e);
        }
        [Symbol.iterator]() {
            let t = 0;
            return {
                next: () => t < this.binaryString.length ? {
                    value: this.binaryString.charCodeAt(t++),
                    done: !1
                } : {
                    value: void 0,
                    done: !0
                }
            };
        }
        toBase64() {
            return t = this.binaryString, btoa(t);
            /** Converts a binary string to a Base64 encoded string. */
            var t;
        }
        toUint8Array() {
            return function(t) {
                const e = new Uint8Array(t.length);
                for (let n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
                return e;
            }
            /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
            // A RegExp matching ISO 8601 UTC timestamps with optional fraction.
            (this.binaryString);
        }
        approximateByteSize() {
            return 2 * this.binaryString.length;
        }
        compareTo(t) {
            return rt(this.binaryString, t.binaryString);
        }
        isEqual(t) {
            return this.binaryString === t.binaryString;
        }
    }

    pt.EMPTY_BYTE_STRING = new pt("");

    const It = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);

    /**
     * Converts the possible Proto values for a timestamp value into a "seconds and
     * nanos" representation.
     */ function Tt(t) {
        // The json interface (for the browser) will return an iso timestamp string,
        // while the proto js library (for node) will return a
        // google.protobuf.Timestamp instance.
        if (U(!!t), "string" == typeof t) {
            // The date string can have higher precision (nanos) than the Date class
            // (millis), so we do some custom parsing here.
            // Parse the nanos right out of the string.
            let e = 0;
            const n = It.exec(t);
            if (U(!!n), n[1]) {
                // Pad the fraction out to 9 digits (nanos).
                let t = n[1];
                t = (t + "000000000").substr(0, 9), e = Number(t);
            }
            // Parse the date to get the seconds.
                    const s = new Date(t);
            return {
                seconds: Math.floor(s.getTime() / 1e3),
                nanos: e
            };
        }
        return {
            seconds: Et(t.seconds),
            nanos: Et(t.nanos)
        };
    }

    /**
     * Converts the possible Proto types for numbers into a JavaScript number.
     * Returns 0 if the value is not numeric.
     */ function Et(t) {
        // TODO(bjornick): Handle int64 greater than 53 bits.
        return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
    }

    /** Converts the possible Proto types for Blobs into a ByteString. */ function At(t) {
        return "string" == typeof t ? pt.fromBase64String(t) : pt.fromUint8Array(t);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a locally-applied ServerTimestamp.
     *
     * Server Timestamps are backed by MapValues that contain an internal field
     * `__type__` with a value of `server_timestamp`. The previous value and local
     * write time are stored in its `__previous_value__` and `__local_write_time__`
     * fields respectively.
     *
     * Notes:
     * - ServerTimestampValue instances are created as the result of applying a
     *   transform. They can only exist in the local view of a document. Therefore
     *   they do not need to be parsed or serialized.
     * - When evaluated locally (e.g. for snapshot.data()), they by default
     *   evaluate to `null`. This behavior can be configured by passing custom
     *   FieldValueOptions to value().
     * - With respect to other ServerTimestampValues, they sort by their
     *   localWriteTime.
     */ function Rt(t) {
        var e, n;
        return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
    }

    /**
     * Creates a new ServerTimestamp proto value (using the internal format).
     */
    /**
     * Returns the value of the field before this ServerTimestamp was set.
     *
     * Preserving the previous values allows the user to display the last resoled
     * value until the backend responds with the timestamp.
     */
    function bt(t) {
        const e = t.mapValue.fields.__previous_value__;
        return Rt(e) ? bt(e) : e;
    }

    /**
     * Returns the local time at which this timestamp was first set.
     */ function Pt(t) {
        const e = Tt(t.mapValue.fields.__local_write_time__.timestampValue);
        return new at(e.seconds, e.nanos);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Vt {
        /**
         * Constructs a DatabaseInfo using the provided host, databaseId and
         * persistenceKey.
         *
         * @param databaseId - The database to use.
         * @param appId - The Firebase App Id.
         * @param persistenceKey - A unique identifier for this Firestore's local
         * storage (used in conjunction with the databaseId).
         * @param host - The Firestore backend host to connect to.
         * @param ssl - Whether to use SSL when connecting.
         * @param forceLongPolling - Whether to use the forceLongPolling option
         * when using WebChannel as the network transport.
         * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
         * option when using WebChannel as the network transport.
         * @param useFetchStreams Whether to use the Fetch API instead of
         * XMLHTTPRequest
         */
        constructor(t, e, n, s, i, r, o, u) {
            this.databaseId = t, this.appId = e, this.persistenceKey = n, this.host = s, this.ssl = i, 
            this.forceLongPolling = r, this.autoDetectLongPolling = o, this.useFetchStreams = u;
        }
    }

    /** The default database name for a project. */
    /**
     * Represents the database ID a Firestore client is associated with.
     * @internal
     */
    class vt {
        constructor(t, e) {
            this.projectId = t, this.database = e || "(default)";
        }
        static empty() {
            return new vt("", "");
        }
        get isDefaultDatabase() {
            return "(default)" === this.database;
        }
        isEqual(t) {
            return t instanceof vt && t.projectId === this.projectId && t.database === this.database;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Sentinel value that sorts before any Mutation Batch ID. */
    /**
     * Returns whether a variable is either undefined or null.
     */
    function St(t) {
        return null == t;
    }

    /** Returns whether the value represents -0. */ function Dt(t) {
        // Detect if the value is -0.0. Based on polyfill from
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        return 0 === t && 1 / t == -1 / 0;
    }

    /**
     * Returns whether a value is an integer and in the safe integer range
     * @param value - The value to test for being an integer and in the safe range
     */ function Ct(t) {
        return "number" == typeof t && Number.isInteger(t) && !Dt(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @internal
     */ class xt {
        constructor(t) {
            this.path = t;
        }
        static fromPath(t) {
            return new xt(_t.fromString(t));
        }
        static fromName(t) {
            return new xt(_t.fromString(t).popFirst(5));
        }
        static empty() {
            return new xt(_t.emptyPath());
        }
        get collectionGroup() {
            return this.path.popLast().lastSegment();
        }
        /** Returns true if the document is in the specified collectionId. */    hasCollectionId(t) {
            return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
        }
        /** Returns the collection group (i.e. the name of the parent collection) for this key. */    getCollectionGroup() {
            return this.path.get(this.path.length - 2);
        }
        /** Returns the fully qualified path to the parent collection. */    getCollectionPath() {
            return this.path.popLast();
        }
        isEqual(t) {
            return null !== t && 0 === _t.comparator(this.path, t.path);
        }
        toString() {
            return this.path.toString();
        }
        static comparator(t, e) {
            return _t.comparator(t.path, e.path);
        }
        static isDocumentKey(t) {
            return t.length % 2 == 0;
        }
        /**
         * Creates and returns a new document key with the given segments.
         *
         * @param segments - The segments of the path to the document
         * @returns A new instance of DocumentKey
         */    static fromSegments(t) {
            return new xt(new _t(t.slice()));
        }
    }

    /** Extracts the backend's type order for the provided value. */
    function Mt(t) {
        return "nullValue" in t ? 0 /* NullValue */ : "booleanValue" in t ? 1 /* BooleanValue */ : "integerValue" in t || "doubleValue" in t ? 2 /* NumberValue */ : "timestampValue" in t ? 3 /* TimestampValue */ : "stringValue" in t ? 5 /* StringValue */ : "bytesValue" in t ? 6 /* BlobValue */ : "referenceValue" in t ? 7 /* RefValue */ : "geoPointValue" in t ? 8 /* GeoPointValue */ : "arrayValue" in t ? 9 /* ArrayValue */ : "mapValue" in t ? Rt(t) ? 4 /* ServerTimestampValue */ : Ht(t) ? 9 /* ArrayValue */ : 10 /* ObjectValue */ : L();
    }

    /** Tests `left` and `right` for equality based on the backend semantics. */ function Ot(t, e) {
        if (t === e) return !0;
        const n = Mt(t);
        if (n !== Mt(e)) return !1;
        switch (n) {
          case 0 /* NullValue */ :
          case 9007199254740991 /* MaxValue */ :
            return !0;

          case 1 /* BooleanValue */ :
            return t.booleanValue === e.booleanValue;

          case 4 /* ServerTimestampValue */ :
            return Pt(t).isEqual(Pt(e));

          case 3 /* TimestampValue */ :
            return function(t, e) {
                if ("string" == typeof t.timestampValue && "string" == typeof e.timestampValue && t.timestampValue.length === e.timestampValue.length) 
                // Use string equality for ISO 8601 timestamps
                return t.timestampValue === e.timestampValue;
                const n = Tt(t.timestampValue), s = Tt(e.timestampValue);
                return n.seconds === s.seconds && n.nanos === s.nanos;
            }(t, e);

          case 5 /* StringValue */ :
            return t.stringValue === e.stringValue;

          case 6 /* BlobValue */ :
            return function(t, e) {
                return At(t.bytesValue).isEqual(At(e.bytesValue));
            }(t, e);

          case 7 /* RefValue */ :
            return t.referenceValue === e.referenceValue;

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                return Et(t.geoPointValue.latitude) === Et(e.geoPointValue.latitude) && Et(t.geoPointValue.longitude) === Et(e.geoPointValue.longitude);
            }(t, e);

          case 2 /* NumberValue */ :
            return function(t, e) {
                if ("integerValue" in t && "integerValue" in e) return Et(t.integerValue) === Et(e.integerValue);
                if ("doubleValue" in t && "doubleValue" in e) {
                    const n = Et(t.doubleValue), s = Et(e.doubleValue);
                    return n === s ? Dt(n) === Dt(s) : isNaN(n) && isNaN(s);
                }
                return !1;
            }(t, e);

          case 9 /* ArrayValue */ :
            return ot(t.arrayValue.values || [], e.arrayValue.values || [], Ot);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.mapValue.fields || {}, s = e.mapValue.fields || {};
                if (ht(n) !== ht(s)) return !1;
                for (const t in n) if (n.hasOwnProperty(t) && (void 0 === s[t] || !Ot(n[t], s[t]))) return !1;
                return !0;
            }
            /** Returns true if the ArrayValue contains the specified element. */ (t, e);

          default:
            return L();
        }
    }

    function Ft(t, e) {
        return void 0 !== (t.values || []).find((t => Ot(t, e)));
    }

    function $t(t, e) {
        if (t === e) return 0;
        const n = Mt(t), s = Mt(e);
        if (n !== s) return rt(n, s);
        switch (n) {
          case 0 /* NullValue */ :
          case 9007199254740991 /* MaxValue */ :
            return 0;

          case 1 /* BooleanValue */ :
            return rt(t.booleanValue, e.booleanValue);

          case 2 /* NumberValue */ :
            return function(t, e) {
                const n = Et(t.integerValue || t.doubleValue), s = Et(e.integerValue || e.doubleValue);
                return n < s ? -1 : n > s ? 1 : n === s ? 0 : 
                // one or both are NaN.
                isNaN(n) ? isNaN(s) ? 0 : -1 : 1;
            }(t, e);

          case 3 /* TimestampValue */ :
            return Bt(t.timestampValue, e.timestampValue);

          case 4 /* ServerTimestampValue */ :
            return Bt(Pt(t), Pt(e));

          case 5 /* StringValue */ :
            return rt(t.stringValue, e.stringValue);

          case 6 /* BlobValue */ :
            return function(t, e) {
                const n = At(t), s = At(e);
                return n.compareTo(s);
            }(t.bytesValue, e.bytesValue);

          case 7 /* RefValue */ :
            return function(t, e) {
                const n = t.split("/"), s = e.split("/");
                for (let t = 0; t < n.length && t < s.length; t++) {
                    const e = rt(n[t], s[t]);
                    if (0 !== e) return e;
                }
                return rt(n.length, s.length);
            }(t.referenceValue, e.referenceValue);

          case 8 /* GeoPointValue */ :
            return function(t, e) {
                const n = rt(Et(t.latitude), Et(e.latitude));
                if (0 !== n) return n;
                return rt(Et(t.longitude), Et(e.longitude));
            }(t.geoPointValue, e.geoPointValue);

          case 9 /* ArrayValue */ :
            return function(t, e) {
                const n = t.values || [], s = e.values || [];
                for (let t = 0; t < n.length && t < s.length; ++t) {
                    const e = $t(n[t], s[t]);
                    if (e) return e;
                }
                return rt(n.length, s.length);
            }(t.arrayValue, e.arrayValue);

          case 10 /* ObjectValue */ :
            return function(t, e) {
                const n = t.fields || {}, s = Object.keys(n), i = e.fields || {}, r = Object.keys(i);
                // Even though MapValues are likely sorted correctly based on their insertion
                // order (e.g. when received from the backend), local modifications can bring
                // elements out of order. We need to re-sort the elements to ensure that
                // canonical IDs are independent of insertion order.
                s.sort(), r.sort();
                for (let t = 0; t < s.length && t < r.length; ++t) {
                    const e = rt(s[t], r[t]);
                    if (0 !== e) return e;
                    const o = $t(n[s[t]], i[r[t]]);
                    if (0 !== o) return o;
                }
                return rt(s.length, r.length);
            }
            /**
     * Generates the canonical ID for the provided field value (as used in Target
     * serialization).
     */ (t.mapValue, e.mapValue);

          default:
            throw L();
        }
    }

    function Bt(t, e) {
        if ("string" == typeof t && "string" == typeof e && t.length === e.length) return rt(t, e);
        const n = Tt(t), s = Tt(e), i = rt(n.seconds, s.seconds);
        return 0 !== i ? i : rt(n.nanos, s.nanos);
    }

    function Lt(t) {
        return Ut(t);
    }

    function Ut(t) {
        return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t) {
            const e = Tt(t);
            return `time(${e.seconds},${e.nanos})`;
        }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? At(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, 
        xt.fromName(n).toString()) : "geoPointValue" in t ? `geo(${(e = t.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t ? function(t) {
            let e = "[", n = !0;
            for (const s of t.values || []) n ? n = !1 : e += ",", e += Ut(s);
            return e + "]";
        }
        /** Returns a reference value for the provided database and key. */ (t.arrayValue) : "mapValue" in t ? function(t) {
            // Iteration order in JavaScript is not guaranteed. To ensure that we generate
            // matching canonical IDs for identical maps, we need to sort the keys.
            const e = Object.keys(t.fields || {}).sort();
            let n = "{", s = !0;
            for (const i of e) s ? s = !1 : n += ",", n += `${i}:${Ut(t.fields[i])}`;
            return n + "}";
        }(t.mapValue) : L();
        var e, n;
    }

    /** Returns true if `value` is an IntegerValue . */ function Gt(t) {
        return !!t && "integerValue" in t;
    }

    /** Returns true if `value` is a DoubleValue. */
    /** Returns true if `value` is an ArrayValue. */
    function Kt(t) {
        return !!t && "arrayValue" in t;
    }

    /** Returns true if `value` is a NullValue. */ function Qt(t) {
        return !!t && "nullValue" in t;
    }

    /** Returns true if `value` is NaN. */ function jt(t) {
        return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
    }

    /** Returns true if `value` is a MapValue. */ function Wt(t) {
        return !!t && "mapValue" in t;
    }

    /** Creates a deep copy of `source`. */ function zt(t) {
        if (t.geoPointValue) return {
            geoPointValue: Object.assign({}, t.geoPointValue)
        };
        if (t.timestampValue && "object" == typeof t.timestampValue) return {
            timestampValue: Object.assign({}, t.timestampValue)
        };
        if (t.mapValue) {
            const e = {
                mapValue: {
                    fields: {}
                }
            };
            return lt(t.mapValue.fields, ((t, n) => e.mapValue.fields[t] = zt(n))), e;
        }
        if (t.arrayValue) {
            const e = {
                arrayValue: {
                    values: []
                }
            };
            for (let n = 0; n < (t.arrayValue.values || []).length; ++n) e.arrayValue.values[n] = zt(t.arrayValue.values[n]);
            return e;
        }
        return Object.assign({}, t);
    }

    /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */ function Ht(t) {
        return "__max__" === (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An ObjectValue represents a MapValue in the Firestore Proto and offers the
     * ability to add and remove fields (via the ObjectValueBuilder).
     */ class Xt {
        constructor(t) {
            this.value = t;
        }
        static empty() {
            return new Xt({
                mapValue: {}
            });
        }
        /**
         * Returns the value at the given path or null.
         *
         * @param path - the path to search
         * @returns The value at the path or null if the path is not set.
         */    field(t) {
            if (t.isEmpty()) return this.value;
            {
                let e = this.value;
                for (let n = 0; n < t.length - 1; ++n) if (e = (e.mapValue.fields || {})[t.get(n)], 
                !Wt(e)) return null;
                return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
            }
        }
        /**
         * Sets the field to the provided value.
         *
         * @param path - The field path to set.
         * @param value - The value to set.
         */    set(t, e) {
            this.getFieldsMap(t.popLast())[t.lastSegment()] = zt(e);
        }
        /**
         * Sets the provided fields to the provided values.
         *
         * @param data - A map of fields to values (or null for deletes).
         */    setAll(t) {
            let e = mt.emptyPath(), n = {}, s = [];
            t.forEach(((t, i) => {
                if (!e.isImmediateParentOf(i)) {
                    // Insert the accumulated changes at this parent location
                    const t = this.getFieldsMap(e);
                    this.applyChanges(t, n, s), n = {}, s = [], e = i.popLast();
                }
                t ? n[i.lastSegment()] = zt(t) : s.push(i.lastSegment());
            }));
            const i = this.getFieldsMap(e);
            this.applyChanges(i, n, s);
        }
        /**
         * Removes the field at the specified path. If there is no field at the
         * specified path, nothing is changed.
         *
         * @param path - The field path to remove.
         */    delete(t) {
            const e = this.field(t.popLast());
            Wt(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
        }
        isEqual(t) {
            return Ot(this.value, t.value);
        }
        /**
         * Returns the map that contains the leaf element of `path`. If the parent
         * entry does not yet exist, or if it is not a map, a new map will be created.
         */    getFieldsMap(t) {
            let e = this.value;
            e.mapValue.fields || (e.mapValue = {
                fields: {}
            });
            for (let n = 0; n < t.length; ++n) {
                let s = e.mapValue.fields[t.get(n)];
                Wt(s) && s.mapValue.fields || (s = {
                    mapValue: {
                        fields: {}
                    }
                }, e.mapValue.fields[t.get(n)] = s), e = s;
            }
            return e.mapValue.fields;
        }
        /**
         * Modifies `fieldsMap` by adding, replacing or deleting the specified
         * entries.
         */    applyChanges(t, e, n) {
            lt(e, ((e, n) => t[e] = n));
            for (const e of n) delete t[e];
        }
        clone() {
            return new Xt(zt(this.value));
        }
    }

    /**
     * Returns a FieldMask built from all fields in a MapValue.
     */ function Zt(t) {
        const e = [];
        return lt(t.fields, ((t, n) => {
            const s = new mt([ t ]);
            if (Wt(n)) {
                const t = Zt(n.mapValue).fields;
                if (0 === t.length) 
                // Preserve the empty map by adding it to the FieldMask.
                e.push(s); else 
                // For nested and non-empty ObjectValues, add the FieldPath of the
                // leaf nodes.
                for (const n of t) e.push(s.child(n));
            } else 
            // For nested and non-empty ObjectValues, add the FieldPath of the leaf
            // nodes.
            e.push(s);
        })), new gt(e);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a document in Firestore with a key, version, data and whether it
     * has local mutations applied to it.
     *
     * Documents can transition between states via `convertToFoundDocument()`,
     * `convertToNoDocument()` and `convertToUnknownDocument()`. If a document does
     * not transition to one of these states even after all mutations have been
     * applied, `isValidDocument()` returns false and the document should be removed
     * from all views.
     */ class te {
        constructor(t, e, n, s, i, r) {
            this.key = t, this.documentType = e, this.version = n, this.readTime = s, this.data = i, 
            this.documentState = r;
        }
        /**
         * Creates a document with no known version or data, but which can serve as
         * base document for mutations.
         */    static newInvalidDocument(t) {
            return new te(t, 0 /* INVALID */ , ct.min(), ct.min(), Xt.empty(), 0 /* SYNCED */);
        }
        /**
         * Creates a new document that is known to exist with the given data at the
         * given version.
         */    static newFoundDocument(t, e, n) {
            return new te(t, 1 /* FOUND_DOCUMENT */ , e, ct.min(), n, 0 /* SYNCED */);
        }
        /** Creates a new document that is known to not exist at the given version. */    static newNoDocument(t, e) {
            return new te(t, 2 /* NO_DOCUMENT */ , e, ct.min(), Xt.empty(), 0 /* SYNCED */);
        }
        /**
         * Creates a new document that is known to exist at the given version but
         * whose data is not known (e.g. a document that was updated without a known
         * base document).
         */    static newUnknownDocument(t, e) {
            return new te(t, 3 /* UNKNOWN_DOCUMENT */ , e, ct.min(), Xt.empty(), 2 /* HAS_COMMITTED_MUTATIONS */);
        }
        /**
         * Changes the document type to indicate that it exists and that its version
         * and data are known.
         */    convertToFoundDocument(t, e) {
            return this.version = t, this.documentType = 1 /* FOUND_DOCUMENT */ , this.data = e, 
            this.documentState = 0 /* SYNCED */ , this;
        }
        /**
         * Changes the document type to indicate that it doesn't exist at the given
         * version.
         */    convertToNoDocument(t) {
            return this.version = t, this.documentType = 2 /* NO_DOCUMENT */ , this.data = Xt.empty(), 
            this.documentState = 0 /* SYNCED */ , this;
        }
        /**
         * Changes the document type to indicate that it exists at a given version but
         * that its data is not known (e.g. a document that was updated without a known
         * base document).
         */    convertToUnknownDocument(t) {
            return this.version = t, this.documentType = 3 /* UNKNOWN_DOCUMENT */ , this.data = Xt.empty(), 
            this.documentState = 2 /* HAS_COMMITTED_MUTATIONS */ , this;
        }
        setHasCommittedMutations() {
            return this.documentState = 2 /* HAS_COMMITTED_MUTATIONS */ , this;
        }
        setHasLocalMutations() {
            return this.documentState = 1 /* HAS_LOCAL_MUTATIONS */ , this;
        }
        setReadTime(t) {
            return this.readTime = t, this;
        }
        get hasLocalMutations() {
            return 1 /* HAS_LOCAL_MUTATIONS */ === this.documentState;
        }
        get hasCommittedMutations() {
            return 2 /* HAS_COMMITTED_MUTATIONS */ === this.documentState;
        }
        get hasPendingWrites() {
            return this.hasLocalMutations || this.hasCommittedMutations;
        }
        isValidDocument() {
            return 0 /* INVALID */ !== this.documentType;
        }
        isFoundDocument() {
            return 1 /* FOUND_DOCUMENT */ === this.documentType;
        }
        isNoDocument() {
            return 2 /* NO_DOCUMENT */ === this.documentType;
        }
        isUnknownDocument() {
            return 3 /* UNKNOWN_DOCUMENT */ === this.documentType;
        }
        isEqual(t) {
            return t instanceof te && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
        }
        mutableCopy() {
            return new te(this.key, this.documentType, this.version, this.readTime, this.data.clone(), this.documentState);
        }
        toString() {
            return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
        }
    }

    /**
     * Creates an offset that matches all documents with a read time higher than
     * `readTime`.
     */ function oe(t, e) {
        // We want to create an offset that matches all documents with a read time
        // greater than the provided read time. To do so, we technically need to
        // create an offset for `(readTime, MAX_DOCUMENT_KEY)`. While we could use
        // Unicode codepoints to generate MAX_DOCUMENT_KEY, it is much easier to use
        // `(readTime + 1, DocumentKey.empty())` since `> DocumentKey.empty()` matches
        // all valid document IDs.
        const n = t.toTimestamp().seconds, s = t.toTimestamp().nanoseconds + 1, i = ct.fromTimestamp(1e9 === s ? new at(n + 1, 0) : new at(n, s));
        return new ae(i, xt.empty(), e);
    }

    /** Creates a new offset based on the provided document. */ function ue(t) {
        return new ae(t.readTime, t.key, -1);
    }

    /**
     * Stores the latest read time, document and batch ID that were processed for an
     * index.
     */ class ae {
        constructor(
        /**
         * The latest read time version that has been indexed by Firestore for this
         * field index.
         */
        t, 
        /**
         * The key of the last document that was indexed for this query. Use
         * `DocumentKey.empty()` if no document has been indexed.
         */
        e, 
        /*
         * The largest mutation batch id that's been processed by Firestore.
         */
        n) {
            this.readTime = t, this.documentKey = e, this.largestBatchId = n;
        }
        /** Returns an offset that sorts before all regular offsets. */    static min() {
            return new ae(ct.min(), xt.empty(), -1);
        }
        /** Returns an offset that sorts after all regular offsets. */    static max() {
            return new ae(ct.max(), xt.empty(), -1);
        }
    }

    function ce(t, e) {
        let n = t.readTime.compareTo(e.readTime);
        return 0 !== n ? n : (n = xt.comparator(t.documentKey, e.documentKey), 0 !== n ? n : rt(t.largestBatchId, e.largestBatchId));
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Visible for testing
    class he {
        constructor(t, e = null, n = [], s = [], i = null, r = null, o = null) {
            this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = s, this.limit = i, 
            this.startAt = r, this.endAt = o, this.P = null;
        }
    }

    /**
     * Initializes a Target with a path and optional additional query constraints.
     * Path must currently be empty if this is a collection group query.
     *
     * NOTE: you should always construct `Target` from `Query.toTarget` instead of
     * using this factory method, because `Query` provides an implicit `orderBy`
     * property.
     */ function le(t, e = null, n = [], s = [], i = null, r = null, o = null) {
        return new he(t, e, n, s, i, r, o);
    }

    function fe(t) {
        const e = G(t);
        if (null === e.P) {
            let t = e.path.canonicalString();
            null !== e.collectionGroup && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map((t => {
                return (e = t).field.canonicalString() + e.op.toString() + Lt(e.value);
                var e;
            })).join(","), t += "|ob:", t += e.orderBy.map((t => function(t) {
                // TODO(b/29183165): Make this collision robust.
                return t.field.canonicalString() + t.dir;
            }(t))).join(","), St(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", 
            t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map((t => Lt(t))).join(",")), 
            e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((t => Lt(t))).join(",")), 
            e.P = t;
        }
        return e.P;
    }

    function de(t) {
        let e = t.path.canonicalString();
        return null !== t.collectionGroup && (e += " collectionGroup=" + t.collectionGroup), 
        t.filters.length > 0 && (e += `, filters: [${t.filters.map((t => {
        return `${(e = t).field.canonicalString()} ${e.op} ${Lt(e.value)}`;
        /** Returns a debug description for `filter`. */
        var e;
        /** Filter that matches on key fields (i.e. '__name__'). */    })).join(", ")}]`), 
        St(t.limit) || (e += ", limit: " + t.limit), t.orderBy.length > 0 && (e += `, orderBy: [${t.orderBy.map((t => function(t) {
        return `${t.field.canonicalString()} (${t.dir})`;
    }(t))).join(", ")}]`), t.startAt && (e += ", startAt: ", e += t.startAt.inclusive ? "b:" : "a:", 
        e += t.startAt.position.map((t => Lt(t))).join(",")), t.endAt && (e += ", endAt: ", 
        e += t.endAt.inclusive ? "a:" : "b:", e += t.endAt.position.map((t => Lt(t))).join(",")), 
        `Target(${e})`;
    }

    function _e(t, e) {
        if (t.limit !== e.limit) return !1;
        if (t.orderBy.length !== e.orderBy.length) return !1;
        for (let n = 0; n < t.orderBy.length; n++) if (!ve(t.orderBy[n], e.orderBy[n])) return !1;
        if (t.filters.length !== e.filters.length) return !1;
        for (let i = 0; i < t.filters.length; i++) if (n = t.filters[i], s = e.filters[i], 
        n.op !== s.op || !n.field.isEqual(s.field) || !Ot(n.value, s.value)) return !1;
        var n, s;
        return t.collectionGroup === e.collectionGroup && (!!t.path.isEqual(e.path) && (!!De(t.startAt, e.startAt) && De(t.endAt, e.endAt)));
    }

    function we(t) {
        return xt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
    }

    /**
     * Returns the values that are used in ARRAY_CONTAINS or ARRAY_CONTAINS_ANY
     * filters. Returns `null` if there are no such filters.
     */ class ge extends class {} {
        constructor(t, e, n) {
            super(), this.field = t, this.op = e, this.value = n;
        }
        /**
         * Creates a filter based on the provided arguments.
         */    static create(t, e, n) {
            return t.isKeyField() ? "in" /* IN */ === e || "not-in" /* NOT_IN */ === e ? this.V(t, e, n) : new ye(t, e, n) : "array-contains" /* ARRAY_CONTAINS */ === e ? new Ee(t, n) : "in" /* IN */ === e ? new Ae(t, n) : "not-in" /* NOT_IN */ === e ? new Re(t, n) : "array-contains-any" /* ARRAY_CONTAINS_ANY */ === e ? new be(t, n) : new ge(t, e, n);
        }
        static V(t, e, n) {
            return "in" /* IN */ === e ? new pe(t, n) : new Ie(t, n);
        }
        matches(t) {
            const e = t.data.field(this.field);
            // Types do not have to match in NOT_EQUAL filters.
                    return "!=" /* NOT_EQUAL */ === this.op ? null !== e && this.v($t(e, this.value)) : null !== e && Mt(this.value) === Mt(e) && this.v($t(e, this.value));
            // Only compare types with matching backend order (such as double and int).
            }
        v(t) {
            switch (this.op) {
              case "<" /* LESS_THAN */ :
                return t < 0;

              case "<=" /* LESS_THAN_OR_EQUAL */ :
                return t <= 0;

              case "==" /* EQUAL */ :
                return 0 === t;

              case "!=" /* NOT_EQUAL */ :
                return 0 !== t;

              case ">" /* GREATER_THAN */ :
                return t > 0;

              case ">=" /* GREATER_THAN_OR_EQUAL */ :
                return t >= 0;

              default:
                return L();
            }
        }
        S() {
            return [ "<" /* LESS_THAN */ , "<=" /* LESS_THAN_OR_EQUAL */ , ">" /* GREATER_THAN */ , ">=" /* GREATER_THAN_OR_EQUAL */ , "!=" /* NOT_EQUAL */ , "not-in" /* NOT_IN */ ].indexOf(this.op) >= 0;
        }
    }

    class ye extends ge {
        constructor(t, e, n) {
            super(t, e, n), this.key = xt.fromName(n.referenceValue);
        }
        matches(t) {
            const e = xt.comparator(t.key, this.key);
            return this.v(e);
        }
    }

    /** Filter that matches on key fields within an array. */ class pe extends ge {
        constructor(t, e) {
            super(t, "in" /* IN */ , e), this.keys = Te("in" /* IN */ , e);
        }
        matches(t) {
            return this.keys.some((e => e.isEqual(t.key)));
        }
    }

    /** Filter that matches on key fields not present within an array. */ class Ie extends ge {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e), this.keys = Te("not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            return !this.keys.some((e => e.isEqual(t.key)));
        }
    }

    function Te(t, e) {
        var n;
        return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((t => xt.fromName(t.referenceValue)));
    }

    /** A Filter that implements the array-contains operator. */ class Ee extends ge {
        constructor(t, e) {
            super(t, "array-contains" /* ARRAY_CONTAINS */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return Kt(e) && Ft(e.arrayValue, this.value);
        }
    }

    /** A Filter that implements the IN operator. */ class Ae extends ge {
        constructor(t, e) {
            super(t, "in" /* IN */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return null !== e && Ft(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the not-in operator. */ class Re extends ge {
        constructor(t, e) {
            super(t, "not-in" /* NOT_IN */ , e);
        }
        matches(t) {
            if (Ft(this.value.arrayValue, {
                nullValue: "NULL_VALUE"
            })) return !1;
            const e = t.data.field(this.field);
            return null !== e && !Ft(this.value.arrayValue, e);
        }
    }

    /** A Filter that implements the array-contains-any operator. */ class be extends ge {
        constructor(t, e) {
            super(t, "array-contains-any" /* ARRAY_CONTAINS_ANY */ , e);
        }
        matches(t) {
            const e = t.data.field(this.field);
            return !(!Kt(e) || !e.arrayValue.values) && e.arrayValue.values.some((t => Ft(this.value.arrayValue, t)));
        }
    }

    /**
     * Represents a bound of a query.
     *
     * The bound is specified with the given components representing a position and
     * whether it's just before or just after the position (relative to whatever the
     * query order is).
     *
     * The position represents a logical index position for a query. It's a prefix
     * of values for the (potentially implicit) order by clauses of a query.
     *
     * Bound provides a function to determine whether a document comes before or
     * after a bound. This is influenced by whether the position is just before or
     * just after the provided values.
     */ class Pe {
        constructor(t, e) {
            this.position = t, this.inclusive = e;
        }
    }

    /**
     * An ordering on a field, in some Direction. Direction defaults to ASCENDING.
     */ class Ve {
        constructor(t, e = "asc" /* ASCENDING */) {
            this.field = t, this.dir = e;
        }
    }

    function ve(t, e) {
        return t.dir === e.dir && t.field.isEqual(e.field);
    }

    function Se(t, e, n) {
        let s = 0;
        for (let i = 0; i < t.position.length; i++) {
            const r = e[i], o = t.position[i];
            if (r.field.isKeyField()) s = xt.comparator(xt.fromName(o.referenceValue), n.key); else {
                s = $t(o, n.data.field(r.field));
            }
            if ("desc" /* DESCENDING */ === r.dir && (s *= -1), 0 !== s) break;
        }
        return s;
    }

    /**
     * Returns true if a document sorts after a bound using the provided sort
     * order.
     */ function De(t, e) {
        if (null === t) return null === e;
        if (null === e) return !1;
        if (t.inclusive !== e.inclusive || t.position.length !== e.position.length) return !1;
        for (let n = 0; n < t.position.length; n++) {
            if (!Ot(t.position[n], e.position[n])) return !1;
        }
        return !0;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Query encapsulates all the query attributes we support in the SDK. It can
     * be run against the LocalStore, as well as be converted to a `Target` to
     * query the RemoteStore results.
     *
     * Visible for testing.
     */ class Ce {
        /**
         * Initializes a Query with a path and optional additional query constraints.
         * Path must currently be empty if this is a collection group query.
         */
        constructor(t, e = null, n = [], s = [], i = null, r = "F" /* First */ , o = null, u = null) {
            this.path = t, this.collectionGroup = e, this.explicitOrderBy = n, this.filters = s, 
            this.limit = i, this.limitType = r, this.startAt = o, this.endAt = u, this.D = null, 
            // The corresponding `Target` of this `Query` instance.
            this.C = null, this.startAt, this.endAt;
        }
    }

    /** Creates a new Query instance with the options provided. */ function xe(t, e, n, s, i, r, o, u) {
        return new Ce(t, e, n, s, i, r, o, u);
    }

    /** Creates a new Query for a query that matches all documents at `path` */ function Ne(t) {
        return new Ce(t);
    }

    /**
     * Helper to convert a collection group query into a collection query at a
     * specific path. This is used when executing collection group queries, since
     * we have to split the query into a set of collection queries at multiple
     * paths.
     */ function ke(t) {
        return !St(t.limit) && "F" /* First */ === t.limitType;
    }

    function Me(t) {
        return !St(t.limit) && "L" /* Last */ === t.limitType;
    }

    function Oe(t) {
        return t.explicitOrderBy.length > 0 ? t.explicitOrderBy[0].field : null;
    }

    function Fe(t) {
        for (const e of t.filters) if (e.S()) return e.field;
        return null;
    }

    /**
     * Checks if any of the provided Operators are included in the query and
     * returns the first one that is, or null if none are.
     */
    /**
     * Returns whether the query matches a collection group rather than a specific
     * collection.
     */
    function $e(t) {
        return null !== t.collectionGroup;
    }

    /**
     * Returns the implicit order by constraint that is used to execute the Query,
     * which can be different from the order by constraints the user provided (e.g.
     * the SDK and backend always orders by `__name__`).
     */ function Be(t) {
        const e = G(t);
        if (null === e.D) {
            e.D = [];
            const t = Fe(e), n = Oe(e);
            if (null !== t && null === n) 
            // In order to implicitly add key ordering, we must also add the
            // inequality filter field for it to be a valid query.
            // Note that the default inequality field and key ordering is ascending.
            t.isKeyField() || e.D.push(new Ve(t)), e.D.push(new Ve(mt.keyField(), "asc" /* ASCENDING */)); else {
                let t = !1;
                for (const n of e.explicitOrderBy) e.D.push(n), n.field.isKeyField() && (t = !0);
                if (!t) {
                    // The order of the implicit key ordering always matches the last
                    // explicit order by
                    const t = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc" /* ASCENDING */;
                    e.D.push(new Ve(mt.keyField(), t));
                }
            }
        }
        return e.D;
    }

    /**
     * Converts this `Query` instance to it's corresponding `Target` representation.
     */ function Le(t) {
        const e = G(t);
        if (!e.C) if ("F" /* First */ === e.limitType) e.C = le(e.path, e.collectionGroup, Be(e), e.filters, e.limit, e.startAt, e.endAt); else {
            // Flip the orderBy directions since we want the last results
            const t = [];
            for (const n of Be(e)) {
                const e = "desc" /* DESCENDING */ === n.dir ? "asc" /* ASCENDING */ : "desc" /* DESCENDING */;
                t.push(new Ve(n.field, e));
            }
            // We need to swap the cursors to match the now-flipped query ordering.
                    const n = e.endAt ? new Pe(e.endAt.position, !e.endAt.inclusive) : null, s = e.startAt ? new Pe(e.startAt.position, !e.startAt.inclusive) : null;
            // Now return as a LimitType.First query.
            e.C = le(e.path, e.collectionGroup, t, e.filters, e.limit, n, s);
        }
        return e.C;
    }

    function Ue(t, e, n) {
        return new Ce(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
    }

    function qe(t, e) {
        return _e(Le(t), Le(e)) && t.limitType === e.limitType;
    }

    // TODO(b/29183165): This is used to get a unique string from a query to, for
    // example, use as a dictionary key, but the implementation is subject to
    // collisions. Make it collision-free.
    function Ge(t) {
        return `${fe(Le(t))}|lt:${t.limitType}`;
    }

    function Ke(t) {
        return `Query(target=${de(Le(t))}; limitType=${t.limitType})`;
    }

    /** Returns whether `doc` matches the constraints of `query`. */ function Qe(t, e) {
        return e.isFoundDocument() && function(t, e) {
            const n = e.key.path;
            return null !== t.collectionGroup ? e.key.hasCollectionId(t.collectionGroup) && t.path.isPrefixOf(n) : xt.isDocumentKey(t.path) ? t.path.isEqual(n) : t.path.isImmediateParentOf(n);
        }
        /**
     * A document must have a value for every ordering clause in order to show up
     * in the results.
     */ (t, e) && function(t, e) {
            for (const n of t.explicitOrderBy) 
            // order by key always matches
            if (!n.field.isKeyField() && null === e.data.field(n.field)) return !1;
            return !0;
        }(t, e) && function(t, e) {
            for (const n of t.filters) if (!n.matches(e)) return !1;
            return !0;
        }
        /** Makes sure a document is within the bounds, if provided. */ (t, e) && function(t, e) {
            if (t.startAt && !
            /**
     * Returns true if a document sorts before a bound using the provided sort
     * order.
     */
            function(t, e, n) {
                const s = Se(t, e, n);
                return t.inclusive ? s <= 0 : s < 0;
            }(t.startAt, Be(t), e)) return !1;
            if (t.endAt && !function(t, e, n) {
                const s = Se(t, e, n);
                return t.inclusive ? s >= 0 : s > 0;
            }(t.endAt, Be(t), e)) return !1;
            return !0;
        }
        /**
     * Returns the collection group that this query targets.
     *
     * PORTING NOTE: This is only used in the Web SDK to facilitate multi-tab
     * synchronization for query results.
     */ (t, e);
    }

    function je(t) {
        return t.collectionGroup || (t.path.length % 2 == 1 ? t.path.lastSegment() : t.path.get(t.path.length - 2));
    }

    /**
     * Returns a new comparator function that can be used to compare two documents
     * based on the Query's ordering constraint.
     */ function We(t) {
        return (e, n) => {
            let s = !1;
            for (const i of Be(t)) {
                const t = ze(i, e, n);
                if (0 !== t) return t;
                s = s || i.field.isKeyField();
            }
            return 0;
        };
    }

    function ze(t, e, n) {
        const s = t.field.isKeyField() ? xt.comparator(e.key, n.key) : function(t, e, n) {
            const s = e.data.field(t), i = n.data.field(t);
            return null !== s && null !== i ? $t(s, i) : L();
        }
        /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /**
     * The initial mutation batch id for each index. Gets updated during index
     * backfill.
     */ (t.field, e, n);
        switch (t.dir) {
          case "asc" /* ASCENDING */ :
            return s;

          case "desc" /* DESCENDING */ :
            return -1 * s;

          default:
            return L();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns an DoubleValue for `value` that is encoded based the serializer's
     * `useProto3Json` setting.
     */ function He(t, e) {
        if (t.N) {
            if (isNaN(e)) return {
                doubleValue: "NaN"
            };
            if (e === 1 / 0) return {
                doubleValue: "Infinity"
            };
            if (e === -1 / 0) return {
                doubleValue: "-Infinity"
            };
        }
        return {
            doubleValue: Dt(e) ? "-0" : e
        };
    }

    /**
     * Returns an IntegerValue for `value`.
     */ function Je(t) {
        return {
            integerValue: "" + t
        };
    }

    /**
     * Returns a value for a number that's appropriate to put into a proto.
     * The return value is an IntegerValue if it can safely represent the value,
     * otherwise a DoubleValue is returned.
     */ function Ye(t, e) {
        return Ct(e) ? Je(e) : He(t, e);
    }

    /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Used to represent a field transform on a mutation. */ class Xe {
        constructor() {
            // Make sure that the structural type of `TransformOperation` is unique.
            // See https://github.com/microsoft/TypeScript/issues/5451
            this._ = void 0;
        }
    }

    /**
     * Computes the local transform result against the provided `previousValue`,
     * optionally using the provided localWriteTime.
     */ function Ze(t, e, n) {
        return t instanceof nn ? function(t, e) {
            const n = {
                fields: {
                    __type__: {
                        stringValue: "server_timestamp"
                    },
                    __local_write_time__: {
                        timestampValue: {
                            seconds: t.seconds,
                            nanos: t.nanoseconds
                        }
                    }
                }
            };
            return e && (n.fields.__previous_value__ = e), {
                mapValue: n
            };
        }(n, e) : t instanceof sn ? rn(t, e) : t instanceof on ? un(t, e) : function(t, e) {
            // PORTING NOTE: Since JavaScript's integer arithmetic is limited to 53 bit
            // precision and resolves overflows by reducing precision, we do not
            // manually cap overflows at 2^63.
            const n = en(t, e), s = cn(n) + cn(t.k);
            return Gt(n) && Gt(t.k) ? Je(s) : He(t.M, s);
        }(t, e);
    }

    /**
     * Computes a final transform result after the transform has been acknowledged
     * by the server, potentially using the server-provided transformResult.
     */ function tn(t, e, n) {
        // The server just sends null as the transform result for array operations,
        // so we have to calculate a result the same as we do for local
        // applications.
        return t instanceof sn ? rn(t, e) : t instanceof on ? un(t, e) : n;
    }

    /**
     * If this transform operation is not idempotent, returns the base value to
     * persist for this transform. If a base value is returned, the transform
     * operation is always applied to this base value, even if document has
     * already been updated.
     *
     * Base values provide consistent behavior for non-idempotent transforms and
     * allow us to return the same latency-compensated value even if the backend
     * has already applied the transform operation. The base value is null for
     * idempotent transforms, as they can be re-played even if the backend has
     * already applied them.
     *
     * @returns a base value to store along with the mutation, or null for
     * idempotent transforms.
     */ function en(t, e) {
        return t instanceof an ? Gt(n = e) || function(t) {
            return !!t && "doubleValue" in t;
        }
        /** Returns true if `value` is either an IntegerValue or a DoubleValue. */ (n) ? e : {
            integerValue: 0
        } : null;
        var n;
    }

    /** Transforms a value into a server-generated timestamp. */
    class nn extends Xe {}

    /** Transforms an array value via a union operation. */ class sn extends Xe {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function rn(t, e) {
        const n = hn(e);
        for (const e of t.elements) n.some((t => Ot(t, e))) || n.push(e);
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /** Transforms an array value via a remove operation. */ class on extends Xe {
        constructor(t) {
            super(), this.elements = t;
        }
    }

    function un(t, e) {
        let n = hn(e);
        for (const e of t.elements) n = n.filter((t => !Ot(t, e)));
        return {
            arrayValue: {
                values: n
            }
        };
    }

    /**
     * Implements the backend semantics for locally computed NUMERIC_ADD (increment)
     * transforms. Converts all field values to integers or doubles, but unlike the
     * backend does not cap integer values at 2^63. Instead, JavaScript number
     * arithmetic is used and precision loss can occur for values greater than 2^53.
     */ class an extends Xe {
        constructor(t, e) {
            super(), this.M = t, this.k = e;
        }
    }

    function cn(t) {
        return Et(t.integerValue || t.doubleValue);
    }

    function hn(t) {
        return Kt(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
    }

    function fn(t, e) {
        return t.field.isEqual(e.field) && function(t, e) {
            return t instanceof sn && e instanceof sn || t instanceof on && e instanceof on ? ot(t.elements, e.elements, Ot) : t instanceof an && e instanceof an ? Ot(t.k, e.k) : t instanceof nn && e instanceof nn;
        }(t.transform, e.transform);
    }

    /** The result of successfully applying a mutation to the backend. */
    class dn {
        constructor(
        /**
         * The version at which the mutation was committed:
         *
         * - For most operations, this is the updateTime in the WriteResult.
         * - For deletes, the commitTime of the WriteResponse (because deletes are
         *   not stored and have no updateTime).
         *
         * Note that these versions can be different: No-op writes will not change
         * the updateTime even though the commitTime advances.
         */
        t, 
        /**
         * The resulting fields returned from the backend after a mutation
         * containing field transforms has been committed. Contains one FieldValue
         * for each FieldTransform that was in the mutation.
         *
         * Will be empty if the mutation did not contain any field transforms.
         */
        e) {
            this.version = t, this.transformResults = e;
        }
    }

    /**
     * Encodes a precondition for a mutation. This follows the model that the
     * backend accepts with the special case of an explicit "empty" precondition
     * (meaning no precondition).
     */ class _n {
        constructor(t, e) {
            this.updateTime = t, this.exists = e;
        }
        /** Creates a new empty Precondition. */    static none() {
            return new _n;
        }
        /** Creates a new Precondition with an exists flag. */    static exists(t) {
            return new _n(void 0, t);
        }
        /** Creates a new Precondition based on a version a document exists at. */    static updateTime(t) {
            return new _n(t);
        }
        /** Returns whether this Precondition is empty. */    get isNone() {
            return void 0 === this.updateTime && void 0 === this.exists;
        }
        isEqual(t) {
            return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
        }
    }

    /** Returns true if the preconditions is valid for the given document. */ function wn(t, e) {
        return void 0 !== t.updateTime ? e.isFoundDocument() && e.version.isEqual(t.updateTime) : void 0 === t.exists || t.exists === e.isFoundDocument();
    }

    /**
     * A mutation describes a self-contained change to a document. Mutations can
     * create, replace, delete, and update subsets of documents.
     *
     * Mutations not only act on the value of the document but also its version.
     *
     * For local mutations (mutations that haven't been committed yet), we preserve
     * the existing version for Set and Patch mutations. For Delete mutations, we
     * reset the version to 0.
     *
     * Here's the expected transition table.
     *
     * MUTATION           APPLIED TO            RESULTS IN
     *
     * SetMutation        Document(v3)          Document(v3)
     * SetMutation        NoDocument(v3)        Document(v0)
     * SetMutation        InvalidDocument(v0)   Document(v0)
     * PatchMutation      Document(v3)          Document(v3)
     * PatchMutation      NoDocument(v3)        NoDocument(v3)
     * PatchMutation      InvalidDocument(v0)   UnknownDocument(v3)
     * DeleteMutation     Document(v3)          NoDocument(v0)
     * DeleteMutation     NoDocument(v3)        NoDocument(v0)
     * DeleteMutation     InvalidDocument(v0)   NoDocument(v0)
     *
     * For acknowledged mutations, we use the updateTime of the WriteResponse as
     * the resulting version for Set and Patch mutations. As deletes have no
     * explicit update time, we use the commitTime of the WriteResponse for
     * Delete mutations.
     *
     * If a mutation is acknowledged by the backend but fails the precondition check
     * locally, we transition to an `UnknownDocument` and rely on Watch to send us
     * the updated version.
     *
     * Field transforms are used only with Patch and Set Mutations. We use the
     * `updateTransforms` message to store transforms, rather than the `transforms`s
     * messages.
     *
     * ## Subclassing Notes
     *
     * Every type of mutation needs to implement its own applyToRemoteDocument() and
     * applyToLocalView() to implement the actual behavior of applying the mutation
     * to some source document (see `setMutationApplyToRemoteDocument()` for an
     * example).
     */ class mn {}

    /**
     * Applies this mutation to the given document for the purposes of computing a
     * new remote document. If the input document doesn't match the expected state
     * (e.g. it is invalid or outdated), the document type may transition to
     * unknown.
     *
     * @param mutation - The mutation to apply.
     * @param document - The document to mutate. The input document can be an
     *     invalid document if the client has no knowledge of the pre-mutation state
     *     of the document.
     * @param mutationResult - The result of applying the mutation from the backend.
     */ function gn(t, e, n) {
        t instanceof En ? function(t, e, n) {
            // Unlike setMutationApplyToLocalView, if we're applying a mutation to a
            // remote document the server has accepted the mutation so the precondition
            // must have held.
            const s = t.value.clone(), i = bn(t.fieldTransforms, e, n.transformResults);
            s.setAll(i), e.convertToFoundDocument(n.version, s).setHasCommittedMutations();
        }(t, e, n) : t instanceof An ? function(t, e, n) {
            if (!wn(t.precondition, e)) 
            // Since the mutation was not rejected, we know that the precondition
            // matched on the backend. We therefore must not have the expected version
            // of the document in our cache and convert to an UnknownDocument with a
            // known updateTime.
            return void e.convertToUnknownDocument(n.version);
            const s = bn(t.fieldTransforms, e, n.transformResults), i = e.data;
            i.setAll(Rn(t)), i.setAll(s), e.convertToFoundDocument(n.version, i).setHasCommittedMutations();
        }(t, e, n) : function(t, e, n) {
            // Unlike applyToLocalView, if we're applying a mutation to a remote
            // document the server has accepted the mutation so the precondition must
            // have held.
            e.convertToNoDocument(n.version).setHasCommittedMutations();
        }(0, e, n);
    }

    /**
     * Applies this mutation to the given document for the purposes of computing
     * the new local view of a document. If the input document doesn't match the
     * expected state, the document is not modified.
     *
     * @param mutation - The mutation to apply.
     * @param document - The document to mutate. The input document can be an
     *     invalid document if the client has no knowledge of the pre-mutation state
     *     of the document.
     * @param localWriteTime - A timestamp indicating the local write time of the
     *     batch this mutation is a part of.
     */ function yn(t, e, n) {
        t instanceof En ? function(t, e, n) {
            if (!wn(t.precondition, e)) 
            // The mutation failed to apply (e.g. a document ID created with add()
            // caused a name collision).
            return;
            const s = t.value.clone(), i = Pn(t.fieldTransforms, n, e);
            s.setAll(i), e.convertToFoundDocument(Tn(e), s).setHasLocalMutations();
        }
        /**
     * A mutation that modifies fields of the document at the given key with the
     * given values. The values are applied through a field mask:
     *
     *  * When a field is in both the mask and the values, the corresponding field
     *    is updated.
     *  * When a field is in neither the mask nor the values, the corresponding
     *    field is unmodified.
     *  * When a field is in the mask but not in the values, the corresponding field
     *    is deleted.
     *  * When a field is not in the mask but is in the values, the values map is
     *    ignored.
     */ (t, e, n) : t instanceof An ? function(t, e, n) {
            if (!wn(t.precondition, e)) return;
            const s = Pn(t.fieldTransforms, n, e), i = e.data;
            i.setAll(Rn(t)), i.setAll(s), e.convertToFoundDocument(Tn(e), i).setHasLocalMutations();
        }
        /**
     * Returns a FieldPath/Value map with the content of the PatchMutation.
     */ (t, e, n) : function(t, e) {
            wn(t.precondition, e) && 
            // We don't call `setHasLocalMutations()` since we want to be backwards
            // compatible with the existing SDK behavior.
            e.convertToNoDocument(ct.min());
        }
        /**
     * A mutation that verifies the existence of the document at the given key with
     * the provided precondition.
     *
     * The `verify` operation is only used in Transactions, and this class serves
     * primarily to facilitate serialization into protos.
     */ (t, e);
    }

    /**
     * If this mutation is not idempotent, returns the base value to persist with
     * this mutation. If a base value is returned, the mutation is always applied
     * to this base value, even if document has already been updated.
     *
     * The base value is a sparse object that consists of only the document
     * fields for which this mutation contains a non-idempotent transformation
     * (e.g. a numeric increment). The provided value guarantees consistent
     * behavior for non-idempotent transforms and allow us to return the same
     * latency-compensated value even if the backend has already applied the
     * mutation. The base value is null for idempotent mutations, as they can be
     * re-played even if the backend has already applied them.
     *
     * @returns a base value to store along with the mutation, or null for
     * idempotent mutations.
     */ function pn(t, e) {
        let n = null;
        for (const s of t.fieldTransforms) {
            const t = e.data.field(s.field), i = en(s.transform, t || null);
            null != i && (null == n && (n = Xt.empty()), n.set(s.field, i));
        }
        return n || null;
    }

    function In(t, e) {
        return t.type === e.type && (!!t.key.isEqual(e.key) && (!!t.precondition.isEqual(e.precondition) && (!!function(t, e) {
            return void 0 === t && void 0 === e || !(!t || !e) && ot(t, e, ((t, e) => fn(t, e)));
        }(t.fieldTransforms, e.fieldTransforms) && (0 /* Set */ === t.type ? t.value.isEqual(e.value) : 1 /* Patch */ !== t.type || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask)))));
    }

    /**
     * Returns the version from the given document for use as the result of a
     * mutation. Mutations are defined to return the version of the base document
     * only if it is an existing document. Deleted and unknown documents have a
     * post-mutation version of SnapshotVersion.min().
     */ function Tn(t) {
        return t.isFoundDocument() ? t.version : ct.min();
    }

    /**
     * A mutation that creates or replaces the document at the given key with the
     * object value contents.
     */ class En extends mn {
        constructor(t, e, n, s = []) {
            super(), this.key = t, this.value = e, this.precondition = n, this.fieldTransforms = s, 
            this.type = 0 /* Set */;
        }
    }

    class An extends mn {
        constructor(t, e, n, s, i = []) {
            super(), this.key = t, this.data = e, this.fieldMask = n, this.precondition = s, 
            this.fieldTransforms = i, this.type = 1 /* Patch */;
        }
    }

    function Rn(t) {
        const e = new Map;
        return t.fieldMask.fields.forEach((n => {
            if (!n.isEmpty()) {
                const s = t.data.field(n);
                e.set(n, s);
            }
        })), e;
    }

    /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use after a mutation
     * containing transforms has been acknowledged by the server.
     *
     * @param fieldTransforms - The field transforms to apply the result to.
     * @param mutableDocument - The current state of the document after applying all
     * previous mutations.
     * @param serverTransformResults - The transform results received by the server.
     * @returns The transform results list.
     */ function bn(t, e, n) {
        const s = new Map;
        U(t.length === n.length);
        for (let i = 0; i < n.length; i++) {
            const r = t[i], o = r.transform, u = e.data.field(r.field);
            s.set(r.field, tn(o, u, n[i]));
        }
        return s;
    }

    /**
     * Creates a list of "transform results" (a transform result is a field value
     * representing the result of applying a transform) for use when applying a
     * transform locally.
     *
     * @param fieldTransforms - The field transforms to apply the result to.
     * @param localWriteTime - The local time of the mutation (used to
     *     generate ServerTimestampValues).
     * @param mutableDocument - The current state of the document after applying all
     *     previous mutations.
     * @returns The transform results list.
     */ function Pn(t, e, n) {
        const s = new Map;
        for (const i of t) {
            const t = i.transform, r = n.data.field(i.field);
            s.set(i.field, Ze(t, r, e));
        }
        return s;
    }

    /** A mutation that deletes the document at the given key. */ class Vn extends mn {
        constructor(t, e) {
            super(), this.key = t, this.precondition = e, this.type = 2 /* Delete */ , this.fieldTransforms = [];
        }
    }

    class vn extends mn {
        constructor(t, e) {
            super(), this.key = t, this.precondition = e, this.type = 3 /* Verify */ , this.fieldTransforms = [];
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Sn {
        // TODO(b/33078163): just use simplest form of existence filter for now
        constructor(t) {
            this.count = t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Error Codes describing the different ways GRPC can fail. These are copied
     * directly from GRPC's sources here:
     *
     * https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
     *
     * Important! The names of these identifiers matter because the string forms
     * are used for reverse lookups from the webchannel stream. Do NOT change the
     * names of these identifiers or change this into a const enum.
     */ var Dn, Cn;

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a non-write operation.
     *
     * See isPermanentWriteError for classifying write errors.
     */
    function xn(t) {
        switch (t) {
          default:
            return L();

          case K.CANCELLED:
          case K.UNKNOWN:
          case K.DEADLINE_EXCEEDED:
          case K.RESOURCE_EXHAUSTED:
          case K.INTERNAL:
          case K.UNAVAILABLE:
     // Unauthenticated means something went wrong with our token and we need
            // to retry with new credentials which will happen automatically.
                  case K.UNAUTHENTICATED:
            return !1;

          case K.INVALID_ARGUMENT:
          case K.NOT_FOUND:
          case K.ALREADY_EXISTS:
          case K.PERMISSION_DENIED:
          case K.FAILED_PRECONDITION:
     // Aborted might be retried in some scenarios, but that is dependant on
            // the context and should handled individually by the calling code.
            // See https://cloud.google.com/apis/design/errors.
                  case K.ABORTED:
          case K.OUT_OF_RANGE:
          case K.UNIMPLEMENTED:
          case K.DATA_LOSS:
            return !0;
        }
    }

    /**
     * Determines whether an error code represents a permanent error when received
     * in response to a write operation.
     *
     * Write operations must be handled specially because as of b/119437764, ABORTED
     * errors on the write stream should be retried too (even though ABORTED errors
     * are not generally retryable).
     *
     * Note that during the initial handshake on the write stream an ABORTED error
     * signals that we should discard our stream token (i.e. it is permanent). This
     * means a handshake error should be classified with isPermanentError, above.
     */
    /**
     * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
     * are not the same as HTTP status codes.
     *
     * @returns The Code equivalent to the given GRPC status code. Fails if there
     *     is no match.
     */
    function Nn(t) {
        if (void 0 === t) 
        // This shouldn't normally happen, but in certain error cases (like trying
        // to send invalid proto messages) we may get an error with no GRPC code.
        return F("GRPC error has no .code"), K.UNKNOWN;
        switch (t) {
          case Dn.OK:
            return K.OK;

          case Dn.CANCELLED:
            return K.CANCELLED;

          case Dn.UNKNOWN:
            return K.UNKNOWN;

          case Dn.DEADLINE_EXCEEDED:
            return K.DEADLINE_EXCEEDED;

          case Dn.RESOURCE_EXHAUSTED:
            return K.RESOURCE_EXHAUSTED;

          case Dn.INTERNAL:
            return K.INTERNAL;

          case Dn.UNAVAILABLE:
            return K.UNAVAILABLE;

          case Dn.UNAUTHENTICATED:
            return K.UNAUTHENTICATED;

          case Dn.INVALID_ARGUMENT:
            return K.INVALID_ARGUMENT;

          case Dn.NOT_FOUND:
            return K.NOT_FOUND;

          case Dn.ALREADY_EXISTS:
            return K.ALREADY_EXISTS;

          case Dn.PERMISSION_DENIED:
            return K.PERMISSION_DENIED;

          case Dn.FAILED_PRECONDITION:
            return K.FAILED_PRECONDITION;

          case Dn.ABORTED:
            return K.ABORTED;

          case Dn.OUT_OF_RANGE:
            return K.OUT_OF_RANGE;

          case Dn.UNIMPLEMENTED:
            return K.UNIMPLEMENTED;

          case Dn.DATA_LOSS:
            return K.DATA_LOSS;

          default:
            return L();
        }
    }

    /**
     * Converts an HTTP response's error status to the equivalent error code.
     *
     * @param status - An HTTP error response status ("FAILED_PRECONDITION",
     * "UNKNOWN", etc.)
     * @returns The equivalent Code. Non-matching responses are mapped to
     *     Code.UNKNOWN.
     */ (Cn = Dn || (Dn = {}))[Cn.OK = 0] = "OK", Cn[Cn.CANCELLED = 1] = "CANCELLED", 
    Cn[Cn.UNKNOWN = 2] = "UNKNOWN", Cn[Cn.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", 
    Cn[Cn.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", Cn[Cn.NOT_FOUND = 5] = "NOT_FOUND", 
    Cn[Cn.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", Cn[Cn.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", 
    Cn[Cn.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", Cn[Cn.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", 
    Cn[Cn.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", Cn[Cn.ABORTED = 10] = "ABORTED", 
    Cn[Cn.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", Cn[Cn.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", 
    Cn[Cn.INTERNAL = 13] = "INTERNAL", Cn[Cn.UNAVAILABLE = 14] = "UNAVAILABLE", Cn[Cn.DATA_LOSS = 15] = "DATA_LOSS";

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A map implementation that uses objects as keys. Objects must have an
     * associated equals function and must be immutable. Entries in the map are
     * stored together with the key being produced from the mapKeyFn. This map
     * automatically handles collisions of keys.
     */
    class kn {
        constructor(t, e) {
            this.mapKeyFn = t, this.equalsFn = e, 
            /**
             * The inner map for a key/value pair. Due to the possibility of collisions we
             * keep a list of entries that we do a linear search through to find an actual
             * match. Note that collisions should be rare, so we still expect near
             * constant time lookups in practice.
             */
            this.inner = {}, 
            /** The number of entries stored in the map */
            this.innerSize = 0;
        }
        /** Get a value for this key, or undefined if it does not exist. */    get(t) {
            const e = this.mapKeyFn(t), n = this.inner[e];
            if (void 0 !== n) for (const [e, s] of n) if (this.equalsFn(e, t)) return s;
        }
        has(t) {
            return void 0 !== this.get(t);
        }
        /** Put this key and value in the map. */    set(t, e) {
            const n = this.mapKeyFn(t), s = this.inner[n];
            if (void 0 === s) return this.inner[n] = [ [ t, e ] ], void this.innerSize++;
            for (let n = 0; n < s.length; n++) if (this.equalsFn(s[n][0], t)) 
            // This is updating an existing entry and does not increase `innerSize`.
            return void (s[n] = [ t, e ]);
            s.push([ t, e ]), this.innerSize++;
        }
        /**
         * Remove this key from the map. Returns a boolean if anything was deleted.
         */    delete(t) {
            const e = this.mapKeyFn(t), n = this.inner[e];
            if (void 0 === n) return !1;
            for (let s = 0; s < n.length; s++) if (this.equalsFn(n[s][0], t)) return 1 === n.length ? delete this.inner[e] : n.splice(s, 1), 
            this.innerSize--, !0;
            return !1;
        }
        forEach(t) {
            lt(this.inner, ((e, n) => {
                for (const [e, s] of n) t(e, s);
            }));
        }
        isEmpty() {
            return ft(this.inner);
        }
        size() {
            return this.innerSize;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // An immutable sorted map implementation, based on a Left-leaning Red-Black
    // tree.
    class Mn {
        constructor(t, e) {
            this.comparator = t, this.root = e || Fn.EMPTY;
        }
        // Returns a copy of the map, with the specified key/value added or replaced.
        insert(t, e) {
            return new Mn(this.comparator, this.root.insert(t, e, this.comparator).copy(null, null, Fn.BLACK, null, null));
        }
        // Returns a copy of the map, with the specified key removed.
        remove(t) {
            return new Mn(this.comparator, this.root.remove(t, this.comparator).copy(null, null, Fn.BLACK, null, null));
        }
        // Returns the value of the node with the given key, or null.
        get(t) {
            let e = this.root;
            for (;!e.isEmpty(); ) {
                const n = this.comparator(t, e.key);
                if (0 === n) return e.value;
                n < 0 ? e = e.left : n > 0 && (e = e.right);
            }
            return null;
        }
        // Returns the index of the element in this sorted map, or -1 if it doesn't
        // exist.
        indexOf(t) {
            // Number of nodes that were pruned when descending right
            let e = 0, n = this.root;
            for (;!n.isEmpty(); ) {
                const s = this.comparator(t, n.key);
                if (0 === s) return e + n.left.size;
                s < 0 ? n = n.left : (
                // Count all nodes left of the node plus the node itself
                e += n.left.size + 1, n = n.right);
            }
            // Node not found
                    return -1;
        }
        isEmpty() {
            return this.root.isEmpty();
        }
        // Returns the total number of nodes in the map.
        get size() {
            return this.root.size;
        }
        // Returns the minimum key in the map.
        minKey() {
            return this.root.minKey();
        }
        // Returns the maximum key in the map.
        maxKey() {
            return this.root.maxKey();
        }
        // Traverses the map in key order and calls the specified action function
        // for each key/value pair. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        inorderTraversal(t) {
            return this.root.inorderTraversal(t);
        }
        forEach(t) {
            this.inorderTraversal(((e, n) => (t(e, n), !1)));
        }
        toString() {
            const t = [];
            return this.inorderTraversal(((e, n) => (t.push(`${e}:${n}`), !1))), `{${t.join(", ")}}`;
        }
        // Traverses the map in reverse key order and calls the specified action
        // function for each key/value pair. If action returns true, traversal is
        // aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        reverseTraversal(t) {
            return this.root.reverseTraversal(t);
        }
        // Returns an iterator over the SortedMap.
        getIterator() {
            return new On(this.root, null, this.comparator, !1);
        }
        getIteratorFrom(t) {
            return new On(this.root, t, this.comparator, !1);
        }
        getReverseIterator() {
            return new On(this.root, null, this.comparator, !0);
        }
        getReverseIteratorFrom(t) {
            return new On(this.root, t, this.comparator, !0);
        }
    }

     // end SortedMap
    // An iterator over an LLRBNode.
    class On {
        constructor(t, e, n, s) {
            this.isReverse = s, this.nodeStack = [];
            let i = 1;
            for (;!t.isEmpty(); ) if (i = e ? n(t.key, e) : 1, 
            // flip the comparison if we're going in reverse
            e && s && (i *= -1), i < 0) 
            // This node is less than our start key. ignore it
            t = this.isReverse ? t.left : t.right; else {
                if (0 === i) {
                    // This node is exactly equal to our start key. Push it on the stack,
                    // but stop iterating;
                    this.nodeStack.push(t);
                    break;
                }
                // This node is greater than our start key, add it to the stack and move
                // to the next one
                this.nodeStack.push(t), t = this.isReverse ? t.right : t.left;
            }
        }
        getNext() {
            let t = this.nodeStack.pop();
            const e = {
                key: t.key,
                value: t.value
            };
            if (this.isReverse) for (t = t.left; !t.isEmpty(); ) this.nodeStack.push(t), t = t.right; else for (t = t.right; !t.isEmpty(); ) this.nodeStack.push(t), 
            t = t.left;
            return e;
        }
        hasNext() {
            return this.nodeStack.length > 0;
        }
        peek() {
            if (0 === this.nodeStack.length) return null;
            const t = this.nodeStack[this.nodeStack.length - 1];
            return {
                key: t.key,
                value: t.value
            };
        }
    }

     // end SortedMapIterator
    // Represents a node in a Left-leaning Red-Black tree.
    class Fn {
        constructor(t, e, n, s, i) {
            this.key = t, this.value = e, this.color = null != n ? n : Fn.RED, this.left = null != s ? s : Fn.EMPTY, 
            this.right = null != i ? i : Fn.EMPTY, this.size = this.left.size + 1 + this.right.size;
        }
        // Returns a copy of the current node, optionally replacing pieces of it.
        copy(t, e, n, s, i) {
            return new Fn(null != t ? t : this.key, null != e ? e : this.value, null != n ? n : this.color, null != s ? s : this.left, null != i ? i : this.right);
        }
        isEmpty() {
            return !1;
        }
        // Traverses the tree in key order and calls the specified action function
        // for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        inorderTraversal(t) {
            return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
        }
        // Traverses the tree in reverse key order and calls the specified action
        // function for each node. If action returns true, traversal is aborted.
        // Returns the first truthy value returned by action, or the last falsey
        // value returned by action.
        reverseTraversal(t) {
            return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
        }
        // Returns the minimum node in the tree.
        min() {
            return this.left.isEmpty() ? this : this.left.min();
        }
        // Returns the maximum key in the tree.
        minKey() {
            return this.min().key;
        }
        // Returns the maximum key in the tree.
        maxKey() {
            return this.right.isEmpty() ? this.key : this.right.maxKey();
        }
        // Returns new tree, with the key/value added.
        insert(t, e, n) {
            let s = this;
            const i = n(t, s.key);
            return s = i < 0 ? s.copy(null, null, null, s.left.insert(t, e, n), null) : 0 === i ? s.copy(null, e, null, null, null) : s.copy(null, null, null, null, s.right.insert(t, e, n)), 
            s.fixUp();
        }
        removeMin() {
            if (this.left.isEmpty()) return Fn.EMPTY;
            let t = this;
            return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), 
            t.fixUp();
        }
        // Returns new tree, with the specified item removed.
        remove(t, e) {
            let n, s = this;
            if (e(t, s.key) < 0) s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), 
            s = s.copy(null, null, null, s.left.remove(t, e), null); else {
                if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), 
                0 === e(t, s.key)) {
                    if (s.right.isEmpty()) return Fn.EMPTY;
                    n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.removeMin());
                }
                s = s.copy(null, null, null, null, s.right.remove(t, e));
            }
            return s.fixUp();
        }
        isRed() {
            return this.color;
        }
        // Returns new tree after performing any needed rotations.
        fixUp() {
            let t = this;
            return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), 
            t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
        }
        moveRedLeft() {
            let t = this.colorFlip();
            return t.right.left.isRed() && (t = t.copy(null, null, null, null, t.right.rotateRight()), 
            t = t.rotateLeft(), t = t.colorFlip()), t;
        }
        moveRedRight() {
            let t = this.colorFlip();
            return t.left.left.isRed() && (t = t.rotateRight(), t = t.colorFlip()), t;
        }
        rotateLeft() {
            const t = this.copy(null, null, Fn.RED, null, this.right.left);
            return this.right.copy(null, null, this.color, t, null);
        }
        rotateRight() {
            const t = this.copy(null, null, Fn.RED, this.left.right, null);
            return this.left.copy(null, null, this.color, null, t);
        }
        colorFlip() {
            const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
            return this.copy(null, null, !this.color, t, e);
        }
        // For testing.
        checkMaxDepth() {
            const t = this.check();
            return Math.pow(2, t) <= this.size + 1;
        }
        // In a balanced RB tree, the black-depth (number of black nodes) from root to
        // leaves is equal on both sides.  This function verifies that or asserts.
        check() {
            if (this.isRed() && this.left.isRed()) throw L();
            if (this.right.isRed()) throw L();
            const t = this.left.check();
            if (t !== this.right.check()) throw L();
            return t + (this.isRed() ? 0 : 1);
        }
    }

     // end LLRBNode
    // Empty node is shared between all LLRB trees.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Fn.EMPTY = null, Fn.RED = !0, Fn.BLACK = !1;

    // end LLRBEmptyNode
    Fn.EMPTY = new 
    // Represents an empty node (a leaf node in the Red-Black Tree).
    class {
        constructor() {
            this.size = 0;
        }
        get key() {
            throw L();
        }
        get value() {
            throw L();
        }
        get color() {
            throw L();
        }
        get left() {
            throw L();
        }
        get right() {
            throw L();
        }
        // Returns a copy of the current node.
        copy(t, e, n, s, i) {
            return this;
        }
        // Returns a copy of the tree, with the specified key/value added.
        insert(t, e, n) {
            return new Fn(t, e);
        }
        // Returns a copy of the tree, with the specified key removed.
        remove(t, e) {
            return this;
        }
        isEmpty() {
            return !0;
        }
        inorderTraversal(t) {
            return !1;
        }
        reverseTraversal(t) {
            return !1;
        }
        minKey() {
            return null;
        }
        maxKey() {
            return null;
        }
        isRed() {
            return !1;
        }
        // For testing.
        checkMaxDepth() {
            return !0;
        }
        check() {
            return 0;
        }
    };

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * SortedSet is an immutable (copy-on-write) collection that holds elements
     * in order specified by the provided comparator.
     *
     * NOTE: if provided comparator returns 0 for two elements, we consider them to
     * be equal!
     */
    class $n {
        constructor(t) {
            this.comparator = t, this.data = new Mn(this.comparator);
        }
        has(t) {
            return null !== this.data.get(t);
        }
        first() {
            return this.data.minKey();
        }
        last() {
            return this.data.maxKey();
        }
        get size() {
            return this.data.size;
        }
        indexOf(t) {
            return this.data.indexOf(t);
        }
        /** Iterates elements in order defined by "comparator" */    forEach(t) {
            this.data.inorderTraversal(((e, n) => (t(e), !1)));
        }
        /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */    forEachInRange(t, e) {
            const n = this.data.getIteratorFrom(t[0]);
            for (;n.hasNext(); ) {
                const s = n.getNext();
                if (this.comparator(s.key, t[1]) >= 0) return;
                e(s.key);
            }
        }
        /**
         * Iterates over `elem`s such that: start &lt;= elem until false is returned.
         */    forEachWhile(t, e) {
            let n;
            for (n = void 0 !== e ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) {
                if (!t(n.getNext().key)) return;
            }
        }
        /** Finds the least element greater than or equal to `elem`. */    firstAfterOrEqual(t) {
            const e = this.data.getIteratorFrom(t);
            return e.hasNext() ? e.getNext().key : null;
        }
        getIterator() {
            return new Bn(this.data.getIterator());
        }
        getIteratorFrom(t) {
            return new Bn(this.data.getIteratorFrom(t));
        }
        /** Inserts or updates an element */    add(t) {
            return this.copy(this.data.remove(t).insert(t, !0));
        }
        /** Deletes an element */    delete(t) {
            return this.has(t) ? this.copy(this.data.remove(t)) : this;
        }
        isEmpty() {
            return this.data.isEmpty();
        }
        unionWith(t) {
            let e = this;
            // Make sure `result` always refers to the larger one of the two sets.
                    return e.size < t.size && (e = t, t = this), t.forEach((t => {
                e = e.add(t);
            })), e;
        }
        isEqual(t) {
            if (!(t instanceof $n)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.data.getIterator(), n = t.data.getIterator();
            for (;e.hasNext(); ) {
                const t = e.getNext().key, s = n.getNext().key;
                if (0 !== this.comparator(t, s)) return !1;
            }
            return !0;
        }
        toArray() {
            const t = [];
            return this.forEach((e => {
                t.push(e);
            })), t;
        }
        toString() {
            const t = [];
            return this.forEach((e => t.push(e))), "SortedSet(" + t.toString() + ")";
        }
        copy(t) {
            const e = new $n(this.comparator);
            return e.data = t, e;
        }
    }

    class Bn {
        constructor(t) {
            this.iter = t;
        }
        getNext() {
            return this.iter.getNext().key;
        }
        hasNext() {
            return this.iter.hasNext();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Un = new Mn(xt.comparator);

    function qn() {
        return Un;
    }

    const Gn = new Mn(xt.comparator);

    function Kn() {
        return Gn;
    }

    function Qn() {
        return new kn((t => t.toString()), ((t, e) => t.isEqual(e)));
    }

    const jn = new Mn(xt.comparator);

    const Wn = new $n(xt.comparator);

    function zn(...t) {
        let e = Wn;
        for (const n of t) e = e.add(n);
        return e;
    }

    const Hn = new $n(rt);

    function Jn() {
        return Hn;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An event from the RemoteStore. It is split into targetChanges (changes to the
     * state or the set of documents in our watched targets) and documentUpdates
     * (changes to the actual documents).
     */ class Yn {
        constructor(
        /**
         * The snapshot version this event brings us up to, or MIN if not set.
         */
        t, 
        /**
         * A map from target to changes to the target. See TargetChange.
         */
        e, 
        /**
         * A set of targets that is known to be inconsistent. Listens for these
         * targets should be re-established without resume tokens.
         */
        n, 
        /**
         * A set of which documents have changed or been deleted, along with the
         * doc's new values (if not deleted).
         */
        s, 
        /**
         * A set of which document updates are due only to limbo resolution targets.
         */
        i) {
            this.snapshotVersion = t, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = s, 
            this.resolvedLimboDocuments = i;
        }
        /**
         * HACK: Views require RemoteEvents in order to determine whether the view is
         * CURRENT, but secondary tabs don't receive remote events. So this method is
         * used to create a synthesized RemoteEvent that can be used to apply a
         * CURRENT status change to a View, for queries executed in a different tab.
         */
        // PORTING NOTE: Multi-tab only
        static createSynthesizedRemoteEventForCurrentChange(t, e) {
            const n = new Map;
            return n.set(t, Xn.createSynthesizedTargetChangeForCurrentChange(t, e)), new Yn(ct.min(), n, Jn(), qn(), zn());
        }
    }

    /**
     * A TargetChange specifies the set of changes for a specific target as part of
     * a RemoteEvent. These changes track which documents are added, modified or
     * removed, as well as the target's resume token and whether the target is
     * marked CURRENT.
     * The actual changes *to* documents are not part of the TargetChange since
     * documents may be part of multiple targets.
     */ class Xn {
        constructor(
        /**
         * An opaque, server-assigned token that allows watching a query to be resumed
         * after disconnecting without retransmitting all the data that matches the
         * query. The resume token essentially identifies a point in time from which
         * the server should resume sending results.
         */
        t, 
        /**
         * The "current" (synced) status of this target. Note that "current"
         * has special meaning in the RPC protocol that implies that a target is
         * both up-to-date and consistent with the rest of the watch stream.
         */
        e, 
        /**
         * The set of documents that were newly assigned to this target as part of
         * this remote event.
         */
        n, 
        /**
         * The set of documents that were already assigned to this target but received
         * an update during this remote event.
         */
        s, 
        /**
         * The set of documents that were removed from this target as part of this
         * remote event.
         */
        i) {
            this.resumeToken = t, this.current = e, this.addedDocuments = n, this.modifiedDocuments = s, 
            this.removedDocuments = i;
        }
        /**
         * This method is used to create a synthesized TargetChanges that can be used to
         * apply a CURRENT status change to a View (for queries executed in a different
         * tab) or for new queries (to raise snapshots with correct CURRENT status).
         */    static createSynthesizedTargetChangeForCurrentChange(t, e) {
            return new Xn(pt.EMPTY_BYTE_STRING, e, zn(), zn(), zn());
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents a changed document and a list of target ids to which this change
     * applies.
     *
     * If document has been deleted NoDocument will be provided.
     */ class Zn {
        constructor(
        /** The new document applies to all of these targets. */
        t, 
        /** The new document is removed from all of these targets. */
        e, 
        /** The key of the document for this change. */
        n, 
        /**
         * The new document or NoDocument if it was deleted. Is null if the
         * document went out of view without the server sending a new document.
         */
        s) {
            this.O = t, this.removedTargetIds = e, this.key = n, this.F = s;
        }
    }

    class ts {
        constructor(t, e) {
            this.targetId = t, this.$ = e;
        }
    }

    class es {
        constructor(
        /** What kind of change occurred to the watch target. */
        t, 
        /** The target IDs that were added/removed/set. */
        e, 
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */
        n = pt.EMPTY_BYTE_STRING
        /** An RPC error indicating why the watch failed. */ , s = null) {
            this.state = t, this.targetIds = e, this.resumeToken = n, this.cause = s;
        }
    }

    /** Tracks the internal state of a Watch target. */ class ns {
        constructor() {
            /**
             * The number of pending responses (adds or removes) that we are waiting on.
             * We only consider targets active that have no pending responses.
             */
            this.B = 0, 
            /**
             * Keeps track of the document changes since the last raised snapshot.
             *
             * These changes are continuously updated as we receive document updates and
             * always reflect the current set of changes against the last issued snapshot.
             */
            this.L = rs(), 
            /** See public getters for explanations of these fields. */
            this.U = pt.EMPTY_BYTE_STRING, this.q = !1, 
            /**
             * Whether this target state should be included in the next snapshot. We
             * initialize to true so that newly-added targets are included in the next
             * RemoteEvent.
             */
            this.G = !0;
        }
        /**
         * Whether this target has been marked 'current'.
         *
         * 'Current' has special meaning in the RPC protocol: It implies that the
         * Watch backend has sent us all changes up to the point at which the target
         * was added and that the target is consistent with the rest of the watch
         * stream.
         */    get current() {
            return this.q;
        }
        /** The last resume token sent to us for this target. */    get resumeToken() {
            return this.U;
        }
        /** Whether this target has pending target adds or target removes. */    get K() {
            return 0 !== this.B;
        }
        /** Whether we have modified any state that should trigger a snapshot. */    get j() {
            return this.G;
        }
        /**
         * Applies the resume token to the TargetChange, but only when it has a new
         * value. Empty resumeTokens are discarded.
         */    W(t) {
            t.approximateByteSize() > 0 && (this.G = !0, this.U = t);
        }
        /**
         * Creates a target change from the current set of changes.
         *
         * To reset the document changes after raising this snapshot, call
         * `clearPendingChanges()`.
         */    H() {
            let t = zn(), e = zn(), n = zn();
            return this.L.forEach(((s, i) => {
                switch (i) {
                  case 0 /* Added */ :
                    t = t.add(s);
                    break;

                  case 2 /* Modified */ :
                    e = e.add(s);
                    break;

                  case 1 /* Removed */ :
                    n = n.add(s);
                    break;

                  default:
                    L();
                }
            })), new Xn(this.U, this.q, t, e, n);
        }
        /**
         * Resets the document changes and sets `hasPendingChanges` to false.
         */    J() {
            this.G = !1, this.L = rs();
        }
        Y(t, e) {
            this.G = !0, this.L = this.L.insert(t, e);
        }
        X(t) {
            this.G = !0, this.L = this.L.remove(t);
        }
        Z() {
            this.B += 1;
        }
        tt() {
            this.B -= 1;
        }
        et() {
            this.G = !0, this.q = !0;
        }
    }

    /**
     * A helper class to accumulate watch changes into a RemoteEvent.
     */
    class ss {
        constructor(t) {
            this.nt = t, 
            /** The internal state of all tracked targets. */
            this.st = new Map, 
            /** Keeps track of the documents to update since the last raised snapshot. */
            this.it = qn(), 
            /** A mapping of document keys to their set of target IDs. */
            this.rt = is(), 
            /**
             * A list of targets with existence filter mismatches. These targets are
             * known to be inconsistent and their listens needs to be re-established by
             * RemoteStore.
             */
            this.ot = new $n(rt);
        }
        /**
         * Processes and adds the DocumentWatchChange to the current set of changes.
         */    ut(t) {
            for (const e of t.O) t.F && t.F.isFoundDocument() ? this.at(e, t.F) : this.ct(e, t.key, t.F);
            for (const e of t.removedTargetIds) this.ct(e, t.key, t.F);
        }
        /** Processes and adds the WatchTargetChange to the current set of changes. */    ht(t) {
            this.forEachTarget(t, (e => {
                const n = this.lt(e);
                switch (t.state) {
                  case 0 /* NoChange */ :
                    this.ft(e) && n.W(t.resumeToken);
                    break;

                  case 1 /* Added */ :
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.tt(), n.K || 
                    // We have a freshly added target, so we need to reset any state
                    // that we had previously. This can happen e.g. when remove and add
                    // back a target for existence filter mismatches.
                    n.J(), n.W(t.resumeToken);
                    break;

                  case 2 /* Removed */ :
                    // We need to keep track of removed targets to we can post-filter and
                    // remove any target changes.
                    // We need to decrement the number of pending acks needed from watch
                    // for this targetId.
                    n.tt(), n.K || this.removeTarget(e);
                    break;

                  case 3 /* Current */ :
                    this.ft(e) && (n.et(), n.W(t.resumeToken));
                    break;

                  case 4 /* Reset */ :
                    this.ft(e) && (
                    // Reset the target and synthesizes removes for all existing
                    // documents. The backend will re-add any documents that still
                    // match the target before it sends the next global snapshot.
                    this.dt(e), n.W(t.resumeToken));
                    break;

                  default:
                    L();
                }
            }));
        }
        /**
         * Iterates over all targetIds that the watch change applies to: either the
         * targetIds explicitly listed in the change or the targetIds of all currently
         * active targets.
         */    forEachTarget(t, e) {
            t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.st.forEach(((t, n) => {
                this.ft(n) && e(n);
            }));
        }
        /**
         * Handles existence filters and synthesizes deletes for filter mismatches.
         * Targets that are invalidated by filter mismatches are added to
         * `pendingTargetResets`.
         */    _t(t) {
            const e = t.targetId, n = t.$.count, s = this.wt(e);
            if (s) {
                const t = s.target;
                if (we(t)) if (0 === n) {
                    // The existence filter told us the document does not exist. We deduce
                    // that this document does not exist and apply a deleted document to
                    // our updates. Without applying this deleted document there might be
                    // another query that will raise this document as part of a snapshot
                    // until it is resolved, essentially exposing inconsistency between
                    // queries.
                    const n = new xt(t.path);
                    this.ct(e, n, te.newNoDocument(n, ct.min()));
                } else U(1 === n); else {
                    this.gt(e) !== n && (
                    // Existence filter mismatch: We reset the mapping and raise a new
                    // snapshot with `isFromCache:true`.
                    this.dt(e), this.ot = this.ot.add(e));
                }
            }
        }
        /**
         * Converts the currently accumulated state into a remote event at the
         * provided snapshot version. Resets the accumulated changes before returning.
         */    yt(t) {
            const e = new Map;
            this.st.forEach(((n, s) => {
                const i = this.wt(s);
                if (i) {
                    if (n.current && we(i.target)) {
                        // Document queries for document that don't exist can produce an empty
                        // result set. To update our local cache, we synthesize a document
                        // delete if we have not previously received the document. This
                        // resolves the limbo state of the document, removing it from
                        // limboDocumentRefs.
                        // TODO(dimond): Ideally we would have an explicit lookup target
                        // instead resulting in an explicit delete message and we could
                        // remove this special logic.
                        const e = new xt(i.target.path);
                        null !== this.it.get(e) || this.It(s, e) || this.ct(s, e, te.newNoDocument(e, t));
                    }
                    n.j && (e.set(s, n.H()), n.J());
                }
            }));
            let n = zn();
            // We extract the set of limbo-only document updates as the GC logic
            // special-cases documents that do not appear in the target cache.
            
            // TODO(gsoltis): Expand on this comment once GC is available in the JS
            // client.
                    this.rt.forEach(((t, e) => {
                let s = !0;
                e.forEachWhile((t => {
                    const e = this.wt(t);
                    return !e || 2 /* LimboResolution */ === e.purpose || (s = !1, !1);
                })), s && (n = n.add(t));
            })), this.it.forEach(((e, n) => n.setReadTime(t)));
            const s = new Yn(t, e, this.ot, this.it, n);
            return this.it = qn(), this.rt = is(), this.ot = new $n(rt), s;
        }
        /**
         * Adds the provided document to the internal list of document updates and
         * its document key to the given target's mapping.
         */
        // Visible for testing.
        at(t, e) {
            if (!this.ft(t)) return;
            const n = this.It(t, e.key) ? 2 /* Modified */ : 0 /* Added */;
            this.lt(t).Y(e.key, n), this.it = this.it.insert(e.key, e), this.rt = this.rt.insert(e.key, this.Tt(e.key).add(t));
        }
        /**
         * Removes the provided document from the target mapping. If the
         * document no longer matches the target, but the document's state is still
         * known (e.g. we know that the document was deleted or we received the change
         * that caused the filter mismatch), the new document can be provided
         * to update the remote document cache.
         */
        // Visible for testing.
        ct(t, e, n) {
            if (!this.ft(t)) return;
            const s = this.lt(t);
            this.It(t, e) ? s.Y(e, 1 /* Removed */) : 
            // The document may have entered and left the target before we raised a
            // snapshot, so we can just ignore the change.
            s.X(e), this.rt = this.rt.insert(e, this.Tt(e).delete(t)), n && (this.it = this.it.insert(e, n));
        }
        removeTarget(t) {
            this.st.delete(t);
        }
        /**
         * Returns the current count of documents in the target. This includes both
         * the number of documents that the LocalStore considers to be part of the
         * target as well as any accumulated changes.
         */    gt(t) {
            const e = this.lt(t).H();
            return this.nt.getRemoteKeysForTarget(t).size + e.addedDocuments.size - e.removedDocuments.size;
        }
        /**
         * Increment the number of acks needed from watch before we can consider the
         * server to be 'in-sync' with the client's active targets.
         */    Z(t) {
            this.lt(t).Z();
        }
        lt(t) {
            let e = this.st.get(t);
            return e || (e = new ns, this.st.set(t, e)), e;
        }
        Tt(t) {
            let e = this.rt.get(t);
            return e || (e = new $n(rt), this.rt = this.rt.insert(t, e)), e;
        }
        /**
         * Verifies that the user is still interested in this target (by calling
         * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
         * from watch.
         */    ft(t) {
            const e = null !== this.wt(t);
            return e || O("WatchChangeAggregator", "Detected inactive target", t), e;
        }
        /**
         * Returns the TargetData for an active target (i.e. a target that the user
         * is still interested in that has no outstanding target change requests).
         */    wt(t) {
            const e = this.st.get(t);
            return e && e.K ? null : this.nt.Et(t);
        }
        /**
         * Resets the state of a Watch target to its initial state (e.g. sets
         * 'current' to false, clears the resume token and removes its target mapping
         * from all documents).
         */    dt(t) {
            this.st.set(t, new ns);
            this.nt.getRemoteKeysForTarget(t).forEach((e => {
                this.ct(t, e, /*updatedDocument=*/ null);
            }));
        }
        /**
         * Returns whether the LocalStore considers the document to be part of the
         * specified target.
         */    It(t, e) {
            return this.nt.getRemoteKeysForTarget(t).has(e);
        }
    }

    function is() {
        return new Mn(xt.comparator);
    }

    function rs() {
        return new Mn(xt.comparator);
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const os = (() => {
        const t = {
            asc: "ASCENDING",
            desc: "DESCENDING"
        };
        return t;
    })(), us = (() => {
        const t = {
            "<": "LESS_THAN",
            "<=": "LESS_THAN_OR_EQUAL",
            ">": "GREATER_THAN",
            ">=": "GREATER_THAN_OR_EQUAL",
            "==": "EQUAL",
            "!=": "NOT_EQUAL",
            "array-contains": "ARRAY_CONTAINS",
            in: "IN",
            "not-in": "NOT_IN",
            "array-contains-any": "ARRAY_CONTAINS_ANY"
        };
        return t;
    })();

    /**
     * This class generates JsonObject values for the Datastore API suitable for
     * sending to either GRPC stub methods or via the JSON/HTTP REST API.
     *
     * The serializer supports both Protobuf.js and Proto3 JSON formats. By
     * setting `useProto3Json` to true, the serializer will use the Proto3 JSON
     * format.
     *
     * For a description of the Proto3 JSON format check
     * https://developers.google.com/protocol-buffers/docs/proto3#json
     *
     * TODO(klimt): We can remove the databaseId argument if we keep the full
     * resource name in documents.
     */
    class as {
        constructor(t, e) {
            this.databaseId = t, this.N = e;
        }
    }

    /**
     * Returns a value for a Date that's appropriate to put into a proto.
     */
    function cs(t, e) {
        if (t.N) {
            return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
        }
        return {
            seconds: "" + e.seconds,
            nanos: e.nanoseconds
        };
    }

    /**
     * Returns a value for bytes that's appropriate to put in a proto.
     *
     * Visible for testing.
     */
    function hs(t, e) {
        return t.N ? e.toBase64() : e.toUint8Array();
    }

    /**
     * Returns a ByteString based on the proto string value.
     */ function ls(t, e) {
        return cs(t, e.toTimestamp());
    }

    function fs(t) {
        return U(!!t), ct.fromTimestamp(function(t) {
            const e = Tt(t);
            return new at(e.seconds, e.nanos);
        }(t));
    }

    function ds(t, e) {
        return function(t) {
            return new _t([ "projects", t.projectId, "databases", t.database ]);
        }(t).child("documents").child(e).canonicalString();
    }

    function _s(t) {
        const e = _t.fromString(t);
        return U(Ls(e)), e;
    }

    function ws(t, e) {
        return ds(t.databaseId, e.path);
    }

    function ms(t, e) {
        const n = _s(e);
        if (n.get(1) !== t.databaseId.projectId) throw new Q(K.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t.databaseId.projectId);
        if (n.get(3) !== t.databaseId.database) throw new Q(K.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t.databaseId.database);
        return new xt(Is(n));
    }

    function gs(t, e) {
        return ds(t.databaseId, e);
    }

    function ys(t) {
        const e = _s(t);
        // In v1beta1 queries for collections at the root did not have a trailing
        // "/documents". In v1 all resource paths contain "/documents". Preserve the
        // ability to read the v1beta1 form for compatibility with queries persisted
        // in the local target cache.
            return 4 === e.length ? _t.emptyPath() : Is(e);
    }

    function ps(t) {
        return new _t([ "projects", t.databaseId.projectId, "databases", t.databaseId.database ]).canonicalString();
    }

    function Is(t) {
        return U(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
    }

    /** Creates a Document proto from key and fields (but no create/update time) */ function Ts(t, e, n) {
        return {
            name: ws(t, e),
            fields: n.value.mapValue.fields
        };
    }

    function Rs(t, e) {
        let n;
        if ("targetChange" in e) {
            e.targetChange;
            // proto3 default value is unset in JSON (undefined), so use 'NO_CHANGE'
            // if unset
            const s = function(t) {
                return "NO_CHANGE" === t ? 0 /* NoChange */ : "ADD" === t ? 1 /* Added */ : "REMOVE" === t ? 2 /* Removed */ : "CURRENT" === t ? 3 /* Current */ : "RESET" === t ? 4 /* Reset */ : L();
            }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r = function(t, e) {
                return t.N ? (U(void 0 === e || "string" == typeof e), pt.fromBase64String(e || "")) : (U(void 0 === e || e instanceof Uint8Array), 
                pt.fromUint8Array(e || new Uint8Array));
            }(t, e.targetChange.resumeToken), o = e.targetChange.cause, u = o && function(t) {
                const e = void 0 === t.code ? K.UNKNOWN : Nn(t.code);
                return new Q(e, t.message || "");
            }
            /**
     * Returns a value for a number (or null) that's appropriate to put into
     * a google.protobuf.Int32Value proto.
     * DO NOT USE THIS FOR ANYTHING ELSE.
     * This method cheats. It's typed as returning "number" because that's what
     * our generated proto interfaces say Int32Value must be. But GRPC actually
     * expects a { value: <number> } struct.
     */ (o);
            n = new es(s, i, r, u || null);
        } else if ("documentChange" in e) {
            e.documentChange;
            const s = e.documentChange;
            s.document, s.document.name, s.document.updateTime;
            const i = ms(t, s.document.name), r = fs(s.document.updateTime), o = new Xt({
                mapValue: {
                    fields: s.document.fields
                }
            }), u = te.newFoundDocument(i, r, o), a = s.targetIds || [], c = s.removedTargetIds || [];
            n = new Zn(a, c, u.key, u);
        } else if ("documentDelete" in e) {
            e.documentDelete;
            const s = e.documentDelete;
            s.document;
            const i = ms(t, s.document), r = s.readTime ? fs(s.readTime) : ct.min(), o = te.newNoDocument(i, r), u = s.removedTargetIds || [];
            n = new Zn([], u, o.key, o);
        } else if ("documentRemove" in e) {
            e.documentRemove;
            const s = e.documentRemove;
            s.document;
            const i = ms(t, s.document), r = s.removedTargetIds || [];
            n = new Zn([], r, i, null);
        } else {
            if (!("filter" in e)) return L();
            {
                e.filter;
                const t = e.filter;
                t.targetId;
                const s = t.count || 0, i = new Sn(s), r = t.targetId;
                n = new ts(r, i);
            }
        }
        return n;
    }

    function bs(t, e) {
        let n;
        if (e instanceof En) n = {
            update: Ts(t, e.key, e.value)
        }; else if (e instanceof Vn) n = {
            delete: ws(t, e.key)
        }; else if (e instanceof An) n = {
            update: Ts(t, e.key, e.data),
            updateMask: Bs(e.fieldMask)
        }; else {
            if (!(e instanceof vn)) return L();
            n = {
                verify: ws(t, e.key)
            };
        }
        return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((t => function(t, e) {
            const n = e.transform;
            if (n instanceof nn) return {
                fieldPath: e.field.canonicalString(),
                setToServerValue: "REQUEST_TIME"
            };
            if (n instanceof sn) return {
                fieldPath: e.field.canonicalString(),
                appendMissingElements: {
                    values: n.elements
                }
            };
            if (n instanceof on) return {
                fieldPath: e.field.canonicalString(),
                removeAllFromArray: {
                    values: n.elements
                }
            };
            if (n instanceof an) return {
                fieldPath: e.field.canonicalString(),
                increment: n.k
            };
            throw L();
        }(0, t)))), e.precondition.isNone || (n.currentDocument = function(t, e) {
            return void 0 !== e.updateTime ? {
                updateTime: ls(t, e.updateTime)
            } : void 0 !== e.exists ? {
                exists: e.exists
            } : L();
        }(t, e.precondition)), n;
    }

    function Vs(t, e) {
        return t && t.length > 0 ? (U(void 0 !== e), t.map((t => function(t, e) {
            // NOTE: Deletes don't have an updateTime.
            let n = t.updateTime ? fs(t.updateTime) : fs(e);
            return n.isEqual(ct.min()) && (
            // The Firestore Emulator currently returns an update time of 0 for
            // deletes of non-existing documents (rather than null). This breaks the
            // test "get deleted doc while offline with source=cache" as NoDocuments
            // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
            // TODO(#2149): Remove this when Emulator is fixed
            n = fs(e)), new dn(n, t.transformResults || []);
        }(t, e)))) : [];
    }

    function vs(t, e) {
        return {
            documents: [ gs(t, e.path) ]
        };
    }

    function Ss(t, e) {
        // Dissect the path into parent, collectionId, and optional key filter.
        const n = {
            structuredQuery: {}
        }, s = e.path;
        null !== e.collectionGroup ? (n.parent = gs(t, s), n.structuredQuery.from = [ {
            collectionId: e.collectionGroup,
            allDescendants: !0
        } ]) : (n.parent = gs(t, s.popLast()), n.structuredQuery.from = [ {
            collectionId: s.lastSegment()
        } ]);
        const i = function(t) {
            if (0 === t.length) return;
            const e = t.map((t => 
            // visible for testing
            function(t) {
                if ("==" /* EQUAL */ === t.op) {
                    if (jt(t.value)) return {
                        unaryFilter: {
                            field: Ms(t.field),
                            op: "IS_NAN"
                        }
                    };
                    if (Qt(t.value)) return {
                        unaryFilter: {
                            field: Ms(t.field),
                            op: "IS_NULL"
                        }
                    };
                } else if ("!=" /* NOT_EQUAL */ === t.op) {
                    if (jt(t.value)) return {
                        unaryFilter: {
                            field: Ms(t.field),
                            op: "IS_NOT_NAN"
                        }
                    };
                    if (Qt(t.value)) return {
                        unaryFilter: {
                            field: Ms(t.field),
                            op: "IS_NOT_NULL"
                        }
                    };
                }
                return {
                    fieldFilter: {
                        field: Ms(t.field),
                        op: ks(t.op),
                        value: t.value
                    }
                };
            }(t)));
            if (1 === e.length) return e[0];
            return {
                compositeFilter: {
                    op: "AND",
                    filters: e
                }
            };
        }(e.filters);
        i && (n.structuredQuery.where = i);
        const r = function(t) {
            if (0 === t.length) return;
            return t.map((t => 
            // visible for testing
            function(t) {
                return {
                    field: Ms(t.field),
                    direction: Ns(t.dir)
                };
            }(t)));
        }(e.orderBy);
        r && (n.structuredQuery.orderBy = r);
        const o = function(t, e) {
            return t.N || St(e) ? e : {
                value: e
            };
        }
        /**
     * Returns a number (or null) from a google.protobuf.Int32Value proto.
     */ (t, e.limit);
        var u;
        return null !== o && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = {
            before: (u = e.startAt).inclusive,
            values: u.position
        }), e.endAt && (n.structuredQuery.endAt = function(t) {
            return {
                before: !t.inclusive,
                values: t.position
            };
        }(e.endAt)), n;
    }

    function Ds(t) {
        let e = ys(t.parent);
        const n = t.structuredQuery, s = n.from ? n.from.length : 0;
        let i = null;
        if (s > 0) {
            U(1 === s);
            const t = n.from[0];
            t.allDescendants ? i = t.collectionId : e = e.child(t.collectionId);
        }
        let r = [];
        n.where && (r = xs(n.where));
        let o = [];
        n.orderBy && (o = n.orderBy.map((t => function(t) {
            return new Ve(Os(t.field), 
            // visible for testing
            function(t) {
                switch (t) {
                  case "ASCENDING":
                    return "asc" /* ASCENDING */;

                  case "DESCENDING":
                    return "desc" /* DESCENDING */;

                  default:
                    return;
                }
            }
            // visible for testing
            (t.direction));
        }(t))));
        let u = null;
        n.limit && (u = function(t) {
            let e;
            return e = "object" == typeof t ? t.value : t, St(e) ? null : e;
        }(n.limit));
        let a = null;
        n.startAt && (a = function(t) {
            const e = !!t.before, n = t.values || [];
            return new Pe(n, e);
        }(n.startAt));
        let c = null;
        return n.endAt && (c = function(t) {
            const e = !t.before, n = t.values || [];
            return new Pe(n, e);
        }
        // visible for testing
        (n.endAt)), xe(e, i, o, r, u, "F" /* First */ , a, c);
    }

    function Cs(t, e) {
        const n = function(t, e) {
            switch (e) {
              case 0 /* Listen */ :
                return null;

              case 1 /* ExistenceFilterMismatch */ :
                return "existence-filter-mismatch";

              case 2 /* LimboResolution */ :
                return "limbo-document";

              default:
                return L();
            }
        }(0, e.purpose);
        return null == n ? null : {
            "goog-listen-tags": n
        };
    }

    function xs(t) {
        return t ? void 0 !== t.unaryFilter ? [ $s(t) ] : void 0 !== t.fieldFilter ? [ Fs(t) ] : void 0 !== t.compositeFilter ? t.compositeFilter.filters.map((t => xs(t))).reduce(((t, e) => t.concat(e))) : L() : [];
    }

    function Ns(t) {
        return os[t];
    }

    function ks(t) {
        return us[t];
    }

    function Ms(t) {
        return {
            fieldPath: t.canonicalString()
        };
    }

    function Os(t) {
        return mt.fromServerFormat(t.fieldPath);
    }

    function Fs(t) {
        return ge.create(Os(t.fieldFilter.field), function(t) {
            switch (t) {
              case "EQUAL":
                return "==" /* EQUAL */;

              case "NOT_EQUAL":
                return "!=" /* NOT_EQUAL */;

              case "GREATER_THAN":
                return ">" /* GREATER_THAN */;

              case "GREATER_THAN_OR_EQUAL":
                return ">=" /* GREATER_THAN_OR_EQUAL */;

              case "LESS_THAN":
                return "<" /* LESS_THAN */;

              case "LESS_THAN_OR_EQUAL":
                return "<=" /* LESS_THAN_OR_EQUAL */;

              case "ARRAY_CONTAINS":
                return "array-contains" /* ARRAY_CONTAINS */;

              case "IN":
                return "in" /* IN */;

              case "NOT_IN":
                return "not-in" /* NOT_IN */;

              case "ARRAY_CONTAINS_ANY":
                return "array-contains-any" /* ARRAY_CONTAINS_ANY */;

              default:
                return L();
            }
        }(t.fieldFilter.op), t.fieldFilter.value);
    }

    function $s(t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            const e = Os(t.unaryFilter.field);
            return ge.create(e, "==" /* EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NULL":
            const n = Os(t.unaryFilter.field);
            return ge.create(n, "==" /* EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          case "IS_NOT_NAN":
            const s = Os(t.unaryFilter.field);
            return ge.create(s, "!=" /* NOT_EQUAL */ , {
                doubleValue: NaN
            });

          case "IS_NOT_NULL":
            const i = Os(t.unaryFilter.field);
            return ge.create(i, "!=" /* NOT_EQUAL */ , {
                nullValue: "NULL_VALUE"
            });

          default:
            return L();
        }
    }

    function Bs(t) {
        const e = [];
        return t.fields.forEach((t => e.push(t.canonicalString()))), {
            fieldPaths: e
        };
    }

    function Ls(t) {
        // Resource names have at least 4 components (project ID, database ID)
        return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const di = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";

    /**
     * A base class representing a persistence transaction, encapsulating both the
     * transaction's sequence numbers as well as a list of onCommitted listeners.
     *
     * When you call Persistence.runTransaction(), it will create a transaction and
     * pass it to your callback. You then pass it to any method that operates
     * on persistence.
     */ class _i {
        constructor() {
            this.onCommittedListeners = [];
        }
        addOnCommittedListener(t) {
            this.onCommittedListeners.push(t);
        }
        raiseOnCommittedEvent() {
            this.onCommittedListeners.forEach((t => t()));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * PersistencePromise is essentially a re-implementation of Promise except
     * it has a .next() method instead of .then() and .next() and .catch() callbacks
     * are executed synchronously when a PersistencePromise resolves rather than
     * asynchronously (Promise implementations use setImmediate() or similar).
     *
     * This is necessary to interoperate with IndexedDB which will automatically
     * commit transactions if control is returned to the event loop without
     * synchronously initiating another operation on the transaction.
     *
     * NOTE: .then() and .catch() only allow a single consumer, unlike normal
     * Promises.
     */ class wi {
        constructor(t) {
            // NOTE: next/catchCallback will always point to our own wrapper functions,
            // not the user's raw next() or catch() callbacks.
            this.nextCallback = null, this.catchCallback = null, 
            // When the operation resolves, we'll set result or error and mark isDone.
            this.result = void 0, this.error = void 0, this.isDone = !1, 
            // Set to true when .then() or .catch() are called and prevents additional
            // chaining.
            this.callbackAttached = !1, t((t => {
                this.isDone = !0, this.result = t, this.nextCallback && 
                // value should be defined unless T is Void, but we can't express
                // that in the type system.
                this.nextCallback(t);
            }), (t => {
                this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
            }));
        }
        catch(t) {
            return this.next(void 0, t);
        }
        next(t, e) {
            return this.callbackAttached && L(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(e, this.error) : this.wrapSuccess(t, this.result) : new wi(((n, s) => {
                this.nextCallback = e => {
                    this.wrapSuccess(t, e).next(n, s);
                }, this.catchCallback = t => {
                    this.wrapFailure(e, t).next(n, s);
                };
            }));
        }
        toPromise() {
            return new Promise(((t, e) => {
                this.next(t, e);
            }));
        }
        wrapUserFunction(t) {
            try {
                const e = t();
                return e instanceof wi ? e : wi.resolve(e);
            } catch (t) {
                return wi.reject(t);
            }
        }
        wrapSuccess(t, e) {
            return t ? this.wrapUserFunction((() => t(e))) : wi.resolve(e);
        }
        wrapFailure(t, e) {
            return t ? this.wrapUserFunction((() => t(e))) : wi.reject(e);
        }
        static resolve(t) {
            return new wi(((e, n) => {
                e(t);
            }));
        }
        static reject(t) {
            return new wi(((e, n) => {
                n(t);
            }));
        }
        static waitFor(
        // Accept all Promise types in waitFor().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t) {
            return new wi(((e, n) => {
                let s = 0, i = 0, r = !1;
                t.forEach((t => {
                    ++s, t.next((() => {
                        ++i, r && i === s && e();
                    }), (t => n(t)));
                })), r = !0, i === s && e();
            }));
        }
        /**
         * Given an array of predicate functions that asynchronously evaluate to a
         * boolean, implements a short-circuiting `or` between the results. Predicates
         * will be evaluated until one of them returns `true`, then stop. The final
         * result will be whether any of them returned `true`.
         */    static or(t) {
            let e = wi.resolve(!1);
            for (const n of t) e = e.next((t => t ? wi.resolve(t) : n()));
            return e;
        }
        static forEach(t, e) {
            const n = [];
            return t.forEach(((t, s) => {
                n.push(e.call(this, t, s));
            })), this.waitFor(n);
        }
    }

    /** Verifies whether `e` is an IndexedDbTransactionError. */ function Ii(t) {
        // Use name equality, as instanceof checks on errors don't work with errors
        // that wrap other errors.
        return "IndexedDbTransactionError" === t.name;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A batch of mutations that will be sent as one unit to the backend.
     */ class Vi {
        /**
         * @param batchId - The unique ID of this mutation batch.
         * @param localWriteTime - The original write time of this mutation.
         * @param baseMutations - Mutations that are used to populate the base
         * values when this mutation is applied locally. This can be used to locally
         * overwrite values that are persisted in the remote document cache. Base
         * mutations are never sent to the backend.
         * @param mutations - The user-provided mutations in this mutation batch.
         * User-provided mutations are applied both locally and remotely on the
         * backend.
         */
        constructor(t, e, n, s) {
            this.batchId = t, this.localWriteTime = e, this.baseMutations = n, this.mutations = s;
        }
        /**
         * Applies all the mutations in this MutationBatch to the specified document
         * to compute the state of the remote document
         *
         * @param document - The document to apply mutations to.
         * @param batchResult - The result of applying the MutationBatch to the
         * backend.
         */    applyToRemoteDocument(t, e) {
            const n = e.mutationResults;
            for (let e = 0; e < this.mutations.length; e++) {
                const s = this.mutations[e];
                if (s.key.isEqual(t.key)) {
                    gn(s, t, n[e]);
                }
            }
        }
        /**
         * Computes the local view of a document given all the mutations in this
         * batch.
         *
         * @param document - The document to apply mutations to.
         */    applyToLocalView(t) {
            // First, apply the base state. This allows us to apply non-idempotent
            // transform against a consistent set of values.
            for (const e of this.baseMutations) e.key.isEqual(t.key) && yn(e, t, this.localWriteTime);
            // Second, apply all user-provided mutations.
                    for (const e of this.mutations) e.key.isEqual(t.key) && yn(e, t, this.localWriteTime);
        }
        /**
         * Computes the local view for all provided documents given the mutations in
         * this batch.
         */    applyToLocalDocumentSet(t) {
            // TODO(mrschmidt): This implementation is O(n^2). If we apply the mutations
            // directly (as done in `applyToLocalView()`), we can reduce the complexity
            // to O(n).
            this.mutations.forEach((e => {
                const n = t.get(e.key), s = n;
                // TODO(mutabledocuments): This method should take a MutableDocumentMap
                // and we should remove this cast.
                            this.applyToLocalView(s), n.isValidDocument() || s.convertToNoDocument(ct.min());
            }));
        }
        keys() {
            return this.mutations.reduce(((t, e) => t.add(e.key)), zn());
        }
        isEqual(t) {
            return this.batchId === t.batchId && ot(this.mutations, t.mutations, ((t, e) => In(t, e))) && ot(this.baseMutations, t.baseMutations, ((t, e) => In(t, e)));
        }
    }

    /** The result of applying a mutation batch to the backend. */ class vi {
        constructor(t, e, n, 
        /**
         * A pre-computed mapping from each mutated document to the resulting
         * version.
         */
        s) {
            this.batch = t, this.commitVersion = e, this.mutationResults = n, this.docVersions = s;
        }
        /**
         * Creates a new MutationBatchResult for the given batch and results. There
         * must be one result for each mutation in the batch. This static factory
         * caches a document=&gt;version mapping (docVersions).
         */    static from(t, e, n) {
            U(t.mutations.length === n.length);
            let s = jn;
            const i = t.mutations;
            for (let t = 0; t < i.length; t++) s = s.insert(i[t].key, n[t].version);
            return new vi(t, e, n, s);
        }
    }

    /**
     * @license
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Representation of an overlay computed by Firestore.
     *
     * Holds information about a mutation and the largest batch id in Firestore when
     * the mutation was created.
     */ class Si {
        constructor(t, e) {
            this.largestBatchId = t, this.mutation = e;
        }
        getKey() {
            return this.mutation.key;
        }
        isEqual(t) {
            return null !== t && this.mutation === t.mutation;
        }
        toString() {
            return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable set of metadata that the local store tracks for each target.
     */ class Di {
        constructor(
        /** The target being listened to. */
        t, 
        /**
         * The target ID to which the target corresponds; Assigned by the
         * LocalStore for user listens and by the SyncEngine for limbo watches.
         */
        e, 
        /** The purpose of the target. */
        n, 
        /**
         * The sequence number of the last transaction during which this target data
         * was modified.
         */
        s, 
        /** The latest snapshot version seen for this target. */
        i = ct.min()
        /**
         * The maximum snapshot version at which the associated view
         * contained no limbo documents.
         */ , r = ct.min()
        /**
         * An opaque, server-assigned token that allows watching a target to be
         * resumed after disconnecting without retransmitting all the data that
         * matches the target. The resume token essentially identifies a point in
         * time from which the server should resume sending results.
         */ , o = pt.EMPTY_BYTE_STRING) {
            this.target = t, this.targetId = e, this.purpose = n, this.sequenceNumber = s, this.snapshotVersion = i, 
            this.lastLimboFreeSnapshotVersion = r, this.resumeToken = o;
        }
        /** Creates a new target data instance with an updated sequence number. */    withSequenceNumber(t) {
            return new Di(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken);
        }
        /**
         * Creates a new target data instance with an updated resume token and
         * snapshot version.
         */    withResumeToken(t, e) {
            return new Di(this.target, this.targetId, this.purpose, this.sequenceNumber, e, this.lastLimboFreeSnapshotVersion, t);
        }
        /**
         * Creates a new target data instance with an updated last limbo free
         * snapshot version number.
         */    withLastLimboFreeSnapshotVersion(t) {
            return new Di(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Serializer for values stored in the LocalStore. */ class Ci {
        constructor(t) {
            this.Jt = t;
        }
    }

    /**
     * A helper function for figuring out what kind of query has been stored.
     */
    /**
     * Encodes a `BundledQuery` from bundle proto to a Query object.
     *
     * This reconstructs the original query used to build the bundle being loaded,
     * including features exists only in SDKs (for example: limit-to-last).
     */
    function Li(t) {
        const e = Ds({
            parent: t.parent,
            structuredQuery: t.structuredQuery
        });
        return "LAST" === t.limitType ? Ue(e, e.limit, "L" /* Last */) : e;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of IndexManager.
     */ class rr {
        constructor() {
            this.qe = new or;
        }
        addToCollectionParentIndex(t, e) {
            return this.qe.add(e), wi.resolve();
        }
        getCollectionParents(t, e) {
            return wi.resolve(this.qe.getEntries(e));
        }
        addFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve();
        }
        deleteFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve();
        }
        getDocumentsMatchingTarget(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve(null);
        }
        getFieldIndex(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve(null);
        }
        getFieldIndexes(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve([]);
        }
        getNextCollectionGroupToUpdate(t) {
            // Field indices are not supported with memory persistence.
            return wi.resolve(null);
        }
        updateCollectionGroup(t, e, n) {
            // Field indices are not supported with memory persistence.
            return wi.resolve();
        }
        updateIndexEntries(t, e) {
            // Field indices are not supported with memory persistence.
            return wi.resolve();
        }
    }

    /**
     * Internal implementation of the collection-parent index exposed by MemoryIndexManager.
     * Also used for in-memory caching by IndexedDbIndexManager and initial index population
     * in indexeddb_schema.ts
     */ class or {
        constructor() {
            this.index = {};
        }
        // Returns false if the entry already existed.
        add(t) {
            const e = t.lastSegment(), n = t.popLast(), s = this.index[e] || new $n(_t.comparator), i = !s.has(n);
            return this.index[e] = s.add(n), i;
        }
        has(t) {
            const e = t.lastSegment(), n = t.popLast(), s = this.index[e];
            return s && s.has(n);
        }
        getEntries(t) {
            return (this.index[t] || new $n(_t.comparator)).toArray();
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Offset to ensure non-overlapping target ids. */
    /**
     * Generates monotonically increasing target IDs for sending targets to the
     * watch stream.
     *
     * The client constructs two generators, one for the target cache, and one for
     * for the sync engine (to generate limbo documents targets). These
     * generators produce non-overlapping IDs (by using even and odd IDs
     * respectively).
     *
     * By separating the target ID space, the query cache can generate target IDs
     * that persist across client restarts, while sync engine can independently
     * generate in-memory target IDs that are transient and can be reused after a
     * restart.
     */
    class Er {
        constructor(t) {
            this.wn = t;
        }
        next() {
            return this.wn += 2, this.wn;
        }
        static mn() {
            // The target cache generator must return '2' in its first call to `next()`
            // as there is no differentiation in the protocol layer between an unset
            // number and the number '0'. If we were to sent a target with target ID
            // '0', the backend would consider it unset and replace it with its own ID.
            return new Er(0);
        }
        static gn() {
            // Sync engine assigns target IDs for limbo document detection.
            return new Er(-1);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Verifies the error thrown by a LocalStore operation. If a LocalStore
     * operation fails because the primary lease has been taken by another client,
     * we ignore the error (the persistence layer will immediately call
     * `applyPrimaryLease` to propagate the primary state change). All other errors
     * are re-thrown.
     *
     * @param err - An error returned by a LocalStore operation.
     * @returns A Promise that resolves after we recovered, or the original error.
     */ async function Vr(t) {
        if (t.code !== K.FAILED_PRECONDITION || t.message !== di) throw t;
        O("LocalStore", "Unexpectedly lost primary lease");
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory buffer of entries to be written to a RemoteDocumentCache.
     * It can be used to batch up a set of changes to be written to the cache, but
     * additionally supports reading entries back with the `getEntry()` method,
     * falling back to the underlying RemoteDocumentCache if no entry is
     * buffered.
     *
     * Entries added to the cache *must* be read first. This is to facilitate
     * calculating the size delta of the pending changes.
     *
     * PORTING NOTE: This class was implemented then removed from other platforms.
     * If byte-counting ends up being needed on the other platforms, consider
     * porting this class as part of that implementation work.
     */ class kr {
        constructor() {
            // A mapping of document key to the new cache entry that should be written.
            this.changes = new kn((t => t.toString()), ((t, e) => t.isEqual(e))), this.changesApplied = !1;
        }
        /**
         * Buffers a `RemoteDocumentCache.addEntry()` call.
         *
         * You can only modify documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    addEntry(t) {
            this.assertNotApplied(), this.changes.set(t.key, t);
        }
        /**
         * Buffers a `RemoteDocumentCache.removeEntry()` call.
         *
         * You can only remove documents that have already been retrieved via
         * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
         */    removeEntry(t, e) {
            this.assertNotApplied(), this.changes.set(t, te.newInvalidDocument(t).setReadTime(e));
        }
        /**
         * Looks up an entry in the cache. The buffered changes will first be checked,
         * and if no buffered change applies, this will forward to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction - The transaction in which to perform any persistence
         *     operations.
         * @param documentKey - The key of the entry to look up.
         * @returns The cached document or an invalid document if we have nothing
         * cached.
         */    getEntry(t, e) {
            this.assertNotApplied();
            const n = this.changes.get(e);
            return void 0 !== n ? wi.resolve(n) : this.getFromCache(t, e);
        }
        /**
         * Looks up several entries in the cache, forwarding to
         * `RemoteDocumentCache.getEntry()`.
         *
         * @param transaction - The transaction in which to perform any persistence
         *     operations.
         * @param documentKeys - The keys of the entries to look up.
         * @returns A map of cached documents, indexed by key. If an entry cannot be
         *     found, the corresponding key will be mapped to an invalid document.
         */    getEntries(t, e) {
            return this.getAllFromCache(t, e);
        }
        /**
         * Applies buffered changes to the underlying RemoteDocumentCache, using
         * the provided transaction.
         */    apply(t) {
            return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(t);
        }
        /** Helper to assert this.changes is not null  */    assertNotApplied() {}
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A readonly view of the local state of all documents we're tracking (i.e. we
     * have a cached version in remoteDocumentCache or local mutations for the
     * document). The view is computed by applying the mutations in the
     * MutationQueue to the RemoteDocumentCache.
     */
    class Hr {
        constructor(t, e, n) {
            this.fs = t, this.$s = e, this.indexManager = n;
        }
        /**
         * Get the local view of the document identified by `key`.
         *
         * @returns Local view of the document or null if we don't have any cached
         * state for it.
         */    Bs(t, e) {
            return this.$s.getAllMutationBatchesAffectingDocumentKey(t, e).next((n => this.Ls(t, e, n)));
        }
        /** Internal version of `getDocument` that allows reusing batches. */    Ls(t, e, n) {
            return this.fs.getEntry(t, e).next((t => {
                for (const e of n) e.applyToLocalView(t);
                return t;
            }));
        }
        // Returns the view of the given `docs` as they would appear after applying
        // all mutations in the given `batches`.
        Us(t, e) {
            t.forEach(((t, n) => {
                for (const t of e) t.applyToLocalView(n);
            }));
        }
        /**
         * Gets the local view of the documents identified by `keys`.
         *
         * If we don't have cached state for a document in `keys`, a NoDocument will
         * be stored for that key in the resulting set.
         */    qs(t, e) {
            return this.fs.getEntries(t, e).next((e => this.Gs(t, e).next((() => e))));
        }
        /**
         * Applies the local view the given `baseDocs` without retrieving documents
         * from the local store.
         */    Gs(t, e) {
            return this.$s.getAllMutationBatchesAffectingDocumentKeys(t, e).next((t => this.Us(e, t)));
        }
        /**
         * Performs a query against the local view of all documents.
         *
         * @param transaction - The persistence transaction.
         * @param query - The query to match documents against.
         * @param offset - Read time and key to start scanning by (exclusive).
         */    Ks(t, e, n) {
            /**
     * Returns whether the query matches a single document by path (rather than a
     * collection).
     */
            return function(t) {
                return xt.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
            }(e) ? this.Qs(t, e.path) : $e(e) ? this.js(t, e, n) : this.Ws(t, e, n);
        }
        Qs(t, e) {
            // Just do a simple document lookup.
            return this.Bs(t, new xt(e)).next((t => {
                let e = Kn();
                return t.isFoundDocument() && (e = e.insert(t.key, t)), e;
            }));
        }
        js(t, e, n) {
            const s = e.collectionGroup;
            let i = Kn();
            return this.indexManager.getCollectionParents(t, s).next((r => wi.forEach(r, (r => {
                const o = function(t, e) {
                    return new Ce(e, 
                    /*collectionGroup=*/ null, t.explicitOrderBy.slice(), t.filters.slice(), t.limit, t.limitType, t.startAt, t.endAt);
                }
                /**
     * Returns true if this query does not specify any query constraints that
     * could remove results.
     */ (e, r.child(s));
                return this.Ws(t, o, n).next((t => {
                    t.forEach(((t, e) => {
                        i = i.insert(t, e);
                    }));
                }));
            })).next((() => i))));
        }
        Ws(t, e, n) {
            // Query the remote documents and overlay mutations.
            let s;
            return this.fs.getAllFromCollection(t, e.path, n).next((n => (s = n, this.$s.getAllMutationBatchesAffectingQuery(t, e)))).next((t => {
                for (const e of t) for (const t of e.mutations) {
                    const n = t.key;
                    let i = s.get(n);
                    null == i && (
                    // Create invalid document to apply mutations on top of
                    i = te.newInvalidDocument(n), s = s.insert(n, i)), yn(t, i, e.localWriteTime), i.isFoundDocument() || (s = s.remove(n));
                }
            })).next((() => (
            // Finally, filter out any documents that don't actually match
            // the query.
            s.forEach(((t, n) => {
                Qe(e, n) || (s = s.remove(t));
            })), s)));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A set of changes to what documents are currently in view and out of view for
     * a given query. These changes are sent to the LocalStore by the View (via
     * the SyncEngine) and are used to pin / unpin documents as appropriate.
     */ class Jr {
        constructor(t, e, n, s) {
            this.targetId = t, this.fromCache = e, this.zs = n, this.Hs = s;
        }
        static Js(t, e) {
            let n = zn(), s = zn();
            for (const t of e.docChanges) switch (t.type) {
              case 0 /* Added */ :
                n = n.add(t.doc.key);
                break;

              case 1 /* Removed */ :
                s = s.add(t.doc.key);
     // do nothing
                    }
            return new Jr(t, e.fromCache, n, s);
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A query engine that takes advantage of the target document mapping in the
     * QueryCache. Query execution is optimized by only reading the documents that
     * previously matched a query plus any documents that were edited after the
     * query was last listened to.
     *
     * There are some cases when this optimization is not guaranteed to produce
     * the same results as full collection scans. In these cases, query
     * processing falls back to full scans. These cases are:
     *
     * - Limit queries where a document that matched the query previously no longer
     *   matches the query.
     *
     * - Limit queries where a document edit may cause the document to sort below
     *   another document that is in the local cache.
     *
     * - Queries that have never been CURRENT or free of limbo documents.
     */ class Yr {
        /** Sets the document view to query against. */
        Ys(t) {
            this.Xs = t;
        }
        /** Returns all local documents matching the specified query. */    Ks(t, e, n, s) {
            // Queries that match all documents don't benefit from using
            // key-based lookups. It is more efficient to scan all documents in a
            // collection, rather than to perform individual lookups.
            return function(t) {
                return 0 === t.filters.length && null === t.limit && null == t.startAt && null == t.endAt && (0 === t.explicitOrderBy.length || 1 === t.explicitOrderBy.length && t.explicitOrderBy[0].field.isKeyField());
            }(e) || n.isEqual(ct.min()) ? this.Zs(t, e) : this.Xs.qs(t, s).next((i => {
                const r = this.ti(e, i);
                return (ke(e) || Me(e)) && this.ei(e.limitType, r, s, n) ? this.Zs(t, e) : (k() <= LogLevel.DEBUG && O("QueryEngine", "Re-using previous result from %s to execute query: %s", n.toString(), Ke(e)), 
                this.Xs.Ks(t, e, oe(n, -1)).next((t => (
                // We merge `previousResults` into `updateResults`, since
                // `updateResults` is already a DocumentMap. If a document is
                // contained in both lists, then its contents are the same.
                r.forEach((e => {
                    t = t.insert(e.key, e);
                })), t))));
            }));
            // Queries that have never seen a snapshot without limbo free documents
            // should also be run as a full collection scan.
            }
        /** Applies the query filter and sorting to the provided documents.  */    ti(t, e) {
            // Sort the documents and re-apply the query filter since previously
            // matching documents do not necessarily still match the query.
            let n = new $n(We(t));
            return e.forEach(((e, s) => {
                Qe(t, s) && (n = n.add(s));
            })), n;
        }
        /**
         * Determines if a limit query needs to be refilled from cache, making it
         * ineligible for index-free execution.
         *
         * @param sortedPreviousResults - The documents that matched the query when it
         * was last synchronized, sorted by the query's comparator.
         * @param remoteKeys - The document keys that matched the query at the last
         * snapshot.
         * @param limboFreeSnapshotVersion - The version of the snapshot when the
         * query was last synchronized.
         */    ei(t, e, n, s) {
            // The query needs to be refilled if a previously matching document no
            // longer matches.
            if (n.size !== e.size) return !0;
            // Limit queries are not eligible for index-free query execution if there is
            // a potential that an older document from cache now sorts before a document
            // that was previously part of the limit. This, however, can only happen if
            // the document at the edge of the limit goes out of limit.
            // If a document that is not the limit boundary sorts differently,
            // the boundary of the limit itself did not change and documents from cache
            // will continue to be "rejected" by this boundary. Therefore, we can ignore
            // any modifications that don't affect the last document.
                    const i = "F" /* First */ === t ? e.last() : e.first();
            return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
        }
        Zs(t, e) {
            return k() <= LogLevel.DEBUG && O("QueryEngine", "Using full collection scan to execute query:", Ke(e)), 
            this.Xs.Ks(t, e, ae.min());
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Implements `LocalStore` interface.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */
    class Xr {
        constructor(
        /** Manages our in-memory or durable persistence. */
        t, e, n, s) {
            this.persistence = t, this.ni = e, this.M = s, 
            /**
             * Maps a targetID to data about its target.
             *
             * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
             * of `applyRemoteEvent()` idempotent.
             */
            this.si = new Mn(rt), 
            /** Maps a target to its targetID. */
            // TODO(wuandy): Evaluate if TargetId can be part of Target.
            this.ii = new kn((t => fe(t)), _e), 
            /**
             * A per collection group index of the last read time processed by
             * `getNewDocumentChanges()`.
             *
             * PORTING NOTE: This is only used for multi-tab synchronization.
             */
            this.ri = new Map, this.oi = t.getRemoteDocumentCache(), this.ls = t.getTargetCache(), 
            this.ds = t.getBundleCache(), this.ui(n);
        }
        ui(t) {
            // TODO(indexing): Add spec tests that test these components change after a
            // user change
            this.indexManager = this.persistence.getIndexManager(t), this.$s = this.persistence.getMutationQueue(t, this.indexManager), 
            this.ai = new Hr(this.oi, this.$s, this.indexManager), this.oi.setIndexManager(this.indexManager), 
            this.ni.Ys(this.ai);
        }
        collectGarbage(t) {
            return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (e => t.collect(e, this.si)));
        }
    }

    function Zr(
    /** Manages our in-memory or durable persistence. */
    t, e, n, s) {
        return new Xr(t, e, n, s);
    }

    /**
     * Tells the LocalStore that the currently authenticated user has changed.
     *
     * In response the local store switches the mutation queue to the new user and
     * returns any resulting document changes.
     */
    // PORTING NOTE: Android and iOS only return the documents affected by the
    // change.
    async function to(t, e) {
        const n = G(t);
        return await n.persistence.runTransaction("Handle user change", "readonly", (t => {
            // Swap out the mutation queue, grabbing the pending mutation batches
            // before and after.
            let s;
            return n.$s.getAllMutationBatches(t).next((i => (s = i, n.ui(e), n.$s.getAllMutationBatches(t)))).next((e => {
                const i = [], r = [];
                // Union the old/new changed keys.
                let o = zn();
                for (const t of s) {
                    i.push(t.batchId);
                    for (const e of t.mutations) o = o.add(e.key);
                }
                for (const t of e) {
                    r.push(t.batchId);
                    for (const e of t.mutations) o = o.add(e.key);
                }
                // Return the set of all (potentially) changed documents and the list
                // of mutation batch IDs that were affected by change.
                            return n.ai.qs(t, o).next((t => ({
                    ci: t,
                    removedBatchIds: i,
                    addedBatchIds: r
                })));
            }));
        }));
    }

    /* Accepts locally generated Mutations and commit them to storage. */
    /**
     * Acknowledges the given batch.
     *
     * On the happy path when a batch is acknowledged, the local store will
     *
     *  + remove the batch from the mutation queue;
     *  + apply the changes to the remote document cache;
     *  + recalculate the latency compensated view implied by those changes (there
     *    may be mutations in the queue that affect the documents but haven't been
     *    acknowledged yet); and
     *  + give the changed documents back the sync engine
     *
     * @returns The resulting (modified) documents.
     */
    function eo(t, e) {
        const n = G(t);
        return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (t => {
            const s = e.batch.keys(), i = n.oi.newChangeBuffer({
                trackRemovals: !0
            });
            return function(t, e, n, s) {
                const i = n.batch, r = i.keys();
                let o = wi.resolve();
                return r.forEach((t => {
                    o = o.next((() => s.getEntry(e, t))).next((e => {
                        const r = n.docVersions.get(t);
                        U(null !== r), e.version.compareTo(r) < 0 && (i.applyToRemoteDocument(e, n), e.isValidDocument() && (
                        // We use the commitVersion as the readTime rather than the
                        // document's updateTime since the updateTime is not advanced
                        // for updates that do not modify the underlying document.
                        e.setReadTime(n.commitVersion), s.addEntry(e)));
                    }));
                })), o.next((() => t.$s.removeMutationBatch(e, i)));
            }
            /** Returns the local view of the documents affected by a mutation batch. */
            // PORTING NOTE: Multi-Tab only.
            (n, t, e, i).next((() => i.apply(t))).next((() => n.$s.performConsistencyCheck(t))).next((() => n.ai.qs(t, s)));
        }));
    }

    /**
     * Removes mutations from the MutationQueue for the specified batch;
     * LocalDocuments will be recalculated.
     *
     * @returns The resulting modified documents.
     */
    /**
     * Returns the last consistent snapshot processed (used by the RemoteStore to
     * determine whether to buffer incoming snapshots from the backend).
     */
    function no(t) {
        const e = G(t);
        return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t => e.ls.getLastRemoteSnapshotVersion(t)));
    }

    /**
     * Updates the "ground-state" (remote) documents. We assume that the remote
     * event reflects any write batches that have been acknowledged or rejected
     * (i.e. we do not re-apply local mutations to updates from this event).
     *
     * LocalDocuments are re-calculated if there are remaining mutations in the
     * queue.
     */ function so(t, e) {
        const n = G(t), s = e.snapshotVersion;
        let i = n.si;
        return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (t => {
            const r = n.oi.newChangeBuffer({
                trackRemovals: !0
            });
            // Reset newTargetDataByTargetMap in case this transaction gets re-run.
                    i = n.si;
            const o = [];
            e.targetChanges.forEach(((r, u) => {
                const a = i.get(u);
                if (!a) return;
                // Only update the remote keys if the target is still active. This
                // ensures that we can persist the updated target data along with
                // the updated assignment.
                            o.push(n.ls.removeMatchingKeys(t, r.removedDocuments, u).next((() => n.ls.addMatchingKeys(t, r.addedDocuments, u))));
                let c = a.withSequenceNumber(t.currentSequenceNumber);
                e.targetMismatches.has(u) ? c = c.withResumeToken(pt.EMPTY_BYTE_STRING, ct.min()).withLastLimboFreeSnapshotVersion(ct.min()) : r.resumeToken.approximateByteSize() > 0 && (c = c.withResumeToken(r.resumeToken, s)), 
                i = i.insert(u, c), 
                // Update the target data if there are target changes (or if
                // sufficient time has passed since the last update).
                /**
     * Returns true if the newTargetData should be persisted during an update of
     * an active target. TargetData should always be persisted when a target is
     * being released and should not call this function.
     *
     * While the target is active, TargetData updates can be omitted when nothing
     * about the target has changed except metadata like the resume token or
     * snapshot version. Occasionally it's worth the extra write to prevent these
     * values from getting too stale after a crash, but this doesn't have to be
     * too frequent.
     */
                function(t, e, n) {
                    // Always persist target data if we don't already have a resume token.
                    if (0 === t.resumeToken.approximateByteSize()) return !0;
                    // Don't allow resume token changes to be buffered indefinitely. This
                    // allows us to be reasonably up-to-date after a crash and avoids needing
                    // to loop over all active queries on shutdown. Especially in the browser
                    // we may not get time to do anything interesting while the current tab is
                    // closing.
                                    if (e.snapshotVersion.toMicroseconds() - t.snapshotVersion.toMicroseconds() >= 3e8) return !0;
                    // Otherwise if the only thing that has changed about a target is its resume
                    // token it's not worth persisting. Note that the RemoteStore keeps an
                    // in-memory view of the currently active targets which includes the current
                    // resume token, so stream failure or user changes will still use an
                    // up-to-date resume token regardless of what we do here.
                                    return n.addedDocuments.size + n.modifiedDocuments.size + n.removedDocuments.size > 0;
                }
                /**
     * Notifies local store of the changed views to locally pin documents.
     */ (a, c, r) && o.push(n.ls.updateTargetData(t, c));
            }));
            let u = qn();
            // HACK: The only reason we allow a null snapshot version is so that we
            // can synthesize remote events when we get permission denied errors while
            // trying to resolve the state of a locally cached document that is in
            // limbo.
            if (e.documentUpdates.forEach((s => {
                e.resolvedLimboDocuments.has(s) && o.push(n.persistence.referenceDelegate.updateLimboDocument(t, s));
            })), 
            // Each loop iteration only affects its "own" doc, so it's safe to get all the remote
            // documents in advance in a single call.
            o.push(io(t, r, e.documentUpdates).next((t => {
                u = t;
            }))), !s.isEqual(ct.min())) {
                const e = n.ls.getLastRemoteSnapshotVersion(t).next((e => n.ls.setTargetsMetadata(t, t.currentSequenceNumber, s)));
                o.push(e);
            }
            return wi.waitFor(o).next((() => r.apply(t))).next((() => n.ai.Gs(t, u))).next((() => u));
        })).then((t => (n.si = i, t)));
    }

    /**
     * Populates document change buffer with documents from backend or a bundle.
     * Returns the document changes resulting from applying those documents.
     *
     * @param txn - Transaction to use to read existing documents from storage.
     * @param documentBuffer - Document buffer to collect the resulted changes to be
     *        applied to storage.
     * @param documents - Documents to be applied.
     * @param globalVersion - A `SnapshotVersion` representing the read time if all
     *        documents have the same read time.
     * @param documentVersions - A DocumentKey-to-SnapshotVersion map if documents
     *        have their own read time.
     *
     * Note: this function will use `documentVersions` if it is defined;
     * when it is not defined, resorts to `globalVersion`.
     */ function io(t, e, n) {
        let s = zn();
        return n.forEach((t => s = s.add(t))), e.getEntries(t, s).next((t => {
            let s = qn();
            return n.forEach(((n, i) => {
                const r = t.get(n);
                // Note: The order of the steps below is important, since we want
                // to ensure that rejected limbo resolutions (which fabricate
                // NoDocuments with SnapshotVersion.min()) never add documents to
                // cache.
                            i.isNoDocument() && i.version.isEqual(ct.min()) ? (
                // NoDocuments with SnapshotVersion.min() are used in manufactured
                // events. We remove these documents from cache since we lost
                // access.
                e.removeEntry(n, i.readTime), s = s.insert(n, i)) : !r.isValidDocument() || i.version.compareTo(r.version) > 0 || 0 === i.version.compareTo(r.version) && r.hasPendingWrites ? (e.addEntry(i), 
                s = s.insert(n, i)) : O("LocalStore", "Ignoring outdated watch update for ", n, ". Current version:", r.version, " Watch version:", i.version);
            })), s;
        }));
    }

    /**
     * Gets the mutation batch after the passed in batchId in the mutation queue
     * or null if empty.
     * @param afterBatchId - If provided, the batch to search after.
     * @returns The next mutation or null if there wasn't one.
     */
    function ro(t, e) {
        const n = G(t);
        return n.persistence.runTransaction("Get next mutation batch", "readonly", (t => (void 0 === e && (e = -1), 
        n.$s.getNextMutationBatchAfterBatchId(t, e))));
    }

    /**
     * Reads the current value of a Document with a given key or null if not
     * found - used for testing.
     */
    /**
     * Assigns the given target an internal ID so that its results can be pinned so
     * they don't get GC'd. A target must be allocated in the local store before
     * the store can be used to manage its view.
     *
     * Allocating an already allocated `Target` will return the existing `TargetData`
     * for that `Target`.
     */
    function oo(t, e) {
        const n = G(t);
        return n.persistence.runTransaction("Allocate target", "readwrite", (t => {
            let s;
            return n.ls.getTargetData(t, e).next((i => i ? (
            // This target has been listened to previously, so reuse the
            // previous targetID.
            // TODO(mcg): freshen last accessed date?
            s = i, wi.resolve(s)) : n.ls.allocateTargetId(t).next((i => (s = new Di(e, i, 0 /* Listen */ , t.currentSequenceNumber), 
            n.ls.addTargetData(t, s).next((() => s)))))));
        })).then((t => {
            // If Multi-Tab is enabled, the existing target data may be newer than
            // the in-memory data
            const s = n.si.get(t.targetId);
            return (null === s || t.snapshotVersion.compareTo(s.snapshotVersion) > 0) && (n.si = n.si.insert(t.targetId, t), 
            n.ii.set(e, t.targetId)), t;
        }));
    }

    /**
     * Returns the TargetData as seen by the LocalStore, including updates that may
     * have not yet been persisted to the TargetCache.
     */
    // Visible for testing.
    /**
     * Unpins all the documents associated with the given target. If
     * `keepPersistedTargetData` is set to false and Eager GC enabled, the method
     * directly removes the associated target data from the target cache.
     *
     * Releasing a non-existing `Target` is a no-op.
     */
    // PORTING NOTE: `keepPersistedTargetData` is multi-tab only.
    async function uo(t, e, n) {
        const s = G(t), i = s.si.get(e), r = n ? "readwrite" : "readwrite-primary";
        try {
            n || await s.persistence.runTransaction("Release target", r, (t => s.persistence.referenceDelegate.removeTarget(t, i)));
        } catch (t) {
            if (!Ii(t)) throw t;
            // All `releaseTarget` does is record the final metadata state for the
            // target, but we've been recording this periodically during target
            // activity. If we lose this write this could cause a very slight
            // difference in the order of target deletion during GC, but we
            // don't define exact LRU semantics so this is acceptable.
            O("LocalStore", `Failed to update sequence numbers for target ${e}: ${t}`);
        }
        s.si = s.si.remove(e), s.ii.delete(i.target);
    }

    /**
     * Runs the specified query against the local store and returns the results,
     * potentially taking advantage of query data from previous executions (such
     * as the set of remote keys).
     *
     * @param usePreviousResults - Whether results from previous executions can
     * be used to optimize this query execution.
     */ function ao(t, e, n) {
        const s = G(t);
        let i = ct.min(), r = zn();
        return s.persistence.runTransaction("Execute query", "readonly", (t => function(t, e, n) {
            const s = G(t), i = s.ii.get(n);
            return void 0 !== i ? wi.resolve(s.si.get(i)) : s.ls.getTargetData(e, n);
        }(s, t, Le(e)).next((e => {
            if (e) return i = e.lastLimboFreeSnapshotVersion, s.ls.getMatchingKeysForTargetId(t, e.targetId).next((t => {
                r = t;
            }));
        })).next((() => s.ni.Ks(t, e, n ? i : ct.min(), n ? r : zn()))).next((t => (lo(s, je(e), t), 
        {
            documents: t,
            hi: r
        })))));
    }

    /** Sets the collection group's maximum read time from the given documents. */
    // PORTING NOTE: Multi-Tab only.
    function lo(t, e, n) {
        let s = ct.min();
        n.forEach(((t, e) => {
            e.readTime.compareTo(s) > 0 && (s = e.readTime);
        })), t.ri.set(e, s);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class wo {
        constructor(t) {
            this.M = t, this._i = new Map, this.wi = new Map;
        }
        getBundleMetadata(t, e) {
            return wi.resolve(this._i.get(e));
        }
        saveBundleMetadata(t, e) {
            /** Decodes a BundleMetadata proto into a BundleMetadata object. */
            var n;
            return this._i.set(e.id, {
                id: (n = e).id,
                version: n.version,
                createTime: fs(n.createTime)
            }), wi.resolve();
        }
        getNamedQuery(t, e) {
            return wi.resolve(this.wi.get(e));
        }
        saveNamedQuery(t, e) {
            return this.wi.set(e.name, function(t) {
                return {
                    name: t.name,
                    query: Li(t.bundledQuery),
                    readTime: fs(t.readTime)
                };
            }(e)), wi.resolve();
        }
    }

    /**
     * @license
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An in-memory implementation of DocumentOverlayCache.
     */ class mo {
        constructor() {
            // A map sorted by DocumentKey, whose value is a pair of the largest batch id
            // for the overlay and the overlay itself.
            this.overlays = new Mn(xt.comparator), this.mi = new Map;
        }
        getOverlay(t, e) {
            return wi.resolve(this.overlays.get(e));
        }
        saveOverlays(t, e, n) {
            return n.forEach(((n, s) => {
                this.Xt(t, e, s);
            })), wi.resolve();
        }
        removeOverlaysForBatchId(t, e, n) {
            const s = this.mi.get(n);
            return void 0 !== s && (s.forEach((t => this.overlays = this.overlays.remove(t))), 
            this.mi.delete(n)), wi.resolve();
        }
        getOverlaysForCollection(t, e, n) {
            const s = Qn(), i = e.length + 1, r = new xt(e.child("")), o = this.overlays.getIteratorFrom(r);
            for (;o.hasNext(); ) {
                const t = o.getNext().value, r = t.getKey();
                if (!e.isPrefixOf(r.path)) break;
                // Documents from sub-collections
                            r.path.length === i && (t.largestBatchId > n && s.set(t.getKey(), t));
            }
            return wi.resolve(s);
        }
        getOverlaysForCollectionGroup(t, e, n, s) {
            let i = new Mn(((t, e) => t - e));
            const r = this.overlays.getIterator();
            for (;r.hasNext(); ) {
                const t = r.getNext().value;
                if (t.getKey().getCollectionGroup() === e && t.largestBatchId > n) {
                    let e = i.get(t.largestBatchId);
                    null === e && (e = Qn(), i = i.insert(t.largestBatchId, e)), e.set(t.getKey(), t);
                }
            }
            const o = Qn(), u = i.getIterator();
            for (;u.hasNext(); ) {
                if (u.getNext().value.forEach(((t, e) => o.set(t, e))), o.size() >= s) break;
            }
            return wi.resolve(o);
        }
        Xt(t, e, n) {
            if (null === n) return;
            // Remove the association of the overlay to its batch id.
                    const s = this.overlays.get(n.key);
            if (null !== s) {
                const t = this.mi.get(s.largestBatchId).delete(n.key);
                this.mi.set(s.largestBatchId, t);
            }
            this.overlays = this.overlays.insert(n.key, new Si(e, n));
            // Create the association of this overlay to the given largestBatchId.
            let i = this.mi.get(e);
            void 0 === i && (i = zn(), this.mi.set(e, i)), this.mi.set(e, i.add(n.key));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A collection of references to a document from some kind of numbered entity
     * (either a target ID or batch ID). As references are added to or removed from
     * the set corresponding events are emitted to a registered garbage collector.
     *
     * Each reference is represented by a DocumentReference object. Each of them
     * contains enough information to uniquely identify the reference. They are all
     * stored primarily in a set sorted by key. A document is considered garbage if
     * there's no references in that set (this can be efficiently checked thanks to
     * sorting by key).
     *
     * ReferenceSet also keeps a secondary set that contains references sorted by
     * IDs. This one is used to efficiently implement removal of all references by
     * some target ID.
     */ class go {
        constructor() {
            // A set of outstanding references to a document sorted by key.
            this.gi = new $n(yo.yi), 
            // A set of outstanding references to a document sorted by target id.
            this.pi = new $n(yo.Ii);
        }
        /** Returns true if the reference set contains no references. */    isEmpty() {
            return this.gi.isEmpty();
        }
        /** Adds a reference to the given document key for the given ID. */    addReference(t, e) {
            const n = new yo(t, e);
            this.gi = this.gi.add(n), this.pi = this.pi.add(n);
        }
        /** Add references to the given document keys for the given ID. */    Ti(t, e) {
            t.forEach((t => this.addReference(t, e)));
        }
        /**
         * Removes a reference to the given document key for the given
         * ID.
         */    removeReference(t, e) {
            this.Ei(new yo(t, e));
        }
        Ai(t, e) {
            t.forEach((t => this.removeReference(t, e)));
        }
        /**
         * Clears all references with a given ID. Calls removeRef() for each key
         * removed.
         */    Ri(t) {
            const e = new xt(new _t([])), n = new yo(e, t), s = new yo(e, t + 1), i = [];
            return this.pi.forEachInRange([ n, s ], (t => {
                this.Ei(t), i.push(t.key);
            })), i;
        }
        bi() {
            this.gi.forEach((t => this.Ei(t)));
        }
        Ei(t) {
            this.gi = this.gi.delete(t), this.pi = this.pi.delete(t);
        }
        Pi(t) {
            const e = new xt(new _t([])), n = new yo(e, t), s = new yo(e, t + 1);
            let i = zn();
            return this.pi.forEachInRange([ n, s ], (t => {
                i = i.add(t.key);
            })), i;
        }
        containsKey(t) {
            const e = new yo(t, 0), n = this.gi.firstAfterOrEqual(e);
            return null !== n && t.isEqual(n.key);
        }
    }

    class yo {
        constructor(t, e) {
            this.key = t, this.Vi = e;
        }
        /** Compare by key then by ID */    static yi(t, e) {
            return xt.comparator(t.key, e.key) || rt(t.Vi, e.Vi);
        }
        /** Compare by ID then by key */    static Ii(t, e) {
            return rt(t.Vi, e.Vi) || xt.comparator(t.key, e.key);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class po {
        constructor(t, e) {
            this.indexManager = t, this.referenceDelegate = e, 
            /**
             * The set of all mutations that have been sent but not yet been applied to
             * the backend.
             */
            this.$s = [], 
            /** Next value to use when assigning sequential IDs to each mutation batch. */
            this.vi = 1, 
            /** An ordered mapping between documents and the mutations batch IDs. */
            this.Si = new $n(yo.yi);
        }
        checkEmpty(t) {
            return wi.resolve(0 === this.$s.length);
        }
        addMutationBatch(t, e, n, s) {
            const i = this.vi;
            this.vi++, this.$s.length > 0 && this.$s[this.$s.length - 1];
            const r = new Vi(i, e, n, s);
            this.$s.push(r);
            // Track references by document key and index collection parents.
            for (const e of s) this.Si = this.Si.add(new yo(e.key, i)), this.indexManager.addToCollectionParentIndex(t, e.key.path.popLast());
            return wi.resolve(r);
        }
        lookupMutationBatch(t, e) {
            return wi.resolve(this.Di(e));
        }
        getNextMutationBatchAfterBatchId(t, e) {
            const n = e + 1, s = this.Ci(n), i = s < 0 ? 0 : s;
            // The requested batchId may still be out of range so normalize it to the
            // start of the queue.
                    return wi.resolve(this.$s.length > i ? this.$s[i] : null);
        }
        getHighestUnacknowledgedBatchId() {
            return wi.resolve(0 === this.$s.length ? -1 : this.vi - 1);
        }
        getAllMutationBatches(t) {
            return wi.resolve(this.$s.slice());
        }
        getAllMutationBatchesAffectingDocumentKey(t, e) {
            const n = new yo(e, 0), s = new yo(e, Number.POSITIVE_INFINITY), i = [];
            return this.Si.forEachInRange([ n, s ], (t => {
                const e = this.Di(t.Vi);
                i.push(e);
            })), wi.resolve(i);
        }
        getAllMutationBatchesAffectingDocumentKeys(t, e) {
            let n = new $n(rt);
            return e.forEach((t => {
                const e = new yo(t, 0), s = new yo(t, Number.POSITIVE_INFINITY);
                this.Si.forEachInRange([ e, s ], (t => {
                    n = n.add(t.Vi);
                }));
            })), wi.resolve(this.xi(n));
        }
        getAllMutationBatchesAffectingQuery(t, e) {
            // Use the query path as a prefix for testing if a document matches the
            // query.
            const n = e.path, s = n.length + 1;
            // Construct a document reference for actually scanning the index. Unlike
            // the prefix the document key in this reference must have an even number of
            // segments. The empty segment can be used a suffix of the query path
            // because it precedes all other segments in an ordered traversal.
            let i = n;
            xt.isDocumentKey(i) || (i = i.child(""));
            const r = new yo(new xt(i), 0);
            // Find unique batchIDs referenced by all documents potentially matching the
            // query.
                    let o = new $n(rt);
            return this.Si.forEachWhile((t => {
                const e = t.key.path;
                return !!n.isPrefixOf(e) && (
                // Rows with document keys more than one segment longer than the query
                // path can't be matches. For example, a query on 'rooms' can't match
                // the document /rooms/abc/messages/xyx.
                // TODO(mcg): we'll need a different scanner when we implement
                // ancestor queries.
                e.length === s && (o = o.add(t.Vi)), !0);
            }), r), wi.resolve(this.xi(o));
        }
        xi(t) {
            // Construct an array of matching batches, sorted by batchID to ensure that
            // multiple mutations affecting the same document key are applied in order.
            const e = [];
            return t.forEach((t => {
                const n = this.Di(t);
                null !== n && e.push(n);
            })), e;
        }
        removeMutationBatch(t, e) {
            U(0 === this.Ni(e.batchId, "removed")), this.$s.shift();
            let n = this.Si;
            return wi.forEach(e.mutations, (s => {
                const i = new yo(s.key, e.batchId);
                return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(t, s.key);
            })).next((() => {
                this.Si = n;
            }));
        }
        dn(t) {
            // No-op since the memory mutation queue does not maintain a separate cache.
        }
        containsKey(t, e) {
            const n = new yo(e, 0), s = this.Si.firstAfterOrEqual(n);
            return wi.resolve(e.isEqual(s && s.key));
        }
        performConsistencyCheck(t) {
            return this.$s.length, wi.resolve();
        }
        /**
         * Finds the index of the given batchId in the mutation queue and asserts that
         * the resulting index is within the bounds of the queue.
         *
         * @param batchId - The batchId to search for
         * @param action - A description of what the caller is doing, phrased in passive
         * form (e.g. "acknowledged" in a routine that acknowledges batches).
         */    Ni(t, e) {
            return this.Ci(t);
        }
        /**
         * Finds the index of the given batchId in the mutation queue. This operation
         * is O(1).
         *
         * @returns The computed index of the batch with the given batchId, based on
         * the state of the queue. Note this index can be negative if the requested
         * batchId has already been remvoed from the queue or past the end of the
         * queue if the batchId is larger than the last added batch.
         */    Ci(t) {
            if (0 === this.$s.length) 
            // As an index this is past the end of the queue
            return 0;
            // Examine the front of the queue to figure out the difference between the
            // batchId and indexes in the array. Note that since the queue is ordered
            // by batchId, if the first batch has a larger batchId then the requested
            // batchId doesn't exist in the queue.
                    return t - this.$s[0].batchId;
        }
        /**
         * A version of lookupMutationBatch that doesn't return a promise, this makes
         * other functions that uses this code easier to read and more efficent.
         */    Di(t) {
            const e = this.Ci(t);
            if (e < 0 || e >= this.$s.length) return null;
            return this.$s[e];
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The memory-only RemoteDocumentCache for IndexedDb. To construct, invoke
     * `newMemoryRemoteDocumentCache()`.
     */
    class Io {
        /**
         * @param sizer - Used to assess the size of a document. For eager GC, this is
         * expected to just return 0 to avoid unnecessarily doing the work of
         * calculating the size.
         */
        constructor(t) {
            this.ki = t, 
            /** Underlying cache of documents and their read times. */
            this.docs = new Mn(xt.comparator), 
            /** Size of all cached documents. */
            this.size = 0;
        }
        setIndexManager(t) {
            this.indexManager = t;
        }
        /**
         * Adds the supplied entry to the cache and updates the cache size as appropriate.
         *
         * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    addEntry(t, e) {
            const n = e.key, s = this.docs.get(n), i = s ? s.size : 0, r = this.ki(e);
            return this.docs = this.docs.insert(n, {
                document: e.mutableCopy(),
                size: r
            }), this.size += r - i, this.indexManager.addToCollectionParentIndex(t, n.path.popLast());
        }
        /**
         * Removes the specified entry from the cache and updates the cache size as appropriate.
         *
         * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
         * returned by `newChangeBuffer()`.
         */    removeEntry(t) {
            const e = this.docs.get(t);
            e && (this.docs = this.docs.remove(t), this.size -= e.size);
        }
        getEntry(t, e) {
            const n = this.docs.get(e);
            return wi.resolve(n ? n.document.mutableCopy() : te.newInvalidDocument(e));
        }
        getEntries(t, e) {
            let n = qn();
            return e.forEach((t => {
                const e = this.docs.get(t);
                n = n.insert(t, e ? e.document.mutableCopy() : te.newInvalidDocument(t));
            })), wi.resolve(n);
        }
        getAllFromCollection(t, e, n) {
            let s = qn();
            // Documents are ordered by key, so we can use a prefix scan to narrow down
            // the documents we need to match the query against.
                    const i = new xt(e.child("")), r = this.docs.getIteratorFrom(i);
            for (;r.hasNext(); ) {
                const {key: t, value: {document: i}} = r.getNext();
                if (!e.isPrefixOf(t.path)) break;
                t.path.length > e.length + 1 || (ce(ue(i), n) <= 0 || (s = s.insert(i.key, i.mutableCopy())));
            }
            return wi.resolve(s);
        }
        getAllFromCollectionGroup(t, e, n, s) {
            // This method should only be called from the IndexBackfiller if persistence
            // is enabled.
            L();
        }
        Mi(t, e) {
            return wi.forEach(this.docs, (t => e(t)));
        }
        newChangeBuffer(t) {
            // `trackRemovals` is ignores since the MemoryRemoteDocumentCache keeps
            // a separate changelog and does not need special handling for removals.
            return new To(this);
        }
        getSize(t) {
            return wi.resolve(this.size);
        }
    }

    /**
     * Creates a new memory-only RemoteDocumentCache.
     *
     * @param sizer - Used to assess the size of a document. For eager GC, this is
     * expected to just return 0 to avoid unnecessarily doing the work of
     * calculating the size.
     */
    /**
     * Handles the details of adding and updating documents in the MemoryRemoteDocumentCache.
     */
    class To extends kr {
        constructor(t) {
            super(), this.qn = t;
        }
        applyChanges(t) {
            const e = [];
            return this.changes.forEach(((n, s) => {
                s.isValidDocument() ? e.push(this.qn.addEntry(t, s)) : this.qn.removeEntry(n);
            })), wi.waitFor(e);
        }
        getFromCache(t, e) {
            return this.qn.getEntry(t, e);
        }
        getAllFromCache(t, e) {
            return this.qn.getEntries(t, e);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Eo {
        constructor(t) {
            this.persistence = t, 
            /**
             * Maps a target to the data about that target
             */
            this.Oi = new kn((t => fe(t)), _e), 
            /** The last received snapshot version. */
            this.lastRemoteSnapshotVersion = ct.min(), 
            /** The highest numbered target ID encountered. */
            this.highestTargetId = 0, 
            /** The highest sequence number encountered. */
            this.Fi = 0, 
            /**
             * A ordered bidirectional mapping between documents and the remote target
             * IDs.
             */
            this.$i = new go, this.targetCount = 0, this.Bi = Er.mn();
        }
        forEachTarget(t, e) {
            return this.Oi.forEach(((t, n) => e(n))), wi.resolve();
        }
        getLastRemoteSnapshotVersion(t) {
            return wi.resolve(this.lastRemoteSnapshotVersion);
        }
        getHighestSequenceNumber(t) {
            return wi.resolve(this.Fi);
        }
        allocateTargetId(t) {
            return this.highestTargetId = this.Bi.next(), wi.resolve(this.highestTargetId);
        }
        setTargetsMetadata(t, e, n) {
            return n && (this.lastRemoteSnapshotVersion = n), e > this.Fi && (this.Fi = e), 
            wi.resolve();
        }
        In(t) {
            this.Oi.set(t.target, t);
            const e = t.targetId;
            e > this.highestTargetId && (this.Bi = new Er(e), this.highestTargetId = e), t.sequenceNumber > this.Fi && (this.Fi = t.sequenceNumber);
        }
        addTargetData(t, e) {
            return this.In(e), this.targetCount += 1, wi.resolve();
        }
        updateTargetData(t, e) {
            return this.In(e), wi.resolve();
        }
        removeTargetData(t, e) {
            return this.Oi.delete(e.target), this.$i.Ri(e.targetId), this.targetCount -= 1, 
            wi.resolve();
        }
        removeTargets(t, e, n) {
            let s = 0;
            const i = [];
            return this.Oi.forEach(((r, o) => {
                o.sequenceNumber <= e && null === n.get(o.targetId) && (this.Oi.delete(r), i.push(this.removeMatchingKeysForTargetId(t, o.targetId)), 
                s++);
            })), wi.waitFor(i).next((() => s));
        }
        getTargetCount(t) {
            return wi.resolve(this.targetCount);
        }
        getTargetData(t, e) {
            const n = this.Oi.get(e) || null;
            return wi.resolve(n);
        }
        addMatchingKeys(t, e, n) {
            return this.$i.Ti(e, n), wi.resolve();
        }
        removeMatchingKeys(t, e, n) {
            this.$i.Ai(e, n);
            const s = this.persistence.referenceDelegate, i = [];
            return s && e.forEach((e => {
                i.push(s.markPotentiallyOrphaned(t, e));
            })), wi.waitFor(i);
        }
        removeMatchingKeysForTargetId(t, e) {
            return this.$i.Ri(e), wi.resolve();
        }
        getMatchingKeysForTargetId(t, e) {
            const n = this.$i.Pi(e);
            return wi.resolve(n);
        }
        containsKey(t, e) {
            return wi.resolve(this.$i.containsKey(e));
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A memory-backed instance of Persistence. Data is stored only in RAM and
     * not persisted across sessions.
     */
    class Ao {
        /**
         * The constructor accepts a factory for creating a reference delegate. This
         * allows both the delegate and this instance to have strong references to
         * each other without having nullable fields that would then need to be
         * checked or asserted on every access.
         */
        constructor(t, e) {
            this.Li = {}, this.overlays = {}, this.ts = new nt(0), this.es = !1, this.es = !0, 
            this.referenceDelegate = t(this), this.ls = new Eo(this);
            this.indexManager = new rr, this.fs = function(t) {
                return new Io(t);
            }((t => this.referenceDelegate.Ui(t))), this.M = new Ci(e), this.ds = new wo(this.M);
        }
        start() {
            return Promise.resolve();
        }
        shutdown() {
            // No durable state to ensure is closed on shutdown.
            return this.es = !1, Promise.resolve();
        }
        get started() {
            return this.es;
        }
        setDatabaseDeletedListener() {
            // No op.
        }
        setNetworkEnabled() {
            // No op.
        }
        getIndexManager(t) {
            // We do not currently support indices for memory persistence, so we can
            // return the same shared instance of the memory index manager.
            return this.indexManager;
        }
        getDocumentOverlayCache(t) {
            let e = this.overlays[t.toKey()];
            return e || (e = new mo, this.overlays[t.toKey()] = e), e;
        }
        getMutationQueue(t, e) {
            let n = this.Li[t.toKey()];
            return n || (n = new po(e, this.referenceDelegate), this.Li[t.toKey()] = n), n;
        }
        getTargetCache() {
            return this.ls;
        }
        getRemoteDocumentCache() {
            return this.fs;
        }
        getBundleCache() {
            return this.ds;
        }
        runTransaction(t, e, n) {
            O("MemoryPersistence", "Starting transaction:", t);
            const s = new Ro(this.ts.next());
            return this.referenceDelegate.qi(), n(s).next((t => this.referenceDelegate.Gi(s).next((() => t)))).toPromise().then((t => (s.raiseOnCommittedEvent(), 
            t)));
        }
        Ki(t, e) {
            return wi.or(Object.values(this.Li).map((n => () => n.containsKey(t, e))));
        }
    }

    /**
     * Memory persistence is not actually transactional, but future implementations
     * may have transaction-scoped state.
     */ class Ro extends _i {
        constructor(t) {
            super(), this.currentSequenceNumber = t;
        }
    }

    class bo {
        constructor(t) {
            this.persistence = t, 
            /** Tracks all documents that are active in Query views. */
            this.Qi = new go, 
            /** The list of documents that are potentially GCed after each transaction. */
            this.ji = null;
        }
        static Wi(t) {
            return new bo(t);
        }
        get zi() {
            if (this.ji) return this.ji;
            throw L();
        }
        addReference(t, e, n) {
            return this.Qi.addReference(n, e), this.zi.delete(n.toString()), wi.resolve();
        }
        removeReference(t, e, n) {
            return this.Qi.removeReference(n, e), this.zi.add(n.toString()), wi.resolve();
        }
        markPotentiallyOrphaned(t, e) {
            return this.zi.add(e.toString()), wi.resolve();
        }
        removeTarget(t, e) {
            this.Qi.Ri(e.targetId).forEach((t => this.zi.add(t.toString())));
            const n = this.persistence.getTargetCache();
            return n.getMatchingKeysForTargetId(t, e.targetId).next((t => {
                t.forEach((t => this.zi.add(t.toString())));
            })).next((() => n.removeTargetData(t, e)));
        }
        qi() {
            this.ji = new Set;
        }
        Gi(t) {
            // Remove newly orphaned documents.
            const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
            return wi.forEach(this.zi, (n => {
                const s = xt.fromPath(n);
                return this.Hi(t, s).next((t => {
                    t || e.removeEntry(s, ct.min());
                }));
            })).next((() => (this.ji = null, e.apply(t))));
        }
        updateLimboDocument(t, e) {
            return this.Hi(t, e).next((t => {
                t ? this.zi.delete(e.toString()) : this.zi.add(e.toString());
            }));
        }
        Ui(t) {
            // For eager GC, we don't care about the document size, there are no size thresholds.
            return 0;
        }
        Hi(t, e) {
            return wi.or([ () => wi.resolve(this.Qi.containsKey(e)), () => this.persistence.getTargetCache().containsKey(t, e), () => this.persistence.Ki(t, e) ]);
        }
    }

    /**
     * Metadata state of the local client. Unlike `RemoteClientState`, this class is
     * mutable and keeps track of all pending mutations, which allows us to
     * update the range of pending mutation batch IDs as new mutations are added or
     * removed.
     *
     * The data in `LocalClientState` is not read from WebStorage and instead
     * updated via its instance methods. The updated state can be serialized via
     * `toWebStorageJSON()`.
     */
    // Visible for testing.
    class No {
        constructor() {
            this.activeTargetIds = Jn();
        }
        Xi(t) {
            this.activeTargetIds = this.activeTargetIds.add(t);
        }
        Zi(t) {
            this.activeTargetIds = this.activeTargetIds.delete(t);
        }
        /**
         * Converts this entry into a JSON-encoded format we can use for WebStorage.
         * Does not encode `clientId` as it is part of the key in WebStorage.
         */    Yi() {
            const t = {
                activeTargetIds: this.activeTargetIds.toArray(),
                updateTimeMs: Date.now()
            };
            return JSON.stringify(t);
        }
    }

    class Mo {
        constructor() {
            this.Fr = new No, this.$r = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
        }
        addPendingMutation(t) {
            // No op.
        }
        updateMutationState(t, e, n) {
            // No op.
        }
        addLocalQueryTarget(t) {
            return this.Fr.Xi(t), this.$r[t] || "not-current";
        }
        updateQueryState(t, e, n) {
            this.$r[t] = e;
        }
        removeLocalQueryTarget(t) {
            this.Fr.Zi(t);
        }
        isLocalQueryTarget(t) {
            return this.Fr.activeTargetIds.has(t);
        }
        clearQueryState(t) {
            delete this.$r[t];
        }
        getAllActiveQueryTargets() {
            return this.Fr.activeTargetIds;
        }
        isActiveQueryTarget(t) {
            return this.Fr.activeTargetIds.has(t);
        }
        start() {
            return this.Fr = new No, Promise.resolve();
        }
        handleUserChange(t, e, n) {
            // No op.
        }
        setOnlineState(t) {
            // No op.
        }
        shutdown() {}
        writeSequenceNumber(t) {}
        notifyBundleLoaded(t) {
            // No op.
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Oo {
        Br(t) {
            // No-op.
        }
        shutdown() {
            // No-op.
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // References to `window` are guarded by BrowserConnectivityMonitor.isAvailable()
    /* eslint-disable no-restricted-globals */
    /**
     * Browser implementation of ConnectivityMonitor.
     */
    class Fo {
        constructor() {
            this.Lr = () => this.Ur(), this.qr = () => this.Gr(), this.Kr = [], this.Qr();
        }
        Br(t) {
            this.Kr.push(t);
        }
        shutdown() {
            window.removeEventListener("online", this.Lr), window.removeEventListener("offline", this.qr);
        }
        Qr() {
            window.addEventListener("online", this.Lr), window.addEventListener("offline", this.qr);
        }
        Ur() {
            O("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
            for (const t of this.Kr) t(0 /* AVAILABLE */);
        }
        Gr() {
            O("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
            for (const t of this.Kr) t(1 /* UNAVAILABLE */);
        }
        // TODO(chenbrian): Consider passing in window either into this component or
        // here for testing via FakeWindow.
        /** Checks that all used attributes of window are available. */
        static vt() {
            return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const $o = {
        BatchGetDocuments: "batchGet",
        Commit: "commit",
        RunQuery: "runQuery"
    };

    /**
     * Maps RPC names to the corresponding REST endpoint name.
     *
     * We use array notation to avoid mangling.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provides a simple helper class that implements the Stream interface to
     * bridge to other implementations that are streams but do not implement the
     * interface. The stream callbacks are invoked with the callOn... methods.
     */
    class Bo {
        constructor(t) {
            this.jr = t.jr, this.Wr = t.Wr;
        }
        zr(t) {
            this.Hr = t;
        }
        Jr(t) {
            this.Yr = t;
        }
        onMessage(t) {
            this.Xr = t;
        }
        close() {
            this.Wr();
        }
        send(t) {
            this.jr(t);
        }
        Zr() {
            this.Hr();
        }
        eo(t) {
            this.Yr(t);
        }
        no(t) {
            this.Xr(t);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Lo extends 
    /**
     * Base class for all Rest-based connections to the backend (WebChannel and
     * HTTP).
     */
    class {
        constructor(t) {
            this.databaseInfo = t, this.databaseId = t.databaseId;
            const e = t.ssl ? "https" : "http";
            this.so = e + "://" + t.host, this.io = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
        }
        ro(t, e, n, s, i) {
            const r = this.oo(t, e);
            O("RestConnection", "Sending: ", r, n);
            const o = {};
            return this.uo(o, s, i), this.ao(t, r, o, n).then((t => (O("RestConnection", "Received: ", t), 
            t)), (e => {
                throw $("RestConnection", `${t} failed with error: `, e, "url: ", r, "request:", n), 
                e;
            }));
        }
        co(t, e, n, s, i) {
            // The REST API automatically aggregates all of the streamed results, so we
            // can just use the normal invoke() method.
            return this.ro(t, e, n, s, i);
        }
        /**
         * Modifies the headers for a request, adding any authorization token if
         * present and any additional headers for the request.
         */    uo(t, e, n) {
            t["X-Goog-Api-Client"] = "gl-js/ fire/" + x, 
            // Content-Type: text/plain will avoid preflight requests which might
            // mess with CORS and redirects by proxies. If we add custom headers
            // we will need to change this code to potentially use the $httpOverwrite
            // parameter supported by ESF to avoid triggering preflight requests.
            t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), 
            e && e.headers.forEach(((e, n) => t[n] = e)), n && n.headers.forEach(((e, n) => t[n] = e));
        }
        oo(t, e) {
            const n = $o[t];
            return `${this.so}/v1/${e}:${n}`;
        }
    } {
        constructor(t) {
            super(t), this.forceLongPolling = t.forceLongPolling, this.autoDetectLongPolling = t.autoDetectLongPolling, 
            this.useFetchStreams = t.useFetchStreams;
        }
        ao(t, e, n, s) {
            return new Promise(((i, r) => {
                const o = new XhrIo;
                o.listenOnce(EventType.COMPLETE, (() => {
                    try {
                        switch (o.getLastErrorCode()) {
                          case ErrorCode.NO_ERROR:
                            const e = o.getResponseJson();
                            O("Connection", "XHR received:", JSON.stringify(e)), i(e);
                            break;

                          case ErrorCode.TIMEOUT:
                            O("Connection", 'RPC "' + t + '" timed out'), r(new Q(K.DEADLINE_EXCEEDED, "Request time out"));
                            break;

                          case ErrorCode.HTTP_ERROR:
                            const n = o.getStatus();
                            if (O("Connection", 'RPC "' + t + '" failed with status:', n, "response text:", o.getResponseText()), 
                            n > 0) {
                                const t = o.getResponseJson().error;
                                if (t && t.status && t.message) {
                                    const e = function(t) {
                                        const e = t.toLowerCase().replace(/_/g, "-");
                                        return Object.values(K).indexOf(e) >= 0 ? e : K.UNKNOWN;
                                    }(t.status);
                                    r(new Q(e, t.message));
                                } else r(new Q(K.UNKNOWN, "Server responded with status " + o.getStatus()));
                            } else 
                            // If we received an HTTP_ERROR but there's no status code,
                            // it's most probably a connection issue
                            r(new Q(K.UNAVAILABLE, "Connection failed."));
                            break;

                          default:
                            L();
                        }
                    } finally {
                        O("Connection", 'RPC "' + t + '" completed.');
                    }
                }));
                const u = JSON.stringify(s);
                o.send(e, "POST", u, n, 15);
            }));
        }
        ho(t, e, n) {
            const s = [ this.so, "/", "google.firestore.v1.Firestore", "/", t, "/channel" ], i = createWebChannelTransport(), r = getStatEventTarget(), o = {
                // Required for backend stickiness, routing behavior is based on this
                // parameter.
                httpSessionIdParam: "gsessionid",
                initMessageHeaders: {},
                messageUrlParams: {
                    // This param is used to improve routing and project isolation by the
                    // backend and must be included in every request.
                    database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
                },
                sendRawJson: !0,
                supportsCrossDomainXhr: !0,
                internalChannelParams: {
                    // Override the default timeout (randomized between 10-20 seconds) since
                    // a large write batch on a slow internet connection may take a long
                    // time to send to the backend. Rather than have WebChannel impose a
                    // tight timeout which could lead to infinite timeouts and retries, we
                    // set it very large (5-10 minutes) and rely on the browser's builtin
                    // timeouts to kick in if the request isn't working.
                    forwardChannelRequestTimeoutMs: 6e5
                },
                forceLongPolling: this.forceLongPolling,
                detectBufferingProxy: this.autoDetectLongPolling
            };
            this.useFetchStreams && (o.xmlHttpFactory = new FetchXmlHttpFactory({})), this.uo(o.initMessageHeaders, e, n), 
            // Sending the custom headers we just added to request.initMessageHeaders
            // (Authorization, etc.) will trigger the browser to make a CORS preflight
            // request because the XHR will no longer meet the criteria for a "simple"
            // CORS request:
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
            // Therefore to avoid the CORS preflight request (an extra network
            // roundtrip), we use the httpHeadersOverwriteParam option to specify that
            // the headers should instead be encoded into a special "$httpHeaders" query
            // parameter, which is recognized by the webchannel backend. This is
            // formally defined here:
            // https://github.com/google/closure-library/blob/b0e1815b13fb92a46d7c9b3c30de5d6a396a3245/closure/goog/net/rpc/httpcors.js#L32
            // TODO(b/145624756): There is a backend bug where $httpHeaders isn't respected if the request
            // doesn't have an Origin header. So we have to exclude a few browser environments that are
            // known to (sometimes) not include an Origin. See
            // https://github.com/firebase/firebase-js-sdk/issues/1491.
            isMobileCordova() || isReactNative() || isElectron() || isIE() || isUWP() || isBrowserExtension() || (o.httpHeadersOverwriteParam = "$httpHeaders");
            const u = s.join("");
            O("Connection", "Creating WebChannel: " + u, o);
            const a = i.createWebChannel(u, o);
            // WebChannel supports sending the first message with the handshake - saving
            // a network round trip. However, it will have to call send in the same
            // JS event loop as open. In order to enforce this, we delay actually
            // opening the WebChannel until send is called. Whether we have called
            // open is tracked with this variable.
                    let c = !1, h = !1;
            // A flag to determine whether the stream was closed (by us or through an
            // error/close event) to avoid delivering multiple close events or sending
            // on a closed stream
                    const l = new Bo({
                jr: t => {
                    h ? O("Connection", "Not sending because WebChannel is closed:", t) : (c || (O("Connection", "Opening WebChannel transport."), 
                    a.open(), c = !0), O("Connection", "WebChannel sending:", t), a.send(t));
                },
                Wr: () => a.close()
            }), y = (t, e, n) => {
                // TODO(dimond): closure typing seems broken because WebChannel does
                // not implement goog.events.Listenable
                t.listen(e, (t => {
                    try {
                        n(t);
                    } catch (t) {
                        setTimeout((() => {
                            throw t;
                        }), 0);
                    }
                }));
            };
            // Closure events are guarded and exceptions are swallowed, so catch any
            // exception and rethrow using a setTimeout so they become visible again.
            // Note that eventually this function could go away if we are confident
            // enough the code is exception free.
                    return y(a, WebChannel.EventType.OPEN, (() => {
                h || O("Connection", "WebChannel transport opened.");
            })), y(a, WebChannel.EventType.CLOSE, (() => {
                h || (h = !0, O("Connection", "WebChannel transport closed"), l.eo());
            })), y(a, WebChannel.EventType.ERROR, (t => {
                h || (h = !0, $("Connection", "WebChannel transport errored:", t), l.eo(new Q(K.UNAVAILABLE, "The operation could not be completed")));
            })), y(a, WebChannel.EventType.MESSAGE, (t => {
                var e;
                if (!h) {
                    const n = t.data[0];
                    U(!!n);
                    // TODO(b/35143891): There is a bug in One Platform that caused errors
                    // (and only errors) to be wrapped in an extra array. To be forward
                    // compatible with the bug we need to check either condition. The latter
                    // can be removed once the fix has been rolled out.
                    // Use any because msgData.error is not typed.
                    const s = n, i = s.error || (null === (e = s[0]) || void 0 === e ? void 0 : e.error);
                    if (i) {
                        O("Connection", "WebChannel received error:", i);
                        // error.status will be a string like 'OK' or 'NOT_FOUND'.
                        const t = i.status;
                        let e = 
                        /**
     * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
     *
     * @returns The Code equivalent to the given status string or undefined if
     *     there is no match.
     */
                        function(t) {
                            // lookup by string
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const e = Dn[t];
                            if (void 0 !== e) return Nn(e);
                        }(t), n = i.message;
                        void 0 === e && (e = K.INTERNAL, n = "Unknown error status: " + t + " with message " + i.message), 
                        // Mark closed so no further events are propagated
                        h = !0, l.eo(new Q(e, n)), a.close();
                    } else O("Connection", "WebChannel received:", n), l.no(n);
                }
            })), y(r, Event.STAT_EVENT, (t => {
                t.stat === Stat.PROXY ? O("Connection", "Detected buffering proxy") : t.stat === Stat.NOPROXY && O("Connection", "Detected no buffering proxy");
            })), setTimeout((() => {
                // Technically we could/should wait for the WebChannel opened event,
                // but because we want to send the first message with the WebChannel
                // handshake we pretend the channel opened here (asynchronously), and
                // then delay the actual open until the first message is sent.
                l.Zr();
            }), 0), l;
        }
    }

    /** The Platform's 'document' implementation or null if not available. */ function qo() {
        // `document` is not always available, e.g. in ReactNative and WebWorkers.
        // eslint-disable-next-line no-restricted-globals
        return "undefined" != typeof document ? document : null;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Go(t) {
        return new as(t, /* useProto3Json= */ !0);
    }

    /**
     * An instance of the Platform's 'TextEncoder' implementation.
     */
    /**
     * A helper for running delayed tasks following an exponential backoff curve
     * between attempts.
     *
     * Each delay is made up of a "base" delay which follows the exponential
     * backoff curve, and a +/- 50% "jitter" that is calculated and added to the
     * base delay. This prevents clients from accidentally synchronizing their
     * delays causing spikes of load to the backend.
     */
    class Ko {
        constructor(
        /**
         * The AsyncQueue to run backoff operations on.
         */
        t, 
        /**
         * The ID to use when scheduling backoff operations on the AsyncQueue.
         */
        e, 
        /**
         * The initial delay (used as the base delay on the first retry attempt).
         * Note that jitter will still be applied, so the actual delay could be as
         * little as 0.5*initialDelayMs.
         */
        n = 1e3
        /**
         * The multiplier to use to determine the extended base delay after each
         * attempt.
         */ , s = 1.5
        /**
         * The maximum base delay after which no further backoff is performed.
         * Note that jitter will still be applied, so the actual delay could be as
         * much as 1.5*maxDelayMs.
         */ , i = 6e4) {
            this.Jn = t, this.timerId = e, this.lo = n, this.fo = s, this._o = i, this.wo = 0, 
            this.mo = null, 
            /** The last backoff attempt, as epoch milliseconds. */
            this.yo = Date.now(), this.reset();
        }
        /**
         * Resets the backoff delay.
         *
         * The very next backoffAndWait() will have no delay. If it is called again
         * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
         * subsequent ones will increase according to the backoffFactor.
         */    reset() {
            this.wo = 0;
        }
        /**
         * Resets the backoff delay to the maximum delay (e.g. for use after a
         * RESOURCE_EXHAUSTED error).
         */    po() {
            this.wo = this._o;
        }
        /**
         * Returns a promise that resolves after currentDelayMs, and increases the
         * delay for any subsequent attempts. If there was a pending backoff operation
         * already, it will be canceled.
         */    Io(t) {
            // Cancel any pending backoff operation.
            this.cancel();
            // First schedule using the current base (which may be 0 and should be
            // honored as such).
            const e = Math.floor(this.wo + this.To()), n = Math.max(0, Date.now() - this.yo), s = Math.max(0, e - n);
            // Guard against lastAttemptTime being in the future due to a clock change.
                    s > 0 && O("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.wo} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), 
            this.mo = this.Jn.enqueueAfterDelay(this.timerId, s, (() => (this.yo = Date.now(), 
            t()))), 
            // Apply backoff factor to determine next delay and ensure it is within
            // bounds.
            this.wo *= this.fo, this.wo < this.lo && (this.wo = this.lo), this.wo > this._o && (this.wo = this._o);
        }
        Eo() {
            null !== this.mo && (this.mo.skipDelay(), this.mo = null);
        }
        cancel() {
            null !== this.mo && (this.mo.cancel(), this.mo = null);
        }
        /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */    To() {
            return (Math.random() - .5) * this.wo;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A PersistentStream is an abstract base class that represents a streaming RPC
     * to the Firestore backend. It's built on top of the connections own support
     * for streaming RPCs, and adds several critical features for our clients:
     *
     *   - Exponential backoff on failure
     *   - Authentication via CredentialsProvider
     *   - Dispatching all callbacks into the shared worker queue
     *   - Closing idle streams after 60 seconds of inactivity
     *
     * Subclasses of PersistentStream implement serialization of models to and
     * from the JSON representation of the protocol buffers for a specific
     * streaming RPC.
     *
     * ## Starting and Stopping
     *
     * Streaming RPCs are stateful and need to be start()ed before messages can
     * be sent and received. The PersistentStream will call the onOpen() function
     * of the listener once the stream is ready to accept requests.
     *
     * Should a start() fail, PersistentStream will call the registered onClose()
     * listener with a FirestoreError indicating what went wrong.
     *
     * A PersistentStream can be started and stopped repeatedly.
     *
     * Generic types:
     *  SendType: The type of the outgoing message of the underlying
     *    connection stream
     *  ReceiveType: The type of the incoming message of the underlying
     *    connection stream
     *  ListenerType: The type of the listener that will be used for callbacks
     */
    class Qo {
        constructor(t, e, n, s, i, r, o, u) {
            this.Jn = t, this.Ao = n, this.Ro = s, this.bo = i, this.authCredentialsProvider = r, 
            this.appCheckCredentialsProvider = o, this.listener = u, this.state = 0 /* Initial */ , 
            /**
             * A close count that's incremented every time the stream is closed; used by
             * getCloseGuardedDispatcher() to invalidate callbacks that happen after
             * close.
             */
            this.Po = 0, this.Vo = null, this.vo = null, this.stream = null, this.So = new Ko(t, e);
        }
        /**
         * Returns true if start() has been called and no error has occurred. True
         * indicates the stream is open or in the process of opening (which
         * encompasses respecting backoff, getting auth tokens, and starting the
         * actual RPC). Use isOpen() to determine if the stream is open and ready for
         * outbound requests.
         */    Do() {
            return 1 /* Starting */ === this.state || 5 /* Backoff */ === this.state || this.Co();
        }
        /**
         * Returns true if the underlying RPC is open (the onOpen() listener has been
         * called) and the stream is ready for outbound requests.
         */    Co() {
            return 2 /* Open */ === this.state || 3 /* Healthy */ === this.state;
        }
        /**
         * Starts the RPC. Only allowed if isStarted() returns false. The stream is
         * not immediately ready for use: onOpen() will be invoked when the RPC is
         * ready for outbound requests, at which point isOpen() will return true.
         *
         * When start returns, isStarted() will return true.
         */    start() {
            4 /* Error */ !== this.state ? this.auth() : this.xo();
        }
        /**
         * Stops the RPC. This call is idempotent and allowed regardless of the
         * current isStarted() state.
         *
         * When stop returns, isStarted() and isOpen() will both return false.
         */    async stop() {
            this.Do() && await this.close(0 /* Initial */);
        }
        /**
         * After an error the stream will usually back off on the next attempt to
         * start it. If the error warrants an immediate restart of the stream, the
         * sender can use this to indicate that the receiver should not back off.
         *
         * Each error will call the onClose() listener. That function can decide to
         * inhibit backoff if required.
         */    No() {
            this.state = 0 /* Initial */ , this.So.reset();
        }
        /**
         * Marks this stream as idle. If no further actions are performed on the
         * stream for one minute, the stream will automatically close itself and
         * notify the stream's onClose() handler with Status.OK. The stream will then
         * be in a !isStarted() state, requiring the caller to start the stream again
         * before further use.
         *
         * Only streams that are in state 'Open' can be marked idle, as all other
         * states imply pending network operations.
         */    ko() {
            // Starts the idle time if we are in state 'Open' and are not yet already
            // running a timer (in which case the previous idle timeout still applies).
            this.Co() && null === this.Vo && (this.Vo = this.Jn.enqueueAfterDelay(this.Ao, 6e4, (() => this.Mo())));
        }
        /** Sends a message to the underlying stream. */    Oo(t) {
            this.Fo(), this.stream.send(t);
        }
        /** Called by the idle timer when the stream should close due to inactivity. */    async Mo() {
            if (this.Co()) 
            // When timing out an idle stream there's no reason to force the stream into backoff when
            // it restarts so set the stream state to Initial instead of Error.
            return this.close(0 /* Initial */);
        }
        /** Marks the stream as active again. */    Fo() {
            this.Vo && (this.Vo.cancel(), this.Vo = null);
        }
        /** Cancels the health check delayed operation. */    $o() {
            this.vo && (this.vo.cancel(), this.vo = null);
        }
        /**
         * Closes the stream and cleans up as necessary:
         *
         * * closes the underlying GRPC stream;
         * * calls the onClose handler with the given 'error';
         * * sets internal stream state to 'finalState';
         * * adjusts the backoff timer based on the error
         *
         * A new stream can be opened by calling start().
         *
         * @param finalState - the intended state of the stream after closing.
         * @param error - the error the connection was closed with.
         */    async close(t, e) {
            // Cancel any outstanding timers (they're guaranteed not to execute).
            this.Fo(), this.$o(), this.So.cancel(), 
            // Invalidates any stream-related callbacks (e.g. from auth or the
            // underlying stream), guaranteeing they won't execute.
            this.Po++, 4 /* Error */ !== t ? 
            // If this is an intentional close ensure we don't delay our next connection attempt.
            this.So.reset() : e && e.code === K.RESOURCE_EXHAUSTED ? (
            // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
            F(e.toString()), F("Using maximum backoff delay to prevent overloading the backend."), 
            this.So.po()) : e && e.code === K.UNAUTHENTICATED && 3 /* Healthy */ !== this.state && (
            // "unauthenticated" error means the token was rejected. This should rarely
            // happen since both Auth and AppCheck ensure a sufficient TTL when we
            // request a token. If a user manually resets their system clock this can
            // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
            // before we received the first message and we need to invalidate the token
            // to ensure that we fetch a new token.
            this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), 
            // Clean up the underlying stream because we are no longer interested in events.
            null !== this.stream && (this.Bo(), this.stream.close(), this.stream = null), 
            // This state must be assigned before calling onClose() to allow the callback to
            // inhibit backoff or otherwise manipulate the state in its non-started state.
            this.state = t, 
            // Notify the listener that the stream closed.
            await this.listener.Jr(e);
        }
        /**
         * Can be overridden to perform additional cleanup before the stream is closed.
         * Calling super.tearDown() is not required.
         */    Bo() {}
        auth() {
            this.state = 1 /* Starting */;
            const t = this.Lo(this.Po), e = this.Po;
            // TODO(mikelehen): Just use dispatchIfNotClosed, but see TODO below.
                    Promise.all([ this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken() ]).then((([t, n]) => {
                // Stream can be stopped while waiting for authentication.
                // TODO(mikelehen): We really should just use dispatchIfNotClosed
                // and let this dispatch onto the queue, but that opened a spec test can
                // of worms that I don't want to deal with in this PR.
                this.Po === e && 
                // Normally we'd have to schedule the callback on the AsyncQueue.
                // However, the following calls are safe to be called outside the
                // AsyncQueue since they don't chain asynchronous calls
                this.Uo(t, n);
            }), (e => {
                t((() => {
                    const t = new Q(K.UNKNOWN, "Fetching auth token failed: " + e.message);
                    return this.qo(t);
                }));
            }));
        }
        Uo(t, e) {
            const n = this.Lo(this.Po);
            this.stream = this.Go(t, e), this.stream.zr((() => {
                n((() => (this.state = 2 /* Open */ , this.vo = this.Jn.enqueueAfterDelay(this.Ro, 1e4, (() => (this.Co() && (this.state = 3 /* Healthy */), 
                Promise.resolve()))), this.listener.zr())));
            })), this.stream.Jr((t => {
                n((() => this.qo(t)));
            })), this.stream.onMessage((t => {
                n((() => this.onMessage(t)));
            }));
        }
        xo() {
            this.state = 5 /* Backoff */ , this.So.Io((async () => {
                this.state = 0 /* Initial */ , this.start();
            }));
        }
        // Visible for tests
        qo(t) {
            // In theory the stream could close cleanly, however, in our current model
            // we never expect this to happen because if we stop a stream ourselves,
            // this callback will never be called. To prevent cases where we retry
            // without a backoff accidentally, we set the stream to error in all cases.
            return O("PersistentStream", `close with error: ${t}`), this.stream = null, this.close(4 /* Error */ , t);
        }
        /**
         * Returns a "dispatcher" function that dispatches operations onto the
         * AsyncQueue but only runs them if closeCount remains unchanged. This allows
         * us to turn auth / stream callbacks into no-ops if the stream is closed /
         * re-opened, etc.
         */    Lo(t) {
            return e => {
                this.Jn.enqueueAndForget((() => this.Po === t ? e() : (O("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), 
                Promise.resolve())));
            };
        }
    }

    /**
     * A PersistentStream that implements the Listen RPC.
     *
     * Once the Listen stream has called the onOpen() listener, any number of
     * listen() and unlisten() calls can be made to control what changes will be
     * sent from the server for ListenResponses.
     */ class jo extends Qo {
        constructor(t, e, n, s, i, r) {
            super(t, "listen_stream_connection_backoff" /* ListenStreamConnectionBackoff */ , "listen_stream_idle" /* ListenStreamIdle */ , "health_check_timeout" /* HealthCheckTimeout */ , e, n, s, r), 
            this.M = i;
        }
        Go(t, e) {
            return this.bo.ho("Listen", t, e);
        }
        onMessage(t) {
            // A successful response means the stream is healthy
            this.So.reset();
            const e = Rs(this.M, t), n = function(t) {
                // We have only reached a consistent snapshot for the entire stream if there
                // is a read_time set and it applies to all targets (i.e. the list of
                // targets is empty). The backend is guaranteed to send such responses.
                if (!("targetChange" in t)) return ct.min();
                const e = t.targetChange;
                return e.targetIds && e.targetIds.length ? ct.min() : e.readTime ? fs(e.readTime) : ct.min();
            }(t);
            return this.listener.Ko(e, n);
        }
        /**
         * Registers interest in the results of the given target. If the target
         * includes a resumeToken it will be included in the request. Results that
         * affect the target will be streamed back as WatchChange messages that
         * reference the targetId.
         */    Qo(t) {
            const e = {};
            e.database = ps(this.M), e.addTarget = function(t, e) {
                let n;
                const s = e.target;
                return n = we(s) ? {
                    documents: vs(t, s)
                } : {
                    query: Ss(t, s)
                }, n.targetId = e.targetId, e.resumeToken.approximateByteSize() > 0 ? n.resumeToken = hs(t, e.resumeToken) : e.snapshotVersion.compareTo(ct.min()) > 0 && (
                // TODO(wuandy): Consider removing above check because it is most likely true.
                // Right now, many tests depend on this behaviour though (leaving min() out
                // of serialization).
                n.readTime = cs(t, e.snapshotVersion.toTimestamp())), n;
            }(this.M, t);
            const n = Cs(this.M, t);
            n && (e.labels = n), this.Oo(e);
        }
        /**
         * Unregisters interest in the results of the target associated with the
         * given targetId.
         */    jo(t) {
            const e = {};
            e.database = ps(this.M), e.removeTarget = t, this.Oo(e);
        }
    }

    /**
     * A Stream that implements the Write RPC.
     *
     * The Write RPC requires the caller to maintain special streamToken
     * state in between calls, to help the server understand which responses the
     * client has processed by the time the next request is made. Every response
     * will contain a streamToken; this value must be passed to the next
     * request.
     *
     * After calling start() on this stream, the next request must be a handshake,
     * containing whatever streamToken is on hand. Once a response to this
     * request is received, all pending mutations may be submitted. When
     * submitting multiple batches of mutations at the same time, it's
     * okay to use the same streamToken for the calls to writeMutations.
     *
     * TODO(b/33271235): Use proto types
     */ class Wo extends Qo {
        constructor(t, e, n, s, i, r) {
            super(t, "write_stream_connection_backoff" /* WriteStreamConnectionBackoff */ , "write_stream_idle" /* WriteStreamIdle */ , "health_check_timeout" /* HealthCheckTimeout */ , e, n, s, r), 
            this.M = i, this.Wo = !1;
        }
        /**
         * Tracks whether or not a handshake has been successfully exchanged and
         * the stream is ready to accept mutations.
         */    get zo() {
            return this.Wo;
        }
        // Override of PersistentStream.start
        start() {
            this.Wo = !1, this.lastStreamToken = void 0, super.start();
        }
        Bo() {
            this.Wo && this.Ho([]);
        }
        Go(t, e) {
            return this.bo.ho("Write", t, e);
        }
        onMessage(t) {
            if (
            // Always capture the last stream token.
            U(!!t.streamToken), this.lastStreamToken = t.streamToken, this.Wo) {
                // A successful first write response means the stream is healthy,
                // Note, that we could consider a successful handshake healthy, however,
                // the write itself might be causing an error we want to back off from.
                this.So.reset();
                const e = Vs(t.writeResults, t.commitTime), n = fs(t.commitTime);
                return this.listener.Jo(n, e);
            }
            // The first response is always the handshake response
            return U(!t.writeResults || 0 === t.writeResults.length), this.Wo = !0, this.listener.Yo();
        }
        /**
         * Sends an initial streamToken to the server, performing the handshake
         * required to make the StreamingWrite RPC work. Subsequent
         * calls should wait until onHandshakeComplete was called.
         */    Xo() {
            // TODO(dimond): Support stream resumption. We intentionally do not set the
            // stream token on the handshake, ignoring any stream token we might have.
            const t = {};
            t.database = ps(this.M), this.Oo(t);
        }
        /** Sends a group of mutations to the Firestore backend to apply. */    Ho(t) {
            const e = {
                streamToken: this.lastStreamToken,
                writes: t.map((t => bs(this.M, t)))
            };
            this.Oo(e);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Datastore and its related methods are a wrapper around the external Google
     * Cloud Datastore grpc API, which provides an interface that is more convenient
     * for the rest of the client SDK architecture to consume.
     */
    /**
     * An implementation of Datastore that exposes additional state for internal
     * consumption.
     */
    class zo extends class {} {
        constructor(t, e, n, s) {
            super(), this.authCredentials = t, this.appCheckCredentials = e, this.bo = n, this.M = s, 
            this.Zo = !1;
        }
        tu() {
            if (this.Zo) throw new Q(K.FAILED_PRECONDITION, "The client has already been terminated.");
        }
        /** Invokes the provided RPC with auth and AppCheck tokens. */    ro(t, e, n) {
            return this.tu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, i]) => this.bo.ro(t, e, n, s, i))).catch((t => {
                throw "FirebaseError" === t.name ? (t.code === K.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
                this.appCheckCredentials.invalidateToken()), t) : new Q(K.UNKNOWN, t.toString());
            }));
        }
        /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */    co(t, e, n) {
            return this.tu(), Promise.all([ this.authCredentials.getToken(), this.appCheckCredentials.getToken() ]).then((([s, i]) => this.bo.co(t, e, n, s, i))).catch((t => {
                throw "FirebaseError" === t.name ? (t.code === K.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), 
                this.appCheckCredentials.invalidateToken()), t) : new Q(K.UNKNOWN, t.toString());
            }));
        }
        terminate() {
            this.Zo = !0;
        }
    }

    // TODO(firestorexp): Make sure there is only one Datastore instance per
    // firestore-exp client.
    /**
     * A component used by the RemoteStore to track the OnlineState (that is,
     * whether or not the client as a whole should be considered to be online or
     * offline), implementing the appropriate heuristics.
     *
     * In particular, when the client is trying to connect to the backend, we
     * allow up to MAX_WATCH_STREAM_FAILURES within ONLINE_STATE_TIMEOUT_MS for
     * a connection to succeed. If we have too many failures or the timeout elapses,
     * then we set the OnlineState to Offline, and the client will behave as if
     * it is offline (get()s will return cached data, etc.).
     */
    class Ho {
        constructor(t, e) {
            this.asyncQueue = t, this.onlineStateHandler = e, 
            /** The current OnlineState. */
            this.state = "Unknown" /* Unknown */ , 
            /**
             * A count of consecutive failures to open the stream. If it reaches the
             * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
             * Offline.
             */
            this.eu = 0, 
            /**
             * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
             * transition from OnlineState.Unknown to OnlineState.Offline without waiting
             * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
             */
            this.nu = null, 
            /**
             * Whether the client should log a warning message if it fails to connect to
             * the backend (initially true, cleared after a successful stream, or if we've
             * logged the message already).
             */
            this.su = !0;
        }
        /**
         * Called by RemoteStore when a watch stream is started (including on each
         * backoff attempt).
         *
         * If this is the first attempt, it sets the OnlineState to Unknown and starts
         * the onlineStateTimer.
         */    iu() {
            0 === this.eu && (this.ru("Unknown" /* Unknown */), this.nu = this.asyncQueue.enqueueAfterDelay("online_state_timeout" /* OnlineStateTimeout */ , 1e4, (() => (this.nu = null, 
            this.ou("Backend didn't respond within 10 seconds."), this.ru("Offline" /* Offline */), 
            Promise.resolve()))));
        }
        /**
         * Updates our OnlineState as appropriate after the watch stream reports a
         * failure. The first failure moves us to the 'Unknown' state. We then may
         * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
         * actually transition to the 'Offline' state.
         */    uu(t) {
            "Online" /* Online */ === this.state ? this.ru("Unknown" /* Unknown */) : (this.eu++, 
            this.eu >= 1 && (this.au(), this.ou(`Connection failed 1 times. Most recent error: ${t.toString()}`), 
            this.ru("Offline" /* Offline */)));
        }
        /**
         * Explicitly sets the OnlineState to the specified state.
         *
         * Note that this resets our timers / failure counters, etc. used by our
         * Offline heuristics, so must not be used in place of
         * handleWatchStreamStart() and handleWatchStreamFailure().
         */    set(t) {
            this.au(), this.eu = 0, "Online" /* Online */ === t && (
            // We've connected to watch at least once. Don't warn the developer
            // about being offline going forward.
            this.su = !1), this.ru(t);
        }
        ru(t) {
            t !== this.state && (this.state = t, this.onlineStateHandler(t));
        }
        ou(t) {
            const e = `Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
            this.su ? (F(e), this.su = !1) : O("OnlineStateTracker", e);
        }
        au() {
            null !== this.nu && (this.nu.cancel(), this.nu = null);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Jo {
        constructor(
        /**
         * The local store, used to fill the write pipeline with outbound mutations.
         */
        t, 
        /** The client-side proxy for interacting with the backend. */
        e, n, s, i) {
            this.localStore = t, this.datastore = e, this.asyncQueue = n, this.remoteSyncer = {}, 
            /**
             * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
             * LocalStore via fillWritePipeline() and have or will send to the write
             * stream.
             *
             * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
             * restart the write stream. When the stream is established the writes in the
             * pipeline will be sent in order.
             *
             * Writes remain in writePipeline until they are acknowledged by the backend
             * and thus will automatically be re-sent if the stream is interrupted /
             * restarted before they're acknowledged.
             *
             * Write responses from the backend are linked to their originating request
             * purely based on order, and so we can just shift() writes from the front of
             * the writePipeline as we receive responses.
             */
            this.cu = [], 
            /**
             * A mapping of watched targets that the client cares about tracking and the
             * user has explicitly called a 'listen' for this target.
             *
             * These targets may or may not have been sent to or acknowledged by the
             * server. On re-establishing the listen stream, these targets should be sent
             * to the server. The targets removed with unlistens are removed eagerly
             * without waiting for confirmation from the listen stream.
             */
            this.hu = new Map, 
            /**
             * A set of reasons for why the RemoteStore may be offline. If empty, the
             * RemoteStore may start its network connections.
             */
            this.lu = new Set, 
            /**
             * Event handlers that get called when the network is disabled or enabled.
             *
             * PORTING NOTE: These functions are used on the Web client to create the
             * underlying streams (to support tree-shakeable streams). On Android and iOS,
             * the streams are created during construction of RemoteStore.
             */
            this.fu = [], this.du = i, this.du.Br((t => {
                n.enqueueAndForget((async () => {
                    // Porting Note: Unlike iOS, `restartNetwork()` is called even when the
                    // network becomes unreachable as we don't have any other way to tear
                    // down our streams.
                    ru(this) && (O("RemoteStore", "Restarting streams for network reachability change."), 
                    await async function(t) {
                        const e = G(t);
                        e.lu.add(4 /* ConnectivityChange */), await Xo(e), e._u.set("Unknown" /* Unknown */), 
                        e.lu.delete(4 /* ConnectivityChange */), await Yo(e);
                    }(this));
                }));
            })), this._u = new Ho(n, s);
        }
    }

    async function Yo(t) {
        if (ru(t)) for (const e of t.fu) await e(/* enabled= */ !0);
    }

    /**
     * Temporarily disables the network. The network can be re-enabled using
     * enableNetwork().
     */ async function Xo(t) {
        for (const e of t.fu) await e(/* enabled= */ !1);
    }

    /**
     * Starts new listen for the given target. Uses resume token if provided. It
     * is a no-op if the target of given `TargetData` is already being listened to.
     */
    function Zo(t, e) {
        const n = G(t);
        n.hu.has(e.targetId) || (
        // Mark this as something the client is currently listening for.
        n.hu.set(e.targetId, e), iu(n) ? 
        // The listen will be sent in onWatchStreamOpen
        su(n) : Au(n).Co() && eu(n, e));
    }

    /**
     * Removes the listen from server. It is a no-op if the given target id is
     * not being listened to.
     */ function tu(t, e) {
        const n = G(t), s = Au(n);
        n.hu.delete(e), s.Co() && nu(n, e), 0 === n.hu.size && (s.Co() ? s.ko() : ru(n) && 
        // Revert to OnlineState.Unknown if the watch stream is not open and we
        // have no listeners, since without any listens to send we cannot
        // confirm if the stream is healthy and upgrade to OnlineState.Online.
        n._u.set("Unknown" /* Unknown */));
    }

    /**
     * We need to increment the the expected number of pending responses we're due
     * from watch so we wait for the ack to process any messages from this target.
     */ function eu(t, e) {
        t.wu.Z(e.targetId), Au(t).Qo(e);
    }

    /**
     * We need to increment the expected number of pending responses we're due
     * from watch so we wait for the removal on the server before we process any
     * messages from this target.
     */ function nu(t, e) {
        t.wu.Z(e), Au(t).jo(e);
    }

    function su(t) {
        t.wu = new ss({
            getRemoteKeysForTarget: e => t.remoteSyncer.getRemoteKeysForTarget(e),
            Et: e => t.hu.get(e) || null
        }), Au(t).start(), t._u.iu();
    }

    /**
     * Returns whether the watch stream should be started because it's necessary
     * and has not yet been started.
     */ function iu(t) {
        return ru(t) && !Au(t).Do() && t.hu.size > 0;
    }

    function ru(t) {
        return 0 === G(t).lu.size;
    }

    function ou(t) {
        t.wu = void 0;
    }

    async function uu(t) {
        t.hu.forEach(((e, n) => {
            eu(t, e);
        }));
    }

    async function au(t, e) {
        ou(t), 
        // If we still need the watch stream, retry the connection.
        iu(t) ? (t._u.uu(e), su(t)) : 
        // No need to restart watch stream because there are no active targets.
        // The online state is set to unknown because there is no active attempt
        // at establishing a connection
        t._u.set("Unknown" /* Unknown */);
    }

    async function cu(t, e, n) {
        if (
        // Mark the client as online since we got a message from the server
        t._u.set("Online" /* Online */), e instanceof es && 2 /* Removed */ === e.state && e.cause) 
        // There was an error on a target, don't wait for a consistent snapshot
        // to raise events
        try {
            await 
            /** Handles an error on a target */
            async function(t, e) {
                const n = e.cause;
                for (const s of e.targetIds) 
                // A watched target might have been removed already.
                t.hu.has(s) && (await t.remoteSyncer.rejectListen(s, n), t.hu.delete(s), t.wu.removeTarget(s));
            }
            /**
     * Attempts to fill our write pipeline with writes from the LocalStore.
     *
     * Called internally to bootstrap or refill the write pipeline and by
     * SyncEngine whenever there are new mutations to process.
     *
     * Starts the write stream if necessary.
     */ (t, e);
        } catch (n) {
            O("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), n), 
            await hu(t, n);
        } else if (e instanceof Zn ? t.wu.ut(e) : e instanceof ts ? t.wu._t(e) : t.wu.ht(e), 
        !n.isEqual(ct.min())) try {
            const e = await no(t.localStore);
            n.compareTo(e) >= 0 && 
            // We have received a target change with a global snapshot if the snapshot
            // version is not equal to SnapshotVersion.min().
            await 
            /**
     * Takes a batch of changes from the Datastore, repackages them as a
     * RemoteEvent, and passes that on to the listener, which is typically the
     * SyncEngine.
     */
            function(t, e) {
                const n = t.wu.yt(e);
                // Update in-memory resume tokens. LocalStore will update the
                // persistent view of these when applying the completed RemoteEvent.
                            return n.targetChanges.forEach(((n, s) => {
                    if (n.resumeToken.approximateByteSize() > 0) {
                        const i = t.hu.get(s);
                        // A watched target might have been removed already.
                                            i && t.hu.set(s, i.withResumeToken(n.resumeToken, e));
                    }
                })), 
                // Re-establish listens for the targets that have been invalidated by
                // existence filter mismatches.
                n.targetMismatches.forEach((e => {
                    const n = t.hu.get(e);
                    if (!n) 
                    // A watched target might have been removed already.
                    return;
                    // Clear the resume token for the target, since we're in a known mismatch
                    // state.
                                    t.hu.set(e, n.withResumeToken(pt.EMPTY_BYTE_STRING, n.snapshotVersion)), 
                    // Cause a hard reset by unwatching and rewatching immediately, but
                    // deliberately don't send a resume token so that we get a full update.
                    nu(t, e);
                    // Mark the target we send as being on behalf of an existence filter
                    // mismatch, but don't actually retain that in listenTargets. This ensures
                    // that we flag the first re-listen this way without impacting future
                    // listens of this target (that might happen e.g. on reconnect).
                    const s = new Di(n.target, e, 1 /* ExistenceFilterMismatch */ , n.sequenceNumber);
                    eu(t, s);
                })), t.remoteSyncer.applyRemoteEvent(n);
            }(t, n);
        } catch (e) {
            O("RemoteStore", "Failed to raise snapshot:", e), await hu(t, e);
        }
    }

    /**
     * Recovery logic for IndexedDB errors that takes the network offline until
     * `op` succeeds. Retries are scheduled with backoff using
     * `enqueueRetryable()`. If `op()` is not provided, IndexedDB access is
     * validated via a generic operation.
     *
     * The returned Promise is resolved once the network is disabled and before
     * any retry attempt.
     */ async function hu(t, e, n) {
        if (!Ii(e)) throw e;
        t.lu.add(1 /* IndexedDbFailed */), 
        // Disable network and raise offline snapshots
        await Xo(t), t._u.set("Offline" /* Offline */), n || (
        // Use a simple read operation to determine if IndexedDB recovered.
        // Ideally, we would expose a health check directly on SimpleDb, but
        // RemoteStore only has access to persistence through LocalStore.
        n = () => no(t.localStore)), 
        // Probe IndexedDB periodically and re-enable network
        t.asyncQueue.enqueueRetryable((async () => {
            O("RemoteStore", "Retrying IndexedDB access"), await n(), t.lu.delete(1 /* IndexedDbFailed */), 
            await Yo(t);
        }));
    }

    /**
     * Executes `op`. If `op` fails, takes the network offline until `op`
     * succeeds. Returns after the first attempt.
     */ function lu(t, e) {
        return e().catch((n => hu(t, n, e)));
    }

    async function fu(t) {
        const e = G(t), n = Ru(e);
        let s = e.cu.length > 0 ? e.cu[e.cu.length - 1].batchId : -1;
        for (;du(e); ) try {
            const t = await ro(e.localStore, s);
            if (null === t) {
                0 === e.cu.length && n.ko();
                break;
            }
            s = t.batchId, _u(e, t);
        } catch (t) {
            await hu(e, t);
        }
        wu(e) && mu(e);
    }

    /**
     * Returns true if we can add to the write pipeline (i.e. the network is
     * enabled and the write pipeline is not full).
     */ function du(t) {
        return ru(t) && t.cu.length < 10;
    }

    /**
     * Queues additional writes to be sent to the write stream, sending them
     * immediately if the write stream is established.
     */ function _u(t, e) {
        t.cu.push(e);
        const n = Ru(t);
        n.Co() && n.zo && n.Ho(e.mutations);
    }

    function wu(t) {
        return ru(t) && !Ru(t).Do() && t.cu.length > 0;
    }

    function mu(t) {
        Ru(t).start();
    }

    async function gu(t) {
        Ru(t).Xo();
    }

    async function yu(t) {
        const e = Ru(t);
        // Send the write pipeline now that the stream is established.
            for (const n of t.cu) e.Ho(n.mutations);
    }

    async function pu(t, e, n) {
        const s = t.cu.shift(), i = vi.from(s, e, n);
        await lu(t, (() => t.remoteSyncer.applySuccessfulWrite(i))), 
        // It's possible that with the completion of this mutation another
        // slot has freed up.
        await fu(t);
    }

    async function Iu(t, e) {
        // If the write stream closed after the write handshake completes, a write
        // operation failed and we fail the pending operation.
        e && Ru(t).zo && 
        // This error affects the actual write.
        await async function(t, e) {
            // Only handle permanent errors here. If it's transient, just let the retry
            // logic kick in.
            if (n = e.code, xn(n) && n !== K.ABORTED) {
                // This was a permanent error, the request itself was the problem
                // so it's not going to succeed if we resend it.
                const n = t.cu.shift();
                // In this case it's also unlikely that the server itself is melting
                // down -- this was just a bad request so inhibit backoff on the next
                // restart.
                            Ru(t).No(), await lu(t, (() => t.remoteSyncer.rejectFailedWrite(n.batchId, e))), 
                // It's possible that with the completion of this mutation
                // another slot has freed up.
                await fu(t);
            }
            var n;
        }(t, e), 
        // The write stream might have been started by refilling the write
        // pipeline for failed writes
        wu(t) && mu(t);
    }

    async function Tu(t, e) {
        const n = G(t);
        n.asyncQueue.verifyOperationInProgress(), O("RemoteStore", "RemoteStore received new credentials");
        const s = ru(n);
        // Tear down and re-create our network streams. This will ensure we get a
        // fresh auth token for the new user and re-fill the write pipeline with
        // new mutations from the LocalStore (since mutations are per-user).
            n.lu.add(3 /* CredentialChange */), await Xo(n), s && 
        // Don't set the network status to Unknown if we are offline.
        n._u.set("Unknown" /* Unknown */), await n.remoteSyncer.handleCredentialChange(e), 
        n.lu.delete(3 /* CredentialChange */), await Yo(n);
    }

    /**
     * Toggles the network state when the client gains or loses its primary lease.
     */ async function Eu(t, e) {
        const n = G(t);
        e ? (n.lu.delete(2 /* IsSecondary */), await Yo(n)) : e || (n.lu.add(2 /* IsSecondary */), 
        await Xo(n), n._u.set("Unknown" /* Unknown */));
    }

    /**
     * If not yet initialized, registers the WatchStream and its network state
     * callback with `remoteStoreImpl`. Returns the existing stream if one is
     * already available.
     *
     * PORTING NOTE: On iOS and Android, the WatchStream gets registered on startup.
     * This is not done on Web to allow it to be tree-shaken.
     */ function Au(t) {
        return t.mu || (
        // Create stream (but note that it is not started yet).
        t.mu = function(t, e, n) {
            const s = G(t);
            return s.tu(), new jo(e, s.bo, s.authCredentials, s.appCheckCredentials, s.M, n);
        }
        /**
     * @license
     * Copyright 2018 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t.datastore, t.asyncQueue, {
            zr: uu.bind(null, t),
            Jr: au.bind(null, t),
            Ko: cu.bind(null, t)
        }), t.fu.push((async e => {
            e ? (t.mu.No(), iu(t) ? su(t) : t._u.set("Unknown" /* Unknown */)) : (await t.mu.stop(), 
            ou(t));
        }))), t.mu;
    }

    /**
     * If not yet initialized, registers the WriteStream and its network state
     * callback with `remoteStoreImpl`. Returns the existing stream if one is
     * already available.
     *
     * PORTING NOTE: On iOS and Android, the WriteStream gets registered on startup.
     * This is not done on Web to allow it to be tree-shaken.
     */ function Ru(t) {
        return t.gu || (
        // Create stream (but note that it is not started yet).
        t.gu = function(t, e, n) {
            const s = G(t);
            return s.tu(), new Wo(e, s.bo, s.authCredentials, s.appCheckCredentials, s.M, n);
        }(t.datastore, t.asyncQueue, {
            zr: gu.bind(null, t),
            Jr: Iu.bind(null, t),
            Yo: yu.bind(null, t),
            Jo: pu.bind(null, t)
        }), t.fu.push((async e => {
            e ? (t.gu.No(), 
            // This will start the write stream if necessary.
            await fu(t)) : (await t.gu.stop(), t.cu.length > 0 && (O("RemoteStore", `Stopping write stream with ${t.cu.length} pending writes`), 
            t.cu = []));
        }))), t.gu;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Represents an operation scheduled to be run in the future on an AsyncQueue.
     *
     * It is created via DelayedOperation.createAndSchedule().
     *
     * Supports cancellation (via cancel()) and early execution (via skipDelay()).
     *
     * Note: We implement `PromiseLike` instead of `Promise`, as the `Promise` type
     * in newer versions of TypeScript defines `finally`, which is not available in
     * IE.
     */
    class bu {
        constructor(t, e, n, s, i) {
            this.asyncQueue = t, this.timerId = e, this.targetTimeMs = n, this.op = s, this.removalCallback = i, 
            this.deferred = new j, this.then = this.deferred.promise.then.bind(this.deferred.promise), 
            // It's normal for the deferred promise to be canceled (due to cancellation)
            // and so we attach a dummy catch callback to avoid
            // 'UnhandledPromiseRejectionWarning' log spam.
            this.deferred.promise.catch((t => {}));
        }
        /**
         * Creates and returns a DelayedOperation that has been scheduled to be
         * executed on the provided asyncQueue after the provided delayMs.
         *
         * @param asyncQueue - The queue to schedule the operation on.
         * @param id - A Timer ID identifying the type of operation this is.
         * @param delayMs - The delay (ms) before the operation should be scheduled.
         * @param op - The operation to run.
         * @param removalCallback - A callback to be called synchronously once the
         *   operation is executed or canceled, notifying the AsyncQueue to remove it
         *   from its delayedOperations list.
         *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
         *   the DelayedOperation class public.
         */    static createAndSchedule(t, e, n, s, i) {
            const r = Date.now() + n, o = new bu(t, e, r, s, i);
            return o.start(n), o;
        }
        /**
         * Starts the timer. This is called immediately after construction by
         * createAndSchedule().
         */    start(t) {
            this.timerHandle = setTimeout((() => this.handleDelayElapsed()), t);
        }
        /**
         * Queues the operation to run immediately (if it hasn't already been run or
         * canceled).
         */    skipDelay() {
            return this.handleDelayElapsed();
        }
        /**
         * Cancels the operation if it hasn't already been executed or canceled. The
         * promise will be rejected.
         *
         * As long as the operation has not yet been run, calling cancel() provides a
         * guarantee that the operation will not be run.
         */    cancel(t) {
            null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new Q(K.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
        }
        handleDelayElapsed() {
            this.asyncQueue.enqueueAndForget((() => null !== this.timerHandle ? (this.clearTimeout(), 
            this.op().then((t => this.deferred.resolve(t)))) : Promise.resolve()));
        }
        clearTimeout() {
            null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), 
            this.timerHandle = null);
        }
    }

    /**
     * Returns a FirestoreError that can be surfaced to the user if the provided
     * error is an IndexedDbTransactionError. Re-throws the error otherwise.
     */ function Pu(t, e) {
        if (F("AsyncQueue", `${e}: ${t}`), Ii(t)) return new Q(K.UNAVAILABLE, `${e}: ${t}`);
        throw t;
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentSet is an immutable (copy-on-write) collection that holds documents
     * in order specified by the provided comparator. We always add a document key
     * comparator on top of what is provided to guarantee document equality based on
     * the key.
     */ class Vu {
        /** The default ordering is by key if the comparator is omitted */
        constructor(t) {
            // We are adding document key comparator to the end as it's the only
            // guaranteed unique property of a document.
            this.comparator = t ? (e, n) => t(e, n) || xt.comparator(e.key, n.key) : (t, e) => xt.comparator(t.key, e.key), 
            this.keyedMap = Kn(), this.sortedSet = new Mn(this.comparator);
        }
        /**
         * Returns an empty copy of the existing DocumentSet, using the same
         * comparator.
         */    static emptySet(t) {
            return new Vu(t.comparator);
        }
        has(t) {
            return null != this.keyedMap.get(t);
        }
        get(t) {
            return this.keyedMap.get(t);
        }
        first() {
            return this.sortedSet.minKey();
        }
        last() {
            return this.sortedSet.maxKey();
        }
        isEmpty() {
            return this.sortedSet.isEmpty();
        }
        /**
         * Returns the index of the provided key in the document set, or -1 if the
         * document key is not present in the set;
         */    indexOf(t) {
            const e = this.keyedMap.get(t);
            return e ? this.sortedSet.indexOf(e) : -1;
        }
        get size() {
            return this.sortedSet.size;
        }
        /** Iterates documents in order defined by "comparator" */    forEach(t) {
            this.sortedSet.inorderTraversal(((e, n) => (t(e), !1)));
        }
        /** Inserts or updates a document with the same key */    add(t) {
            // First remove the element if we have it.
            const e = this.delete(t.key);
            return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
        }
        /** Deletes a document with a given key */    delete(t) {
            const e = this.get(t);
            return e ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e)) : this;
        }
        isEqual(t) {
            if (!(t instanceof Vu)) return !1;
            if (this.size !== t.size) return !1;
            const e = this.sortedSet.getIterator(), n = t.sortedSet.getIterator();
            for (;e.hasNext(); ) {
                const t = e.getNext().key, s = n.getNext().key;
                if (!t.isEqual(s)) return !1;
            }
            return !0;
        }
        toString() {
            const t = [];
            return this.forEach((e => {
                t.push(e.toString());
            })), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
        }
        copy(t, e) {
            const n = new Vu;
            return n.comparator = this.comparator, n.keyedMap = t, n.sortedSet = e, n;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * DocumentChangeSet keeps track of a set of changes to docs in a query, merging
     * duplicate events for the same doc.
     */ class vu {
        constructor() {
            this.yu = new Mn(xt.comparator);
        }
        track(t) {
            const e = t.doc.key, n = this.yu.get(e);
            n ? 
            // Merge the new change with the existing change.
            0 /* Added */ !== t.type && 3 /* Metadata */ === n.type ? this.yu = this.yu.insert(e, t) : 3 /* Metadata */ === t.type && 1 /* Removed */ !== n.type ? this.yu = this.yu.insert(e, {
                type: n.type,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 2 /* Modified */ === n.type ? this.yu = this.yu.insert(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 2 /* Modified */ === t.type && 0 /* Added */ === n.type ? this.yu = this.yu.insert(e, {
                type: 0 /* Added */ ,
                doc: t.doc
            }) : 1 /* Removed */ === t.type && 0 /* Added */ === n.type ? this.yu = this.yu.remove(e) : 1 /* Removed */ === t.type && 2 /* Modified */ === n.type ? this.yu = this.yu.insert(e, {
                type: 1 /* Removed */ ,
                doc: n.doc
            }) : 0 /* Added */ === t.type && 1 /* Removed */ === n.type ? this.yu = this.yu.insert(e, {
                type: 2 /* Modified */ ,
                doc: t.doc
            }) : 
            // This includes these cases, which don't make sense:
            // Added->Added
            // Removed->Removed
            // Modified->Added
            // Removed->Modified
            // Metadata->Added
            // Removed->Metadata
            L() : this.yu = this.yu.insert(e, t);
        }
        pu() {
            const t = [];
            return this.yu.inorderTraversal(((e, n) => {
                t.push(n);
            })), t;
        }
    }

    class Su {
        constructor(t, e, n, s, i, r, o, u) {
            this.query = t, this.docs = e, this.oldDocs = n, this.docChanges = s, this.mutatedKeys = i, 
            this.fromCache = r, this.syncStateChanged = o, this.excludesMetadataChanges = u;
        }
        /** Returns a view snapshot as if all documents in the snapshot were added. */    static fromInitialDocuments(t, e, n, s) {
            const i = [];
            return e.forEach((t => {
                i.push({
                    type: 0 /* Added */ ,
                    doc: t
                });
            })), new Su(t, e, Vu.emptySet(e), i, n, s, 
            /* syncStateChanged= */ !0, 
            /* excludesMetadataChanges= */ !1);
        }
        get hasPendingWrites() {
            return !this.mutatedKeys.isEmpty();
        }
        isEqual(t) {
            if (!(this.fromCache === t.fromCache && this.syncStateChanged === t.syncStateChanged && this.mutatedKeys.isEqual(t.mutatedKeys) && qe(this.query, t.query) && this.docs.isEqual(t.docs) && this.oldDocs.isEqual(t.oldDocs))) return !1;
            const e = this.docChanges, n = t.docChanges;
            if (e.length !== n.length) return !1;
            for (let t = 0; t < e.length; t++) if (e[t].type !== n[t].type || !e[t].doc.isEqual(n[t].doc)) return !1;
            return !0;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Holds the listeners and the last received ViewSnapshot for a query being
     * tracked by EventManager.
     */ class Du {
        constructor() {
            this.Iu = void 0, this.listeners = [];
        }
    }

    class Cu {
        constructor() {
            this.queries = new kn((t => Ge(t)), qe), this.onlineState = "Unknown" /* Unknown */ , 
            this.Tu = new Set;
        }
    }

    async function xu(t, e) {
        const n = G(t), s = e.query;
        let i = !1, r = n.queries.get(s);
        if (r || (i = !0, r = new Du), i) try {
            r.Iu = await n.onListen(s);
        } catch (t) {
            const n = Pu(t, `Initialization of query '${Ke(e.query)}' failed`);
            return void e.onError(n);
        }
        if (n.queries.set(s, r), r.listeners.push(e), 
        // Run global snapshot listeners if a consistent snapshot has been emitted.
        e.Eu(n.onlineState), r.Iu) {
            e.Au(r.Iu) && Ou(n);
        }
    }

    async function Nu(t, e) {
        const n = G(t), s = e.query;
        let i = !1;
        const r = n.queries.get(s);
        if (r) {
            const t = r.listeners.indexOf(e);
            t >= 0 && (r.listeners.splice(t, 1), i = 0 === r.listeners.length);
        }
        if (i) return n.queries.delete(s), n.onUnlisten(s);
    }

    function ku(t, e) {
        const n = G(t);
        let s = !1;
        for (const t of e) {
            const e = t.query, i = n.queries.get(e);
            if (i) {
                for (const e of i.listeners) e.Au(t) && (s = !0);
                i.Iu = t;
            }
        }
        s && Ou(n);
    }

    function Mu(t, e, n) {
        const s = G(t), i = s.queries.get(e);
        if (i) for (const t of i.listeners) t.onError(n);
        // Remove all listeners. NOTE: We don't need to call syncEngine.unlisten()
        // after an error.
            s.queries.delete(e);
    }

    // Call all global snapshot listeners that have been set.
    function Ou(t) {
        t.Tu.forEach((t => {
            t.next();
        }));
    }

    /**
     * QueryListener takes a series of internal view snapshots and determines
     * when to raise the event.
     *
     * It uses an Observer to dispatch events.
     */ class Fu {
        constructor(t, e, n) {
            this.query = t, this.Ru = e, 
            /**
             * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
             * observer. This flag is set to true once we've actually raised an event.
             */
            this.bu = !1, this.Pu = null, this.onlineState = "Unknown" /* Unknown */ , this.options = n || {};
        }
        /**
         * Applies the new ViewSnapshot to this listener, raising a user-facing event
         * if applicable (depending on what changed, whether the user has opted into
         * metadata-only changes, etc.). Returns true if a user-facing event was
         * indeed raised.
         */    Au(t) {
            if (!this.options.includeMetadataChanges) {
                // Remove the metadata only changes.
                const e = [];
                for (const n of t.docChanges) 3 /* Metadata */ !== n.type && e.push(n);
                t = new Su(t.query, t.docs, t.oldDocs, e, t.mutatedKeys, t.fromCache, t.syncStateChanged, 
                /* excludesMetadataChanges= */ !0);
            }
            let e = !1;
            return this.bu ? this.Vu(t) && (this.Ru.next(t), e = !0) : this.vu(t, this.onlineState) && (this.Su(t), 
            e = !0), this.Pu = t, e;
        }
        onError(t) {
            this.Ru.error(t);
        }
        /** Returns whether a snapshot was raised. */    Eu(t) {
            this.onlineState = t;
            let e = !1;
            return this.Pu && !this.bu && this.vu(this.Pu, t) && (this.Su(this.Pu), e = !0), 
            e;
        }
        vu(t, e) {
            // Always raise the first event when we're synced
            if (!t.fromCache) return !0;
            // NOTE: We consider OnlineState.Unknown as online (it should become Offline
            // or Online if we wait long enough).
                    const n = "Offline" /* Offline */ !== e;
            // Don't raise the event if we're online, aren't synced yet (checked
            // above) and are waiting for a sync.
                    return (!this.options.Du || !n) && (!t.docs.isEmpty() || "Offline" /* Offline */ === e);
            // Raise data from cache if we have any documents or we are offline
            }
        Vu(t) {
            // We don't need to handle includeDocumentMetadataChanges here because
            // the Metadata only changes have already been stripped out if needed.
            // At this point the only changes we will see are the ones we should
            // propagate.
            if (t.docChanges.length > 0) return !0;
            const e = this.Pu && this.Pu.hasPendingWrites !== t.hasPendingWrites;
            return !(!t.syncStateChanged && !e) && !0 === this.options.includeMetadataChanges;
            // Generally we should have hit one of the cases above, but it's possible
            // to get here if there were only metadata docChanges and they got
            // stripped out.
            }
        Su(t) {
            t = Su.fromInitialDocuments(t.query, t.docs, t.mutatedKeys, t.fromCache), this.bu = !0, 
            this.Ru.next(t);
        }
    }

    /**
     * Returns a `LoadBundleTaskProgress` representing the progress that the loading
     * has succeeded.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class qu {
        constructor(t) {
            this.key = t;
        }
    }

    class Gu {
        constructor(t) {
            this.key = t;
        }
    }

    /**
     * View is responsible for computing the final merged truth of what docs are in
     * a query. It gets notified of local and remote changes to docs, and applies
     * the query filters and limits to determine the most correct possible results.
     */ class Ku {
        constructor(t, 
        /** Documents included in the remote target */
        e) {
            this.query = t, this.Fu = e, this.$u = null, 
            /**
             * A flag whether the view is current with the backend. A view is considered
             * current after it has seen the current flag from the backend and did not
             * lose consistency within the watch stream (e.g. because of an existence
             * filter mismatch).
             */
            this.current = !1, 
            /** Documents in the view but not in the remote target */
            this.Bu = zn(), 
            /** Document Keys that have local changes */
            this.mutatedKeys = zn(), this.Lu = We(t), this.Uu = new Vu(this.Lu);
        }
        /**
         * The set of remote documents that the server has told us belongs to the target associated with
         * this view.
         */    get qu() {
            return this.Fu;
        }
        /**
         * Iterates over a set of doc changes, applies the query limit, and computes
         * what the new results should be, what the changes were, and whether we may
         * need to go back to the local cache for more results. Does not make any
         * changes to the view.
         * @param docChanges - The doc changes to apply to this view.
         * @param previousChanges - If this is being called with a refill, then start
         *        with this set of docs and changes instead of the current view.
         * @returns a new set of docs, changes, and refill flag.
         */    Gu(t, e) {
            const n = e ? e.Ku : new vu, s = e ? e.Uu : this.Uu;
            let i = e ? e.mutatedKeys : this.mutatedKeys, r = s, o = !1;
            // Track the last doc in a (full) limit. This is necessary, because some
            // update (a delete, or an update moving a doc past the old limit) might
            // mean there is some other document in the local cache that either should
            // come (1) between the old last limit doc and the new last document, in the
            // case of updates, or (2) after the new last document, in the case of
            // deletes. So we keep this doc at the old limit to compare the updates to.
            // Note that this should never get used in a refill (when previousChanges is
            // set), because there will only be adds -- no deletes or updates.
            const u = ke(this.query) && s.size === this.query.limit ? s.last() : null, a = Me(this.query) && s.size === this.query.limit ? s.first() : null;
            // Drop documents out to meet limit/limitToLast requirement.
            if (t.inorderTraversal(((t, e) => {
                const c = s.get(t), h = Qe(this.query, e) ? e : null, l = !!c && this.mutatedKeys.has(c.key), f = !!h && (h.hasLocalMutations || 
                // We only consider committed mutations for documents that were
                // mutated during the lifetime of the view.
                this.mutatedKeys.has(h.key) && h.hasCommittedMutations);
                let d = !1;
                // Calculate change
                            if (c && h) {
                    c.data.isEqual(h.data) ? l !== f && (n.track({
                        type: 3 /* Metadata */ ,
                        doc: h
                    }), d = !0) : this.Qu(c, h) || (n.track({
                        type: 2 /* Modified */ ,
                        doc: h
                    }), d = !0, (u && this.Lu(h, u) > 0 || a && this.Lu(h, a) < 0) && (
                    // This doc moved from inside the limit to outside the limit.
                    // That means there may be some other doc in the local cache
                    // that should be included instead.
                    o = !0));
                } else !c && h ? (n.track({
                    type: 0 /* Added */ ,
                    doc: h
                }), d = !0) : c && !h && (n.track({
                    type: 1 /* Removed */ ,
                    doc: c
                }), d = !0, (u || a) && (
                // A doc was removed from a full limit query. We'll need to
                // requery from the local cache to see if we know about some other
                // doc that should be in the results.
                o = !0));
                d && (h ? (r = r.add(h), i = f ? i.add(t) : i.delete(t)) : (r = r.delete(t), i = i.delete(t)));
            })), ke(this.query) || Me(this.query)) for (;r.size > this.query.limit; ) {
                const t = ke(this.query) ? r.last() : r.first();
                r = r.delete(t.key), i = i.delete(t.key), n.track({
                    type: 1 /* Removed */ ,
                    doc: t
                });
            }
            return {
                Uu: r,
                Ku: n,
                ei: o,
                mutatedKeys: i
            };
        }
        Qu(t, e) {
            // We suppress the initial change event for documents that were modified as
            // part of a write acknowledgment (e.g. when the value of a server transform
            // is applied) as Watch will send us the same document again.
            // By suppressing the event, we only raise two user visible events (one with
            // `hasPendingWrites` and the final state of the document) instead of three
            // (one with `hasPendingWrites`, the modified document with
            // `hasPendingWrites` and the final state of the document).
            return t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
        }
        /**
         * Updates the view with the given ViewDocumentChanges and optionally updates
         * limbo docs and sync state from the provided target change.
         * @param docChanges - The set of changes to make to the view's docs.
         * @param updateLimboDocuments - Whether to update limbo documents based on
         *        this change.
         * @param targetChange - A target change to apply for computing limbo docs and
         *        sync state.
         * @returns A new ViewChange with the given docs, changes, and sync state.
         */
        // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
        applyChanges(t, e, n) {
            const s = this.Uu;
            this.Uu = t.Uu, this.mutatedKeys = t.mutatedKeys;
            // Sort changes based on type and query comparator
            const i = t.Ku.pu();
            i.sort(((t, e) => function(t, e) {
                const n = t => {
                    switch (t) {
                      case 0 /* Added */ :
                        return 1;

                      case 2 /* Modified */ :
                      case 3 /* Metadata */ :
                        // A metadata change is converted to a modified change at the public
                        // api layer.  Since we sort by document key and then change type,
                        // metadata and modified changes must be sorted equivalently.
                        return 2;

                      case 1 /* Removed */ :
                        return 0;

                      default:
                        return L();
                    }
                };
                return n(t) - n(e);
            }
            /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t.type, e.type) || this.Lu(t.doc, e.doc))), this.ju(n);
            const r = e ? this.Wu() : [], o = 0 === this.Bu.size && this.current ? 1 /* Synced */ : 0 /* Local */ , u = o !== this.$u;
            if (this.$u = o, 0 !== i.length || u) {
                return {
                    snapshot: new Su(this.query, t.Uu, s, i, t.mutatedKeys, 0 /* Local */ === o, u, 
                    /* excludesMetadataChanges= */ !1),
                    zu: r
                };
            }
            // no changes
            return {
                zu: r
            };
        }
        /**
         * Applies an OnlineState change to the view, potentially generating a
         * ViewChange if the view's syncState changes as a result.
         */    Eu(t) {
            return this.current && "Offline" /* Offline */ === t ? (
            // If we're offline, set `current` to false and then call applyChanges()
            // to refresh our syncState and generate a ViewChange as appropriate. We
            // are guaranteed to get a new TargetChange that sets `current` back to
            // true once the client is back online.
            this.current = !1, this.applyChanges({
                Uu: this.Uu,
                Ku: new vu,
                mutatedKeys: this.mutatedKeys,
                ei: !1
            }, 
            /* updateLimboDocuments= */ !1)) : {
                zu: []
            };
        }
        /**
         * Returns whether the doc for the given key should be in limbo.
         */    Hu(t) {
            // If the remote end says it's part of this query, it's not in limbo.
            return !this.Fu.has(t) && (
            // The local store doesn't think it's a result, so it shouldn't be in limbo.
            !!this.Uu.has(t) && !this.Uu.get(t).hasLocalMutations);
        }
        /**
         * Updates syncedDocuments, current, and limbo docs based on the given change.
         * Returns the list of changes to which docs are in limbo.
         */    ju(t) {
            t && (t.addedDocuments.forEach((t => this.Fu = this.Fu.add(t))), t.modifiedDocuments.forEach((t => {})), 
            t.removedDocuments.forEach((t => this.Fu = this.Fu.delete(t))), this.current = t.current);
        }
        Wu() {
            // We can only determine limbo documents when we're in-sync with the server.
            if (!this.current) return [];
            // TODO(klimt): Do this incrementally so that it's not quadratic when
            // updating many documents.
                    const t = this.Bu;
            this.Bu = zn(), this.Uu.forEach((t => {
                this.Hu(t.key) && (this.Bu = this.Bu.add(t.key));
            }));
            // Diff the new limbo docs with the old limbo docs.
            const e = [];
            return t.forEach((t => {
                this.Bu.has(t) || e.push(new Gu(t));
            })), this.Bu.forEach((n => {
                t.has(n) || e.push(new qu(n));
            })), e;
        }
        /**
         * Update the in-memory state of the current view with the state read from
         * persistence.
         *
         * We update the query view whenever a client's primary status changes:
         * - When a client transitions from primary to secondary, it can miss
         *   LocalStorage updates and its query views may temporarily not be
         *   synchronized with the state on disk.
         * - For secondary to primary transitions, the client needs to update the list
         *   of `syncedDocuments` since secondary clients update their query views
         *   based purely on synthesized RemoteEvents.
         *
         * @param queryResult.documents - The documents that match the query according
         * to the LocalStore.
         * @param queryResult.remoteKeys - The keys of the documents that match the
         * query according to the backend.
         *
         * @returns The ViewChange that resulted from this synchronization.
         */
        // PORTING NOTE: Multi-tab only.
        Ju(t) {
            this.Fu = t.hi, this.Bu = zn();
            const e = this.Gu(t.documents);
            return this.applyChanges(e, /*updateLimboDocuments=*/ !0);
        }
        /**
         * Returns a view snapshot as if this query was just listened to. Contains
         * a document add for every existing document and the `fromCache` and
         * `hasPendingWrites` status of the already established view.
         */
        // PORTING NOTE: Multi-tab only.
        Yu() {
            return Su.fromInitialDocuments(this.query, this.Uu, this.mutatedKeys, 0 /* Local */ === this.$u);
        }
    }

    /**
     * QueryView contains all of the data that SyncEngine needs to keep track of for
     * a particular query.
     */
    class Qu {
        constructor(
        /**
         * The query itself.
         */
        t, 
        /**
         * The target number created by the client that is used in the watch
         * stream to identify this query.
         */
        e, 
        /**
         * The view is responsible for computing the final merged truth of what
         * docs are in the query. It gets notified of local and remote changes,
         * and applies the query filters and limits to determine the most correct
         * possible results.
         */
        n) {
            this.query = t, this.targetId = e, this.view = n;
        }
    }

    /** Tracks a limbo resolution. */ class ju {
        constructor(t) {
            this.key = t, 
            /**
             * Set to true once we've received a document. This is used in
             * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
             * decide whether it needs to manufacture a delete event for the target once
             * the target is CURRENT.
             */
            this.Xu = !1;
        }
    }

    /**
     * An implementation of `SyncEngine` coordinating with other parts of SDK.
     *
     * The parts of SyncEngine that act as a callback to RemoteStore need to be
     * registered individually. This is done in `syncEngineWrite()` and
     * `syncEngineListen()` (as well as `applyPrimaryState()`) as these methods
     * serve as entry points to RemoteStore's functionality.
     *
     * Note: some field defined in this class might have public access level, but
     * the class is not exported so they are only accessible from this module.
     * This is useful to implement optional features (like bundles) in free
     * functions, such that they are tree-shakeable.
     */ class Wu {
        constructor(t, e, n, 
        // PORTING NOTE: Manages state synchronization in multi-tab environments.
        s, i, r) {
            this.localStore = t, this.remoteStore = e, this.eventManager = n, this.sharedClientState = s, 
            this.currentUser = i, this.maxConcurrentLimboResolutions = r, this.Zu = {}, this.ta = new kn((t => Ge(t)), qe), 
            this.ea = new Map, 
            /**
             * The keys of documents that are in limbo for which we haven't yet started a
             * limbo resolution query. The strings in this set are the result of calling
             * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
             *
             * The `Set` type was chosen because it provides efficient lookup and removal
             * of arbitrary elements and it also maintains insertion order, providing the
             * desired queue-like FIFO semantics.
             */
            this.na = new Set, 
            /**
             * Keeps track of the target ID for each document that is in limbo with an
             * active target.
             */
            this.sa = new Mn(xt.comparator), 
            /**
             * Keeps track of the information about an active limbo resolution for each
             * active target ID that was started for the purpose of limbo resolution.
             */
            this.ia = new Map, this.ra = new go, 
            /** Stores user completion handlers, indexed by User and BatchId. */
            this.oa = {}, 
            /** Stores user callbacks waiting for all pending writes to be acknowledged. */
            this.ua = new Map, this.aa = Er.gn(), this.onlineState = "Unknown" /* Unknown */ , 
            // The primary state is set to `true` or `false` immediately after Firestore
            // startup. In the interim, a client should only be considered primary if
            // `isPrimary` is true.
            this.ca = void 0;
        }
        get isPrimaryClient() {
            return !0 === this.ca;
        }
    }

    /**
     * Initiates the new listen, resolves promise when listen enqueued to the
     * server. All the subsequent view snapshots or errors are sent to the
     * subscribed handlers. Returns the initial snapshot.
     */
    async function zu(t, e) {
        const n = Aa(t);
        let s, i;
        const r = n.ta.get(e);
        if (r) 
        // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
        // already exists when EventManager calls us for the first time. This
        // happens when the primary tab is already listening to this query on
        // behalf of another tab and the user of the primary also starts listening
        // to the query. EventManager will not have an assigned target ID in this
        // case and calls `listen` to obtain this ID.
        s = r.targetId, n.sharedClientState.addLocalQueryTarget(s), i = r.view.Yu(); else {
            const t = await oo(n.localStore, Le(e));
            n.isPrimaryClient && Zo(n.remoteStore, t);
            const r = n.sharedClientState.addLocalQueryTarget(t.targetId);
            s = t.targetId, i = await Hu(n, e, s, "current" === r);
        }
        return i;
    }

    /**
     * Registers a view for a previously unknown query and computes its initial
     * snapshot.
     */ async function Hu(t, e, n, s) {
        // PORTING NOTE: On Web only, we inject the code that registers new Limbo
        // targets based on view changes. This allows us to only depend on Limbo
        // changes when user code includes queries.
        t.ha = (e, n, s) => async function(t, e, n, s) {
            let i = e.view.Gu(n);
            i.ei && (
            // The query has a limit and some docs were removed, so we need
            // to re-run the query against the local store to make sure we
            // didn't lose any good docs that had been past the limit.
            i = await ao(t.localStore, e.query, 
            /* usePreviousResults= */ !1).then((({documents: t}) => e.view.Gu(t, i))));
            const r = s && s.targetChanges.get(e.targetId), o = e.view.applyChanges(i, 
            /* updateLimboDocuments= */ t.isPrimaryClient, r);
            return aa(t, e.targetId, o.zu), o.snapshot;
        }(t, e, n, s);
        const i = await ao(t.localStore, e, 
        /* usePreviousResults= */ !0), r = new Ku(e, i.hi), o = r.Gu(i.documents), u = Xn.createSynthesizedTargetChangeForCurrentChange(n, s && "Offline" /* Offline */ !== t.onlineState), a = r.applyChanges(o, 
        /* updateLimboDocuments= */ t.isPrimaryClient, u);
        aa(t, n, a.zu);
        const c = new Qu(e, n, r);
        return t.ta.set(e, c), t.ea.has(n) ? t.ea.get(n).push(e) : t.ea.set(n, [ e ]), a.snapshot;
    }

    /** Stops listening to the query. */ async function Ju(t, e) {
        const n = G(t), s = n.ta.get(e), i = n.ea.get(s.targetId);
        if (i.length > 1) return n.ea.set(s.targetId, i.filter((t => !qe(t, e)))), void n.ta.delete(e);
        // No other queries are mapped to the target, clean up the query and the target.
            if (n.isPrimaryClient) {
            // We need to remove the local query target first to allow us to verify
            // whether any other client is still interested in this target.
            n.sharedClientState.removeLocalQueryTarget(s.targetId);
            n.sharedClientState.isActiveQueryTarget(s.targetId) || await uo(n.localStore, s.targetId, 
            /*keepPersistedTargetData=*/ !1).then((() => {
                n.sharedClientState.clearQueryState(s.targetId), tu(n.remoteStore, s.targetId), 
                oa(n, s.targetId);
            })).catch(Vr);
        } else oa(n, s.targetId), await uo(n.localStore, s.targetId, 
        /*keepPersistedTargetData=*/ !0);
    }

    /**
     * Initiates the write of local mutation batch which involves adding the
     * writes to the mutation queue, notifying the remote store about new
     * mutations and raising events for any changes this write caused.
     *
     * The promise returned by this call is resolved when the above steps
     * have completed, *not* when the write was acked by the backend. The
     * userCallback is resolved once the write was acked/rejected by the
     * backend (or failed locally for any other reason).
     */ async function Yu(t, e, n) {
        const s = Ra(t);
        try {
            const t = await function(t, e) {
                const n = G(t), s = at.now(), i = e.reduce(((t, e) => t.add(e.key)), zn());
                let r;
                return n.persistence.runTransaction("Locally write mutations", "readwrite", (t => n.ai.qs(t, i).next((i => {
                    r = i;
                    // For non-idempotent mutations (such as `FieldValue.increment()`),
                    // we record the base state in a separate patch mutation. This is
                    // later used to guarantee consistent values and prevents flicker
                    // even if the backend sends us an update that already includes our
                    // transform.
                    const o = [];
                    for (const t of e) {
                        const e = pn(t, r.get(t.key));
                        null != e && 
                        // NOTE: The base state should only be applied if there's some
                        // existing document to override, so use a Precondition of
                        // exists=true
                        o.push(new An(t.key, e, Zt(e.value.mapValue), _n.exists(!0)));
                    }
                    return n.$s.addMutationBatch(t, s, o, e);
                })))).then((t => (t.applyToLocalDocumentSet(r), {
                    batchId: t.batchId,
                    changes: r
                })));
            }(s.localStore, e);
            s.sharedClientState.addPendingMutation(t.batchId), function(t, e, n) {
                let s = t.oa[t.currentUser.toKey()];
                s || (s = new Mn(rt));
                s = s.insert(e, n), t.oa[t.currentUser.toKey()] = s;
            }
            /**
     * Resolves or rejects the user callback for the given batch and then discards
     * it.
     */ (s, t.batchId, n), await la(s, t.changes), await fu(s.remoteStore);
        } catch (t) {
            // If we can't persist the mutation, we reject the user callback and
            // don't send the mutation. The user can then retry the write.
            const e = Pu(t, "Failed to persist write");
            n.reject(e);
        }
    }

    /**
     * Applies one remote event to the sync engine, notifying any views of the
     * changes, and releasing any pending mutation batches that would become
     * visible because of the snapshot version the remote event contains.
     */ async function Xu(t, e) {
        const n = G(t);
        try {
            const t = await so(n.localStore, e);
            // Update `receivedDocument` as appropriate for any limbo targets.
                    e.targetChanges.forEach(((t, e) => {
                const s = n.ia.get(e);
                s && (
                // Since this is a limbo resolution lookup, it's for a single document
                // and it could be added, modified, or removed, but not a combination.
                U(t.addedDocuments.size + t.modifiedDocuments.size + t.removedDocuments.size <= 1), 
                t.addedDocuments.size > 0 ? s.Xu = !0 : t.modifiedDocuments.size > 0 ? U(s.Xu) : t.removedDocuments.size > 0 && (U(s.Xu), 
                s.Xu = !1));
            })), await la(n, t, e);
        } catch (t) {
            await Vr(t);
        }
    }

    /**
     * Applies an OnlineState change to the sync engine and notifies any views of
     * the change.
     */ function Zu(t, e, n) {
        const s = G(t);
        // If we are the secondary client, we explicitly ignore the remote store's
        // online state (the local client may go offline, even though the primary
        // tab remains online) and only apply the primary tab's online state from
        // SharedClientState.
            if (s.isPrimaryClient && 0 /* RemoteStore */ === n || !s.isPrimaryClient && 1 /* SharedClientState */ === n) {
            const t = [];
            s.ta.forEach(((n, s) => {
                const i = s.view.Eu(e);
                i.snapshot && t.push(i.snapshot);
            })), function(t, e) {
                const n = G(t);
                n.onlineState = e;
                let s = !1;
                n.queries.forEach(((t, n) => {
                    for (const t of n.listeners) 
                    // Run global snapshot listeners if a consistent snapshot has been emitted.
                    t.Eu(e) && (s = !0);
                })), s && Ou(n);
            }(s.eventManager, e), t.length && s.Zu.Ko(t), s.onlineState = e, s.isPrimaryClient && s.sharedClientState.setOnlineState(e);
        }
    }

    /**
     * Rejects the listen for the given targetID. This can be triggered by the
     * backend for any active target.
     *
     * @param syncEngine - The sync engine implementation.
     * @param targetId - The targetID corresponds to one previously initiated by the
     * user as part of TargetData passed to listen() on RemoteStore.
     * @param err - A description of the condition that has forced the rejection.
     * Nearly always this will be an indication that the user is no longer
     * authorized to see the data matching the target.
     */ async function ta(t, e, n) {
        const s = G(t);
        // PORTING NOTE: Multi-tab only.
            s.sharedClientState.updateQueryState(e, "rejected", n);
        const i = s.ia.get(e), r = i && i.key;
        if (r) {
            // TODO(klimt): We really only should do the following on permission
            // denied errors, but we don't have the cause code here.
            // It's a limbo doc. Create a synthetic event saying it was deleted.
            // This is kind of a hack. Ideally, we would have a method in the local
            // store to purge a document. However, it would be tricky to keep all of
            // the local store's invariants with another method.
            let t = new Mn(xt.comparator);
            // TODO(b/217189216): This limbo document should ideally have a read time,
            // so that it is picked up by any read-time based scans. The backend,
            // however, does not send a read time for target removals.
                    t = t.insert(r, te.newNoDocument(r, ct.min()));
            const n = zn().add(r), i = new Yn(ct.min(), 
            /* targetChanges= */ new Map, 
            /* targetMismatches= */ new $n(rt), t, n);
            await Xu(s, i), 
            // Since this query failed, we won't want to manually unlisten to it.
            // We only remove it from bookkeeping after we successfully applied the
            // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
            // this query when the RemoteStore restarts the Watch stream, which should
            // re-trigger the target failure.
            s.sa = s.sa.remove(r), s.ia.delete(e), ha(s);
        } else await uo(s.localStore, e, 
        /* keepPersistedTargetData */ !1).then((() => oa(s, e, n))).catch(Vr);
    }

    async function ea(t, e) {
        const n = G(t), s = e.batch.batchId;
        try {
            const t = await eo(n.localStore, e);
            // The local store may or may not be able to apply the write result and
            // raise events immediately (depending on whether the watcher is caught
            // up), so we raise user callbacks first so that they consistently happen
            // before listen events.
                    ra(n, s, /*error=*/ null), ia(n, s), n.sharedClientState.updateMutationState(s, "acknowledged"), 
            await la(n, t);
        } catch (t) {
            await Vr(t);
        }
    }

    async function na(t, e, n) {
        const s = G(t);
        try {
            const t = await function(t, e) {
                const n = G(t);
                return n.persistence.runTransaction("Reject batch", "readwrite-primary", (t => {
                    let s;
                    return n.$s.lookupMutationBatch(t, e).next((e => (U(null !== e), s = e.keys(), n.$s.removeMutationBatch(t, e)))).next((() => n.$s.performConsistencyCheck(t))).next((() => n.ai.qs(t, s)));
                }));
            }
            /**
     * Returns the largest (latest) batch id in mutation queue that is pending
     * server response.
     *
     * Returns `BATCHID_UNKNOWN` if the queue is empty.
     */ (s.localStore, e);
            // The local store may or may not be able to apply the write result and
            // raise events immediately (depending on whether the watcher is caught up),
            // so we raise user callbacks first so that they consistently happen before
            // listen events.
                    ra(s, e, n), ia(s, e), s.sharedClientState.updateMutationState(e, "rejected", n), 
            await la(s, t);
        } catch (n) {
            await Vr(n);
        }
    }

    /**
     * Triggers the callbacks that are waiting for this batch id to get acknowledged by server,
     * if there are any.
     */ function ia(t, e) {
        (t.ua.get(e) || []).forEach((t => {
            t.resolve();
        })), t.ua.delete(e);
    }

    /** Reject all outstanding callbacks waiting for pending writes to complete. */ function ra(t, e, n) {
        const s = G(t);
        let i = s.oa[s.currentUser.toKey()];
        // NOTE: Mutations restored from persistence won't have callbacks, so it's
        // okay for there to be no callback for this ID.
            if (i) {
            const t = i.get(e);
            t && (n ? t.reject(n) : t.resolve(), i = i.remove(e)), s.oa[s.currentUser.toKey()] = i;
        }
    }

    function oa(t, e, n = null) {
        t.sharedClientState.removeLocalQueryTarget(e);
        for (const s of t.ea.get(e)) t.ta.delete(s), n && t.Zu.la(s, n);
        if (t.ea.delete(e), t.isPrimaryClient) {
            t.ra.Ri(e).forEach((e => {
                t.ra.containsKey(e) || 
                // We removed the last reference for this key
                ua(t, e);
            }));
        }
    }

    function ua(t, e) {
        t.na.delete(e.path.canonicalString());
        // It's possible that the target already got removed because the query failed. In that case,
        // the key won't exist in `limboTargetsByKey`. Only do the cleanup if we still have the target.
        const n = t.sa.get(e);
        null !== n && (tu(t.remoteStore, n), t.sa = t.sa.remove(e), t.ia.delete(n), ha(t));
    }

    function aa(t, e, n) {
        for (const s of n) if (s instanceof qu) t.ra.addReference(s.key, e), ca(t, s); else if (s instanceof Gu) {
            O("SyncEngine", "Document no longer in limbo: " + s.key), t.ra.removeReference(s.key, e);
            t.ra.containsKey(s.key) || 
            // We removed the last reference for this key
            ua(t, s.key);
        } else L();
    }

    function ca(t, e) {
        const n = e.key, s = n.path.canonicalString();
        t.sa.get(n) || t.na.has(s) || (O("SyncEngine", "New document in limbo: " + n), t.na.add(s), 
        ha(t));
    }

    /**
     * Starts listens for documents in limbo that are enqueued for resolution,
     * subject to a maximum number of concurrent resolutions.
     *
     * Without bounding the number of concurrent resolutions, the server can fail
     * with "resource exhausted" errors which can lead to pathological client
     * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683.
     */ function ha(t) {
        for (;t.na.size > 0 && t.sa.size < t.maxConcurrentLimboResolutions; ) {
            const e = t.na.values().next().value;
            t.na.delete(e);
            const n = new xt(_t.fromString(e)), s = t.aa.next();
            t.ia.set(s, new ju(n)), t.sa = t.sa.insert(n, s), Zo(t.remoteStore, new Di(Le(Ne(n.path)), s, 2 /* LimboResolution */ , nt.A));
        }
    }

    async function la(t, e, n) {
        const s = G(t), i = [], r = [], o = [];
        s.ta.isEmpty() || (s.ta.forEach(((t, u) => {
            o.push(s.ha(u, e, n).then((t => {
                if (t) {
                    s.isPrimaryClient && s.sharedClientState.updateQueryState(u.targetId, t.fromCache ? "not-current" : "current"), 
                    i.push(t);
                    const e = Jr.Js(u.targetId, t);
                    r.push(e);
                }
            })));
        })), await Promise.all(o), s.Zu.Ko(i), await async function(t, e) {
            const n = G(t);
            try {
                await n.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (t => wi.forEach(e, (e => wi.forEach(e.zs, (s => n.persistence.referenceDelegate.addReference(t, e.targetId, s))).next((() => wi.forEach(e.Hs, (s => n.persistence.referenceDelegate.removeReference(t, e.targetId, s)))))))));
            } catch (t) {
                if (!Ii(t)) throw t;
                // If `notifyLocalViewChanges` fails, we did not advance the sequence
                // number for the documents that were included in this transaction.
                // This might trigger them to be deleted earlier than they otherwise
                // would have, but it should not invalidate the integrity of the data.
                O("LocalStore", "Failed to update sequence numbers: " + t);
            }
            for (const t of e) {
                const e = t.targetId;
                if (!t.fromCache) {
                    const t = n.si.get(e), s = t.snapshotVersion, i = t.withLastLimboFreeSnapshotVersion(s);
                    // Advance the last limbo free snapshot version
                                    n.si = n.si.insert(e, i);
                }
            }
        }(s.localStore, r));
    }

    async function fa(t, e) {
        const n = G(t);
        if (!n.currentUser.isEqual(e)) {
            O("SyncEngine", "User change. New user:", e.toKey());
            const t = await to(n.localStore, e);
            n.currentUser = e, 
            // Fails tasks waiting for pending writes requested by previous user.
            function(t, e) {
                t.ua.forEach((t => {
                    t.forEach((t => {
                        t.reject(new Q(K.CANCELLED, e));
                    }));
                })), t.ua.clear();
            }(n, "'waitForPendingWrites' promise is rejected due to a user change."), 
            // TODO(b/114226417): Consider calling this only in the primary tab.
            n.sharedClientState.handleUserChange(e, t.removedBatchIds, t.addedBatchIds), await la(n, t.ci);
        }
    }

    function da(t, e) {
        const n = G(t), s = n.ia.get(e);
        if (s && s.Xu) return zn().add(s.key);
        {
            let t = zn();
            const s = n.ea.get(e);
            if (!s) return t;
            for (const e of s) {
                const s = n.ta.get(e);
                t = t.unionWith(s.view.qu);
            }
            return t;
        }
    }

    function Aa(t) {
        const e = G(t);
        return e.remoteStore.remoteSyncer.applyRemoteEvent = Xu.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = da.bind(null, e), 
        e.remoteStore.remoteSyncer.rejectListen = ta.bind(null, e), e.Zu.Ko = ku.bind(null, e.eventManager), 
        e.Zu.la = Mu.bind(null, e.eventManager), e;
    }

    function Ra(t) {
        const e = G(t);
        return e.remoteStore.remoteSyncer.applySuccessfulWrite = ea.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = na.bind(null, e), 
        e;
    }

    class Pa {
        constructor() {
            this.synchronizeTabs = !1;
        }
        async initialize(t) {
            this.M = Go(t.databaseInfo.databaseId), this.sharedClientState = this.da(t), this.persistence = this._a(t), 
            await this.persistence.start(), this.gcScheduler = this.wa(t), this.localStore = this.ma(t);
        }
        wa(t) {
            return null;
        }
        ma(t) {
            return Zr(this.persistence, new Yr, t.initialUser, this.M);
        }
        _a(t) {
            return new Ao(bo.Wi, this.M);
        }
        da(t) {
            return new Mo;
        }
        async terminate() {
            this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), 
            await this.persistence.shutdown();
        }
    }

    /**
     * Initializes and wires the components that are needed to interface with the
     * network.
     */ class Sa {
        async initialize(t, e) {
            this.localStore || (this.localStore = t.localStore, this.sharedClientState = t.sharedClientState, 
            this.datastore = this.createDatastore(e), this.remoteStore = this.createRemoteStore(e), 
            this.eventManager = this.createEventManager(e), this.syncEngine = this.createSyncEngine(e, 
            /* startAsPrimary=*/ !t.synchronizeTabs), this.sharedClientState.onlineStateHandler = t => Zu(this.syncEngine, t, 1 /* SharedClientState */), 
            this.remoteStore.remoteSyncer.handleCredentialChange = fa.bind(null, this.syncEngine), 
            await Eu(this.remoteStore, this.syncEngine.isPrimaryClient));
        }
        createEventManager(t) {
            return new Cu;
        }
        createDatastore(t) {
            const e = Go(t.databaseInfo.databaseId), n = (s = t.databaseInfo, new Lo(s));
            var s;
            /** Return the Platform-specific connectivity monitor. */        return function(t, e, n, s) {
                return new zo(t, e, n, s);
            }(t.authCredentials, t.appCheckCredentials, n, e);
        }
        createRemoteStore(t) {
            return e = this.localStore, n = this.datastore, s = t.asyncQueue, i = t => Zu(this.syncEngine, t, 0 /* RemoteStore */), 
            r = Fo.vt() ? new Fo : new Oo, new Jo(e, n, s, i, r);
            var e, n, s, i, r;
            /** Re-enables the network. Idempotent. */    }
        createSyncEngine(t, e) {
            return function(t, e, n, 
            // PORTING NOTE: Manages state synchronization in multi-tab environments.
            s, i, r, o) {
                const u = new Wu(t, e, n, s, i, r);
                return o && (u.ca = !0), u;
            }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t.initialUser, t.maxConcurrentLimboResolutions, e);
        }
        terminate() {
            return async function(t) {
                const e = G(t);
                O("RemoteStore", "RemoteStore shutting down."), e.lu.add(5 /* Shutdown */), await Xo(e), 
                e.du.shutdown(), 
                // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
                // triggering spurious listener events with cached data, etc.
                e._u.set("Unknown" /* Unknown */);
            }(this.remoteStore);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * On web, a `ReadableStream` is wrapped around by a `ByteStreamReader`.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /*
     * A wrapper implementation of Observer<T> that will dispatch events
     * asynchronously. To allow immediate silencing, a mute call is added which
     * causes events scheduled to no longer be raised.
     */
    class Ca {
        constructor(t) {
            this.observer = t, 
            /**
             * When set to true, will not raise future events. Necessary to deal with
             * async detachment of listener.
             */
            this.muted = !1;
        }
        next(t) {
            this.observer.next && this.ya(this.observer.next, t);
        }
        error(t) {
            this.observer.error ? this.ya(this.observer.error, t) : console.error("Uncaught Error in snapshot listener:", t);
        }
        pa() {
            this.muted = !0;
        }
        ya(t, e) {
            this.muted || setTimeout((() => {
                this.muted || t(e);
            }), 0);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * FirestoreClient is a top-level class that constructs and owns all of the
     * pieces of the client SDK architecture. It is responsible for creating the
     * async queue that is shared by all of the other components in the system.
     */
    class Ma {
        constructor(t, e, 
        /**
         * Asynchronous queue responsible for all of our internal processing. When
         * we get incoming work from the user (via public API) or the network
         * (incoming GRPC messages), we should always schedule onto this queue.
         * This ensures all of our work is properly serialized (e.g. we don't
         * start processing a new operation while the previous one is waiting for
         * an async I/O to complete).
         */
        n, s) {
            this.authCredentials = t, this.appCheckCredentials = e, this.asyncQueue = n, this.databaseInfo = s, 
            this.user = C.UNAUTHENTICATED, this.clientId = it.R(), this.authCredentialListener = () => Promise.resolve(), 
            this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, (async t => {
                O("FirestoreClient", "Received user=", t.uid), await this.authCredentialListener(t), 
                this.user = t;
            })), this.appCheckCredentials.start(n, (t => (O("FirestoreClient", "Received new app check token=", t), 
            this.appCheckCredentialListener(t, this.user))));
        }
        async getConfiguration() {
            return {
                asyncQueue: this.asyncQueue,
                databaseInfo: this.databaseInfo,
                clientId: this.clientId,
                authCredentials: this.authCredentials,
                appCheckCredentials: this.appCheckCredentials,
                initialUser: this.user,
                maxConcurrentLimboResolutions: 100
            };
        }
        setCredentialChangeListener(t) {
            this.authCredentialListener = t;
        }
        setAppCheckTokenChangeListener(t) {
            this.appCheckCredentialListener = t;
        }
        /**
         * Checks that the client has not been terminated. Ensures that other methods on
         * this class cannot be called after the client is terminated.
         */    verifyNotTerminated() {
            if (this.asyncQueue.isShuttingDown) throw new Q(K.FAILED_PRECONDITION, "The client has already been terminated.");
        }
        terminate() {
            this.asyncQueue.enterRestrictedMode();
            const t = new j;
            return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
                try {
                    this.onlineComponents && await this.onlineComponents.terminate(), this.offlineComponents && await this.offlineComponents.terminate(), 
                    // The credentials provider must be terminated after shutting down the
                    // RemoteStore as it will prevent the RemoteStore from retrieving auth
                    // tokens.
                    this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), t.resolve();
                } catch (e) {
                    const n = Pu(e, "Failed to shutdown persistence");
                    t.reject(n);
                }
            })), t.promise;
        }
    }

    async function Oa(t, e) {
        t.asyncQueue.verifyOperationInProgress(), O("FirestoreClient", "Initializing OfflineComponentProvider");
        const n = await t.getConfiguration();
        await e.initialize(n);
        let s = n.initialUser;
        t.setCredentialChangeListener((async t => {
            s.isEqual(t) || (await to(e.localStore, t), s = t);
        })), 
        // When a user calls clearPersistence() in one client, all other clients
        // need to be terminated to allow the delete to succeed.
        e.persistence.setDatabaseDeletedListener((() => t.terminate())), t.offlineComponents = e;
    }

    async function Fa(t, e) {
        t.asyncQueue.verifyOperationInProgress();
        const n = await $a(t);
        O("FirestoreClient", "Initializing OnlineComponentProvider");
        const s = await t.getConfiguration();
        await e.initialize(n, s), 
        // The CredentialChangeListener of the online component provider takes
        // precedence over the offline component provider.
        t.setCredentialChangeListener((t => Tu(e.remoteStore, t))), t.setAppCheckTokenChangeListener(((t, n) => Tu(e.remoteStore, n))), 
        t.onlineComponents = e;
    }

    async function $a(t) {
        return t.offlineComponents || (O("FirestoreClient", "Using default OfflineComponentProvider"), 
        await Oa(t, new Pa)), t.offlineComponents;
    }

    async function Ba(t) {
        return t.onlineComponents || (O("FirestoreClient", "Using default OnlineComponentProvider"), 
        await Fa(t, new Sa)), t.onlineComponents;
    }

    function Ga(t) {
        return Ba(t).then((t => t.syncEngine));
    }

    async function Ka(t) {
        const e = await Ba(t), n = e.eventManager;
        return n.onListen = zu.bind(null, e.syncEngine), n.onUnlisten = Ju.bind(null, e.syncEngine), 
        n;
    }

    const ec = new Map;

    /**
     * An instance map that ensures only one Datastore exists per Firestore
     * instance.
     */
    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function nc(t, e, n) {
        if (!n) throw new Q(K.INVALID_ARGUMENT, `Function ${t}() cannot be called with an empty ${e}.`);
    }

    /**
     * Validates that two boolean options are not set at the same time.
     * @internal
     */ function sc(t, e, n, s) {
        if (!0 === e && !0 === s) throw new Q(K.INVALID_ARGUMENT, `${t} and ${n} cannot be used together.`);
    }

    /**
     * Validates that `path` refers to a document (indicated by the fact it contains
     * an even numbers of segments).
     */ function ic(t) {
        if (!xt.isDocumentKey(t)) throw new Q(K.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
    }

    /**
     * Validates that `path` refers to a collection (indicated by the fact it
     * contains an odd numbers of segments).
     */ function rc(t) {
        if (xt.isDocumentKey(t)) throw new Q(K.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`);
    }

    /**
     * Returns true if it's a non-null object without a custom prototype
     * (i.e. excludes Array, Date, etc.).
     */
    /** Returns a string describing the type / value of the provided input. */
    function oc(t) {
        if (void 0 === t) return "undefined";
        if (null === t) return "null";
        if ("string" == typeof t) return t.length > 20 && (t = `${t.substring(0, 20)}...`), 
        JSON.stringify(t);
        if ("number" == typeof t || "boolean" == typeof t) return "" + t;
        if ("object" == typeof t) {
            if (t instanceof Array) return "an array";
            {
                const e = 
                /** try to get the constructor name for an object. */
                function(t) {
                    if (t.constructor) return t.constructor.name;
                    return null;
                }
                /**
     * Casts `obj` to `T`, optionally unwrapping Compat types to expose the
     * underlying instance. Throws if  `obj` is not an instance of `T`.
     *
     * This cast is used in the Lite and Full SDK to verify instance types for
     * arguments passed to the public API.
     * @internal
     */ (t);
                return e ? `a custom ${e} object` : "an object";
            }
        }
        return "function" == typeof t ? "a function" : L();
    }

    function uc(t, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e) {
        if ("_delegate" in t && (
        // Unwrap Compat types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t = t._delegate), !(t instanceof e)) {
            if (e.name === t.constructor.name) throw new Q(K.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
            {
                const n = oc(t);
                throw new Q(K.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
            }
        }
        return t;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // settings() defaults:
    /**
     * A concrete type describing all the values that can be applied via a
     * user-supplied `FirestoreSettings` object. This is a separate type so that
     * defaults can be supplied and the value can be checked for equality.
     */
    class cc {
        constructor(t) {
            var e;
            if (void 0 === t.host) {
                if (void 0 !== t.ssl) throw new Q(K.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
                this.host = "firestore.googleapis.com", this.ssl = true;
            } else this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
            if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, 
            void 0 === t.cacheSizeBytes) this.cacheSizeBytes = 41943040; else {
                if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576) throw new Q(K.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
                this.cacheSizeBytes = t.cacheSizeBytes;
            }
            this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling, 
            this.useFetchStreams = !!t.useFetchStreams, sc("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling);
        }
        isEqual(t) {
            return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The Cloud Firestore service interface.
     *
     * Do not call this constructor directly. Instead, use {@link getFirestore}.
     */ class hc {
        /** @hideconstructor */
        constructor(t, e, n) {
            this._authCredentials = e, this._appCheckCredentials = n, 
            /**
             * Whether it's a Firestore or Firestore Lite instance.
             */
            this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new cc({}), 
            this._settingsFrozen = !1, t instanceof vt ? this._databaseId = t : (this._app = t, 
            this._databaseId = function(t) {
                if (!Object.prototype.hasOwnProperty.apply(t.options, [ "projectId" ])) throw new Q(K.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
                return new vt(t.options.projectId);
            }
            /**
     * Modify this instance to communicate with the Cloud Firestore emulator.
     *
     * Note: This must be called before this instance has been used to do any
     * operations.
     *
     * @param firestore - The `Firestore` instance to configure to connect to the
     * emulator.
     * @param host - the emulator host (ex: localhost).
     * @param port - the emulator port (ex: 9000).
     * @param options.mockUserToken - the mock auth token to use for unit testing
     * Security Rules.
     */ (t));
        }
        /**
         * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
         * instance.
         */    get app() {
            if (!this._app) throw new Q(K.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
            return this._app;
        }
        get _initialized() {
            return this._settingsFrozen;
        }
        get _terminated() {
            return void 0 !== this._terminateTask;
        }
        _setSettings(t) {
            if (this._settingsFrozen) throw new Q(K.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
            this._settings = new cc(t), void 0 !== t.credentials && (this._authCredentials = function(t) {
                if (!t) return new z;
                switch (t.type) {
                  case "gapi":
                    const e = t.client;
                    // Make sure this really is a Gapi client.
                                    return U(!("object" != typeof e || null === e || !e.auth || !e.auth.getAuthHeaderValueForFirstParty)), 
                    new X(e, t.sessionIndex || "0", t.iamToken || null);

                  case "provider":
                    return t.client;

                  default:
                    throw new Q(K.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
                }
            }(t.credentials));
        }
        _getSettings() {
            return this._settings;
        }
        _freezeSettings() {
            return this._settingsFrozen = !0, this._settings;
        }
        _delete() {
            return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
        }
        /** Returns a JSON-serializable representation of this `Firestore` instance. */    toJSON() {
            return {
                app: this._app,
                databaseId: this._databaseId,
                settings: this._settings
            };
        }
        /**
         * Terminates all components used by this client. Subclasses can override
         * this method to clean up their own dependencies, but must also call this
         * method.
         *
         * Only ever called once.
         */    _terminate() {
            /**
     * Removes all components associated with the provided instance. Must be called
     * when the `Firestore` instance is terminated.
     */
            return function(t) {
                const e = ec.get(t);
                e && (O("ComponentProvider", "Removing Datastore"), ec.delete(t), e.terminate());
            }(this), Promise.resolve();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `DocumentReference` refers to a document location in a Firestore database
     * and can be used to write, read, or listen to the location. The document at
     * the referenced location may or may not exist.
     */ class fc {
        /** @hideconstructor */
        constructor(t, 
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
        e, n) {
            this.converter = e, this._key = n, 
            /** The type of this Firestore reference. */
            this.type = "document", this.firestore = t;
        }
        get _path() {
            return this._key.path;
        }
        /**
         * The document's identifier within its collection.
         */    get id() {
            return this._key.path.lastSegment();
        }
        /**
         * A string representing the path of the referenced document (relative
         * to the root of the database).
         */    get path() {
            return this._key.path.canonicalString();
        }
        /**
         * The collection this `DocumentReference` belongs to.
         */    get parent() {
            return new _c(this.firestore, this.converter, this._key.path.popLast());
        }
        withConverter(t) {
            return new fc(this.firestore, t, this._key);
        }
    }

    /**
     * A `Query` refers to a query which you can read or listen to. You can also
     * construct refined `Query` objects by adding filters and ordering.
     */ class dc {
        // This is the lite version of the Query class in the main SDK.
        /** @hideconstructor protected */
        constructor(t, 
        /**
         * If provided, the `FirestoreDataConverter` associated with this instance.
         */
        e, n) {
            this.converter = e, this._query = n, 
            /** The type of this Firestore reference. */
            this.type = "query", this.firestore = t;
        }
        withConverter(t) {
            return new dc(this.firestore, t, this._query);
        }
    }

    /**
     * A `CollectionReference` object can be used for adding documents, getting
     * document references, and querying for documents (using {@link query}).
     */ class _c extends dc {
        /** @hideconstructor */
        constructor(t, e, n) {
            super(t, e, Ne(n)), this._path = n, 
            /** The type of this Firestore reference. */
            this.type = "collection";
        }
        /** The collection's identifier. */    get id() {
            return this._query.path.lastSegment();
        }
        /**
         * A string representing the path of the referenced collection (relative
         * to the root of the database).
         */    get path() {
            return this._query.path.canonicalString();
        }
        /**
         * A reference to the containing `DocumentReference` if this is a
         * subcollection. If this isn't a subcollection, the reference is null.
         */    get parent() {
            const t = this._path.popLast();
            return t.isEmpty() ? null : new fc(this.firestore, 
            /* converter= */ null, new xt(t));
        }
        withConverter(t) {
            return new _c(this.firestore, t, this._path);
        }
    }

    function wc(t, e, ...n) {
        if (t = getModularInstance(t), nc("collection", "path", e), t instanceof hc) {
            const s = _t.fromString(e, ...n);
            return rc(s), new _c(t, /* converter= */ null, s);
        }
        {
            if (!(t instanceof fc || t instanceof _c)) throw new Q(K.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const s = t._path.child(_t.fromString(e, ...n));
            return rc(s), new _c(t.firestore, 
            /* converter= */ null, s);
        }
    }

    function gc(t, e, ...n) {
        if (t = getModularInstance(t), 
        // We allow omission of 'pathString' but explicitly prohibit passing in both
        // 'undefined' and 'null'.
        1 === arguments.length && (e = it.R()), nc("doc", "path", e), t instanceof hc) {
            const s = _t.fromString(e, ...n);
            return ic(s), new fc(t, 
            /* converter= */ null, new xt(s));
        }
        {
            if (!(t instanceof fc || t instanceof _c)) throw new Q(K.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
            const s = t._path.child(_t.fromString(e, ...n));
            return ic(s), new fc(t.firestore, t instanceof _c ? t.converter : null, new xt(s));
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ class Ic {
        constructor() {
            // The last promise in the queue.
            this.Na = Promise.resolve(), 
            // A list of retryable operations. Retryable operations are run in order and
            // retried with backoff.
            this.ka = [], 
            // Is this AsyncQueue being shut down? Once it is set to true, it will not
            // be changed again.
            this.Ma = !1, 
            // Operations scheduled to be queued in the future. Operations are
            // automatically removed after they are run or canceled.
            this.Oa = [], 
            // visible for testing
            this.Fa = null, 
            // Flag set while there's an outstanding AsyncQueue operation, used for
            // assertion sanity-checks.
            this.$a = !1, 
            // Enabled during shutdown on Safari to prevent future access to IndexedDB.
            this.Ba = !1, 
            // List of TimerIds to fast-forward delays for.
            this.La = [], 
            // Backoff timer used to schedule retries for retryable operations
            this.So = new Ko(this, "async_queue_retry" /* AsyncQueueRetry */), 
            // Visibility handler that triggers an immediate retry of all retryable
            // operations. Meant to speed up recovery when we regain file system access
            // after page comes into foreground.
            this.Ua = () => {
                const t = qo();
                t && O("AsyncQueue", "Visibility state changed to " + t.visibilityState), this.So.Eo();
            };
            const t = qo();
            t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this.Ua);
        }
        get isShuttingDown() {
            return this.Ma;
        }
        /**
         * Adds a new operation to the queue without waiting for it to complete (i.e.
         * we ignore the Promise result).
         */    enqueueAndForget(t) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.enqueue(t);
        }
        enqueueAndForgetEvenWhileRestricted(t) {
            this.qa(), 
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.Ga(t);
        }
        enterRestrictedMode(t) {
            if (!this.Ma) {
                this.Ma = !0, this.Ba = t || !1;
                const e = qo();
                e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.Ua);
            }
        }
        enqueue(t) {
            if (this.qa(), this.Ma) 
            // Return a Promise which never resolves.
            return new Promise((() => {}));
            // Create a deferred Promise that we can return to the callee. This
            // allows us to return a "hanging Promise" only to the callee and still
            // advance the queue even when the operation is not run.
                    const e = new j;
            return this.Ga((() => this.Ma && this.Ba ? Promise.resolve() : (t().then(e.resolve, e.reject), 
            e.promise))).then((() => e.promise));
        }
        enqueueRetryable(t) {
            this.enqueueAndForget((() => (this.ka.push(t), this.Ka())));
        }
        /**
         * Runs the next operation from the retryable queue. If the operation fails,
         * reschedules with backoff.
         */    async Ka() {
            if (0 !== this.ka.length) {
                try {
                    await this.ka[0](), this.ka.shift(), this.So.reset();
                } catch (t) {
                    if (!Ii(t)) throw t;
     // Failure will be handled by AsyncQueue
                                    O("AsyncQueue", "Operation failed with retryable error: " + t);
                }
                this.ka.length > 0 && 
                // If there are additional operations, we re-schedule `retryNextOp()`.
                // This is necessary to run retryable operations that failed during
                // their initial attempt since we don't know whether they are already
                // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
                // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
                // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
                // call scheduled here.
                // Since `backoffAndRun()` cancels an existing backoff and schedules a
                // new backoff on every call, there is only ever a single additional
                // operation in the queue.
                this.So.Io((() => this.Ka()));
            }
        }
        Ga(t) {
            const e = this.Na.then((() => (this.$a = !0, t().catch((t => {
                this.Fa = t, this.$a = !1;
                const e = 
                /**
     * Chrome includes Error.message in Error.stack. Other browsers do not.
     * This returns expected output of message + stack when available.
     * @param error - Error or FirestoreError
     */
                function(t) {
                    let e = t.message || "";
                    t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack);
                    return e;
                }
                /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ (t);
                // Re-throw the error so that this.tail becomes a rejected Promise and
                // all further attempts to chain (via .then) will just short-circuit
                // and return the rejected Promise.
                throw F("INTERNAL UNHANDLED ERROR: ", e), t;
            })).then((t => (this.$a = !1, t))))));
            return this.Na = e, e;
        }
        enqueueAfterDelay(t, e, n) {
            this.qa(), 
            // Fast-forward delays for timerIds that have been overriden.
            this.La.indexOf(t) > -1 && (e = 0);
            const s = bu.createAndSchedule(this, t, e, n, (t => this.Qa(t)));
            return this.Oa.push(s), s;
        }
        qa() {
            this.Fa && L();
        }
        verifyOperationInProgress() {}
        /**
         * Waits until all currently queued tasks are finished executing. Delayed
         * operations are not run.
         */    async ja() {
            // Operations in the queue prior to draining may have enqueued additional
            // operations. Keep draining the queue until the tail is no longer advanced,
            // which indicates that no more new operations were enqueued and that all
            // operations were executed.
            let t;
            do {
                t = this.Na, await t;
            } while (t !== this.Na);
        }
        /**
         * For Tests: Determine if a delayed operation with a particular TimerId
         * exists.
         */    Wa(t) {
            for (const e of this.Oa) if (e.timerId === t) return !0;
            return !1;
        }
        /**
         * For Tests: Runs some or all delayed operations early.
         *
         * @param lastTimerId - Delayed operations up to and including this TimerId
         * will be drained. Pass TimerId.All to run all delayed operations.
         * @returns a Promise that resolves once all operations have been run.
         */    za(t) {
            // Note that draining may generate more delayed ops, so we do that first.
            return this.ja().then((() => {
                // Run ops in the same order they'd run if they ran naturally.
                this.Oa.sort(((t, e) => t.targetTimeMs - e.targetTimeMs));
                for (const e of this.Oa) if (e.skipDelay(), "all" /* All */ !== t && e.timerId === t) break;
                return this.ja();
            }));
        }
        /**
         * For Tests: Skip all subsequent delays for a timer id.
         */    Ha(t) {
            this.La.push(t);
        }
        /** Called once a DelayedOperation is run or canceled. */    Qa(t) {
            // NOTE: indexOf / slice are O(n), but delayedOperations is expected to be small.
            const e = this.Oa.indexOf(t);
            this.Oa.splice(e, 1);
        }
    }

    function Tc(t) {
        /**
     * Returns true if obj is an object and contains at least one of the specified
     * methods.
     */
        return function(t, e) {
            if ("object" != typeof t || null === t) return !1;
            const n = t;
            for (const t of e) if (t in n && "function" == typeof n[t]) return !0;
            return !1;
        }
        /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
        /**
     * Represents the task of loading a Firestore bundle. It provides progress of bundle
     * loading, as well as task completion and error events.
     *
     * The API is compatible with `Promise<LoadBundleTaskProgress>`.
     */ (t, [ "next", "error", "complete" ]);
    }

    /**
     * The Cloud Firestore service interface.
     *
     * Do not call this constructor directly. Instead, use {@link getFirestore}.
     */
    class Rc extends hc {
        /** @hideconstructor */
        constructor(t, e, n) {
            super(t, e, n), 
            /**
             * Whether it's a {@link Firestore} or Firestore Lite instance.
             */
            this.type = "firestore", this._queue = new Ic, this._persistenceKey = "name" in t ? t.name : "[DEFAULT]";
        }
        _terminate() {
            return this._firestoreClient || 
            // The client must be initialized to ensure that all subsequent API
            // usage throws an exception.
            vc(this), this._firestoreClient.terminate();
        }
    }

    /**
     * Returns the existing {@link Firestore} instance that is associated with the
     * provided {@link @firebase/app#FirebaseApp}. If no instance exists, initializes a new
     * instance with default settings.
     *
     * @param app - The {@link @firebase/app#FirebaseApp} instance that the returned {@link Firestore}
     * instance is associated with.
     * @returns The {@link Firestore} instance of the provided app.
     */ function Pc(e = getApp()) {
        return _getProvider(e, "firestore").getImmediate();
    }

    /**
     * @internal
     */ function Vc(t) {
        return t._firestoreClient || vc(t), t._firestoreClient.verifyNotTerminated(), t._firestoreClient;
    }

    function vc(t) {
        var e;
        const n = t._freezeSettings(), s = function(t, e, n, s) {
            return new Vt(t, e, n, s.host, s.ssl, s.experimentalForceLongPolling, s.experimentalAutoDetectLongPolling, s.useFetchStreams);
        }(t._databaseId, (null === (e = t._app) || void 0 === e ? void 0 : e.options.appId) || "", t._persistenceKey, n);
        t._firestoreClient = new Ma(t._authCredentials, t._appCheckCredentials, t._queue, s);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `FieldPath` refers to a field in a document. The path may consist of a
     * single field name (referring to a top-level field in the document), or a
     * list of field names (referring to a nested field in the document).
     *
     * Create a `FieldPath` by providing field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     */
    class Lc {
        /**
         * Creates a `FieldPath` from the provided field names. If more than one field
         * name is provided, the path will point to a nested field in a document.
         *
         * @param fieldNames - A list of field names.
         */
        constructor(...t) {
            for (let e = 0; e < t.length; ++e) if (0 === t[e].length) throw new Q(K.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
            this._internalPath = new mt(t);
        }
        /**
         * Returns true if this `FieldPath` is equal to the provided one.
         *
         * @param other - The `FieldPath` to compare against.
         * @returns true if this `FieldPath` is equal to the provided one.
         */    isEqual(t) {
            return this._internalPath.isEqual(t._internalPath);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable object representing an array of bytes.
     */ class qc {
        /** @hideconstructor */
        constructor(t) {
            this._byteString = t;
        }
        /**
         * Creates a new `Bytes` object from the given Base64 string, converting it to
         * bytes.
         *
         * @param base64 - The Base64 string used to create the `Bytes` object.
         */    static fromBase64String(t) {
            try {
                return new qc(pt.fromBase64String(t));
            } catch (t) {
                throw new Q(K.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
            }
        }
        /**
         * Creates a new `Bytes` object from the given Uint8Array.
         *
         * @param array - The Uint8Array used to create the `Bytes` object.
         */    static fromUint8Array(t) {
            return new qc(pt.fromUint8Array(t));
        }
        /**
         * Returns the underlying bytes as a Base64-encoded string.
         *
         * @returns The Base64-encoded string created from the `Bytes` object.
         */    toBase64() {
            return this._byteString.toBase64();
        }
        /**
         * Returns the underlying bytes in a new `Uint8Array`.
         *
         * @returns The Uint8Array created from the `Bytes` object.
         */    toUint8Array() {
            return this._byteString.toUint8Array();
        }
        /**
         * Returns a string representation of the `Bytes` object.
         *
         * @returns A string representation of the `Bytes` object.
         */    toString() {
            return "Bytes(base64: " + this.toBase64() + ")";
        }
        /**
         * Returns true if this `Bytes` object is equal to the provided one.
         *
         * @param other - The `Bytes` object to compare against.
         * @returns true if this `Bytes` object is equal to the provided one.
         */    isEqual(t) {
            return this._byteString.isEqual(t._byteString);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Sentinel values that can be used when writing document fields with `set()`
     * or `update()`.
     */ class Gc {
        /**
         * @param _methodName - The public API endpoint that returns this class.
         * @hideconstructor
         */
        constructor(t) {
            this._methodName = t;
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * An immutable object representing a geographic location in Firestore. The
     * location is represented as latitude/longitude pair.
     *
     * Latitude values are in the range of [-90, 90].
     * Longitude values are in the range of [-180, 180].
     */ class Kc {
        /**
         * Creates a new immutable `GeoPoint` object with the provided latitude and
         * longitude values.
         * @param latitude - The latitude as number between -90 and 90.
         * @param longitude - The longitude as number between -180 and 180.
         */
        constructor(t, e) {
            if (!isFinite(t) || t < -90 || t > 90) throw new Q(K.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
            if (!isFinite(e) || e < -180 || e > 180) throw new Q(K.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
            this._lat = t, this._long = e;
        }
        /**
         * The latitude of this `GeoPoint` instance.
         */    get latitude() {
            return this._lat;
        }
        /**
         * The longitude of this `GeoPoint` instance.
         */    get longitude() {
            return this._long;
        }
        /**
         * Returns true if this `GeoPoint` is equal to the provided one.
         *
         * @param other - The `GeoPoint` to compare against.
         * @returns true if this `GeoPoint` is equal to the provided one.
         */    isEqual(t) {
            return this._lat === t._lat && this._long === t._long;
        }
        /** Returns a JSON-serializable representation of this GeoPoint. */    toJSON() {
            return {
                latitude: this._lat,
                longitude: this._long
            };
        }
        /**
         * Actually private to JS consumers of our API, so this function is prefixed
         * with an underscore.
         */    _compareTo(t) {
            return rt(this._lat, t._lat) || rt(this._long, t._long);
        }
    }

    /**
     * @license
     * Copyright 2017 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ const Qc = /^__.*__$/;

    /** The result of parsing document data (e.g. for a setData call). */ class jc {
        constructor(t, e, n) {
            this.data = t, this.fieldMask = e, this.fieldTransforms = n;
        }
        toMutation(t, e) {
            return null !== this.fieldMask ? new An(t, this.data, this.fieldMask, e, this.fieldTransforms) : new En(t, this.data, e, this.fieldTransforms);
        }
    }

    /** The result of parsing "update" data (i.e. for an updateData call). */ class Wc {
        constructor(t, 
        // The fieldMask does not include document transforms.
        e, n) {
            this.data = t, this.fieldMask = e, this.fieldTransforms = n;
        }
        toMutation(t, e) {
            return new An(t, this.data, this.fieldMask, e, this.fieldTransforms);
        }
    }

    function zc(t) {
        switch (t) {
          case 0 /* Set */ :
     // fall through
                  case 2 /* MergeSet */ :
     // fall through
                  case 1 /* Update */ :
            return !0;

          case 3 /* Argument */ :
          case 4 /* ArrayArgument */ :
            return !1;

          default:
            throw L();
        }
    }

    /** A "context" object passed around while parsing user data. */ class Hc {
        /**
         * Initializes a ParseContext with the given source and path.
         *
         * @param settings - The settings for the parser.
         * @param databaseId - The database ID of the Firestore instance.
         * @param serializer - The serializer to use to generate the Value proto.
         * @param ignoreUndefinedProperties - Whether to ignore undefined properties
         * rather than throw.
         * @param fieldTransforms - A mutable list of field transforms encountered
         * while parsing the data.
         * @param fieldMask - A mutable list of field paths encountered while parsing
         * the data.
         *
         * TODO(b/34871131): We don't support array paths right now, so path can be
         * null to indicate the context represents any location within an array (in
         * which case certain features will not work and errors will be somewhat
         * compromised).
         */
        constructor(t, e, n, s, i, r) {
            this.settings = t, this.databaseId = e, this.M = n, this.ignoreUndefinedProperties = s, 
            // Minor hack: If fieldTransforms is undefined, we assume this is an
            // external call and we need to validate the entire path.
            void 0 === i && this.Ja(), this.fieldTransforms = i || [], this.fieldMask = r || [];
        }
        get path() {
            return this.settings.path;
        }
        get Ya() {
            return this.settings.Ya;
        }
        /** Returns a new context with the specified settings overwritten. */    Xa(t) {
            return new Hc(Object.assign(Object.assign({}, this.settings), t), this.databaseId, this.M, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
        }
        Za(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Xa({
                path: n,
                tc: !1
            });
            return s.ec(t), s;
        }
        nc(t) {
            var e;
            const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.Xa({
                path: n,
                tc: !1
            });
            return s.Ja(), s;
        }
        sc(t) {
            // TODO(b/34871131): We don't support array paths right now; so make path
            // undefined.
            return this.Xa({
                path: void 0,
                tc: !0
            });
        }
        ic(t) {
            return wh(t, this.settings.methodName, this.settings.rc || !1, this.path, this.settings.oc);
        }
        /** Returns 'true' if 'fieldPath' was traversed when creating this context. */    contains(t) {
            return void 0 !== this.fieldMask.find((e => t.isPrefixOf(e))) || void 0 !== this.fieldTransforms.find((e => t.isPrefixOf(e.field)));
        }
        Ja() {
            // TODO(b/34871131): Remove null check once we have proper paths for fields
            // within arrays.
            if (this.path) for (let t = 0; t < this.path.length; t++) this.ec(this.path.get(t));
        }
        ec(t) {
            if (0 === t.length) throw this.ic("Document fields must not be empty");
            if (zc(this.Ya) && Qc.test(t)) throw this.ic('Document fields cannot begin and end with "__"');
        }
    }

    /**
     * Helper for parsing raw user input (provided via the API) into internal model
     * classes.
     */ class Jc {
        constructor(t, e, n) {
            this.databaseId = t, this.ignoreUndefinedProperties = e, this.M = n || Go(t);
        }
        /** Creates a new top-level parse context. */    uc(t, e, n, s = !1) {
            return new Hc({
                Ya: t,
                methodName: e,
                oc: n,
                path: mt.emptyPath(),
                tc: !1,
                rc: s
            }, this.databaseId, this.M, this.ignoreUndefinedProperties);
        }
    }

    function Yc(t) {
        const e = t._freezeSettings(), n = Go(t._databaseId);
        return new Jc(t._databaseId, !!e.ignoreUndefinedProperties, n);
    }

    /** Parse document data from a set() call. */ function Xc(t, e, n, s, i, r = {}) {
        const o = t.uc(r.merge || r.mergeFields ? 2 /* MergeSet */ : 0 /* Set */ , e, n, i);
        lh("Data must be an object, but it was:", o, s);
        const u = ch(s, o);
        let a, c;
        if (r.merge) a = new gt(o.fieldMask), c = o.fieldTransforms; else if (r.mergeFields) {
            const t = [];
            for (const s of r.mergeFields) {
                const i = fh(e, s, n);
                if (!o.contains(i)) throw new Q(K.INVALID_ARGUMENT, `Field '${i}' is specified in your field mask but missing from your input data.`);
                mh(t, i) || t.push(i);
            }
            a = new gt(t), c = o.fieldTransforms.filter((t => a.covers(t.field)));
        } else a = null, c = o.fieldTransforms;
        return new jc(new Xt(u), a, c);
    }

    class Zc extends Gc {
        _toFieldTransform(t) {
            if (2 /* MergeSet */ !== t.Ya) throw 1 /* Update */ === t.Ya ? t.ic(`${this._methodName}() can only appear at the top level of your update data`) : t.ic(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
            // No transform to add for a delete, but we need to add it to our
            // fieldMask so it gets deleted.
            return t.fieldMask.push(t.path), null;
        }
        isEqual(t) {
            return t instanceof Zc;
        }
    }

    /** Parse update data from an update() call. */ function rh(t, e, n, s) {
        const i = t.uc(1 /* Update */ , e, n);
        lh("Data must be an object, but it was:", i, s);
        const r = [], o = Xt.empty();
        lt(s, ((t, s) => {
            const u = _h(e, t, n);
            // For Compat types, we have to "extract" the underlying types before
            // performing validation.
                    s = getModularInstance(s);
            const a = i.nc(u);
            if (s instanceof Zc) 
            // Add it to the field mask, but don't add anything to updateData.
            r.push(u); else {
                const t = ah(s, a);
                null != t && (r.push(u), o.set(u, t));
            }
        }));
        const u = new gt(r);
        return new Wc(o, u, i.fieldTransforms);
    }

    /** Parse update data from a list of field/value arguments. */ function oh(t, e, n, s, i, r) {
        const o = t.uc(1 /* Update */ , e, n), u = [ fh(e, s, n) ], a = [ i ];
        if (r.length % 2 != 0) throw new Q(K.INVALID_ARGUMENT, `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);
        for (let t = 0; t < r.length; t += 2) u.push(fh(e, r[t])), a.push(r[t + 1]);
        const c = [], h = Xt.empty();
        // We iterate in reverse order to pick the last value for a field if the
        // user specified the field multiple times.
        for (let t = u.length - 1; t >= 0; --t) if (!mh(c, u[t])) {
            const e = u[t];
            let n = a[t];
            // For Compat types, we have to "extract" the underlying types before
            // performing validation.
                    n = getModularInstance(n);
            const s = o.nc(e);
            if (n instanceof Zc) 
            // Add it to the field mask, but don't add anything to updateData.
            c.push(e); else {
                const t = ah(n, s);
                null != t && (c.push(e), h.set(e, t));
            }
        }
        const l = new gt(c);
        return new Wc(h, l, o.fieldTransforms);
    }

    /**
     * Parses user data to Protobuf Values.
     *
     * @param input - Data to be parsed.
     * @param context - A context object representing the current path being parsed,
     * the source of the data being parsed, etc.
     * @returns The parsed value, or null if the value was a FieldValue sentinel
     * that should not be included in the resulting parsed data.
     */ function ah(t, e) {
        if (hh(
        // Unwrap the API type from the Compat SDK. This will return the API type
        // from firestore-exp.
        t = getModularInstance(t))) return lh("Unsupported field value:", e, t), ch(t, e);
        if (t instanceof Gc) 
        // FieldValues usually parse into transforms (except deleteField())
        // in which case we do not want to include this field in our parsed data
        // (as doing so will overwrite the field directly prior to the transform
        // trying to transform it). So we don't add this location to
        // context.fieldMask and we return null as our parsing result.
        /**
     * "Parses" the provided FieldValueImpl, adding any necessary transforms to
     * context.fieldTransforms.
     */
        return function(t, e) {
            // Sentinels are only supported with writes, and not within arrays.
            if (!zc(e.Ya)) throw e.ic(`${t._methodName}() can only be used with update() and set()`);
            if (!e.path) throw e.ic(`${t._methodName}() is not currently supported inside arrays`);
            const n = t._toFieldTransform(e);
            n && e.fieldTransforms.push(n);
        }
        /**
     * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
     *
     * @returns The parsed value
     */ (t, e), null;
        if (void 0 === t && e.ignoreUndefinedProperties) 
        // If the input is undefined it can never participate in the fieldMask, so
        // don't handle this below. If `ignoreUndefinedProperties` is false,
        // `parseScalarValue` will reject an undefined value.
        return null;
        if (
        // If context.path is null we are inside an array and we don't support
        // field mask paths more granular than the top-level array.
        e.path && e.fieldMask.push(e.path), t instanceof Array) {
            // TODO(b/34871131): Include the path containing the array in the error
            // message.
            // In the case of IN queries, the parsed data is an array (representing
            // the set of values to be included for the IN query) that may directly
            // contain additional arrays (each representing an individual field
            // value), so we disable this validation.
            if (e.settings.tc && 4 /* ArrayArgument */ !== e.Ya) throw e.ic("Nested arrays are not supported");
            return function(t, e) {
                const n = [];
                let s = 0;
                for (const i of t) {
                    let t = ah(i, e.sc(s));
                    null == t && (
                    // Just include nulls in the array for fields being replaced with a
                    // sentinel.
                    t = {
                        nullValue: "NULL_VALUE"
                    }), n.push(t), s++;
                }
                return {
                    arrayValue: {
                        values: n
                    }
                };
            }(t, e);
        }
        return function(t, e) {
            if (null === (t = getModularInstance(t))) return {
                nullValue: "NULL_VALUE"
            };
            if ("number" == typeof t) return Ye(e.M, t);
            if ("boolean" == typeof t) return {
                booleanValue: t
            };
            if ("string" == typeof t) return {
                stringValue: t
            };
            if (t instanceof Date) {
                const n = at.fromDate(t);
                return {
                    timestampValue: cs(e.M, n)
                };
            }
            if (t instanceof at) {
                // Firestore backend truncates precision down to microseconds. To ensure
                // offline mode works the same with regards to truncation, perform the
                // truncation immediately without waiting for the backend to do that.
                const n = new at(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
                return {
                    timestampValue: cs(e.M, n)
                };
            }
            if (t instanceof Kc) return {
                geoPointValue: {
                    latitude: t.latitude,
                    longitude: t.longitude
                }
            };
            if (t instanceof qc) return {
                bytesValue: hs(e.M, t._byteString)
            };
            if (t instanceof fc) {
                const n = e.databaseId, s = t.firestore._databaseId;
                if (!s.isEqual(n)) throw e.ic(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${n.projectId}/${n.database}`);
                return {
                    referenceValue: ds(t.firestore._databaseId || e.databaseId, t._key.path)
                };
            }
            throw e.ic(`Unsupported field value: ${oc(t)}`);
        }
        /**
     * Checks whether an object looks like a JSON object that should be converted
     * into a struct. Normal class/prototype instances are considered to look like
     * JSON objects since they should be converted to a struct value. Arrays, Dates,
     * GeoPoints, etc. are not considered to look like JSON objects since they map
     * to specific FieldValue types other than ObjectValue.
     */ (t, e);
    }

    function ch(t, e) {
        const n = {};
        return ft(t) ? 
        // If we encounter an empty object, we explicitly add it to the update
        // mask to ensure that the server creates a map entry.
        e.path && e.path.length > 0 && e.fieldMask.push(e.path) : lt(t, ((t, s) => {
            const i = ah(s, e.Za(t));
            null != i && (n[t] = i);
        })), {
            mapValue: {
                fields: n
            }
        };
    }

    function hh(t) {
        return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof at || t instanceof Kc || t instanceof qc || t instanceof fc || t instanceof Gc);
    }

    function lh(t, e, n) {
        if (!hh(n) || !function(t) {
            return "object" == typeof t && null !== t && (Object.getPrototypeOf(t) === Object.prototype || null === Object.getPrototypeOf(t));
        }(n)) {
            const s = oc(n);
            throw "an object" === s ? e.ic(t + " a custom object") : e.ic(t + " " + s);
        }
    }

    /**
     * Helper that calls fromDotSeparatedString() but wraps any error thrown.
     */ function fh(t, e, n) {
        if ((
        // If required, replace the FieldPath Compat class with with the firestore-exp
        // FieldPath.
        e = getModularInstance(e)) instanceof Lc) return e._internalPath;
        if ("string" == typeof e) return _h(t, e);
        throw wh("Field path arguments must be of type string or ", t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
    }

    /**
     * Matches any characters in a field path string that are reserved.
     */ const dh = new RegExp("[~\\*/\\[\\]]");

    /**
     * Wraps fromDotSeparatedString with an error message about the method that
     * was thrown.
     * @param methodName - The publicly visible method name
     * @param path - The dot-separated string form of a field path which will be
     * split on dots.
     * @param targetDoc - The document against which the field path will be
     * evaluated.
     */ function _h(t, e, n) {
        if (e.search(dh) >= 0) throw wh(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`, t, 
        /* hasConverter= */ !1, 
        /* path= */ void 0, n);
        try {
            return new Lc(...e.split("."))._internalPath;
        } catch (s) {
            throw wh(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, t, 
            /* hasConverter= */ !1, 
            /* path= */ void 0, n);
        }
    }

    function wh(t, e, n, s, i) {
        const r = s && !s.isEmpty(), o = void 0 !== i;
        let u = `Function ${e}() called with invalid data`;
        n && (u += " (via `toFirestore()`)"), u += ". ";
        let a = "";
        return (r || o) && (a += " (found", r && (a += ` in field ${s}`), o && (a += ` in document ${i}`), 
        a += ")"), new Q(K.INVALID_ARGUMENT, u + t + a);
    }

    /** Checks `haystack` if FieldPath `needle` is present. Runs in O(n). */ function mh(t, e) {
        return t.some((t => t.isEqual(e)));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A `DocumentSnapshot` contains data read from a document in your Firestore
     * database. The data can be extracted with `.data()` or `.get(<field>)` to
     * get a specific field.
     *
     * For a `DocumentSnapshot` that points to a non-existing document, any data
     * access will return 'undefined'. You can use the `exists()` method to
     * explicitly verify a document's existence.
     */ class gh {
        // Note: This class is stripped down version of the DocumentSnapshot in
        // the legacy SDK. The changes are:
        // - No support for SnapshotMetadata.
        // - No support for SnapshotOptions.
        /** @hideconstructor protected */
        constructor(t, e, n, s, i) {
            this._firestore = t, this._userDataWriter = e, this._key = n, this._document = s, 
            this._converter = i;
        }
        /** Property of the `DocumentSnapshot` that provides the document's ID. */    get id() {
            return this._key.path.lastSegment();
        }
        /**
         * The `DocumentReference` for the document included in the `DocumentSnapshot`.
         */    get ref() {
            return new fc(this._firestore, this._converter, this._key);
        }
        /**
         * Signals whether or not the document at the snapshot's location exists.
         *
         * @returns true if the document exists.
         */    exists() {
            return null !== this._document;
        }
        /**
         * Retrieves all fields in the document as an `Object`. Returns `undefined` if
         * the document doesn't exist.
         *
         * @returns An `Object` containing all fields in the document or `undefined`
         * if the document doesn't exist.
         */    data() {
            if (this._document) {
                if (this._converter) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const t = new yh(this._firestore, this._userDataWriter, this._key, this._document, 
                    /* converter= */ null);
                    return this._converter.fromFirestore(t);
                }
                return this._userDataWriter.convertValue(this._document.data.value);
            }
        }
        /**
         * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
         * document or field doesn't exist.
         *
         * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
         * field.
         * @returns The data at the specified field location or undefined if no such
         * field exists in the document.
         */
        // We are using `any` here to avoid an explicit cast by our users.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(t) {
            if (this._document) {
                const e = this._document.data.field(ph("DocumentSnapshot.get", t));
                if (null !== e) return this._userDataWriter.convertValue(e);
            }
        }
    }

    /**
     * A `QueryDocumentSnapshot` contains data read from a document in your
     * Firestore database as part of a query. The document is guaranteed to exist
     * and its data can be extracted with `.data()` or `.get(<field>)` to get a
     * specific field.
     *
     * A `QueryDocumentSnapshot` offers the same API surface as a
     * `DocumentSnapshot`. Since query results contain only existing documents, the
     * `exists` property will always be true and `data()` will never return
     * 'undefined'.
     */ class yh extends gh {
        /**
         * Retrieves all fields in the document as an `Object`.
         *
         * @override
         * @returns An `Object` containing all fields in the document.
         */
        data() {
            return super.data();
        }
    }

    /**
     * Helper that calls `fromDotSeparatedString()` but wraps any error thrown.
     */ function ph(t, e) {
        return "string" == typeof e ? _h(t, e) : e instanceof Lc ? e._internalPath : e._delegate._internalPath;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Metadata about a snapshot, describing the state of the snapshot.
     */ class Ih {
        /** @hideconstructor */
        constructor(t, e) {
            this.hasPendingWrites = t, this.fromCache = e;
        }
        /**
         * Returns true if this `SnapshotMetadata` is equal to the provided one.
         *
         * @param other - The `SnapshotMetadata` to compare against.
         * @returns true if this `SnapshotMetadata` is equal to the provided one.
         */    isEqual(t) {
            return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
        }
    }

    /**
     * A `DocumentSnapshot` contains data read from a document in your Firestore
     * database. The data can be extracted with `.data()` or `.get(<field>)` to
     * get a specific field.
     *
     * For a `DocumentSnapshot` that points to a non-existing document, any data
     * access will return 'undefined'. You can use the `exists()` method to
     * explicitly verify a document's existence.
     */ class Th extends gh {
        /** @hideconstructor protected */
        constructor(t, e, n, s, i, r) {
            super(t, e, n, s, r), this._firestore = t, this._firestoreImpl = t, this.metadata = i;
        }
        /**
         * Returns whether or not the data exists. True if the document exists.
         */    exists() {
            return super.exists();
        }
        /**
         * Retrieves all fields in the document as an `Object`. Returns `undefined` if
         * the document doesn't exist.
         *
         * By default, `serverTimestamp()` values that have not yet been
         * set to their final value will be returned as `null`. You can override
         * this by passing an options object.
         *
         * @param options - An options object to configure how data is retrieved from
         * the snapshot (for example the desired behavior for server timestamps that
         * have not yet been set to their final value).
         * @returns An `Object` containing all fields in the document or `undefined` if
         * the document doesn't exist.
         */    data(t = {}) {
            if (this._document) {
                if (this._converter) {
                    // We only want to use the converter and create a new DocumentSnapshot
                    // if a converter has been provided.
                    const e = new Eh(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, 
                    /* converter= */ null);
                    return this._converter.fromFirestore(e, t);
                }
                return this._userDataWriter.convertValue(this._document.data.value, t.serverTimestamps);
            }
        }
        /**
         * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
         * document or field doesn't exist.
         *
         * By default, a `serverTimestamp()` that has not yet been set to
         * its final value will be returned as `null`. You can override this by
         * passing an options object.
         *
         * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
         * field.
         * @param options - An options object to configure how the field is retrieved
         * from the snapshot (for example the desired behavior for server timestamps
         * that have not yet been set to their final value).
         * @returns The data at the specified field location or undefined if no such
         * field exists in the document.
         */
        // We are using `any` here to avoid an explicit cast by our users.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(t, e = {}) {
            if (this._document) {
                const n = this._document.data.field(ph("DocumentSnapshot.get", t));
                if (null !== n) return this._userDataWriter.convertValue(n, e.serverTimestamps);
            }
        }
    }

    /**
     * A `QueryDocumentSnapshot` contains data read from a document in your
     * Firestore database as part of a query. The document is guaranteed to exist
     * and its data can be extracted with `.data()` or `.get(<field>)` to get a
     * specific field.
     *
     * A `QueryDocumentSnapshot` offers the same API surface as a
     * `DocumentSnapshot`. Since query results contain only existing documents, the
     * `exists` property will always be true and `data()` will never return
     * 'undefined'.
     */ class Eh extends Th {
        /**
         * Retrieves all fields in the document as an `Object`.
         *
         * By default, `serverTimestamp()` values that have not yet been
         * set to their final value will be returned as `null`. You can override
         * this by passing an options object.
         *
         * @override
         * @param options - An options object to configure how data is retrieved from
         * the snapshot (for example the desired behavior for server timestamps that
         * have not yet been set to their final value).
         * @returns An `Object` containing all fields in the document.
         */
        data(t = {}) {
            return super.data(t);
        }
    }

    /**
     * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects
     * representing the results of a query. The documents can be accessed as an
     * array via the `docs` property or enumerated using the `forEach` method. The
     * number of documents can be determined via the `empty` and `size`
     * properties.
     */ class Ah {
        /** @hideconstructor */
        constructor(t, e, n, s) {
            this._firestore = t, this._userDataWriter = e, this._snapshot = s, this.metadata = new Ih(s.hasPendingWrites, s.fromCache), 
            this.query = n;
        }
        /** An array of all the documents in the `QuerySnapshot`. */    get docs() {
            const t = [];
            return this.forEach((e => t.push(e))), t;
        }
        /** The number of documents in the `QuerySnapshot`. */    get size() {
            return this._snapshot.docs.size;
        }
        /** True if there are no documents in the `QuerySnapshot`. */    get empty() {
            return 0 === this.size;
        }
        /**
         * Enumerates all of the documents in the `QuerySnapshot`.
         *
         * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
         * each document in the snapshot.
         * @param thisArg - The `this` binding for the callback.
         */    forEach(t, e) {
            this._snapshot.docs.forEach((n => {
                t.call(e, new Eh(this._firestore, this._userDataWriter, n.key, n, new Ih(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
            }));
        }
        /**
         * Returns an array of the documents changes since the last snapshot. If this
         * is the first snapshot, all documents will be in the list as 'added'
         * changes.
         *
         * @param options - `SnapshotListenOptions` that control whether metadata-only
         * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
         * snapshot events.
         */    docChanges(t = {}) {
            const e = !!t.includeMetadataChanges;
            if (e && this._snapshot.excludesMetadataChanges) throw new Q(K.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
            return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = 
            /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
            function(t, e) {
                if (t._snapshot.oldDocs.isEmpty()) {
                    let e = 0;
                    return t._snapshot.docChanges.map((n => ({
                        type: "added",
                        doc: new Eh(t._firestore, t._userDataWriter, n.doc.key, n.doc, new Ih(t._snapshot.mutatedKeys.has(n.doc.key), t._snapshot.fromCache), t.query.converter),
                        oldIndex: -1,
                        newIndex: e++
                    })));
                }
                {
                    // A `DocumentSet` that is updated incrementally as changes are applied to use
                    // to lookup the index of a document.
                    let n = t._snapshot.oldDocs;
                    return t._snapshot.docChanges.filter((t => e || 3 /* Metadata */ !== t.type)).map((e => {
                        const s = new Eh(t._firestore, t._userDataWriter, e.doc.key, e.doc, new Ih(t._snapshot.mutatedKeys.has(e.doc.key), t._snapshot.fromCache), t.query.converter);
                        let i = -1, r = -1;
                        return 0 /* Added */ !== e.type && (i = n.indexOf(e.doc.key), n = n.delete(e.doc.key)), 
                        1 /* Removed */ !== e.type && (n = n.add(e.doc), r = n.indexOf(e.doc.key)), {
                            type: Rh(e.type),
                            doc: s,
                            oldIndex: i,
                            newIndex: r
                        };
                    }));
                }
            }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
        }
    }

    function Rh(t) {
        switch (t) {
          case 0 /* Added */ :
            return "added";

          case 2 /* Modified */ :
          case 3 /* Metadata */ :
            return "modified";

          case 1 /* Removed */ :
            return "removed";

          default:
            return L();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ function Ph(t) {
        if (Me(t) && 0 === t.explicitOrderBy.length) throw new Q(K.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Converts Firestore's internal types to the JavaScript types that we expose
     * to the user.
     *
     * @internal
     */ class jh {
        convertValue(t, e = "none") {
            switch (Mt(t)) {
              case 0 /* NullValue */ :
                return null;

              case 1 /* BooleanValue */ :
                return t.booleanValue;

              case 2 /* NumberValue */ :
                return Et(t.integerValue || t.doubleValue);

              case 3 /* TimestampValue */ :
                return this.convertTimestamp(t.timestampValue);

              case 4 /* ServerTimestampValue */ :
                return this.convertServerTimestamp(t, e);

              case 5 /* StringValue */ :
                return t.stringValue;

              case 6 /* BlobValue */ :
                return this.convertBytes(At(t.bytesValue));

              case 7 /* RefValue */ :
                return this.convertReference(t.referenceValue);

              case 8 /* GeoPointValue */ :
                return this.convertGeoPoint(t.geoPointValue);

              case 9 /* ArrayValue */ :
                return this.convertArray(t.arrayValue, e);

              case 10 /* ObjectValue */ :
                return this.convertObject(t.mapValue, e);

              default:
                throw L();
            }
        }
        convertObject(t, e) {
            const n = {};
            return lt(t.fields, ((t, s) => {
                n[t] = this.convertValue(s, e);
            })), n;
        }
        convertGeoPoint(t) {
            return new Kc(Et(t.latitude), Et(t.longitude));
        }
        convertArray(t, e) {
            return (t.values || []).map((t => this.convertValue(t, e)));
        }
        convertServerTimestamp(t, e) {
            switch (e) {
              case "previous":
                const n = bt(t);
                return null == n ? null : this.convertValue(n, e);

              case "estimate":
                return this.convertTimestamp(Pt(t));

              default:
                return null;
            }
        }
        convertTimestamp(t) {
            const e = Tt(t);
            return new at(e.seconds, e.nanos);
        }
        convertDocumentKey(t, e) {
            const n = _t.fromString(t);
            U(Ls(n));
            const s = new vt(n.get(1), n.get(3)), i = new xt(n.popFirst(5));
            return s.isEqual(e) || 
            // TODO(b/64130202): Somehow support foreign references.
            F(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), 
            i;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Converts custom model object of type T into `DocumentData` by applying the
     * converter if it exists.
     *
     * This function is used when converting user objects to `DocumentData`
     * because we want to provide the user with a more specific error message if
     * their `set()` or fails due to invalid data originating from a `toFirestore()`
     * call.
     */ function Wh(t, e, n) {
        let s;
        // Cast to `any` in order to satisfy the union type constraint on
        // toFirestore().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return s = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, 
        s;
    }

    class Xh extends jh {
        constructor(t) {
            super(), this.firestore = t;
        }
        convertBytes(t) {
            return new qc(t);
        }
        convertReference(t) {
            const e = this.convertDocumentKey(t, this.firestore._databaseId);
            return new fc(this.firestore, /* converter= */ null, e);
        }
    }

    function rl(t, e, n, ...s) {
        t = uc(t, fc);
        const i = uc(t.firestore, Rc), r = Yc(i);
        let o;
        o = "string" == typeof (
        // For Compat types, we have to "extract" the underlying types before
        // performing validation.
        e = getModularInstance(e)) || e instanceof Lc ? oh(r, "updateDoc", t._key, e, n, s) : rh(r, "updateDoc", t._key, e);
        return hl(i, [ o.toMutation(t._key, _n.exists(!0)) ]);
    }

    /**
     * Deletes the document referred to by the specified `DocumentReference`.
     *
     * @param reference - A reference to the document to delete.
     * @returns A Promise resolved once the document has been successfully
     * deleted from the backend (note that it won't resolve while you're offline).
     */ function ol(t) {
        return hl(uc(t.firestore, Rc), [ new Vn(t._key, _n.none()) ]);
    }

    /**
     * Add a new document to specified `CollectionReference` with the given data,
     * assigning it a document ID automatically.
     *
     * @param reference - A reference to the collection to add this document to.
     * @param data - An Object containing the data for the new document.
     * @returns A `Promise` resolved with a `DocumentReference` pointing to the
     * newly created document after it has been written to the backend (Note that it
     * won't resolve while you're offline).
     */ function ul(t, e) {
        const n = uc(t.firestore, Rc), s = gc(t), i = Wh(t.converter, e);
        return hl(n, [ Xc(Yc(t.firestore), "addDoc", s._key, i, null !== t.converter, {}).toMutation(s._key, _n.exists(!1)) ]).then((() => s));
    }

    function al(t, ...e) {
        var n, s, i;
        t = getModularInstance(t);
        let r = {
            includeMetadataChanges: !1
        }, o = 0;
        "object" != typeof e[o] || Tc(e[o]) || (r = e[o], o++);
        const u = {
            includeMetadataChanges: r.includeMetadataChanges
        };
        if (Tc(e[o])) {
            const t = e[o];
            e[o] = null === (n = t.next) || void 0 === n ? void 0 : n.bind(t), e[o + 1] = null === (s = t.error) || void 0 === s ? void 0 : s.bind(t), 
            e[o + 2] = null === (i = t.complete) || void 0 === i ? void 0 : i.bind(t);
        }
        let a, c, h;
        if (t instanceof fc) c = uc(t.firestore, Rc), h = Ne(t._key.path), a = {
            next: n => {
                e[o] && e[o](ll(c, t, n));
            },
            error: e[o + 1],
            complete: e[o + 2]
        }; else {
            const n = uc(t, dc);
            c = uc(n.firestore, Rc), h = n._query;
            const s = new Xh(c);
            a = {
                next: t => {
                    e[o] && e[o](new Ah(c, s, n, t));
                },
                error: e[o + 1],
                complete: e[o + 2]
            }, Ph(t._query);
        }
        return function(t, e, n, s) {
            const i = new Ca(s), r = new Fu(e, i, n);
            return t.asyncQueue.enqueueAndForget((async () => xu(await Ka(t), r))), () => {
                i.pa(), t.asyncQueue.enqueueAndForget((async () => Nu(await Ka(t), r)));
            };
        }(Vc(c), h, u, a);
    }

    /**
     * Locally writes `mutations` on the async queue.
     * @internal
     */ function hl(t, e) {
        return function(t, e) {
            const n = new j;
            return t.asyncQueue.enqueueAndForget((async () => Yu(await Ga(t), e, n))), n.promise;
        }(Vc(t), e);
    }

    /**
     * Converts a {@link ViewSnapshot} that contains the single document specified by `ref`
     * to a {@link DocumentSnapshot}.
     */ function ll(t, e, n) {
        const s = n.docs.get(e._key), i = new Xh(t);
        return new Th(t, i, e._key, s, new Ih(n.hasPendingWrites, n.fromCache), e.converter);
    }

    /**
     * Cloud Firestore
     *
     * @packageDocumentation
     */ !function(t, e = !0) {
        !function(t) {
            x = t;
        }(SDK_VERSION), _registerComponent(new Component("firestore", ((t, {options: n}) => {
            const s = t.getProvider("app").getImmediate(), i = new Rc(s, new J(t.getProvider("auth-internal")), new tt(t.getProvider("app-check-internal")));
            return n = Object.assign({
                useFetchStreams: e
            }, n), i._setSettings(n), i;
        }), "PUBLIC")), registerVersion(D, "3.4.7", t), 
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(D, "3.4.7", "esm2017");
    }();

    var name$1 = "firebase";
    var version$1 = "9.6.10";

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    registerVersion(name$1, version$1, 'app');

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function _prodErrorMap() {
        // We will include this one message in the prod error map since by the very
        // nature of this error, developers will never be able to see the message
        // using the debugErrorMap (which is installed during auth initialization).
        return {
            ["dependent-sdk-initialized-before-auth" /* DEPENDENT_SDK_INIT_BEFORE_AUTH */]: 'Another Firebase SDK was initialized and is trying to use Auth before Auth is ' +
                'initialized. Please be sure to call `initializeAuth` or `getAuth` before ' +
                'starting any other Firebase SDK.'
        };
    }
    /**
     * A minimal error map with all verbose error messages stripped.
     *
     * See discussion at {@link AuthErrorMap}
     *
     * @public
     */
    const prodErrorMap = _prodErrorMap;
    const _DEFAULT_AUTH_ERROR_FACTORY = new ErrorFactory('auth', 'Firebase', _prodErrorMap());

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const logClient = new Logger('@firebase/auth');
    function _logError(msg, ...args) {
        if (logClient.logLevel <= LogLevel.ERROR) {
            logClient.error(`Auth (${SDK_VERSION}): ${msg}`, ...args);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _fail(authOrCode, ...rest) {
        throw createErrorInternal(authOrCode, ...rest);
    }
    function _createError(authOrCode, ...rest) {
        return createErrorInternal(authOrCode, ...rest);
    }
    function _errorWithCustomMessage(auth, code, message) {
        const errorMap = Object.assign(Object.assign({}, prodErrorMap()), { [code]: message });
        const factory = new ErrorFactory('auth', 'Firebase', errorMap);
        return factory.create(code, {
            appName: auth.name,
        });
    }
    function _assertInstanceOf(auth, object, instance) {
        const constructorInstance = instance;
        if (!(object instanceof constructorInstance)) {
            if (constructorInstance.name !== object.constructor.name) {
                _fail(auth, "argument-error" /* ARGUMENT_ERROR */);
            }
            throw _errorWithCustomMessage(auth, "argument-error" /* ARGUMENT_ERROR */, `Type of ${object.constructor.name} does not match expected instance.` +
                `Did you pass a reference from a different Auth SDK?`);
        }
    }
    function createErrorInternal(authOrCode, ...rest) {
        if (typeof authOrCode !== 'string') {
            const code = rest[0];
            const fullParams = [...rest.slice(1)];
            if (fullParams[0]) {
                fullParams[0].appName = authOrCode.name;
            }
            return authOrCode._errorFactory.create(code, ...fullParams);
        }
        return _DEFAULT_AUTH_ERROR_FACTORY.create(authOrCode, ...rest);
    }
    function _assert(assertion, authOrCode, ...rest) {
        if (!assertion) {
            throw createErrorInternal(authOrCode, ...rest);
        }
    }
    /**
     * Unconditionally fails, throwing an internal error with the given message.
     *
     * @param failure type of failure encountered
     * @throws Error
     */
    function debugFail(failure) {
        // Log the failure in addition to throw an exception, just in case the
        // exception is swallowed.
        const message = `INTERNAL ASSERTION FAILED: ` + failure;
        _logError(message);
        // NOTE: We don't use FirebaseError here because these are internal failures
        // that cannot be handled by the user. (Also it would create a circular
        // dependency between the error and assert modules which doesn't work.)
        throw new Error(message);
    }
    /**
     * Fails if the given assertion condition is false, throwing an Error with the
     * given message if it did.
     *
     * @param assertion
     * @param message
     */
    function debugAssert(assertion, message) {
        if (!assertion) {
            debugFail(message);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const instanceCache = new Map();
    function _getInstance(cls) {
        debugAssert(cls instanceof Function, 'Expected a class definition');
        let instance = instanceCache.get(cls);
        if (instance) {
            debugAssert(instance instanceof cls, 'Instance stored in cache mismatched with class');
            return instance;
        }
        instance = new cls();
        instanceCache.set(cls, instance);
        return instance;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Initializes an {@link Auth} instance with fine-grained control over
     * {@link Dependencies}.
     *
     * @remarks
     *
     * This function allows more control over the {@link Auth} instance than
     * {@link getAuth}. `getAuth` uses platform-specific defaults to supply
     * the {@link Dependencies}. In general, `getAuth` is the easiest way to
     * initialize Auth and works for most use cases. Use `initializeAuth` if you
     * need control over which persistence layer is used, or to minimize bundle
     * size if you're not using either `signInWithPopup` or `signInWithRedirect`.
     *
     * For example, if your app only uses anonymous accounts and you only want
     * accounts saved for the current session, initialize `Auth` with:
     *
     * ```js
     * const auth = initializeAuth(app, {
     *   persistence: browserSessionPersistence,
     *   popupRedirectResolver: undefined,
     * });
     * ```
     *
     * @public
     */
    function initializeAuth(app, deps) {
        const provider = _getProvider(app, 'auth');
        if (provider.isInitialized()) {
            const auth = provider.getImmediate();
            const initialOptions = provider.getOptions();
            if (deepEqual(initialOptions, deps !== null && deps !== void 0 ? deps : {})) {
                return auth;
            }
            else {
                _fail(auth, "already-initialized" /* ALREADY_INITIALIZED */);
            }
        }
        const auth = provider.initialize({ options: deps });
        return auth;
    }
    function _initializeAuthInstance(auth, deps) {
        const persistence = (deps === null || deps === void 0 ? void 0 : deps.persistence) || [];
        const hierarchy = (Array.isArray(persistence) ? persistence : [persistence]).map(_getInstance);
        if (deps === null || deps === void 0 ? void 0 : deps.errorMap) {
            auth._updateErrorMap(deps.errorMap);
        }
        // This promise is intended to float; auth initialization happens in the
        // background, meanwhile the auth object may be used by the app.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        auth._initializeWithPersistence(hierarchy, deps === null || deps === void 0 ? void 0 : deps.popupRedirectResolver);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _getCurrentUrl() {
        var _a;
        return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.href)) || '';
    }
    function _isHttpOrHttps() {
        return _getCurrentScheme() === 'http:' || _getCurrentScheme() === 'https:';
    }
    function _getCurrentScheme() {
        var _a;
        return (typeof self !== 'undefined' && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.protocol)) || null;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Determine whether the browser is working online
     */
    function _isOnline() {
        if (typeof navigator !== 'undefined' &&
            navigator &&
            'onLine' in navigator &&
            typeof navigator.onLine === 'boolean' &&
            // Apply only for traditional web apps and Chrome extensions.
            // This is especially true for Cordova apps which have unreliable
            // navigator.onLine behavior unless cordova-plugin-network-information is
            // installed which overwrites the native navigator.onLine value and
            // defines navigator.connection.
            (_isHttpOrHttps() || isBrowserExtension() || 'connection' in navigator)) {
            return navigator.onLine;
        }
        // If we can't determine the state, assume it is online.
        return true;
    }
    function _getUserLanguage() {
        if (typeof navigator === 'undefined') {
            return null;
        }
        const navigatorLanguage = navigator;
        return (
        // Most reliable, but only supported in Chrome/Firefox.
        (navigatorLanguage.languages && navigatorLanguage.languages[0]) ||
            // Supported in most browsers, but returns the language of the browser
            // UI, not the language set in browser settings.
            navigatorLanguage.language ||
            // Couldn't determine language.
            null);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * A structure to help pick between a range of long and short delay durations
     * depending on the current environment. In general, the long delay is used for
     * mobile environments whereas short delays are used for desktop environments.
     */
    class Delay {
        constructor(shortDelay, longDelay) {
            this.shortDelay = shortDelay;
            this.longDelay = longDelay;
            // Internal error when improperly initialized.
            debugAssert(longDelay > shortDelay, 'Short delay should be less than long delay!');
            this.isMobile = isMobileCordova() || isReactNative();
        }
        get() {
            if (!_isOnline()) {
                // Pick the shorter timeout.
                return Math.min(5000 /* OFFLINE */, this.shortDelay);
            }
            // If running in a mobile environment, return the long delay, otherwise
            // return the short delay.
            // This could be improved in the future to dynamically change based on other
            // variables instead of just reading the current environment.
            return this.isMobile ? this.longDelay : this.shortDelay;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _emulatorUrl(config, path) {
        debugAssert(config.emulator, 'Emulator should always be set here');
        const { url } = config.emulator;
        if (!path) {
            return url;
        }
        return `${url}${path.startsWith('/') ? path.slice(1) : path}`;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class FetchProvider {
        static initialize(fetchImpl, headersImpl, responseImpl) {
            this.fetchImpl = fetchImpl;
            if (headersImpl) {
                this.headersImpl = headersImpl;
            }
            if (responseImpl) {
                this.responseImpl = responseImpl;
            }
        }
        static fetch() {
            if (this.fetchImpl) {
                return this.fetchImpl;
            }
            if (typeof self !== 'undefined' && 'fetch' in self) {
                return self.fetch;
            }
            debugFail('Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
        static headers() {
            if (this.headersImpl) {
                return this.headersImpl;
            }
            if (typeof self !== 'undefined' && 'Headers' in self) {
                return self.Headers;
            }
            debugFail('Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
        static response() {
            if (this.responseImpl) {
                return this.responseImpl;
            }
            if (typeof self !== 'undefined' && 'Response' in self) {
                return self.Response;
            }
            debugFail('Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill');
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Map from errors returned by the server to errors to developer visible errors
     */
    const SERVER_ERROR_MAP = {
        // Custom token errors.
        ["CREDENTIAL_MISMATCH" /* CREDENTIAL_MISMATCH */]: "custom-token-mismatch" /* CREDENTIAL_MISMATCH */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_CUSTOM_TOKEN" /* MISSING_CUSTOM_TOKEN */]: "internal-error" /* INTERNAL_ERROR */,
        // Create Auth URI errors.
        ["INVALID_IDENTIFIER" /* INVALID_IDENTIFIER */]: "invalid-email" /* INVALID_EMAIL */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_CONTINUE_URI" /* MISSING_CONTINUE_URI */]: "internal-error" /* INTERNAL_ERROR */,
        // Sign in with email and password errors (some apply to sign up too).
        ["INVALID_PASSWORD" /* INVALID_PASSWORD */]: "wrong-password" /* INVALID_PASSWORD */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_PASSWORD" /* MISSING_PASSWORD */]: "internal-error" /* INTERNAL_ERROR */,
        // Sign up with email and password errors.
        ["EMAIL_EXISTS" /* EMAIL_EXISTS */]: "email-already-in-use" /* EMAIL_EXISTS */,
        ["PASSWORD_LOGIN_DISABLED" /* PASSWORD_LOGIN_DISABLED */]: "operation-not-allowed" /* OPERATION_NOT_ALLOWED */,
        // Verify assertion for sign in with credential errors:
        ["INVALID_IDP_RESPONSE" /* INVALID_IDP_RESPONSE */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["INVALID_PENDING_TOKEN" /* INVALID_PENDING_TOKEN */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["FEDERATED_USER_ID_ALREADY_LINKED" /* FEDERATED_USER_ID_ALREADY_LINKED */]: "credential-already-in-use" /* CREDENTIAL_ALREADY_IN_USE */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_REQ_TYPE" /* MISSING_REQ_TYPE */]: "internal-error" /* INTERNAL_ERROR */,
        // Send Password reset email errors:
        ["EMAIL_NOT_FOUND" /* EMAIL_NOT_FOUND */]: "user-not-found" /* USER_DELETED */,
        ["RESET_PASSWORD_EXCEED_LIMIT" /* RESET_PASSWORD_EXCEED_LIMIT */]: "too-many-requests" /* TOO_MANY_ATTEMPTS_TRY_LATER */,
        ["EXPIRED_OOB_CODE" /* EXPIRED_OOB_CODE */]: "expired-action-code" /* EXPIRED_OOB_CODE */,
        ["INVALID_OOB_CODE" /* INVALID_OOB_CODE */]: "invalid-action-code" /* INVALID_OOB_CODE */,
        // This can only happen if the SDK sends a bad request.
        ["MISSING_OOB_CODE" /* MISSING_OOB_CODE */]: "internal-error" /* INTERNAL_ERROR */,
        // Operations that require ID token in request:
        ["CREDENTIAL_TOO_OLD_LOGIN_AGAIN" /* CREDENTIAL_TOO_OLD_LOGIN_AGAIN */]: "requires-recent-login" /* CREDENTIAL_TOO_OLD_LOGIN_AGAIN */,
        ["INVALID_ID_TOKEN" /* INVALID_ID_TOKEN */]: "invalid-user-token" /* INVALID_AUTH */,
        ["TOKEN_EXPIRED" /* TOKEN_EXPIRED */]: "user-token-expired" /* TOKEN_EXPIRED */,
        ["USER_NOT_FOUND" /* USER_NOT_FOUND */]: "user-token-expired" /* TOKEN_EXPIRED */,
        // Other errors.
        ["TOO_MANY_ATTEMPTS_TRY_LATER" /* TOO_MANY_ATTEMPTS_TRY_LATER */]: "too-many-requests" /* TOO_MANY_ATTEMPTS_TRY_LATER */,
        // Phone Auth related errors.
        ["INVALID_CODE" /* INVALID_CODE */]: "invalid-verification-code" /* INVALID_CODE */,
        ["INVALID_SESSION_INFO" /* INVALID_SESSION_INFO */]: "invalid-verification-id" /* INVALID_SESSION_INFO */,
        ["INVALID_TEMPORARY_PROOF" /* INVALID_TEMPORARY_PROOF */]: "invalid-credential" /* INVALID_IDP_RESPONSE */,
        ["MISSING_SESSION_INFO" /* MISSING_SESSION_INFO */]: "missing-verification-id" /* MISSING_SESSION_INFO */,
        ["SESSION_EXPIRED" /* SESSION_EXPIRED */]: "code-expired" /* CODE_EXPIRED */,
        // Other action code errors when additional settings passed.
        // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
        // This is OK as this error will be caught by client side validation.
        ["MISSING_ANDROID_PACKAGE_NAME" /* MISSING_ANDROID_PACKAGE_NAME */]: "missing-android-pkg-name" /* MISSING_ANDROID_PACKAGE_NAME */,
        ["UNAUTHORIZED_DOMAIN" /* UNAUTHORIZED_DOMAIN */]: "unauthorized-continue-uri" /* UNAUTHORIZED_DOMAIN */,
        // getProjectConfig errors when clientId is passed.
        ["INVALID_OAUTH_CLIENT_ID" /* INVALID_OAUTH_CLIENT_ID */]: "invalid-oauth-client-id" /* INVALID_OAUTH_CLIENT_ID */,
        // User actions (sign-up or deletion) disabled errors.
        ["ADMIN_ONLY_OPERATION" /* ADMIN_ONLY_OPERATION */]: "admin-restricted-operation" /* ADMIN_ONLY_OPERATION */,
        // Multi factor related errors.
        ["INVALID_MFA_PENDING_CREDENTIAL" /* INVALID_MFA_PENDING_CREDENTIAL */]: "invalid-multi-factor-session" /* INVALID_MFA_SESSION */,
        ["MFA_ENROLLMENT_NOT_FOUND" /* MFA_ENROLLMENT_NOT_FOUND */]: "multi-factor-info-not-found" /* MFA_INFO_NOT_FOUND */,
        ["MISSING_MFA_ENROLLMENT_ID" /* MISSING_MFA_ENROLLMENT_ID */]: "missing-multi-factor-info" /* MISSING_MFA_INFO */,
        ["MISSING_MFA_PENDING_CREDENTIAL" /* MISSING_MFA_PENDING_CREDENTIAL */]: "missing-multi-factor-session" /* MISSING_MFA_SESSION */,
        ["SECOND_FACTOR_EXISTS" /* SECOND_FACTOR_EXISTS */]: "second-factor-already-in-use" /* SECOND_FACTOR_ALREADY_ENROLLED */,
        ["SECOND_FACTOR_LIMIT_EXCEEDED" /* SECOND_FACTOR_LIMIT_EXCEEDED */]: "maximum-second-factor-count-exceeded" /* SECOND_FACTOR_LIMIT_EXCEEDED */,
        // Blocking functions related errors.
        ["BLOCKING_FUNCTION_ERROR_RESPONSE" /* BLOCKING_FUNCTION_ERROR_RESPONSE */]: "internal-error" /* INTERNAL_ERROR */,
    };

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DEFAULT_API_TIMEOUT_MS = new Delay(30000, 60000);
    function _addTidIfNecessary(auth, request) {
        if (auth.tenantId && !request.tenantId) {
            return Object.assign(Object.assign({}, request), { tenantId: auth.tenantId });
        }
        return request;
    }
    async function _performApiRequest(auth, method, path, request, customErrorMap = {}) {
        return _performFetchWithErrorHandling(auth, customErrorMap, async () => {
            let body = {};
            let params = {};
            if (request) {
                if (method === "GET" /* GET */) {
                    params = request;
                }
                else {
                    body = {
                        body: JSON.stringify(request)
                    };
                }
            }
            const query = querystring(Object.assign({ key: auth.config.apiKey }, params)).slice(1);
            const headers = await auth._getAdditionalHeaders();
            headers["Content-Type" /* CONTENT_TYPE */] = 'application/json';
            if (auth.languageCode) {
                headers["X-Firebase-Locale" /* X_FIREBASE_LOCALE */] = auth.languageCode;
            }
            return FetchProvider.fetch()(_getFinalTarget(auth, auth.config.apiHost, path, query), Object.assign({ method,
                headers, referrerPolicy: 'no-referrer' }, body));
        });
    }
    async function _performFetchWithErrorHandling(auth, customErrorMap, fetchFn) {
        auth._canInitEmulator = false;
        const errorMap = Object.assign(Object.assign({}, SERVER_ERROR_MAP), customErrorMap);
        try {
            const networkTimeout = new NetworkTimeout(auth);
            const response = await Promise.race([
                fetchFn(),
                networkTimeout.promise
            ]);
            // If we've reached this point, the fetch succeeded and the networkTimeout
            // didn't throw; clear the network timeout delay so that Node won't hang
            networkTimeout.clearNetworkTimeout();
            const json = await response.json();
            if ('needConfirmation' in json) {
                throw _makeTaggedError(auth, "account-exists-with-different-credential" /* NEED_CONFIRMATION */, json);
            }
            if (response.ok && !('errorMessage' in json)) {
                return json;
            }
            else {
                const errorMessage = response.ok ? json.errorMessage : json.error.message;
                const [serverErrorCode, serverErrorMessage] = errorMessage.split(' : ');
                if (serverErrorCode === "FEDERATED_USER_ID_ALREADY_LINKED" /* FEDERATED_USER_ID_ALREADY_LINKED */) {
                    throw _makeTaggedError(auth, "credential-already-in-use" /* CREDENTIAL_ALREADY_IN_USE */, json);
                }
                else if (serverErrorCode === "EMAIL_EXISTS" /* EMAIL_EXISTS */) {
                    throw _makeTaggedError(auth, "email-already-in-use" /* EMAIL_EXISTS */, json);
                }
                const authError = errorMap[serverErrorCode] ||
                    serverErrorCode
                        .toLowerCase()
                        .replace(/[_\s]+/g, '-');
                if (serverErrorMessage) {
                    throw _errorWithCustomMessage(auth, authError, serverErrorMessage);
                }
                else {
                    _fail(auth, authError);
                }
            }
        }
        catch (e) {
            if (e instanceof FirebaseError) {
                throw e;
            }
            _fail(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */);
        }
    }
    async function _performSignInRequest(auth, method, path, request, customErrorMap = {}) {
        const serverResponse = (await _performApiRequest(auth, method, path, request, customErrorMap));
        if ('mfaPendingCredential' in serverResponse) {
            _fail(auth, "multi-factor-auth-required" /* MFA_REQUIRED */, {
                _serverResponse: serverResponse
            });
        }
        return serverResponse;
    }
    function _getFinalTarget(auth, host, path, query) {
        const base = `${host}${path}?${query}`;
        if (!auth.config.emulator) {
            return `${auth.config.apiScheme}://${base}`;
        }
        return _emulatorUrl(auth.config, base);
    }
    class NetworkTimeout {
        constructor(auth) {
            this.auth = auth;
            // Node timers and browser timers are fundamentally incompatible, but we
            // don't care about the value here
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.timer = null;
            this.promise = new Promise((_, reject) => {
                this.timer = setTimeout(() => {
                    return reject(_createError(this.auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */));
                }, DEFAULT_API_TIMEOUT_MS.get());
            });
        }
        clearNetworkTimeout() {
            clearTimeout(this.timer);
        }
    }
    function _makeTaggedError(auth, code, response) {
        const errorParams = {
            appName: auth.name
        };
        if (response.email) {
            errorParams.email = response.email;
        }
        if (response.phoneNumber) {
            errorParams.phoneNumber = response.phoneNumber;
        }
        const error = _createError(auth, code, errorParams);
        // We know customData is defined on error because errorParams is defined
        error.customData._tokenResponse = response;
        return error;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function deleteAccount(auth, request) {
        return _performApiRequest(auth, "POST" /* POST */, "/v1/accounts:delete" /* DELETE_ACCOUNT */, request);
    }
    async function getAccountInfo(auth, request) {
        return _performApiRequest(auth, "POST" /* POST */, "/v1/accounts:lookup" /* GET_ACCOUNT_INFO */, request);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function utcTimestampToDateString(utcTimestamp) {
        if (!utcTimestamp) {
            return undefined;
        }
        try {
            // Convert to date object.
            const date = new Date(Number(utcTimestamp));
            // Test date is valid.
            if (!isNaN(date.getTime())) {
                // Convert to UTC date string.
                return date.toUTCString();
            }
        }
        catch (e) {
            // Do nothing. undefined will be returned.
        }
        return undefined;
    }
    /**
     * Returns a deserialized JSON Web Token (JWT) used to identitfy the user to a Firebase service.
     *
     * @remarks
     * Returns the current token if it has not expired or if it will not expire in the next five
     * minutes. Otherwise, this will refresh the token and return a new one.
     *
     * @param user - The user.
     * @param forceRefresh - Force refresh regardless of token expiration.
     *
     * @public
     */
    async function getIdTokenResult(user, forceRefresh = false) {
        const userInternal = getModularInstance(user);
        const token = await userInternal.getIdToken(forceRefresh);
        const claims = _parseToken(token);
        _assert(claims && claims.exp && claims.auth_time && claims.iat, userInternal.auth, "internal-error" /* INTERNAL_ERROR */);
        const firebase = typeof claims.firebase === 'object' ? claims.firebase : undefined;
        const signInProvider = firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_provider'];
        return {
            claims,
            token,
            authTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.auth_time)),
            issuedAtTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.iat)),
            expirationTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.exp)),
            signInProvider: signInProvider || null,
            signInSecondFactor: (firebase === null || firebase === void 0 ? void 0 : firebase['sign_in_second_factor']) || null
        };
    }
    function secondsStringToMilliseconds(seconds) {
        return Number(seconds) * 1000;
    }
    function _parseToken(token) {
        const [algorithm, payload, signature] = token.split('.');
        if (algorithm === undefined ||
            payload === undefined ||
            signature === undefined) {
            _logError('JWT malformed, contained fewer than 3 sections');
            return null;
        }
        try {
            const decoded = base64Decode(payload);
            if (!decoded) {
                _logError('Failed to decode base64 JWT payload');
                return null;
            }
            return JSON.parse(decoded);
        }
        catch (e) {
            _logError('Caught error parsing JWT payload as JSON', e);
            return null;
        }
    }
    /**
     * Extract expiresIn TTL from a token by subtracting the expiration from the issuance.
     */
    function _tokenExpiresIn(token) {
        const parsedToken = _parseToken(token);
        _assert(parsedToken, "internal-error" /* INTERNAL_ERROR */);
        _assert(typeof parsedToken.exp !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
        _assert(typeof parsedToken.iat !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
        return Number(parsedToken.exp) - Number(parsedToken.iat);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function _logoutIfInvalidated(user, promise, bypassAuthState = false) {
        if (bypassAuthState) {
            return promise;
        }
        try {
            return await promise;
        }
        catch (e) {
            if (e instanceof FirebaseError && isUserInvalidated(e)) {
                if (user.auth.currentUser === user) {
                    await user.auth.signOut();
                }
            }
            throw e;
        }
    }
    function isUserInvalidated({ code }) {
        return (code === `auth/${"user-disabled" /* USER_DISABLED */}` ||
            code === `auth/${"user-token-expired" /* TOKEN_EXPIRED */}`);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ProactiveRefresh {
        constructor(user) {
            this.user = user;
            this.isRunning = false;
            // Node timers and browser timers return fundamentally different types.
            // We don't actually care what the value is but TS won't accept unknown and
            // we can't cast properly in both environments.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.timerId = null;
            this.errorBackoff = 30000 /* RETRY_BACKOFF_MIN */;
        }
        _start() {
            if (this.isRunning) {
                return;
            }
            this.isRunning = true;
            this.schedule();
        }
        _stop() {
            if (!this.isRunning) {
                return;
            }
            this.isRunning = false;
            if (this.timerId !== null) {
                clearTimeout(this.timerId);
            }
        }
        getInterval(wasError) {
            var _a;
            if (wasError) {
                const interval = this.errorBackoff;
                this.errorBackoff = Math.min(this.errorBackoff * 2, 960000 /* RETRY_BACKOFF_MAX */);
                return interval;
            }
            else {
                // Reset the error backoff
                this.errorBackoff = 30000 /* RETRY_BACKOFF_MIN */;
                const expTime = (_a = this.user.stsTokenManager.expirationTime) !== null && _a !== void 0 ? _a : 0;
                const interval = expTime - Date.now() - 300000 /* OFFSET */;
                return Math.max(0, interval);
            }
        }
        schedule(wasError = false) {
            if (!this.isRunning) {
                // Just in case...
                return;
            }
            const interval = this.getInterval(wasError);
            this.timerId = setTimeout(async () => {
                await this.iteration();
            }, interval);
        }
        async iteration() {
            try {
                await this.user.getIdToken(true);
            }
            catch (e) {
                // Only retry on network errors
                if (e.code === `auth/${"network-request-failed" /* NETWORK_REQUEST_FAILED */}`) {
                    this.schedule(/* wasError */ true);
                }
                return;
            }
            this.schedule();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class UserMetadata {
        constructor(createdAt, lastLoginAt) {
            this.createdAt = createdAt;
            this.lastLoginAt = lastLoginAt;
            this._initializeTime();
        }
        _initializeTime() {
            this.lastSignInTime = utcTimestampToDateString(this.lastLoginAt);
            this.creationTime = utcTimestampToDateString(this.createdAt);
        }
        _copy(metadata) {
            this.createdAt = metadata.createdAt;
            this.lastLoginAt = metadata.lastLoginAt;
            this._initializeTime();
        }
        toJSON() {
            return {
                createdAt: this.createdAt,
                lastLoginAt: this.lastLoginAt
            };
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function _reloadWithoutSaving(user) {
        var _a;
        const auth = user.auth;
        const idToken = await user.getIdToken();
        const response = await _logoutIfInvalidated(user, getAccountInfo(auth, { idToken }));
        _assert(response === null || response === void 0 ? void 0 : response.users.length, auth, "internal-error" /* INTERNAL_ERROR */);
        const coreAccount = response.users[0];
        user._notifyReloadListener(coreAccount);
        const newProviderData = ((_a = coreAccount.providerUserInfo) === null || _a === void 0 ? void 0 : _a.length)
            ? extractProviderData(coreAccount.providerUserInfo)
            : [];
        const providerData = mergeProviderData(user.providerData, newProviderData);
        // Preserves the non-nonymous status of the stored user, even if no more
        // credentials (federated or email/password) are linked to the user. If
        // the user was previously anonymous, then use provider data to update.
        // On the other hand, if it was not anonymous before, it should never be
        // considered anonymous now.
        const oldIsAnonymous = user.isAnonymous;
        const newIsAnonymous = !(user.email && coreAccount.passwordHash) && !(providerData === null || providerData === void 0 ? void 0 : providerData.length);
        const isAnonymous = !oldIsAnonymous ? false : newIsAnonymous;
        const updates = {
            uid: coreAccount.localId,
            displayName: coreAccount.displayName || null,
            photoURL: coreAccount.photoUrl || null,
            email: coreAccount.email || null,
            emailVerified: coreAccount.emailVerified || false,
            phoneNumber: coreAccount.phoneNumber || null,
            tenantId: coreAccount.tenantId || null,
            providerData,
            metadata: new UserMetadata(coreAccount.createdAt, coreAccount.lastLoginAt),
            isAnonymous
        };
        Object.assign(user, updates);
    }
    /**
     * Reloads user account data, if signed in.
     *
     * @param user - The user.
     *
     * @public
     */
    async function reload(user) {
        const userInternal = getModularInstance(user);
        await _reloadWithoutSaving(userInternal);
        // Even though the current user hasn't changed, update
        // current user will trigger a persistence update w/ the
        // new info.
        await userInternal.auth._persistUserIfCurrent(userInternal);
        userInternal.auth._notifyListenersIfCurrent(userInternal);
    }
    function mergeProviderData(original, newData) {
        const deduped = original.filter(o => !newData.some(n => n.providerId === o.providerId));
        return [...deduped, ...newData];
    }
    function extractProviderData(providers) {
        return providers.map((_a) => {
            var { providerId } = _a, provider = __rest(_a, ["providerId"]);
            return {
                providerId,
                uid: provider.rawId || '',
                displayName: provider.displayName || null,
                email: provider.email || null,
                phoneNumber: provider.phoneNumber || null,
                photoURL: provider.photoUrl || null
            };
        });
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function requestStsToken(auth, refreshToken) {
        const response = await _performFetchWithErrorHandling(auth, {}, async () => {
            const body = querystring({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }).slice(1);
            const { tokenApiHost, apiKey } = auth.config;
            const url = _getFinalTarget(auth, tokenApiHost, "/v1/token" /* TOKEN */, `key=${apiKey}`);
            const headers = await auth._getAdditionalHeaders();
            headers["Content-Type" /* CONTENT_TYPE */] = 'application/x-www-form-urlencoded';
            return FetchProvider.fetch()(url, {
                method: "POST" /* POST */,
                headers,
                body
            });
        });
        // The response comes back in snake_case. Convert to camel:
        return {
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            refreshToken: response.refresh_token
        };
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * We need to mark this class as internal explicitly to exclude it in the public typings, because
     * it references AuthInternal which has a circular dependency with UserInternal.
     *
     * @internal
     */
    class StsTokenManager {
        constructor() {
            this.refreshToken = null;
            this.accessToken = null;
            this.expirationTime = null;
        }
        get isExpired() {
            return (!this.expirationTime ||
                Date.now() > this.expirationTime - 30000 /* TOKEN_REFRESH */);
        }
        updateFromServerResponse(response) {
            _assert(response.idToken, "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof response.idToken !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof response.refreshToken !== 'undefined', "internal-error" /* INTERNAL_ERROR */);
            const expiresIn = 'expiresIn' in response && typeof response.expiresIn !== 'undefined'
                ? Number(response.expiresIn)
                : _tokenExpiresIn(response.idToken);
            this.updateTokensAndExpiration(response.idToken, response.refreshToken, expiresIn);
        }
        async getToken(auth, forceRefresh = false) {
            _assert(!this.accessToken || this.refreshToken, auth, "user-token-expired" /* TOKEN_EXPIRED */);
            if (!forceRefresh && this.accessToken && !this.isExpired) {
                return this.accessToken;
            }
            if (this.refreshToken) {
                await this.refresh(auth, this.refreshToken);
                return this.accessToken;
            }
            return null;
        }
        clearRefreshToken() {
            this.refreshToken = null;
        }
        async refresh(auth, oldToken) {
            const { accessToken, refreshToken, expiresIn } = await requestStsToken(auth, oldToken);
            this.updateTokensAndExpiration(accessToken, refreshToken, Number(expiresIn));
        }
        updateTokensAndExpiration(accessToken, refreshToken, expiresInSec) {
            this.refreshToken = refreshToken || null;
            this.accessToken = accessToken || null;
            this.expirationTime = Date.now() + expiresInSec * 1000;
        }
        static fromJSON(appName, object) {
            const { refreshToken, accessToken, expirationTime } = object;
            const manager = new StsTokenManager();
            if (refreshToken) {
                _assert(typeof refreshToken === 'string', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.refreshToken = refreshToken;
            }
            if (accessToken) {
                _assert(typeof accessToken === 'string', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.accessToken = accessToken;
            }
            if (expirationTime) {
                _assert(typeof expirationTime === 'number', "internal-error" /* INTERNAL_ERROR */, {
                    appName
                });
                manager.expirationTime = expirationTime;
            }
            return manager;
        }
        toJSON() {
            return {
                refreshToken: this.refreshToken,
                accessToken: this.accessToken,
                expirationTime: this.expirationTime
            };
        }
        _assign(stsTokenManager) {
            this.accessToken = stsTokenManager.accessToken;
            this.refreshToken = stsTokenManager.refreshToken;
            this.expirationTime = stsTokenManager.expirationTime;
        }
        _clone() {
            return Object.assign(new StsTokenManager(), this.toJSON());
        }
        _performRefresh() {
            return debugFail('not implemented');
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function assertStringOrUndefined(assertion, appName) {
        _assert(typeof assertion === 'string' || typeof assertion === 'undefined', "internal-error" /* INTERNAL_ERROR */, { appName });
    }
    class UserImpl {
        constructor(_a) {
            var { uid, auth, stsTokenManager } = _a, opt = __rest(_a, ["uid", "auth", "stsTokenManager"]);
            // For the user object, provider is always Firebase.
            this.providerId = "firebase" /* FIREBASE */;
            this.proactiveRefresh = new ProactiveRefresh(this);
            this.reloadUserInfo = null;
            this.reloadListener = null;
            this.uid = uid;
            this.auth = auth;
            this.stsTokenManager = stsTokenManager;
            this.accessToken = stsTokenManager.accessToken;
            this.displayName = opt.displayName || null;
            this.email = opt.email || null;
            this.emailVerified = opt.emailVerified || false;
            this.phoneNumber = opt.phoneNumber || null;
            this.photoURL = opt.photoURL || null;
            this.isAnonymous = opt.isAnonymous || false;
            this.tenantId = opt.tenantId || null;
            this.providerData = opt.providerData ? [...opt.providerData] : [];
            this.metadata = new UserMetadata(opt.createdAt || undefined, opt.lastLoginAt || undefined);
        }
        async getIdToken(forceRefresh) {
            const accessToken = await _logoutIfInvalidated(this, this.stsTokenManager.getToken(this.auth, forceRefresh));
            _assert(accessToken, this.auth, "internal-error" /* INTERNAL_ERROR */);
            if (this.accessToken !== accessToken) {
                this.accessToken = accessToken;
                await this.auth._persistUserIfCurrent(this);
                this.auth._notifyListenersIfCurrent(this);
            }
            return accessToken;
        }
        getIdTokenResult(forceRefresh) {
            return getIdTokenResult(this, forceRefresh);
        }
        reload() {
            return reload(this);
        }
        _assign(user) {
            if (this === user) {
                return;
            }
            _assert(this.uid === user.uid, this.auth, "internal-error" /* INTERNAL_ERROR */);
            this.displayName = user.displayName;
            this.photoURL = user.photoURL;
            this.email = user.email;
            this.emailVerified = user.emailVerified;
            this.phoneNumber = user.phoneNumber;
            this.isAnonymous = user.isAnonymous;
            this.tenantId = user.tenantId;
            this.providerData = user.providerData.map(userInfo => (Object.assign({}, userInfo)));
            this.metadata._copy(user.metadata);
            this.stsTokenManager._assign(user.stsTokenManager);
        }
        _clone(auth) {
            return new UserImpl(Object.assign(Object.assign({}, this), { auth, stsTokenManager: this.stsTokenManager._clone() }));
        }
        _onReload(callback) {
            // There should only ever be one listener, and that is a single instance of MultiFactorUser
            _assert(!this.reloadListener, this.auth, "internal-error" /* INTERNAL_ERROR */);
            this.reloadListener = callback;
            if (this.reloadUserInfo) {
                this._notifyReloadListener(this.reloadUserInfo);
                this.reloadUserInfo = null;
            }
        }
        _notifyReloadListener(userInfo) {
            if (this.reloadListener) {
                this.reloadListener(userInfo);
            }
            else {
                // If no listener is subscribed yet, save the result so it's available when they do subscribe
                this.reloadUserInfo = userInfo;
            }
        }
        _startProactiveRefresh() {
            this.proactiveRefresh._start();
        }
        _stopProactiveRefresh() {
            this.proactiveRefresh._stop();
        }
        async _updateTokensIfNecessary(response, reload = false) {
            let tokensRefreshed = false;
            if (response.idToken &&
                response.idToken !== this.stsTokenManager.accessToken) {
                this.stsTokenManager.updateFromServerResponse(response);
                tokensRefreshed = true;
            }
            if (reload) {
                await _reloadWithoutSaving(this);
            }
            await this.auth._persistUserIfCurrent(this);
            if (tokensRefreshed) {
                this.auth._notifyListenersIfCurrent(this);
            }
        }
        async delete() {
            const idToken = await this.getIdToken();
            await _logoutIfInvalidated(this, deleteAccount(this.auth, { idToken }));
            this.stsTokenManager.clearRefreshToken();
            // TODO: Determine if cancellable-promises are necessary to use in this class so that delete()
            //       cancels pending actions...
            return this.auth.signOut();
        }
        toJSON() {
            return Object.assign(Object.assign({ uid: this.uid, email: this.email || undefined, emailVerified: this.emailVerified, displayName: this.displayName || undefined, isAnonymous: this.isAnonymous, photoURL: this.photoURL || undefined, phoneNumber: this.phoneNumber || undefined, tenantId: this.tenantId || undefined, providerData: this.providerData.map(userInfo => (Object.assign({}, userInfo))), stsTokenManager: this.stsTokenManager.toJSON(), 
                // Redirect event ID must be maintained in case there is a pending
                // redirect event.
                _redirectEventId: this._redirectEventId }, this.metadata.toJSON()), { 
                // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
                apiKey: this.auth.config.apiKey, appName: this.auth.name });
        }
        get refreshToken() {
            return this.stsTokenManager.refreshToken || '';
        }
        static _fromJSON(auth, object) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const displayName = (_a = object.displayName) !== null && _a !== void 0 ? _a : undefined;
            const email = (_b = object.email) !== null && _b !== void 0 ? _b : undefined;
            const phoneNumber = (_c = object.phoneNumber) !== null && _c !== void 0 ? _c : undefined;
            const photoURL = (_d = object.photoURL) !== null && _d !== void 0 ? _d : undefined;
            const tenantId = (_e = object.tenantId) !== null && _e !== void 0 ? _e : undefined;
            const _redirectEventId = (_f = object._redirectEventId) !== null && _f !== void 0 ? _f : undefined;
            const createdAt = (_g = object.createdAt) !== null && _g !== void 0 ? _g : undefined;
            const lastLoginAt = (_h = object.lastLoginAt) !== null && _h !== void 0 ? _h : undefined;
            const { uid, emailVerified, isAnonymous, providerData, stsTokenManager: plainObjectTokenManager } = object;
            _assert(uid && plainObjectTokenManager, auth, "internal-error" /* INTERNAL_ERROR */);
            const stsTokenManager = StsTokenManager.fromJSON(this.name, plainObjectTokenManager);
            _assert(typeof uid === 'string', auth, "internal-error" /* INTERNAL_ERROR */);
            assertStringOrUndefined(displayName, auth.name);
            assertStringOrUndefined(email, auth.name);
            _assert(typeof emailVerified === 'boolean', auth, "internal-error" /* INTERNAL_ERROR */);
            _assert(typeof isAnonymous === 'boolean', auth, "internal-error" /* INTERNAL_ERROR */);
            assertStringOrUndefined(phoneNumber, auth.name);
            assertStringOrUndefined(photoURL, auth.name);
            assertStringOrUndefined(tenantId, auth.name);
            assertStringOrUndefined(_redirectEventId, auth.name);
            assertStringOrUndefined(createdAt, auth.name);
            assertStringOrUndefined(lastLoginAt, auth.name);
            const user = new UserImpl({
                uid,
                auth,
                email,
                emailVerified,
                displayName,
                isAnonymous,
                photoURL,
                phoneNumber,
                tenantId,
                stsTokenManager,
                createdAt,
                lastLoginAt
            });
            if (providerData && Array.isArray(providerData)) {
                user.providerData = providerData.map(userInfo => (Object.assign({}, userInfo)));
            }
            if (_redirectEventId) {
                user._redirectEventId = _redirectEventId;
            }
            return user;
        }
        /**
         * Initialize a User from an idToken server response
         * @param auth
         * @param idTokenResponse
         */
        static async _fromIdTokenResponse(auth, idTokenResponse, isAnonymous = false) {
            const stsTokenManager = new StsTokenManager();
            stsTokenManager.updateFromServerResponse(idTokenResponse);
            // Initialize the Firebase Auth user.
            const user = new UserImpl({
                uid: idTokenResponse.localId,
                auth,
                stsTokenManager,
                isAnonymous
            });
            // Updates the user info and data and resolves with a user instance.
            await _reloadWithoutSaving(user);
            return user;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class InMemoryPersistence {
        constructor() {
            this.type = "NONE" /* NONE */;
            this.storage = {};
        }
        async _isAvailable() {
            return true;
        }
        async _set(key, value) {
            this.storage[key] = value;
        }
        async _get(key) {
            const value = this.storage[key];
            return value === undefined ? null : value;
        }
        async _remove(key) {
            delete this.storage[key];
        }
        _addListener(_key, _listener) {
            // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
            return;
        }
        _removeListener(_key, _listener) {
            // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
            return;
        }
    }
    InMemoryPersistence.type = 'NONE';
    /**
     * An implementation of {@link Persistence} of type 'NONE'.
     *
     * @public
     */
    const inMemoryPersistence = InMemoryPersistence;

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _persistenceKeyName(key, apiKey, appName) {
        return `${"firebase" /* PERSISTENCE */}:${key}:${apiKey}:${appName}`;
    }
    class PersistenceUserManager {
        constructor(persistence, auth, userKey) {
            this.persistence = persistence;
            this.auth = auth;
            this.userKey = userKey;
            const { config, name } = this.auth;
            this.fullUserKey = _persistenceKeyName(this.userKey, config.apiKey, name);
            this.fullPersistenceKey = _persistenceKeyName("persistence" /* PERSISTENCE_USER */, config.apiKey, name);
            this.boundEventHandler = auth._onStorageEvent.bind(auth);
            this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
        }
        setCurrentUser(user) {
            return this.persistence._set(this.fullUserKey, user.toJSON());
        }
        async getCurrentUser() {
            const blob = await this.persistence._get(this.fullUserKey);
            return blob ? UserImpl._fromJSON(this.auth, blob) : null;
        }
        removeCurrentUser() {
            return this.persistence._remove(this.fullUserKey);
        }
        savePersistenceForRedirect() {
            return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
        }
        async setPersistence(newPersistence) {
            if (this.persistence === newPersistence) {
                return;
            }
            const currentUser = await this.getCurrentUser();
            await this.removeCurrentUser();
            this.persistence = newPersistence;
            if (currentUser) {
                return this.setCurrentUser(currentUser);
            }
        }
        delete() {
            this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
        }
        static async create(auth, persistenceHierarchy, userKey = "authUser" /* AUTH_USER */) {
            if (!persistenceHierarchy.length) {
                return new PersistenceUserManager(_getInstance(inMemoryPersistence), auth, userKey);
            }
            // Eliminate any persistences that are not available
            const availablePersistences = (await Promise.all(persistenceHierarchy.map(async (persistence) => {
                if (await persistence._isAvailable()) {
                    return persistence;
                }
                return undefined;
            }))).filter(persistence => persistence);
            // Fall back to the first persistence listed, or in memory if none available
            let selectedPersistence = availablePersistences[0] ||
                _getInstance(inMemoryPersistence);
            const key = _persistenceKeyName(userKey, auth.config.apiKey, auth.name);
            // Pull out the existing user, setting the chosen persistence to that
            // persistence if the user exists.
            let userToMigrate = null;
            // Note, here we check for a user in _all_ persistences, not just the
            // ones deemed available. If we can migrate a user out of a broken
            // persistence, we will (but only if that persistence supports migration).
            for (const persistence of persistenceHierarchy) {
                try {
                    const blob = await persistence._get(key);
                    if (blob) {
                        const user = UserImpl._fromJSON(auth, blob); // throws for unparsable blob (wrong format)
                        if (persistence !== selectedPersistence) {
                            userToMigrate = user;
                        }
                        selectedPersistence = persistence;
                        break;
                    }
                }
                catch (_a) { }
            }
            // If we find the user in a persistence that does support migration, use
            // that migration path (of only persistences that support migration)
            const migrationHierarchy = availablePersistences.filter(p => p._shouldAllowMigration);
            // If the persistence does _not_ allow migration, just finish off here
            if (!selectedPersistence._shouldAllowMigration ||
                !migrationHierarchy.length) {
                return new PersistenceUserManager(selectedPersistence, auth, userKey);
            }
            selectedPersistence = migrationHierarchy[0];
            if (userToMigrate) {
                // This normally shouldn't throw since chosenPersistence.isAvailable() is true, but if it does
                // we'll just let it bubble to surface the error.
                await selectedPersistence._set(key, userToMigrate.toJSON());
            }
            // Attempt to clear the key in other persistences but ignore errors. This helps prevent issues
            // such as users getting stuck with a previous account after signing out and refreshing the tab.
            await Promise.all(persistenceHierarchy.map(async (persistence) => {
                if (persistence !== selectedPersistence) {
                    try {
                        await persistence._remove(key);
                    }
                    catch (_a) { }
                }
            }));
            return new PersistenceUserManager(selectedPersistence, auth, userKey);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Determine the browser for the purposes of reporting usage to the API
     */
    function _getBrowserName(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('opera/') || ua.includes('opr/') || ua.includes('opios/')) {
            return "Opera" /* OPERA */;
        }
        else if (_isIEMobile(ua)) {
            // Windows phone IEMobile browser.
            return "IEMobile" /* IEMOBILE */;
        }
        else if (ua.includes('msie') || ua.includes('trident/')) {
            return "IE" /* IE */;
        }
        else if (ua.includes('edge/')) {
            return "Edge" /* EDGE */;
        }
        else if (_isFirefox(ua)) {
            return "Firefox" /* FIREFOX */;
        }
        else if (ua.includes('silk/')) {
            return "Silk" /* SILK */;
        }
        else if (_isBlackBerry(ua)) {
            // Blackberry browser.
            return "Blackberry" /* BLACKBERRY */;
        }
        else if (_isWebOS(ua)) {
            // WebOS default browser.
            return "Webos" /* WEBOS */;
        }
        else if (_isSafari(ua)) {
            return "Safari" /* SAFARI */;
        }
        else if ((ua.includes('chrome/') || _isChromeIOS(ua)) &&
            !ua.includes('edge/')) {
            return "Chrome" /* CHROME */;
        }
        else if (_isAndroid(ua)) {
            // Android stock browser.
            return "Android" /* ANDROID */;
        }
        else {
            // Most modern browsers have name/version at end of user agent string.
            const re = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/;
            const matches = userAgent.match(re);
            if ((matches === null || matches === void 0 ? void 0 : matches.length) === 2) {
                return matches[1];
            }
        }
        return "Other" /* OTHER */;
    }
    function _isFirefox(ua = getUA()) {
        return /firefox\//i.test(ua);
    }
    function _isSafari(userAgent = getUA()) {
        const ua = userAgent.toLowerCase();
        return (ua.includes('safari/') &&
            !ua.includes('chrome/') &&
            !ua.includes('crios/') &&
            !ua.includes('android'));
    }
    function _isChromeIOS(ua = getUA()) {
        return /crios\//i.test(ua);
    }
    function _isIEMobile(ua = getUA()) {
        return /iemobile/i.test(ua);
    }
    function _isAndroid(ua = getUA()) {
        return /android/i.test(ua);
    }
    function _isBlackBerry(ua = getUA()) {
        return /blackberry/i.test(ua);
    }
    function _isWebOS(ua = getUA()) {
        return /webos/i.test(ua);
    }
    function _isIOS(ua = getUA()) {
        return /iphone|ipad|ipod/i.test(ua);
    }
    function _isIOSStandalone(ua = getUA()) {
        var _a;
        return _isIOS(ua) && !!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.standalone);
    }
    function _isIE10() {
        return isIE() && document.documentMode === 10;
    }
    function _isMobileBrowser(ua = getUA()) {
        // TODO: implement getBrowserName equivalent for OS.
        return (_isIOS(ua) ||
            _isAndroid(ua) ||
            _isWebOS(ua) ||
            _isBlackBerry(ua) ||
            /windows phone/i.test(ua) ||
            _isIEMobile(ua));
    }
    function _isIframe() {
        try {
            // Check that the current window is not the top window.
            // If so, return true.
            return !!(window && window !== window.top);
        }
        catch (e) {
            return false;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /*
     * Determine the SDK version string
     */
    function _getClientVersion(clientPlatform, frameworks = []) {
        let reportedPlatform;
        switch (clientPlatform) {
            case "Browser" /* BROWSER */:
                // In a browser environment, report the browser name.
                reportedPlatform = _getBrowserName(getUA());
                break;
            case "Worker" /* WORKER */:
                // Technically a worker runs from a browser but we need to differentiate a
                // worker from a browser.
                // For example: Chrome-Worker/JsCore/4.9.1/FirebaseCore-web.
                reportedPlatform = `${_getBrowserName(getUA())}-${clientPlatform}`;
                break;
            default:
                reportedPlatform = clientPlatform;
        }
        const reportedFrameworks = frameworks.length
            ? frameworks.join(',')
            : 'FirebaseCore-web'; /* default value if no other framework is used */
        return `${reportedPlatform}/${"JsCore" /* CORE */}/${SDK_VERSION}/${reportedFrameworks}`;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AuthImpl {
        constructor(app, heartbeatServiceProvider, config) {
            this.app = app;
            this.heartbeatServiceProvider = heartbeatServiceProvider;
            this.config = config;
            this.currentUser = null;
            this.emulatorConfig = null;
            this.operations = Promise.resolve();
            this.authStateSubscription = new Subscription(this);
            this.idTokenSubscription = new Subscription(this);
            this.redirectUser = null;
            this.isProactiveRefreshEnabled = false;
            // Any network calls will set this to true and prevent subsequent emulator
            // initialization
            this._canInitEmulator = true;
            this._isInitialized = false;
            this._deleted = false;
            this._initializationPromise = null;
            this._popupRedirectResolver = null;
            this._errorFactory = _DEFAULT_AUTH_ERROR_FACTORY;
            // Tracks the last notified UID for state change listeners to prevent
            // repeated calls to the callbacks. Undefined means it's never been
            // called, whereas null means it's been called with a signed out user
            this.lastNotifiedUid = undefined;
            this.languageCode = null;
            this.tenantId = null;
            this.settings = { appVerificationDisabledForTesting: false };
            this.frameworks = [];
            this.name = app.name;
            this.clientVersion = config.sdkClientVersion;
        }
        _initializeWithPersistence(persistenceHierarchy, popupRedirectResolver) {
            if (popupRedirectResolver) {
                this._popupRedirectResolver = _getInstance(popupRedirectResolver);
            }
            // Have to check for app deletion throughout initialization (after each
            // promise resolution)
            this._initializationPromise = this.queue(async () => {
                var _a, _b;
                if (this._deleted) {
                    return;
                }
                this.persistenceManager = await PersistenceUserManager.create(this, persistenceHierarchy);
                if (this._deleted) {
                    return;
                }
                // Initialize the resolver early if necessary (only applicable to web:
                // this will cause the iframe to load immediately in certain cases)
                if ((_a = this._popupRedirectResolver) === null || _a === void 0 ? void 0 : _a._shouldInitProactively) {
                    // If this fails, don't halt auth loading
                    try {
                        await this._popupRedirectResolver._initialize(this);
                    }
                    catch (e) { /* Ignore the error */ }
                }
                await this.initializeCurrentUser(popupRedirectResolver);
                this.lastNotifiedUid = ((_b = this.currentUser) === null || _b === void 0 ? void 0 : _b.uid) || null;
                if (this._deleted) {
                    return;
                }
                this._isInitialized = true;
            });
            return this._initializationPromise;
        }
        /**
         * If the persistence is changed in another window, the user manager will let us know
         */
        async _onStorageEvent() {
            if (this._deleted) {
                return;
            }
            const user = await this.assertedPersistence.getCurrentUser();
            if (!this.currentUser && !user) {
                // No change, do nothing (was signed out and remained signed out).
                return;
            }
            // If the same user is to be synchronized.
            if (this.currentUser && user && this.currentUser.uid === user.uid) {
                // Data update, simply copy data changes.
                this._currentUser._assign(user);
                // If tokens changed from previous user tokens, this will trigger
                // notifyAuthListeners_.
                await this.currentUser.getIdToken();
                return;
            }
            // Update current Auth state. Either a new login or logout.
            await this._updateCurrentUser(user);
        }
        async initializeCurrentUser(popupRedirectResolver) {
            var _a;
            // First check to see if we have a pending redirect event.
            let storedUser = (await this.assertedPersistence.getCurrentUser());
            if (popupRedirectResolver && this.config.authDomain) {
                await this.getOrInitRedirectPersistenceManager();
                const redirectUserEventId = (_a = this.redirectUser) === null || _a === void 0 ? void 0 : _a._redirectEventId;
                const storedUserEventId = storedUser === null || storedUser === void 0 ? void 0 : storedUser._redirectEventId;
                const result = await this.tryRedirectSignIn(popupRedirectResolver);
                // If the stored user (i.e. the old "currentUser") has a redirectId that
                // matches the redirect user, then we want to initially sign in with the
                // new user object from result.
                // TODO(samgho): More thoroughly test all of this
                if ((!redirectUserEventId || redirectUserEventId === storedUserEventId) &&
                    (result === null || result === void 0 ? void 0 : result.user)) {
                    storedUser = result.user;
                }
            }
            // If no user in persistence, there is no current user. Set to null.
            if (!storedUser) {
                return this.directlySetCurrentUser(null);
            }
            if (!storedUser._redirectEventId) {
                // This isn't a redirect user, we can reload and bail
                // This will also catch the redirected user, if available, as that method
                // strips the _redirectEventId
                return this.reloadAndSetCurrentUserOrClear(storedUser);
            }
            _assert(this._popupRedirectResolver, this, "argument-error" /* ARGUMENT_ERROR */);
            await this.getOrInitRedirectPersistenceManager();
            // If the redirect user's event ID matches the current user's event ID,
            // DO NOT reload the current user, otherwise they'll be cleared from storage.
            // This is important for the reauthenticateWithRedirect() flow.
            if (this.redirectUser &&
                this.redirectUser._redirectEventId === storedUser._redirectEventId) {
                return this.directlySetCurrentUser(storedUser);
            }
            return this.reloadAndSetCurrentUserOrClear(storedUser);
        }
        async tryRedirectSignIn(redirectResolver) {
            // The redirect user needs to be checked (and signed in if available)
            // during auth initialization. All of the normal sign in and link/reauth
            // flows call back into auth and push things onto the promise queue. We
            // need to await the result of the redirect sign in *inside the promise
            // queue*. This presents a problem: we run into deadlock. See:
            //    ┌> [Initialization] ─────┐
            //    ┌> [<other queue tasks>] │
            //    └─ [getRedirectResult] <─┘
            //    where [] are tasks on the queue and arrows denote awaits
            // Initialization will never complete because it's waiting on something
            // that's waiting for initialization to complete!
            //
            // Instead, this method calls getRedirectResult() (stored in
            // _completeRedirectFn) with an optional parameter that instructs all of
            // the underlying auth operations to skip anything that mutates auth state.
            let result = null;
            try {
                // We know this._popupRedirectResolver is set since redirectResolver
                // is passed in. The _completeRedirectFn expects the unwrapped extern.
                result = await this._popupRedirectResolver._completeRedirectFn(this, redirectResolver, true);
            }
            catch (e) {
                // Swallow any errors here; the code can retrieve them in
                // getRedirectResult().
                await this._setRedirectUser(null);
            }
            return result;
        }
        async reloadAndSetCurrentUserOrClear(user) {
            try {
                await _reloadWithoutSaving(user);
            }
            catch (e) {
                if (e.code !== `auth/${"network-request-failed" /* NETWORK_REQUEST_FAILED */}`) {
                    // Something's wrong with the user's token. Log them out and remove
                    // them from storage
                    return this.directlySetCurrentUser(null);
                }
            }
            return this.directlySetCurrentUser(user);
        }
        useDeviceLanguage() {
            this.languageCode = _getUserLanguage();
        }
        async _delete() {
            this._deleted = true;
        }
        async updateCurrentUser(userExtern) {
            // The public updateCurrentUser method needs to make a copy of the user,
            // and also check that the project matches
            const user = userExtern
                ? getModularInstance(userExtern)
                : null;
            if (user) {
                _assert(user.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token" /* INVALID_AUTH */);
            }
            return this._updateCurrentUser(user && user._clone(this));
        }
        async _updateCurrentUser(user) {
            if (this._deleted) {
                return;
            }
            if (user) {
                _assert(this.tenantId === user.tenantId, this, "tenant-id-mismatch" /* TENANT_ID_MISMATCH */);
            }
            return this.queue(async () => {
                await this.directlySetCurrentUser(user);
                this.notifyAuthListeners();
            });
        }
        async signOut() {
            // Clear the redirect user when signOut is called
            if (this.redirectPersistenceManager || this._popupRedirectResolver) {
                await this._setRedirectUser(null);
            }
            return this._updateCurrentUser(null);
        }
        setPersistence(persistence) {
            return this.queue(async () => {
                await this.assertedPersistence.setPersistence(_getInstance(persistence));
            });
        }
        _getPersistence() {
            return this.assertedPersistence.persistence.type;
        }
        _updateErrorMap(errorMap) {
            this._errorFactory = new ErrorFactory('auth', 'Firebase', errorMap());
        }
        onAuthStateChanged(nextOrObserver, error, completed) {
            return this.registerStateListener(this.authStateSubscription, nextOrObserver, error, completed);
        }
        onIdTokenChanged(nextOrObserver, error, completed) {
            return this.registerStateListener(this.idTokenSubscription, nextOrObserver, error, completed);
        }
        toJSON() {
            var _a;
            return {
                apiKey: this.config.apiKey,
                authDomain: this.config.authDomain,
                appName: this.name,
                currentUser: (_a = this._currentUser) === null || _a === void 0 ? void 0 : _a.toJSON()
            };
        }
        async _setRedirectUser(user, popupRedirectResolver) {
            const redirectManager = await this.getOrInitRedirectPersistenceManager(popupRedirectResolver);
            return user === null
                ? redirectManager.removeCurrentUser()
                : redirectManager.setCurrentUser(user);
        }
        async getOrInitRedirectPersistenceManager(popupRedirectResolver) {
            if (!this.redirectPersistenceManager) {
                const resolver = (popupRedirectResolver && _getInstance(popupRedirectResolver)) ||
                    this._popupRedirectResolver;
                _assert(resolver, this, "argument-error" /* ARGUMENT_ERROR */);
                this.redirectPersistenceManager = await PersistenceUserManager.create(this, [_getInstance(resolver._redirectPersistence)], "redirectUser" /* REDIRECT_USER */);
                this.redirectUser =
                    await this.redirectPersistenceManager.getCurrentUser();
            }
            return this.redirectPersistenceManager;
        }
        async _redirectUserForId(id) {
            var _a, _b;
            // Make sure we've cleared any pending persistence actions if we're not in
            // the initializer
            if (this._isInitialized) {
                await this.queue(async () => { });
            }
            if (((_a = this._currentUser) === null || _a === void 0 ? void 0 : _a._redirectEventId) === id) {
                return this._currentUser;
            }
            if (((_b = this.redirectUser) === null || _b === void 0 ? void 0 : _b._redirectEventId) === id) {
                return this.redirectUser;
            }
            return null;
        }
        async _persistUserIfCurrent(user) {
            if (user === this.currentUser) {
                return this.queue(async () => this.directlySetCurrentUser(user));
            }
        }
        /** Notifies listeners only if the user is current */
        _notifyListenersIfCurrent(user) {
            if (user === this.currentUser) {
                this.notifyAuthListeners();
            }
        }
        _key() {
            return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
        }
        _startProactiveRefresh() {
            this.isProactiveRefreshEnabled = true;
            if (this.currentUser) {
                this._currentUser._startProactiveRefresh();
            }
        }
        _stopProactiveRefresh() {
            this.isProactiveRefreshEnabled = false;
            if (this.currentUser) {
                this._currentUser._stopProactiveRefresh();
            }
        }
        /** Returns the current user cast as the internal type */
        get _currentUser() {
            return this.currentUser;
        }
        notifyAuthListeners() {
            var _a, _b;
            if (!this._isInitialized) {
                return;
            }
            this.idTokenSubscription.next(this.currentUser);
            const currentUid = (_b = (_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : null;
            if (this.lastNotifiedUid !== currentUid) {
                this.lastNotifiedUid = currentUid;
                this.authStateSubscription.next(this.currentUser);
            }
        }
        registerStateListener(subscription, nextOrObserver, error, completed) {
            if (this._deleted) {
                return () => { };
            }
            const cb = typeof nextOrObserver === 'function'
                ? nextOrObserver
                : nextOrObserver.next.bind(nextOrObserver);
            const promise = this._isInitialized
                ? Promise.resolve()
                : this._initializationPromise;
            _assert(promise, this, "internal-error" /* INTERNAL_ERROR */);
            // The callback needs to be called asynchronously per the spec.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            promise.then(() => cb(this.currentUser));
            if (typeof nextOrObserver === 'function') {
                return subscription.addObserver(nextOrObserver, error, completed);
            }
            else {
                return subscription.addObserver(nextOrObserver);
            }
        }
        /**
         * Unprotected (from race conditions) method to set the current user. This
         * should only be called from within a queued callback. This is necessary
         * because the queue shouldn't rely on another queued callback.
         */
        async directlySetCurrentUser(user) {
            if (this.currentUser && this.currentUser !== user) {
                this._currentUser._stopProactiveRefresh();
                if (user && this.isProactiveRefreshEnabled) {
                    user._startProactiveRefresh();
                }
            }
            this.currentUser = user;
            if (user) {
                await this.assertedPersistence.setCurrentUser(user);
            }
            else {
                await this.assertedPersistence.removeCurrentUser();
            }
        }
        queue(action) {
            // In case something errors, the callback still should be called in order
            // to keep the promise chain alive
            this.operations = this.operations.then(action, action);
            return this.operations;
        }
        get assertedPersistence() {
            _assert(this.persistenceManager, this, "internal-error" /* INTERNAL_ERROR */);
            return this.persistenceManager;
        }
        _logFramework(framework) {
            if (!framework || this.frameworks.includes(framework)) {
                return;
            }
            this.frameworks.push(framework);
            // Sort alphabetically so that "FirebaseCore-web,FirebaseUI-web" and
            // "FirebaseUI-web,FirebaseCore-web" aren't viewed as different.
            this.frameworks.sort();
            this.clientVersion = _getClientVersion(this.config.clientPlatform, this._getFrameworks());
        }
        _getFrameworks() {
            return this.frameworks;
        }
        async _getAdditionalHeaders() {
            var _a;
            // Additional headers on every request
            const headers = {
                ["X-Client-Version" /* X_CLIENT_VERSION */]: this.clientVersion,
            };
            if (this.app.options.appId) {
                headers["X-Firebase-gmpid" /* X_FIREBASE_GMPID */] = this.app.options.appId;
            }
            // If the heartbeat service exists, add the heartbeat string
            const heartbeatsHeader = await ((_a = this.heartbeatServiceProvider.getImmediate({
                optional: true,
            })) === null || _a === void 0 ? void 0 : _a.getHeartbeatsHeader());
            if (heartbeatsHeader) {
                headers["X-Firebase-Client" /* X_FIREBASE_CLIENT */] = heartbeatsHeader;
            }
            return headers;
        }
    }
    /**
     * Method to be used to cast down to our private implmentation of Auth.
     * It will also handle unwrapping from the compat type if necessary
     *
     * @param auth Auth object passed in from developer
     */
    function _castAuth(auth) {
        return getModularInstance(auth);
    }
    /** Helper class to wrap subscriber logic */
    class Subscription {
        constructor(auth) {
            this.auth = auth;
            this.observer = null;
            this.addObserver = createSubscribe(observer => (this.observer = observer));
        }
        get next() {
            _assert(this.observer, this.auth, "internal-error" /* INTERNAL_ERROR */);
            return this.observer.next.bind(this.observer);
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Interface that represents the credentials returned by an {@link AuthProvider}.
     *
     * @remarks
     * Implementations specify the details about each auth provider's credential requirements.
     *
     * @public
     */
    class AuthCredential {
        /** @internal */
        constructor(
        /**
         * The authentication provider ID for the credential.
         *
         * @remarks
         * For example, 'facebook.com', or 'google.com'.
         */
        providerId, 
        /**
         * The authentication sign in method for the credential.
         *
         * @remarks
         * For example, {@link SignInMethod}.EMAIL_PASSWORD, or
         * {@link SignInMethod}.EMAIL_LINK. This corresponds to the sign-in method
         * identifier as returned in {@link fetchSignInMethodsForEmail}.
         */
        signInMethod) {
            this.providerId = providerId;
            this.signInMethod = signInMethod;
        }
        /**
         * Returns a JSON-serializable representation of this object.
         *
         * @returns a JSON-serializable representation of this object.
         */
        toJSON() {
            return debugFail('not implemented');
        }
        /** @internal */
        _getIdTokenResponse(_auth) {
            return debugFail('not implemented');
        }
        /** @internal */
        _linkToIdToken(_auth, _idToken) {
            return debugFail('not implemented');
        }
        /** @internal */
        _getReauthenticationResolver(_auth) {
            return debugFail('not implemented');
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function signInWithIdp(auth, request) {
        return _performSignInRequest(auth, "POST" /* POST */, "/v1/accounts:signInWithIdp" /* SIGN_IN_WITH_IDP */, _addTidIfNecessary(auth, request));
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const IDP_REQUEST_URI$1 = 'http://localhost';
    /**
     * Represents the OAuth credentials returned by an {@link OAuthProvider}.
     *
     * @remarks
     * Implementations specify the details about each auth provider's credential requirements.
     *
     * @public
     */
    class OAuthCredential extends AuthCredential {
        constructor() {
            super(...arguments);
            this.pendingToken = null;
        }
        /** @internal */
        static _fromParams(params) {
            const cred = new OAuthCredential(params.providerId, params.signInMethod);
            if (params.idToken || params.accessToken) {
                // OAuth 2 and either ID token or access token.
                if (params.idToken) {
                    cred.idToken = params.idToken;
                }
                if (params.accessToken) {
                    cred.accessToken = params.accessToken;
                }
                // Add nonce if available and no pendingToken is present.
                if (params.nonce && !params.pendingToken) {
                    cred.nonce = params.nonce;
                }
                if (params.pendingToken) {
                    cred.pendingToken = params.pendingToken;
                }
            }
            else if (params.oauthToken && params.oauthTokenSecret) {
                // OAuth 1 and OAuth token with token secret
                cred.accessToken = params.oauthToken;
                cred.secret = params.oauthTokenSecret;
            }
            else {
                _fail("argument-error" /* ARGUMENT_ERROR */);
            }
            return cred;
        }
        /** {@inheritdoc AuthCredential.toJSON}  */
        toJSON() {
            return {
                idToken: this.idToken,
                accessToken: this.accessToken,
                secret: this.secret,
                nonce: this.nonce,
                pendingToken: this.pendingToken,
                providerId: this.providerId,
                signInMethod: this.signInMethod
            };
        }
        /**
         * Static method to deserialize a JSON representation of an object into an
         * {@link  AuthCredential}.
         *
         * @param json - Input can be either Object or the stringified representation of the object.
         * When string is provided, JSON.parse would be called first.
         *
         * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
         */
        static fromJSON(json) {
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            const { providerId, signInMethod } = obj, rest = __rest(obj, ["providerId", "signInMethod"]);
            if (!providerId || !signInMethod) {
                return null;
            }
            const cred = new OAuthCredential(providerId, signInMethod);
            cred.idToken = rest.idToken || undefined;
            cred.accessToken = rest.accessToken || undefined;
            cred.secret = rest.secret;
            cred.nonce = rest.nonce;
            cred.pendingToken = rest.pendingToken || null;
            return cred;
        }
        /** @internal */
        _getIdTokenResponse(auth) {
            const request = this.buildRequest();
            return signInWithIdp(auth, request);
        }
        /** @internal */
        _linkToIdToken(auth, idToken) {
            const request = this.buildRequest();
            request.idToken = idToken;
            return signInWithIdp(auth, request);
        }
        /** @internal */
        _getReauthenticationResolver(auth) {
            const request = this.buildRequest();
            request.autoCreate = false;
            return signInWithIdp(auth, request);
        }
        buildRequest() {
            const request = {
                requestUri: IDP_REQUEST_URI$1,
                returnSecureToken: true
            };
            if (this.pendingToken) {
                request.pendingToken = this.pendingToken;
            }
            else {
                const postBody = {};
                if (this.idToken) {
                    postBody['id_token'] = this.idToken;
                }
                if (this.accessToken) {
                    postBody['access_token'] = this.accessToken;
                }
                if (this.secret) {
                    postBody['oauth_token_secret'] = this.secret;
                }
                postBody['providerId'] = this.providerId;
                if (this.nonce && !this.pendingToken) {
                    postBody['nonce'] = this.nonce;
                }
                request.postBody = querystring(postBody);
            }
            return request;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The base class for all Federated providers (OAuth (including OIDC), SAML).
     *
     * This class is not meant to be instantiated directly.
     *
     * @public
     */
    class FederatedAuthProvider {
        /**
         * Constructor for generic OAuth providers.
         *
         * @param providerId - Provider for which credentials should be generated.
         */
        constructor(providerId) {
            this.providerId = providerId;
            /** @internal */
            this.defaultLanguageCode = null;
            /** @internal */
            this.customParameters = {};
        }
        /**
         * Set the language gode.
         *
         * @param languageCode - language code
         */
        setDefaultLanguage(languageCode) {
            this.defaultLanguageCode = languageCode;
        }
        /**
         * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
         * operations.
         *
         * @remarks
         * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
         * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
         *
         * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
         */
        setCustomParameters(customOAuthParameters) {
            this.customParameters = customOAuthParameters;
            return this;
        }
        /**
         * Retrieve the current list of {@link CustomParameters}.
         */
        getCustomParameters() {
            return this.customParameters;
        }
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Common code to all OAuth providers. This is separate from the
     * {@link OAuthProvider} so that child providers (like
     * {@link GoogleAuthProvider}) don't inherit the `credential` instance method.
     * Instead, they rely on a static `credential` method.
     */
    class BaseOAuthProvider extends FederatedAuthProvider {
        constructor() {
            super(...arguments);
            /** @internal */
            this.scopes = [];
        }
        /**
         * Add an OAuth scope to the credential.
         *
         * @param scope - Provider OAuth scope to add.
         */
        addScope(scope) {
            // If not already added, add scope to list.
            if (!this.scopes.includes(scope)) {
                this.scopes.push(scope);
            }
            return this;
        }
        /**
         * Retrieve the current list of OAuth scopes.
         */
        getScopes() {
            return [...this.scopes];
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.FACEBOOK.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new FacebookAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('user_birthday');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Facebook Access Token.
     *   const credential = FacebookAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new FacebookAuthProvider();
     * provider.addScope('user_birthday');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Facebook Access Token.
     * const credential = FacebookAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     *
     * @public
     */
    class FacebookAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("facebook.com" /* FACEBOOK */);
        }
        /**
         * Creates a credential for Facebook.
         *
         * @example
         * ```javascript
         * // `event` from the Facebook auth.authResponseChange callback.
         * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
         * const result = await signInWithCredential(credential);
         * ```
         *
         * @param accessToken - Facebook access token.
         */
        static credential(accessToken) {
            return OAuthCredential._fromParams({
                providerId: FacebookAuthProvider.PROVIDER_ID,
                signInMethod: FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return FacebookAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return FacebookAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
                return null;
            }
            if (!tokenResponse.oauthAccessToken) {
                return null;
            }
            try {
                return FacebookAuthProvider.credential(tokenResponse.oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.FACEBOOK. */
    FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD = "facebook.com" /* FACEBOOK */;
    /** Always set to {@link ProviderId}.FACEBOOK. */
    FacebookAuthProvider.PROVIDER_ID = "facebook.com" /* FACEBOOK */;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for generating an an {@link OAuthCredential} for {@link ProviderId}.GOOGLE.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new GoogleAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('profile');
     * provider.addScope('email');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Google Access Token.
     *   const credential = GoogleAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new GoogleAuthProvider();
     * provider.addScope('profile');
     * provider.addScope('email');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Google Access Token.
     * const credential = GoogleAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     *
     * @public
     */
    class GoogleAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("google.com" /* GOOGLE */);
            this.addScope('profile');
        }
        /**
         * Creates a credential for Google. At least one of ID token and access token is required.
         *
         * @example
         * ```javascript
         * // \`googleUser\` from the onsuccess Google Sign In callback.
         * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
         * const result = await signInWithCredential(credential);
         * ```
         *
         * @param idToken - Google ID token.
         * @param accessToken - Google access token.
         */
        static credential(idToken, accessToken) {
            return OAuthCredential._fromParams({
                providerId: GoogleAuthProvider.PROVIDER_ID,
                signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
                idToken,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return GoogleAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return GoogleAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse) {
                return null;
            }
            const { oauthIdToken, oauthAccessToken } = tokenResponse;
            if (!oauthIdToken && !oauthAccessToken) {
                // This could be an oauth 1 credential or a phone credential
                return null;
            }
            try {
                return GoogleAuthProvider.credential(oauthIdToken, oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.GOOGLE. */
    GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD = "google.com" /* GOOGLE */;
    /** Always set to {@link ProviderId}.GOOGLE. */
    GoogleAuthProvider.PROVIDER_ID = "google.com" /* GOOGLE */;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.GITHUB.
     *
     * @remarks
     * GitHub requires an OAuth 2.0 redirect, so you can either handle the redirect directly, or use
     * the {@link signInWithPopup} handler:
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new GithubAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * provider.addScope('repo');
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Github Access Token.
     *   const credential = GithubAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new GithubAuthProvider();
     * provider.addScope('repo');
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Github Access Token.
     * const credential = GithubAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * ```
     * @public
     */
    class GithubAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("github.com" /* GITHUB */);
        }
        /**
         * Creates a credential for Github.
         *
         * @param accessToken - Github access token.
         */
        static credential(accessToken) {
            return OAuthCredential._fromParams({
                providerId: GithubAuthProvider.PROVIDER_ID,
                signInMethod: GithubAuthProvider.GITHUB_SIGN_IN_METHOD,
                accessToken
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return GithubAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return GithubAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse || !('oauthAccessToken' in tokenResponse)) {
                return null;
            }
            if (!tokenResponse.oauthAccessToken) {
                return null;
            }
            try {
                return GithubAuthProvider.credential(tokenResponse.oauthAccessToken);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.GITHUB. */
    GithubAuthProvider.GITHUB_SIGN_IN_METHOD = "github.com" /* GITHUB */;
    /** Always set to {@link ProviderId}.GITHUB. */
    GithubAuthProvider.PROVIDER_ID = "github.com" /* GITHUB */;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Provider for generating an {@link OAuthCredential} for {@link ProviderId}.TWITTER.
     *
     * @example
     * ```javascript
     * // Sign in using a redirect.
     * const provider = new TwitterAuthProvider();
     * // Start a sign in process for an unauthenticated user.
     * await signInWithRedirect(auth, provider);
     * // This will trigger a full page redirect away from your app
     *
     * // After returning from the redirect when your app initializes you can obtain the result
     * const result = await getRedirectResult(auth);
     * if (result) {
     *   // This is the signed-in user
     *   const user = result.user;
     *   // This gives you a Twitter Access Token and Secret.
     *   const credential = TwitterAuthProvider.credentialFromResult(result);
     *   const token = credential.accessToken;
     *   const secret = credential.secret;
     * }
     * ```
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new TwitterAuthProvider();
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Twitter Access Token and Secret.
     * const credential = TwitterAuthProvider.credentialFromResult(result);
     * const token = credential.accessToken;
     * const secret = credential.secret;
     * ```
     *
     * @public
     */
    class TwitterAuthProvider extends BaseOAuthProvider {
        constructor() {
            super("twitter.com" /* TWITTER */);
        }
        /**
         * Creates a credential for Twitter.
         *
         * @param token - Twitter access token.
         * @param secret - Twitter secret.
         */
        static credential(token, secret) {
            return OAuthCredential._fromParams({
                providerId: TwitterAuthProvider.PROVIDER_ID,
                signInMethod: TwitterAuthProvider.TWITTER_SIGN_IN_METHOD,
                oauthToken: token,
                oauthTokenSecret: secret
            });
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromResult(userCredential) {
            return TwitterAuthProvider.credentialFromTaggedObject(userCredential);
        }
        /**
         * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
         * thrown during a sign-in, link, or reauthenticate operation.
         *
         * @param userCredential - The user credential.
         */
        static credentialFromError(error) {
            return TwitterAuthProvider.credentialFromTaggedObject((error.customData || {}));
        }
        static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
            if (!tokenResponse) {
                return null;
            }
            const { oauthAccessToken, oauthTokenSecret } = tokenResponse;
            if (!oauthAccessToken || !oauthTokenSecret) {
                return null;
            }
            try {
                return TwitterAuthProvider.credential(oauthAccessToken, oauthTokenSecret);
            }
            catch (_a) {
                return null;
            }
        }
    }
    /** Always set to {@link SignInMethod}.TWITTER. */
    TwitterAuthProvider.TWITTER_SIGN_IN_METHOD = "twitter.com" /* TWITTER */;
    /** Always set to {@link ProviderId}.TWITTER. */
    TwitterAuthProvider.PROVIDER_ID = "twitter.com" /* TWITTER */;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class UserCredentialImpl {
        constructor(params) {
            this.user = params.user;
            this.providerId = params.providerId;
            this._tokenResponse = params._tokenResponse;
            this.operationType = params.operationType;
        }
        static async _fromIdTokenResponse(auth, operationType, idTokenResponse, isAnonymous = false) {
            const user = await UserImpl._fromIdTokenResponse(auth, idTokenResponse, isAnonymous);
            const providerId = providerIdForResponse(idTokenResponse);
            const userCred = new UserCredentialImpl({
                user,
                providerId,
                _tokenResponse: idTokenResponse,
                operationType
            });
            return userCred;
        }
        static async _forOperation(user, operationType, response) {
            await user._updateTokensIfNecessary(response, /* reload */ true);
            const providerId = providerIdForResponse(response);
            return new UserCredentialImpl({
                user,
                providerId,
                _tokenResponse: response,
                operationType
            });
        }
    }
    function providerIdForResponse(response) {
        if (response.providerId) {
            return response.providerId;
        }
        if ('phoneNumber' in response) {
            return "phone" /* PHONE */;
        }
        return null;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class MultiFactorError extends FirebaseError {
        constructor(auth, error, operationType, user) {
            var _a;
            super(error.code, error.message);
            this.operationType = operationType;
            this.user = user;
            // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
            Object.setPrototypeOf(this, MultiFactorError.prototype);
            this.customData = {
                appName: auth.name,
                tenantId: (_a = auth.tenantId) !== null && _a !== void 0 ? _a : undefined,
                _serverResponse: error.customData._serverResponse,
                operationType,
            };
        }
        static _fromErrorAndOperation(auth, error, operationType, user) {
            return new MultiFactorError(auth, error, operationType, user);
        }
    }
    function _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user) {
        const idTokenProvider = operationType === "reauthenticate" /* REAUTHENTICATE */
            ? credential._getReauthenticationResolver(auth)
            : credential._getIdTokenResponse(auth);
        return idTokenProvider.catch(error => {
            if (error.code === `auth/${"multi-factor-auth-required" /* MFA_REQUIRED */}`) {
                throw MultiFactorError._fromErrorAndOperation(auth, error, operationType, user);
            }
            throw error;
        });
    }
    async function _link$1(user, credential, bypassAuthState = false) {
        const response = await _logoutIfInvalidated(user, credential._linkToIdToken(user.auth, await user.getIdToken()), bypassAuthState);
        return UserCredentialImpl._forOperation(user, "link" /* LINK */, response);
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function _reauthenticate(user, credential, bypassAuthState = false) {
        const { auth } = user;
        const operationType = "reauthenticate" /* REAUTHENTICATE */;
        try {
            const response = await _logoutIfInvalidated(user, _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential, user), bypassAuthState);
            _assert(response.idToken, auth, "internal-error" /* INTERNAL_ERROR */);
            const parsed = _parseToken(response.idToken);
            _assert(parsed, auth, "internal-error" /* INTERNAL_ERROR */);
            const { sub: localId } = parsed;
            _assert(user.uid === localId, auth, "user-mismatch" /* USER_MISMATCH */);
            return UserCredentialImpl._forOperation(user, operationType, response);
        }
        catch (e) {
            // Convert user deleted error into user mismatch
            if ((e === null || e === void 0 ? void 0 : e.code) === `auth/${"user-not-found" /* USER_DELETED */}`) {
                _fail(auth, "user-mismatch" /* USER_MISMATCH */);
            }
            throw e;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function _signInWithCredential(auth, credential, bypassAuthState = false) {
        const operationType = "signIn" /* SIGN_IN */;
        const response = await _processCredentialSavingMfaContextIfNecessary(auth, operationType, credential);
        const userCredential = await UserCredentialImpl._fromIdTokenResponse(auth, operationType, response);
        if (!bypassAuthState) {
            await auth._updateCurrentUser(userCredential.user);
        }
        return userCredential;
    }
    /**
     * Adds an observer for changes to the user's sign-in state.
     *
     * @remarks
     * To keep the old behavior, see {@link onIdTokenChanged}.
     *
     * @param auth - The {@link Auth} instance.
     * @param nextOrObserver - callback triggered on change.
     * @param error - callback triggered on error.
     * @param completed - callback triggered when observer is removed.
     *
     * @public
     */
    function onAuthStateChanged(auth, nextOrObserver, error, completed) {
        return getModularInstance(auth).onAuthStateChanged(nextOrObserver, error, completed);
    }

    const STORAGE_AVAILABLE_KEY = '__sak';

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // There are two different browser persistence types: local and session.
    // Both have the same implementation but use a different underlying storage
    // object.
    class BrowserPersistenceClass {
        constructor(storageRetriever, type) {
            this.storageRetriever = storageRetriever;
            this.type = type;
        }
        _isAvailable() {
            try {
                if (!this.storage) {
                    return Promise.resolve(false);
                }
                this.storage.setItem(STORAGE_AVAILABLE_KEY, '1');
                this.storage.removeItem(STORAGE_AVAILABLE_KEY);
                return Promise.resolve(true);
            }
            catch (_a) {
                return Promise.resolve(false);
            }
        }
        _set(key, value) {
            this.storage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        }
        _get(key) {
            const json = this.storage.getItem(key);
            return Promise.resolve(json ? JSON.parse(json) : null);
        }
        _remove(key) {
            this.storage.removeItem(key);
            return Promise.resolve();
        }
        get storage() {
            return this.storageRetriever();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _iframeCannotSyncWebStorage() {
        const ua = getUA();
        return _isSafari(ua) || _isIOS(ua);
    }
    // The polling period in case events are not supported
    const _POLLING_INTERVAL_MS$1 = 1000;
    // The IE 10 localStorage cross tab synchronization delay in milliseconds
    const IE10_LOCAL_STORAGE_SYNC_DELAY = 10;
    class BrowserLocalPersistence extends BrowserPersistenceClass {
        constructor() {
            super(() => window.localStorage, "LOCAL" /* LOCAL */);
            this.boundEventHandler = (event, poll) => this.onStorageEvent(event, poll);
            this.listeners = {};
            this.localCache = {};
            // setTimeout return value is platform specific
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.pollTimer = null;
            // Safari or iOS browser and embedded in an iframe.
            this.safariLocalStorageNotSynced = _iframeCannotSyncWebStorage() && _isIframe();
            // Whether to use polling instead of depending on window events
            this.fallbackToPolling = _isMobileBrowser();
            this._shouldAllowMigration = true;
        }
        forAllChangedKeys(cb) {
            // Check all keys with listeners on them.
            for (const key of Object.keys(this.listeners)) {
                // Get value from localStorage.
                const newValue = this.storage.getItem(key);
                const oldValue = this.localCache[key];
                // If local map value does not match, trigger listener with storage event.
                // Differentiate this simulated event from the real storage event.
                if (newValue !== oldValue) {
                    cb(key, oldValue, newValue);
                }
            }
        }
        onStorageEvent(event, poll = false) {
            // Key would be null in some situations, like when localStorage is cleared
            if (!event.key) {
                this.forAllChangedKeys((key, _oldValue, newValue) => {
                    this.notifyListeners(key, newValue);
                });
                return;
            }
            const key = event.key;
            // Check the mechanism how this event was detected.
            // The first event will dictate the mechanism to be used.
            if (poll) {
                // Environment detects storage changes via polling.
                // Remove storage event listener to prevent possible event duplication.
                this.detachListener();
            }
            else {
                // Environment detects storage changes via storage event listener.
                // Remove polling listener to prevent possible event duplication.
                this.stopPolling();
            }
            // Safari embedded iframe. Storage event will trigger with the delta
            // changes but no changes will be applied to the iframe localStorage.
            if (this.safariLocalStorageNotSynced) {
                // Get current iframe page value.
                const storedValue = this.storage.getItem(key);
                // Value not synchronized, synchronize manually.
                if (event.newValue !== storedValue) {
                    if (event.newValue !== null) {
                        // Value changed from current value.
                        this.storage.setItem(key, event.newValue);
                    }
                    else {
                        // Current value deleted.
                        this.storage.removeItem(key);
                    }
                }
                else if (this.localCache[key] === event.newValue && !poll) {
                    // Already detected and processed, do not trigger listeners again.
                    return;
                }
            }
            const triggerListeners = () => {
                // Keep local map up to date in case storage event is triggered before
                // poll.
                const storedValue = this.storage.getItem(key);
                if (!poll && this.localCache[key] === storedValue) {
                    // Real storage event which has already been detected, do nothing.
                    // This seems to trigger in some IE browsers for some reason.
                    return;
                }
                this.notifyListeners(key, storedValue);
            };
            const storedValue = this.storage.getItem(key);
            if (_isIE10() &&
                storedValue !== event.newValue &&
                event.newValue !== event.oldValue) {
                // IE 10 has this weird bug where a storage event would trigger with the
                // correct key, oldValue and newValue but localStorage.getItem(key) does
                // not yield the updated value until a few milliseconds. This ensures
                // this recovers from that situation.
                setTimeout(triggerListeners, IE10_LOCAL_STORAGE_SYNC_DELAY);
            }
            else {
                triggerListeners();
            }
        }
        notifyListeners(key, value) {
            this.localCache[key] = value;
            const listeners = this.listeners[key];
            if (listeners) {
                for (const listener of Array.from(listeners)) {
                    listener(value ? JSON.parse(value) : value);
                }
            }
        }
        startPolling() {
            this.stopPolling();
            this.pollTimer = setInterval(() => {
                this.forAllChangedKeys((key, oldValue, newValue) => {
                    this.onStorageEvent(new StorageEvent('storage', {
                        key,
                        oldValue,
                        newValue
                    }), 
                    /* poll */ true);
                });
            }, _POLLING_INTERVAL_MS$1);
        }
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }
        attachListener() {
            window.addEventListener('storage', this.boundEventHandler);
        }
        detachListener() {
            window.removeEventListener('storage', this.boundEventHandler);
        }
        _addListener(key, listener) {
            if (Object.keys(this.listeners).length === 0) {
                // Whether browser can detect storage event when it had already been pushed to the background.
                // This may happen in some mobile browsers. A localStorage change in the foreground window
                // will not be detected in the background window via the storage event.
                // This was detected in iOS 7.x mobile browsers
                if (this.fallbackToPolling) {
                    this.startPolling();
                }
                else {
                    this.attachListener();
                }
            }
            if (!this.listeners[key]) {
                this.listeners[key] = new Set();
                // Populate the cache to avoid spuriously triggering on first poll.
                this.localCache[key] = this.storage.getItem(key);
            }
            this.listeners[key].add(listener);
        }
        _removeListener(key, listener) {
            if (this.listeners[key]) {
                this.listeners[key].delete(listener);
                if (this.listeners[key].size === 0) {
                    delete this.listeners[key];
                }
            }
            if (Object.keys(this.listeners).length === 0) {
                this.detachListener();
                this.stopPolling();
            }
        }
        // Update local cache on base operations:
        async _set(key, value) {
            await super._set(key, value);
            this.localCache[key] = JSON.stringify(value);
        }
        async _get(key) {
            const value = await super._get(key);
            this.localCache[key] = JSON.stringify(value);
            return value;
        }
        async _remove(key) {
            await super._remove(key);
            delete this.localCache[key];
        }
    }
    BrowserLocalPersistence.type = 'LOCAL';
    /**
     * An implementation of {@link Persistence} of type `LOCAL` using `localStorage`
     * for the underlying storage.
     *
     * @public
     */
    const browserLocalPersistence = BrowserLocalPersistence;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class BrowserSessionPersistence extends BrowserPersistenceClass {
        constructor() {
            super(() => window.sessionStorage, "SESSION" /* SESSION */);
        }
        _addListener(_key, _listener) {
            // Listeners are not supported for session storage since it cannot be shared across windows
            return;
        }
        _removeListener(_key, _listener) {
            // Listeners are not supported for session storage since it cannot be shared across windows
            return;
        }
    }
    BrowserSessionPersistence.type = 'SESSION';
    /**
     * An implementation of {@link Persistence} of `SESSION` using `sessionStorage`
     * for the underlying storage.
     *
     * @public
     */
    const browserSessionPersistence = BrowserSessionPersistence;

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Shim for Promise.allSettled, note the slightly different format of `fulfilled` vs `status`.
     *
     * @param promises - Array of promises to wait on.
     */
    function _allSettled(promises) {
        return Promise.all(promises.map(async (promise) => {
            try {
                const value = await promise;
                return {
                    fulfilled: true,
                    value
                };
            }
            catch (reason) {
                return {
                    fulfilled: false,
                    reason
                };
            }
        }));
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Interface class for receiving messages.
     *
     */
    class Receiver {
        constructor(eventTarget) {
            this.eventTarget = eventTarget;
            this.handlersMap = {};
            this.boundEventHandler = this.handleEvent.bind(this);
        }
        /**
         * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
         *
         * @param eventTarget - An event target (such as window or self) through which the underlying
         * messages will be received.
         */
        static _getInstance(eventTarget) {
            // The results are stored in an array since objects can't be keys for other
            // objects. In addition, setting a unique property on an event target as a
            // hash map key may not be allowed due to CORS restrictions.
            const existingInstance = this.receivers.find(receiver => receiver.isListeningto(eventTarget));
            if (existingInstance) {
                return existingInstance;
            }
            const newInstance = new Receiver(eventTarget);
            this.receivers.push(newInstance);
            return newInstance;
        }
        isListeningto(eventTarget) {
            return this.eventTarget === eventTarget;
        }
        /**
         * Fans out a MessageEvent to the appropriate listeners.
         *
         * @remarks
         * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
         * finished processing.
         *
         * @param event - The MessageEvent.
         *
         */
        async handleEvent(event) {
            const messageEvent = event;
            const { eventId, eventType, data } = messageEvent.data;
            const handlers = this.handlersMap[eventType];
            if (!(handlers === null || handlers === void 0 ? void 0 : handlers.size)) {
                return;
            }
            messageEvent.ports[0].postMessage({
                status: "ack" /* ACK */,
                eventId,
                eventType
            });
            const promises = Array.from(handlers).map(async (handler) => handler(messageEvent.origin, data));
            const response = await _allSettled(promises);
            messageEvent.ports[0].postMessage({
                status: "done" /* DONE */,
                eventId,
                eventType,
                response
            });
        }
        /**
         * Subscribe an event handler for a particular event.
         *
         * @param eventType - Event name to subscribe to.
         * @param eventHandler - The event handler which should receive the events.
         *
         */
        _subscribe(eventType, eventHandler) {
            if (Object.keys(this.handlersMap).length === 0) {
                this.eventTarget.addEventListener('message', this.boundEventHandler);
            }
            if (!this.handlersMap[eventType]) {
                this.handlersMap[eventType] = new Set();
            }
            this.handlersMap[eventType].add(eventHandler);
        }
        /**
         * Unsubscribe an event handler from a particular event.
         *
         * @param eventType - Event name to unsubscribe from.
         * @param eventHandler - Optinoal event handler, if none provided, unsubscribe all handlers on this event.
         *
         */
        _unsubscribe(eventType, eventHandler) {
            if (this.handlersMap[eventType] && eventHandler) {
                this.handlersMap[eventType].delete(eventHandler);
            }
            if (!eventHandler || this.handlersMap[eventType].size === 0) {
                delete this.handlersMap[eventType];
            }
            if (Object.keys(this.handlersMap).length === 0) {
                this.eventTarget.removeEventListener('message', this.boundEventHandler);
            }
        }
    }
    Receiver.receivers = [];

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _generateEventId(prefix = '', digits = 10) {
        let random = '';
        for (let i = 0; i < digits; i++) {
            random += Math.floor(Math.random() * 10);
        }
        return prefix + random;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Interface for sending messages and waiting for a completion response.
     *
     */
    class Sender {
        constructor(target) {
            this.target = target;
            this.handlers = new Set();
        }
        /**
         * Unsubscribe the handler and remove it from our tracking Set.
         *
         * @param handler - The handler to unsubscribe.
         */
        removeMessageHandler(handler) {
            if (handler.messageChannel) {
                handler.messageChannel.port1.removeEventListener('message', handler.onMessage);
                handler.messageChannel.port1.close();
            }
            this.handlers.delete(handler);
        }
        /**
         * Send a message to the Receiver located at {@link target}.
         *
         * @remarks
         * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
         * receiver has had a chance to fully process the event.
         *
         * @param eventType - Type of event to send.
         * @param data - The payload of the event.
         * @param timeout - Timeout for waiting on an ACK from the receiver.
         *
         * @returns An array of settled promises from all the handlers that were listening on the receiver.
         */
        async _send(eventType, data, timeout = 50 /* ACK */) {
            const messageChannel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null;
            if (!messageChannel) {
                throw new Error("connection_unavailable" /* CONNECTION_UNAVAILABLE */);
            }
            // Node timers and browser timers return fundamentally different types.
            // We don't actually care what the value is but TS won't accept unknown and
            // we can't cast properly in both environments.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let completionTimer;
            let handler;
            return new Promise((resolve, reject) => {
                const eventId = _generateEventId('', 20);
                messageChannel.port1.start();
                const ackTimer = setTimeout(() => {
                    reject(new Error("unsupported_event" /* UNSUPPORTED_EVENT */));
                }, timeout);
                handler = {
                    messageChannel,
                    onMessage(event) {
                        const messageEvent = event;
                        if (messageEvent.data.eventId !== eventId) {
                            return;
                        }
                        switch (messageEvent.data.status) {
                            case "ack" /* ACK */:
                                // The receiver should ACK first.
                                clearTimeout(ackTimer);
                                completionTimer = setTimeout(() => {
                                    reject(new Error("timeout" /* TIMEOUT */));
                                }, 3000 /* COMPLETION */);
                                break;
                            case "done" /* DONE */:
                                // Once the receiver's handlers are finished we will get the results.
                                clearTimeout(completionTimer);
                                resolve(messageEvent.data.response);
                                break;
                            default:
                                clearTimeout(ackTimer);
                                clearTimeout(completionTimer);
                                reject(new Error("invalid_response" /* INVALID_RESPONSE */));
                                break;
                        }
                    }
                };
                this.handlers.add(handler);
                messageChannel.port1.addEventListener('message', handler.onMessage);
                this.target.postMessage({
                    eventType,
                    eventId,
                    data
                }, [messageChannel.port2]);
            }).finally(() => {
                if (handler) {
                    this.removeMessageHandler(handler);
                }
            });
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Lazy accessor for window, since the compat layer won't tree shake this out,
     * we need to make sure not to mess with window unless we have to
     */
    function _window() {
        return window;
    }
    function _setWindowLocation(url) {
        _window().location.href = url;
    }

    /**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function _isWorker() {
        return (typeof _window()['WorkerGlobalScope'] !== 'undefined' &&
            typeof _window()['importScripts'] === 'function');
    }
    async function _getActiveServiceWorker() {
        if (!(navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker)) {
            return null;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            return registration.active;
        }
        catch (_a) {
            return null;
        }
    }
    function _getServiceWorkerController() {
        var _a;
        return ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) || null;
    }
    function _getWorkerGlobalScope() {
        return _isWorker() ? self : null;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DB_NAME = 'firebaseLocalStorageDb';
    const DB_VERSION = 1;
    const DB_OBJECTSTORE_NAME = 'firebaseLocalStorage';
    const DB_DATA_KEYPATH = 'fbase_key';
    /**
     * Promise wrapper for IDBRequest
     *
     * Unfortunately we can't cleanly extend Promise<T> since promises are not callable in ES6
     *
     */
    class DBPromise {
        constructor(request) {
            this.request = request;
        }
        toPromise() {
            return new Promise((resolve, reject) => {
                this.request.addEventListener('success', () => {
                    resolve(this.request.result);
                });
                this.request.addEventListener('error', () => {
                    reject(this.request.error);
                });
            });
        }
    }
    function getObjectStore(db, isReadWrite) {
        return db
            .transaction([DB_OBJECTSTORE_NAME], isReadWrite ? 'readwrite' : 'readonly')
            .objectStore(DB_OBJECTSTORE_NAME);
    }
    function _deleteDatabase() {
        const request = indexedDB.deleteDatabase(DB_NAME);
        return new DBPromise(request).toPromise();
    }
    function _openDatabase() {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        return new Promise((resolve, reject) => {
            request.addEventListener('error', () => {
                reject(request.error);
            });
            request.addEventListener('upgradeneeded', () => {
                const db = request.result;
                try {
                    db.createObjectStore(DB_OBJECTSTORE_NAME, { keyPath: DB_DATA_KEYPATH });
                }
                catch (e) {
                    reject(e);
                }
            });
            request.addEventListener('success', async () => {
                const db = request.result;
                // Strange bug that occurs in Firefox when multiple tabs are opened at the
                // same time. The only way to recover seems to be deleting the database
                // and re-initializing it.
                // https://github.com/firebase/firebase-js-sdk/issues/634
                if (!db.objectStoreNames.contains(DB_OBJECTSTORE_NAME)) {
                    // Need to close the database or else you get a `blocked` event
                    db.close();
                    await _deleteDatabase();
                    resolve(await _openDatabase());
                }
                else {
                    resolve(db);
                }
            });
        });
    }
    async function _putObject(db, key, value) {
        const request = getObjectStore(db, true).put({
            [DB_DATA_KEYPATH]: key,
            value
        });
        return new DBPromise(request).toPromise();
    }
    async function getObject(db, key) {
        const request = getObjectStore(db, false).get(key);
        const data = await new DBPromise(request).toPromise();
        return data === undefined ? null : data.value;
    }
    function _deleteObject(db, key) {
        const request = getObjectStore(db, true).delete(key);
        return new DBPromise(request).toPromise();
    }
    const _POLLING_INTERVAL_MS = 800;
    const _TRANSACTION_RETRY_COUNT = 3;
    class IndexedDBLocalPersistence {
        constructor() {
            this.type = "LOCAL" /* LOCAL */;
            this._shouldAllowMigration = true;
            this.listeners = {};
            this.localCache = {};
            // setTimeout return value is platform specific
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.pollTimer = null;
            this.pendingWrites = 0;
            this.receiver = null;
            this.sender = null;
            this.serviceWorkerReceiverAvailable = false;
            this.activeServiceWorker = null;
            // Fire & forget the service worker registration as it may never resolve
            this._workerInitializationPromise =
                this.initializeServiceWorkerMessaging().then(() => { }, () => { });
        }
        async _openDb() {
            if (this.db) {
                return this.db;
            }
            this.db = await _openDatabase();
            return this.db;
        }
        async _withRetries(op) {
            let numAttempts = 0;
            while (true) {
                try {
                    const db = await this._openDb();
                    return await op(db);
                }
                catch (e) {
                    if (numAttempts++ > _TRANSACTION_RETRY_COUNT) {
                        throw e;
                    }
                    if (this.db) {
                        this.db.close();
                        this.db = undefined;
                    }
                    // TODO: consider adding exponential backoff
                }
            }
        }
        /**
         * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
         * postMessage interface to send these events to the worker ourselves.
         */
        async initializeServiceWorkerMessaging() {
            return _isWorker() ? this.initializeReceiver() : this.initializeSender();
        }
        /**
         * As the worker we should listen to events from the main window.
         */
        async initializeReceiver() {
            this.receiver = Receiver._getInstance(_getWorkerGlobalScope());
            // Refresh from persistence if we receive a KeyChanged message.
            this.receiver._subscribe("keyChanged" /* KEY_CHANGED */, async (_origin, data) => {
                const keys = await this._poll();
                return {
                    keyProcessed: keys.includes(data.key)
                };
            });
            // Let the sender know that we are listening so they give us more timeout.
            this.receiver._subscribe("ping" /* PING */, async (_origin, _data) => {
                return ["keyChanged" /* KEY_CHANGED */];
            });
        }
        /**
         * As the main window, we should let the worker know when keys change (set and remove).
         *
         * @remarks
         * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
         * may not resolve.
         */
        async initializeSender() {
            var _a, _b;
            // Check to see if there's an active service worker.
            this.activeServiceWorker = await _getActiveServiceWorker();
            if (!this.activeServiceWorker) {
                return;
            }
            this.sender = new Sender(this.activeServiceWorker);
            // Ping the service worker to check what events they can handle.
            const results = await this.sender._send("ping" /* PING */, {}, 800 /* LONG_ACK */);
            if (!results) {
                return;
            }
            if (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.fulfilled) &&
                ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.value.includes("keyChanged" /* KEY_CHANGED */))) {
                this.serviceWorkerReceiverAvailable = true;
            }
        }
        /**
         * Let the worker know about a changed key, the exact key doesn't technically matter since the
         * worker will just trigger a full sync anyway.
         *
         * @remarks
         * For now, we only support one service worker per page.
         *
         * @param key - Storage key which changed.
         */
        async notifyServiceWorker(key) {
            if (!this.sender ||
                !this.activeServiceWorker ||
                _getServiceWorkerController() !== this.activeServiceWorker) {
                return;
            }
            try {
                await this.sender._send("keyChanged" /* KEY_CHANGED */, { key }, 
                // Use long timeout if receiver has previously responded to a ping from us.
                this.serviceWorkerReceiverAvailable
                    ? 800 /* LONG_ACK */
                    : 50 /* ACK */);
            }
            catch (_a) {
                // This is a best effort approach. Ignore errors.
            }
        }
        async _isAvailable() {
            try {
                if (!indexedDB) {
                    return false;
                }
                const db = await _openDatabase();
                await _putObject(db, STORAGE_AVAILABLE_KEY, '1');
                await _deleteObject(db, STORAGE_AVAILABLE_KEY);
                return true;
            }
            catch (_a) { }
            return false;
        }
        async _withPendingWrite(write) {
            this.pendingWrites++;
            try {
                await write();
            }
            finally {
                this.pendingWrites--;
            }
        }
        async _set(key, value) {
            return this._withPendingWrite(async () => {
                await this._withRetries((db) => _putObject(db, key, value));
                this.localCache[key] = value;
                return this.notifyServiceWorker(key);
            });
        }
        async _get(key) {
            const obj = (await this._withRetries((db) => getObject(db, key)));
            this.localCache[key] = obj;
            return obj;
        }
        async _remove(key) {
            return this._withPendingWrite(async () => {
                await this._withRetries((db) => _deleteObject(db, key));
                delete this.localCache[key];
                return this.notifyServiceWorker(key);
            });
        }
        async _poll() {
            // TODO: check if we need to fallback if getAll is not supported
            const result = await this._withRetries((db) => {
                const getAllRequest = getObjectStore(db, false).getAll();
                return new DBPromise(getAllRequest).toPromise();
            });
            if (!result) {
                return [];
            }
            // If we have pending writes in progress abort, we'll get picked up on the next poll
            if (this.pendingWrites !== 0) {
                return [];
            }
            const keys = [];
            const keysInResult = new Set();
            for (const { fbase_key: key, value } of result) {
                keysInResult.add(key);
                if (JSON.stringify(this.localCache[key]) !== JSON.stringify(value)) {
                    this.notifyListeners(key, value);
                    keys.push(key);
                }
            }
            for (const localKey of Object.keys(this.localCache)) {
                if (this.localCache[localKey] && !keysInResult.has(localKey)) {
                    // Deleted
                    this.notifyListeners(localKey, null);
                    keys.push(localKey);
                }
            }
            return keys;
        }
        notifyListeners(key, newValue) {
            this.localCache[key] = newValue;
            const listeners = this.listeners[key];
            if (listeners) {
                for (const listener of Array.from(listeners)) {
                    listener(newValue);
                }
            }
        }
        startPolling() {
            this.stopPolling();
            this.pollTimer = setInterval(async () => this._poll(), _POLLING_INTERVAL_MS);
        }
        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        }
        _addListener(key, listener) {
            if (Object.keys(this.listeners).length === 0) {
                this.startPolling();
            }
            if (!this.listeners[key]) {
                this.listeners[key] = new Set();
                // Populate the cache to avoid spuriously triggering on first poll.
                void this._get(key); // This can happen in the background async and we can return immediately.
            }
            this.listeners[key].add(listener);
        }
        _removeListener(key, listener) {
            if (this.listeners[key]) {
                this.listeners[key].delete(listener);
                if (this.listeners[key].size === 0) {
                    delete this.listeners[key];
                }
            }
            if (Object.keys(this.listeners).length === 0) {
                this.stopPolling();
            }
        }
    }
    IndexedDBLocalPersistence.type = 'LOCAL';
    /**
     * An implementation of {@link Persistence} of type `LOCAL` using `indexedDB`
     * for the underlying storage.
     *
     * @public
     */
    const indexedDBLocalPersistence = IndexedDBLocalPersistence;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function getScriptParentElement() {
        var _a, _b;
        return (_b = (_a = document.getElementsByTagName('head')) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : document;
    }
    function _loadJS(url) {
        // TODO: consider adding timeout support & cancellation
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.setAttribute('src', url);
            el.onload = resolve;
            el.onerror = e => {
                const error = _createError("internal-error" /* INTERNAL_ERROR */);
                error.customData = e;
                reject(error);
            };
            el.type = 'text/javascript';
            el.charset = 'UTF-8';
            getScriptParentElement().appendChild(el);
        });
    }
    function _generateCallbackName(prefix) {
        return `__${prefix}${Math.floor(Math.random() * 1000000)}`;
    }
    new Delay(30000, 60000);

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Chooses a popup/redirect resolver to use. This prefers the override (which
     * is directly passed in), and falls back to the property set on the auth
     * object. If neither are available, this function errors w/ an argument error.
     */
    function _withDefaultResolver(auth, resolverOverride) {
        if (resolverOverride) {
            return _getInstance(resolverOverride);
        }
        _assert(auth._popupRedirectResolver, auth, "argument-error" /* ARGUMENT_ERROR */);
        return auth._popupRedirectResolver;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class IdpCredential extends AuthCredential {
        constructor(params) {
            super("custom" /* CUSTOM */, "custom" /* CUSTOM */);
            this.params = params;
        }
        _getIdTokenResponse(auth) {
            return signInWithIdp(auth, this._buildIdpRequest());
        }
        _linkToIdToken(auth, idToken) {
            return signInWithIdp(auth, this._buildIdpRequest(idToken));
        }
        _getReauthenticationResolver(auth) {
            return signInWithIdp(auth, this._buildIdpRequest());
        }
        _buildIdpRequest(idToken) {
            const request = {
                requestUri: this.params.requestUri,
                sessionId: this.params.sessionId,
                postBody: this.params.postBody,
                tenantId: this.params.tenantId,
                pendingToken: this.params.pendingToken,
                returnSecureToken: true,
                returnIdpCredential: true
            };
            if (idToken) {
                request.idToken = idToken;
            }
            return request;
        }
    }
    function _signIn(params) {
        return _signInWithCredential(params.auth, new IdpCredential(params), params.bypassAuthState);
    }
    function _reauth(params) {
        const { auth, user } = params;
        _assert(user, auth, "internal-error" /* INTERNAL_ERROR */);
        return _reauthenticate(user, new IdpCredential(params), params.bypassAuthState);
    }
    async function _link(params) {
        const { auth, user } = params;
        _assert(user, auth, "internal-error" /* INTERNAL_ERROR */);
        return _link$1(user, new IdpCredential(params), params.bypassAuthState);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Popup event manager. Handles the popup's entire lifecycle; listens to auth
     * events
     */
    class AbstractPopupRedirectOperation {
        constructor(auth, filter, resolver, user, bypassAuthState = false) {
            this.auth = auth;
            this.resolver = resolver;
            this.user = user;
            this.bypassAuthState = bypassAuthState;
            this.pendingPromise = null;
            this.eventManager = null;
            this.filter = Array.isArray(filter) ? filter : [filter];
        }
        execute() {
            return new Promise(async (resolve, reject) => {
                this.pendingPromise = { resolve, reject };
                try {
                    this.eventManager = await this.resolver._initialize(this.auth);
                    await this.onExecution();
                    this.eventManager.registerConsumer(this);
                }
                catch (e) {
                    this.reject(e);
                }
            });
        }
        async onAuthEvent(event) {
            const { urlResponse, sessionId, postBody, tenantId, error, type } = event;
            if (error) {
                this.reject(error);
                return;
            }
            const params = {
                auth: this.auth,
                requestUri: urlResponse,
                sessionId: sessionId,
                tenantId: tenantId || undefined,
                postBody: postBody || undefined,
                user: this.user,
                bypassAuthState: this.bypassAuthState
            };
            try {
                this.resolve(await this.getIdpTask(type)(params));
            }
            catch (e) {
                this.reject(e);
            }
        }
        onError(error) {
            this.reject(error);
        }
        getIdpTask(type) {
            switch (type) {
                case "signInViaPopup" /* SIGN_IN_VIA_POPUP */:
                case "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */:
                    return _signIn;
                case "linkViaPopup" /* LINK_VIA_POPUP */:
                case "linkViaRedirect" /* LINK_VIA_REDIRECT */:
                    return _link;
                case "reauthViaPopup" /* REAUTH_VIA_POPUP */:
                case "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */:
                    return _reauth;
                default:
                    _fail(this.auth, "internal-error" /* INTERNAL_ERROR */);
            }
        }
        resolve(cred) {
            debugAssert(this.pendingPromise, 'Pending promise was never set');
            this.pendingPromise.resolve(cred);
            this.unregisterAndCleanUp();
        }
        reject(error) {
            debugAssert(this.pendingPromise, 'Pending promise was never set');
            this.pendingPromise.reject(error);
            this.unregisterAndCleanUp();
        }
        unregisterAndCleanUp() {
            if (this.eventManager) {
                this.eventManager.unregisterConsumer(this);
            }
            this.pendingPromise = null;
            this.cleanUp();
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const _POLL_WINDOW_CLOSE_TIMEOUT = new Delay(2000, 10000);
    /**
     * Authenticates a Firebase client using a popup-based OAuth authentication flow.
     *
     * @remarks
     * If succeeds, returns the signed in user along with the provider's credential. If sign in was
     * unsuccessful, returns an error object containing additional information about the error.
     *
     * @example
     * ```javascript
     * // Sign in using a popup.
     * const provider = new FacebookAuthProvider();
     * const result = await signInWithPopup(auth, provider);
     *
     * // The signed-in user info.
     * const user = result.user;
     * // This gives you a Facebook Access Token.
     * const credential = provider.credentialFromResult(auth, result);
     * const token = credential.accessToken;
     * ```
     *
     * @param auth - The {@link Auth} instance.
     * @param provider - The provider to authenticate. The provider has to be an {@link OAuthProvider}.
     * Non-OAuth providers like {@link EmailAuthProvider} will throw an error.
     * @param resolver - An instance of {@link PopupRedirectResolver}, optional
     * if already supplied to {@link initializeAuth} or provided by {@link getAuth}.
     *
     *
     * @public
     */
    async function signInWithPopup(auth, provider, resolver) {
        const authInternal = _castAuth(auth);
        _assertInstanceOf(auth, provider, FederatedAuthProvider);
        const resolverInternal = _withDefaultResolver(authInternal, resolver);
        const action = new PopupOperation(authInternal, "signInViaPopup" /* SIGN_IN_VIA_POPUP */, provider, resolverInternal);
        return action.executeNotNull();
    }
    /**
     * Popup event manager. Handles the popup's entire lifecycle; listens to auth
     * events
     *
     */
    class PopupOperation extends AbstractPopupRedirectOperation {
        constructor(auth, filter, provider, resolver, user) {
            super(auth, filter, resolver, user);
            this.provider = provider;
            this.authWindow = null;
            this.pollId = null;
            if (PopupOperation.currentPopupAction) {
                PopupOperation.currentPopupAction.cancel();
            }
            PopupOperation.currentPopupAction = this;
        }
        async executeNotNull() {
            const result = await this.execute();
            _assert(result, this.auth, "internal-error" /* INTERNAL_ERROR */);
            return result;
        }
        async onExecution() {
            debugAssert(this.filter.length === 1, 'Popup operations only handle one event');
            const eventId = _generateEventId();
            this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], // There's always one, see constructor
            eventId);
            this.authWindow.associatedEvent = eventId;
            // Check for web storage support and origin validation _after_ the popup is
            // loaded. These operations are slow (~1 second or so) Rather than
            // waiting on them before opening the window, optimistically open the popup
            // and check for storage support at the same time. If storage support is
            // not available, this will cause the whole thing to reject properly. It
            // will also close the popup, but since the promise has already rejected,
            // the popup closed by user poll will reject into the void.
            this.resolver._originValidation(this.auth).catch(e => {
                this.reject(e);
            });
            this.resolver._isIframeWebStorageSupported(this.auth, isSupported => {
                if (!isSupported) {
                    this.reject(_createError(this.auth, "web-storage-unsupported" /* WEB_STORAGE_UNSUPPORTED */));
                }
            });
            // Handle user closure. Notice this does *not* use await
            this.pollUserCancellation();
        }
        get eventId() {
            var _a;
            return ((_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.associatedEvent) || null;
        }
        cancel() {
            this.reject(_createError(this.auth, "cancelled-popup-request" /* EXPIRED_POPUP_REQUEST */));
        }
        cleanUp() {
            if (this.authWindow) {
                this.authWindow.close();
            }
            if (this.pollId) {
                window.clearTimeout(this.pollId);
            }
            this.authWindow = null;
            this.pollId = null;
            PopupOperation.currentPopupAction = null;
        }
        pollUserCancellation() {
            const poll = () => {
                var _a, _b;
                if ((_b = (_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.window) === null || _b === void 0 ? void 0 : _b.closed) {
                    // Make sure that there is sufficient time for whatever action to
                    // complete. The window could have closed but the sign in network
                    // call could still be in flight.
                    this.pollId = window.setTimeout(() => {
                        this.pollId = null;
                        this.reject(_createError(this.auth, "popup-closed-by-user" /* POPUP_CLOSED_BY_USER */));
                    }, 2000 /* AUTH_EVENT */);
                    return;
                }
                this.pollId = window.setTimeout(poll, _POLL_WINDOW_CLOSE_TIMEOUT.get());
            };
            poll();
        }
    }
    // Only one popup is ever shown at once. The lifecycle of the current popup
    // can be managed / cancelled by the constructor.
    PopupOperation.currentPopupAction = null;

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const PENDING_REDIRECT_KEY = 'pendingRedirect';
    // We only get one redirect outcome for any one auth, so just store it
    // in here.
    const redirectOutcomeMap = new Map();
    class RedirectAction extends AbstractPopupRedirectOperation {
        constructor(auth, resolver, bypassAuthState = false) {
            super(auth, [
                "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */,
                "linkViaRedirect" /* LINK_VIA_REDIRECT */,
                "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */,
                "unknown" /* UNKNOWN */
            ], resolver, undefined, bypassAuthState);
            this.eventId = null;
        }
        /**
         * Override the execute function; if we already have a redirect result, then
         * just return it.
         */
        async execute() {
            let readyOutcome = redirectOutcomeMap.get(this.auth._key());
            if (!readyOutcome) {
                try {
                    const hasPendingRedirect = await _getAndClearPendingRedirectStatus(this.resolver, this.auth);
                    const result = hasPendingRedirect ? await super.execute() : null;
                    readyOutcome = () => Promise.resolve(result);
                }
                catch (e) {
                    readyOutcome = () => Promise.reject(e);
                }
                redirectOutcomeMap.set(this.auth._key(), readyOutcome);
            }
            // If we're not bypassing auth state, the ready outcome should be set to
            // null.
            if (!this.bypassAuthState) {
                redirectOutcomeMap.set(this.auth._key(), () => Promise.resolve(null));
            }
            return readyOutcome();
        }
        async onAuthEvent(event) {
            if (event.type === "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */) {
                return super.onAuthEvent(event);
            }
            else if (event.type === "unknown" /* UNKNOWN */) {
                // This is a sentinel value indicating there's no pending redirect
                this.resolve(null);
                return;
            }
            if (event.eventId) {
                const user = await this.auth._redirectUserForId(event.eventId);
                if (user) {
                    this.user = user;
                    return super.onAuthEvent(event);
                }
                else {
                    this.resolve(null);
                }
            }
        }
        async onExecution() { }
        cleanUp() { }
    }
    async function _getAndClearPendingRedirectStatus(resolver, auth) {
        const key = pendingRedirectKey(auth);
        const persistence = resolverPersistence(resolver);
        if (!(await persistence._isAvailable())) {
            return false;
        }
        const hasPendingRedirect = (await persistence._get(key)) === 'true';
        await persistence._remove(key);
        return hasPendingRedirect;
    }
    function resolverPersistence(resolver) {
        return _getInstance(resolver._redirectPersistence);
    }
    function pendingRedirectKey(auth) {
        return _persistenceKeyName(PENDING_REDIRECT_KEY, auth.config.apiKey, auth.name);
    }
    async function _getRedirectResult(auth, resolverExtern, bypassAuthState = false) {
        const authInternal = _castAuth(auth);
        const resolver = _withDefaultResolver(authInternal, resolverExtern);
        const action = new RedirectAction(authInternal, resolver, bypassAuthState);
        const result = await action.execute();
        if (result && !bypassAuthState) {
            delete result.user._redirectEventId;
            await authInternal._persistUserIfCurrent(result.user);
            await authInternal._setRedirectUser(null, resolverExtern);
        }
        return result;
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // The amount of time to store the UIDs of seen events; this is
    // set to 10 min by default
    const EVENT_DUPLICATION_CACHE_DURATION_MS = 10 * 60 * 1000;
    class AuthEventManager {
        constructor(auth) {
            this.auth = auth;
            this.cachedEventUids = new Set();
            this.consumers = new Set();
            this.queuedRedirectEvent = null;
            this.hasHandledPotentialRedirect = false;
            this.lastProcessedEventTime = Date.now();
        }
        registerConsumer(authEventConsumer) {
            this.consumers.add(authEventConsumer);
            if (this.queuedRedirectEvent &&
                this.isEventForConsumer(this.queuedRedirectEvent, authEventConsumer)) {
                this.sendToConsumer(this.queuedRedirectEvent, authEventConsumer);
                this.saveEventToCache(this.queuedRedirectEvent);
                this.queuedRedirectEvent = null;
            }
        }
        unregisterConsumer(authEventConsumer) {
            this.consumers.delete(authEventConsumer);
        }
        onEvent(event) {
            // Check if the event has already been handled
            if (this.hasEventBeenHandled(event)) {
                return false;
            }
            let handled = false;
            this.consumers.forEach(consumer => {
                if (this.isEventForConsumer(event, consumer)) {
                    handled = true;
                    this.sendToConsumer(event, consumer);
                    this.saveEventToCache(event);
                }
            });
            if (this.hasHandledPotentialRedirect || !isRedirectEvent(event)) {
                // If we've already seen a redirect before, or this is a popup event,
                // bail now
                return handled;
            }
            this.hasHandledPotentialRedirect = true;
            // If the redirect wasn't handled, hang on to it
            if (!handled) {
                this.queuedRedirectEvent = event;
                handled = true;
            }
            return handled;
        }
        sendToConsumer(event, consumer) {
            var _a;
            if (event.error && !isNullRedirectEvent(event)) {
                const code = ((_a = event.error.code) === null || _a === void 0 ? void 0 : _a.split('auth/')[1]) ||
                    "internal-error" /* INTERNAL_ERROR */;
                consumer.onError(_createError(this.auth, code));
            }
            else {
                consumer.onAuthEvent(event);
            }
        }
        isEventForConsumer(event, consumer) {
            const eventIdMatches = consumer.eventId === null ||
                (!!event.eventId && event.eventId === consumer.eventId);
            return consumer.filter.includes(event.type) && eventIdMatches;
        }
        hasEventBeenHandled(event) {
            if (Date.now() - this.lastProcessedEventTime >=
                EVENT_DUPLICATION_CACHE_DURATION_MS) {
                this.cachedEventUids.clear();
            }
            return this.cachedEventUids.has(eventUid(event));
        }
        saveEventToCache(event) {
            this.cachedEventUids.add(eventUid(event));
            this.lastProcessedEventTime = Date.now();
        }
    }
    function eventUid(e) {
        return [e.type, e.eventId, e.sessionId, e.tenantId].filter(v => v).join('-');
    }
    function isNullRedirectEvent({ type, error }) {
        return (type === "unknown" /* UNKNOWN */ &&
            (error === null || error === void 0 ? void 0 : error.code) === `auth/${"no-auth-event" /* NO_AUTH_EVENT */}`);
    }
    function isRedirectEvent(event) {
        switch (event.type) {
            case "signInViaRedirect" /* SIGN_IN_VIA_REDIRECT */:
            case "linkViaRedirect" /* LINK_VIA_REDIRECT */:
            case "reauthViaRedirect" /* REAUTH_VIA_REDIRECT */:
                return true;
            case "unknown" /* UNKNOWN */:
                return isNullRedirectEvent(event);
            default:
                return false;
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function _getProjectConfig(auth, request = {}) {
        return _performApiRequest(auth, "GET" /* GET */, "/v1/projects" /* GET_PROJECT_CONFIG */, request);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const IP_ADDRESS_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    const HTTP_REGEX = /^https?/;
    async function _validateOrigin(auth) {
        // Skip origin validation if we are in an emulated environment
        if (auth.config.emulator) {
            return;
        }
        const { authorizedDomains } = await _getProjectConfig(auth);
        for (const domain of authorizedDomains) {
            try {
                if (matchDomain(domain)) {
                    return;
                }
            }
            catch (_a) {
                // Do nothing if there's a URL error; just continue searching
            }
        }
        // In the old SDK, this error also provides helpful messages.
        _fail(auth, "unauthorized-domain" /* INVALID_ORIGIN */);
    }
    function matchDomain(expected) {
        const currentUrl = _getCurrentUrl();
        const { protocol, hostname } = new URL(currentUrl);
        if (expected.startsWith('chrome-extension://')) {
            const ceUrl = new URL(expected);
            if (ceUrl.hostname === '' && hostname === '') {
                // For some reason we're not parsing chrome URLs properly
                return (protocol === 'chrome-extension:' &&
                    expected.replace('chrome-extension://', '') ===
                        currentUrl.replace('chrome-extension://', ''));
            }
            return protocol === 'chrome-extension:' && ceUrl.hostname === hostname;
        }
        if (!HTTP_REGEX.test(protocol)) {
            return false;
        }
        if (IP_ADDRESS_REGEX.test(expected)) {
            // The domain has to be exactly equal to the pattern, as an IP domain will
            // only contain the IP, no extra character.
            return hostname === expected;
        }
        // Dots in pattern should be escaped.
        const escapedDomainPattern = expected.replace(/\./g, '\\.');
        // Non ip address domains.
        // domain.com = *.domain.com OR domain.com
        const re = new RegExp('^(.+\\.' + escapedDomainPattern + '|' + escapedDomainPattern + ')$', 'i');
        return re.test(hostname);
    }

    /**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const NETWORK_TIMEOUT = new Delay(30000, 60000);
    /**
     * Reset unlaoded GApi modules. If gapi.load fails due to a network error,
     * it will stop working after a retrial. This is a hack to fix this issue.
     */
    function resetUnloadedGapiModules() {
        // Clear last failed gapi.load state to force next gapi.load to first
        // load the failed gapi.iframes module.
        // Get gapix.beacon context.
        const beacon = _window().___jsl;
        // Get current hint.
        if (beacon === null || beacon === void 0 ? void 0 : beacon.H) {
            // Get gapi hint.
            for (const hint of Object.keys(beacon.H)) {
                // Requested modules.
                beacon.H[hint].r = beacon.H[hint].r || [];
                // Loaded modules.
                beacon.H[hint].L = beacon.H[hint].L || [];
                // Set requested modules to a copy of the loaded modules.
                beacon.H[hint].r = [...beacon.H[hint].L];
                // Clear pending callbacks.
                if (beacon.CP) {
                    for (let i = 0; i < beacon.CP.length; i++) {
                        // Remove all failed pending callbacks.
                        beacon.CP[i] = null;
                    }
                }
            }
        }
    }
    function loadGapi(auth) {
        return new Promise((resolve, reject) => {
            var _a, _b, _c;
            // Function to run when gapi.load is ready.
            function loadGapiIframe() {
                // The developer may have tried to previously run gapi.load and failed.
                // Run this to fix that.
                resetUnloadedGapiModules();
                gapi.load('gapi.iframes', {
                    callback: () => {
                        resolve(gapi.iframes.getContext());
                    },
                    ontimeout: () => {
                        // The above reset may be sufficient, but having this reset after
                        // failure ensures that if the developer calls gapi.load after the
                        // connection is re-established and before another attempt to embed
                        // the iframe, it would work and would not be broken because of our
                        // failed attempt.
                        // Timeout when gapi.iframes.Iframe not loaded.
                        resetUnloadedGapiModules();
                        reject(_createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */));
                    },
                    timeout: NETWORK_TIMEOUT.get()
                });
            }
            if ((_b = (_a = _window().gapi) === null || _a === void 0 ? void 0 : _a.iframes) === null || _b === void 0 ? void 0 : _b.Iframe) {
                // If gapi.iframes.Iframe available, resolve.
                resolve(gapi.iframes.getContext());
            }
            else if (!!((_c = _window().gapi) === null || _c === void 0 ? void 0 : _c.load)) {
                // Gapi loader ready, load gapi.iframes.
                loadGapiIframe();
            }
            else {
                // Create a new iframe callback when this is called so as not to overwrite
                // any previous defined callback. This happens if this method is called
                // multiple times in parallel and could result in the later callback
                // overwriting the previous one. This would end up with a iframe
                // timeout.
                const cbName = _generateCallbackName('iframefcb');
                // GApi loader not available, dynamically load platform.js.
                _window()[cbName] = () => {
                    // GApi loader should be ready.
                    if (!!gapi.load) {
                        loadGapiIframe();
                    }
                    else {
                        // Gapi loader failed, throw error.
                        reject(_createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */));
                    }
                };
                // Load GApi loader.
                return _loadJS(`https://apis.google.com/js/api.js?onload=${cbName}`).catch(e => reject(e));
            }
        }).catch(error => {
            // Reset cached promise to allow for retrial.
            cachedGApiLoader = null;
            throw error;
        });
    }
    let cachedGApiLoader = null;
    function _loadGapi(auth) {
        cachedGApiLoader = cachedGApiLoader || loadGapi(auth);
        return cachedGApiLoader;
    }

    /**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const PING_TIMEOUT = new Delay(5000, 15000);
    const IFRAME_PATH = '__/auth/iframe';
    const EMULATED_IFRAME_PATH = 'emulator/auth/iframe';
    const IFRAME_ATTRIBUTES = {
        style: {
            position: 'absolute',
            top: '-100px',
            width: '1px',
            height: '1px'
        },
        'aria-hidden': 'true',
        tabindex: '-1'
    };
    // Map from apiHost to endpoint ID for passing into iframe. In current SDK, apiHost can be set to
    // anything (not from a list of endpoints with IDs as in legacy), so this is the closest we can get.
    const EID_FROM_APIHOST = new Map([
        ["identitytoolkit.googleapis.com" /* API_HOST */, 'p'],
        ['staging-identitytoolkit.sandbox.googleapis.com', 's'],
        ['test-identitytoolkit.sandbox.googleapis.com', 't'] // test
    ]);
    function getIframeUrl(auth) {
        const config = auth.config;
        _assert(config.authDomain, auth, "auth-domain-config-required" /* MISSING_AUTH_DOMAIN */);
        const url = config.emulator
            ? _emulatorUrl(config, EMULATED_IFRAME_PATH)
            : `https://${auth.config.authDomain}/${IFRAME_PATH}`;
        const params = {
            apiKey: config.apiKey,
            appName: auth.name,
            v: SDK_VERSION
        };
        const eid = EID_FROM_APIHOST.get(auth.config.apiHost);
        if (eid) {
            params.eid = eid;
        }
        const frameworks = auth._getFrameworks();
        if (frameworks.length) {
            params.fw = frameworks.join(',');
        }
        return `${url}?${querystring(params).slice(1)}`;
    }
    async function _openIframe(auth) {
        const context = await _loadGapi(auth);
        const gapi = _window().gapi;
        _assert(gapi, auth, "internal-error" /* INTERNAL_ERROR */);
        return context.open({
            where: document.body,
            url: getIframeUrl(auth),
            messageHandlersFilter: gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
            attributes: IFRAME_ATTRIBUTES,
            dontclear: true
        }, (iframe) => new Promise(async (resolve, reject) => {
            await iframe.restyle({
                // Prevent iframe from closing on mouse out.
                setHideOnLeave: false
            });
            const networkError = _createError(auth, "network-request-failed" /* NETWORK_REQUEST_FAILED */);
            // Confirm iframe is correctly loaded.
            // To fallback on failure, set a timeout.
            const networkErrorTimer = _window().setTimeout(() => {
                reject(networkError);
            }, PING_TIMEOUT.get());
            // Clear timer and resolve pending iframe ready promise.
            function clearTimerAndResolve() {
                _window().clearTimeout(networkErrorTimer);
                resolve(iframe);
            }
            // This returns an IThenable. However the reject part does not call
            // when the iframe is not loaded.
            iframe.ping(clearTimerAndResolve).then(clearTimerAndResolve, () => {
                reject(networkError);
            });
        }));
    }

    /**
     * @license
     * Copyright 2020 Google LLC.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const BASE_POPUP_OPTIONS = {
        location: 'yes',
        resizable: 'yes',
        statusbar: 'yes',
        toolbar: 'no'
    };
    const DEFAULT_WIDTH = 500;
    const DEFAULT_HEIGHT = 600;
    const TARGET_BLANK = '_blank';
    const FIREFOX_EMPTY_URL = 'http://localhost';
    class AuthPopup {
        constructor(window) {
            this.window = window;
            this.associatedEvent = null;
        }
        close() {
            if (this.window) {
                try {
                    this.window.close();
                }
                catch (e) { }
            }
        }
    }
    function _open(auth, url, name, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
        const top = Math.max((window.screen.availHeight - height) / 2, 0).toString();
        const left = Math.max((window.screen.availWidth - width) / 2, 0).toString();
        let target = '';
        const options = Object.assign(Object.assign({}, BASE_POPUP_OPTIONS), { width: width.toString(), height: height.toString(), top,
            left });
        // Chrome iOS 7 and 8 is returning an undefined popup win when target is
        // specified, even though the popup is not necessarily blocked.
        const ua = getUA().toLowerCase();
        if (name) {
            target = _isChromeIOS(ua) ? TARGET_BLANK : name;
        }
        if (_isFirefox(ua)) {
            // Firefox complains when invalid URLs are popped out. Hacky way to bypass.
            url = url || FIREFOX_EMPTY_URL;
            // Firefox disables by default scrolling on popup windows, which can create
            // issues when the user has many Google accounts, for instance.
            options.scrollbars = 'yes';
        }
        const optionsString = Object.entries(options).reduce((accum, [key, value]) => `${accum}${key}=${value},`, '');
        if (_isIOSStandalone(ua) && target !== '_self') {
            openAsNewWindowIOS(url || '', target);
            return new AuthPopup(null);
        }
        // about:blank getting sanitized causing browsers like IE/Edge to display
        // brief error message before redirecting to handler.
        const newWin = window.open(url || '', target, optionsString);
        _assert(newWin, auth, "popup-blocked" /* POPUP_BLOCKED */);
        // Flaky on IE edge, encapsulate with a try and catch.
        try {
            newWin.focus();
        }
        catch (e) { }
        return new AuthPopup(newWin);
    }
    function openAsNewWindowIOS(url, target) {
        const el = document.createElement('a');
        el.href = url;
        el.target = target;
        const click = document.createEvent('MouseEvent');
        click.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null);
        el.dispatchEvent(click);
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * URL for Authentication widget which will initiate the OAuth handshake
     *
     * @internal
     */
    const WIDGET_PATH = '__/auth/handler';
    /**
     * URL for emulated environment
     *
     * @internal
     */
    const EMULATOR_WIDGET_PATH = 'emulator/auth/handler';
    function _getRedirectUrl(auth, provider, authType, redirectUrl, eventId, additionalParams) {
        _assert(auth.config.authDomain, auth, "auth-domain-config-required" /* MISSING_AUTH_DOMAIN */);
        _assert(auth.config.apiKey, auth, "invalid-api-key" /* INVALID_API_KEY */);
        const params = {
            apiKey: auth.config.apiKey,
            appName: auth.name,
            authType,
            redirectUrl,
            v: SDK_VERSION,
            eventId
        };
        if (provider instanceof FederatedAuthProvider) {
            provider.setDefaultLanguage(auth.languageCode);
            params.providerId = provider.providerId || '';
            if (!isEmpty(provider.getCustomParameters())) {
                params.customParameters = JSON.stringify(provider.getCustomParameters());
            }
            // TODO set additionalParams from the provider as well?
            for (const [key, value] of Object.entries(additionalParams || {})) {
                params[key] = value;
            }
        }
        if (provider instanceof BaseOAuthProvider) {
            const scopes = provider.getScopes().filter(scope => scope !== '');
            if (scopes.length > 0) {
                params.scopes = scopes.join(',');
            }
        }
        if (auth.tenantId) {
            params.tid = auth.tenantId;
        }
        // TODO: maybe set eid as endipointId
        // TODO: maybe set fw as Frameworks.join(",")
        const paramsDict = params;
        for (const key of Object.keys(paramsDict)) {
            if (paramsDict[key] === undefined) {
                delete paramsDict[key];
            }
        }
        return `${getHandlerBase(auth)}?${querystring(paramsDict).slice(1)}`;
    }
    function getHandlerBase({ config }) {
        if (!config.emulator) {
            return `https://${config.authDomain}/${WIDGET_PATH}`;
        }
        return _emulatorUrl(config, EMULATOR_WIDGET_PATH);
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * The special web storage event
     *
     */
    const WEB_STORAGE_SUPPORT_KEY = 'webStorageSupport';
    class BrowserPopupRedirectResolver {
        constructor() {
            this.eventManagers = {};
            this.iframes = {};
            this.originValidationPromises = {};
            this._redirectPersistence = browserSessionPersistence;
            this._completeRedirectFn = _getRedirectResult;
        }
        // Wrapping in async even though we don't await anywhere in order
        // to make sure errors are raised as promise rejections
        async _openPopup(auth, provider, authType, eventId) {
            var _a;
            debugAssert((_a = this.eventManagers[auth._key()]) === null || _a === void 0 ? void 0 : _a.manager, '_initialize() not called before _openPopup()');
            const url = _getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId);
            return _open(auth, url, _generateEventId());
        }
        async _openRedirect(auth, provider, authType, eventId) {
            await this._originValidation(auth);
            _setWindowLocation(_getRedirectUrl(auth, provider, authType, _getCurrentUrl(), eventId));
            return new Promise(() => { });
        }
        _initialize(auth) {
            const key = auth._key();
            if (this.eventManagers[key]) {
                const { manager, promise } = this.eventManagers[key];
                if (manager) {
                    return Promise.resolve(manager);
                }
                else {
                    debugAssert(promise, 'If manager is not set, promise should be');
                    return promise;
                }
            }
            const promise = this.initAndGetManager(auth);
            this.eventManagers[key] = { promise };
            // If the promise is rejected, the key should be removed so that the
            // operation can be retried later.
            promise.catch(() => {
                delete this.eventManagers[key];
            });
            return promise;
        }
        async initAndGetManager(auth) {
            const iframe = await _openIframe(auth);
            const manager = new AuthEventManager(auth);
            iframe.register('authEvent', (iframeEvent) => {
                _assert(iframeEvent === null || iframeEvent === void 0 ? void 0 : iframeEvent.authEvent, auth, "invalid-auth-event" /* INVALID_AUTH_EVENT */);
                // TODO: Consider splitting redirect and popup events earlier on
                const handled = manager.onEvent(iframeEvent.authEvent);
                return { status: handled ? "ACK" /* ACK */ : "ERROR" /* ERROR */ };
            }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
            this.eventManagers[auth._key()] = { manager };
            this.iframes[auth._key()] = iframe;
            return manager;
        }
        _isIframeWebStorageSupported(auth, cb) {
            const iframe = this.iframes[auth._key()];
            iframe.send(WEB_STORAGE_SUPPORT_KEY, { type: WEB_STORAGE_SUPPORT_KEY }, result => {
                var _a;
                const isSupported = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a[WEB_STORAGE_SUPPORT_KEY];
                if (isSupported !== undefined) {
                    cb(!!isSupported);
                }
                _fail(auth, "internal-error" /* INTERNAL_ERROR */);
            }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
        }
        _originValidation(auth) {
            const key = auth._key();
            if (!this.originValidationPromises[key]) {
                this.originValidationPromises[key] = _validateOrigin(auth);
            }
            return this.originValidationPromises[key];
        }
        get _shouldInitProactively() {
            // Mobile browsers and Safari need to optimistically initialize
            return _isMobileBrowser() || _isSafari() || _isIOS();
        }
    }
    /**
     * An implementation of {@link PopupRedirectResolver} suitable for browser
     * based applications.
     *
     * @public
     */
    const browserPopupRedirectResolver = BrowserPopupRedirectResolver;

    var name = "@firebase/auth";
    var version = "0.19.11";

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AuthInterop {
        constructor(auth) {
            this.auth = auth;
            this.internalListeners = new Map();
        }
        getUid() {
            var _a;
            this.assertAuthConfigured();
            return ((_a = this.auth.currentUser) === null || _a === void 0 ? void 0 : _a.uid) || null;
        }
        async getToken(forceRefresh) {
            this.assertAuthConfigured();
            await this.auth._initializationPromise;
            if (!this.auth.currentUser) {
                return null;
            }
            const accessToken = await this.auth.currentUser.getIdToken(forceRefresh);
            return { accessToken };
        }
        addAuthTokenListener(listener) {
            this.assertAuthConfigured();
            if (this.internalListeners.has(listener)) {
                return;
            }
            const unsubscribe = this.auth.onIdTokenChanged(user => {
                var _a;
                listener(((_a = user) === null || _a === void 0 ? void 0 : _a.stsTokenManager.accessToken) || null);
            });
            this.internalListeners.set(listener, unsubscribe);
            this.updateProactiveRefresh();
        }
        removeAuthTokenListener(listener) {
            this.assertAuthConfigured();
            const unsubscribe = this.internalListeners.get(listener);
            if (!unsubscribe) {
                return;
            }
            this.internalListeners.delete(listener);
            unsubscribe();
            this.updateProactiveRefresh();
        }
        assertAuthConfigured() {
            _assert(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth" /* DEPENDENT_SDK_INIT_BEFORE_AUTH */);
        }
        updateProactiveRefresh() {
            if (this.internalListeners.size > 0) {
                this.auth._startProactiveRefresh();
            }
            else {
                this.auth._stopProactiveRefresh();
            }
        }
    }

    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function getVersionForPlatform(clientPlatform) {
        switch (clientPlatform) {
            case "Node" /* NODE */:
                return 'node';
            case "ReactNative" /* REACT_NATIVE */:
                return 'rn';
            case "Worker" /* WORKER */:
                return 'webworker';
            case "Cordova" /* CORDOVA */:
                return 'cordova';
            default:
                return undefined;
        }
    }
    /** @internal */
    function registerAuth(clientPlatform) {
        _registerComponent(new Component("auth" /* AUTH */, (container, { options: deps }) => {
            const app = container.getProvider('app').getImmediate();
            const heartbeatServiceProvider = container.getProvider('heartbeat');
            const { apiKey, authDomain } = app.options;
            return ((app, heartbeatServiceProvider) => {
                _assert(apiKey && !apiKey.includes(':'), "invalid-api-key" /* INVALID_API_KEY */, { appName: app.name });
                // Auth domain is optional if IdP sign in isn't being used
                _assert(!(authDomain === null || authDomain === void 0 ? void 0 : authDomain.includes(':')), "argument-error" /* ARGUMENT_ERROR */, {
                    appName: app.name
                });
                const config = {
                    apiKey,
                    authDomain,
                    clientPlatform,
                    apiHost: "identitytoolkit.googleapis.com" /* API_HOST */,
                    tokenApiHost: "securetoken.googleapis.com" /* TOKEN_API_HOST */,
                    apiScheme: "https" /* API_SCHEME */,
                    sdkClientVersion: _getClientVersion(clientPlatform)
                };
                const authInstance = new AuthImpl(app, heartbeatServiceProvider, config);
                _initializeAuthInstance(authInstance, deps);
                return authInstance;
            })(app, heartbeatServiceProvider);
        }, "PUBLIC" /* PUBLIC */)
            /**
             * Auth can only be initialized by explicitly calling getAuth() or initializeAuth()
             * For why we do this, See go/firebase-next-auth-init
             */
            .setInstantiationMode("EXPLICIT" /* EXPLICIT */)
            /**
             * Because all firebase products that depend on auth depend on auth-internal directly,
             * we need to initialize auth-internal after auth is initialized to make it available to other firebase products.
             */
            .setInstanceCreatedCallback((container, _instanceIdentifier, _instance) => {
            const authInternalProvider = container.getProvider("auth-internal" /* AUTH_INTERNAL */);
            authInternalProvider.initialize();
        }));
        _registerComponent(new Component("auth-internal" /* AUTH_INTERNAL */, container => {
            const auth = _castAuth(container.getProvider("auth" /* AUTH */).getImmediate());
            return (auth => new AuthInterop(auth))(auth);
        }, "PRIVATE" /* PRIVATE */).setInstantiationMode("EXPLICIT" /* EXPLICIT */));
        registerVersion(name, version, getVersionForPlatform(clientPlatform));
        // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
        registerVersion(name, version, 'esm2017');
    }

    /**
     * @license
     * Copyright 2021 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Returns the Auth instance associated with the provided {@link @firebase/app#FirebaseApp}.
     * If no instance exists, initializes an Auth instance with platform-specific default dependencies.
     *
     * @param app - The Firebase App.
     *
     * @public
     */
    function getAuth(app = getApp()) {
        const provider = _getProvider(app, 'auth');
        if (provider.isInitialized()) {
            return provider.getImmediate();
        }
        return initializeAuth(app, {
            popupRedirectResolver: browserPopupRedirectResolver,
            persistence: [
                indexedDBLocalPersistence,
                browserLocalPersistence,
                browserSessionPersistence
            ]
        });
    }
    registerAuth("Browser" /* BROWSER */);

    // 💛 Firebase:

    // 🔨 Firebase config:
    const firebaseConfig = {
      apiKey: "AIzaSyC_Pn358o5T59BjutnNRsVYAr0yTPsKTeA",
      authDomain: "notup-768c8.firebaseapp.com",
      projectId: "notup-768c8",
      storageBucket: "notup-768c8.appspot.com",
      messagingSenderId: "784327533506",
      appId: "1:784327533506:web:42f1cf48edaae547296c5b",
    };

    // 🚀 Initialize Firestore:
    const app$1 = initializeApp(firebaseConfig);
    const db = Pc(app$1);

    // 🚀 Initialize Firebase Auth:
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    auth.currentUser;

    const isLogged = writable(false);

    const useAuthUser = () => {
      // Get the current pathname ->
      let pathname = "/";

      onMount(() => {
        // Get the current pathname ->
        pathname = window.location.pathname;
        console.log(pathname);
        onAuthStateChanged(auth, (user) => {
          let userLogged = user == null ? false : true;
          // If user is logged in, redirect to tasks ->
          if (!userLogged) {
            navigate("/login");
            isLogged.set(false);
          } else {
            isLogged.set(true);
            if (pathname === "/login") {
              navigate("/tasks");
            }
          }
        });
      });
    };

    /* src\views\tasks.svelte generated by Svelte v3.46.6 */

    const { console: console_1$1 } = globals;

    const file$2 = "src\\views\\tasks.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (112:4) {#each tasks as task}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*task*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*task*/ ctx[1].description + "";
    	let t2;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "edit";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "delete";
    			t7 = space();
    			add_location(h3, file$2, 113, 8, 2645);
    			add_location(p, file$2, 114, 8, 2676);
    			add_location(button0, file$2, 115, 8, 2711);
    			add_location(button1, file$2, 116, 8, 2768);
    			add_location(div, file$2, 112, 6, 2630);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, button0);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(div, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*editTask*/ ctx[4](/*task*/ ctx[1]))) /*editTask*/ ctx[4](/*task*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*deleteTask*/ ctx[3](/*task*/ ctx[1].id))) /*deleteTask*/ ctx[3](/*task*/ ctx[1].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tasks*/ 1 && t0_value !== (t0_value = /*task*/ ctx[1].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*tasks*/ 1 && t2_value !== (t2_value = /*task*/ ctx[1].description + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(112:4) {#each tasks as task}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let form;
    	let label0;
    	let t1;
    	let input;
    	let t2;
    	let label1;
    	let t4;
    	let textarea;
    	let t5;
    	let button;
    	let t7;
    	let mounted;
    	let dispose;
    	let each_value = /*tasks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Title:";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Description:";
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Save";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label0, "for", "title");
    			add_location(label0, file$2, 97, 6, 2221);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Write here...");
    			add_location(input, file$2, 98, 6, 2262);
    			attr_dev(label1, "for", "description");
    			add_location(label1, file$2, 100, 6, 2347);
    			attr_dev(textarea, "id", "description");
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "placeholder", "Write a description");
    			add_location(textarea, file$2, 101, 6, 2400);
    			add_location(button, file$2, 108, 6, 2557);
    			add_location(form, file$2, 96, 4, 2167);
    			add_location(main, file$2, 95, 2, 2155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, label0);
    			append_dev(form, t1);
    			append_dev(form, input);
    			set_input_value(input, /*task*/ ctx[1].title);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(form, t4);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*task*/ ctx[1].description);
    			append_dev(form, t5);
    			append_dev(form, button);
    			append_dev(main, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*task*/ 2 && input.value !== /*task*/ ctx[1].title) {
    				set_input_value(input, /*task*/ ctx[1].title);
    			}

    			if (dirty & /*task*/ 2) {
    				set_input_value(textarea, /*task*/ ctx[1].description);
    			}

    			if (dirty & /*deleteTask, tasks, editTask*/ 25) {
    				each_value = /*tasks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tasks', slots, []);
    	useAuthUser();

    	// 🔨 Task object:
    	let task = { title: "", description: "" };

    	let tasks = [];
    	let editStatus = false;
    	let currentId = "";

    	// 🔨 Add new task:
    	const saveTask = async () => {
    		try {
    			await ul(wc(db, "tasks"), task);
    			console.log("task saved!");
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const handleSubmit = async () => {
    		try {
    			if (editStatus) {
    				updateTask();
    			} else {
    				saveTask();
    			}
    		} catch(error) {
    			console.log(error);
    		}

    		$$invalidate(1, task = { title: "", description: "" });
    		editStatus = false;
    		currentId = "";
    	};

    	// 🔨 Get all tasks:
    	const unsub = al(
    		wc(db, "tasks"),
    		querySnapshot => {
    			$$invalidate(0, tasks = querySnapshot.docs.map(doc => {
    				return { ...doc.data(), id: doc.id };
    			}));
    		},
    		err => {
    			console.log(err);
    		}
    	);

    	// 🔨 Remove task:
    	const deleteTask = async id => {
    		try {
    			await ol(gc(db, "tasks", id));
    			console.log("task deleted!");
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	// 🔨 Edit task:
    	const editTask = currentTask => {
    		$$invalidate(1, task.title = currentTask.title, task);
    		$$invalidate(1, task.description = currentTask.description, task);
    		currentId = currentTask.id;
    		editStatus = true;
    	};

    	// 🔨 Update task:
    	const updateTask = async () => {
    		try {
    			await rl(gc(db, "tasks", currentId), task);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	onDestroy(unsub);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Tasks> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		task.title = this.value;
    		$$invalidate(1, task);
    	}

    	function textarea_input_handler() {
    		task.description = this.value;
    		$$invalidate(1, task);
    	}

    	$$self.$capture_state = () => ({
    		onDestroy,
    		addDoc: ul,
    		collection: wc,
    		onSnapshot: al,
    		deleteDoc: ol,
    		doc: gc,
    		updateDoc: rl,
    		db,
    		useAuthUser,
    		task,
    		tasks,
    		editStatus,
    		currentId,
    		saveTask,
    		handleSubmit,
    		unsub,
    		deleteTask,
    		editTask,
    		updateTask
    	});

    	$$self.$inject_state = $$props => {
    		if ('task' in $$props) $$invalidate(1, task = $$props.task);
    		if ('tasks' in $$props) $$invalidate(0, tasks = $$props.tasks);
    		if ('editStatus' in $$props) editStatus = $$props.editStatus;
    		if ('currentId' in $$props) currentId = $$props.currentId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tasks,
    		task,
    		handleSubmit,
    		deleteTask,
    		editTask,
    		input_input_handler,
    		textarea_input_handler
    	];
    }

    class Tasks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tasks",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\views\login.svelte generated by Svelte v3.46.6 */

    const { console: console_1 } = globals;
    const file$1 = "src\\views\\login.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Login with Google";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Login with Google";
    			add_location(h1, file$1, 22, 2, 573);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 23, 2, 603);
    			add_location(div, file$1, 21, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*processAuth*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);

    	const processAuth = async () => {
    		try {
    			signInWithPopup(auth, provider).then(result => {
    				navigate('/tasks', { replace: true });
    			}).catch(error => {
    				const errorCode = error.code;
    				const errorMessage = error.message;
    				const email = error.email;
    			});
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		navigate,
    		auth,
    		signInWithPopup,
    		provider,
    		GoogleAuthProvider,
    		processAuth
    	});

    	return [processAuth];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.6 */
    const file = "src\\App.svelte";

    // (25:8) <Link to="/" class="btn btn-ghost">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("taskvelte");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(25:8) <Link to=\\\"/\\\" class=\\\"btn btn-ghost\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:14) <Link to="/">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(29:14) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:14) <Link to="/tasks">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Tasks");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(30:14) <Link to=\\\"/tasks\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:10) {#if !isLoggedUser}
    function create_if_block(ctx) {
    	let li;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/login",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			add_location(li, file, 31, 12, 870);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:10) {#if !isLoggedUser}",
    		ctx
    	});

    	return block;
    }

    // (32:16) <Link to="/login">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Login");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(32:16) <Link to=\\\"/login\\\">",
    		ctx
    	});

    	return block;
    }

    // (38:4) <Route path="/">
    function create_default_slot_3(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(38:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (39:4) <Route path="/tasks">
    function create_default_slot_2(ctx) {
    	let tasks;
    	let current;
    	tasks = new Tasks({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tasks.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tasks, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tasks.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tasks.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tasks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(39:4) <Route path=\\\"/tasks\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:4) <Route path="/login">
    function create_default_slot_1(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(40:4) <Route path=\\\"/login\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Router>
    function create_default_slot(ctx) {
    	let div2;
    	let div0;
    	let link0;
    	let t0;
    	let div1;
    	let ul;
    	let li0;
    	let link1;
    	let t1;
    	let li1;
    	let link2;
    	let t2;
    	let t3;
    	let route0;
    	let t4;
    	let route1;
    	let t5;
    	let route2;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				class: "btn btn-ghost",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "/tasks",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = !/*isLoggedUser*/ ctx[0] && create_if_block(ctx);

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/tasks",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/login",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			create_component(link1.$$.fragment);
    			t1 = space();
    			li1 = element("li");
    			create_component(link2.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(route0.$$.fragment);
    			t4 = space();
    			create_component(route1.$$.fragment);
    			t5 = space();
    			create_component(route2.$$.fragment);
    			attr_dev(div0, "class", "flex-1");
    			add_location(div0, file, 23, 6, 560);
    			add_location(li0, file, 28, 10, 744);
    			add_location(li1, file, 29, 10, 788);
    			attr_dev(ul, "class", "menu menu-horizontal p-0");
    			add_location(ul, file, 27, 8, 696);
    			attr_dev(div1, "class", "flex-none m-2");
    			add_location(div1, file, 26, 6, 660);
    			attr_dev(div2, "class", "navbar bg-base-100");
    			add_location(div2, file, 22, 4, 521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(link0, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			mount_component(link1, li0, null);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			mount_component(link2, li1, null);
    			append_dev(ul, t2);
    			if (if_block) if_block.m(ul, null);
    			insert_dev(target, t3, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);

    			if (!/*isLoggedUser*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*isLoggedUser*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(ul, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t3);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:2) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file, 19, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope, isLoggedUser*/ 3) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	useAuthUser();
    	let isLoggedUser = false;

    	isLogged.subscribe(data => {
    		$$invalidate(0, isLoggedUser = data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		Tasks,
    		Login,
    		useAuthUser,
    		isLogged,
    		isLoggedUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('isLoggedUser' in $$props) $$invalidate(0, isLoggedUser = $$props.isLoggedUser);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isLoggedUser];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // 🔶 Svelte ->

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
