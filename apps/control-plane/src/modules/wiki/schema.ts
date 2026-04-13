import {
  CfoWikiCompanySummarySchema,
  CfoWikiCompileRequestSchema,
  CfoWikiCompileResultSchema,
  CfoWikiPageKeySchema,
  CfoWikiPageViewSchema,
  FinanceCompanyKeySchema,
} from "@pocket-cto/domain";
import { z } from "zod";

export const cfoWikiCompanyKeyParamsSchema = z.object({
  companyKey: FinanceCompanyKeySchema,
});

export const cfoWikiCompileBodySchema = CfoWikiCompileRequestSchema;

export const cfoWikiWildcardPageParamsSchema = cfoWikiCompanyKeyParamsSchema.extend({
  "*": z.string().min(1),
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
  CfoWikiCompanySummarySchema,
  CfoWikiCompileResultSchema,
  CfoWikiPageViewSchema,
};
