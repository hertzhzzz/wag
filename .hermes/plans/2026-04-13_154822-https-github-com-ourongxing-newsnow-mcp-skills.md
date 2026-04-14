# Plan: newsnow MCP Server 连接 + Skill 制作

## 目标
将 newsnow MCP Server（ourongxing/newsnow）接入 Hermes，作为 skill 暴露给用户使用。

## 当前上下文

- **newsnow** 是一个实时/热点新闻聚合服务，支持 40+ 新闻源
- MCP Server 包名：`newsnow-mcp-server`（npm），MIT 协议
- 接入方式：在 `config.yaml` 的 `mcp.servers` 下添加配置，用 `npx -y newsnow-mcp-server` 启动
- 必填环境变量：`BASE_URL`（默认 `https://newsnow.busiyi.world`，自建部署可改）
- 主要工具：`get_hotest_latest_news`（按 source id 获取最新/最热新闻）
- Hermes 配置文件：`~/.hermes/config.yaml`（已确认路径）

## 实现步骤

### Step 1: 确认 Hermes MCP 配置格式
检查现有 `~/.hermes/config.yaml` 中 MCP server 的配置格式和位置。

### Step 2: 添加 newsnow MCP Server 配置
在 `config.yaml` 的 `mcp.servers` 下添加：

```yaml
mcp:
  servers:
    newsnow:
      command: npx
      args: ["-y", "newsnow-mcp-server"]
      env:
        BASE_URL: "https://newsnow.busiyi.world"
```

### Step 3: 创建 newsnow Skill
在 `~/.hermes/skills/newsnow/` 下创建 `SKILL.md`：

**内容要点：**
- Trigger: "新闻" "热点" "最新消息" "news" 等关键词
- 主要工具：`get_hotest_latest_news(source_id, count)` — 按新闻源获取最新/最热新闻
- 需要提供的信息：source_id（新闻源标识）、count（数量，默认10）
- BASE_URL 说明：默认使用公共实例，自建部署可改
- 使用示例（对话格式）

### Step 4: 验证连接
重启 Hermes 后，用 `mcp__exa__...` 测试 newsnow 工具是否正常暴露。

## 文件改动

- `~/.hermes/config.yaml` — 添加 newsnow MCP server 配置
- `~/.hermes/skills/newsnow/SKILL.md` — 新建 skill 文件

## 风险 / 注意事项

- Hermes 运行环境（Mac）需有 Node.js/npx，否则 `npx` 会失败
- 若 `npx -y` 每次都重新下载，速度慢；可考虑全局安装 `newsnow-mcp-server` 后改用 `node` 直接调用
- newsnow 目前主要支持中文新闻源，英文支持有限（已在 README 注明）

## 验证步骤

1. 重启 Hermes（或刷新 MCP 配置）
2. 对我说"帮我查一下最新的科技新闻"类指令
3. 确认工具返回新闻列表
