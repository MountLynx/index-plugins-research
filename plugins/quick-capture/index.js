// quick-capture plugin (React) — 右栏"快速录入"标签页
// 模板来自工作区 rightPanelAddons[].config.templates；令牌 {date}/{today} 渲染为今天 YYYY-MM-DD
// 归属自动填：右栏当前选中条目类型 ∈ 模板 linkFromTypes 时，properties[linkField] = 选中条目 id
exports.default = function (React) {
  var createElement = React.createElement
  var useState = React.useState
  var useEffect = React.useEffect

  if (!document.getElementById('ri-qc-css')) {
    var style = document.createElement('style')
    style.id = 'ri-qc-css'
    style.textContent = [
      '.qc-wrap { padding: 10px; font-size: var(--fs-xs); color: var(--text); display: flex; flex-direction: column; gap: 8px; }',
      '.qc-row { display: flex; gap: 6px; align-items: center; }',
      '.qc-sel, .qc-inp { flex: 1; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--bg); color: var(--text); font-size: var(--fs-xs); padding: 3px 6px; font-family: inherit; }',
      '.qc-link { color: var(--text-muted); }',
      '.qc-btn { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 3px 10px; }',
      '.qc-btn:hover { background: var(--surface-hover); color: var(--accent); }',
      '.qc-btn:disabled { opacity: 0.4; cursor: default; }',
      '.qc-err { color: var(--danger); }',
      '.qc-recent { border-top: 1px solid var(--border); padding-top: 6px; color: var(--text-muted); }',
      '.qc-recent-item { cursor: pointer; padding: 1px 0; }',
      '.qc-recent-item:hover { color: var(--accent); }',
      '.qc-empty { text-align: center; color: var(--text-muted); padding: 24px 12px; font-size: var(--fs-sm); }',
    ].join('')
    document.head.appendChild(style)
  }

  function todayStr() {
    var t = new Date()
    function p(n) { return n < 10 ? '0' + n : '' + n }
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate())
  }
  function renderToken(s) { return String(s == null ? '' : s).replace(/\{date\}|\{today\}/g, todayStr()) }

  return function QuickCapturePlugin(props) {
    var ctx = props.ctx
    var cfg = ctx.config || {}
    var templates = Array.isArray(cfg.templates) ? cfg.templates : []

    var typeByName = {}
    ctx.itemTypes.forEach(function (t) { typeByName[t.name] = t })

    // 初始/回退模板优先选类型可用的（typeByName 命中），全部缺失才回退 templates[0]（维持置灰降级）
    function tplById(id) {
      for (var i = 0; i < templates.length; i++) { if (templates[i].id === id) return templates[i] }
      return null
    }
    function firstUsableTpl() {
      for (var i = 0; i < templates.length; i++) { if (typeByName[templates[i].type]) return templates[i] }
      return templates.length ? templates[0] : null
    }
    var idState = useState(templates.length ? firstUsableTpl().id : '')
    var tplId = idState[0], setTplId = idState[1]
    var tpl = tplId ? tplById(tplId) : null
    if (!tpl) tpl = firstUsableTpl()
    var type = tpl ? typeByName[tpl.type] : null

    var nameState = useState('')
    var name = nameState[0], setName = nameState[1]
    // 模板切换/首挂：名称预填 namePattern 渲染值
    useEffect(function () { if (tpl) setName(renderToken(tpl.namePattern || '')) }, [tplId])

    var busyState = useState(false)
    var busy = busyState[0], setBusy = busyState[1]
    var errState = useState('')
    var err = errState[0], setErr = errState[1]
    var recState = useState([])
    var recents = recState[0], setRecents = recState[1]

    var sel = ctx.selectedItem
    var linkTypes = (tpl && tpl.linkFromTypes) || []
    var linkActive = !!(tpl && tpl.linkField && sel && sel.item && sel.item_type &&
      linkTypes.indexOf(sel.item_type.name) >= 0)

    function doCreate() {
      if (!tpl || !type || !name.trim() || busy) return
      setBusy(true)
      setErr('')
      var p = {}
      var src = tpl.properties || {}
      Object.keys(src).forEach(function (k) { p[k] = renderToken(src[k]) })
      if (linkActive) p[tpl.linkField] = sel.item.id
      ctx.createItem(type.id, name.trim(), p).then(function (it) {
        setRecents(function (prev) { return [it].concat(prev).slice(0, 5) })
        setName(renderToken(tpl.namePattern || ''))
        setBusy(false)
        return ctx.refreshItems()
      }).catch(function (e) {
        setErr(String((e && e.message) || e))
        setBusy(false)
      })
    }

    if (!templates.length) {
      return createElement('div', { className: 'qc-wrap' },
        createElement('div', { className: 'qc-empty' }, '本工作区未配置录入模板'))
    }

    return createElement('div', { className: 'qc-wrap' },
      createElement('div', { className: 'qc-row' },
        createElement('select', {
          className: 'qc-sel', value: tpl.id,
          onChange: function (e) { setTplId(e.target.value) },
        }, templates.map(function (t) {
          var missing = !typeByName[t.type]
          return createElement('option', { key: t.id, value: t.id, disabled: missing },
            t.label + (missing ? '（类型缺失）' : ''))
        }))),
      linkActive ? createElement('div', { className: 'qc-link', key: 'link' },
        '归属: ' + sel.item.name) : null,
      createElement('div', { className: 'qc-row' },
        createElement('input', {
          className: 'qc-inp', value: name,
          onChange: function (e) { setName(e.target.value) },
          onKeyDown: function (e) { if (e.key === 'Enter') doCreate() },
        }),
        createElement('button', {
          className: 'qc-btn', onClick: doCreate,
          disabled: !type || !name.trim() || busy,
        }, busy ? '创建中…' : '创建')),
      err ? createElement('div', { className: 'qc-err' }, err) : null,
      recents.length ? createElement('div', { className: 'qc-recent', key: 'recent' },
        '最近创建',
        recents.map(function (it) {
          return createElement('div', {
            className: 'qc-recent-item', key: it.id,
            onClick: function () { ctx.selectItem(it.id) },
          }, it.name)
        })) : null)
  }
}
