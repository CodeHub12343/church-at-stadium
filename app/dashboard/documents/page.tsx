'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '@/lib/tokens';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Card';
import { submitJson, required } from '@/lib/form';

type Doc = {
  id: string; name: string; type: 'PDF' | 'DOC' | 'XLS' | 'PNG' | 'JPG' | 'OTHER';
  sizeKB: number; pages?: number; access: 'Team' | 'Restricted' | 'Public';
  eventSlug?: string; folderName?: string; updatedAt: string;
};

const typeColor: Record<Doc['type'], string> = {
  PDF: '#A42929', DOC: '#1F4F99', XLS: '#0E7A4C', PNG: '#1F4F99', JPG: '#1F4F99', OTHER: '#667085',
};

function fmtSize(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 2) return 'Yesterday';
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 14px;
  overflow: hidden;
  th {
    text-align: left;
    font-size: 11px;
    color: ${tokens.color.textSecondary};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 1px solid ${tokens.color.border};
    background: ${tokens.color.surface};
  }
  td {
    padding: 14px 16px;
    font-size: 13px;
    border-bottom: 1px solid ${tokens.color.surface2};
  }
  tr:last-child td {
    border-bottom: none;
  }
  @media (max-width: ${tokens.bp.mobile}) {
    display: none;
  }
`;

const CardGrid = styled.div`
  display: none;
  @media (max-width: ${tokens.bp.mobile}) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const DocCard = styled(Link)`
  background: #fff;
  border: 1px solid ${tokens.color.border};
  border-radius: 12px;
  padding: 14px 14px 12px;
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 12px;
  align-items: flex-start;
  box-shadow: ${tokens.shadow.sm};
  color: ${tokens.color.textPrimary};
`;

const Meta = styled.div`
  grid-column: 2 / 4;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 6px;
  color: ${tokens.color.textSecondary};
  font-size: 11.5px;
`;

const Ft = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${(p) => p.$bg};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 10.5px;
  flex-shrink: 0;
  @media (max-width: ${tokens.bp.mobile}) {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    font-size: 11px;
  }
`;

const accessTone = (a: string) =>
  a === 'Restricted' ? 'warning' : a === 'Public' ? 'info' : 'success';

export default function DocumentsPage() {
  const [files, setFiles] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', type: 'PDF' as Doc['type'], sizeKB: 100, access: 'Team' as Doc['access'] });
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const d = await fetch('/api/me/documents').then((r) => r.json());
    setFiles(d.documents ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const [createError, setCreateError] = useState<string | null>(null);

  async function create() {
    setCreateError(null);
    if (!required(newDoc.name)) { setCreateError('File name is required.'); return; }
    if (newDoc.sizeKB < 0) { setCreateError('Size must be zero or more.'); return; }
    setCreating(true);
    const res = await submitJson('/api/me/documents', {
      ...newDoc,
      name: newDoc.name.trim(),
    });
    setCreating(false);
    if (!res.ok) { setCreateError(res.error); return; }
    setShowNew(false);
    setNewDoc({ name: '', type: 'PDF', sizeKB: 100, access: 'Team' });
    refresh();
  }

  return (
    <>
      <Head>
        <div>
          <Eyebrow>Shared library</Eyebrow>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Documents</h1>
          <p style={{ color: tokens.color.textSecondary, fontSize: 13.5, marginTop: 4 }}>
            {files.length} {files.length === 1 ? 'file' : 'files'} · your workspace
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => setShowNew((v) => !v)}>+ Add document</Button>
        </div>
      </Head>

      {showNew && (
        <div style={{ marginBottom: 16, padding: 14, background: '#fff', border: `1px solid ${tokens.color.border}`, borderRadius: 12, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <input
            value={newDoc.name}
            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
            placeholder="File name (e.g. Briefing v1.pdf)"
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13 }}
          />
          <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value as Doc['type'] })} style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, background: '#fff' }}>
            <option>PDF</option><option>DOC</option><option>XLS</option><option>PNG</option><option>JPG</option><option>OTHER</option>
          </select>
          <input
            type="number"
            value={newDoc.sizeKB}
            onChange={(e) => setNewDoc({ ...newDoc, sizeKB: Number(e.target.value) })}
            placeholder="Size KB"
            style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13 }}
          />
          <select value={newDoc.access} onChange={(e) => setNewDoc({ ...newDoc, access: e.target.value as Doc['access'] })} style={{ padding: '8px 12px', border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 13, background: '#fff' }}>
            <option>Team</option><option>Restricted</option><option>Public</option>
          </select>
          <Button $size="sm" onClick={create} disabled={creating || !newDoc.name.trim()}>Save</Button>
          {createError && (
            <div style={{ gridColumn: '1 / -1', padding: '10px 12px', background: tokens.color.errorSurface, border: `1px solid ${tokens.color.errorBorder}`, color: tokens.color.errorText, borderRadius: 10, fontSize: 13 }}>
              {createError}
            </div>
          )}
        </div>
      )}

      {loading && <div style={{ padding: 20, color: tokens.color.textSecondary }}>Loading documents…</div>}
      {!loading && files.length === 0 && (
        <div style={{ padding: 40, background: '#fff', border: `1px dashed ${tokens.color.border}`, borderRadius: 14, textAlign: 'center', color: tokens.color.textSecondary }}>
          No documents yet. Click <strong>+ Add document</strong> to create one.
        </div>
      )}

      {files.length > 0 && (
        <>
          <CardGrid>
            {files.map((f) => (
              <DocCard key={f.id} href={`/dashboard/documents/${f.id}`}>
                <Ft $bg={typeColor[f.type]}>{f.type}</Ft>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.name}
                  </div>
                  <div style={{ color: tokens.color.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {f.pages ? `${f.pages} pages` : f.folderName || '—'}
                  </div>
                </div>
                <Badge $tone={accessTone(f.access)}>{f.access}</Badge>
                <Meta>
                  <span>🕒 {fmtDate(f.updatedAt)}</span>
                  <span className="mono">{fmtSize(f.sizeKB)}</span>
                </Meta>
              </DocCard>
            ))}
          </CardGrid>

          <Table>
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" style={{ accentColor: tokens.color.primary }} />
                </th>
                <th>Name</th>
                <th style={{ width: 120 }}>Folder</th>
                <th style={{ width: 150 }}>Modified</th>
                <th style={{ width: 90 }}>Size</th>
                <th style={{ width: 120 }}>Access</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td>
                    <input type="checkbox" style={{ accentColor: tokens.color.primary }} />
                  </td>
                  <td>
                    <Link href={`/dashboard/documents/${f.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Ft $bg={typeColor[f.type]}>{f.type}</Ft>
                      <div>
                        <div style={{ fontWeight: 600, color: tokens.color.textPrimary }}>{f.name}</div>
                        {f.pages && <div style={{ color: tokens.color.textSecondary, fontSize: 11.5 }}>{f.pages} pages</div>}
                      </div>
                    </Link>
                  </td>
                  <td style={{ color: tokens.color.textSecondary }}>{f.folderName || '—'}</td>
                  <td style={{ color: tokens.color.textSecondary }}>{fmtDate(f.updatedAt)}</td>
                  <td className="mono" style={{ color: tokens.color.textSecondary }}>{fmtSize(f.sizeKB)}</td>
                  <td>
                    <Badge $tone={accessTone(f.access)}>{f.access}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}
