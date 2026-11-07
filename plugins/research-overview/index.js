// research-overview plugin (React) — 全景工作区：任务清单（默认）+ 统计仪表盘
// 任务清单：Project→Research→Experiment→Operation 分级树（chain 可 config 覆盖）
// 行内控件：有状态字的层=状态下拉快编；无状态层=勾选框；都没有=圆点
// 计数口径：子树内所有"可判定完成"的条目（含自身）——状态 ∈ {已完成,完成} ∪ 旧勾选框
// 筛选：状态下拉（选项=各层 options ∪ 条目实际值，变体归一：计划→计划中、完成→已完成）
//       × 日历区间（起止都填=区间；只填起=单日；只填止=截至当日），
//       日期作用于所有带日期字段的层；状态∧日期同时生效取交集；
//       命中节点所在链整体保留（子树语义）
// 仪表盘：课题完成度 / 逾期实验 / 今日操作 / 近 7 天操作 / 写作管线 / 文献进度 / 未完成任务
exports.default = function (React) {
  var createElement = React.createElement
  var useState = React.useState
  var useEffect = React.useEffect

  if (!document.getElementById('ri-ov-css')) {
    var style = document.createElement('style')
    style.id = 'ri-ov-css'
    style.textContent = [
      '.ov-wrap { padding: 12px; font-size: var(--fs-xs); color: var(--text); }',
      '.ov-head { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }',
      '.ov-mode, .ov-filter { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 3px 10px; }',
      '.ov-mode:hover, .ov-filter:hover { background: var(--surface-hover); color: var(--accent); }',
      '.ov-mode.on, .ov-filter.on { background: var(--surface-hover); color: var(--accent); border-color: var(--accent); }',
      '.ov-sel { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 2px 4px; }',
      '.ov-sel.on { color: var(--accent); border-color: var(--accent); }',
      '.ov-cal-pop { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); }',
      '.ov-cal-pop label { color: var(--text-muted); }',
      '.ov-cal-inp { border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--bg); color: var(--text); font-size: var(--fs-xs); font-family: inherit; padding: 0 2px; }',
      '.ov-spacer { flex: 1; }',
      '.ov-err { color: var(--danger); }',
      '.ov-node { margin: 1px 0; }',
      '.ov-row { display: flex; align-items: center; gap: 6px; padding: 2px 4px; border-radius: var(--r-sm); cursor: pointer; }',
      '.ov-row:hover { background: var(--surface-hover); }',
      '.ov-row.sel { background: var(--accent-subtle); }',
      '.ov-row.sel .ov-name { color: var(--accent); font-weight: var(--fw-semibold); }',
      '.ov-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); flex: none; }',
      '.ov-cb { cursor: pointer; }',
      '.ov-status-sel { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--bg); color: var(--text); cursor: pointer; padding: 0 2px; max-width: 110px; }',
      '.ov-name { cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.ov-name:hover { color: var(--accent); }',
      '.ov-stat { margin-left: auto; color: var(--text-muted); white-space: nowrap; }',
      '.ov-stat.full { color: var(--accent); }',
      '.ov-date-inp { border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--bg); color: var(--text); font-size: var(--fs-xs); font-family: inherit; padding: 0 2px; }',
      '.ov-date-err { color: var(--danger); }',
      '.ov-orphan-title { color: var(--text-muted); margin-top: 10px; font-weight: var(--fw-semibold); }',
      '.ov-kids { }',
      '.ov-empty { text-align: center; color: var(--text-muted); padding: 32px 16px; font-size: var(--fs-sm); }',
      '.ov-dash { display: flex; flex-direction: column; gap: 14px; }',
      '.ov-sec-title { font-weight: var(--fw-semibold); color: var(--text-secondary); margin-bottom: 4px; }',
      '.ov-bar-row { display: flex; align-items: center; gap: 8px; padding: 1px 0; }',
      '.ov-bar-name { width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.ov-bar { flex: 1; height: 10px; background: var(--surface-hover); border-radius: var(--r-sm); overflow: hidden; }',
      '.ov-bar-fill { height: 100%; background: var(--accent); }',
      '.ov-pct { color: var(--text-muted); min-width: 48px; text-align: right; }',
      '.ov-item { cursor: pointer; padding: 1px 0; }',
      '.ov-item:hover { color: var(--accent); }',
      '.ov-cols { display: flex; gap: 6px; align-items: flex-end; height: 60px; }',
      '.ov-col { width: 26px; background: var(--accent); opacity: 0.75; border-radius: 2px 2px 0 0; }',
      '.ov-col-lb { color: var(--text-muted); text-align: center; width: 26px; }',
      '.ov-chip { display: inline-block; border: 1px solid var(--border); border-radius: var(--r-sm); padding: 1px 8px; margin: 0 6px 4px 0; background: var(--surface); }',
    ].join('')
    document.head.appendChild(style)
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n }
  function fmt(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d) }
  function todayStr() { var t = new Date(); return fmt(t.getFullYear(), t.getMonth(), t.getDate()) }

  function fieldsOf(type) { return (type && type.fields) || [] }
  function pick(fields, pred) {
    for (var i = 0; i < fields.length; i++) { if (pred(fields[i])) return fields[i] }
    return null
  }
  function byCfg(fields, cfgVal) {
    if (!cfgVal) return null
    return pick(fields, function (f) { return f.name === cfgVal })
  }
  function resolveItemField(type, cfgVal) {
    var f = byCfg(fieldsOf(type), cfgVal)
    if (f) return f.name
    var hit = pick(fieldsOf(type), function (x) { return x.field_type === 'item' })
    return hit ? hit.name : null
  }
  function resolveDateField(type, cfgVal) {
    var fields = fieldsOf(type)
    var f = byCfg(fields, cfgVal)
    if (f) return f.name
    var cands = []
    for (var i = 0; i < fields.length; i++) { if (fields[i].field_type === 'date') cands.push(fields[i]) }
    if (!cands.length) return null
    for (var j = 0; j < cands.length; j++) { if ((cands[j].name || '').indexOf('截止') >= 0) return cands[j].name }
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
  // 状态字段（完整定义）：config.statusFields 显式名 > 探测（"状态"/"写作状态"/"阅读状态"优先）> 唯一 dropdown
  function resolveStatusFieldFull(type, cfgVal) {
    var fields = fieldsOf(type)
    var f = byCfg(fields, cfgVal)
    if (f && f.field_type === 'dropdown') return f
    var prefs = ['状态', '写作状态', '阅读状态']
    for (var i = 0; i < prefs.length; i++) {
      var hit = pick(fields, function (x) { return x.field_type === 'dropdown' && x.name === prefs[i] })
      if (hit) return hit
    }
    var cands = []
    for (var k = 0; k < fields.length; k++) {
      if (fields[k].field_type === 'dropdown') cands.push(fields[k])
    }
    return cands.length === 1 ? cands[0] : null
  }
  function resolveStatusField(type, cfgVal) {
    var f = resolveStatusFieldFull(type, cfgVal)
    return f ? f.name : null
  }

  // 状态变体归一：不同层选项词汇不一（Project=完成、Experiment=计划），筛选层折叠
  var STATUS_CANON = {
    '计划': '计划中', '计划中': '计划中',
    '进行中': '进行中',
    '搁置': '搁置',
    '失败': '失败',
    '已完成': '已完成', '完成': '已完成',
  }
  var STATUS_ORDER = ['计划中', '进行中', '搁置', '失败', '已完成']
  function canonStatus(v) {
    var s = String(v == null ? '' : v).trim()
    return STATUS_CANON[s] || s
  }

  var DEFAULT_CHAIN = [
    { type: 'Project' },
    { type: 'Research', linkField: '所属课题' },
    { type: 'Experiment', linkField: '所属板块' },
    { type: 'Operation', linkField: '所属实验' },
  ]

  // 行内状态快编子组件（组件外定义：组件体内定义会在父重渲染时换类型 → 整树 remount）
  // 仿 DateEdit：乐观更新，失败回滚到条目属性值并冒泡 setErr
  function StatusEdit(p) {
    var st = useState((p.item.properties || {})[p.field] || '')
    var v = st[0], setV = st[1]
    useEffect(function () {
      setV((p.item.properties || {})[p.field] || '')
    }, [p.item.id, p.field])
    function onChange(ev) {
      var nv = ev.target.value
      setV(nv)
      var props2 = {}
      var src = p.item.properties || {}
      for (var k in src) props2[k] = src[k]
      props2[p.field] = nv
      Promise.resolve(p.onSave(p.item.id, props2)).catch(function (ex) {
        setV((p.item.properties || {})[p.field] || '')
        p.setErr(String((ex && ex.message) || ex))
      })
    }
    // 选项用该层类型的原值词汇；当前值不在 options（自定义值）时补入
    var opts = (p.options || []).slice()
    if (v && opts.indexOf(v) < 0) opts.unshift(v)
    return createElement('select', {
      className: 'ov-status-sel', value: v,
      onClick: function (ev) { ev.stopPropagation() },
      onChange: onChange,
    },
      createElement('option', { value: '' }, '（未填）'),
      opts.map(function (o) { return createElement('option', { value: o, key: o }, o) }))
  }

  // 快捷改期子组件（收 onSave；失败就地 eMsg 提示并回滚）
  function DateEdit(p) {
    var st = useState((p.item.properties || {})[p.field] || '')
    var v = st[0], setV = st[1]
    var es = useState('')
    var eMsg = es[0], setEMsg = es[1]
    useEffect(function () {
      setV((p.item.properties || {})[p.field] || '')
      setEMsg('')
    }, [p.item.id, p.field])
    function onChange(ev) {
      var nv = ev.target.value
      setV(nv)
      var props2 = {}
      var src = p.item.properties || {}
      for (var k in src) props2[k] = src[k]
      props2[p.field] = nv
      Promise.resolve(p.onSave(p.item.id, props2)).then(function () {
        setEMsg('')
      }).catch(function (ex) {
        setV((p.item.properties || {})[p.field] || '')
        setEMsg(String((ex && ex.message) || ex))
      })
    }
    return createElement('span', { className: 'ov-date' },
      createElement('input', {
        type: 'date', className: 'ov-date-inp', value: v,
        onClick: function (ev) { ev.stopPropagation() },
        onChange: onChange,
      }),
      eMsg ? createElement('span', { className: 'ov-date-err' }, eMsg) : null)
  }

  return function ResearchOverviewPlugin(props) {
    var ctx = props.ctx
    var cfg = ctx.config || {}
    // 当前选中条目 id：React 宿主传 plain ItemDetail，Vue 宿主传 ComputedRef——两种形状都解包。
    // ctx 由宿主每次渲染重建，选中变化时本组件随之重渲染，高亮即响应。
    var selDetail = ctx.selectedItem
    if (selDetail && typeof selDetail === 'object' && 'value' in selDetail) selDetail = selDetail.value
    var selectedId = selDetail ? (((selDetail.item || {}).id) || selDetail.id || null) : null
    var chain = Array.isArray(cfg.chain) && cfg.chain.length ? cfg.chain : DEFAULT_CHAIN
    var today = todayStr()

    var typeById = {}
    var typeByName = {}
    ctx.itemTypes.forEach(function (t) { typeById[t.id] = t; typeByName[t.name] = t })

    // 每层解析：{ type, typeObj, itemField, statusField, statusOptions, doneField, dateField }
    var levels = chain.map(function (c) {
      var t = typeByName[c.type] || null
      var sf = t ? resolveStatusFieldFull(t, (cfg.statusFields || {})[c.type]) : null
      return {
        type: c.type, typeObj: t,
        itemField: t ? resolveItemField(t, c.linkField) : null,
        statusField: sf ? sf.name : null,
        statusOptions: sf && Array.isArray(sf.options) ? sf.options : [],
        doneField: t ? resolveDoneField(t, (cfg.checkFields || {})[c.type]) : null,
        dateField: t ? resolveDateField(t, (cfg.typeFields || {})[c.type]) : null,
      }
    })

    var modeState = useState('list')
    var mode = modeState[0], setMode = modeState[1]
    var errState = useState('')
    var err = errState[0], setErr = errState[1]
    // 筛选状态：statusV='' =全部；dFrom/dTo 全空 =不限日期；calOpen 控制日历行显隐
    var stState = useState('')
    var statusV = stState[0], setStatusV = stState[1]
    var dfState = useState('')
    var dFrom = dfState[0], setDFrom = dfState[1]
    var dtState = useState('')
    var dTo = dtState[0], setDTo = dtState[1]
    var cpState = useState(false)
    var calOpen = cpState[0], setCalOpen = cpState[1]

    // ── 树构建（两遍：判父与遍历顺序无关，引擎 ORDER BY updated_at DESC 子先父后也正确）──
    function buildTree(items) {
      var parentIdsByLevel = []
      for (var li = 0; li < levels.length; li++) parentIdsByLevel.push({})
      var byLevel = []
      for (var li = 0; li < levels.length; li++) byLevel.push([])
      // 第一遍：按层归类并登记每层全部 id（含将判为孤儿的——判父与顺序无关的前提）
      items.forEach(function (it) {
        var t = typeById[it.type_id]
        if (!t) return
        for (var li = 0; li < levels.length; li++) {
          if (levels[li].type === t.name) {
            byLevel[li].push(it)
            parentIdsByLevel[li][it.id] = true
            break
          }
        }
      })
      // 第二遍：判父/挂树
      var childMap = {}
      var roots = []
      var orphans = []
      for (var li = 0; li < levels.length; li++) {
        byLevel[li].forEach(function (it) {
          if (li === 0) { roots.push(it); return }
          var pk = (it.properties || {})[levels[li].itemField || '']
          if (pk && parentIdsByLevel[li - 1][pk]) {
            if (!childMap[pk]) childMap[pk] = []
            childMap[pk].push(it)
          } else {
            orphans.push({ level: li, item: it })
          }
        })
      }
      return { childMap: childMap, roots: roots, orphans: orphans }
    }

    function isDone(lv, it) { return !!(lv.doneField && (it.properties || {})[lv.doneField]) }

    // 完成口径：状态 ∈ {已完成,完成} ∪ 旧勾选框（无状态层退化为纯勾选框）。
    // 旧数据勾了框但状态未标 → 只读并集显示，不写回仓库。
    function isDoneLike(lv, it) {
      var props = it.properties || {}
      if (lv.statusField && canonStatus(props[lv.statusField]) === '已完成') return true
      return !!(lv.doneField && props[lv.doneField])
    }

    // 子树计数：状态层与勾选层都计入分子分母（Project 因状态字段首次计入）
    function stat(tree, lvIdx, it) {
      var s = { done: 0, total: 0 }
      var lv = levels[lvIdx]
      if (lv.statusField || lv.doneField) { s.total++; if (isDoneLike(lv, it)) s.done++ }
      var kids = tree.childMap[it.id] || []
      for (var i = 0; i < kids.length; i++) {
        var cs = stat(tree, lvIdx + 1, kids[i])
        s.done += cs.done
        s.total += cs.total
      }
      return s
    }

    function subtreeHas(tree, lvIdx, it, pred) {
      if (pred(levels[lvIdx], it, lvIdx)) return true
      var kids = tree.childMap[it.id] || []
      for (var i = 0; i < kids.length; i++) {
        if (subtreeHas(tree, lvIdx + 1, kids[i], pred)) return true
      }
      return false
    }

    // 多个筛选条件同时生效取交集：根层面要求子树内每个条件都有命中节点
    // （可为不同节点）；链内展开则保留通往任一命中节点的路径——单谓词时
    // 与既有子树语义完全一致
    function matchesPreds(tree, lvIdx, it, preds) {
      for (var i = 0; i < preds.length; i++) {
        if (!subtreeHas(tree, lvIdx, it, preds[i])) return false
      }
      return true
    }
    function matchesAny(tree, lvIdx, it, preds) {
      for (var i = 0; i < preds.length; i++) {
        if (subtreeHas(tree, lvIdx, it, preds[i])) return true
      }
      return false
    }

    // 状态谓词：已完成 = isDoneLike 并集；其余值仅状态层精确（canon 后）匹配
    function predStatus(lv, it) {
      if (!statusV) return false
      if (statusV === '已完成') return isDoneLike(lv, it)
      return !!lv.statusField && canonStatus((it.properties || {})[lv.statusField]) === statusV
    }
    // 日期谓词：作用于所有带日期字段的层；YYYY-MM-DD 字符串字典序即时间序。
    // 起止都填=闭区间；只填起=单日；只填止=截至当日
    var dateActive = !!(dFrom || dTo)
    function predDate(lv, it) {
      if (!lv.dateField) return false
      var val = (it.properties || {})[lv.dateField]
      if (typeof val !== 'string' || !val) return false
      if (dFrom && dTo) return val >= dFrom && val <= dTo
      if (dFrom) return val === dFrom
      return val <= dTo
    }
    function activePreds() {
      var preds = []
      if (statusV) preds.push(predStatus)
      if (dateActive) preds.push(predDate)
      return preds
    }

    // 筛选下拉全集：各层状态下拉 options ∪ 条目实际值，canon 折叠去重，按生命周期排序
    function statusUniverse() {
      var seen = {}
      var out = []
      function add(v) {
        var c = canonStatus(v)
        if (!c || seen[c]) return
        seen[c] = 1
        out.push(c)
      }
      levels.forEach(function (lv) {
        if (!lv.statusField) return
        lv.statusOptions.forEach(add)
      })
      ctx.items.forEach(function (it) {
        var t = typeById[it.type_id]
        if (!t) return
        for (var i = 0; i < levels.length; i++) {
          var lv = levels[i]
          if (lv.typeObj && lv.type === t.name && lv.statusField) add((it.properties || {})[lv.statusField])
        }
      })
      out.sort(function (a, b) {
        var ia = STATUS_ORDER.indexOf(a), ib = STATUS_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return a < b ? -1 : 1
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
      return out
    }

    // ctx.updateItem 委托 useItemStore.update，内部已 await refreshView（重拉列表）——插件不再二次刷新
    function saveProps(id, props2) {
      return ctx.updateItem(id, { properties: props2 })
    }
    function toggleDone(lv, it) {
      var props2 = {}
      var src = it.properties || {}
      for (var k in src) props2[k] = src[k]
      props2[lv.doneField] = !isDone(lv, it)
      saveProps(it.id, props2).catch(function (e) {
        setErr(String((e && e.message) || e))
      })
    }

    // 快捷改期/状态快编子组件见组件外定义（StatusEdit/DateEdit）

    function renderNode(tree, lvIdx, it, depth, preds) {
      var lv = levels[lvIdx]
      var s = stat(tree, lvIdx, it)
      var kids = (tree.childMap[it.id] || []).filter(function (k) {
        return !preds.length || matchesAny(tree, lvIdx + 1, k, preds)
      })
      var done = isDoneLike(lv, it)
      var row = []
      row.push(createElement('span', { key: 'in', style: { width: (depth * 16) + 'px', flex: 'none' } }))
      if (lv.statusField) {
        // 状态层：行内状态下拉快编（状态为完成事实源）
        row.push(createElement(StatusEdit, {
          key: 'st', item: it, field: lv.statusField, options: lv.statusOptions,
          onSave: saveProps, setErr: setErr,
        }))
      } else if (lv.doneField) {
        row.push(createElement('input', {
          type: 'checkbox', className: 'ov-cb', key: 'cb', checked: done,
          onClick: function (ev) { ev.stopPropagation() },
          onChange: function () { toggleDone(lv, it) },
        }))
      } else {
        // 无状态无勾选框的层级：无序列表圆点，视觉对齐有控件层级
        row.push(createElement('span', { className: 'ov-dot', key: 'dot' }))
      }
      row.push(createElement('span', {
        className: 'ov-name', key: 'nm', title: it.name,
      }, it.name))
      if (lv.dateField) {
        row.push(createElement(DateEdit, { key: 'dt', item: it, field: lv.dateField, onSave: saveProps }))
      }
      if (s.total > 0) {
        row.push(createElement('span', {
          className: 'ov-stat' + (s.done === s.total ? ' full' : ''), key: 'stt',
        }, s.done + '/' + s.total))
      }
      return createElement('div', { className: 'ov-node', key: it.id },
        createElement('div', {
          className: 'ov-row' + (selectedId === it.id ? ' sel' : ''),
          onClick: function () { ctx.selectItem(it.id) },
        }, row),
        kids.length
          ? createElement('div', { className: 'ov-kids' },
            kids.map(function (k) { return renderNode(tree, lvIdx + 1, k, depth + 1, preds) }))
          : null)
    }

    function renderOrphans(tree, preds) {
      var groups = {}
      tree.orphans.forEach(function (o) {
        if (preds.length && !matchesPreds(tree, o.level, o.item, preds)) return
        if (!groups[o.level]) groups[o.level] = []
        groups[o.level].push(o.item)
      })
      var out = []
      Object.keys(groups).forEach(function (liStr) {
        var li = Number(liStr)
        out.push(createElement('div', { className: 'ov-orphan-title', key: 'ot' + li },
          '未归属 · ' + levels[li].type))
        groups[liStr].forEach(function (it) { out.push(renderNode(tree, li, it, 1, preds)) })
      })
      return out.length ? createElement('div', { key: 'orphans' }, out) : null
    }

    function calInp(val, set) {
      return createElement('input', {
        type: 'date', className: 'ov-cal-inp', value: val,
        onChange: function (ev) { set(ev.target.value) },
      })
    }

    function renderList() {
      var tree = buildTree(ctx.items)
      var preds = activePreds()
      var roots = tree.roots.filter(function (r) {
        return !preds.length || matchesPreds(tree, 0, r, preds)
      })
      var body
      if (!tree.roots.length && !tree.orphans.length) {
        body = createElement('div', { className: 'ov-empty', key: 'empty' },
          '没有 ' + levels[0].type + ' 条目——先在列表页新建课题')
      } else if (!roots.length && preds.length) {
        body = createElement('div', { className: 'ov-empty', key: 'emptyf' }, '当前筛选下没有条目')
      } else {
        body = createElement('div', { key: 'tree' },
          roots.map(function (r) { return renderNode(tree, 0, r, 0, preds) }),
          renderOrphans(tree, preds))
      }
      return createElement('div', {},
        createElement('div', { className: 'ov-head' },
          createElement('select', {
            className: 'ov-sel' + (statusV ? ' on' : ''), value: statusV, title: '按状态筛选',
            onChange: function (ev) { setStatusV(ev.target.value) },
          },
            createElement('option', { value: '' }, '全部'),
            statusUniverse().map(function (c) {
              return createElement('option', { value: c, key: c }, c)
            })),
          createElement('button', {
            className: 'ov-cal ov-filter' + (dateActive ? ' on' : ''),
            title: dateActive ? (dFrom || '…') + ' ~ ' + (dTo || '…') : '按日期筛选（某天或一段时间）',
            onClick: function () { setCalOpen(!calOpen) },
          }, '📅')),
        calOpen ? createElement('div', { className: 'ov-cal-pop' },
          createElement('label', {}, '起', calInp(dFrom, setDFrom)),
          createElement('label', {}, '止', calInp(dTo, setDTo)),
          createElement('button', {
            className: 'ov-filter', title: '快捷填入今天（单日）',
            onClick: function () { setDFrom(today); setDTo('') },
          }, '今天'),
          createElement('button', {
            className: 'ov-filter', title: '清除日期筛选并收起',
            onClick: function () { setDFrom(''); setDTo(''); setCalOpen(false) },
          }, '清除')) : null,
        err ? createElement('div', { className: 'ov-err' }, err) : null,
        body)
    }

    // ── 仪表盘 ──
    function section(title, kids) {
      return createElement('div', { key: title },
        createElement('div', { className: 'ov-sec-title' }, title),
        kids)
    }
    function itemRow(it) {
      return createElement('div', {
        className: 'ov-item', key: it.id,
        onClick: function () { ctx.selectItem(it.id) },
      }, it.name)
    }

    function groupCount(typeName, cfgKey) {
      var t = typeByName[typeName]
      if (!t) return null
      var sf = resolveStatusField(t, (cfg.statusFields || {})[cfgKey])
      if (!sf) return null
      var map = {}
      ctx.items.forEach(function (it) {
        var tt = typeById[it.type_id]
        if (!tt || tt.name !== typeName) return
        var v = String((it.properties || {})[sf] || '（未填）')
        map[v] = (map[v] || 0) + 1
      })
      // 该类型没有条目时不渲染该 widget（类型缺失或零数据都视为缺席）
      return Object.keys(map).length ? { field: sf, map: map } : null
    }

    function findLevel(typeName) {
      for (var i = 0; i < levels.length; i++) { if (levels[i].type === typeName) return { lv: levels[i], idx: i } }
      return null
    }

    function renderDash() {
      var tree = buildTree(ctx.items)
      var blocks = []

      if (tree.roots.length) {
        blocks.push(section('课题完成度', tree.roots.map(function (r) {
          var s = stat(tree, 0, r)
          var pct = s.total ? Math.round((s.done / s.total) * 100) : 0
          return createElement('div', { className: 'ov-bar-row', key: r.id },
            createElement('span', { className: 'ov-bar-name', title: r.name }, r.name),
            createElement('div', { className: 'ov-bar' },
              createElement('div', { className: 'ov-bar-fill', style: { width: pct + '%' } })),
            createElement('span', { className: 'ov-pct' }, s.done + '/' + s.total))
        })))
      }

      var exp = findLevel('Experiment')
      if (exp && exp.lv.dateField) {
        var overdue = ctx.items.filter(function (it) {
          var t = typeById[it.type_id]
          if (!t || t.name !== 'Experiment') return false
          var v = (it.properties || {})[exp.lv.dateField]
          if (typeof v !== 'string') return false
          return v < today && !isDoneLike(exp.lv, it)
        })
        blocks.push(section('逾期实验（' + overdue.length + '）',
          overdue.slice(0, 10).map(itemRow)))
      }

      var lastLv = levels[levels.length - 1]
      if (lastLv && lastLv.dateField) {
        var todayOps = ctx.items.filter(function (it) {
          var t = typeById[it.type_id]
          return !!t && t.name === lastLv.type &&
            (it.properties || {})[lastLv.dateField] === today
        })
        blocks.push(section('今日' + lastLv.type + '（' + todayOps.length + '）',
          todayOps.slice(0, 10).map(itemRow)))
        var days = []
        var now = new Date()
        for (var i = 6; i >= 0; i--) {
          var d = new Date(now)
          d.setDate(now.getDate() - i)
          days.push({ key: fmt(d.getFullYear(), d.getMonth(), d.getDate()), n: 0, label: pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) })
        }
        ctx.items.forEach(function (it) {
          var t = typeById[it.type_id]
          if (!t || t.name !== lastLv.type) return
          var v = (it.properties || {})[lastLv.dateField]
          for (var j = 0; j < days.length; j++) { if (days[j].key === v) days[j].n++ }
        })
        var max = 1
        days.forEach(function (d) { if (d.n > max) max = d.n })
        blocks.push(section('近 7 天' + lastLv.type, createElement('div', {},
          createElement('div', { className: 'ov-cols' },
            days.map(function (d) {
              return createElement('div', {
                className: 'ov-col', key: d.key,
                style: { height: Math.round((d.n / max) * 60) + 'px', minHeight: d.n ? '4px' : '0' },
              })
            })),
          createElement('div', { style: { display: 'flex', gap: '6px' } },
            days.map(function (d) {
              return createElement('div', { className: 'ov-col-lb', key: d.key }, d.label)
            })))))
      }

      var art = groupCount('Article', 'Article')
      if (art) {
        blocks.push(section('写作管线 · ' + art.field, Object.keys(art.map).map(function (k) {
          return createElement('span', { className: 'ov-chip', key: k }, k + ' × ' + art.map[k])
        })))
      }
      var ref = groupCount('Reference', 'Reference')
      if (ref) {
        blocks.push(section('文献进度 · ' + ref.field, Object.keys(ref.map).map(function (k) {
          return createElement('span', { className: 'ov-chip', key: k }, k + ' × ' + ref.map[k])
        })))
      }

      var taskType = typeByName['Task']
      if (taskType) {
        var tDone = resolveDoneField(taskType, (cfg.checkFields || {}).Task)
        var tDate = resolveDateField(taskType, null)
        if (tDone) {
          var undone = ctx.items.filter(function (it) {
            var t = typeById[it.type_id]
            return !!t && t.name === 'Task' && !(it.properties || {})[tDone]
          })
          if (tDate) {
            undone.sort(function (a, b) {
              return String((a.properties || {})[tDate] || '9999') < String((b.properties || {})[tDate] || '9999') ? -1 : 1
            })
          }
          blocks.push(section('未完成任务（' + undone.length + '）',
            undone.slice(0, 10).map(itemRow)))
        }
      }

      if (!blocks.length) {
        return createElement('div', { className: 'ov-empty' }, '当前工作区没有可统计的类型')
      }
      return createElement('div', { className: 'ov-dash' }, blocks)
    }

    return createElement('div', { className: 'ov-wrap' },
      createElement('div', { className: 'ov-head' },
        createElement('button', {
          className: 'ov-mode' + (mode === 'list' ? ' on' : ''),
          onClick: function () { setMode('list') },
        }, '任务清单'),
        createElement('button', {
          className: 'ov-mode' + (mode === 'dash' ? ' on' : ''),
          onClick: function () { setMode('dash') },
        }, '统计仪表盘'),
        createElement('span', { className: 'ov-spacer' }),
        err && mode === 'dash' ? createElement('span', { className: 'ov-err' }, err) : null),
      mode === 'dash' ? renderDash() : renderList())
  }
}
