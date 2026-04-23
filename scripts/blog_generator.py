#!/usr/bin/env python3
"""
Blog Content Generator
======================

基于 SEO 研究结果自动生成博客内容。

功能：
1. 根据关键词研究结果生成内容大纲
2. 分析竞品内容，制定差异化策略
3. 调用 AI 生成完整博客文章
4. 自动生成 SEO 元数据（title, meta description, headings）

Usage:
    from blog_generator import BlogGenerator
    generator = BlogGenerator()
    result = generator.generate("sourcing from china to australia")
"""

import json
import logging
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger("seo_workflow.blog_generator")


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class ContentOutline:
    """内容大纲结构"""
    title: str
    meta_description: str
    target_keyword: str
    secondary_keywords: list
    headings: list  # H2, H3 结构
    word_count: int
    reading_time: str
    questions_to_answer: list
    competitors_to_beat: list
    unique_angle: str  # 差异化角度
    cta_text: str = ""  # Call to Action


@dataclass
class GeneratedBlog:
    """生成的博客文章"""
    slug: str
    title: str
    content: str
    meta_description: str
    frontmatter: dict
    word_count: int
    reading_time: str
    keywords_used: list
    outline: ContentOutline
    generated_at: str
    seo_score: float = 0.0


# ============================================================================
# Blog Generator
# ============================================================================

