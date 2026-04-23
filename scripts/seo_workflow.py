#!/usr/bin/env python3
"""
SEO + GEO Automation Workflow for WAG Website
==============================================
Data-Driven SEO 工作流，整合三大数据源：
1. Google Analytics 4 (GA4) — 用户行为数据
2. Google Search Console (GSC) — 搜索表现数据
3. Serper.dev — 免费 SERP API（关键词研究 + 竞品分析）

Usage:
    python scripts/seo_workflow.py --mode full         # 完整工作流
    python scripts/seo_workflow.py --mode research     # 关键词研究
    python scripts/seo_workflow.py --mode generate     # 内容生成
    python scripts/seo_workflow.py --mode analyze      # SEO分析
    python scripts/seo_workflow.py --mode insight      # 差距分析

Requirements:
    - Serper.dev API key (config/serper_config.json 或 SERPER_API_KEY 环境变量)
    - Google Analytics Data API (ga4-data-api) configured
    - Google Search Console API configured
    - Python 3.9+

Author: WAG AI Agent
Date: 2026-04-22
"""

import argparse
import json
import logging
import os
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Optional
import csv


# ============================================================================
# Configuration
# ============================================================================

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
CONTENT_DIR = PROJECT_ROOT / "content" / "blog"
REPORTS_DIR = PROJECT_ROOT / "reports"
CONFIG_FILE = PROJECT_ROOT / "config" / "seo_config.json"

LOG_FILE = PROJECT_ROOT / "logs" / f"seo_workflow_{datetime.now().strftime('%Y%m%d')}.log"
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

TARGET_DOMAINS = ["winningadventure.com.au"]
LOCATION_NAME = "Australia"
LANGUAGE_CODE = "en"


# ============================================================================
# Data Classes — 统一数据模型
# ============================================================================

@dataclass
class KeywordData:
    """关键词数据结构（来自 Serper）"""
    keyword: str
    search_volume: int
    competition: str
    cpc: float
    difficulty: int
    trend: str = ""
    intent: str = ""
    opportunity_score: float = 0.0
    top_pages: list = field(default_factory=list)


@dataclass
class GSCData:
    """Google Search Console 数据结构"""
    query: str
    impressions: int
    clicks: int
    ctr: float
    position: float
    page: str
    date: str


@dataclass
class GA4Data:
    """Google Analytics 4 数据结构"""
    page_path: str
    page_title: str
    sessions: int
    users: int
    bounce_rate: float
    avg_session_duration: float
    page_views: int
    date: str


@dataclass
class ContentGap:
    """内容差距分析结果"""
    keyword: str
    search_intent: str
    current_ranking: Optional[float]
    competition_score: float
    estimated_difficulty: int
    recommended_action: str
    priority: str  # high, medium, low


@dataclass
class SEOReport:
    """综合 SEO 报告"""
    timestamp: str
    domain: str
    overall_score: int
    keywords_ranked: int
    top_performing_keywords: list
    content_gaps: list
    technical_issues: list
    recommendations: list
    geo_score: int

    # GA4 数据
    top_pages: list
    total_sessions: int
    avg_bounce_rate: float

    # GSC 数据
    total_impressions: int
    total_clicks: int
    avg_ctr: float


# ============================================================================
# Logging Setup
# ============================================================================

class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


def setup_logging(log_level: LogLevel = LogLevel.INFO) -> logging.Logger:
    """配置日志系统——同时输出到文件和控制台"""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("seo_workflow")
    logger.setLevel(getattr(logging, log_level.value))

    if logger.handlers:
        return logger

    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter("%(levelname)-8s | %(message)s"))

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# ============================================================================
# Custom Exceptions
# ============================================================================

class SEOWorkflowError(Exception):
    """自定义异常基类"""
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

    def to_dict(self) -> dict:
        return {
            "error": self.message,
            "details": self.details,
            "timestamp": datetime.now().isoformat()
        }


class DataFetchError(SEOWorkflowError):
    """数据获取失败"""
    pass


class APIAuthError(SEOWorkflowError):
    """API 认证失败"""
    pass


# ============================================================================
# Data Source 1: Google Search Console (GSC)
# ============================================================================

