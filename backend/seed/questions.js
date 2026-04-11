import 'dotenv/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Question from '../models/Question.js';

const QUESTIONS = [

  // ═══════════════════════════════════════════════════════
  // HTML / CSS  (~40 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is the difference between display: none and visibility: hidden in CSS?', category: 'html', difficulty: 'easy', expectedKeywords: ['layout', 'space', 'render'] },
  { text: 'Explain the CSS Box Model.', category: 'html', difficulty: 'easy', expectedKeywords: ['margin', 'padding', 'border', 'content'] },
  { text: 'What are semantic HTML elements? Give examples.', category: 'html', difficulty: 'easy', expectedKeywords: ['header', 'footer', 'article', 'section', 'accessibility'] },
  { text: 'Explain CSS specificity and how it is calculated.', category: 'html', difficulty: 'medium', expectedKeywords: ['inline', 'id', 'class', 'element', 'important'] },
  { text: 'What is Flexbox and how does it differ from CSS Grid?', category: 'html', difficulty: 'medium', expectedKeywords: ['one-dimensional', 'two-dimensional', 'flex-direction', 'grid-template'] },
  { text: 'What is the difference between inline, block, and inline-block elements?', category: 'html', difficulty: 'easy', expectedKeywords: ['width', 'height', 'line break', 'flow'] },
  { text: 'What are CSS pseudo-classes and pseudo-elements? Give examples.', category: 'html', difficulty: 'medium', expectedKeywords: [':hover', '::before', '::after', ':nth-child', 'state'] },
  { text: 'Explain CSS positioning: static, relative, absolute, fixed, sticky.', category: 'html', difficulty: 'medium', expectedKeywords: ['document flow', 'offset', 'viewport', 'scroll'] },
  { text: 'What is the difference between em, rem, px, and % units in CSS?', category: 'html', difficulty: 'easy', expectedKeywords: ['relative', 'root', 'parent', 'responsive'] },
  { text: 'How does CSS inheritance work?', category: 'html', difficulty: 'easy', expectedKeywords: ['parent', 'child', 'inherit', 'initial', 'property'] },
  { text: 'What are CSS media queries and how do you use them for responsive design?', category: 'html', difficulty: 'medium', expectedKeywords: ['breakpoint', 'viewport', 'mobile', 'min-width', 'max-width'] },
  { text: 'What is z-index and how does stacking context work?', category: 'html', difficulty: 'medium', expectedKeywords: ['overlap', 'layer', 'positioned', 'stacking context'] },
  { text: 'Explain the difference between min-width, max-width, and width in CSS.', category: 'html', difficulty: 'easy', expectedKeywords: ['constraint', 'responsive', 'overflow', 'flexible'] },
  { text: 'What is CSS Grid and how do you create a 12-column layout?', category: 'html', difficulty: 'medium', expectedKeywords: ['grid-template-columns', 'repeat', 'fr', 'gap'] },
  { text: 'What is the BEM methodology in CSS?', category: 'html', difficulty: 'medium', expectedKeywords: ['block', 'element', 'modifier', 'naming', 'convention'] },
  { text: 'What is CSS specificity hierarchy?', category: 'html', difficulty: 'medium', expectedKeywords: ['inline style', 'id', 'class', 'tag', 'importance'] },
  { text: 'What are CSS custom properties (variables) and how do you use them?', category: 'html', difficulty: 'medium', expectedKeywords: ['--variable', 'var()', 'root', 'scope', 'dynamic'] },
  { text: 'Explain the difference between nth-child and nth-of-type selectors.', category: 'html', difficulty: 'medium', expectedKeywords: ['sibling', 'type', 'index', 'selector'] },
  { text: 'What are HTML data attributes and when would you use them?', category: 'html', difficulty: 'easy', expectedKeywords: ['data-*', 'dataset', 'JavaScript', 'custom', 'metadata'] },
  { text: 'What is the difference between localStorage, sessionStorage, and cookies?', category: 'html', difficulty: 'medium', expectedKeywords: ['persistence', 'expiry', 'size', 'domain', 'HTTP only'] },
  { text: 'What is CSS animation and how does it differ from transitions?', category: 'html', difficulty: 'medium', expectedKeywords: ['keyframes', 'duration', 'trigger', 'loop', 'performance'] },
  { text: 'Explain CSS transform properties: translate, rotate, scale, skew.', category: 'html', difficulty: 'medium', expectedKeywords: ['2D', '3D', 'GPU', 'reflow', 'origin'] },
  { text: 'What is the viewport meta tag and why is it important?', category: 'html', difficulty: 'easy', expectedKeywords: ['mobile', 'width', 'initial-scale', 'responsive'] },
  { text: 'What is ARIA and how does it improve accessibility?', category: 'html', difficulty: 'medium', expectedKeywords: ['role', 'label', 'screen reader', 'accessible', 'landmark'] },
  { text: 'What is the difference between <script>, <script async>, and <script defer>?', category: 'html', difficulty: 'medium', expectedKeywords: ['blocking', 'parallel', 'DOMContentLoaded', 'order'] },
  { text: 'What are CSS preprocessors like SASS/LESS and what features do they add?', category: 'html', difficulty: 'medium', expectedKeywords: ['variables', 'nesting', 'mixin', 'extend', 'compile'] },
  { text: 'What is the critical rendering path in browsers?', category: 'html', difficulty: 'hard', expectedKeywords: ['DOM', 'CSSOM', 'render tree', 'layout', 'paint'] },
  { text: 'Explain how CSS specificity conflicts are resolved.', category: 'html', difficulty: 'hard', expectedKeywords: ['!important', 'inline', 'specificity score', 'cascade'] },
  { text: 'What is a CSS reset vs normalize.css?', category: 'html', difficulty: 'easy', expectedKeywords: ['browser defaults', 'consistency', 'baseline', 'cross-browser'] },
  { text: 'What is the difference between content-box and border-box in box-sizing?', category: 'html', difficulty: 'medium', expectedKeywords: ['padding', 'border', 'width calculation', 'layout'] },

  // ═══════════════════════════════════════════════════════
  // JAVASCRIPT  (~80 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is the difference between var, let, and const?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['scope', 'hoisting', 'block', 'function', 'reassign'] },
  { text: 'What is a closure in JavaScript? Give a real-world example.', category: 'javascript', difficulty: 'medium', expectedKeywords: ['inner function', 'outer scope', 'private', 'lexical'] },
  { text: 'Explain the event loop in JavaScript.', category: 'javascript', difficulty: 'medium', expectedKeywords: ['call stack', 'task queue', 'microtask', 'web api', 'non-blocking'] },
  { text: 'What is the difference between == and === in JavaScript?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['type coercion', 'strict equality', 'loose'] },
  { text: 'What are Promises and how do they differ from async/await?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['asynchronous', 'resolve', 'reject', 'then', 'catch'] },
  { text: 'Explain prototypal inheritance in JavaScript.', category: 'javascript', difficulty: 'hard', expectedKeywords: ['prototype chain', 'Object.create', '__proto__', 'constructor'] },
  { text: 'What is the purpose of the "this" keyword in JavaScript?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['context', 'bind', 'call', 'apply', 'arrow function'] },
  { text: 'What is hoisting in JavaScript?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['declaration', 'initialization', 'var', 'function', 'top'] },
  { text: 'Explain the difference between null and undefined in JavaScript.', category: 'javascript', difficulty: 'easy', expectedKeywords: ['intentional', 'uninitialized', 'typeof', 'assignment'] },
  { text: 'What are arrow functions and how do they differ from regular functions?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['this', 'lexical', 'arguments', 'syntax', 'constructor'] },
  { text: 'What is destructuring in JavaScript?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['object', 'array', 'extract', 'default', 'rename'] },
  { text: 'Explain the spread and rest operators in JavaScript.', category: 'javascript', difficulty: 'easy', expectedKeywords: ['...', 'expand', 'collect', 'copy', 'merge'] },
  { text: 'What is a higher-order function? Give examples.', category: 'javascript', difficulty: 'medium', expectedKeywords: ['map', 'filter', 'reduce', 'callback', 'return function'] },
  { text: 'What is the difference between map, filter, and reduce?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['transform', 'select', 'accumulate', 'array', 'immutable'] },
  { text: 'What is event bubbling and event capturing in JavaScript?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['propagation', 'parent', 'stopPropagation', 'addEventListener', 'capture phase'] },
  { text: 'What is debouncing and throttling?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['delay', 'rate limit', 'scroll', 'resize', 'performance'] },
  { text: 'Explain the difference between synchronous and asynchronous JavaScript.', category: 'javascript', difficulty: 'easy', expectedKeywords: ['blocking', 'non-blocking', 'callback', 'event loop', 'setTimeout'] },
  { text: 'What are JavaScript modules (ES modules)?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['import', 'export', 'default', 'named', 'scope'] },
  { text: 'What is the difference between call, apply, and bind?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['this', 'invoke', 'arguments', 'array', 'partial application'] },
  { text: 'What is a generator function in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['function*', 'yield', 'iterator', 'lazy', 'next()'] },
  { text: 'What is the Symbol primitive type in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['unique', 'immutable', 'property key', 'well-known', 'iterator'] },
  { text: 'Explain WeakMap and WeakSet in JavaScript.', category: 'javascript', difficulty: 'hard', expectedKeywords: ['weak reference', 'garbage collection', 'object key', 'memory'] },
  { text: 'What is the Proxy object in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['intercept', 'handler', 'trap', 'get', 'set'] },
  { text: 'What is memoization and how do you implement it?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['cache', 'pure function', 'performance', 'Map', 'result'] },
  { text: 'What is the difference between deep copy and shallow copy?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['reference', 'nested', 'JSON', 'structuredClone', 'spread'] },
  { text: 'Explain Promise.all, Promise.race, Promise.any, and Promise.allSettled.', category: 'javascript', difficulty: 'medium', expectedKeywords: ['concurrent', 'reject', 'first', 'settle', 'fulfilled'] },
  { text: 'What is optional chaining (?.) and nullish coalescing (??) in JavaScript?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['undefined', 'null', 'safe access', 'default', 'short circuit'] },
  { text: 'How does garbage collection work in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['mark and sweep', 'reference counting', 'memory leak', 'V8', 'reachability'] },
  { text: 'What is the difference between for...in and for...of loops?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['object keys', 'iterable', 'array', 'enumerable', 'prototype'] },
  { text: 'What is currying in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['partial application', 'function factory', 'unary', 'compose', 'arguments'] },
  { text: 'What is the temporal dead zone in JavaScript?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['let', 'const', 'hoisted', 'not initialized', 'ReferenceError'] },
  { text: 'Explain IIFE (Immediately Invoked Function Expression).', category: 'javascript', difficulty: 'medium', expectedKeywords: ['scope', 'avoid pollution', 'module pattern', 'self-invoke', 'encapsulate'] },
  { text: 'What is the difference between Object.freeze() and Object.seal()?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['immutable', 'add', 'modify', 'delete', 'property'] },
  { text: 'How do you handle errors in async/await?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['try', 'catch', 'finally', 'reject', 'Promise'] },
  { text: 'What is event delegation in JavaScript?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['parent', 'target', 'bubbling', 'dynamic', 'performance'] },
  { text: 'What is the difference between Array.from() and Array.of()?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['iterable', 'arguments', 'length', 'convert', 'create'] },
  { text: 'What are tagged template literals in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['template string', 'function', 'strings', 'values', 'raw'] },
  { text: 'How does the fetch API differ from XMLHttpRequest?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['Promise', 'modern', 'streaming', 'CORS', 'headers'] },
  { text: 'What is a Symbol.iterator and how do you make an object iterable?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['protocol', 'next()', 'done', 'value', 'for...of'] },
  { text: 'Explain the concept of function composition in JavaScript.', category: 'javascript', difficulty: 'hard', expectedKeywords: ['compose', 'pipe', 'output', 'input', 'functional'] },
  { text: 'What are JavaScript decorators?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['class', 'method', 'property', 'metadata', 'annotation'] },
  { text: 'What is the difference between setTimeout and setInterval?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['delay', 'repeat', 'clearTimeout', 'clearInterval', 'callback'] },
  { text: 'How does JSON.stringify handle undefined, functions, and symbols?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['omit', 'null', 'replacer', 'serialize', 'skip'] },
  { text: 'What are the different ways to create objects in JavaScript?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['literal', 'constructor', 'Object.create', 'class', 'factory'] },
  { text: 'What is the difference between a shallow and deep equality check?', category: 'javascript', difficulty: 'medium', expectedKeywords: ['reference', 'value', 'nested', 'recursive', 'lodash'] },
  { text: 'How does async iteration work in JavaScript?', category: 'javascript', difficulty: 'hard', expectedKeywords: ['for await...of', 'Symbol.asyncIterator', 'async generator', 'stream'] },
  { text: 'What is the purpose of Object.keys(), Object.values(), and Object.entries()?', category: 'javascript', difficulty: 'easy', expectedKeywords: ['enumerate', 'array', 'own', 'iterable', 'property'] },

  // ═══════════════════════════════════════════════════════
  // REACT  (~80 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is the Virtual DOM and how does React use it?', category: 'react', difficulty: 'medium', expectedKeywords: ['reconciliation', 'diffing', 'real DOM', 'performance'] },
  { text: 'Explain the difference between props and state in React.', category: 'react', difficulty: 'easy', expectedKeywords: ['immutable', 'parent', 'mutable', 'component'] },
  { text: 'What is useEffect and when would you use it?', category: 'react', difficulty: 'medium', expectedKeywords: ['side effect', 'cleanup', 'dependency array', 'lifecycle'] },
  { text: 'What are React hooks? Name and explain 5 commonly used hooks.', category: 'react', difficulty: 'medium', expectedKeywords: ['useState', 'useEffect', 'useRef', 'useContext', 'useMemo'] },
  { text: 'Explain the Context API and when to use it over Redux.', category: 'react', difficulty: 'hard', expectedKeywords: ['global state', 'provider', 'consumer', 're-render', 'performance'] },
  { text: 'What is React.memo and when should you use it?', category: 'react', difficulty: 'hard', expectedKeywords: ['memoization', 'shallow comparison', 'performance', 'pure component'] },
  { text: 'What is the difference between controlled and uncontrolled components?', category: 'react', difficulty: 'medium', expectedKeywords: ['state', 'ref', 'input', 'onChange', 'DOM'] },
  { text: 'Explain the React component lifecycle.', category: 'react', difficulty: 'medium', expectedKeywords: ['mount', 'update', 'unmount', 'componentDidMount', 'useEffect'] },
  { text: 'What is useCallback and how does it differ from useMemo?', category: 'react', difficulty: 'medium', expectedKeywords: ['memoize function', 'memoize value', 'dependency', 'performance', 're-render'] },
  { text: 'What is useRef and what are its common use cases?', category: 'react', difficulty: 'medium', expectedKeywords: ['DOM', 'mutable', 'persist', 'focus', 'no re-render'] },
  { text: 'What is code splitting in React and how do you implement it?', category: 'react', difficulty: 'hard', expectedKeywords: ['lazy', 'Suspense', 'dynamic import', 'bundle', 'chunk'] },
  { text: 'What are higher-order components (HOCs) in React?', category: 'react', difficulty: 'hard', expectedKeywords: ['wrapper', 'enhance', 'props', 'reuse', 'pattern'] },
  { text: 'What are render props in React?', category: 'react', difficulty: 'hard', expectedKeywords: ['function as child', 'share logic', 'dynamic rendering', 'pattern'] },
  { text: 'What is React Suspense and how does it work?', category: 'react', difficulty: 'hard', expectedKeywords: ['lazy loading', 'fallback', 'async', 'concurrent', 'streaming'] },
  { text: 'Explain the difference between useLayoutEffect and useEffect.', category: 'react', difficulty: 'hard', expectedKeywords: ['synchronous', 'paint', 'DOM mutation', 'timing', 'blocking'] },
  { text: 'What is React Concurrent Mode?', category: 'react', difficulty: 'hard', expectedKeywords: ['interruptible', 'priority', 'startTransition', 'useDeferredValue', 'scheduler'] },
  { text: 'How do you prevent unnecessary re-renders in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['memo', 'useCallback', 'useMemo', 'state structure', 'key'] },
  { text: 'What is the key prop in React and why is it important?', category: 'react', difficulty: 'easy', expectedKeywords: ['list', 'reconciliation', 'identity', 'unique', 'reorder'] },
  { text: 'What is React.Fragment and when would you use it?', category: 'react', difficulty: 'easy', expectedKeywords: ['wrapper', 'extra DOM', 'sibling', 'short syntax', '<>'] },
  { text: 'How does React handle forms?', category: 'react', difficulty: 'easy', expectedKeywords: ['controlled', 'onChange', 'onSubmit', 'preventDefault', 'state'] },
  { text: 'What is the useReducer hook and when would you use it over useState?', category: 'react', difficulty: 'medium', expectedKeywords: ['action', 'dispatch', 'complex state', 'redux-like', 'reducer'] },
  { text: 'What is React.createContext and how do you use it?', category: 'react', difficulty: 'medium', expectedKeywords: ['Provider', 'Consumer', 'useContext', 'value', 'tree'] },
  { text: 'What is React.forwardRef and when would you need it?', category: 'react', difficulty: 'hard', expectedKeywords: ['ref', 'child', 'expose', 'DOM', 'imperative'] },
  { text: 'How do you test React components?', category: 'react', difficulty: 'medium', expectedKeywords: ['Jest', 'React Testing Library', 'render', 'screen', 'user event'] },
  { text: 'What is error boundary in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['componentDidCatch', 'getDerivedStateFromError', 'fallback UI', 'class component'] },
  { text: 'What is the difference between React.cloneElement and createElement?', category: 'react', difficulty: 'hard', expectedKeywords: ['copy', 'new props', 'factory', 'type', 'existing element'] },
  { text: 'How does React handle event handling compared to regular DOM?', category: 'react', difficulty: 'medium', expectedKeywords: ['synthetic event', 'SyntheticEvent', 'delegation', 'root', 'normalize'] },
  { text: 'What is Next.js and what problems does it solve over plain React?', category: 'react', difficulty: 'medium', expectedKeywords: ['SSR', 'SSG', 'routing', 'SEO', 'performance'] },
  { text: 'What is hydration in React?', category: 'react', difficulty: 'hard', expectedKeywords: ['SSR', 'server HTML', 'client attach', 'event listeners', 'reuse'] },
  { text: 'What is the difference between SSR, SSG, and CSR in Next.js?', category: 'react', difficulty: 'medium', expectedKeywords: ['getServerSideProps', 'getStaticProps', 'build time', 'request time', 'browser'] },
  { text: 'What is React Query and what problem does it solve?', category: 'react', difficulty: 'medium', expectedKeywords: ['server state', 'caching', 'invalidation', 'loading', 'refetch'] },
  { text: 'Explain Redux and its core concepts.', category: 'react', difficulty: 'medium', expectedKeywords: ['store', 'action', 'reducer', 'dispatch', 'selector'] },
  { text: 'What is Redux Toolkit and how does it simplify Redux?', category: 'react', difficulty: 'medium', expectedKeywords: ['createSlice', 'createAsyncThunk', 'Immer', 'boilerplate', 'configureStore'] },
  { text: 'What is Zustand and how does it compare to Redux?', category: 'react', difficulty: 'medium', expectedKeywords: ['lightweight', 'hook', 'no boilerplate', 'middleware', 'devtools'] },
  { text: 'What is the difference between useState and useRef for storing values?', category: 'react', difficulty: 'medium', expectedKeywords: ['re-render', 'mutable', 'persist', 'DOM', 'synchronous'] },
  { text: 'How do you implement infinite scrolling in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['IntersectionObserver', 'page', 'append', 'loading', 'sentinel'] },
  { text: 'What are React portals and when would you use them?', category: 'react', difficulty: 'hard', expectedKeywords: ['createPortal', 'outside root', 'modal', 'tooltip', 'z-index'] },
  { text: 'What is stale closure problem in React hooks?', category: 'react', difficulty: 'hard', expectedKeywords: ['useEffect', 'outdated value', 'dependency array', 'ref workaround', 'closure'] },
  { text: 'How do you optimize a large React list?', category: 'react', difficulty: 'hard', expectedKeywords: ['virtualization', 'react-window', 'react-virtual', 'key', 'memo'] },

  // ═══════════════════════════════════════════════════════
  // NODE.JS / EXPRESS  (~60 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is Node.js and why is it non-blocking?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['event loop', 'async', 'V8', 'single thread', 'I/O'] },
  { text: 'What is middleware in Express.js? How does the request pipeline work?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['next()', 'req', 'res', 'chain', 'order'] },
  { text: 'How would you handle errors in an Express application?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['try catch', 'error middleware', 'next(err)', 'status code'] },
  { text: 'What is the difference between require and import in Node.js?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['CommonJS', 'ES modules', 'synchronous', 'dynamic'] },
  { text: 'How do you handle authentication with JWT in Node.js?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['sign', 'verify', 'secret', 'payload', 'middleware'] },
  { text: 'Explain streams in Node.js and their advantage.', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['readable', 'writable', 'pipe', 'memory', 'chunks'] },
  { text: 'What is the Node.js cluster module and when would you use it?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['multi-core', 'fork', 'master', 'worker', 'load balance'] },
  { text: 'How does Node.js handle concurrency with a single thread?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['event loop', 'libuv', 'async', 'non-blocking', 'callback'] },
  { text: 'What is the difference between process.nextTick() and setImmediate()?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['microtask', 'event loop phase', 'I/O', 'priority', 'tick'] },
  { text: 'How do you implement rate limiting in an Express app?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['express-rate-limit', 'token bucket', 'window', '429', 'Redis'] },
  { text: 'What is CORS and how do you enable it in Express?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['origin', 'headers', 'preflight', 'cors middleware', 'allow'] },
  { text: 'What is the difference between app.use() and app.get() in Express?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['all methods', 'specific method', 'middleware', 'path', 'route'] },
  { text: 'How do you secure an Express.js application?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['helmet', 'HTTPS', 'input validation', 'rate limit', 'auth'] },
  { text: 'What is the event emitter pattern in Node.js?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['EventEmitter', 'on', 'emit', 'once', 'listener'] },
  { text: 'How do you read and write files in Node.js?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['fs', 'readFile', 'writeFile', 'async', 'stream'] },
  { text: 'What is the purpose of package.json in a Node.js project?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['dependencies', 'scripts', 'version', 'metadata', 'npm'] },
  { text: 'How do you handle environment variables in Node.js?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['process.env', 'dotenv', '.env', 'config', 'secrets'] },
  { text: 'What is the difference between npm and npx?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['execute', 'install', 'global', 'local', 'package runner'] },
  { text: 'How do you implement pagination in an Express API?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['limit', 'skip', 'page', 'offset', 'cursor'] },
  { text: 'What is the purpose of the Buffer class in Node.js?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['binary', 'raw data', 'encoding', 'stream', 'fixed size'] },
  { text: 'How do you implement WebSockets in Node.js?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['ws', 'socket.io', 'upgrade', 'real-time', 'persistent connection'] },
  { text: 'What is Express Router and how do you organize routes?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['modular', 'prefix', 'mount', 'middleware', 'separation'] },
  { text: 'How do you handle file uploads in Express?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['multer', 'multipart', 'form-data', 'stream', 'disk storage'] },
  { text: 'What is the difference between HTTP and HTTPS?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['SSL', 'TLS', 'encryption', 'certificate', 'secure'] },
  { text: 'How do you implement caching in a Node.js application?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['Redis', 'in-memory', 'TTL', 'cache-aside', 'invalidation'] },
  { text: 'What is the purpose of the crypto module in Node.js?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['hash', 'encrypt', 'decrypt', 'HMAC', 'random bytes'] },
  { text: 'How would you debug a Node.js application?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['--inspect', 'Chrome DevTools', 'console', 'breakpoint', 'logger'] },
  { text: 'What is graceful shutdown in Node.js?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['SIGTERM', 'close server', 'drain connections', 'cleanup', 'process.on'] },
  { text: 'What is the difference between monolithic and microservices architecture?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['single', 'distributed', 'scalability', 'deployment', 'communication'] },
  { text: 'How do you implement a job queue in Node.js?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['Bull', 'BullMQ', 'Redis', 'worker', 'retry'] },
  { text: 'What is dependency injection and how can you use it in Node.js?', category: 'nodejs', difficulty: 'hard', expectedKeywords: ['decouple', 'constructor', 'container', 'testable', 'inversion of control'] },

  // ═══════════════════════════════════════════════════════
  // MONGODB  (~50 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is MongoDB and how is it different from SQL databases?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['NoSQL', 'document', 'schema-less', 'BSON', 'collection'] },
  { text: 'What are indexes in MongoDB and why are they important?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['performance', 'query', 'compound', 'slow query'] },
  { text: 'Explain the aggregation pipeline in MongoDB.', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['match', 'group', 'project', 'lookup', 'pipeline stages'] },
  { text: 'What is Mongoose and what advantages does it provide?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['schema', 'model', 'validation', 'middleware', 'ODM'] },
  { text: 'How do you handle relationships in MongoDB (embedded vs referenced)?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['embed', 'reference', 'ObjectId', 'populate', 'trade-offs'] },
  { text: 'What is the difference between find() and findOne() in MongoDB?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['cursor', 'single document', 'array', 'limit', 'first match'] },
  { text: 'What is the difference between updateOne, updateMany, and findOneAndUpdate?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['modify', 'return', 'new', 'upsert', 'filter'] },
  { text: 'What are MongoDB transactions and when should you use them?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['ACID', 'session', 'multi-document', 'rollback', 'replica set'] },
  { text: 'What is a replica set in MongoDB?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['primary', 'secondary', 'election', 'failover', 'high availability'] },
  { text: 'What is sharding in MongoDB?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['horizontal scaling', 'shard key', 'chunk', 'mongos', 'config server'] },
  { text: 'How does MongoDB ensure data durability?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['journaling', 'write concern', 'oplog', 'WAL', 'majority'] },
  { text: 'What is the $lookup stage in the aggregation pipeline?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['join', 'foreign collection', 'localField', 'foreignField', 'as'] },
  { text: 'What are MongoDB change streams?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['real-time', 'watch', 'oplog', 'event', 'resume token'] },
  { text: 'How do you create and use indexes in Mongoose?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['schema index', 'compound', 'unique', 'sparse', 'ensureIndexes'] },
  { text: 'What is the difference between $set and $push in MongoDB update operators?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['field', 'array', 'modify', 'append', 'operator'] },
  { text: 'How do you handle soft deletes in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['deletedAt', 'isDeleted', 'filter', 'restore', 'flag'] },
  { text: 'What is GridFS in MongoDB?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['large file', 'chunks', 'metadata', 'stream', '16MB limit'] },
  { text: 'What is the explain() method in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['query plan', 'index scan', 'collection scan', 'IXSCAN', 'performance'] },
  { text: 'What is a capped collection in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['fixed size', 'FIFO', 'log', 'insertion order', 'no delete'] },
  { text: 'How do you model a many-to-many relationship in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['array of references', 'intermediate collection', 'denormalize', 'ObjectId'] },
  { text: 'What is the difference between MongoDB Atlas and a self-hosted MongoDB?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['cloud', 'managed', 'backup', 'scaling', 'monitoring'] },
  { text: 'How do you optimize slow queries in MongoDB?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['index', 'explain', 'projection', 'limit', 'profiler'] },
  { text: 'What are Mongoose middleware hooks (pre/post)?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['pre save', 'post find', 'plugin', 'document middleware', 'query middleware'] },
  { text: 'What is the difference between count() and countDocuments() in MongoDB?', category: 'mongodb', difficulty: 'easy', expectedKeywords: ['deprecated', 'filter', 'accurate', 'index', 'collection'] },
  { text: 'How does text search work in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['text index', '$text', '$search', 'language', 'score'] },

  // ═══════════════════════════════════════════════════════
  // MERN / FULLSTACK  (~40 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'Walk me through how a MERN stack application handles a user login.', category: 'mern', difficulty: 'medium', expectedKeywords: ['React', 'form', 'axios', 'Express', 'MongoDB', 'JWT', 'response'] },
  { text: 'How would you implement real-time features in a MERN app?', category: 'mern', difficulty: 'hard', expectedKeywords: ['Socket.io', 'WebSocket', 'server events', 'polling'] },
  { text: 'What is REST API? How does it differ from GraphQL?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['endpoints', 'HTTP methods', 'over-fetching', 'query', 'schema'] },
  { text: 'How do you manage environment variables and secrets in a Node app?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['.env', 'dotenv', 'process.env', 'gitignore', 'secrets'] },
  { text: 'How would you implement role-based access control (RBAC) in MERN?', category: 'mern', difficulty: 'hard', expectedKeywords: ['roles', 'permissions', 'middleware', 'token', 'authorization'] },
  { text: 'What is the difference between authentication and authorization?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['identity', 'permission', 'JWT', 'OAuth', 'resource'] },
  { text: 'How do you implement search functionality in a MERN app?', category: 'mern', difficulty: 'medium', expectedKeywords: ['text index', 'regex', 'Elasticsearch', 'debounce', 'query'] },
  { text: 'How do you handle image uploads in a MERN application?', category: 'mern', difficulty: 'medium', expectedKeywords: ['multer', 'Cloudinary', 'S3', 'base64', 'form-data'] },
  { text: 'What is the MERN stack and what are the advantages of using it?', category: 'mern', difficulty: 'easy', expectedKeywords: ['JavaScript', 'full stack', 'JSON', 'ecosystem', 'single language'] },
  { text: 'How would you implement an infinite scroll with React and Express?', category: 'mern', difficulty: 'medium', expectedKeywords: ['cursor', 'limit', 'IntersectionObserver', 'page', 'append'] },
  { text: 'What is GraphQL and how would you integrate it into a MERN app?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['schema', 'resolver', 'query', 'mutation', 'Apollo'] },
  { text: 'How do you implement email verification in a MERN app?', category: 'mern', difficulty: 'medium', expectedKeywords: ['token', 'nodemailer', 'link', 'expiry', 'verify'] },
  { text: 'What is the difference between optimistic and pessimistic UI updates?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['immediate', 'rollback', 'confirmation', 'UX', 'mutation'] },
  { text: 'How would you implement a shopping cart in a MERN application?', category: 'mern', difficulty: 'medium', expectedKeywords: ['state', 'localStorage', 'session', 'DB', 'quantity'] },
  { text: 'How do you handle concurrent requests in a Node.js API?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['async', 'queue', 'Promise.all', 'race condition', 'locking'] },
  { text: 'What is server-side rendering (SSR) and when would you use it?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['SEO', 'first paint', 'hydration', 'Next.js', 'TTFB'] },
  { text: 'How do you implement dark mode in a React application?', category: 'frontend', difficulty: 'easy', expectedKeywords: ['context', 'localStorage', 'CSS variables', 'prefers-color-scheme', 'toggle'] },
  { text: 'What is an API gateway and why would you use one?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['routing', 'auth', 'rate limit', 'aggregation', 'microservices'] },
  { text: 'How do you handle CSRF attacks in a web application?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['token', 'SameSite', 'origin', 'double submit', 'header'] },
  { text: 'What is XSS and how do you prevent it?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['sanitize', 'escape', 'CSP', 'innerHTML', 'inject'] },

  // ═══════════════════════════════════════════════════════
  // SYSTEM DESIGN  (~50 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'How would you design a URL shortener service?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['hash', 'database', 'redirect', 'cache', 'scalability'] },
  { text: 'What is horizontal vs vertical scaling?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['load balancer', 'add servers', 'add resources', 'limit'] },
  { text: 'Explain caching and when you would use Redis.', category: 'system_design', difficulty: 'medium', expectedKeywords: ['in-memory', 'TTL', 'invalidation', 'performance', 'session'] },
  { text: 'What is a CDN and how does it improve performance?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['edge', 'latency', 'cache', 'origin', 'geographic'] },
  { text: 'How would you design a real-time chat application?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['WebSocket', 'message queue', 'presence', 'persistence', 'scale'] },
  { text: 'What is the CAP theorem?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['consistency', 'availability', 'partition tolerance', 'trade-off', 'distributed'] },
  { text: 'How would you design a notification system?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['push', 'queue', 'worker', 'delivery', 'retry'] },
  { text: 'What is a message queue and when would you use one?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['async', 'decouple', 'RabbitMQ', 'Kafka', 'worker'] },
  { text: 'How would you design a file storage system like Dropbox?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['S3', 'metadata', 'sync', 'chunk', 'versioning'] },
  { text: 'What is database sharding and when would you use it?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['partition', 'shard key', 'horizontal', 'routing', 'rebalance'] },
  { text: 'How would you design an API rate limiter?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['token bucket', 'sliding window', 'Redis', 'throttle', '429'] },
  { text: 'What is eventual consistency vs strong consistency?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['distributed', 'delay', 'replica', 'trade-off', 'BASE'] },
  { text: 'How would you design a social media feed (like Twitter)?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['fanout', 'push', 'pull', 'cache', 'timeline'] },
  { text: 'What is a load balancer and what algorithms does it use?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['round robin', 'least connections', 'IP hash', 'health check', 'sticky session'] },
  { text: 'What is the difference between SQL and NoSQL databases?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['schema', 'ACID', 'horizontal', 'flexible', 'join'] },
  { text: 'How would you design an authentication system?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['JWT', 'refresh token', 'OAuth', 'session', 'bcrypt'] },
  { text: 'What is circuit breaker pattern?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['failure', 'open', 'closed', 'half-open', 'resilience'] },
  { text: 'How would you implement a search engine?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['inverted index', 'crawler', 'ranking', 'Elasticsearch', 'tokenize'] },
  { text: 'What is the saga pattern in microservices?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['distributed transaction', 'choreography', 'orchestration', 'compensate', 'rollback'] },
  { text: 'How would you design a video streaming service?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['CDN', 'adaptive bitrate', 'transcoding', 'chunk', 'HLS'] },
  { text: 'What is the difference between synchronous and asynchronous communication in distributed systems?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['HTTP', 'message queue', 'coupling', 'latency', 'retry'] },
  { text: 'How would you monitor and observe a distributed system?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['logging', 'metrics', 'tracing', 'alerting', 'Prometheus'] },
  { text: 'What is a reverse proxy and what is it used for?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['Nginx', 'SSL termination', 'load balance', 'cache', 'hide backend'] },
  { text: 'How do you handle database migrations in production?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['zero downtime', 'backward compatible', 'rollback', 'flyway', 'versioned'] },
  { text: 'What is blue-green deployment?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['zero downtime', 'switch', 'rollback', 'production', 'environment'] },

  // ═══════════════════════════════════════════════════════
  // DATA STRUCTURES & ALGORITHMS  (~50 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is the difference between an array and a linked list?', category: 'data_structures', difficulty: 'easy', expectedKeywords: ['index', 'node', 'pointer', 'memory', 'insertion'] },
  { text: 'Explain Big O notation and give examples of O(1), O(n), O(log n), O(n²).', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['time complexity', 'space complexity', 'constant', 'linear', 'logarithmic'] },
  { text: 'What is a hash map and how does it work?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['hash function', 'collision', 'bucket', 'O(1)', 'key-value'] },
  { text: 'What is the difference between a stack and a queue?', category: 'data_structures', difficulty: 'easy', expectedKeywords: ['LIFO', 'FIFO', 'push', 'pop', 'enqueue'] },
  { text: 'Explain binary search and its time complexity.', category: 'data_structures', difficulty: 'easy', expectedKeywords: ['sorted', 'O(log n)', 'divide', 'midpoint', 'compare'] },
  { text: 'What is a binary search tree and its operations?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['left', 'right', 'insert', 'search', 'O(log n)'] },
  { text: 'What is the difference between depth-first search (DFS) and breadth-first search (BFS)?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['stack', 'queue', 'recursive', 'level', 'graph'] },
  { text: 'What is dynamic programming and how do you identify DP problems?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['memoization', 'tabulation', 'overlapping', 'optimal substructure', 'state'] },
  { text: 'What is a heap data structure and what is it used for?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['min-heap', 'max-heap', 'priority queue', 'O(log n)', 'heapify'] },
  { text: 'Explain quicksort and its average vs worst case complexity.', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['pivot', 'partition', 'O(n log n)', 'O(n²)', 'in-place'] },
  { text: 'What is merge sort and how does it work?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['divide and conquer', 'merge', 'O(n log n)', 'stable', 'space'] },
  { text: 'What is a graph and what are common ways to represent it?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['adjacency list', 'adjacency matrix', 'vertex', 'edge', 'directed'] },
  { text: 'What is a trie and when would you use it?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['prefix tree', 'autocomplete', 'string search', 'node', 'O(m)'] },
  { text: 'Explain Dijkstra\'s algorithm.', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['shortest path', 'weighted', 'priority queue', 'greedy', 'visited'] },
  { text: 'What is a circular linked list and what problems can it cause?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['cycle', 'infinite loop', 'Floyd', 'detection', 'tail'] },
  { text: 'What is memoization vs tabulation in dynamic programming?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['top-down', 'bottom-up', 'cache', 'recursive', 'iterative'] },
  { text: 'What is the two-pointer technique and when do you use it?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['sorted', 'O(n)', 'converge', 'window', 'pair'] },
  { text: 'What is a sliding window algorithm?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['subarray', 'substring', 'O(n)', 'expand', 'shrink'] },
  { text: 'Explain the concept of backtracking.', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['recursive', 'undo', 'pruning', 'candidate', 'constraint'] },
  { text: 'What is a monotonic stack and when is it useful?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['increasing', 'decreasing', 'next greater', 'O(n)', 'span'] },
  { text: 'How do you detect a cycle in a linked list?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['Floyd', 'slow', 'fast', 'pointer', 'meeting point'] },
  { text: 'What is a balanced binary tree? Give examples.', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['AVL', 'Red-Black', 'height', 'O(log n)', 'rotation'] },
  { text: 'What is topological sorting and when is it used?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['DAG', 'dependency', 'Kahn', 'DFS', 'in-degree'] },

  // ═══════════════════════════════════════════════════════
  // PYTHON  (~40 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What are Python decorators and how do they work?', category: 'python', difficulty: 'medium', expectedKeywords: ['wrapper', '@', 'higher-order', 'function', 'closure'] },
  { text: 'What is the difference between a list, tuple, and set in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['mutable', 'immutable', 'ordered', 'unique', 'hashable'] },
  { text: 'What are Python generators and how do they work?', category: 'python', difficulty: 'medium', expectedKeywords: ['yield', 'lazy', 'iterator', 'memory', 'next()'] },
  { text: 'What is the difference between is and == in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['identity', 'equality', 'memory', 'object', 'id()'] },
  { text: 'What is a Python context manager and how do you create one?', category: 'python', difficulty: 'medium', expectedKeywords: ['with', '__enter__', '__exit__', 'resource', 'cleanup'] },
  { text: 'What is the GIL in Python and how does it affect multithreading?', category: 'python', difficulty: 'hard', expectedKeywords: ['Global Interpreter Lock', 'thread', 'CPU-bound', 'I/O-bound', 'multiprocessing'] },
  { text: 'What are Python list comprehensions and when should you use them?', category: 'python', difficulty: 'easy', expectedKeywords: ['concise', 'filter', 'map', 'readable', 'performance'] },
  { text: 'What is the difference between *args and **kwargs in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['positional', 'keyword', 'variable', 'unpack', 'flexible'] },
  { text: 'What are Python dunder (magic) methods?', category: 'python', difficulty: 'medium', expectedKeywords: ['__init__', '__str__', '__repr__', '__len__', 'operator overload'] },
  { text: 'What is multiple inheritance in Python and what is the MRO?', category: 'python', difficulty: 'hard', expectedKeywords: ['Method Resolution Order', 'C3 linearization', 'super()', 'diamond problem'] },
  { text: 'What are Python dataclasses?', category: 'python', difficulty: 'medium', expectedKeywords: ['@dataclass', 'field', 'auto', '__init__', 'type hint'] },
  { text: 'What is asyncio in Python?', category: 'python', difficulty: 'hard', expectedKeywords: ['async', 'await', 'event loop', 'coroutine', 'I/O bound'] },
  { text: 'What is the difference between deepcopy and copy in Python?', category: 'python', difficulty: 'medium', expectedKeywords: ['nested', 'reference', 'independent', 'module', 'object'] },
  { text: 'How does Python handle memory management?', category: 'python', difficulty: 'hard', expectedKeywords: ['reference counting', 'garbage collection', 'cyclic', 'CPython', '__del__'] },
  { text: 'What are Python type hints and how do you use them?', category: 'python', difficulty: 'easy', expectedKeywords: ['annotation', 'mypy', 'Optional', 'Union', 'documentation'] },
  { text: 'What is the difference between a module and a package in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['file', 'directory', '__init__.py', 'import', 'namespace'] },
  { text: 'What is monkey patching in Python?', category: 'python', difficulty: 'medium', expectedKeywords: ['runtime', 'modify', 'attribute', 'testing', 'mock'] },
  { text: 'What are Python slots?', category: 'python', difficulty: 'hard', expectedKeywords: ['__slots__', 'memory', 'no __dict__', 'fixed attributes', 'performance'] },
  { text: 'How do you handle exceptions in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['try', 'except', 'else', 'finally', 'raise'] },
  { text: 'What is the difference between map(), filter(), and reduce() in Python?', category: 'python', difficulty: 'easy', expectedKeywords: ['transform', 'select', 'accumulate', 'functools', 'iterable'] },

  // ═══════════════════════════════════════════════════════
  // BEHAVIORAL  (~60 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'Tell me about a time you faced a difficult technical challenge and how you resolved it.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['problem', 'solution', 'team', 'outcome', 'learn'] },
  { text: 'Where do you see yourself in 5 years as a developer?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['growth', 'skill', 'role', 'goal', 'leadership'] },
  { text: 'Describe a situation where you had to work with a difficult team member.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['communication', 'conflict', 'resolve', 'empathy', 'outcome'] },
  { text: 'How do you stay updated with new technologies?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['blog', 'documentation', 'community', 'learn', 'practice'] },
  { text: 'Tell me about a project you are most proud of.', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['impact', 'challenge', 'role', 'tech', 'result'] },
  { text: 'How do you handle tight deadlines and pressure?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['prioritize', 'communicate', 'scope', 'focus', 'deliver'] },
  { text: 'Describe a time you received negative feedback. How did you handle it?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['listen', 'improve', 'accept', 'action', 'growth'] },
  { text: 'How do you approach learning a new technology quickly?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['docs', 'project', 'tutorial', 'practice', 'community'] },
  { text: 'Tell me about a time you made a mistake in production. What happened?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['identify', 'fix', 'communicate', 'prevent', 'postmortem'] },
  { text: 'How do you prioritize tasks when you have multiple deadlines?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['Eisenhower', 'impact', 'communicate', 'delegate', 'focus'] },
  { text: 'Describe your experience working in an Agile environment.', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['sprint', 'standup', 'retrospective', 'kanban', 'backlog'] },
  { text: 'How do you approach code reviews?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['constructive', 'learn', 'standards', 'feedback', 'collaboration'] },
  { text: 'Tell me about a time you disagreed with your team lead. How did you handle it?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['respect', 'data', 'discussion', 'compromise', 'professional'] },
  { text: 'How do you explain technical concepts to non-technical stakeholders?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['analogy', 'simplify', 'visual', 'impact', 'avoid jargon'] },
  { text: 'Describe a time when you had to learn something very quickly.', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['deadline', 'focused', 'resources', 'delivered', 'challenge'] },
  { text: 'What motivates you as a software developer?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['problem solving', 'impact', 'build', 'learn', 'creativity'] },
  { text: 'How do you handle imposter syndrome?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['recognize', 'growth mindset', 'community', 'achievements', 'normal'] },
  { text: 'Tell me about your most challenging debugging experience.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['isolate', 'logs', 'reproduce', 'fix', 'root cause'] },
  { text: 'How do you ensure the quality of your code?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['tests', 'review', 'lint', 'standards', 'refactor'] },
  { text: 'Describe a time you improved a process or workflow.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['identify', 'propose', 'implement', 'measure', 'result'] },
  { text: 'How do you handle working on legacy code?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['understand', 'tests', 'refactor', 'document', 'incremental'] },
  { text: 'Tell me about a time you mentored a junior developer.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['guide', 'patient', 'feedback', 'growth', 'support'] },
  { text: 'How do you deal with scope creep in a project?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['communicate', 'document', 'prioritize', 'say no', 'stakeholder'] },
  { text: 'What is your approach to writing documentation?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['README', 'comments', 'API docs', 'examples', 'maintain'] },
  { text: 'Describe a time you had to make a technical decision with incomplete information.', category: 'behavioral', difficulty: 'hard', expectedKeywords: ['risk', 'research', 'reversible', 'communicate', 'iterate'] },
  { text: 'How do you handle burnout?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['recognize', 'rest', 'boundaries', 'communicate', 'balance'] },
  { text: 'Tell me about your most successful team collaboration.', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['roles', 'communication', 'trust', 'deliver', 'shared goal'] },
  { text: 'How do you approach open source contributions?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['issues', 'PR', 'community', 'license', 'fork'] },
  { text: 'What makes a good software engineer in your opinion?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['curious', 'communicate', 'ownership', 'empathy', 'continuous learning'] },
  { text: 'How do you keep your codebase maintainable over time?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['SOLID', 'refactor', 'tests', 'documentation', 'review'] },

  // ═══════════════════════════════════════════════════════
  // MORE JAVASCRIPT  (continued)
  // ═══════════════════════════════════════════════════════
  { text: "What is the difference between localStorage and IndexedDB?", category: "javascript", difficulty: "medium", expectedKeywords: ["storage size", "async", "structured data", "key-value", "transactions"] },
  { text: "How does JavaScript handle number precision issues?", category: "javascript", difficulty: "medium", expectedKeywords: ["floating point", "IEEE 754", "Number.EPSILON", "toFixed", "BigInt"] },
  { text: "What is a WeakRef in JavaScript?", category: "javascript", difficulty: "hard", expectedKeywords: ["weak reference", "garbage collection", "FinalizationRegistry", "memory", "deref"] },
  { text: "What is the difference between Array.isArray() and instanceof Array?", category: "javascript", difficulty: "easy", expectedKeywords: ["iframe", "realm", "prototype", "reliable", "cross-frame"] },
  { text: "What is tail call optimization?", category: "javascript", difficulty: "hard", expectedKeywords: ["recursion", "stack overflow", "last call", "return", "optimize"] },
  { text: "How do you implement a linked list in JavaScript?", category: "javascript", difficulty: "medium", expectedKeywords: ["node", "next", "head", "tail", "insert"] },
  { text: "What is the purpose of Object.assign()?", category: "javascript", difficulty: "easy", expectedKeywords: ["shallow copy", "merge", "target", "source", "enumerable"] },
  { text: "What is the nullish assignment operator (??=)?", category: "javascript", difficulty: "easy", expectedKeywords: ["null", "undefined", "assign", "logical", "short circuit"] },
  { text: "What is the logical assignment operators (&&=, ||=)?", category: "javascript", difficulty: "easy", expectedKeywords: ["conditional assign", "truthy", "falsy", "short circuit", "ES2021"] },
  { text: "How do you implement an observable pattern in JavaScript?", category: "javascript", difficulty: "hard", expectedKeywords: ["subscribe", "notify", "observer", "publish", "event"] },

  // ═══════════════════════════════════════════════════════
  // MORE REACT  (continued)
  // ═══════════════════════════════════════════════════════
  { text: "What is React Server Components?", category: "react", difficulty: "hard", expectedKeywords: ["server", "no client JS", "streaming", "Next.js", "zero bundle"] },
  { text: "What is the app router in Next.js 13+?", category: "react", difficulty: "medium", expectedKeywords: ["file-based", "layout", "server component", "loading", "error"] },
  { text: "How do you implement optimistic updates in React?", category: "react", difficulty: "hard", expectedKeywords: ["immediate UI", "rollback", "mutation", "React Query", "state"] },
  { text: "What is SWR and how does it differ from React Query?", category: "react", difficulty: "medium", expectedKeywords: ["stale-while-revalidate", "cache", "Vercel", "deduplicate", "revalidate"] },
  { text: "What is the difference between React 17 and React 18?", category: "react", difficulty: "medium", expectedKeywords: ["concurrent", "automatic batching", "startTransition", "Suspense", "createRoot"] },
  { text: "How do you implement a custom hook?", category: "react", difficulty: "medium", expectedKeywords: ["use prefix", "reuse logic", "stateful", "extract", "compose"] },
  { text: "What is the useImperativeHandle hook?", category: "react", difficulty: "hard", expectedKeywords: ["ref", "expose", "forwardRef", "imperative API", "parent"] },
  { text: "What is React strict mode?", category: "react", difficulty: "easy", expectedKeywords: ["double invoke", "detect side effects", "legacy", "warnings", "development"] },
  { text: "How do you handle global state without Redux?", category: "react", difficulty: "medium", expectedKeywords: ["Context", "Zustand", "Jotai", "useReducer", "atom"] },
  { text: "What are the rules of hooks in React?", category: "react", difficulty: "easy", expectedKeywords: ["top level", "only React functions", "not conditional", "order", "eslint"] },
  { text: "What is reconciliation in React?", category: "react", difficulty: "medium", expectedKeywords: ["fiber", "diffing", "update", "tree", "minimize DOM"] },
  { text: "What is the difference between client-side and server-side rendering in React?", category: "react", difficulty: "easy", expectedKeywords: ["SEO", "TTFB", "hydration", "JavaScript", "performance"] },
  { text: "How do you handle authentication state in React?", category: "react", difficulty: "medium", expectedKeywords: ["Context", "protected route", "token", "localStorage", "redirect"] },
  { text: "What is React Fiber?", category: "react", difficulty: "hard", expectedKeywords: ["reconciliation engine", "interruptible", "priority", "concurrent", "work unit"] },
  { text: "How do you implement a drag and drop feature in React?", category: "react", difficulty: "medium", expectedKeywords: ["react-dnd", "drag events", "onDragStart", "onDrop", "dataTransfer"] },

  // ═══════════════════════════════════════════════════════
  // MORE NODE.JS  (continued)
  // ═══════════════════════════════════════════════════════
  { text: "What is tRPC and how does it work?", category: "nodejs", difficulty: "hard", expectedKeywords: ["type-safe", "end-to-end", "procedure", "router", "no schema"] },
  { text: "What is Fastify and how does it compare to Express?", category: "nodejs", difficulty: "medium", expectedKeywords: ["performance", "schema validation", "plugins", "JSON serialization", "faster"] },
  { text: "How do you implement OAuth2 in a Node.js application?", category: "nodejs", difficulty: "hard", expectedKeywords: ["authorization code", "access token", "refresh", "Passport", "redirect"] },
  { text: "What is the difference between pm2 and nodemon?", category: "nodejs", difficulty: "easy", expectedKeywords: ["production", "development", "watch", "cluster", "process manager"] },
  { text: "How do you implement health checks in a Node.js API?", category: "nodejs", difficulty: "medium", expectedKeywords: ["/health", "200", "DB check", "uptime", "monitoring"] },
  { text: "What is the difference between TCP and UDP?", category: "nodejs", difficulty: "medium", expectedKeywords: ["connection", "reliable", "ordered", "lossy", "streaming"] },
  { text: "How do you implement GraphQL in Node.js?", category: "nodejs", difficulty: "hard", expectedKeywords: ["Apollo Server", "typeDefs", "resolver", "schema", "query"] },
  { text: "What is the purpose of the http.Agent in Node.js?", category: "nodejs", difficulty: "hard", expectedKeywords: ["connection pooling", "keepAlive", "socket", "reuse", "maxSockets"] },
  { text: "How do you profile a Node.js application for performance?", category: "nodejs", difficulty: "hard", expectedKeywords: ["--prof", "clinic.js", "flame graph", "memory snapshot", "CPU"] },
  { text: "What is the worker_threads module in Node.js?", category: "nodejs", difficulty: "hard", expectedKeywords: ["CPU-bound", "parallel", "message port", "SharedArrayBuffer", "thread"] },

  // ═══════════════════════════════════════════════════════
  // DEVOPS / DEPLOYMENT  (~30 questions)
  // ═══════════════════════════════════════════════════════
  { text: "What is Docker and why is it used?", category: "devops", difficulty: "easy", expectedKeywords: ["container", "image", "isolated", "portable", "Dockerfile"] },
  { text: "What is the difference between a Docker image and a container?", category: "devops", difficulty: "easy", expectedKeywords: ["blueprint", "running instance", "layers", "read-only", "writable layer"] },
  { text: "What is Kubernetes and what problems does it solve?", category: "devops", difficulty: "medium", expectedKeywords: ["orchestration", "scaling", "self-healing", "pod", "deployment"] },
  { text: "What is CI/CD and how does it work?", category: "devops", difficulty: "medium", expectedKeywords: ["continuous integration", "continuous deployment", "pipeline", "test", "automate"] },
  { text: "What is the difference between Git merge and Git rebase?", category: "devops", difficulty: "medium", expectedKeywords: ["history", "linear", "commit", "conflict", "clean"] },
  { text: "What is a Dockerfile and what are its key instructions?", category: "devops", difficulty: "easy", expectedKeywords: ["FROM", "RUN", "COPY", "CMD", "EXPOSE"] },
  { text: "What is docker-compose and when would you use it?", category: "devops", difficulty: "easy", expectedKeywords: ["multi-container", "services", "network", "volume", "yaml"] },
  { text: "What is the difference between AWS EC2 and Lambda?", category: "devops", difficulty: "medium", expectedKeywords: ["server", "serverless", "event-driven", "billing", "cold start"] },
  { text: "What is Nginx and what is it used for?", category: "devops", difficulty: "easy", expectedKeywords: ["reverse proxy", "load balancer", "static files", "SSL", "upstream"] },
  { text: "What is a VPC in AWS?", category: "devops", difficulty: "medium", expectedKeywords: ["virtual network", "subnet", "security group", "NAT", "isolation"] },
  { text: "What is the difference between git fetch and git pull?", category: "devops", difficulty: "easy", expectedKeywords: ["download", "merge", "remote", "update", "local branch"] },
  { text: "What is a Kubernetes pod?", category: "devops", difficulty: "medium", expectedKeywords: ["container group", "shared network", "smallest unit", "lifecycle", "restart"] },
  { text: "What is infrastructure as code (IaC)?", category: "devops", difficulty: "medium", expectedKeywords: ["Terraform", "CloudFormation", "declarative", "version control", "reproducible"] },
  { text: "What is a deployment strategy: canary vs rolling vs blue-green?", category: "devops", difficulty: "hard", expectedKeywords: ["gradual", "subset", "zero downtime", "rollback", "traffic"] },
  { text: "What is S3 and what are common use cases?", category: "devops", difficulty: "easy", expectedKeywords: ["object storage", "bucket", "static hosting", "backup", "CDN origin"] },
  { text: "What is a Kubernetes service and what types exist?", category: "devops", difficulty: "medium", expectedKeywords: ["ClusterIP", "NodePort", "LoadBalancer", "expose", "DNS"] },
  { text: "What is Helm in Kubernetes?", category: "devops", difficulty: "medium", expectedKeywords: ["package manager", "chart", "release", "template", "values.yaml"] },
  { text: "How do you manage secrets in a Kubernetes cluster?", category: "devops", difficulty: "medium", expectedKeywords: ["Secret", "base64", "Vault", "sealed secrets", "env"] },
  { text: "What is GitHub Actions and how do you write a workflow?", category: "devops", difficulty: "medium", expectedKeywords: ["yaml", "trigger", "job", "step", "runner"] },
  { text: "What is the difference between stateful and stateless applications?", category: "devops", difficulty: "easy", expectedKeywords: ["session", "horizontal scale", "database", "sticky", "REST"] },

  // ═══════════════════════════════════════════════════════
  // HR / CAREER  (~30 questions)
  // ═══════════════════════════════════════════════════════
  { text: "Why do you want to work at this company?", category: "hr", difficulty: "easy", expectedKeywords: ["research", "values", "product", "growth", "culture"] },
  { text: "What is your greatest strength as a developer?", category: "hr", difficulty: "easy", expectedKeywords: ["specific", "example", "impact", "skill", "genuine"] },
  { text: "What is your greatest weakness and how are you working on it?", category: "hr", difficulty: "easy", expectedKeywords: ["honest", "improvement', 'action", "self-aware", "growth"] },
  { text: "What are your salary expectations?", category: "hr", difficulty: "medium", expectedKeywords: ["research", "range", "market", "negotiate", "open"] },
  { text: "Why are you leaving your current job?", category: "hr", difficulty: "medium", expectedKeywords: ["growth", "positive", "opportunity", "honest", "professional"] },
  { text: "Where do you see yourself in 3 years?", category: "hr", difficulty: "easy", expectedKeywords: ["growth", "skill', 'contribute", "lead", "aligned"] },
  { text: "How do you handle work-life balance?", category: "hr", difficulty: "easy", expectedKeywords: ["boundaries', 'prioritize', 'health', 'sustainable", "rest"] },
  { text: "What type of work environment do you thrive in?", category: "hr", difficulty: "easy", expectedKeywords: ["collaborative", "autonomous", "culture', 'remote", "structure"] },
  { text: "How would your previous colleagues describe you?", category: "hr", difficulty: "easy", expectedKeywords: ["reliable', 'team player", "communicative", "helpful", "honest"] },
  { text: "Do you prefer working alone or in a team?", category: "hr", difficulty: "easy", expectedKeywords: ["both", "context", "collaboration", "independent", "balanced"] },
  { text: "What is your experience with remote work?", category: "hr", difficulty: "easy", expectedKeywords: ["tools", "communication", "async","timezone", "productivity"] },
  { text: "How do you handle conflict at work?", category: "hr", difficulty: "medium", expectedKeywords: ["direct", "listen", "empathy", "resolve", "professional"] },
  { text: "What projects are you most interested in working on?", category: "hr", difficulty: "easy", expectedKeywords: ["passion", "impact", "technology", "user", "meaningful"] },
  { text: "Tell me something about yourself not on your resume.", category: "hr", difficulty: "easy", expectedKeywords: ["personality", "hobby", "unique", "genuine", "memorable"] },
  { text: "Why did you choose software development as a career?", category: "hr", difficulty: "easy", expectedKeywords: ["passion", "problem solvin", "create", "journey", "impact"] },


  // ═══════════════════════════════════════════════════════
  // MORE DATA STRUCTURES  (continued)
  // ═══════════════════════════════════════════════════════
  { text: 'What is a segment tree and what is it used for?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['range query', 'update', 'sum', 'O(log n)', 'build'] },
  { text: 'What is a Fenwick tree (Binary Indexed Tree)?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['prefix sum', 'update', 'O(log n)', 'bit manipulation', 'array'] },
  { text: "What is the difference between Prim's and Kruskal's algorithm?", category: 'data_structures', difficulty: 'hard', expectedKeywords: ['MST', 'greedy', 'edge', 'vertex', 'union-find'] },
  { text: 'What is a union-find (disjoint set) data structure?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['connected components', 'union', 'find', 'path compression', 'rank'] },
  { text: 'How do you find the kth largest element in an array?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['quickselect', 'heap', 'partition', 'O(n)', 'sort'] },
  { text: 'What is the difference between a complete and full binary tree?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['all levels filled', 'last level', 'every node', 'two children', 'structure'] },
  { text: 'How do you serialize and deserialize a binary tree?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['BFS', 'DFS', 'string', 'null marker', 'reconstruct'] },
  { text: 'What is the longest common subsequence problem?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['DP', 'table', 'O(mn)', 'subsequence', 'match'] },
  { text: 'What is the knapsack problem?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['DP', 'weight', 'value', 'capacity', '0/1'] },
  { text: 'How do you check if a string is a palindrome efficiently?', category: 'data_structures', difficulty: 'easy', expectedKeywords: ['two pointer', 'reverse', 'O(n)', 'compare', 'even odd'] },
  { text: 'What is a deque and what are its use cases?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['double-ended', 'front', 'back', 'sliding window', 'O(1)'] },
  { text: 'How do you find all permutations of a string?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['backtracking', 'swap', 'recurse', 'n!', 'visited'] },
  { text: 'What is the rabin-karp algorithm?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['rolling hash', 'substring search', 'O(n)', 'collision', 'pattern'] },
  { text: 'What is the difference between greedy and dynamic programming?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['local optimal', 'global optimal', 'subproblem', 'overlapping', 'prove'] },
  { text: 'How do you find the median of a data stream?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['two heaps', 'max heap', 'min heap', 'balance', 'O(log n)'] },
  { text: 'What is LRU cache and how do you implement it?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['least recently used', 'HashMap', 'doubly linked list', 'O(1)', 'evict'] },
  { text: 'What is the difference between in-order, pre-order, and post-order traversal?', category: 'data_structures', difficulty: 'easy', expectedKeywords: ['left root right', 'root left right', 'left right root', 'DFS', 'recursive'] },
  { text: 'What is the Bellman-Ford algorithm and how does it differ from Dijkstra?', category: 'data_structures', difficulty: 'hard', expectedKeywords: ['negative edges', 'relax', 'O(VE)', 'detect cycle', 'shortest path'] },
  { text: 'How do you find all subsets of a set?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['backtracking', 'bit mask', '2^n', 'include exclude', 'power set'] },
  { text: 'What is the difference between BFS and DFS for finding shortest path?', category: 'data_structures', difficulty: 'medium', expectedKeywords: ['unweighted', 'BFS guarantees', 'DFS no guarantee', 'level', 'queue'] },
  
  // ═══════════════════════════════════════════════════════
  // MORE SYSTEM DESIGN  (continued)
  // ═══════════════════════════════════════════════════════
  { text: 'How would you design a ride-sharing service like Uber?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['geolocation', 'matching', 'real-time', 'pricing', 'dispatch'] },
  { text: 'How would you design a distributed key-value store?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['consistency', 'hashing', 'replication', 'fault tolerance', 'CAP'] },
  { text: 'What is consistent hashing and why is it used?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['ring', 'virtual nodes', 'minimal rehashing', 'distribution', 'cache'] },
  { text: 'How would you design a recommendation system?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['collaborative filtering', 'content-based', 'matrix', 'cold start', 'ML'] },
  { text: 'What is CQRS pattern?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['command', 'query', 'separate', 'write model', 'read model'] },
  { text: 'How would you design an e-commerce product catalog?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['search', 'category', 'inventory', 'cache', 'Elasticsearch'] },
  { text: 'What is event sourcing?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['events as truth', 'append-only', 'replay', 'audit', 'CQRS'] },
  { text: 'How would you design a global leaderboard?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['Redis sorted set', 'ZADD', 'rank', 'score', 'real-time'] },
  { text: 'What is the difference between push and pull architecture in distributed systems?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['producer', 'consumer', 'polling', 'webhook', 'overhead'] },
  { text: 'How would you design a payment processing system?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['idempotency', 'transaction', 'retry', 'fraud detection', 'PCI DSS'] },
  { text: 'How would you design a distributed cache?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['Redis cluster', 'consistent hashing', 'eviction', 'TTL', 'replication'] },
  { text: 'What is a write-through vs write-behind cache strategy?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['synchronous', 'async', 'consistency', 'durability', 'performance'] },
  { text: 'How would you design an OTP (one-time password) system?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['TOTP', 'expiry', 'rate limit', 'Redis', 'SMS'] },
  { text: 'What is the outbox pattern in microservices?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['transactional', 'reliable messaging', 'CDC', 'Debezium', 'at-least-once'] },
  { text: 'How would you handle distributed tracing in microservices?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['trace ID', 'span', 'Jaeger', 'OpenTelemetry', 'propagate'] },

  // ═══════════════════════════════════════════════════════
  // MORE BEHAVIORAL  (continued)
  // ═══════════════════════════════════════════════════════
  { text: 'Describe a time you improved application performance significantly.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['profiling', 'bottleneck', 'measure', 'optimize', 'result'] },
  { text: 'How do you approach estimating project timelines?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['break down', 'buffer', 'communicate', 'risk', 'review'] },
  { text: 'Tell me about a time you had to refactor a large codebase.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['incremental', 'tests', 'plan', 'communicate', 'outcome'] },
  { text: 'How do you handle a situation where requirements keep changing?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['Agile', 'communicate', 'flexible', 'document', 'scope'] },
  { text: 'Describe a time you had to deliver bad news to a client or stakeholder.', category: 'behavioral', difficulty: 'hard', expectedKeywords: ['honest', 'early', 'solution', 'empathy', 'professional'] },
  { text: 'How do you approach building a feature from scratch?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['requirements', 'design', 'iterate', 'test', 'deliver'] },
  { text: 'Tell me about a time you worked under minimal supervision.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['self-directed', 'communicate', 'deliver', 'initiative', 'trust'] },
  { text: 'How do you ensure you are building the right feature for users?', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['user research', 'feedback', 'metrics', 'A/B test', 'iterate'] },
  { text: 'Describe your experience with technical interviews as an interviewer.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['fair', 'rubric', 'problem-solving', 'culture', 'structured'] },
  { text: 'How do you balance technical debt with feature development?', category: 'behavioral', difficulty: 'hard', expectedKeywords: ['prioritize', 'communicate', 'boy scout rule', 'roadmap', 'impact'] },
  { text: 'Tell me about a time you introduced a new technology to your team.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['research', 'proposal', 'POC', 'adoption', 'training'] },
  { text: 'How do you handle disagreements about technical architecture?', category: 'behavioral', difficulty: 'hard', expectedKeywords: ['data', 'trade-offs', 'listen', 'RFC', 'consensus'] },
  { text: 'Describe a time you had to say no to a feature request.', category: 'behavioral', difficulty: 'medium', expectedKeywords: ['scope', 'priority', 'explain', 'alternative', 'professional'] },
  { text: 'What was the most complex system you have designed or contributed to?', category: 'behavioral', difficulty: 'hard', expectedKeywords: ['architecture', 'decisions', 'trade-offs', 'scale', 'lessons'] },
  { text: 'How do you keep your skills sharp outside of work?', category: 'behavioral', difficulty: 'easy', expectedKeywords: ['side project', 'courses', 'open source', 'community', 'practice'] },


  // ═══════════════════════════════════════════════════════
  // TYPESCRIPT  (~30 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is TypeScript and what advantages does it provide over JavaScript?', category: 'frontend', difficulty: 'easy', expectedKeywords: ['static typing', 'compile', 'IDE support', 'catch errors', 'documentation'] },
  { text: 'What is the difference between interface and type in TypeScript?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['extends', 'intersection', 'declaration merge', 'primitive', 'union'] },
  { text: 'What are generics in TypeScript and when would you use them?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['reusable', 'type parameter', 'constraint', '<T>', 'flexible'] },
  { text: 'What is the unknown type in TypeScript and how is it different from any?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['type guard', 'safe', 'narrow', 'check', 'assign'] },
  { text: 'What are TypeScript utility types? Name and explain 5.', category: 'frontend', difficulty: 'medium', expectedKeywords: ['Partial', 'Required', 'Pick', 'Omit', 'Record'] },
  { text: 'What is a TypeScript discriminated union?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['literal type', 'narrow', 'switch', 'exhaustive', 'pattern'] },
  { text: 'What are conditional types in TypeScript?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['T extends U', 'infer', 'distributive', 'mapped', 'template'] },
  { text: 'What is the infer keyword in TypeScript?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['conditional type', 'extract', 'ReturnType', 'type variable', 'inference'] },
  { text: 'What is TypeScript declaration merging?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['interface', 'namespace', 'augment', 'module', 'extend'] },
  { text: 'What is the difference between never and void in TypeScript?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['unreachable', 'function return', 'throw', 'undefined', 'bottom type'] },
  { text: 'How do you type a React component in TypeScript?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['FC', 'Props', 'interface', 'children', 'ReactNode'] },
  { text: 'What is a mapped type in TypeScript?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['keyof', 'in', 'Readonly', 'Optional', 'transform'] },
  { text: 'What are template literal types in TypeScript?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['string manipulation', 'Capitalize', 'interpolation', 'type level', 'combine'] },
  { text: 'How do you use enums in TypeScript and what are their pitfalls?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['const enum', 'string enum', 'number enum', 'tree shaking', 'alternative'] },
  { text: 'What is module augmentation in TypeScript?', category: 'frontend', difficulty: 'hard', expectedKeywords: ['declare module', 'extend', 'third-party', 'namespace', 'interface'] },

  // ═══════════════════════════════════════════════════════
  // TESTING  (~25 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is the difference between unit, integration, and end-to-end tests?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['isolated', 'together', 'browser', 'scope', 'pyramid'] },
  { text: 'What is TDD (Test-Driven Development)?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['red green refactor', 'write test first', 'design', 'confidence', 'cycle'] },
  { text: 'What is the difference between mocking, stubbing, and spying?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['fake', 'return value', 'observe calls', 'Jest', 'Sinon'] },
  { text: 'What is Jest and what are its core features?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['assertion', 'mock', 'coverage', 'snapshot', 'runner'] },
  { text: 'What is snapshot testing in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['toMatchSnapshot', 'rendered output', 'regression', 'update', 'UI'] },
  { text: 'How do you test API endpoints in Node.js?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['Supertest', 'request', 'status code', 'body', 'integration'] },
  { text: 'What is code coverage and what percentage should you aim for?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['lines', 'branches', '80%', 'meaningful', 'quality'] },
  { text: 'What is Cypress and how does it differ from Selenium?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['E2E', 'real browser', 'JavaScript', 'async', 'developer experience'] },
  { text: 'What is React Testing Library and its philosophy?', category: 'react', difficulty: 'medium', expectedKeywords: ['user behavior', 'getByRole', 'not implementation', 'accessible', 'fire event'] },
  { text: 'How do you test custom hooks in React?', category: 'react', difficulty: 'hard', expectedKeywords: ['renderHook', 'act', 'result', 'waitFor', 'isolated'] },
  { text: 'What is property-based testing?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['random input', 'invariant', 'fast-check', 'shrink', 'generate'] },
  { text: 'How do you write deterministic tests for code that uses dates?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['mock date', 'jest.spyOn', 'fake timers', 'inject', 'control'] },

  // ═══════════════════════════════════════════════════════
  // SECURITY  (~20 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What is SQL injection and how do you prevent it?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['parameterized query', 'sanitize', 'ORM', 'escape', 'prepared statement'] },
  { text: 'What is HTTPS and how does TLS work?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['certificate', 'handshake', 'symmetric', 'asymmetric', 'encrypt'] },
  { text: 'What is the OWASP Top 10?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['injection', 'broken auth', 'XSS', 'IDOR', 'security misconfiguration'] },
  { text: 'What is bcrypt and why is it used for password hashing?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['salt', 'slow', 'rounds', 'one-way', 'rainbow table'] },
  { text: 'What is the difference between symmetric and asymmetric encryption?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['same key', 'public private', 'AES', 'RSA', 'exchange'] },
  { text: 'What is SSRF (Server-Side Request Forgery)?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['internal', 'fetch URL', 'metadata', 'whitelist', 'firewall'] },
  { text: 'What is clickjacking and how do you prevent it?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['iframe', 'X-Frame-Options', 'CSP', 'overlay', 'transparent'] },
  { text: 'How do you store sensitive data securely in a web application?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['encrypt', 'vault', 'never plaintext', 'env variable', 'KMS'] },
  { text: 'What is a man-in-the-middle attack?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['intercept', 'HTTPS', 'certificate pinning', 'TLS', 'eavesdrop'] },
  { text: 'What is content security policy (CSP)?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['whitelist', 'script-src', 'XSS', 'header', 'inline'] },

  // ═══════════════════════════════════════════════════════
  // PERFORMANCE OPTIMIZATION  (~20 questions)
  // ═══════════════════════════════════════════════════════
  { text: 'What are Core Web Vitals and why do they matter?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['LCP', 'FID', 'CLS', 'SEO', 'user experience'] },
  { text: 'How do you optimize images for the web?', category: 'frontend', difficulty: 'easy', expectedKeywords: ['WebP', 'lazy load', 'srcset', 'compress', 'CDN'] },
  { text: 'What is tree shaking and how does it work?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['dead code', 'ES modules', 'bundle', 'Webpack', 'eliminate'] },
  { text: 'What is the difference between rendering performance and loading performance?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['FPS', 'reflow', 'network', 'bundle size', 'paint'] },
  { text: 'How do you reduce JavaScript bundle size?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['code splitting', 'lazy load', 'tree shaking', 'minify', 'analyze'] },
  { text: 'What is the purpose of the will-change CSS property?', category: 'html', difficulty: 'hard', expectedKeywords: ['GPU', 'composite layer', 'transform', 'hint', 'performance'] },
  { text: 'How do you implement lazy loading for images in React?', category: 'react', difficulty: 'easy', expectedKeywords: ['IntersectionObserver', 'loading=lazy', 'placeholder', 'blur', 'viewport'] },
  { text: 'What is a service worker and how does it enable PWA features?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['offline', 'cache', 'background sync', 'push notification', 'fetch intercept'] },
  { text: 'What is HTTP/2 and what improvements does it bring?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['multiplexing', 'server push', 'header compression', 'streams', 'binary'] },
  { text: 'How do you measure and improve Time to First Byte (TTFB)?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['server response', 'CDN', 'caching', 'database query', 'connection'] },


  // ═══════════════════════════════════════════════════════
  // MORE FULLSTACK / MERN  (continued)
  // ═══════════════════════════════════════════════════════
  { text: 'How do you implement a forgot password flow in MERN?', category: 'mern', difficulty: 'medium', expectedKeywords: ['token', 'email', 'expiry', 'reset link', 'bcrypt'] },
  { text: 'What is the difference between cookie-based and token-based authentication?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['HttpOnly', 'stateless', 'CSRF', 'localStorage', 'scalable'] },
  { text: 'How do you handle file downloads in a MERN application?', category: 'mern', difficulty: 'medium', expectedKeywords: ['Content-Disposition', 'stream', 'blob', 'S3 signed URL', 'response'] },
  { text: 'What is WebRTC and when would you use it?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['peer-to-peer', 'video call', 'ICE', 'SDP', 'STUN TURN'] },
  { text: 'How do you implement multi-language support (i18n) in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['react-i18next', 'locale', 'translation file', 'interpolation', 'RTL'] },
  { text: 'What is the difference between a monorepo and multi-repo setup?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['shared code', 'Turborepo', 'Nx', 'dependency', 'versioning'] },
  { text: 'How do you implement WebSocket authentication?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['token in query', 'handshake', 'middleware', 'disconnect', 'validate'] },
  { text: 'What is the difference between PUT and PATCH HTTP methods?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['full replace', 'partial update', 'idempotent', 'body', 'resource'] },
  { text: 'How do you implement logging in a production Node.js application?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['Winston', 'Pino', 'log levels', 'structured', 'correlation ID'] },
  { text: 'What is the difference between 401 and 403 HTTP status codes?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['unauthenticated', 'unauthorized', 'forbidden', 'identity', 'permission'] },
  { text: 'How do you handle time zones in a web application?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['UTC', 'moment', 'date-fns', 'store UTC', 'display local'] },
  { text: 'What is an API versioning strategy?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['URL path', 'header', 'query param', 'deprecate', 'backward compatible'] },
  { text: 'How do you implement a like/unlike feature in MERN?', category: 'mern', difficulty: 'easy', expectedKeywords: ['toggle', 'array', 'ObjectId', 'addToSet', '$pull'] },
  { text: 'What is the difference between cookies and JWT for authentication?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['HttpOnly', 'CSRF', 'stateless', 'expiry', 'storage'] },
  { text: 'How do you implement a commenting system in MERN?', category: 'mern', difficulty: 'medium', expectedKeywords: ['nested', 'reference', 'populate', 'pagination', 'tree'] },
  { text: 'What is a webhook and how does it differ from polling?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['event-driven', 'push', 'HTTP POST', 'real-time', 'pull vs push'] },
  { text: 'How do you implement full-text search in MongoDB?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['text index', '$search', 'Atlas Search', 'language', 'score'] },
  { text: 'What is connection pooling in MongoDB and why is it important?', category: 'mongodb', difficulty: 'medium', expectedKeywords: ['reuse connections', 'overhead', 'max pool size', 'performance', 'Mongoose'] },
  { text: 'How do you batch multiple API requests in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['Promise.all', 'debounce', 'useEffect', 'concurrent', 'loading'] },
  { text: 'What is the difference between Axios and the Fetch API?', category: 'frontend', difficulty: 'easy', expectedKeywords: ['interceptors', 'automatic JSON', 'cancel', 'timeout', 'request config'] },
  { text: 'How do you optimize MongoDB queries for large datasets?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['index', 'projection', 'limit', 'explain', 'avoid N+1'] },
  { text: 'What is the difference between normalization and denormalization in databases?', category: 'system_design', difficulty: 'medium', expectedKeywords: ['redundancy', 'join', 'performance', 'update anomaly', 'NoSQL'] },
  { text: 'How do you implement audit logging in an application?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['who', 'what', 'when', 'middleware', 'immutable'] },
  { text: 'What is the difference between synchronous and asynchronous error handling in Express?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['try catch', 'next(err)', 'async wrapper', 'express-async-errors', 'unhandledRejection'] },
  { text: 'How do you implement a search autocomplete feature?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['debounce', 'API call', 'dropdown', 'keyboard nav', 'cache'] },
  { text: 'What is a progressive web app (PWA)?', category: 'frontend', difficulty: 'medium', expectedKeywords: ['service worker', 'manifest', 'offline', 'installable', 'push'] },
  { text: 'How do you implement dark mode with CSS variables?', category: 'html', difficulty: 'easy', expectedKeywords: ['--color', 'data-theme', 'prefers-color-scheme', 'toggle', 'root'] },
  { text: 'What is the difference between REST and SOAP?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['XML', 'JSON', 'stateless', 'protocol', 'enterprise'] },
  { text: 'How do you handle N+1 query problem in Mongoose?', category: 'mongodb', difficulty: 'hard', expectedKeywords: ['populate', 'aggregate', 'batch', 'lean', 'dataloader'] },
  { text: 'What is the difference between horizontal and vertical partitioning in databases?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['sharding', 'column split', 'row split', 'performance', 'scale'] },
  { text: 'How do you implement a retry mechanism for failed API requests?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['exponential backoff', 'max retries', 'idempotent', 'axios-retry', 'jitter'] },
  { text: 'What is the difference between microservices and serverless architecture?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['always running', 'event-driven', 'cold start', 'cost', 'management'] },
  { text: 'How do you implement feature flags in a web application?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['toggle', 'LaunchDarkly', 'gradual rollout', 'A/B test', 'config'] },
  { text: 'What is eventual consistency and give a real-world example?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['DNS', 'replica lag', 'BASE', 'distributed', 'sync'] },
  { text: 'How do you implement a CSV export feature in MERN?', category: 'mern', difficulty: 'medium', expectedKeywords: ['stream', 'Content-Disposition', 'csv-writer', 'blob', 'download'] },
  { text: 'What is the difference between optimistic locking and pessimistic locking?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['version', 'lock row', 'conflict', 'retry', 'concurrent'] },
  { text: 'How do you implement social login (OAuth) in a MERN app?', category: 'mern', difficulty: 'hard', expectedKeywords: ['Passport', 'Google', 'GitHub', 'callback', 'token'] },
  { text: 'What is a deadlock and how do you prevent it in databases?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['circular wait', 'lock order', 'timeout', 'retry', 'detect'] },
  { text: 'How do you implement an activity feed (like Facebook)?', category: 'system_design', difficulty: 'hard', expectedKeywords: ['fanout', 'timeline', 'push pull', 'cache', 'aggregation'] },
  { text: 'What is the difference between a primary key and a unique index?', category: 'system_design', difficulty: 'easy', expectedKeywords: ['null', 'one per table', 'clustered', 'multiple unique', 'identity'] },


  { text: 'How do you implement rate limiting per user vs per IP?', category: 'nodejs', difficulty: 'medium', expectedKeywords: ['Redis', 'user ID', 'IP', 'window', 'key'] },
  { text: 'What is the purpose of the ETag HTTP header?', category: 'fullstack', difficulty: 'medium', expectedKeywords: ['cache validation', '304', 'conditional request', 'hash', 'If-None-Match'] },
  { text: 'How do you implement cursor-based pagination vs offset pagination?', category: 'fullstack', difficulty: 'hard', expectedKeywords: ['stable', 'performance', 'last ID', 'skip', 'deep page'] },
  { text: 'What is the difference between a cookie and a session?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['client stored', 'server stored', 'session ID', 'expiry', 'HttpOnly'] },
  { text: 'How do you implement a multi-step form in React?', category: 'react', difficulty: 'medium', expectedKeywords: ['state', 'step index', 'validation', 'progress', 'conditional render'] },
  { text: 'What is the useSyncExternalStore hook in React?', category: 'react', difficulty: 'hard', expectedKeywords: ['external store', 'subscribe', 'snapshot', 'concurrent', 'tearing'] },
  { text: 'How do you implement keyboard accessibility in a web app?', category: 'html', difficulty: 'medium', expectedKeywords: ['tabindex', 'focus', 'ARIA', 'keydown', 'skip link'] },
  { text: 'What is the purpose of robots.txt?', category: 'fullstack', difficulty: 'easy', expectedKeywords: ['crawler', 'disallow', 'sitemap', 'SEO', 'user-agent'] },
  { text: 'How do you implement a countdown timer in React?', category: 'react', difficulty: 'easy', expectedKeywords: ['setInterval', 'useEffect', 'cleanup', 'state', 'clearInterval'] },
  { text: 'What is the difference between process.env.NODE_ENV values?', category: 'nodejs', difficulty: 'easy', expectedKeywords: ['development', 'production', 'test', 'optimization', 'behavior'] },

];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_platform');
    console.log('Connected to MongoDB');
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    await Question.insertMany(QUESTIONS);
    console.log(`✅ Seeded ${QUESTIONS.length} questions successfully`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

// NOTE: append more questions before the seed() call above
// The insertMany is at the end of the QUESTIONS array — add to the array above