class BlogGenerator:
    """
    博客内容生成器

    基于 SEO 数据驱动的博客内容生成流程：
    1. 分析目标关键词的搜索意图
    2. 研究竞品内容，找出差距
    3. 生成内容大纲
    4. 调用 AI 生成完整内容
    5. 优化 SEO 元数据

    设计考量：
    - 与现有 content/blog 目录结构兼容
    - frontmatter 格式与现有 MDX 文件一致
    - 支持多种内容类型（指南、案例研究、对比分析等）
    """

    def __init__(self, project_root: Optional[Path] = None):
        """
        初始化博客生成器

        Args:
            project_root: 项目根目录路径
        """
        self.project_root = project_root or self._find_project_root()
        self.content_dir = self.project_root / "content" / "blog"
        self.social_dir = self.project_root / "public" / "social" / "blog"

        # 内容模板
        self.templates = self._load_templates()

        logger.info(f"BlogGenerator initialized. Content dir: {self.content_dir}")

    def _find_project_root(self) -> Path:
        """查找项目根目录"""
        current = Path(__file__).parent
        while current != current.parent:
            if (current / "package.json").exists():
                return current
            current = current.parent
        raise FileNotFoundError("Could not find project root")

    def _load_templates(self) -> dict:
        """加载内容模板"""
        return {
            "guide": {
                "structure": "step_by_step",
                "sections": ["introduction", "prerequisites", "main_content", "examples", "conclusion"],
                "word_count_range": (1500, 3000)
            },
            "comparison": {
                "structure": "vs_format",
                "sections": ["introduction", "option_a", "option_b", "comparison_table", "verdict"],
                "word_count_range": (2000, 3500)
            },
            "case_study": {
                "structure": "storytelling",
                "sections": ["challenge", "solution", "results", "lessons_learned"],
                "word_count_range": (1800, 2800)
            },
            "listicle": {
                "structure": "numbered_list",
                "sections": ["introduction", "items", "conclusion"],
                "word_count_range": (1200, 2500)
            }
        }

    # =========================================================================
    # Content Planning
    # =========================================================================

    def generate_outline(
        self,
        keyword: str,
        search_intent: str,
        competitors: list[dict],
        content_type: str = "guide"
    ) -> ContentOutline:
        """
        生成内容大纲

        基于关键词分析和竞品研究，生成完整的内容大纲。

        Args:
            keyword: 目标关键词
            search_intent: 搜索意图
            competitors: 竞品内容列表
            content_type: 内容类型（guide, comparison, case_study, listicle）

        Returns:
            ContentOutline 对象
        """
        logger.info(f"Generating outline for keyword: {keyword}")

        template = self.templates.get(content_type, self.templates["guide"])

        # 分析竞品内容，找出差距
        competitor_titles = [c.get("title", "") for c in competitors[:5]]
        competitor_gaps = self._find_content_gaps(keyword, competitors)

        # 生成标题
        title = self._generate_title(keyword, search_intent, content_type)

        # 生成 meta description
        meta_description = self._generate_meta_description(keyword, search_intent)

        # 生成标题结构
        headings = self._generate_headings(keyword, search_intent, competitor_gaps, template)

        # 生成需要回答的问题
        questions = self._extract_questions_from_serp(competitors)

        # 差异化角度
        unique_angle = self._generate_unique_angle(keyword, competitors)

        return ContentOutline(
            title=title,
            meta_description=meta_description,
            target_keyword=keyword,
            secondary_keywords=self._suggest_secondary_keywords(keyword, competitors),
            headings=headings,
            word_count=template["word_count_range"][1],
            reading_time=f"{template['word_count_range'][1] // 200} min",
            questions_to_answer=questions,
            competitors_to_beat=competitor_titles,
            unique_angle=unique_angle
        )

    def _find_content_gaps(self, keyword: str, competitors: list[dict]) -> list[str]:
        """找出竞品内容中的差距"""
        gaps = []

        for comp in competitors:
            desc = comp.get("description", "").lower()
            if "step" not in desc and "guide" not in desc:
                gaps.append("step_by_step_instructions")
            if "example" not in desc:
                gaps.append("practical_examples")
            if "australia" not in desc and "australian" not in desc:
                gaps.append("local_australian_context")

        return list(set(gaps))[:5]

    def _generate_title(
        self,
        keyword: str,
        search_intent: str,
        content_type: str
    ) -> str:
        """生成标题"""
        templates = {
            "informational": [
                f"The Complete Guide to {keyword.replace(' ', ' ').title()}",
                f"{keyword.replace(' ', ' ').title()} - Everything You Need to Know",
                f"How to {keyword.replace(' ', ' ')}: A Step-by-Step Guide"
            ],
            "commercial": [
                f"Best {keyword.replace(' ', ' ').title()} - Top 5 Picks for Australian Businesses",
                f"{keyword.replace(' ', ' ').title()} Compared: Which is Right for You?"
            ],
            "transactional": [
                f"{keyword.replace(' ', ' ').title()} - Get Started Today",
                f"Premium {keyword.replace(' ', ' ').title()} for Australian Companies"
            ]
        }

        intent_templates = templates.get(search_intent, templates["informational"])
        return intent_templates[0] if intent_templates else f"The Ultimate Guide to {keyword}"

    def _generate_meta_description(self, keyword: str, search_intent: str) -> str:
        """生成 Meta Description"""
        templates = {
            "informational": "Learn everything about {keyword} in this comprehensive guide. Perfect for Australian businesses looking to source from China with confidence.",
            "commercial": "Compare top {keyword} options for Australian businesses. Expert analysis, pricing, and recommendations to help you make the right choice.",
            "transactional": "Get started with {keyword} today. Trusted by Australian businesses for quality and reliability. Request a consultation now."
        }

        template = templates.get(search_intent, templates["informational"])
        return template.format(keyword=keyword)

    def _generate_headings(
        self,
        keyword: str,
        search_intent: str,
        gaps: list[str],
        template: dict
    ) -> list[str]:
        """生成文章标题结构"""
        headings = []

        if "introduction" in template["sections"]:
            headings.append(f"What is {keyword.title()}?")
            headings.append(f"Why {keyword.title()} Matters for Australian Businesses")

        if template["structure"] == "step_by_step":
            headings.append("Step 1: Getting Started with Research")
            headings.append("Step 2: Identifying Reliable Partners")
            headings.append("Step 3: Negotiation and Contracts")
            headings.append("Step 4: Quality Control and Compliance")
            headings.append("Step 5: Logistics and Delivery")
        elif template["structure"] == "numbered_list":
            for i in range(1, 6):
                headings.append(f"Tip {i}: Key Strategy for Success")
        elif template["structure"] == "vs_format":
            headings.append(f"Option A: Traditional Sourcing Methods")
            headings.append(f"Option B: Modern Digital Solutions")
            headings.append("Head-to-Head Comparison")

        if "practical_examples" in gaps:
            headings.append("Real-World Examples and Case Studies")
        if "local_australian_context" in gaps:
            headings.append("Australian Market Considerations")

        headings.append("Conclusion: Taking the Next Step")

        return headings

    def _extract_questions_from_serp(self, competitors: list[dict]) -> list[str]:
        """从 SERP 结果中提取需要回答的问题"""
        questions = []
        common_questions = [
            "What are the common challenges?",
            "How long does the process take?",
            "What are the costs involved?",
            "How to ensure quality?",
            "What mistakes to avoid?"
        ]

        for comp in competitors[:3]:
            desc = comp.get("description", "")
            found = re.findall(r'[A-Z][a-z]+(?:who|what|how|why|when|where)[^.]*\.?', desc)
            questions.extend(found[:2])

        questions.extend(common_questions[:5 - len(questions)])
        return list(set(questions))[:5]

    def _suggest_secondary_keywords(self, primary: str, competitors: list[dict]) -> list[str]:
        """建议次要关键词"""
        base_terms = primary.split()
        secondary = []

        if "china" in base_terms or "chinese" in base_terms:
            secondary.append("sourcing from China to Australia")
            secondary.append("China Australia trade")

        if "factory" in base_terms or "manufacturing" in base_terms:
            secondary.append("factory audit China")
            secondary.append("quality control manufacturing")

        if "import" in base_terms:
            secondary.append("import customs Australia")
            secondary.append("international trade compliance")

        return secondary[:5]

    def _generate_unique_angle(self, keyword: str, competitors: list[dict]) -> str:
        """生成差异化角度"""
        angles = [
            "Australian perspective and local compliance focus",
            "Practical, actionable advice from real experience",
            "Cost-benefit analysis with real numbers",
            "Risk mitigation strategies that actually work"
        ]

        competitor_texts = " ".join([c.get("description", "") for c in competitors])
        missing = []

        if "australian" not in competitor_texts.lower() and "australia" not in competitor_texts.lower():
            missing.append("Australian market focus")
        if "cost" not in competitor_texts.lower() and "price" not in competitor_texts.lower():
            missing.append("transparent pricing")
        if "risk" not in competitor_texts.lower() and "challenge" not in competitor_texts.lower():
            missing.append("risk assessment")

        return angles[0] if not missing else f"Focus on {missing[0]}"

    # =========================================================================
    # Content Generation
    # =========================================================================

    def generate_blog(
        self,
        outline: ContentOutline,
        ai_api_key: Optional[str] = None
    ) -> GeneratedBlog:
        """
        生成完整博客文章

        Args:
            outline: 内容大纲
            ai_api_key: OpenAI API Key（可选）

        Returns:
            GeneratedBlog 对象
        """
        logger.info(f"Generating blog for: {outline.title}")

        slug = self._generate_slug(outline.title)
        content = self._generate_placeholder_content(outline)

        frontmatter = {
            "title": outline.title,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "description": outline.meta_description,
            "author": "WAG Content Team",
            "tags": outline.secondary_keywords[:3],
            "keywords": [outline.target_keyword] + outline.secondary_keywords
        }

        seo_score = self._calculate_seo_score(outline, content)

        return GeneratedBlog(
            slug=slug,
            title=outline.title,
            content=content,
            meta_description=outline.meta_description,
            frontmatter=frontmatter,
            word_count=outline.word_count,
            reading_time=outline.reading_time,
            keywords_used=[outline.target_keyword] + outline.secondary_keywords,
            outline=outline,
            generated_at=datetime.now().isoformat(),
            seo_score=seo_score
        )

    def _generate_slug(self, title: str) -> str:
        """生成 URL slug"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        return slug[:60]

    def _generate_placeholder_content(self, outline: ContentOutline) -> str:
        """生成占位符内容（待 AI 填充）"""
        content = f"# {outline.title}\n\n"
        content += f"*{outline.meta_description}*\n\n"

        for heading in outline.headings:
            content += f"## {heading}\n\n"
            content += f"[Content for: {heading}]\n\n"

        return content

    def _calculate_seo_score(self, outline: ContentOutline, content: str) -> float:
        """计算 SEO 分数"""
        score = 50.0

        if outline.target_keyword in outline.title:
            score += 10
        if outline.target_keyword in outline.meta_description:
            score += 10
        if outline.word_count >= 1500:
            score += 10
        if len(outline.secondary_keywords) >= 3:
            score += 10
        if len(outline.questions_to_answer) >= 3:
            score += 10

        return min(score, 100.0)

    # =========================================================================
    # File Operations
    # =========================================================================

    def save_blog(self, blog: GeneratedBlog) -> Path:
        """保存博客到 MDX 文件"""
        self.content_dir.mkdir(parents=True, exist_ok=True)
        file_path = self.content_dir / f"{blog.slug}.mdx"
        content = self._to_mdx(blog)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        image_dir = self.social_dir / blog.slug
        image_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Saved blog to: {file_path}")
        return file_path

    def _to_mdx(self, blog: GeneratedBlog) -> str:
        """将博客转换为 MDX 格式"""
        lines = ["---"]
        for key, value in blog.frontmatter.items():
            if isinstance(value, list):
                lines.append(f"{key}:")
                for item in value:
                    lines.append(f"  - {item}")
            else:
                lines.append(f"{key}: {value}")
        lines.append("---\n")

        lines.append(blog.content)
        return "\n".join(lines)

    # =========================================================================
    # Batch Operations
    # =========================================================================

    def generate_batch(
        self,
        keywords: list[str],
        search_intents: list[str],
        competitors: list[list[dict]]
    ) -> list[GeneratedBlog]:
        """批量生成博客"""
        logger.info(f"Starting batch generation for {len(keywords)} keywords")

        blogs = []
        for i, keyword in enumerate(keywords):
            intent = search_intents[i] if i < len(search_intents) else "informational"
            comps = competitors[i] if i < len(competitors) else []

            try:
                outline = self.generate_outline(keyword, intent, comps)
                blog = self.generate_blog(outline)
                blogs.append(blog)
                logger.info(f"Generated blog for: {keyword}")
            except Exception as e:
                logger.error(f"Failed to generate blog for {keyword}: {e}")
                continue

        logger.info(f"Batch generation complete: {len(blogs)}/{len(keywords)} succeeded")
        return blogs


# ============================================================================
# CLI Interface
# ============================================================================

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Blog Content Generator")
    parser.add_argument("--keyword", required=True, help="Target keyword")
    parser.add_argument("--intent", default="informational", help="Search intent")
    parser.add_argument("--type", default="guide", choices=["guide", "comparison", "case_study", "listicle"])
    parser.add_argument("--output", help="Output file path")

    args = parser.parse_args()
    generator = BlogGenerator()

    try:
        outline = generator.generate_outline(args.keyword, args.intent, [], args.type)
        blog = generator.generate_blog(outline)

        if args.output:
            path = generator.save_blog(blog)
            print(f"Saved to: {path}")
        else:
            print(blog.content)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
