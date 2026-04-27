import type { MissionType, MonitorKind, SourceKind } from "@pocket-cto/domain";

export type StackPack = {
  id: string;
  name: string;
  description: string;
  supportedMissionTypes: MissionType[];
  defaultRepos: string[];
  twinExtractors: string[];
  benchmarkMissionIds: string[];
  promptFragments: Partial<Record<MissionType, string>>;
};

export type PocketCfoDemoStackPackSourceFile = {
  role:
    | "bank_cash"
    | "receivables_aging"
    | "payables_aging"
    | "policy_thresholds";
  fixturePath: string;
  sourceKind: SourceKind;
  mediaType: string;
  expectedExtractorKey?: string;
  documentRole?: "policy_document";
};

export type PocketCfoDemoStackPack = {
  id: string;
  displayName: string;
  purpose: string;
  fixtureDirectory: string;
  sourceFiles: PocketCfoDemoStackPackSourceFile[];
  monitorFamiliesCovered: MonitorKind[];
  expectedOutputManifestPath: string;
  cashAlertInvestigationHandoffExpected: boolean;
  limitations: string[];
  runtimeAndDeliveryBoundary: string;
};
