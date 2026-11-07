// zotero-library plugin (React) — 右栏 "Zotero 文献库" 标签页
// 上区：选中 Reference 条目一键跳 Zotero（zotero://select，键存 properties.zotero_key）
// 下区：ctx.queryExternal 只读 zotero.sqlite 副本 → 前端拼装 → 检索 → 勾选导入（ctx.createItem）
// 跳转/开卷走 ctx.openExternal（宿主调用系统协议，前端零弹窗）
//
// 数据源从 Python 后端的 3 个 HTTP 端点换成宿主通用原语：
//   GET  /api/zotero/library → 5 条 SELECT，经 ctx.queryExternal 读副本（见下方 SQL_*）
//   POST /api/zotero/import  → ctx.query 按 zotero_key 去重 + ctx.createItem 建 Reference
//   POST /api/zotero/open    → ctx.openExternal('zotero://…')
// SQL 与 research manage/server/src/researchindex/engine/zotero.py::_read_entries 逐条一致；
// 导入语义对齐 zotero.py::import_items（created / existed / missing 三态）。
exports.default = function (React) {
  var createElement = React.createElement
  var useState = React.useState

  if (!document.getElementById('ri-zl-css')) {
    var style = document.createElement('style')
    style.id = 'ri-zl-css'
    style.textContent = [
      '.zl-wrap { padding: 10px; font-size: var(--fs-xs); color: var(--text); display: flex; flex-direction: column; gap: 8px; }',
      '.zl-row { display: flex; gap: 6px; align-items: center; }',
      '.zl-inp { flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--bg); color: var(--text); font-size: var(--fs-xs); padding: 3px 6px; font-family: inherit; }',
      '.zl-btn { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 3px 10px; white-space: nowrap; }',
      '.zl-btn:hover { background: var(--surface-hover); color: var(--accent); }',
      '.zl-btn:disabled { opacity: 0.4; cursor: default; }',
      '.zl-seljump { border: 1px solid var(--border); border-radius: var(--r-sm); padding: 6px 8px; display: flex; gap: 8px; align-items: center; justify-content: space-between; background: var(--surface); }',
      '.zl-sel-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.zl-sel-note { color: var(--text-muted); }',
      '.zl-mini { font-size: var(--fs-xs); border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--surface); color: var(--text-secondary); cursor: pointer; padding: 1px 7px; white-space: nowrap; }',
      '.zl-mini:hover { color: var(--accent); background: var(--surface-hover); }',
      '.zl-mini:disabled { opacity: 0.4; cursor: default; }',
      '.zl-meta { color: var(--text-muted); word-break: break-all; }',
      '.zl-err { color: var(--danger); white-space: pre-wrap; word-break: break-all; }',
      '.zl-warn { color: var(--danger); line-height: 1.5; }',
      '.zl-summary { color: var(--accent); }',
      '.zl-list { display: flex; flex-direction: column; gap: 6px; }',
      '.zl-item { border: 1px solid var(--border); border-radius: var(--r-sm); padding: 5px 7px; display: flex; flex-direction: column; gap: 3px; }',
      '.zl-item.zl-done { opacity: 0.62; }',
      '.zl-chk { display: flex; gap: 6px; align-items: flex-start; cursor: pointer; }',
      '.zl-title { font-weight: 600; }',
      '.zl-badge { align-self: flex-start; font-size: var(--fs-xs); color: var(--accent); border: 1px solid var(--accent); border-radius: var(--r-sm); padding: 0 5px; }',
      '.zl-sub { color: var(--text-muted); word-break: break-all; }',
      '.zl-acts { display: flex; gap: 6px; align-items: center; }',
      '.zl-empty { text-align: center; color: var(--text-muted); padding: 20px 12px; font-size: var(--fs-sm); }',
    ].join('')
    document.head.appendChild(style)
  }

  // Reference 必需字段（zotero.py::_ENSURE_FIELDS，顺序一致）
  var REQUIRED_FIELDS = ['Journal', 'DOI', '年份', '阅读状态', '作者', 'zotero_key']

  // ── 5 条查询：与 zotero.py::_read_entries 一一对应（表 / 过滤 / 排序照搬） ──
  // 1) 条目骨架：排除附件/笔记/批注，只读个人库（libraryID = 1），跳过回收站
  var SQL_ITEMS =
    'SELECT i.itemID AS iid, i.key AS k, it.typeName AS tname' +
    ' FROM items i JOIN itemTypes it ON i.itemTypeID = it.itemTypeID' +
    " WHERE it.typeName NOT IN ('attachment','note','annotation')" +
    ' AND i.libraryID = 1' +
    ' AND i.itemID NOT IN (SELECT itemID FROM deletedItems)'
  // 2) 标题/期刊/DOI/日期（日期在 JS 侧取前 4 位当年份，同 Python re.match）
  var SQL_DATA =
    'SELECT d.itemID AS iid, f.fieldName AS fn, v.value AS val' +
    ' FROM itemData d JOIN fields f ON d.fieldID = f.fieldID' +
    ' JOIN itemDataValues v ON d.valueID = v.valueID' +
    " WHERE f.fieldName IN ('title','publicationTitle','DOI','date')"
  // 3) 作者（fieldMode = 1 为单域机构名，只有 lastName）
  var SQL_CREATORS =
    'SELECT ic.itemID AS iid, cr.firstName AS fn, cr.lastName AS ln, cr.fieldMode AS fm' +
    ' FROM itemCreators ic JOIN creators cr ON ic.creatorID = cr.creatorID' +
    ' ORDER BY ic.itemID, ic.orderIndex'
  // 4) 父条目下的 PDF 附件键（开卷用）
  var SQL_PDFS =
    'SELECT ia.parentItemID AS pid, a.key AS akey' +
    ' FROM itemAttachments ia JOIN items a ON a.itemID = ia.itemID' +
    " WHERE ia.contentType = 'application/pdf' AND ia.parentItemID IS NOT NULL" +
    ' AND a.itemID NOT IN (SELECT itemID FROM deletedItems)' +
    ' ORDER BY ia.parentItemID, a.itemID'
  // 5) 所属分类名（导入时按同名分组归类，历史字段，仅展示用）
  var SQL_COLLECTIONS =
    'SELECT ci.itemID AS iid, col.collectionName AS name' +
    ' FROM collectionItems ci JOIN collections col ON ci.collectionID = col.collectionID' +
    ' WHERE col.collectionID NOT IN (SELECT collectionID FROM deletedCollections)' +
    ' ORDER BY ci.itemID, ci.collectionID'

  // queryExternal 返回 { columns, rows }；按列名取值，不依赖 SELECT 顺序
  function rowsAsObjects(res) {
    var columns = (res && res.columns) || []
    var rows = (res && res.rows) || []
    var out = []
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i] || []
      var obj = {}
      for (var c = 0; c < columns.length; c++) obj[columns[c]] = row[c]
      out.push(obj)
    }
    return out
  }

  function trimPath(p) {
    return p == null ? '' : String(p).trim()
  }

  // 绝对路径：Windows 盘符 / 以分隔符开头 / UNC
  function isAbsolutePath(p) {
    return /^([a-zA-Z]:[\\/]|[\\/])/.test(p)
  }

  function joinPath(base, rel) {
    return String(base).replace(/[\\/]+$/, '') + '/' + rel
  }

  // DB 路径解析顺序：ctx.config.zoteroPath（可绝对，相对则相对仓库根）→ <repo>/.index/zotero.sqlite
  function resolveDbPath(ctx) {
    var cfg = ctx.config || {}
    var custom = trimPath(cfg.zoteroPath)
    if (custom) {
      if (isAbsolutePath(custom) || !ctx.repoPath) return custom
      return joinPath(ctx.repoPath, custom)
    }
    if (!ctx.repoPath) return ''
    return joinPath(ctx.repoPath, '.index/zotero.sqlite')
  }

  function errorText(e) {
    return String((e && e.message) || e)
  }

  return function ZoteroLibraryPlugin(props) {
    var ctx = props.ctx

    // —— 上区：选中 Reference 条目跳转（不依赖库加载，键在 properties） ——
    var sel = ctx.selectedItem
    var selIsRef = !!(sel && sel.item && sel.item_type && sel.item_type.name === 'Reference')
    var selKey = selIsRef && sel.item.properties ? sel.item.properties.zotero_key : ''
    if (selKey) selKey = String(selKey)

    // —— 路径：config.zoteroPath 优先，否则 <repo>/.index/zotero.sqlite；输入框可临时覆盖 ——
    var defaultPath = resolveDbPath(ctx)
    var pathState = useState(null)
    var pathOverride = pathState[0]
    var setPathOverride = pathState[1]
    var dbPath = pathOverride == null ? defaultPath : pathOverride

    // —— 下区：Zotero 库浏览导入 ——
    var libState = useState(null)
    var lib = libState[0]
    var setLib = libState[1]
    var searchState = useState('')
    var search = searchState[0]
    var setSearch = searchState[1]
    var checkedState = useState({})
    var checked = checkedState[0]
    var setChecked = checkedState[1]
    var busyState = useState(false)
    var busy = busyState[0]
    var setBusy = busyState[1]
    var errState = useState('')
    var err = errState[0]
    var setErr = errState[1]
    var summaryState = useState('')
    var summary = summaryState[0]
    var setSummary = summaryState[1]

    // —— Reference 类型 / 字段校验：ctx 没有 addField，能力缺口必须明说，不能静默丢字段 ——
    var typeByName = {}
    var typeList = ctx.itemTypes || []
    for (var ti = 0; ti < typeList.length; ti++) {
      if (typeList[ti] && typeList[ti].name) typeByName[typeList[ti].name] = typeList[ti]
    }
    var refType = typeByName.Reference || null
    var refFieldNames = {}
    if (refType) {
      var refFields = refType.fields || []
      for (var fi = 0; fi < refFields.length; fi++) {
        if (refFields[fi] && refFields[fi].name) refFieldNames[refFields[fi].name] = true
      }
    }
    var refMissingFields = []
    for (var ri = 0; ri < REQUIRED_FIELDS.length; ri++) {
      if (!refFieldNames[REQUIRED_FIELDS[ri]]) refMissingFields.push(REQUIRED_FIELDS[ri])
    }
    var refReady = !!refType && refMissingFields.length === 0
    var refProblem = ''
    if (!refType) {
      refProblem = '未找到 Reference 条目类型，请先在类型管理里补齐 Reference 字段（' +
        REQUIRED_FIELDS.join('、') + '）。'
    } else if (refMissingFields.length) {
      refProblem = 'Reference 类型缺少字段：' + refMissingFields.join('、') +
        '，请先在类型管理里补齐 Reference 字段。'
    }

    // 已导入徽标：ctx.items 里带 zotero_key 的条目（对齐旧插件）
    var imported = {}
    var allItems = ctx.items || []
    for (var ii = 0; ii < allItems.length; ii++) {
      var itemProps = allItems[ii].properties || {}
      if (itemProps.zotero_key) imported[String(itemProps.zotero_key)] = true
    }

    // 读副本并拼装 entries：5 条查询并发（只读连接，互不依赖），结果语义同 Python 串行版
    function readLibrary(path) {
      return Promise.all([
        ctx.queryExternal(path, SQL_ITEMS),
        ctx.queryExternal(path, SQL_DATA),
        ctx.queryExternal(path, SQL_CREATORS),
        ctx.queryExternal(path, SQL_PDFS),
        ctx.queryExternal(path, SQL_COLLECTIONS),
      ]).then(function (results) {
        var byId = {}
        var itemRows = rowsAsObjects(results[0])
        var i
        for (i = 0; i < itemRows.length; i++) {
          var row = itemRows[i]
          byId[row.iid] = {
            key: row.k,
            item_type: row.tname,
            title: '',
            authors: [],
            year: null,
            journal: '',
            doi: '',
            pdf_keys: [],
            collection_names: [],
          }
        }

        var dataRows = rowsAsObjects(results[1])
        for (i = 0; i < dataRows.length; i++) {
          var d = dataRows[i]
          var entry = byId[d.iid]
          if (!entry) continue
          var value = d.val == null ? '' : String(d.val)
          if (d.fn === 'title') entry.title = value
          else if (d.fn === 'publicationTitle') entry.journal = value
          else if (d.fn === 'DOI') entry.doi = value
          else if (d.fn === 'date') {
            var m = /^\s*(\d{4})/.exec(value)
            entry.year = m ? parseInt(m[1], 10) : null
          }
        }

        var creatorRows = rowsAsObjects(results[2])
        for (i = 0; i < creatorRows.length; i++) {
          var c = creatorRows[i]
          var cEntry = byId[c.iid]
          if (!cEntry) continue
          var name = c.fm === 1
            ? (c.ln || '')
            : ((c.fn || '') + ' ' + (c.ln || '')).trim()
          if (name) cEntry.authors.push(name)
        }

        var pdfRows = rowsAsObjects(results[3])
        for (i = 0; i < pdfRows.length; i++) {
          var p = byId[pdfRows[i].pid]
          if (p && pdfRows[i].akey) p.pdf_keys.push(String(pdfRows[i].akey))
        }

        var collectionRows = rowsAsObjects(results[4])
        for (i = 0; i < collectionRows.length; i++) {
          var ce = byId[collectionRows[i].iid]
          if (ce && collectionRows[i].name) ce.collection_names.push(String(collectionRows[i].name))
        }

        var list = []
        for (var id in byId) {
          if (Object.prototype.hasOwnProperty.call(byId, id)) list.push(byId[id])
        }
        // 同 Python：先按第一作者、再按标题排序
        list.sort(function (a, b) {
          var ak = a.authors.length ? a.authors[0] : ''
          var bk = b.authors.length ? b.authors[0] : ''
          if (ak !== bk) return ak < bk ? -1 : 1
          if (a.title !== b.title) return a.title < b.title ? -1 : 1
          return 0
        })
        return { count: list.length, entries: list }
      })
    }

    function load() {
      if (busy) return
      if (!dbPath) {
        setErr('未找到 zotero.sqlite 路径：请在工作区插件配置里设置 zoteroPath，或先打开一个仓库。')
        return
      }
      setBusy(true)
      setErr('')
      setSummary('')
      readLibrary(dbPath).then(function (data) {
        setLib(data)
        setChecked({})
      }).catch(function (e) {
        setErr(describeLoadError(e, dbPath))
      }).then(function () {
        setBusy(false)
      })
    }

    // DB 缺失 → 带路径 + 同步插件提示；SQL/schema 错误 → 原样透出（便于排查 schema 版本差异）
    function describeLoadError(e, path) {
      var msg = errorText(e)
      if (/不存在|打开外部数据库失败|no such file|cannot open/i.test(msg)) {
        var withPath = msg.indexOf(path) >= 0 ? '' : '\n路径：' + path
        return msg + withPath + '\n请先用 Zotero 同步插件导出副本到该路径。'
      }
      return msg
    }

    function openZotero(key, mode) {
      if (!key) return
      var prefix = mode === 'open-pdf'
        ? 'zotero://open-pdf/library/items/'
        : 'zotero://select/library/items/'
      try {
        Promise.resolve(ctx.openExternal(prefix + key)).catch(function (e) {
          setErr(errorText(e))
        })
      } catch (e) {
        setErr(errorText(e))
      }
    }

    function checkedKeys() {
      var keys = []
      for (var k in checked) {
        if (checked[k]) keys.push(k)
      }
      return keys
    }

    function doImport() {
      var keys = checkedKeys()
      if (!keys.length || busy) return
      if (!refReady) {
        setErr(refProblem)
        return
      }
      setBusy(true)
      setErr('')
      setSummary('')

      var existing = {}
      // 一次 ctx.query 批量去重（按 zotero_key 属性；限定 Reference 类型，同 Python）
      ctx.query({
        filter: {
          and: [
            { field: 'item_type', op: '=', value: 'Reference' },
            { field: 'zotero_key', op: 'in', value: keys },
          ],
        },
      }).then(function (res) {
        var hits = (res && res.items) || []
        for (var i = 0; i < hits.length; i++) {
          var k = (hits[i].properties || {}).zotero_key
          if (k) existing[String(k)] = true
        }
        // 重新读库：拿完整作者并识别同步后缺失的条目（对齐 Python import_items 的 missing 态）
        return readLibrary(dbPath)
      }).then(function (data) {
        var entries = {}
        var dataEntries = data.entries || []
        for (var i = 0; i < dataEntries.length; i++) entries[dataEntries[i].key] = dataEntries[i]

        var created = 0
        var existed = 0
        var missing = 0
        var chain = Promise.resolve()
        keys.forEach(function (key) {
          chain = chain.then(function () {
            if (existing[key]) {
              existed++
              return
            }
            var e = entries[key]
            if (!e) {
              missing++
              return
            }
            // 与 Python 版一致：空值不落库（阅读状态/键始终有值）
            var props = {
              'Journal': e.journal || '',
              'DOI': e.doi || '',
              '年份': e.year,
              '阅读状态': '未读',
              '作者': (e.authors || []).join('; '),
              'zotero_key': key,
            }
            var keysToDrop = []
            for (var pk in props) {
              if (props[pk] === null || props[pk] === undefined || props[pk] === '') keysToDrop.push(pk)
            }
            for (var di = 0; di < keysToDrop.length; di++) delete props[keysToDrop[di]]
            return ctx.createItem(refType.id, e.title || key, props).then(function () {
              created++
              existing[key] = true
            })
          })
        })
        return chain.then(function () {
          setSummary('导入完成：新增 ' + created + ' / 已存在 ' + existed +
            (missing ? ' / 缺失 ' + missing : ''))
          setChecked({})
          return ctx.refreshItems()
        })
      }).catch(function (e) {
        setErr(errorText(e))
      }).then(function () {
        setBusy(false)
      })
    }

    // —— 渲染用的派生值 ——
    var rows = (lib && lib.entries) || []
    var ql = search.trim().toLowerCase()
    if (ql) {
      rows = rows.filter(function (e) {
        var hay = [
          e.title || '',
          (e.authors || []).join(' '),
          e.journal || '',
          e.doi || '',
          e.key || '',
          e.item_type || '',
        ].join(' ').toLowerCase()
        return hay.indexOf(ql) >= 0
      })
    }
    var selectedKeys = checkedKeys()
    var anyChecked = selectedKeys.length > 0

    return createElement('div', { className: 'zl-wrap' },
      // 上区：选中 Reference 跳转（无 key 时禁用并说明）
      selIsRef ? createElement('div', { className: 'zl-seljump', key: 'jump' },
        createElement('span', { className: 'zl-sel-name' },
          '选中: ' + String(sel.item.name || '').slice(0, 40)),
        createElement('div', { className: 'zl-acts' },
          createElement('button', {
            className: 'zl-mini zl-sel-open',
            onClick: function () { openZotero(selKey, 'select') },
            disabled: !selKey,
            title: selKey ? '在 Zotero 中定位该条目' : '缺少 zotero_key',
          }, '在 Zotero 打开'),
          !selKey ? createElement('span', { className: 'zl-sel-note' },
            '该条目没有 zotero_key，无法跳转') : null)) : null,
      // 路径：默认由 config.zoteroPath / 仓库根推导，输入框可临时覆盖
      createElement('div', { className: 'zl-row', key: 'path' },
        createElement('input', {
          className: 'zl-inp zl-path',
          value: dbPath,
          placeholder: 'zotero.sqlite 路径（默认 <仓库>/.index/zotero.sqlite）',
          onChange: function (ev) { setPathOverride(ev.target.value) },
        }),
        createElement('button', {
          className: 'zl-btn zl-load',
          onClick: load,
          disabled: busy || !dbPath,
        }, busy ? '加载中…' : '加载')),
      // Reference 类型/字段缺失 → 明确提示（ctx 无 addField，不静默丢字段）
      refProblem ? createElement('div', { className: 'zl-warn', key: 'warn' }, refProblem) : null,
      err ? createElement('div', { className: 'zl-err', key: 'err' }, err) : null,
      summary ? createElement('div', { className: 'zl-summary', key: 'sum' }, summary) : null,
      lib ? createElement('div', { className: 'zl-meta', key: 'meta' }, lib.count + ' 条') : null,
      createElement('input', {
        className: 'zl-inp zl-search',
        key: 'search',
        value: search,
        placeholder: '检索 标题/作者/DOI/期刊/键',
        onInput: function (ev) { setSearch(ev.target.value) },
      }),
      createElement('div', { className: 'zl-list', key: 'list' },
        rows.map(function (e) {
          var done = !!imported[e.key]
          return createElement('div', {
            className: 'zl-item' + (done ? ' zl-done' : ''),
            key: e.key,
          },
          createElement('label', { className: 'zl-chk' },
            createElement('input', {
              type: 'checkbox',
              checked: !!checked[e.key],
              onChange: function (ev) {
                var v = ev.target.checked
                setChecked(function (prev) {
                  var nx = Object.assign({}, prev)
                  nx[e.key] = v
                  return nx
                })
              },
            }),
            createElement('span', { className: 'zl-title' }, e.title || e.key)),
          done ? createElement('span', { className: 'zl-badge' }, '已导入') : null,
          createElement('div', { className: 'zl-sub' },
            ((e.authors || []).slice(0, 3).join('; ') || '（无作者）') + ' · ' +
            (e.year != null ? e.year : '—') +
            (e.journal ? ' · ' + e.journal : '') +
            (e.item_type ? ' · ' + e.item_type : '')),
          createElement('div', { className: 'zl-acts' },
            createElement('button', {
              className: 'zl-mini zl-zotero',
              onClick: function () { openZotero(e.key, 'select') },
            }, 'Zotero'),
            e.pdf_keys && e.pdf_keys.length
              ? createElement('button', {
                  className: 'zl-mini zl-pdf',
                  onClick: function () { openZotero(e.pdf_keys[0], 'open-pdf') },
                }, 'PDF')
              : null))
        }),
        lib && !rows.length
          ? createElement('div', { className: 'zl-empty', key: 'nomatch' }, '无匹配条目')
          : null,
        !lib
          ? createElement('div', { className: 'zl-empty', key: 'hint' },
              '未加载——点击“加载”读取 zotero.sqlite 副本')
          : null),
      createElement('div', { className: 'zl-row', key: 'foot' },
        createElement('button', {
          className: 'zl-btn zl-import',
          onClick: doImport,
          disabled: busy || !anyChecked || !refReady,
        }, '导入选中'),
        anyChecked
          ? createElement('span', { className: 'zl-meta' }, '已选 ' + selectedKeys.length + ' 条')
          : null))
  }
}
