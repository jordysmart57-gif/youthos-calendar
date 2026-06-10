import { useState } from 'react';
import { EventTemplate } from '../types';
import { TEMPLATES } from '../lib/data';
import { CATEGORY_META, CLARITY_FIELDS } from '../lib/helpers';
import { Badge, Card } from '../components/ui';

interface Props {
  onUseTemplate: (t: EventTemplate) => void;
}

export default function TemplatesView({ onUseTemplate }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const clarityLabel = (key: string) => CLARITY_FIELDS.find((f) => f.key === key)?.label ?? key;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Event Templates</h1>
        <p className="mt-1 text-sm text-stone-600">
          Every event type you run in a year — with its checklist, lead time, and volunteer needs
          already thought through. Tap one to see what's inside.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => {
          const cat = CATEGORY_META[t.category];
          const open = openId === t.id;
          return (
            <Card key={t.id} className="!p-0">
              <button
                onClick={() => setOpenId(open ? null : t.id)}
                className="block w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-extrabold">{t.name}</p>
                  <Badge tone={cat.chip}>{cat.label}</Badge>
                </div>
                <p className="mt-1 text-xs text-stone-500">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="bg-stone-100 text-stone-600">
                    Start {t.leadTimeWeeks} {t.leadTimeWeeks === 1 ? 'week' : 'weeks'} out
                  </Badge>
                  <Badge tone="bg-stone-100 text-stone-600">{t.defaultChecklist.length} checklist items</Badge>
                </div>
              </button>
              {open && (
                <div className="border-t border-stone-100 p-4 pt-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                    Checklist
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {t.defaultChecklist.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm font-medium">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {t.typicalVolunteers.length > 0 && (
                    <>
                      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                        Typical volunteers
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.typicalVolunteers.map((v) => (
                          <Badge key={v} tone="bg-emerald-100 text-emerald-800">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                    Parents will need
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.clarityFields.map((f) => (
                      <Badge key={f} tone="bg-sky-100 text-sky-800">
                        {clarityLabel(f)}
                      </Badge>
                    ))}
                  </div>
                  <button
                    onClick={() => onUseTemplate(t)}
                    className="mt-4 w-full rounded-xl bg-stone-900 py-2 text-sm font-bold text-white transition hover:bg-stone-700"
                  >
                    Use this template →
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
