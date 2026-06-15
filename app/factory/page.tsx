import { readFileSync } from "fs"
import { join } from "path"
import type { Metadata } from "next"
import { pinyin } from "pinyin-pro"
import Navbar from "@/components/Navbar"
import { FactoryDirectory } from "./factory-directory"

export const metadata: Metadata = {
  title: "China Factory Directory — Search Verified Manufacturers | Winning Adventure Global",
  description: "Browse 1,200+ verified Chinese factories across 30+ industries. Free to search — no signup needed.",
  openGraph: {
    title: "China Factory Directory — Search Verified Manufacturers",
    description: "Browse 1,200+ verified Chinese factories. Free to search — no signup needed.",
  },
}

export interface FactoryItem {
  member_id: string
  slug: string
  company_name: string
  pinyin_name: string
  category: string
  province: string
  city: string
  platform_tags: string[]
  certifications: string[]
  factory_area: string
  employees: string
  fca_report_id: string
  biz_scope: string
}

async function getData() {
  const indexPath = join(process.cwd(), "data/factory/index.json")
  return JSON.parse(readFileSync(indexPath, "utf-8"))
}

function extractCategories(factories: FactoryItem[]): string[] {
  const catMap: Record<string, string[]> = {
    "Electronics": ["电子", "电器", "LED", "灯具", "照明", "电源", "传感器", "显示"],
    "Sports & Outdoors": ["体育", "运动", "健身", "球", "户外", "器材"],
    "Textiles & Apparel": ["服装", "纺织", "面料", "服饰", "鞋", "帽"],
    "Packaging & Printing": ["包装", "印刷", "纸", "塑料", "袋", "盒"],
    "Furniture": ["家具", "办公", "桌椅", "沙发", "床"],
    "Hardware & Tools": ["五金", "工具", "金属", "机械", "模具", "自动化"],
    "Auto & Parts": ["汽车", "配件", "摩托", "轮胎", "部件"],
    "Construction": ["建筑", "建材", "陶瓷", "石材", "混凝土"],
  }
  const matched = new Set<string>()
  for (const f of factories) {
    for (const [cat, kws] of Object.entries(catMap)) {
      if (kws.some((kw) => (f.biz_scope || "").toLowerCase().includes(kw))) matched.add(cat)
    }
  }
  return [...matched].sort()
}

export default async function FactoryPage() {
  const data = await getData()
  const factories: FactoryItem[] = data.factories
  const provinces = [...new Set(factories.map((f) => f.province).filter(Boolean))].sort()
  const categories = extractCategories(factories)

  // Pre-compute category per factory (same catMap used by extractCategories)
  const catMap: Record<string, string[]> = {
    "Electronics": ["电子", "电器", "LED", "灯具", "照明", "电源", "传感器", "显示"],
    "Sports & Outdoors": ["体育", "运动", "健身", "球", "户外", "器材"],
    "Textiles & Apparel": ["服装", "纺织", "面料", "服饰", "鞋", "帽"],
    "Packaging & Printing": ["包装", "印刷", "纸", "塑料", "袋", "盒"],
    "Furniture": ["家具", "办公", "桌椅", "沙发", "床"],
    "Hardware & Tools": ["五金", "工具", "金属", "机械", "模具", "自动化"],
    "Auto & Parts": ["汽车", "配件", "摩托", "轮胎", "部件"],
    "Construction": ["建筑", "建材", "陶瓷", "石材", "混凝土"],
  }
  const classifyFactory = (bizScope: string): string => {
    const scope = bizScope.toLowerCase()
    for (const [cat, kws] of Object.entries(catMap)) {
      if (kws.some((kw) => scope.includes(kw))) return cat
    }
    return ""
  }

  // Add pinyin names and category
  const factoriesWithPinyin: FactoryItem[] = factories.map((f: FactoryItem) => ({
    ...f,
    category: classifyFactory(f.biz_scope || ""),
    pinyin_name: pinyin(f.company_name, { toneType: "none", type: "array" })
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
      .replace(/ You Xian Gong Si$/i, "")
      .replace(/ Co Ltd$/i, "")
      .trim(),
  }))

  return (
    <>
      <Navbar />
      <FactoryDirectory factories={factoriesWithPinyin} provinces={provinces} categories={categories} />
    </>
  )
}
