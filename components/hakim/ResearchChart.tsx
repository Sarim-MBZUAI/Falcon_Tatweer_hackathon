"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Graph } from "@/lib/research";

const PALETTE = ["#e8b96a", "#7cc6c1", "#c98fd1", "#8aa9e6", "#f4d7a1", "#e89b6a"];

const AXIS = "#7a7a85";
const GRID = "#23232b";

const tooltipStyle = {
  background: "#111116",
  border: "1px solid #23232b",
  borderRadius: 12,
  color: "#ededf2",
  fontSize: 12,
} as const;

/** Merge a graph's series into recharts rows keyed by x. */
function toRows(graph: Graph): { rows: Record<string, string | number>[]; keys: string[] } {
  const keys = graph.series.map((s) => s.label || "value");
  const map = new Map<string, Record<string, string | number>>();
  graph.series.forEach((s, i) => {
    const key = keys[i];
    s.points.forEach((p) => {
      const xk = String(p.x);
      const row = map.get(xk) ?? { x: xk };
      row[key] = p.y;
      map.set(xk, row);
    });
  });
  return { rows: Array.from(map.values()), keys };
}

export function ResearchChart({ graph }: { graph: Graph }) {
  const { rows, keys } = toRows(graph);

  if (graph.chart_type === "pie") {
    const data = (graph.series[0]?.points ?? []).map((p) => ({
      name: String(p.x),
      value: p.y,
    }));
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0c0c10" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (graph.chart_type === "line") {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="x" stroke={AXIS} tick={{ fontSize: 11 }} />
          <YAxis stroke={AXIS} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {keys.map((k, i) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="x" stroke={AXIS} tick={{ fontSize: 11 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(232,185,106,0.08)" }} />
        {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
