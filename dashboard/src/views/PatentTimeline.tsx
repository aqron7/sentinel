import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Patent } from "../api";

const CONTRACTORS = [
  "Northrop Grumman",
  "Raytheon",
  "General Atomics",
  "Lockheed Martin",
];

const COLORS: Record<string, string> = {
  "Northrop Grumman": "#f97316",
  Raytheon: "#38bdf8",
  "General Atomics": "#a78bfa",
  "Lockheed Martin": "#34d399",
};

function monthKey(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function PatentTimeline({ patents }: { patents: Patent[] }) {
  const data = useMemo(() => {
    const buckets: Record<string, Record<string, number>> = {};
    for (const p of patents) {
      if (!p.contractor) continue;
      const m = monthKey(p.grant_date);
      if (!m) continue;
      buckets[m] = buckets[m] || {};
      buckets[m][p.contractor] = (buckets[m][p.contractor] ?? 0) + 1;
    }
    const rows = Object.keys(buckets)
      .sort()
      .map((m) => ({ month: m, ...buckets[m] }));
    return rows;
  }, [patents]);

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-ink-500">
        No patent data yet — run the ingest job.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1a1e26" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            stroke="#8a8fa0"
            fontSize={11}
            tick={{ fill: "#8a8fa0" }}
            tickLine={false}
          />
          <YAxis
            stroke="#8a8fa0"
            fontSize={11}
            tick={{ fill: "#8a8fa0" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0e1014",
              border: "1px solid #262a35",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#d6d8df" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#b4b8c4" }}
            iconType="plainline"
          />
          {CONTRACTORS.map((c) => (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={COLORS[c]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
