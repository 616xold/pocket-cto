import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { OperatorReadinessCard } from "../../components/operator-readiness-card";
import { getOperatorReadiness } from "../../lib/api";

type OperatorReadinessPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function OperatorReadinessPage(
  props: OperatorReadinessPageProps,
) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const readiness = await getOperatorReadiness(companyKey);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">F6J operator readiness</p>
        <h1>Operator readiness for {companyKey}.</h1>
        <p className="lede">
          Internal attention posture from latest persisted monitor results and
          deterministic close/control checklist evidence. This is a read-only
          readiness surface, not delivery, notification provider setup, outbox
          send, approval, monitor rerun, mission creation, runtime-Codex
          drafting, or autonomous finance action.
        </p>
        <div className="button-row">
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <OperatorReadinessCard readiness={readiness} />
    </main>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
