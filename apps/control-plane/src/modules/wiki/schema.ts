import {
  CfoWikiBindSourceRequestSchema,
  CfoWikiCompanySourceListViewSchema,
  CfoWikiCompanySummarySchema,
  CfoWikiCompileRequestSchema,
  CfoWikiCompileResultSchema,
  CfoWikiCreateFiledPageRequestSchema,
  CfoWikiExportDetailViewSchema,
  CfoWikiExportListViewSchema,
  CfoWikiExportRequestSchema,
  CfoWikiFiledPageListViewSchema,
  CfoWikiLintRequestSchema,
  CfoWikiLintSummarySchema,
  CfoWikiPageKeySchema,
  CfoWikiPageViewSchema,
  CfoWikiSourceBindingViewSchema,
  FinanceCompanyKeySchema,
} from "@pocket-cto/domain";
import { z } from "zod";

export const cfoWikiCompanyKeyParamsSchema = z.object({
  companyKey: FinanceCompanyKeySchema,
});

export const cfoWikiCompileBodySchema = CfoWikiCompileRequestSchema;
export const cfoWikiLintBodySchema = CfoWikiLintRequestSchema;
export const cfoWikiExportBodySchema = CfoWikiExportRequestSchema;
export const cfoWikiBindSourceBodySchema = CfoWikiBindSourceRequestSchema;
export const cfoWikiCreateFiledPageBodySchema = CfoWikiCreateFiledPageRequestSchema;

export const cfoWikiSourceParamsSchema = cfoWikiCompanyKeyParamsSchema.extend({
  sourceId: z.string().uuid(),
});

export const cfoWikiWildcardPageParamsSchema = cfoWikiCompanyKeyParamsSchema.extend({
  "*": z.string().min(1),
});

export const cfoWikiExportRunParamsSchema = cfoWikiCompanyKeyParamsSchema.extend({
  exportRunId: z.string().uuid(),
});

export function parseWildcardPageKey(rawPageKey: string) {
  return CfoWikiPageKeySchema.parse(safelyDecodePageKey(rawPageKey));
}

function safelyDecodePageKey(rawPageKey: string) {
  try {
    return decodeURIComponent(rawPageKey);
  } catch {
    return rawPageKey;
  }
}

export {
  CfoWikiCompanySourceListViewSchema,
  CfoWikiCompanySummarySchema,
  CfoWikiCompileResultSchema,
  CfoWikiExportDetailViewSchema,
  CfoWikiExportListViewSchema,
  CfoWikiFiledPageListViewSchema,
  CfoWikiLintSummarySchema,
  CfoWikiPageViewSchema,
  CfoWikiSourceBindingViewSchema,
};
