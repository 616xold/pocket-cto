import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { CloseControlChecklistCard } from "../../components/close-control-checklist-card";
import { getCloseControlChecklist } from "../../lib/api";

type CloseControlPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function CloseControlPage(props: CloseControlPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const checklist = await getCloseControlChecklist(companyKey);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">F6H close/control</p>
        <h1>Close/control checklist for {companyKey}.</h1>
        <p className="lede">
          Deterministic review posture from stored Finance Twin sources, CFO
          Wiki policy sources, and latest persisted monitor context. This is a
          review-only checklist, not close completion, sign-off, attestation,
          certification, assurance, legal opinion, audit opinion, approval, or
          finance action.
        </p>
        <div className="button-row">
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <CloseControlChecklistCard checklist={checklist} />
    </main>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
