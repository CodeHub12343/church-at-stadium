'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Eyebrow } from '@/components/ui/Card';

type ReportApi = {
  id: string;
  title: string;
  type: string;
  status: string;
  periodStart?: string;
  periodEnd?: string;
  data?: Record<string, unknown>;
  createdAt: string;
};

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 22px 24px;
  h3 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 12px;
  }
`;

const DL = styled.dl`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px 20px;
  margin: 0;
  dt {
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    font-weight: 700;
    align-self: center;
  }
  dd {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminReportDetailPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<ReportApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/reports/${params.id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setError('Report not found');
          return null;
        }
        if (r.status === 403) {
          setError('Admin access required');
          return null;
        }
        if (!r.ok) {
          setError('Failed to load report');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.report) setReport(d.report as ReportApi);
      })
      .catch(() => setError('Failed to load report'));
  }, [params.id]);

  if (error) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/reports">← Back to reports</Link>
        </div>
        <Panel>
          <h3>Unavailable</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>{error}</p>
        </Panel>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
          <Link href="/admin/reports">← Back to reports</Link>
        </div>
        <Panel>
          <h3>Loading…</h3>
          <p style={{ fontSize: 14, color: tokens.color.textSecondary }}>Fetching report.</p>
        </Panel>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href="/admin/reports">← Back to reports</Link>
      </div>

      <div style={{ marginBottom: 22 }}>
        <Eyebrow>Report</Eyebrow>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{report.title}</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Badge $tone="neutral">{report.type}</Badge>
          <Badge $tone="info">{report.status}</Badge>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Panel>
          <h3>Details</h3>
          <DL>
            <dt>Type</dt>
            <dd>{report.type}</dd>
            <dt>Status</dt>
            <dd>{report.status}</dd>
            <dt>Period start</dt>
            <dd>{formatDate(report.periodStart)}</dd>
            <dt>Period end</dt>
            <dd>{formatDate(report.periodEnd)}</dd>
            <dt>Created</dt>
            <dd>{formatDate(report.createdAt)}</dd>
          </DL>
        </Panel>

        <Panel>
          <h3>Data snapshot</h3>
          {report.data && Object.keys(report.data).length > 0 ? (
            <pre
              style={{
                fontFamily: 'ui-monospace, SF Mono, Consolas, monospace',
                fontSize: 12.5,
                lineHeight: 1.6,
                background: tokens.color.surface,
                border: `1px solid ${tokens.color.border}`,
                borderRadius: 10,
                padding: 16,
                overflow: 'auto',
                margin: 0,
              }}
            >
              {JSON.stringify(report.data, null, 2)}
            </pre>
          ) : (
            <p style={{ fontSize: 13, color: tokens.color.textSecondary }}>
              This report doesn't contain structured data.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
