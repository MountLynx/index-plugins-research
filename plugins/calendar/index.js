// calendar plugin (React) — 时间线工作区月视图（全点事件，无跨度条）
// 日期语义：Experiment=规划截止日期；Operation/Record=执行/记录当天；Task=截止日期
// 字段解析：工作区 tab config.typeFields 显式映射优先，探测兜底；落空该类型不显示
exports.default = function (React) {
  var createElement = React.createElement
  var useState = React.useState

  if (!document.getElementById('ri-calendar-css')) {
    var style = document.createElement('style')
    style.id = 'ri-calendar-css'
    style.textContent = [
      '.cal-wrap { padding: 12px; font-size: var(--fs-xs); color: var(--text); }',
      '.cal-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }',
      '.cal-title { font-size: var(--fs-sm); font-weight: var(--fw-semibold); min-width: 96px; text-align: center; }',
      '.cal-btn { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 3px 10px; }',
      '.cal-btn:hover { background: var(--surface-hover); color: var(--accent); }',
      '.cal-legend { display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap; }',
      '.cal-lg { cursor: pointer; border: 1px solid var(--border); border-radius: var(--r-sm); padding: 1px 8px; color: var(--text-secondary); background: var(--surface); }',
      '.cal-lg.off { opacity: 0.4; text-decoration: line-through; }',
      '.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-left: 1px solid var(--border); border-top: 1px solid var(--border); }',
      '.cal-dow { padding: 3px 6px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--surface-hover); font-weight: var(--fw-semibold); color: var(--text-secondary); }',
      '.cal-cell { min-height: 72px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 2px 4px; overflow: hidden; }',
      '.cal-cell.out { background: var(--surface); opacity: 0.55; }',
      '.cal-cell.today .cal-day { color: var(--accent); font-weight: var(--fw-semibold); }',
      '.cal-day { color: var(--text-muted); }',
      '.cal-chip { cursor: pointer; border-radius: var(--r-sm); padding: 0 4px; margin: 1px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: var(--surface-hover); }',
      '.cal-chip:hover { background: var(--border); }',
      '.cal-chip.over { color: var(--danger); }',
      '.cal-chip.done { opacity: 0.45; text-decoration: line-through; }',
      '.cal-empty { text-align: center; color: var(--text-muted); padding: 32px 16px; font-size: var(--fs-sm); }',
    ].join('')
    document.head.appendChild(style)
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n }
  function fmt(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d) }
  function todayStr() { var t = new Date(); return fmt(t.getFullYear(), t.getMonth(), t.getDate()) }

  // 日期字段解析：cfgVal 显式名 > 探测（date 字段，名含"截止"优先，否则第一个）
  function resolveDateField(type, cfgVal) {
    var fields = (type && type.fields) || []
    if (cfgVal) {
      for (var i = 0; i < fields.length; i++) { if (fields[i].name === cfgVal) return cfgVal }
    }
    var cands = []
    for (var j = 0; j < fields.length; j++) { if (fields[j].field_type === 'date') cands.push(fields[j]) }
    if (!cands.length) return null
    for (var k = 0; k < cands.length; k++) { if ((cands[k].name || '').indexOf('截止') >= 0) return cands[k].name }
    return cands[0].name
  }

  // 完成字段：config.checkFields 显式名 > checkbox 探测（"已完成"/"完成"优先）
  function resolveDoneField(type, cfgVal) {
    var fields = (type && type.fields) || []
    if (cfgVal) {
      for (var i = 0; i < fields.length; i++) { if (fields[i].name === cfgVal) return cfgVal }
    }
    var cands = []
    for (var j = 0; j < fields.length; j++) { if (fields[j].field_type === 'checkbox') cands.push(fields[j]) }
    if (!cands.length) return null
    for (var k = 0; k < cands.length; k++) {
      if (cands[k].name === '已完成' || cands[k].name === '完成') return cands[k].name
    }
    return cands[0].name
  }

  function monthCells(year, month) {
    var firstDow = new Date(year, month, 1).getDay()
    var d = new Date(year, month, 1 - firstDow)
    var cells = []
    for (var i = 0; i < 42; i++) {
      cells.push({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() })
      d.setDate(d.getDate() + 1)
    }
    return cells
  }

  var DOW = ['日', '一', '二', '三', '四', '五', '六']

  return function CalendarPlugin(props) {
    var ctx = props.ctx
    var cfg = ctx.config || {}
    var typeFields = cfg.typeFields || {}

    var curState = useState(function () { var t = new Date(); return { y: t.getFullYear(), m: t.getMonth() } })
    var cursor = curState[0], setCursor = curState[1]
    var hidState = useState({})
    var hidden = hidState[0], setHidden = hidState[1]

    var typeById = {}
    ctx.itemTypes.forEach(function (t) { typeById[t.id] = t })

    // 类型名 → { dateField, doneField }；解析落空的类型不出现
    var res = {}
    ctx.itemTypes.forEach(function (t) {
      var df = resolveDateField(t, (typeFields[t.name] || {}).date)
      if (!df) return
      res[t.name] = { dateField: df, doneField: resolveDoneField(t, (cfg.checkFields || {})[t.name]) }
    })

    var today = todayStr()
    // 日期字符串 → 事件数组
    var byDay = {}
    ctx.items.forEach(function (it) {
      var t = typeById[it.type_id]
      var r = t && res[t.name]
      if (!r) return
      // 假设日期属性值为前导零填充的 YYYY-MM-DD（壳的日期输入产物）；非 ISO 形态静默不显示（符合降级策略）
      var v = (it.properties || {})[r.dateField]
      if (!v || typeof v !== 'string') return
      if (!byDay[v]) byDay[v] = []
      var done = !!(r.doneField && (it.properties || {})[r.doneField])
      byDay[v].push({ id: it.id, name: it.name, typeName: t.name, done: done, over: !done && v < today })
    })

    function shift(n) {
      setCursor(function (c) {
        var m = c.m + n
        if (m < 0) return { y: c.y - 1, m: 11 }
        if (m > 11) return { y: c.y + 1, m: 0 }
        return { y: c.y, m: m }
      })
    }
    function goToday() { var t = new Date(); setCursor({ y: t.getFullYear(), m: t.getMonth() }) }
    function toggleLegend(n) {
      setHidden(function (h) {
        var g = {}
        for (var k in h) g[k] = h[k]
        g[n] = !h[n]
        return g
      })
    }

    if (!Object.keys(res).length) {
      return createElement('div', { className: 'cal-wrap' },
        createElement('div', { className: 'cal-empty' }, '当前工作区没有可解析日期字段的类型'))
    }

    var cells = monthCells(cursor.y, cursor.m)
    return createElement('div', { className: 'cal-wrap' },
      createElement('div', { className: 'cal-head' },
        createElement('button', { className: 'cal-btn', onClick: function () { shift(-1) } }, '‹'),
        createElement('div', { className: 'cal-title' }, cursor.y + ' 年 ' + (cursor.m + 1) + ' 月'),
        createElement('button', { className: 'cal-btn', onClick: function () { shift(1) } }, '›'),
        createElement('button', { className: 'cal-btn', onClick: goToday }, '今天'),
        createElement('div', { className: 'cal-legend' },
          Object.keys(res).map(function (n) {
            return createElement('span', {
              key: n,
              className: 'cal-lg' + (hidden[n] ? ' off' : ''),
              onClick: function () { toggleLegend(n) },
            }, n)
          }))),
      createElement('div', { className: 'cal-grid' },
        DOW.map(function (d, i) { return createElement('div', { className: 'cal-dow', key: 'd' + i }, d) }),
        cells.map(function (c, i) {
          var key = fmt(c.y, c.m, c.d)
          var isToday = key === today
          var out = c.m !== cursor.m
          var evs = (byDay[key] || []).filter(function (e) { return !hidden[e.typeName] })
          return createElement('div', {
            className: 'cal-cell' + (out ? ' out' : '') + (isToday ? ' today' : ''),
            key: key + '-' + i,
          },
            createElement('div', { className: 'cal-day' }, c.d),
            evs.map(function (e) {
              return createElement('div', {
                key: e.id,
                className: 'cal-chip' + (e.over ? ' over' : '') + (e.done ? ' done' : ''),
                title: e.typeName + ' · ' + e.name,
                onClick: function () { ctx.selectItem(e.id) },
              }, e.name)
            }))
        })))
  }
}
