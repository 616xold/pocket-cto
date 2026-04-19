import type {
  ArtifactRecord,
  BoardPacketArtifactMetadata,
  CfoWikiExportRunRecord,
  CfoWikiPageRecord,
  EvidenceAppendixArtifactMetadata,
  FinanceDiscoveryAnswerArtifactMetadata,
  FinanceMemoArtifactMetadata,
  LenderUpdateArtifactMetadata,
  MissionRecord,
  ProofBundleManifest,
  ReportingPublicationView,
  ReportingMissionView,
} from "@pocket-cto/domain";

export type DiscoveryReportingSourceBundle = {
  discoveryAnswer: FinanceDiscoveryAnswerArtifactMetadata;
  discoveryAnswerArtifactId: string;
  sourceDiscoveryMission: MissionRecord;
  sourceProofBundle: ProofBundleManifest | null;
  sourceProofBundleArtifactId: string | null;
};

export type SourceReportingBundle = {
  sourceEvidenceAppendixArtifactId: string;
  sourceFinanceMemoArtifactId: string;
  sourceProofBundle: ProofBundleManifest;
  sourceReportingMission: MissionRecord;
  sourceReportingView: ReportingMissionView & {
    evidenceAppendix: NonNullable<ReportingMissionView["evidenceAppendix"]>;
    financeMemo: NonNullable<ReportingMissionView["financeMemo"]>;
  };
};

export type CompiledFinanceMemoArtifacts = {
  reportKind: "finance_memo";
  evidenceAppendix: EvidenceAppendixArtifactMetadata;
  financeMemo: FinanceMemoArtifactMetadata;
};

export type CompiledBoardPacketArtifacts = {
  boardPacket: BoardPacketArtifactMetadata;
  reportKind: "board_packet";
};

export type CompiledLenderUpdateArtifacts = {
  lenderUpdate: LenderUpdateArtifactMetadata;
  reportKind: "lender_update";
};

export type CompiledReportingArtifacts =
  | CompiledFinanceMemoArtifacts
  | CompiledBoardPacketArtifacts
  | CompiledLenderUpdateArtifacts;

export type ReportingMissionContext = {
  artifacts: ArtifactRecord[];
  mission: MissionRecord;
  proofBundle: ProofBundleManifest;
};

export type ReportingPublicationFacts = {
  filedEvidenceAppendix: CfoWikiPageRecord | null;
  filedMemo: CfoWikiPageRecord | null;
  latestMarkdownExport: CfoWikiExportRunRecord | null;
  publication: ReportingPublicationView;
};
