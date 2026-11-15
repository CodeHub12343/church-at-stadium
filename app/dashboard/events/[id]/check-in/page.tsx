'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import type { MockEvent } from '@/lib/mockData';

interface Scan {
  reference: string;
  name: string;
  party: number;
  status: 'in' | 'duplicate' | 'denied' | 'pending';
  gate: string;
  time: string;
  church?: string;
  note?: string;
}

function formatAgo(input: string | Date | undefined) {
  if (!input) return '';
  const d = new Date(input);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return d.toLocaleDateString();
}

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  align-items: flex-start;
  @media (max-width: ${tokens.bp.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Scanner = styled.div`
  background: linear-gradient(145deg, #0b1428, ${tokens.color.primary} 65%, #1b2e55);
  border-radius: 18px;
  padding: 28px;
  color: #fff;
`;

const Viewport = styled.div`
  background: rgba(0, 0, 0, 0.35);
  border: 2px dashed rgba(198, 164, 91, 0.55);
  border-radius: 14px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  position: relative;
  overflow: hidden;
`;

const ScanLine = styled.div`
  position: absolute;
  left: 10%;
  right: 10%;
  height: 2px;
  background: ${tokens.color.secondary};
  box-shadow: 0 0 20px ${tokens.color.secondary};
  animation: scan 1.6s ease-in-out infinite alternate;
  @keyframes scan {
    from { top: 20%; }
    to { top: 80%; }
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const PickerField = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 10px 14px;
  .lbl { font-size: 10.5px; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
  .val { font-size: 14px; font-weight: 700; margin-top: 2px; color: #fff; }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 16px;
`;

const Stat = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 12px 14px;
  .l { color: rgba(255, 255, 255, 0.55); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
  .v { font-family: ${tokens.font.display}; font-weight: 800; font-size: 22px; color: ${tokens.color.secondary}; margin-top: 4px; }
  .s { color: rgba(255, 255, 255, 0.5); font-size: 11px; }
`;

const Panel = styled.section`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 16px;
  h2 {
    font-family: ${tokens.font.display};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${tokens.color.textSecondary};
    margin-bottom: 14px;
  }
`;

const ScanRow = styled.div<{ $tone: BadgeTone }>`
  padding: 14px 20px;
  border-top: 1px solid ${tokens.color.surface2};
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 14px;
  align-items: center;
  background: ${(p) =>
    p.$tone === 'success'
      ? 'transparent'
      : p.$tone === 'warning'
      ? tokens.color.warningSurface
      : p.$tone === 'error'
      ? tokens.color.errorBg
      : 'transparent'};
  &:first-of-type {
    border-top: none;
  }
`;

const StatusDot = styled.div<{ $tone: BadgeTone }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  background: ${(p) =>
    p.$tone === 'success'
      ? tokens.color.success
      : p.$tone === 'warning'
      ? tokens.color.warning
      : p.$tone === 'error'
      ? tokens.color.error
      : tokens.color.textSecondary};
`;

const QueueBar = styled.div`
  height: 10px;
  border-radius: 999px;
  background: ${tokens.color.surface2};
  overflow: hidden;
  position: relative;
  margin-top: 10px;
`;

const QueueFill = styled.div<{ $pct: number; $bg: string }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) => p.$bg};
`;

const scanTone = (s: Scan['status']): BadgeTone =>
  s === 'in' ? 'success' : s === 'duplicate' ? 'warning' : s === 'denied' ? 'error' : 'info';

const scanLabel = (s: Scan['status']) =>
  s === 'in' ? 'Checked in' : s === 'duplicate' ? 'Duplicate' : s === 'denied' ? 'Denied' : 'Pending';

export default function CheckInPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [eventStatus, setEventStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [gate, setGate] = useState('Gate B');
  const [scans, setScans] = useState<Scan[]>([]);
  const [checkedIn, setCheckedIn] = useState(0);
  const [flagged, setFlagged] = useState(0);
  const [manualRef, setManualRef] = useState('');
  const [busy, setBusy] = useState(false);
  const [stewardName, setStewardName] = useState<string>('—');

  async function refresh() {
    const [evRes, regRes, meRes] = await Promise.all([
      fetch(`/api/events/${encodeURIComponent(params.id)}`),
      fetch(`/api/events/${encodeURIComponent(params.id)}/registrations?limit=50`),
      fetch('/api/me/profile'),
    ]);
    if (meRes.ok) {
      const me = await meRes.json();
      const u = me.user || me;
      const display = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || '—';
      setStewardName(display);
    }
    if (evRes.status === 404) { setEventStatus('missing'); return; }
    const ev = await evRes.json();
    setEvent(ev.event);
    setEventStatus('ready');
    if (regRes.ok) {
      const d = await regRes.json();
      setCheckedIn(d.checkedIn ?? 0);
      setFlagged(d.flagged ?? 0);
      setScans(
        (d.recent ?? []).map((r: {
          reference: string; name: string; partySize: number; churchName?: string;
          status: Scan['status']; gate?: string; note?: string; createdAt?: string; checkedInAt?: string;
        }) => ({
          reference: r.reference,
          name: r.name,
          party: r.partySize,
          status: r.status,
          gate: r.gate || gate,
          time: formatAgo(r.checkedInAt || r.createdAt),
          church: r.churchName,
          note: r.note,
        }))
      );
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params.id]);

  if (eventStatus === 'loading') {
    return <div style={{ padding: 40, color: tokens.color.textSecondary }}>Loading event…</div>;
  }
  if (eventStatus === 'missing' || !event) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Event not found</h1>
        <Link href="/dashboard/events" style={{ color: tokens.color.primary, marginTop: 8, display: 'inline-block' }}>Back to events</Link>
      </div>
    );
  }

  const totalRegistered = parseInt(event.expected.replace(/,/g, '')) || 1;
  const pct = Math.min(100, Math.round((checkedIn / totalRegistered) * 100));

  async function doScan(reference: string) {
    if (!reference) return;
    setBusy(true);
    await fetch(`/api/events/${encodeURIComponent(params.id)}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, gate }),
    });
    setBusy(false);
    setManualRef('');
    await refresh();
  }

  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const quickScan = () => {
    setScanNotice(null);
    const pending = scans.find((s) => s.status === 'pending');
    if (pending) doScan(pending.reference);
    else setScanNotice('No pending registrations — use Manual entry to scan a specific reference.');
  };

  return (
    <>
      <div style={{ marginBottom: 14, color: tokens.color.textSecondary, fontSize: 12.5 }}>
        <Link href={`/dashboard/events/${event.slug}`}>← Back to event</Link>
      </div>

      <Head>
        <div>
          <Eyebrow>Live check-in</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{event.title}</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {event.dateLabel} · {event.venue} · {event.city}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Badge $tone="success" $withDot>Scanner online</Badge>
            <Badge $tone="info">{gate}</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button $variant="secondary">Switch gate</Button>
          <Button $variant="secondary">Manual entry</Button>
          <Button>End shift</Button>
        </div>
      </Head>

      <Grid>
        <div>
          <Scanner>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ color: tokens.color.secondary, fontSize: 11, letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
                  Scan QR / NFC pass
                </div>
                <div style={{ fontFamily: tokens.font.display, fontWeight: 800, fontSize: 22, marginTop: 4 }}>
                  Point the camera at the pass
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Auto-advance after each scan</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Viewport>
                <ScanLine />
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <div style={{ fontSize: 44 }}>📷</div>
                  <div style={{ marginTop: 10 }}>Camera ready</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    Steadily hold the pass 20cm from the lens.
                  </div>
                </div>
              </Viewport>
            </div>

            <Row>
              <PickerField>
                <div className="lbl">Gate</div>
                <div className="val">{gate}</div>
              </PickerField>
              <PickerField>
                <div className="lbl">Scanner · Steward</div>
                <div className="val">{stewardName}</div>
              </PickerField>
            </Row>

            <Stats>
              <Stat>
                <div className="l">Checked in</div>
                <div className="v">{checkedIn.toLocaleString()}</div>
                <div className="s">of {event.expected} expected</div>
              </Stat>
              <Stat>
                <div className="l">Fill rate</div>
                <div className="v">{pct}%</div>
                <div className="s">Doors 30 min in</div>
              </Stat>
              <Stat>
                <div className="l">Flagged</div>
                <div className="v">{flagged}</div>
                <div className="s">Needs steward review</div>
              </Stat>
            </Stats>

            <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value.toUpperCase())}
                placeholder="CATS-XXX-NNNNN"
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  borderRadius: 10,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 13.5,
                  outline: 'none',
                }}
              />
              <Button $variant="gold" onClick={() => doScan(manualRef)} disabled={busy || !manualRef}>
                {busy ? 'Scanning…' : 'Check in'}
              </Button>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <Button $variant="secondary" $block onClick={quickScan}>
                Scan next pending
              </Button>
              <Button $variant="secondary" $block onClick={refresh}>
                Refresh
              </Button>
            </div>
            {scanNotice && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, color: 'rgba(255,255,255,0.85)', fontSize: 12.5 }}>
                {scanNotice}
              </div>
            )}
          </Scanner>

          <Panel style={{ marginTop: 18 }}>
            <h2>Recent scans</h2>
            {scans.map((s, i) => (
              <ScanRow key={`${s.reference}-${i}`} $tone={scanTone(s.status)}>
                <StatusDot $tone={scanTone(s.status)}>
                  {s.status === 'in' ? '✓' : s.status === 'duplicate' ? '!' : s.status === 'denied' ? '✕' : '…'}
                </StatusDot>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                    <Badge $tone={scanTone(s.status)}>{scanLabel(s.status)}</Badge>
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {s.reference} · Party of {s.party} · {s.gate} · {s.time}
                    {s.church && <> · {s.church}</>}
                  </div>
                  {s.note && (
                    <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                      {s.note}
                    </div>
                  )}
                </div>
                <Button $variant="ghost" $size="sm">Open →</Button>
              </ScanRow>
            ))}
          </Panel>
        </div>

        <div>
          <Panel>
            <h2>Capacity by gate</h2>
            <p style={{ fontSize: 13, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
              Per-gate breakdown isn’t tracked yet — the API records scans against the event as a whole.
              Once gate-level counters are added, totals and capacity bars for each lane will appear here.
            </p>
          </Panel>

          <Panel>
            <h2>Runbook · Denials</h2>
            <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.6, color: tokens.color.textSecondary, margin: 0 }}>
              <li>Keep the guest calm. Step aside with them.</li>
              <li>Open the referenced ticket in the scan log.</li>
              <li>Call steward lead on channel 2.</li>
              <li>If refunded, direct them to the main ticket desk.</li>
              <li>Log the denial with a reason code.</li>
            </ol>
          </Panel>

          <Panel>
            <h2>Shift team</h2>
            <p style={{ fontSize: 13, color: tokens.color.textSecondary, lineHeight: 1.6 }}>
              Shift-roster assignments aren’t wired up yet. When the volunteer-assignment flow lands,
              the stewards on the current shift will appear here with their lane and status.
            </p>
          </Panel>
        </div>
      </Grid>
    </>
  );
}
