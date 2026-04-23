#!/usr/bin/env python3
"""
DataForSEO MCP Integration Module
=================================

提供与 DataForSEO MCP server 的 Python 接口封装。
通过 subprocess 调用 npx dataforseo-mcp-server 并处理返回结果。

Usage:
    from seo_mcp_client import DataForSEOMCPClient
    client = DataForSEOMCPClient()
    result = client.keyword_ideas("sourcing from china")
"""

import json
import subprocess
import logging
from dataclasses import dataclass, asdict
from typing import Optional
from pathlib import Path

logger = logging.getLogger("seo_workflow.mcp_client")


# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class KeywordIdea:
    """关键词想法"""
    keyword: str
    search_volume: int
    competition: str
    competition_index: float
    cpc: float
    keyword_difficulty: int
    session_volume: int
    monthly_searches: list

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class SERPResult:
    """SERP 结果"""
    keyword: str
    position: int
    url: str
    title: str
    description: str
    rank_change: int
    is_new: bool
    is_featured_snippet: bool


# ============================================================================
# MCP Client
# ============================================================================

class DataForSEOMCPClient:
    """
    DataForSEO MCP Client

    通过 MCP 协议与 DataForSEO server 通信。
    支持的模块：
    - SERP (搜索结果)
    - Keywords Data (关键词数据)
    - OnPage (页面分析)
    - DataForSEO Labs (实验室数据)
    - Backlinks (反向链接)
    - Domain Analytics (域名分析)
    - Business Data (商业数据)
    - Content Analysis (内容分析)
    - AI Optimization (AI 优化)
    """

    def __init__(self, config_path: Optional[Path] = None):
        """
        初始化 MCP Client

        Args:
            config_path: .mcp.json 配置文件路径，默认使用项目根目录
        """
        self.config_path = config_path or self._find_config()
        self.tools = self._discover_tools()
        logger.info(f"Initialized DataForSEO MCP Client with {len(self.tools)} tools")

    def _find_config(self) -> Optional[Path]:
        """查找 MCP 配置文件"""
        possible_paths = [
            Path.cwd() / ".mcp.json",
            Path(__file__).parent.parent / ".mcp.json",
            Path.home() / ".mcp.json"
        ]
        for p in possible_paths:
            if p.exists():
                return p
        return None

    def _discover_tools(self) -> list:
        """发现可用的 MCP tools"""
        # 静态定义已知工具列表（基于配置的 ENABLED_MODULES）
        return [
            # Keywords Data
            "keywords_data_google_keyword_ideas",
            "keywords_data_google_keyword_overview",
            "keywords_data_google_bulk_keyword_difficulty",
            "keywords_data_google_search_volume",
            "keywords_data_google_historical_keyword_data",

            # SERP
            "serp_organic_live_advanced",
            "serp_organic_live_standard",

            # OnPage
            "on_page_instant_pages",
            "on_page_lighthouse",
            "on_page_content_parsing",

            # DataForSEO Labs
            "dataforseo_labs_google_keyword_ideas",
            "dataforseo_labs_google_keyword_suggestions",
            "dataforseo_labs_google_related_keywords",
            "dataforseo_labs_google_domain_rank_overview",
            "dataforseo_labs_google_competitors_domain",
            "dataforseo_labs_google_ranked_keywords",

            # Backlinks
            "backlinks_backlinks",
            "backlinks_summary",
            "backlinks_bulk_ranks",
            "backlinks_anchors",
            "backlinks_referring_domains",

            # AI Optimization
            "ai_optimization_chat_gpt_scraper",
            "ai_optimization_llm_response",
            "ai_optimization_keyword_data_search_volume",
            "ai_optimization_llm_ment_agg_metrics",

            # Business Data
            "business_data_business_listings_search",
        ]

    def _execute_tool(self, tool_name: str, arguments: dict) -> dict:
        """
        执行 MCP tool

        Args:
            tool_name: tool 名称
            arguments: tool 参数

        Returns:
            tool 返回的原始数据
        """
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        # 构建 MCP 请求
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }

        try:
            # 通过 stdin/stdout 与 MCP server 通信
            process = subprocess.Popen(
                ["npx", "-y", "dataforseo-mcp-server"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            stdout, stderr = process.communicate(
                input=json.dumps(request),
                timeout=60
            )

            if stderr:
                logger.warning(f"MCP stderr: {stderr}")

            return json.loads(stdout)

        except subprocess.TimeoutExpired:
            process.kill()
            raise TimeoutError(f"Tool {tool_name} timed out")
        except Exception as e:
            logger.error(f"Failed to execute tool {tool_name}: {e}")
            raise

    # =========================================================================
    # Keyword Research Methods
    # =========================================================================

    def keyword_ideas(
        self,
        keywords: list[str],
        language_code: str = "en",
        location_name: str = "Australia"
    ) -> list[KeywordIdea]:
        """
        获取关键词想法

        基于种子关键词，获取相关关键词建议。

        Args:
            keywords: 种子关键词列表
            language_code: 语言代码
            location_name: 地理位置

        Returns:
            KeywordIdea 对象列表
        """
        logger.info(f"Fetching keyword ideas for: {keywords[:3]}...")

        response = self._execute_tool(
            "keywords_data_google_keyword_ideas",
            {
                "keywords": keywords,
                "language_code": language_code,
                "location_name": location_name,
                "limit": 100
            }
        )

        ideas = []
        for item in response.get("result", []):
            ideas.append(KeywordIdea(
                keyword=item.get("keyword", ""),
                search_volume=item.get("search_volume", 0),
                competition=item.get("competition", ""),
                competition_index=item.get("competition_index", 0.0),
                cpc=item.get("cpc", 0.0),
                keyword_difficulty=item.get("keyword_difficulty", 0),
                session_volume=item.get("session_volume", 0),
                monthly_searches=item.get("monthly_searches", [])
            ))

        logger.info(f"Found {len(ideas)} keyword ideas")
        return ideas

    def keyword_overview(
        self,
        keywords: list[str],
        language_code: str = "en",
        location_name: str = "Australia"
    ) -> list[dict]:
        """
        获取关键词概览数据

        包括搜索量、竞争度、CPC 等指标。

        Args:
            keywords: 关键词列表
            language_code: 语言代码
            location_name: 地理位置

        Returns:
            关键词概览数据列表
        """
        logger.info(f"Fetching keyword overview for {len(keywords)} keywords")

        response = self._execute_tool(
            "keywords_data_google_keyword_overview",
            {
                "keywords": keywords,
                "language_code": language_code,
                "location_name": location_name
            }
        )

        return response.get("result", [])

    def search_intent(self, keywords: list[str], language_code: str = "en") -> list[dict]:
        """
        分析关键词搜索意图

        四种意图类型：
        - informational: 信息型（了解某个主题）
        - navigational: 导航型（访问特定网站）
        - commercial: 商业型（研究购买决策）
        - transactional: 交易型（完成购买）

        Args:
            keywords: 关键词列表
            language_code: 语言代码

        Returns:
            搜索意图分析结果
        """
        logger.info(f"Analyzing search intent for {len(keywords)} keywords")

        response = self._execute_tool(
            "dataforseo_labs_search_intent",
            {
                "keywords": keywords,
                "language_code": language_code
            }
        )

        return response.get("result", [])

    def keyword_difficulty(self, keywords: list[str]) -> list[dict]:
        """
        批量获取关键词难度

        难度分数 0-100，表示在 top 10 排名的难度。

        Args:
            keywords: 关键词列表

        Returns:
            关键词难度数据
        """
        response = self._execute_tool(
            "keywords_data_google_bulk_keyword_difficulty",
            {
                "keywords": keywords,
                "language_code": "en",
                "location_name": "Australia"
            }
        )

        return response.get("result", [])

    # =========================================================================
    # SERP Methods
    # =========================================================================

    def serp_analysis(
        self,
        keyword: str,
        language_code: str = "en",
        location_name: str = "Australia",
        depth: int = 10
    ) -> list[SERPResult]:
        """
        分析 SERP 结果

        获取关键词的搜索结果页面分析。

        Args:
            keyword: 目标关键词
            language_code: 语言代码
            location_name: 地理位置
            depth: 分析深度（结果数量）

        Returns:
            SERPResult 对象列表
        """
        logger.info(f"Analyzing SERP for: {keyword}")

        response = self._execute_tool(
            "serp_organic_live_advanced",
            {
                "keyword": keyword,
                "language_code": language_code,
                "location_name": location_name,
                "depth": depth
            }
        )

        results = []
        for item in response.get("result", []):
            results.append(SERPResult(
                keyword=keyword,
                position=item.get("position", 0),
                url=item.get("url", ""),
                title=item.get("title", ""),
                description=item.get("description", ""),
                rank_change=item.get("rank_change", 0),
                is_new=item.get("is_new", False),
                is_featured_snippet=item.get("is_featured_snippet", False)
            ))

        return results

    # =========================================================================
    # AI Optimization Methods
    # =========================================================================

    def llm_mention_analysis(
        self,
        target: str,
        platform: str = "chat_gpt",
        language_code: str = "en",
        location_name: str = "United States"
    ) -> dict:
        """
        分析 LLM 中的品牌提及

        了解 AI 如何谈论你的品牌或相关关键词。

        Args:
            target: 目标域名或关键词
            platform: 平台（chat_gpt 或 google）
            language_code: 语言代码
            location_name: 地理位置

        Returns:
            LLM 提及分析结果
        """
        logger.info(f"Analyzing LLM mentions for: {target}")

        response = self._execute_tool(
            "ai_optimization_llm_ment_cross_agg_metrics",
            {
                "platform": platform,
                "language_code": language_code,
                "location_name": location_name,
                "targets": [{"aggregation_key": "source", "target": [{"domain": target}]}]
            }
        )

        return response.get("result", {})

    def ai_visibility_score(
        self,
        domain: str,
        keywords: list[str],
        language_code: str = "en"
    ) -> dict:
        """
        计算 AI 可见度分数

        综合评估域名在 AI 搜索结果中的表现。

        Args:
            domain: 目标域名
            keywords: 相关关键词
            language_code: 语言代码

        Returns:
            AI 可见度评分详情
        """
        logger.info(f"Calculating AI visibility for: {domain}")

        # 获取关键词在 AI 中的搜索量
        volume_response = self._execute_tool(
            "ai_optimization_keyword_data_search_volume",
            {
                "keywords": keywords,
                "language_code": language_code
            }
        )

        # 获取 LLM 提及数据
        mention_response = self._execute_tool(
            "ai_optimization_llm_ment_top_pages",
            {
                "platform": "chat_gpt",
                "language_code": language_code,
                "location_name": "United States",
                "target": [{"domain": domain}]
            }
        )

        return {
            "domain": domain,
            "keyword_volume": volume_response.get("result", []),
            "mention_data": mention_response.get("result", {}),
            "visibility_score": self._calculate_visibility_score(
                volume_response.get("result", []),
                mention_response.get("result", {})
            )
        }

    def _calculate_visibility_score(
        self,
        volume_data: list,
        mention_data: dict
    ) -> float:
        """计算可见度分数（内部方法）"""
        # 简化计算，实际应基于更复杂的算法
        total_volume = sum(v.get("search_volume", 0) for v in volume_data)
        mention_count = mention_data.get("total_count", 0)

        if total_volume == 0:
            return 0.0

        # 可见度 = 提及数 / 总搜索量 * 100
        score = (mention_count / total_volume) * 100 if total_volume > 0 else 0
        return min(score, 100.0)  # 上限 100

    # =========================================================================
    # Domain Analysis Methods
    # =========================================================================

    def domain_rank_overview(self, domain: str) -> dict:
        """
        获取域名排名概览

        包括有机搜索和付费搜索的排名分布。

        Args:
            domain: 目标域名

        Returns:
            域名排名数据
        """
        logger.info(f"Fetching rank overview for: {domain}")

        response = self._execute_tool(
            "dataforseo_labs_google_domain_rank_overview",
            {
                "target": domain,
                "language_code": "en",
                "location_name": "Australia"
            }
        )

        return response.get("result", {})

    def ranked_keywords(
        self,
        domain: str,
        limit: int = 100,
        include_subdomains: bool = False
    ) -> list[dict]:
        """
        获取域名排名的关键词

        Args:
            domain: 目标域名
            limit: 返回数量限制
            include_subdomains: 是否包含子域名

        Returns:
            排名关键词列表
        """
        logger.info(f"Fetching ranked keywords for: {domain}")

        response = self._execute_tool(
            "dataforseo_labs_google_ranked_keywords",
            {
                "target": domain,
                "limit": limit,
                "include_subdomains": include_subdomains,
                "language_code": "en",
                "location_name": "Australia"
            }
        )

        return response.get("result", [])

    def competitors_analysis(self, domain: str) -> list[dict]:
        """
        竞品分析

        找出同领域排名但非直接竞争对手的域名。

        Args:
            domain: 目标域名

        Returns:
            竞品域名列表
        """
        logger.info(f"Analyzing competitors for: {domain}")

        response = self._execute_tool(
            "dataforseo_labs_google_competitors_domain",
            {
                "target": domain,
                "language_code": "en",
                "location_name": "Australia",
                "limit": 20
            }
        )

        return response.get("result", [])


# ============================================================================
# Convenience Functions
# ============================================================================

def quick_keyword_research(seed_keyword: str) -> list[KeywordIdea]:
    """
    快速关键词研究（单次调用）

    便捷函数，用于快速获取关键词建议。

    Args:
        seed_keyword: 种子关键词

    Returns:
        KeywordIdea 列表
    """
    client = DataForSEOMCPClient()
    return client.keyword_ideas([seed_keyword])


def quick_serp_analysis(keyword: str) -> list[SERPResult]:
    """
    快速 SERP 分析（单次调用）

    便捷函数，用于快速分析搜索结果。

    Args:
        keyword: 目标关键词

    Returns:
        SERPResult 列表
    """
    client = DataForSEOMCPClient()
    return client.serp_analysis(keyword)


# ============================================================================
# CLI Entry Point
# ============================================================================

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="DataForSEO MCP Client CLI")
    parser.add_argument("action", choices=["ideas", "serp", "overview", "rank"])
    parser.add_argument("keyword", help="Keyword to analyze")
    parser.add_argument("--location", default="Australia", help="Location")
    parser.add_argument("--lang", default="en", help="Language code")

    args = parser.parse_args()
    client = DataForSEOMCPClient()

    try:
        if args.action == "ideas":
            results = client.keyword_ideas([args.keyword], args.lang, args.location)
            print(json.dumps([r.to_dict() for r in results], indent=2))

        elif args.action == "serp":
            results = client.serp_analysis(args.keyword, args.lang, args.location)
            print(json.dumps([asdict(r) for r in results], indent=2))

        elif args.action == "overview":
            results = client.keyword_overview([args.keyword], args.lang, args.location)
            print(json.dumps(results, indent=2))

        elif args.action == "rank":
            results = client.ranked_keywords(args.keyword)
            print(json.dumps(results, indent=2))

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
