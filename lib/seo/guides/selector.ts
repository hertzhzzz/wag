import { z } from "zod";
import { clusterIdSchema } from "../clusterSchema";
import { deepFreeze } from "./deterministic";
import type {
  GuidesDiscoverySectionViewModel,
  GuidesSelectionResult,
} from "./types";

const filterStateSchema = z
  .object({
    key: z.literal("cluster"),
    value: z.union([z.literal("all"), clusterIdSchema]),
  })
  .strict();

export function selectGuidesArticles(
  guides: GuidesDiscoverySectionViewModel,
  state: unknown,
): GuidesSelectionResult {
  const parsed = filterStateSchema.safeParse(state);
  if (!parsed.success) {
    return deepFreeze({
      status: "blocked",
      code: "state-invalid",
      message:
        "Guides filter state must contain exactly the governed cluster key and value.",
    });
  }

  const selectedItems =
    parsed.data.value === "all"
      ? guides.articles.items
      : guides.articles.items.filter(
          (article) => article.clusterId === parsed.data.value,
        );
  const items = selectedItems.map((article) => ({ ...article }));
  const topic =
    parsed.data.value === "all"
      ? "all topics"
      : (guides.filters.options.find(
          (option) => option.value === parsed.data.value,
        )?.label ?? parsed.data.value);

  return deepFreeze({
    status: "ready",
    state: parsed.data,
    items,
    count: items.length,
    announcement: `${items.length} guide${items.length === 1 ? "" : "s"} available for ${topic}.`,
    controlledElementId: guides.articles.elementId,
    statusElementId: guides.filters.statusElementId,
  });
}
