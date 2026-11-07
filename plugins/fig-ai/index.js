"use strict";var __fig__=(()=>{var Oe=Object.create;var R=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var ze=Object.getOwnPropertyNames;var je=Object.getPrototypeOf,Ie=Object.prototype.hasOwnProperty;var E=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Ce=(e,t)=>{for(var r in t)R(e,r,{get:t[r],enumerable:!0})},X=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of ze(t))!Ie.call(e,o)&&o!==r&&R(e,o,{get:()=>t[o],enumerable:!(n=Pe(t,o))||n.enumerable});return e};var Q=(e,t,r)=>(r=e!=null?Oe(je(e)):{},X(t||!e||!e.__esModule?R(r,"default",{value:e,enumerable:!0}):r,e)),Ne=e=>X(R({},"__esModule",{value:!0}),e);var ve=E(a=>{"use strict";var S=Symbol.for("react.element"),De=Symbol.for("react.portal"),Ue=Symbol.for("react.fragment"),qe=Symbol.for("react.strict_mode"),Le=Symbol.for("react.profiler"),Ve=Symbol.for("react.provider"),Me=Symbol.for("react.context"),We=Symbol.for("react.forward_ref"),Be=Symbol.for("react.suspense"),Ge=Symbol.for("react.memo"),He=Symbol.for("react.lazy"),ie=Symbol.iterator;function Je(e){return e===null||typeof e!="object"?null:(e=ie&&e[ie]||e["@@iterator"],typeof e=="function"?e:null)}var le={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ce=Object.assign,ue={};function w(e,t,r){this.props=e,this.context=t,this.refs=ue,this.updater=r||le}w.prototype.isReactComponent={};w.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};w.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function fe(){}fe.prototype=w.prototype;function A(e,t,r){this.props=e,this.context=t,this.refs=ue,this.updater=r||le}var D=A.prototype=new fe;D.constructor=A;ce(D,w.prototype);D.isPureReactComponent=!0;var ae=Array.isArray,pe=Object.prototype.hasOwnProperty,U={current:null},de={key:!0,ref:!0,__self:!0,__source:!0};function ge(e,t,r){var n,o={},s=null,l=null;if(t!=null)for(n in t.ref!==void 0&&(l=t.ref),t.key!==void 0&&(s=""+t.key),t)pe.call(t,n)&&!de.hasOwnProperty(n)&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=r;else if(1<c){for(var u=Array(c),p=0;p<c;p++)u[p]=arguments[p+2];o.children=u}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return{$$typeof:S,type:e,key:s,ref:l,props:o,_owner:U.current}}function Ye(e,t){return{$$typeof:S,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function q(e){return typeof e=="object"&&e!==null&&e.$$typeof===S}function Ke(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(r){return t[r]})}var se=/\/+/g;function N(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Ke(""+e.key):t.toString(36)}function T(e,t,r,n,o){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var l=!1;if(e===null)l=!0;else switch(s){case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case S:case De:l=!0}}if(l)return l=e,o=o(l),e=n===""?"."+N(l,0):n,ae(o)?(r="",e!=null&&(r=e.replace(se,"$&/")+"/"),T(o,t,r,"",function(p){return p})):o!=null&&(q(o)&&(o=Ye(o,r+(!o.key||l&&l.key===o.key?"":(""+o.key).replace(se,"$&/")+"/")+e)),t.push(o)),1;if(l=0,n=n===""?".":n+":",ae(e))for(var c=0;c<e.length;c++){s=e[c];var u=n+N(s,c);l+=T(s,t,r,u,o)}else if(u=Je(e),typeof u=="function")for(e=u.call(e),c=0;!(s=e.next()).done;)s=s.value,u=n+N(s,c++),l+=T(s,t,r,u,o);else if(s==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return l}function F(e,t,r){if(e==null)return e;var n=[],o=0;return T(e,n,"","",function(s){return t.call(r,s,o++)}),n}function Xe(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(r){(e._status===0||e._status===-1)&&(e._status=1,e._result=r)},function(r){(e._status===0||e._status===-1)&&(e._status=2,e._result=r)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var m={current:null},O={transition:null},Qe={ReactCurrentDispatcher:m,ReactCurrentBatchConfig:O,ReactCurrentOwner:U};function me(){throw Error("act(...) is not supported in production builds of React.")}a.Children={map:F,forEach:function(e,t,r){F(e,function(){t.apply(this,arguments)},r)},count:function(e){var t=0;return F(e,function(){t++}),t},toArray:function(e){return F(e,function(t){return t})||[]},only:function(e){if(!q(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};a.Component=w;a.Fragment=Ue;a.Profiler=Le;a.PureComponent=A;a.StrictMode=qe;a.Suspense=Be;a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Qe;a.act=me;a.cloneElement=function(e,t,r){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var n=ce({},e.props),o=e.key,s=e.ref,l=e._owner;if(t!=null){if(t.ref!==void 0&&(s=t.ref,l=U.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var c=e.type.defaultProps;for(u in t)pe.call(t,u)&&!de.hasOwnProperty(u)&&(n[u]=t[u]===void 0&&c!==void 0?c[u]:t[u])}var u=arguments.length-2;if(u===1)n.children=r;else if(1<u){c=Array(u);for(var p=0;p<u;p++)c[p]=arguments[p+2];n.children=c}return{$$typeof:S,type:e.type,key:o,ref:s,props:n,_owner:l}};a.createContext=function(e){return e={$$typeof:Me,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Ve,_context:e},e.Consumer=e};a.createElement=ge;a.createFactory=function(e){var t=ge.bind(null,e);return t.type=e,t};a.createRef=function(){return{current:null}};a.forwardRef=function(e){return{$$typeof:We,render:e}};a.isValidElement=q;a.lazy=function(e){return{$$typeof:He,_payload:{_status:-1,_result:e},_init:Xe}};a.memo=function(e,t){return{$$typeof:Ge,type:e,compare:t===void 0?null:t}};a.startTransition=function(e){var t=O.transition;O.transition={};try{e()}finally{O.transition=t}};a.unstable_act=me;a.useCallback=function(e,t){return m.current.useCallback(e,t)};a.useContext=function(e){return m.current.useContext(e)};a.useDebugValue=function(){};a.useDeferredValue=function(e){return m.current.useDeferredValue(e)};a.useEffect=function(e,t){return m.current.useEffect(e,t)};a.useId=function(){return m.current.useId()};a.useImperativeHandle=function(e,t,r){return m.current.useImperativeHandle(e,t,r)};a.useInsertionEffect=function(e,t){return m.current.useInsertionEffect(e,t)};a.useLayoutEffect=function(e,t){return m.current.useLayoutEffect(e,t)};a.useMemo=function(e,t){return m.current.useMemo(e,t)};a.useReducer=function(e,t,r){return m.current.useReducer(e,t,r)};a.useRef=function(e){return m.current.useRef(e)};a.useState=function(e){return m.current.useState(e)};a.useSyncExternalStore=function(e,t,r){return m.current.useSyncExternalStore(e,t,r)};a.useTransition=function(){return m.current.useTransition()};a.version="18.3.1"});var he=E((gt,xe)=>{"use strict";xe.exports=ve()});var be=E(P=>{"use strict";var Ze=he(),et=Symbol.for("react.element"),tt=Symbol.for("react.fragment"),rt=Object.prototype.hasOwnProperty,nt=Ze.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,ot={key:!0,ref:!0,__self:!0,__source:!0};function ye(e,t,r){var n,o={},s=null,l=null;r!==void 0&&(s=""+r),t.key!==void 0&&(s=""+t.key),t.ref!==void 0&&(l=t.ref);for(n in t)rt.call(t,n)&&!ot.hasOwnProperty(n)&&(o[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps,t)o[n]===void 0&&(o[n]=t[n]);return{$$typeof:et,type:e,key:s,ref:l,props:o,_owner:nt.current}}P.Fragment=tt;P.jsx=ye;P.jsxs=ye});var L=E((vt,we)=>{"use strict";we.exports=be()});var it={};Ce(it,{FigAiPanel:()=>ke,default:()=>_e});async function C(){let e=globalThis.__FIG_READY__;if(e)try{return await e}catch{}return globalThis.__FIG_BASE__??""}function Z(e){return e?e.replace(/^http/,"ws")+"/ws":`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`}async function ee(){return Z(await C())}function te(){return globalThis.__FIG_READY__?null:Z(globalThis.__FIG_BASE__??"")}async function d(e){if(!e.ok){let t=e.statusText;try{t=(await e.json()).detail??t}catch{}throw new Error(`${e.status}: ${t}`)}return e.json()}function b(e,t){return{method:e,headers:t===void 0?void 0:{"Content-Type":"application/json"},body:t===void 0?void 0:JSON.stringify(t)}}var g=()=>C(),h={listTemplates:async()=>fetch(await g()+"/api/figures/templates").then(e=>d(e)),getFigure:async e=>fetch(`${await g()}/api/figures/${e}`).then(t=>d(t)),deleteFigure:async e=>fetch(`${await g()}/api/figures/${e}`,{method:"DELETE"}).then(t=>d(t)),putCode:async(e,t)=>fetch(`${await g()}/api/figures/${e}/code`,b("PUT",{code:t})).then(r=>d(r)),run:async e=>fetch(`${await g()}/api/figures/${e}/run`,{method:"POST"}).then(t=>d(t)),putPatch:async(e,t)=>fetch(`${await g()}/api/figures/${e}/patch`,b("PUT",t)).then(r=>d(r)),verifyPatch:async e=>fetch(`${await g()}/api/figures/${e}/verify-patch`,{method:"POST"}).then(t=>d(t)),snapshot:async(e,t)=>fetch(`${await g()}/api/figures/${e}/snapshot`,b("POST",{note:t})).then(r=>d(r)),listRuns:async e=>fetch(`${await g()}/api/figures/${e}/runs`).then(t=>d(t)),aiStatus:async()=>fetch(await g()+"/api/figures/status").then(e=>d(e)),createFigure:async(e,t,r,n,o="")=>{let s=new FormData;return s.append("requirements",t),s.append("template",r),o?s.append("existing_file",o):n&&s.append("upload",n),fetch(`${await g()}/api/figures/${e}/create`,{method:"POST",body:s}).then(l=>d(l))},adaptFigure:async(e,t,r,n,o="",s="")=>{let l=new FormData;return l.append("requirements",n),o?l.append("existing_script",o):t&&l.append("script",t),s?l.append("existing_data",s):r&&l.append("upload",r),fetch(`${await g()}/api/figures/${e}/adapt`,{method:"POST",body:l}).then(c=>d(c))},instruct:async(e,t,r)=>fetch(`${await g()}/api/figures/${e}/instruct`,b("POST",{instruction:t,selection:r})).then(n=>d(n)),writebackPatch:async e=>fetch(`${await g()}/api/figures/${e}/writeback`,{method:"POST"}).then(t=>d(t)),enrichSelection:async(e,t)=>fetch(`${await g()}/api/figures/${e}/enrich-selection`,b("POST",{selection:t})).then(r=>d(r)),listFiles:async e=>fetch(await g()+"/api/files/list",b("POST",{itemId:e})).then(t=>d(t))};var v=null;function re(e){v=e}var ne="fig-plugin-styles",Ae=`
.fig-scope {
  color: var(--text);
  font-family: var(--font);
  font-size: var(--fs-sm);
  box-sizing: border-box;
}
.fig-scope *, .fig-scope *::before, .fig-scope *::after { box-sizing: border-box; }
.fig-scope button {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: var(--r-sm);
  padding: 4px 10px;
  cursor: pointer;
  font-size: var(--fs-sm);
  font-family: var(--font);
}
.fig-scope button:hover { border-color: var(--accent); color: var(--accent); }
.fig-scope button:disabled { opacity: 0.45; cursor: default; }
.fig-scope button.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
.fig-scope button.small { padding: 2px 7px; font-size: var(--fs-xs); }
.fig-scope input[type="text"], .fig-scope input[type="number"], .fig-scope select, .fig-scope textarea {
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 4px 6px;
  font-size: var(--fs-sm);
  width: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}
.fig-scope textarea { min-height: 56px; resize: vertical; }
.fig-scope input[type="color"] {
  width: 42px; height: 26px; padding: 0;
  border: 1px solid var(--border); border-radius: var(--r-sm); background: none;
}

/* ---- \u5DE5\u4F5C\u53F0\u5E03\u5C40 ---- */
.fig-workbench-root { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.fig-header {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 6px 10px; background: var(--surface); border-bottom: 1px solid var(--border);
}
.fig-header .toggle {
  display: inline-flex; align-items: center; gap: 4px; user-select: none; cursor: pointer;
  font-size: var(--fs-xs); color: var(--text-muted);
}
.fig-main { flex: 1; display: flex; min-height: 0; }
.fig-col-left { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.fig-col-right {
  width: 320px; flex: none; background: var(--surface); border-left: 1px solid var(--border);
  overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 12px;
}
.fig-bottombar {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 6px 10px; background: var(--surface); border-top: 1px solid var(--border);
}
.fig-bottombar .spacer { flex: 1; }
/* \u5E95\u5C42\u9762\u677F\uFF1A\u8F7B\u7F16\u8F91 / \u5FAE\u8C03 patch / \u8FD0\u884C\u8BB0\u5F55 \u6A2A\u6392\uFF08fig-main \u4E4B\u4E0B\u3001\u5168\u5BBD\uFF09 */
.fig-bottompanel {
  display: flex; gap: 12px; align-items: stretch;
  padding: 8px 10px; background: var(--surface); border-top: 1px solid var(--border);
  max-height: 240px; flex: none;
}
.fig-bottompanel .fig-section { flex: 1; min-width: 0; overflow-y: auto; }
.fig-hint { font-size: var(--fs-xs); color: var(--text-muted); line-height: 1.5; }
.fig-ws-state { font-size: var(--fs-xs); color: var(--text-muted); }
.fig-notice {
  margin: 8px 10px 0; padding: 8px 10px; border-radius: var(--r-md);
  font-size: var(--fs-xs); white-space: pre-wrap;
}
.fig-notice.error { background: var(--danger-subtle, rgba(220,38,38,.08)); color: var(--danger); border: 1px solid var(--danger); }
.fig-notice.warn { background: rgba(217,119,6,.08); color: var(--warning); border: 1px solid var(--warning); }

/* ---- Viewer ---- */
.fig-viewer-wrap {
  flex: 1; position: relative; overflow: hidden; min-height: 0;
  background: repeating-conic-gradient(var(--surface-hover) 0% 25%, var(--bg) 0% 50%) 50% / 24px 24px;
}
.fig-viewer-canvas { position: absolute; inset: 0; }
.fig-viewer-canvas svg {
  display: block; width: 100%; height: 100%;
  user-select: none; -webkit-user-select: none;
}
.fig-viewer-wrap .fig-zoom {
  position: absolute; right: 10px; bottom: 10px; display: flex; gap: 6px;
}
.fig-overlay-box {
  position: absolute; pointer-events: none; border-radius: 2px;
  border: 1.5px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.fig-overlay-box .fig-overlay-label {
  position: absolute; top: -18px; left: -1.5px; white-space: nowrap;
  font-size: var(--fs-xs); background: var(--accent); color: var(--accent-fg);
  padding: 1px 6px; border-radius: 3px;
}
.fig-overlay-box.hover-box { border-style: dashed; border-color: var(--text-muted); background: transparent; }
.fig-overlay-box.hover-box .fig-overlay-label { background: var(--text-muted); color: var(--bg); }
svg .fa-selected { outline: 2px solid var(--accent); }

/* ---- \u53F3\u680F\u533A\u5757 ---- */
.fig-section { display: flex; flex-direction: column; gap: 6px; }
.fig-section > h3 {
  margin: 0 0 4px; padding-bottom: 4px; font-size: var(--fs-sm); font-weight: var(--fw-semibold);
  color: var(--text-muted); border-bottom: 1px solid var(--border);
}
.fig-sel-info {
  font-size: var(--fs-xs); color: var(--text-secondary); word-break: break-all;
  background: var(--bg); border-radius: var(--r-md); padding: 8px;
}
.fig-sel-info b { color: var(--text); }
.fig-sel-lost { color: var(--danger); font-weight: var(--fw-semibold); }

.fig-element-tree { display: flex; flex-direction: column; gap: 1px; }
.fig-element-row {
  display: flex; align-items: center; gap: 3px; font-size: var(--fs-xs);
  padding: 2px 4px; border-radius: var(--r-sm);
}
.fig-element-row:hover { background: var(--surface-hover); }
.fig-element-row.element-active { background: var(--accent-subtle); }
.fig-element-row.element-active .fig-element-name { color: var(--accent); font-weight: var(--fw-semibold); }
.fig-element-name { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fig-element-name:hover { color: var(--accent); }
.fig-element-row.element-hidden .fig-element-name { color: var(--text-muted); text-decoration: line-through; }
.fig-element-caret { width: 14px; flex: none; text-align: center; }
button.fig-element-caret { padding: 0 2px; border: none; background: none; color: var(--text-muted); cursor: pointer; }
button.fig-element-caret:hover { color: var(--text); border: none; }
.fig-element-btn { padding: 0 4px; font-size: var(--fs-xs); flex: none; }

.fig-edit-grid {
  display: grid; grid-template-columns: auto 1fr; gap: 6px 8px;
  align-items: center; font-size: var(--fs-sm);
}
.fig-edit-grid label { color: var(--text-muted); }

.fig-op-item {
  border: 1px solid var(--border); border-radius: var(--r-md);
  padding: 6px 8px; font-size: var(--fs-xs);
  display: flex; flex-direction: column; gap: 3px;
}
.fig-op-item .fig-op-head { display: flex; align-items: center; gap: 6px; }
.fig-op-item .fig-op-desc { color: var(--text-muted); }
.fig-status-badge { font-size: var(--fs-xs); border-radius: var(--r-full, 8px); padding: 0 7px; font-weight: var(--fw-semibold); }
.fig-status-active { background: var(--accent-subtle); color: var(--accent); }
.fig-status-resolved { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
.fig-status-lost { background: color-mix(in srgb, var(--danger) 15%, transparent); color: var(--danger); }

.fig-code {
  background: var(--bg); color: var(--text); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 10px; margin: 0;
  font-size: var(--fs-xs); font-family: var(--font-mono);
  overflow: auto; max-height: 260px; white-space: pre;
}
.fig-dirty-banner {
  background: rgba(217,119,6,.08); border: 1px solid var(--warning);
  color: var(--warning); padding: 6px 10px; border-radius: var(--r-md); font-size: var(--fs-xs);
}
.fig-kv { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; font-size: var(--fs-xs); }
.fig-kv .k { color: var(--text-muted); white-space: nowrap; }
.fig-kv .v { word-break: break-all; }
.fig-filelist { font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-muted); }
.fig-runlist { list-style: none; margin: 0; padding: 0; font-size: var(--fs-xs); font-family: var(--font-mono); max-height: 200px; overflow-y: auto; }
.fig-run-ev { padding: 1px 0; color: var(--text-secondary); }
.fig-run-ev-run_start, .fig-run-ev-run_end { color: var(--text); font-weight: var(--fw-semibold); }
.fig-run-ev-node_failed { color: var(--danger); }
.fig-run-ev-llm_start, .fig-run-ev-llm_end { color: var(--text-muted); }

/* ---- \u5EFA\u56FE\u6D41 ---- */
.fig-create-flow { max-width: 520px; margin: 40px auto; display: flex; flex-direction: column; gap: 10px; padding: 16px; }
.fig-create-flow h2 { margin: 0; font-size: var(--fs-lg); color: var(--text-heading); }
.fig-tabs { display: flex; gap: 4px; }
.fig-tabs button.active { color: var(--accent); border-color: var(--accent); font-weight: var(--fw-semibold); }
.fig-create-flow label { display: flex; flex-direction: column; gap: 4px; font-size: var(--fs-xs); color: var(--text-muted); }
.fig-create-error { color: var(--danger); font-size: var(--fs-xs); white-space: pre-wrap; }

/* ---- toast ---- */
.fig-toast {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: var(--text); color: var(--bg);
  padding: 8px 16px; border-radius: var(--r-md); font-size: var(--fs-sm);
  box-shadow: var(--shadow-lg); z-index: 50; white-space: nowrap;
}
.fig-toast.error { background: var(--danger); color: #fff; }

/* ---- fig-ai \u9762\u677F ---- */
.fig-ai-root { display: flex; flex-direction: column; gap: 12px; }
.fig-ai-root section { display: flex; flex-direction: column; gap: 6px; }
.fig-ai-root h4 { margin: 0 0 4px; font-size: var(--fs-sm); color: var(--text-heading); }
.fig-ai-status {
  font-size: var(--fs-xs); color: var(--text-secondary); padding: 6px 8px;
  background: var(--bg); border-radius: var(--r-sm);
}
.fig-ai-empty { font-size: var(--fs-sm); color: var(--text-muted); padding: 16px 8px; text-align: center; }
`;function oe(){if(typeof document>"u")return;let e=document.getElementById(ne);e||(e=document.createElement("style"),e.id=ne,document.head.appendChild(e)),e.textContent=Ae}var f=Q(L(),1);function _e(e){return re(e),oe(),function(r){return ke(r)}}function ke(e){let t=e.ctx,r=t?.selectedItem?.value??t?.selectedItem??null,n=r?.item?.id??r?.id??null,[o,s]=v.useState(null),[l,c]=v.useState(""),[u,p]=v.useState(null),[V,M]=v.useState([]),[Se,y]=v.useState(!1),[W,B]=v.useState(!1),[G,z]=v.useState(0),[$e,at]=v.useState(!1),[j,H]=v.useState(null),$=(i,x=!1)=>{H({text:i,error:x}),window.setTimeout(()=>H(null),3200)};v.useEffect(()=>{if(p(null),M([]),!n)return;let i=!1;return h.getFigure(n).then(x=>{i||(p(x.hasFigure),z(x.hasFigure?x.patch.ops.length:0))}).catch(()=>!i&&p(!1)),()=>{i=!0}},[n]);let J=()=>{h.aiStatus().then(s).catch(()=>s({configured:!1,provider:"",model:"",mock:!1}))};v.useEffect(()=>{J()},[W]),v.useEffect(()=>{let i=null,x=!1,K=async()=>{if(x)return;let Fe=te()??await ee();x||(i=new WebSocket(Fe),i.onopen=()=>{B(!0),y(!1),J()},i.onmessage=Te=>{try{let _=JSON.parse(Te.data);if(_.type!=="ai_run"||!n||_.item&&_.item!==n)return;M(k=>[...k.slice(-199),{at:Date.now(),..._}]),_.phase==="run_end"&&(y(!1),h.getFigure(n).then(k=>{p(k.hasFigure),z(k.hasFigure?k.patch.ops.length:0)}).catch(()=>{}))}catch{}},i.onclose=()=>{B(!1),x||window.setTimeout(K,2e3)})};return K(),()=>{x=!0,i?.close()}},[n]);let I=Se||$e||!o?.configured||!n||u!==!0,Re=async()=>{if(!(!l.trim()||!n)){y(!0);try{let i=await h.instruct(n,l,[]);$(i.ok?"\u4FEE\u6539\u5B8C\u6210":`\u4FEE\u6539\u5931\u8D25\uFF1A${(i.stderr||"").slice(0,160)}`,!i.ok)}catch(i){$(`\u4FEE\u6539\u5931\u8D25\uFF1A${i.message}`,!0)}finally{y(!1),Y()}}},Ee=async()=>{if(n){y(!0);try{let i=await h.writebackPatch(n);$(i.cleared?"patch \u5DF2\u6536\u655B\u6E05\u7A7A":(i.remaining??-1)<0?"\u56DE\u5199\u672A\u6536\u655B":`\u56DE\u5199\u672A\u6536\u655B\uFF1A\u5269\u4F59 ${i.remaining} \u4E2A op`,!i.cleared)}catch(i){$(`\u56DE\u5199\u5931\u8D25\uFF1A${i.message}`,!0)}finally{y(!1),Y()}}},Y=()=>{n&&h.getFigure(n).then(i=>{p(i.hasFigure),z(i.hasFigure?i.patch.ops.length:0)}).catch(()=>{})};return n?u===!1?(0,f.jsx)("div",{className:"fig-scope fig-ai-root",children:(0,f.jsxs)("div",{className:"fig-ai-empty",children:["\u8BE5\u6761\u76EE\u8FD8\u6CA1\u6709\u56FE\u8868\u3002",(0,f.jsx)("br",{}),"\u5728\u6761\u76EE\u53F3\u952E\u300C\u6253\u5F00\u7ED8\u56FE\u5DE5\u4F5C\u53F0\u300D\u6253\u5F00\u56FE\u8868\u5DE5\u4F5C\u53F0\u5EFA\u56FE\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A AI \u64CD\u4F5C\u9762\u677F\u3002"]})}):(0,f.jsxs)("div",{className:"fig-scope fig-ai-root",children:[(0,f.jsxs)("div",{className:"fig-ai-status",children:["AI\uFF1A",o===null?"\u68C0\u6D4B\u4E2D\u2026":o.configured?`${o.provider} / ${o.model}${o.mock?"\uFF08mock\uFF09":""}`:`\u672A\u914D\u7F6E${o.detail?`\uFF08${o.detail}\uFF09`:""}\uFF1A\u8BF7\u5728 ~/.researchindex/ \u653E llm.json + .env\uFF08\u53C2\u7167 SpecModule config.example.json\uFF09\uFF0C\u6216\u8BBE RI_FIGURE_MOCK=1`]}),(0,f.jsxs)("section",{children:[(0,f.jsx)("h4",{children:"\u6307\u4EE4\u4FEE\u6539"}),(0,f.jsx)("textarea",{placeholder:"\u4F8B\u5982\uFF1A\u628A\u9009\u4E2D\u7684\u67F1\u5B50\u6539\u6210\u4E3B\u8272\u84DD\uFF0C\u5B57\u53F7\u7EDF\u4E00 12\uFF08\u5148\u5728\u56FE\u8868\u5DE5\u4F5C\u53F0\u9009\u4E2D\u5143\u7D20\u6548\u679C\u66F4\u597D\uFF09",value:l,onChange:i=>c(i.target.value),disabled:I}),(0,f.jsxs)("div",{style:{display:"flex",gap:6},children:[(0,f.jsx)("button",{onClick:Re,disabled:I||!l.trim(),children:"\u6267\u884C\u4FEE\u6539"}),(0,f.jsxs)("button",{onClick:Ee,disabled:I||G===0,children:["\u56DE\u5199 patch\uFF08",G," op\uFF09"]})]})]}),(0,f.jsxs)("section",{children:[(0,f.jsxs)("h4",{children:["\u8FD0\u884C\u65F6\u95F4\u7EBF ",W?"":"\uFF08WS \u65AD\u5F00\uFF09"]}),V.length===0&&(0,f.jsx)("div",{className:"fig-hint",children:"\u5C1A\u65E0 AI \u8FD0\u884C"}),(0,f.jsx)("ul",{className:"fig-runlist",children:V.map((i,x)=>(0,f.jsxs)("li",{className:`fig-run-ev fig-run-ev-${i.phase}`,children:[new Date(i.at).toLocaleTimeString()," ",i.phase,i.node?` \xB7 ${i.node}`:"",i.detail?` \xB7 ${i.detail}`:""]},x))})]}),j&&(0,f.jsx)("div",{className:`fig-toast ${j.error?"error":""}`,children:j.text})]}):(0,f.jsx)("div",{className:"fig-scope fig-ai-root",children:(0,f.jsx)("div",{className:"fig-ai-empty",children:"\u9009\u4E2D\u4E00\u4E2A Data \u6761\u76EE\u540E\uFF0C\u8FD9\u91CC\u53EF\u4EE5\u8FDB\u884C AI \u6307\u4EE4\u4FEE\u6539\u4E0E patch \u56DE\u5199\u3002"})})}return Ne(it);})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
exports.default = __fig__.default;
