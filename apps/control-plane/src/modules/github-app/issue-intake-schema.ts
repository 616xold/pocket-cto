import { z } from "zod";

export const GitHubIssueIntakeDeliveryParamsSchema = z.object({
  deliveryId: z.string().min(1),
});

export function parseGitHubIssueIntakeDeliveryParams(params: unknown) {
  return GitHubIssueIntakeDeliveryParamsSchema.parse(params);
}
