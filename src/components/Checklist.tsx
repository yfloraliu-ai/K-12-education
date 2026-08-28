import type { ChecklistItem } from "../types";

interface Props {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export default function Checklist({ items, checked, onToggle }: Props) {
  const done = items.filter((i) => checked[i.id]).length;
  return (
    <div className="bg-white rounded-lg border-2 border-ink p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-lg">
          <span className="hl-g px-1">My checklist</span>
        </h3>
        <span className="text-sm font-extrabold text-stone-400">
          {done}/{items.length}
        </span>
      </div>
      <div className="h-2 border border-ink rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-hg transition-all"
          style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
        />
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex items-start gap-2.5 cursor-pointer text-[14px] leading-snug hover:bg-soft rounded px-1.5 py-1.5">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => onToggle(item.id)}
                className="mt-0.5 h-4 w-4 accent-[#1c1917]"
              />
              <span className={checked[item.id] ? "line-through text-stone-400" : "font-medium"}>
                {item.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
