import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { CloseControlAcknowledgementCard } from "../../../components/close-control-acknowledgement-card";
import { getCloseControlAcknowledgementReadiness } from "../../../lib/api";

type CloseControlAcknowledgementPageProps = {
  searchParams?: Promise<{ companyKey?: string }>;
};

export default async function CloseControlAcknowledgementPage(
  props: CloseControlAcknowledgementPageProps,
) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const companyKey = normalizeCompanyKey(searchParams.companyKey);
  const readiness = await getCloseControlAcknowledgementReadiness(companyKey);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">F6K acknowledgement readiness</p>
        <h1>Close/control acknowledgement readiness for {companyKey}.</h1>
        <p className="lede">
          Internal reviewed-posture readiness from deterministic close/control
          checklist posture and operator-readiness posture. This page does not
          create approval, close-complete, sign-off, attestation, certification,
          delivery, outbox send, or finance-action records.
        </p>
        <div className="button-row">
          <Link href={"/" as Route} className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <CloseControlAcknowledgementCard readiness={readiness} />
    </main>
  );
}

function normalizeCompanyKey(companyKey: string | undefined) {
  const normalized = companyKey?.trim();
  return normalized && normalized.length > 0 ? normalized : "acme";
}