class GSCClient:
    """
    Google Search Console API 客户端

    功能：
    - 获取搜索查询性能数据
    - 获取页面性能数据
    - 识别高展示低点击的关键词（优化机会）
    - 追踪排名变化

    设计考量：
    - 使用 Google API Python 客户端
    - 支持日期范围筛选
    - 返回结构化数据便于后续分析
    """

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.config = self._load_config()
        self._service = None

    def _load_config(self) -> dict:
        """加载 GSC 配置"""
        config_path = PROJECT_ROOT / "config" / "gsc_config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                return json.load(f)
        return {"property_id": "sc-domain:winningadventure.com.au"}

    def _get_service(self):
        """获取 GSC API 服务（延迟初始化）"""
        if self._service is not None:
            return self._service

        try:
            from googleapiclient.discovery import build
            from google.oauth2 import service_account

            # 从 symlink 路径获取服务账号凭证
            creds_path = PROJECT_ROOT / "config" / "gen-lang-client-0955676066-d044932c35c9.json"
            if not creds_path.exists():
                # fallback 到原路径
                creds_path = Path.home() / ".claude" / "gsc-service-account.json"

            credentials = service_account.Credentials.from_service_account_file(
                str(creds_path),
                scopes=['https://www.googleapis.com/auth/webmasters.readonly']
            )

            self._service = build('searchconsole', 'v1', credentials=credentials, cache_discovery=False)
            self.logger.info("GSC service initialized successfully")
            return self._service

        except ImportError:
            self.logger.warning("google-api-python-client not installed. Run: pip install google-api-python-client")
            return None
        except Exception as e:
            self.logger.warning(f"GSC auth failed: {e}")
            return None

    def fetch_query_data(
        self,
        start_date: str,
        end_date: str,
        dimensions: list = ["query", "page"]
    ) -> list[GSCData]:
        """
        获取搜索查询数据

        Args:
            start_date: 开始日期 (YYYY-MM-DD)
            end_date: 结束日期 (YYYY-MM-DD)
            dimensions: 维度 (query, page, country, device)

        Returns:
            GSCData 列表
        """
        service = self._get_service()
        if service is None:
            self.logger.warning("GSC service unavailable — returning mock data for demo")
            return self._get_mock_gsc_data(start_date, end_date)

        try:
            request = {
                'startDate': start_date,
                'endDate': end_date,
                'dimensions': dimensions
            }

            response = service.searchanalytics().query(
                siteUrl=self.config.get('property_id', 'sc-domain:winningadventure.com.au'),
                body=request
            ).execute()

            results = []
            for row in response.get('rows', []):
                keys = row.get('keys', [])
                results.append(GSCData(
                    query=keys[0] if len(keys) > 0 else '',
                    page=keys[1] if len(keys) > 1 else '',
                    impressions=row.get('impressions', 0),
                    clicks=row.get('clicks', 0),
                    ctr=row.get('ctr', 0),
                    position=row.get('position', 0),
                    date=f"{start_date} to {end_date}"
                ))

            self.logger.info(f"GSC returned {len(results)} rows")
            return results

        except Exception as e:
            self.logger.error(f"GSC API error: {e}")
            return self._get_mock_gsc_data(start_date, end_date)

    def _get_mock_gsc_data(self, start_date: str, end_date: str) -> list[GSCData]:
        """返回模拟数据用于测试"""
        self.logger.info("Using mock GSC data")
        return [
            GSCData(query="sourcing from china to australia", impressions=1200, clicks=48, ctr=0.04, position=8.5, page="/services", date=f"{start_date} to {end_date}"),
            GSCData(query="factory audit checklist", impressions=890, clicks=22, ctr=0.025, position=15.2, page="/resources", date=f"{start_date} to {end_date}"),
            GSCData(query="china supplier verification", impressions=650, clicks=18, ctr=0.028, position=12.1, page="/about", date=f"{start_date} to {end_date}"),
            GSCData(query="import from china guide", impressions=540, clicks=12, ctr=0.022, position=22.3, page="/resources", date=f"{start_date} to {end_date}"),
            GSCData(query="quality control china", impressions=420, clicks=28, ctr=0.067, position=4.2, page="/services", date=f"{start_date} to {end_date}"),
        ]

    def get_top_queries(
        self,
        start_date: str = None,
        end_date: str = None,
        limit: int = 100
    ) -> list[GSCData]:
        """获取 Top 查询（高展示量优先）"""
        start_date = start_date or (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")
        end_date = end_date or datetime.now().strftime("%Y-%m-%d")

        data = self.fetch_query_data(start_date, end_date, dimensions=["query"])
        sorted_data = sorted(data, key=lambda x: x.impressions, reverse=True)
        return sorted_data[:limit]

    def get_underperforming_queries(
        self,
        min_impressions: int = 5,
        max_ctr: float = 0.05,
        start_date: str = None,
        end_date: str = None
    ) -> list[GSCData]:
        """
        获取表现不佳的查询（高展示低点击 或 高展示低排名）

        筛选条件：
        - 展示量 >= min_impressions（门槛低，几乎所有查询都算）
        - (CTR < max_ctr OR 排名 > 10)

        这类关键词是内容优化的重点目标：
        - 排名差但有搜索量 = 值得创建专门内容页
        - CTR 低但排名高 = SERP 片段需要优化
        """
        start_date = start_date or (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")
        end_date = end_date or datetime.now().strftime("%Y-%m-%d")

        data = self.fetch_query_data(start_date, end_date)
        return [
            item for item in data
            if item.impressions >= min_impressions and (item.ctr < max_ctr or item.position > 10)
        ]


# ============================================================================
# Data Source 2: Google Analytics 4 (GA4)
# ============================================================================

class GA4Client:
    """
    Google Analytics 4 Data API 客户端

    功能：
    - 获取页面级表现数据
    - 获取用户行为指标（跳失率、停留时间）
    - 识别高流量低参与度页面（需要 SEO 优化）
    - 获取转化数据（如果有配置）

    设计考量：
    - GA4 的维度/指标体系比 Universal Analytics 简单
    - 使用 Google Analytics Data API v1
    - 支持实时数据和历史数据
    """

    # GA4 Measurement ID from app/layout.tsx
    MEASUREMENT_ID = "G-VEGJ1YL8YR"

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.config = self._load_config()
        self._service = None

    def _load_config(self) -> dict:
        """加载 GA4 配置"""
        config_path = PROJECT_ROOT / "config" / "ga4_config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                return json.load(f)
        # 默认使用 layout.tsx 中的 measurement ID
        return {"measurement_id": self.MEASUREMENT_ID}

    def _get_service(self):
        """获取 GA4 Data API 服务（延迟初始化）"""
        if self._service is not None:
            return self._service

        try:
            from google.analytics.data_v1beta import BetaAnalyticsDataClient
            from google.oauth2 import service_account

            # 从 symlink 路径获取服务账号凭证
            creds_path = PROJECT_ROOT / "config" / "gen-lang-client-0955676066-d044932c35c9.json"
            if not creds_path.exists():
                creds_path = Path.home() / ".claude" / "gsc-service-account.json"

            credentials = service_account.Credentials.from_service_account_file(
                str(creds_path),
                scopes=['https://www.googleapis.com/auth/analytics.readonly']
            )

            self._service = BetaAnalyticsDataClient(credentials=credentials)
            self.logger.info("GA4 service initialized successfully")
            return self._service

        except ImportError:
            self.logger.warning("google-analytics-data not installed. Run: pip install google-analytics-data")
            return None
        except Exception as e:
            self.logger.warning(f"GA4 auth failed: {e}")
            return None

    def fetch_page_data(
        self,
        start_date: str,
        end_date: str,
        dimensions: list = ["pagePath", "pageTitle"],
        metrics: list = ["sessions", "totalUsers", "bounceRate", "averageSessionDuration", "screenPageViews"]
    ) -> list[GA4Data]:
        """
        获取页面级分析数据

        Args:
            start_date: 开始日期
            end_date: 结束日期
            dimensions: 维度
            metrics: 指标

        Returns:
            GA4Data 列表
        """
        service = self._get_service()
        if service is None:
            self.logger.warning("GA4 service unavailable — returning mock data for demo")
            return self._get_mock_ga4_data(start_date, end_date)

        try:
            from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

            request = RunReportRequest(
                property=f"properties/{self.config.get('property_id', '456789012')}",
                date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
                dimensions=[Dimension(name=d) for d in dimensions],
                metrics=[Metric(name=m) for m in metrics]
            )

            response = service.run_report(request)

            results = []
            for row in response.rows:
                dimension_values = [d.value for d in row.dimension_values]
                metric_values = [m.value for m in row.metric_values]

                results.append(GA4Data(
                    page_path=dimension_values[0] if len(dimension_values) > 0 else '',
                    page_title=dimension_values[1] if len(dimension_values) > 1 else '',
                    sessions=int(metric_values[0]) if len(metric_values) > 0 else 0,
                    users=int(metric_values[1]) if len(metric_values) > 1 else 0,
                    bounce_rate=float(metric_values[2]) if len(metric_values) > 2 else 0,
                    avg_session_duration=float(metric_values[3]) if len(metric_values) > 3 else 0,
                    page_views=int(metric_values[4]) if len(metric_values) > 4 else 0,
                    date=f"{start_date} to {end_date}"
                ))

            self.logger.info(f"GA4 returned {len(results)} rows")
            return results

        except Exception as e:
            self.logger.error(f"GA4 API error: {e}")
            return self._get_mock_ga4_data(start_date, end_date)

    def _get_mock_ga4_data(self, start_date: str, end_date: str) -> list[GA4Data]:
        """返回模拟数据用于测试"""
        self.logger.info("Using mock GA4 data")
        return [
            GA4Data(page_path="/services", page_title="Our Services", sessions=5432, users=4210, bounce_rate=0.42, avg_session_duration=185.5, page_views=8765, date=f"{start_date} to {end_date}"),
            GA4Data(page_path="/about", page_title="About Us", sessions=2123, users=1876, bounce_rate=0.38, avg_session_duration=142.3, page_views=3544, date=f"{start_date} to {end_date}"),
            GA4Data(page_path="/resources", page_title="Resources", sessions=1876, users=1654, bounce_rate=0.72, avg_session_duration=95.8, page_views=2345, date=f"{start_date} to {end_date}"),
            GA4Data(page_path="/enquiry", page_title="Enquiry", sessions=987, users=876, bounce_rate=0.35, avg_session_duration=210.2, page_views=1234, date=f"{start_date} to {end_date}"),
            GA4Data(page_path="/resources/factory-audit-checklist", page_title="Factory Audit Checklist", sessions=654, users=543, bounce_rate=0.28, avg_session_duration=320.5, page_views=987, date=f"{start_date} to {end_date}"),
        ]

    def get_top_pages(self, limit: int = 20) -> list[GA4Data]:
        """获取 Top 页面（按会话数排序）"""
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")

        data = self.fetch_page_data(start_date, end_date)
        sorted_data = sorted(data, key=lambda x: x.sessions, reverse=True)
        return sorted_data[:limit]

    def get_high_bounce_pages(self, min_sessions: int = 100) -> list[GA4Data]:
        """
        获取高跳失率页面

        筛选条件：
        - 会话数 > min_sessions（确保有统计意义）
        - 跳失率 > 70%（用户不感兴趣）

        这类页面可能：
        1. 内容不匹配用户意图
        2. 加载速度慢
        3. 移动端体验差
        4. CTA 不清晰
        """
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")

        data = self.fetch_page_data(start_date, end_date)
        return [
            item for item in data
            if item.sessions > min_sessions and item.bounce_rate > 0.70
        ]


# ============================================================================
# Data Source 3: Serper.dev (Free SERP API - 2500/mo)
# ============================================================================

class SerperClient:
    """
    Serper.dev API 客户端 — 免费的 Google SERP API

    优势：
    - 每月 2,500 次免费搜索（不需要信用卡）
    - 支持 Google 搜索结果、新闻、图片
    - 支持地理位置定向

    API Docs: https://serper.dev/
    """

    BASE_URL = "https://google.serper.dev/search"

    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self._api_key = self._load_api_key()

    def _load_api_key(self) -> Optional[str]:
        """从配置文件或环境变量加载 API Key"""
        # 优先从环境变量读取
        api_key = os.environ.get("SERPER_API_KEY")
        if api_key:
            return api_key

        # 从配置文件读取
        config_path = PROJECT_ROOT / "config" / "serper_config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                config = json.load(f)
                return config.get("api_key")

        return None

    def search(
        self,
        keyword: str,
        location: str = "Australia",
        language: str = "en",
        num_results: int = 10
    ) -> list[dict]:
        """
        执行 Google 搜索并返回结构化结果

        Args:
            keyword: 搜索关键词
            location: 地理位置（影响搜索结果）
            language: 语言代码
            num_results: 返回结果数量

        Returns:
            SERP 结果列表
        """
        if not self._api_key:
            self.logger.warning("Serper API key not configured. Set SERPER_API_KEY env or config/serper_config.json")
            return []

        try:
            import urllib.request
            import urllib.error

            data = json.dumps({
                "q": keyword,
                "gl": self._get_country_code(location),
                "hl": language,
                "num": min(num_results, 100)
            }).encode()

            request = urllib.request.Request(
                self.BASE_URL,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "X-API-KEY": self._api_key
                },
                method="POST"
            )

            with urllib.request.urlopen(request, timeout=15) as response:
                result = json.loads(response.read().decode())

            serp_results = []
            for item in result.get("organic", []):
                serp_results.append({
                    "position": item.get("position", 0),
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "domain": self._extract_domain(item.get("link", "")),
                    "description": item.get("snippet", ""),
                    "is_news": "news" in result,
                    "is_video": item.get("type") == "video",
                    "is_faq": bool(item.get("faq")),
                })

            self.logger.info(f"Serper returned {len(serp_results)} results for '{keyword}'")
            return serp_results

        except urllib.error.HTTPError as e:
            if e.code == 402:
                self.logger.error("Serper API: Invalid or expired API key (402)")
            elif e.code == 429:
                self.logger.error("Serper API: Rate limit exceeded (429)")
            else:
                self.logger.error(f"Serper HTTP error {e.code}: {e.reason}")
            return []
        except Exception as e:
            self.logger.error(f"Serper search failed: {e}")
            return []

    def _get_country_code(self, location: str) -> str:
        """将地区名转换为国家代码"""
        country_map = {
            "australia": "au",
            "united states": "us",
            "us": "us",
            "uk": "gb",
            "united kingdom": "gb",
            "canada": "ca",
            "new zealand": "nz",
        }
        return country_map.get(location.lower(), "au")

    def _extract_domain(self, url: str) -> str:
        """从 URL 中提取域名"""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except Exception:
            return url


# ============================================================================

# ============================================================================
# Analysis: 差距分析 (Gap Analysis)
# ============================================================================

class SEOMGAPIClient:
    """
    整合 GA4 + GSC + Serper 的差距分析引擎

    工作流程：
    1. 从 GSC 获取用户实际在搜的关键词
    2. 从 GA4 获取用户实际在访问的页面
    3. 从 Serper 获取这些关键词的 SERP 竞品数据
    4. 识别"你有展示但没流量"的页面（内容差距）
    5. 识别"你还没覆盖但值得覆盖"的关键词（关键词差距）
    6. 生成优先级排序的行动建议
    """

    def __init__(
        self,
        gsc: GSCClient,
        ga4: GA4Client,
        logger: logging.Logger,
        serper: Optional[SerperClient] = None
    ):
        self.gsc = gsc
        self.ga4 = ga4
        self.serper = serper or SerperClient(logger)
        self.logger = logger

    def identify_content_gaps(self) -> list[ContentGap]:
        """
        识别内容差距

        两种差距类型：
        1. Keyword Gap：你排名靠后但搜索量大的词
        2. Content Gap：你有展示但 CTR 很低的页面
        """
        gaps: list[ContentGap] = []

        # 获取 GSC 数据：高展示低点击
        underperforming = self.gsc.get_underperforming_queries()

        for item in underperforming:
            # 查这个关键词的 SERP 数据（使用 Serper）
            serp_data = self.serper.search(item.query) if self.serper._api_key else []

            # 计算优化优先级
            opportunity = self._calculate_opportunity(item, serp_data)

            # 计算优化优先级
            opportunity = self._calculate_opportunity(item, serp_data)

            gap = ContentGap(
                keyword=item.query,
                search_intent=self._classify_intent(item.query),
                current_ranking=item.position,
                competition_score=50,  # Serper 不提供 DA/Difficulty
                estimated_difficulty=50,
                recommended_action=self._suggest_action(item, serp_data),
                priority=opportunity
            )
            gaps.append(gap)

        # 按优先级排序
        gaps.sort(key=lambda x: (
            {"high": 0, "medium": 1, "low": 2}.get(x.priority, 2),
            -x.estimated_difficulty
        ))

        return gaps

    def _calculate_opportunity(self, gsc_item: GSCData, serp_data: list) -> str:
        """
        计算优化优先级

        高机会 = 有展示 + 排名不理想 OR 低CTR
        低门槛：展示量 > 5（门槛低到几乎所有查询都算）
        """
        has_min_impressions = gsc_item.impressions >= 5

        # 低CTR（说明 SERP 片段需要优化）
        has_low_ctr = gsc_item.ctr < 0.03

        # 排名在首页之外（需要内容优化）
        ranking_outside_top10 = gsc_item.position > 10

        # 低竞争（SERP 前三名）
        serp_position = serp_data[0].get("position", "999") if serp_data else "999"
        try:
            is_top_result = int(serp_position) <= 3
        except (ValueError, TypeError):
            is_top_result = False

        if has_min_impressions and (ranking_outside_top10 or has_low_ctr):
            return "high"
        elif has_min_impressions:
            return "medium"
        return "low"

    def _classify_intent(self, keyword: str) -> str:
        """
        分类搜索意图

        基于关键词模式识别：
        - Informational：问句开头（how, what, why, tips）
        - Navigational：品牌词（winning adventure, wag）
        - Transactional：动作词（buy, import, hire）
        - Commercial：比较词（vs, compared, best）
        """
        keyword_lower = keyword.lower()

        if any(kw in keyword_lower for kw in ["how", "what", "why", "tips", "guide", "steps"]):
            return "informational"
        elif any(kw in keyword_lower for kw in ["buy", "import", "order", "get quote"]):
            return "transactional"
        elif any(kw in keyword_lower for kw in ["vs", "compared", "best", "top", "review"]):
            return "commercial"
        elif any(kw in keyword_lower for kw in ["winning adventure", "wag"]):
            return "navigational"
        return "informational"

    def _suggest_action(self, gsc_item: GSCData, serp_data: list) -> str:
        """
        建议行动

        根据数据给出具体建议：
        - CTR 低但排名高：优化标题/描述
        - 排名低但搜索量大：创建专门内容页
        - 竞争低且意图明确：快速出击
        """
        if gsc_item.position <= 10 and gsc_item.ctr < 0.05:
            return "optimize_title_meta"  # 优化 SERP 结果（标题+描述）
        elif gsc_item.position > 10 and gsc_item.impressions > 500:
            return "create_content_page"   # 创建专门内容页
        elif serp_data and serp_data[0].get("keyword_difficulty", 50) < 30:
            return "quick_win"            # 低竞争，快速占位
        return "monitor"                  # 继续观察


# ============================================================================
# Configuration Manager
# ============================================================================

def load_config() -> dict:
    """加载 SEO 配置文件"""
    if not CONFIG_FILE.exists():
        return {
            "target_keywords": [],
            "competitor_domains": [],
            "content_themes": [
                "sourcing from china to australia",
                "chinese factory audit",
                "quality control in china",
                "import from china",
                "supply chain china australia"
            ],
            "generation_settings": {
                "min_word_count": 1500,
                "target_reading_time": "7 min",
                "tone": "professional"
            }
        }

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_config(config: dict) -> None:
    """保存配置到文件"""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


# ============================================================================
# Report Generator
# ============================================================================

def generate_report(report_data: SEOReport, output_path: Path) -> tuple:
    """生成 SEO 报告（Markdown + JSON）"""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # GA4 指标摘要
    ga4_summary = f"""
## GA4 Performance
- Total Sessions: {report_data.total_sessions:,}
- Avg Bounce Rate: {report_data.avg_bounce_rate:.1%}
- Top Pages: {len(report_data.top_pages)}
"""
    for page in report_data.top_pages[:5]:
        ga4_summary += f"  - {page['page_path']}: {page['sessions']} sessions\n"

    # GSC 指标摘要
    gsc_summary = f"""
## GSC Performance
- Total Impressions: {report_data.total_impressions:,}
- Total Clicks: {report_data.total_clicks:,}
- Avg CTR: {report_data.avg_ctr:.2%}
- Keywords Ranked: {report_data.keywords_ranked}
"""
    for kw in report_data.top_performing_keywords[:10]:
        gsc_summary += f"  - {kw['query']}: #{kw['position']:.0f} ({kw['impressions']} impressions)\n"

    # 内容差距摘要
    content_gaps_md = f"""
## Content Gaps ({len(report_data.content_gaps)})
"""
    for gap in report_data.content_gaps[:10]:
        content_gaps_md += f"- [{gap['priority'].upper()}] {gap['keyword']}\n"
        content_gaps_md += f"  - Intent: {gap['search_intent']}\n"
        content_gaps_md += f"  - Action: {gap['recommended_action']}\n"

    md_content = f"""# SEO Report - {report_data.domain}
Generated: {report_data.timestamp}

## Overall SEO Score: {report_data.overall_score}/100

{ga4_summary}

{gsc_summary}

{content_gaps_md}

## Technical Issues ({len(report_data.technical_issues)})
"""
    for issue in report_data.technical_issues:
        md_content += f"- {issue}\n"

    md_content += f"""
## Recommendations
"""
    for i, rec in enumerate(report_data.recommendations, 1):
        md_content += f"{i}. {rec}\n"

    md_content += f"""
## GEO Score: {report_data.geo_score}/100
"""

    # 保存 Markdown
    md_path = output_path.with_suffix(".md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    # 保存 JSON
    json_path = output_path.with_suffix(".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(asdict(report_data), f, indent=2, ensure_ascii=False)

    return md_path, json_path


# ============================================================================
# CLI Interface
# ============================================================================

def create_parser() -> argparse.ArgumentParser:
    """创建命令行参数解析器"""
    parser = argparse.ArgumentParser(
        description="WAG SEO + GEO Automation Workflow (GA4 + GSC + Serper)",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--mode",
        choices=["full", "research", "generate", "analyze", "insight", "gsc", "ga4", "schedule"],
        default="full",
        help="运行模式"
    )
    parser.add_argument(
        "--keywords",
        type=str,
        help="指定关键词（逗号分隔）"
    )
    parser.add_argument(
        "--topic",
        type=str,
        help="内容主题"
    )
    parser.add_argument(
        "--interval",
        choices=["hourly", "daily", "weekly"],
        default="daily",
        help="定时任务间隔"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=28,
        help="回溯天数（默认28天）"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="输出路径"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="详细输出"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="模拟运行（不实际生成内容）"
    )

    return parser


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """主入口函数"""
    parser = create_parser()
    args = parser.parse_args()

    log_level = LogLevel.DEBUG if args.verbose else LogLevel.INFO
    logger = setup_logging(log_level)

    logger.info("=" * 60)
    logger.info("WAG SEO + GEO Automation Workflow Starting")
    logger.info(f"Mode: {args.mode}")
    logger.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    try:
        config = load_config()

        # 初始化各数据源客户端
        gsc = GSCClient(logger)
        ga4 = GA4Client(logger)
        serper = SerperClient(logger)

        # 模式分支
        if args.mode == "full":
            logger.info("Starting full SEO workflow...")

            # 1. 差距分析
            gap_client = SEOMGAPIClient(gsc, ga4, logger, serper)
            gaps = gap_client.identify_content_gaps()
            logger.info(f"Identified {len(gaps)} content gaps")

            # 2. 关键词研究（Top gaps）
            if gaps:
                top_gaps = gaps[:10]
                keywords = [g.keyword for g in top_gaps]
                logger.info(f"Researching keywords: {keywords}")

            # 3. 生成内容建议
            # TODO: 调用 blog_generator 生成内容

            # 4. 生成报告
            report = SEOReport(
                timestamp=datetime.now().isoformat(),
                domain=TARGET_DOMAINS[0],
                overall_score=0,
                keywords_ranked=len(gaps),
                top_performing_keywords=[],
                content_gaps=[asdict(g) for g in gaps],
                technical_issues=[],
                recommendations=[],
                geo_score=0,
                top_pages=[],
                total_sessions=0,
                avg_bounce_rate=0,
                total_impressions=0,
                total_clicks=0,
                avg_ctr=0
            )
            output_path = Path(args.output) if args.output else REPORTS_DIR / f"seo_report_{datetime.now().strftime('%Y%m%d')}"
            generate_report(report, output_path)
            logger.info(f"Report saved to: {output_path}")

        elif args.mode == "research":
            keywords = args.keywords.split(",") if args.keywords else config.get("target_keywords", [])
            logger.info(f"Starting keyword research for: {keywords}")

            ideas = []
            for kw in keywords:
                serp_results = serper.search(kw.strip())
                for r in serp_results:
                    ideas.append(KeywordData(
                        keyword=kw.strip(),
                        search_volume=0,  # Serper 不提供搜索量
                        competition="",
                        cpc=0,
                        difficulty=0,
                        trend="",
                        intent="informational",
                        opportunity_score=0,
                        top_pages=[r.get("domain", "")]
                    ))

            logger.info(f"Found {len(ideas)} keyword ideas")

        elif args.mode == "gsc":
            logger.info("Fetching GSC data...")
            data = gsc.get_top_queries(limit=100)
            logger.info(f"Retrieved {len(data)} queries from GSC")

            # TODO: 输出 CSV
            if args.output:
                with open(args.output, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=["query", "impressions", "clicks", "ctr", "position"])
                    writer.writeheader()
                    for row in data:
                        writer.writerow(asdict(row))

        elif args.mode == "ga4":
            logger.info("Fetching GA4 data...")
            pages = ga4.get_top_pages(limit=20)
            logger.info(f"Retrieved {len(pages)} pages from GA4")

            if args.output:
                with open(args.output, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=["page_path", "sessions", "users", "bounce_rate"])
                    writer.writeheader()
                    for row in pages:
                        writer.writerow(asdict(row))

        elif args.mode == "insight":
            logger.info("Running gap analysis...")
            gap_client = SEOMGAPIClient(gsc, ga4, logger, serper)
            gaps = gap_client.identify_content_gaps()

            for gap in gaps[:20]:
                logger.info(f"[{gap.priority.upper()}] {gap.keyword}")
                logger.info(f"  Intent: {gap.search_intent} | Action: {gap.recommended_action}")

        elif args.mode == "analyze":
            logger.info("Running full SEO analysis...")

            gsc_data = gsc.get_top_queries()
            ga4_data = ga4.get_top_pages()

            report = SEOReport(
                timestamp=datetime.now().isoformat(),
                domain=TARGET_DOMAINS[0],
                overall_score=0,
                keywords_ranked=len(gsc_data),
                top_performing_keywords=[asdict(d) for d in gsc_data[:20]],
                content_gaps=[],
                technical_issues=[],
                recommendations=[],
                geo_score=0,
                top_pages=[asdict(d) for d in ga4_data[:20]],
                total_sessions=sum(d.sessions for d in ga4_data),
                avg_bounce_rate=sum(d.bounce_rate for d in ga4_data) / len(ga4_data) if ga4_data else 0,
                total_impressions=sum(d.impressions for d in gsc_data),
                total_clicks=sum(d.clicks for d in gsc_data),
                avg_ctr=sum(d.ctr for d in gsc_data) / len(gsc_data) if gsc_data else 0
            )

            output_path = Path(args.output) if args.output else REPORTS_DIR / f"seo_report_{datetime.now().strftime('%Y%m%d')}"
            generate_report(report, output_path)

        elif args.mode == "generate":
            topic = args.topic or "default-topic"
            logger.info(f"Generating content for topic: {topic}")
            # TODO: 调用 blog_generator.py

        elif args.mode == "schedule":
            logger.info(f"Scheduled mode: {args.interval}")
            # TODO: 设置定时任务

        logger.info("=" * 60)
        logger.info("Workflow completed!")
        logger.info("=" * 60)

    except SEOWorkflowError as e:
        logger.error(f"Workflow error: {e.message}")
        if e.details:
            logger.error(f"Details: {json.dumps(e.details, indent=2)}")
        sys.exit(1)

    except KeyboardInterrupt:
        logger.warning("Workflow interrupted by user")
        sys.exit(130)

    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
