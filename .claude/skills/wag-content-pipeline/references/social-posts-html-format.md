# Social Posts HTML 汇总页面格式

生成 `social-posts.html`，包含全部文章的所有社交文案和信息图 Prompt 预览。

## 文件路径

`/Users/mark/Projects/wag/ads/post/{YYYY-MM-DD}/social-posts.html`

## HTML 结构

- 每篇文章一个 `.article-block`
- 每个 block 内包含：**封面图预览**（`<img class="cover-preview">`）、文章标题、URL、两篇 Post 文案（Facebook + LinkedIn 各一个 `.post-box`）、信息图 Prompt 内容
- 使用 WAG 品牌色：Primary `#0F2D5E`，Accent `#F59E0B`

## 每个 `.article-block` 必须包含的四个元素

1. **封面图 Preview**（`<img class="cover-preview">`）—— 使用相对路径 `../../../frontend/public/social/blog/{slug}/cover.png`（从 ads/post/YYYY-MM-DD/ 目录出发）
2. **文章标题**（`.article-title`）
3. **文章 URL**（`.article-url`）—— 必须包含两个链接：Production（`https://www.winningadventure.com.au/resources/{slug}`）+ Local（`http://localhost:3000/resources/{slug}`），用 `&nbsp;|&nbsp;` 分隔
4. **Facebook Post**（`.post-box` + `.post-label: "Facebook Post — X words"`）
5. **LinkedIn Post**（`.post-box` + `.post-label: "LinkedIn Post — X words"`）
6. **信息图 Prompt**（`.infographic-prompt`）

## URL 规则（强制）

- **文章 URL**：Production + Local 双链接，格式见下方模板
- **Post 内容中的 URL**：只允许 production URL（`https://www.winningadventure.com.au/resources/{slug}`），禁止在 post 内容中出现 localhost
- **图片 src**：相对路径 `../../../frontend/public/social/blog/{slug}/cover.png`，禁止使用 CDN 绝对 URL

## CSS 样式

```css
.cover-preview {
  width: 100%;
  max-width: 720px;
  margin: 0 0 24px 0;
  border-radius: 8px;
  border: 3px solid #0F2D5E;
  display: block;
}
.cover-caption {
  font-size: 11px;
  color: #888;
  margin-bottom: 24px;
  text-align: left;
}
```

## 完整 HTML 模板

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAG Content Pipeline — Social Posts</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .article-block { margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #e5e5e5; }
    .cover-preview { width: 100%; max-width: 720px; margin: 0 0 24px 0; border-radius: 8px; border: 3px solid #0F2D5E; display: block; }
    .cover-caption { font-size: 11px; color: #888; margin-bottom: 24px; text-align: left; }
    .article-title { color: #0F2D5E; font-size: 20px; margin-bottom: 8px; }
    .article-url { color: #F59E0B; font-size: 13px; margin-bottom: 20px; }
    .post-box { background: #f9f9f9; border-left: 4px solid #0F2D5E; padding: 16px; margin-bottom: 16px; border-radius: 4px; }
    .post-label { font-weight: bold; color: #0F2D5E; margin-bottom: 8px; font-size: 13px; }
    .post-content { line-height: 1.6; color: #333; }
    .infographic-prompt { background: #fff8f0; border: 1px solid #F59E0B; padding: 16px; margin-top: 16px; border-radius: 4px; font-size: 13px; }
    .infographic-label { font-weight: bold; color: #F59E0B; margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>WAG Content Pipeline — Social Posts</h1>

  <!-- 每篇文章一个 .article-block -->
  <div class="article-block">
    <img class="cover-preview" src="../../../frontend/public/social/blog/{slug}/cover.png" alt="Cover">
    <div class="cover-caption">Cover image — {slug}</div>

    <div class="article-title">{Article Title}</div>
    <div class="article-url">
      <a href="https://www.winningadventure.com.au/resources/{slug}">https://www.winningadventure.com.au/resources/{slug}</a>&nbsp;|&nbsp;
      <a href="http://localhost:3000/resources/{slug}">Local</a>
    </div>

    <div class="post-box">
      <div class="post-label">Facebook Post — {n} words</div>
      <div class="post-content">{facebook_post_content — production URL only}</div>
    </div>

    <div class="post-box">
      <div class="post-label">LinkedIn Post — {n} words</div>
      <div class="post-content">{linkedin_post_content — production URL only}</div>
    </div>

    <div class="infographic-prompt">
      <div class="infographic-label">Infographic Prompt</div>
      <pre>{infographic_prompt_content}</pre>
    </div>
  </div>

</body>
</html>
```
