import {
  GitHubIssueIntakeListViewSchema,
  GitHubIssueMissionCreateResultSchema,
  type GitHubIssueMissionCreateOutcome,
  type MissionRecord,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { MissionService } from "../missions/service";
import {
  GitHubIssueIntakeNonIssueDeliveryError,
  GitHubWebhookDeliveryNotFoundError,
} from "./errors";
import type {
  GitHubIssueIntakeRepository,
  PersistedGitHubIssueMissionBinding,
} from "./issue-intake-repository";
import type {
  GitHubWebhookIssueCommentPayload,
  GitHubWebhookIssuesPayload,
  PersistedGitHubWebhookDelivery,
} from "./webhook-types";
import {
  GitHubWebhookIssueCommentPayloadSchema,
  GitHubWebhookIssuesPayloadSchema,
} from "./webhook-types";
import type { GitHubWebhookRepository } from "./webhook-repository";

type ParsedIssueEnvelope = {
  deliveryId: string;
  issueBody: string | null;
  issueId: string;
  issueNodeId: string | null;
  issueNumber: number;
  issueState: string;
  issueTitle: string;
  receivedAt: string;
  repoFullName: string;
  senderLogin: string | null;
  sourceRef: string;
  commentCount: number | null;
};

export class GitHubIssueIntakeService {
  constructor(
    private readonly input: {
      bindingRepository: GitHubIssueIntakeRepository;
      missionRepository: MissionRepository;
      missionService: Pick<MissionService, "createFromGitHubIssue">;
      webhookRepository: GitHubWebhookRepository;
    },
  ) {}

  async listIssues() {
    const [issueDeliveries, commentDeliveries] = await Promise.all([
      this.input.webhookRepository.listDeliveries({
        eventName: "issues",
        handledAs: "issue_envelope_recorded",
        limit: 200,
      }),
      this.input.webhookRepository.listDeliveries({
        eventName: "issue_comment",
        handledAs: "issue_comment_envelope_recorded",
        limit: 200,
      }),
    ]);
    const latestIssues = readLatestIssueEnvelopes(issueDeliveries);
    const bindings = await this.input.bindingRepository.listBindingsByIssueIds(
      latestIssues.map((issue) => issue.issueId),
    );
    const bindingByIssueId = new Map(
      bindings.map((binding) => [binding.issueId, binding]),
    );
    const commentActivityByIssueId = summarizeCommentActivity(commentDeliveries);

    const issues = await Promise.all(
      latestIssues.map(async (issue) => {
        const binding = bindingByIssueId.get(issue.issueId) ?? null;
        const mission =
          binding?.missionId != null
            ? await this.input.missionRepository.getMissionById(
                binding.missionId,
              )
            : null;
        const commentActivity =
          commentActivityByIssueId.get(issue.issueId) ?? null;

        return {
          deliveryId: issue.deliveryId,
          repoFullName: issue.repoFullName,
          issueNumber: issue.issueNumber,
          issueTitle: issue.issueTitle,
          issueState: issue.issueState,
          senderLogin: issue.senderLogin,
          sourceRef: issue.sourceRef,
          receivedAt: issue.receivedAt,
          commentCount: issue.commentCount,
          hasCommentActivity:
            (commentActivity?.deliveryCount ?? 0) > 0 ||
            (issue.commentCount ?? 0) > 0,
          isBound: binding?.missionId != null,
          boundMissionId: binding?.missionId ?? null,
          boundMissionStatus: mission?.status ?? null,
        };
      }),
    );

    return GitHubIssueIntakeListViewSchema.parse({
      issues,
    });
  }

  async createMissionFromDelivery(deliveryId: string) {
    const delivery = await this.input.webhookRepository.getDeliveryByDeliveryId(
      deliveryId,
    );

    if (!delivery) {
      throw new GitHubWebhookDeliveryNotFoundError(deliveryId);
    }

    const issue = parseIssueEnvelopeForMissionCreation(delivery);

    return this.input.bindingRepository.transaction(async (session) => {
      const reservation =
        await this.input.bindingRepository.createBindingReservationIfAbsent(
          {
            repoFullName: issue.repoFullName,
            issueNumber: issue.issueNumber,
            issueId: issue.issueId,
            issueNodeId: issue.issueNodeId,
            latestSourceDeliveryId: issue.deliveryId,
          },
          session,
        );

      if (reservation.binding.missionId) {
        const binding =
          reservation.binding.latestSourceDeliveryId === issue.deliveryId
            ? reservation.binding
            : await this.input.bindingRepository.updateBindingLatestSourceDelivery(
                {
                  bindingId: reservation.binding.id,
                  latestSourceDeliveryId: issue.deliveryId,
                },
                session,
              );
        const missionId = binding.missionId;
        if (!missionId) {
          throw new Error(
            `GitHub issue binding ${binding.id} is missing missionId after an already-bound lookup`,
          );
        }
        const mission = await this.requireMission(missionId, session);

        return buildCreateMissionResult(
          "already_bound",
          binding,
          issue.sourceRef,
          mission,
        );
      }

      const created = await this.input.missionService.createFromGitHubIssue(
        {
          issueBody: issue.issueBody,
          issueTitle: issue.issueTitle,
          primaryRepo: issue.repoFullName,
          requestedBy: issue.senderLogin ?? "github",
          sourceRef: issue.sourceRef,
        },
        {
          session,
        },
      );
      const binding = await this.input.bindingRepository.attachMissionToBinding(
        {
          bindingId: reservation.binding.id,
          latestSourceDeliveryId: issue.deliveryId,
          missionId: created.mission.id,
        },
        session,
      );

      return buildCreateMissionResult(
        "created",
        binding,
        issue.sourceRef,
        created.mission,
      );
    });
  }

  private async requireMission(
    missionId: string,
    session: PersistenceSession,
  ) {
    const mission = await this.input.missionRepository.getMissionById(
      missionId,
      session,
    );

    if (!mission) {
      throw new Error(`Mission ${missionId} was not found for issue binding`);
    }

    return mission;
  }
}

function parseIssueEnvelopeForMissionCreation(
  delivery: PersistedGitHubWebhookDelivery,
): ParsedIssueEnvelope {
  if (
    delivery.eventName !== "issues" ||
    delivery.outcome !== "issue_envelope_recorded"
  ) {
    throw new GitHubIssueIntakeNonIssueDeliveryError(
      delivery.deliveryId,
      delivery.eventName,
      delivery.outcome,
    );
  }

  const parsed = GitHubWebhookIssuesPayloadSchema.parse(delivery.payload);

  return toParsedIssueEnvelope(delivery, parsed);
}

function readLatestIssueEnvelopes(deliveries: PersistedGitHubWebhookDelivery[]) {
  const latestByIssueId = new Map<string, ParsedIssueEnvelope>();

  for (const delivery of deliveries) {
    if (
      delivery.eventName !== "issues" ||
      delivery.outcome !== "issue_envelope_recorded"
    ) {
      continue;
    }

    const parsed = GitHubWebhookIssuesPayloadSchema.safeParse(delivery.payload);
    if (!parsed.success) {
      continue;
    }

    const issue = toParsedIssueEnvelope(delivery, parsed.data);
    const existing = latestByIssueId.get(issue.issueId);

    if (
      !existing ||
      issue.receivedAt.localeCompare(existing.receivedAt) > 0 ||
      (issue.receivedAt === existing.receivedAt &&
        issue.deliveryId.localeCompare(existing.deliveryId) > 0)
    ) {
      latestByIssueId.set(issue.issueId, issue);
    }
  }

  return [...latestByIssueId.values()].sort((left, right) => {
    return (
      right.receivedAt.localeCompare(left.receivedAt) ||
      right.deliveryId.localeCompare(left.deliveryId)
    );
  });
}

function summarizeCommentActivity(deliveries: PersistedGitHubWebhookDelivery[]) {
  const deliveryCountByIssueId = new Map<
    string,
    {
      deliveryCount: number;
    }
  >();

  for (const delivery of deliveries) {
    if (
      delivery.eventName !== "issue_comment" ||
      delivery.outcome !== "issue_comment_envelope_recorded"
    ) {
      continue;
    }

    const parsed = GitHubWebhookIssueCommentPayloadSchema.safeParse(
      delivery.payload,
    );
    if (!parsed.success) {
      continue;
    }

    const issueId = readCommentIssueId(parsed.data);
    const existing = deliveryCountByIssueId.get(issueId) ?? {
      deliveryCount: 0,
    };

    deliveryCountByIssueId.set(issueId, {
      deliveryCount: existing.deliveryCount + 1,
    });
  }

  return deliveryCountByIssueId;
}

function toParsedIssueEnvelope(
  delivery: PersistedGitHubWebhookDelivery,
  payload: GitHubWebhookIssuesPayload,
): ParsedIssueEnvelope {
  return {
    deliveryId: delivery.deliveryId,
    issueBody: payload.issue.body ?? null,
    issueId: payload.issue.id,
    issueNodeId: payload.issue.node_id ?? null,
    issueNumber: payload.issue.number,
    issueState: payload.issue.state,
    issueTitle: payload.issue.title,
    receivedAt: delivery.createdAt,
    repoFullName: payload.repository.full_name,
    senderLogin: payload.sender?.login ?? null,
    sourceRef:
      payload.issue.html_url ??
      `https://github.com/${payload.repository.full_name}/issues/${payload.issue.number}`,
    commentCount: payload.issue.comments ?? null,
  };
}

function readCommentIssueId(payload: GitHubWebhookIssueCommentPayload) {
  return payload.issue.id;
}

function buildCreateMissionResult(
  outcome: GitHubIssueMissionCreateOutcome,
  binding: PersistedGitHubIssueMissionBinding,
  sourceRef: string,
  mission: MissionRecord,
) {
  return GitHubIssueMissionCreateResultSchema.parse({
    outcome,
    mission,
    binding: {
      issueId: binding.issueId,
      issueNodeId: binding.issueNodeId,
      latestSourceDeliveryId: binding.latestSourceDeliveryId,
      missionId: binding.missionId,
      repoFullName: binding.repoFullName,
      issueNumber: binding.issueNumber,
      sourceRef,
    },
  });
}
