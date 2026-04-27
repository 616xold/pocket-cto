import React from "react";
import Link from "next/link";
import type { Route } from "next";
import type { MonitorLatestResult } from "@pocket-cto/domain";
import { MonitoringAlertCard } from "../../components/monitoring-alert-card";
import {
  getLatestCashPostureMonitorResult,
  getLatestCollectionsPressureMonitorResult,
  getLatestPayablesPressureMonitorResult,
} from "../../lib/api";
import { getWebOperatorIdentity } from "../../lib/operator-identity";

type MonitoringPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function MonitoringPage(props: MonitoringPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const operatorIdentity = getWebOperatorIdentity();
  const [cashLatest, collectionsLatest, payablesLatest] = await Promise.all([
    getLatestCashPostureMonitorResult(companyKey),
    getLatestCollectionsPressureMonitorResult(companyKey),
    getLatestPayablesPressureMonitorResult(companyKey),
  ]);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">F6 monitoring</p>
        <h1>Monitor alert posture for {companyKey}.</h1>
        <p className="lede">
          Latest persisted monitor results from stored Finance Twin state.
        </p>
        <div className="button-row">
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <MonitorPostureSection
        companyKey={companyKey}
        latest={cashLatest}
        monitorKind="cash_posture"
        monitorLabel="Cash posture monitor"
        notRunCopy="No persisted F6A cash_posture monitor result is recorded for this company yet."
        operatorIdentity={operatorIdentity}
      />

      <MonitorPostureSection
        companyKey={companyKey}
        latest={collectionsLatest}
        monitorKind="collections_pressure"
        monitorLabel="Collections pressure monitor"
        notRunCopy="No persisted F6C collections_pressure monitor result is recorded for this company yet."
        operatorIdentity={operatorIdentity}
      />

      <MonitorPostureSection
        companyKey={companyKey}
        latest={payablesLatest}
        monitorKind="payables_pressure"
        monitorLabel="Payables pressure monitor"
        notRunCopy="No persisted F6D payables_pressure monitor result is recorded for this company yet."
        operatorIdentity={operatorIdentity}
      />
    </main>
  );
}

function MonitorPostureSection(input: {
  companyKey: string;
  latest: MonitorLatestResult | null;
  monitorKind: MonitorLatestResult["monitorKind"];
  monitorLabel: string;
  notRunCopy: string;
  operatorIdentity: string;
}) {
  const monitorResult = input.latest?.monitorResult ?? null;

  if (input.latest?.alertCard && monitorResult?.status === "alert") {
    return (
      <MonitoringAlertCard
        alertCard={input.latest.alertCard}
        monitorResultId={monitorResult.id}
        requestedBy={input.operatorIdentity}
      />
    );
  }

  return (
    <section className="card status-card">
      <div className="section-head">
        <div>
          <p className="kicker">{input.monitorLabel}</p>
          <h2>{input.latest?.companyKey ?? input.companyKey}</h2>
        </div>
      </div>
      <dl className="meta-grid">
        <div>
          <dt>Monitor kind</dt>
          <dd>{input.monitorKind}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{monitorResult?.status ?? "not_run"}</dd>
        </div>
        <div>
          <dt>Severity</dt>
          <dd>{monitorResult?.severity ?? "none"}</dd>
        </div>
        <div>
          <dt>Proof posture</dt>
          <dd>{monitorResult?.proofBundlePosture.state ?? "not_recorded"}</dd>
        </div>
      </dl>
      <p className="muted">
        {monitorResult?.deterministicSeverityRationale ?? input.notRunCopy}
      </p>
    </section>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
