import { useRef, useState } from 'react';
import { Modal } from './ui';

interface Props {
  email: string;
  syncLabel: string;
  onExport: () => void;
  /** Returns an error message, or null on success. */
  onImport: (data: unknown) => string | null;
  onReset: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

export default function SettingsModal({
  email,
  syncLabel,
  onExport,
  onImport,
  onReset,
  onSignOut,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const err = onImport(parsed);
      setStatus(err ? { ok: false, msg: err } : { ok: true, msg: 'Backup restored.' });
    } catch {
      setStatus({ ok: false, msg: "That file isn't a valid YouthOS backup." });
    }
  };

  return (
    <Modal title="Data & settings" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-stone-50 p-3.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">Account</p>
          <p className="mt-1 truncate text-sm font-bold">{email || 'Signed in'}</p>
          <p className="mt-0.5 text-xs font-semibold text-stone-500">
            {syncLabel === 'Offline'
              ? 'Offline — changes save here and sync when you reconnect.'
              : `Synced to the cloud · ${syncLabel}`}
          </p>
          <button
            onClick={onSignOut}
            className="mt-3 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition hover:border-stone-500 active:scale-95"
          >
            Sign out
          </button>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <p className="text-sm font-bold">Back up your data</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Your data is synced to your account across devices. You can still download a local copy
            anytime, or restore one into this account.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                onExport();
                setStatus({ ok: true, msg: 'Backup downloaded.' });
              }}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
            >
              Download backup
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-500"
            >
              Restore from backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <p className="text-sm font-bold">Clear all data</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Removes every event, task, and person. Use this to start fresh. Back up first if you want to keep anything.
          </p>
          <button
            onClick={() => {
              onReset();
              setStatus({ ok: true, msg: 'All data cleared.' });
            }}
            className="mt-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 transition hover:border-rose-400"
          >
            Clear all data
          </button>
        </div>

        {status && (
          <p
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              status.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {status.msg}
          </p>
        )}
      </div>
    </Modal>
  );
}
