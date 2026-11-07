# index-plugins-research

Index 的**科研域插件分发仓**：市场清单 `index.json` + 插件构建产物。
与通用插件仓 [`index-plugins`](../index-plugins) 分开的原因是**依赖不同宿主能力**：

| 插件 | 依赖 | 说明 |
|---|---|---|
| `calendar` | 科研类型体系（Operation/Record/Task/Experiment） | 换成别的仓库就是个空日历 |
| `quick-capture` | 同上 | 模板里写着“今日操作/组会记录” |
| `research-overview` | 同上 + workspace 配置里的 chain | 四级联动清单 |
| `zotero-library` | `ctx.queryExternal` / `openExternal` | 读外部 zotero.sqlite 副本 |

> **图表不在本仓**：自 2026-11-07 起 figures 是独立应用 `figure-agent`，由宿主按条目目录
> 拉起并以 iframe 嵌入（宿主内置 `fig-view` 壳插件）。`fig-workbench` / `fig-ai` 两个
> 旧插件已从本仓移除。

通用集（calendar-view / stats / table）只依赖 `PluginContext` 的通用部分，装在任何 Index
仓库都能用；本仓的插件装到通用仓库里会出现“能加载但空转”的情况。

## 契约

React 工厂，与 `index-plugins` 相同：

```js
exports.default = function (React) {
  return function MyPlugin({ ctx }) { ... }
}
```

## 源与产物的关系

本仓是**分发产物**，不是源码：

- `fig-workbench` / `fig-ai` 的源码在 `itemmanage/figurePlugins/`，由
  `itemmanage/scripts/build-plugins.mjs`（esbuild）产出；
- 其余四个是手写 bundle，源码即产物，改动直接在本仓进行；
- app 随包分发的副本在 `itemmanage/src-tauri/resources/plugins/`，两处需保持一致。

## 发布流程

```bash
python scripts/release.py --tag v1   # 打包 dist/*.zip、算 sha256、写回 index.json 与 downloadUrl
gh release create v1 dist/*.zip --title v1 --notes "插件包"
git commit -am "release: v1" && git push
```

zip 内顶层目录必须等于插件名（引擎按此校验）；`manifest.json` 与 `index.json` 的
`version` 必须一致；`sha256` 不能留占位——应用下载后会做哈希校验。
