"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export function IndustryChart({
  data,
}: {
  data: Array<{ name: string; count: number }>;
}) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        업종 데이터가 없습니다.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          stroke="var(--muted-foreground)"
          fontSize={11}
        />
        <Tooltip
          contentStyle={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="var(--foreground)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgeChart({
  data,
}: {
  data: Array<{ ageGroup: string; male: number; female: number; total: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="ageGroup" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} />
        <Tooltip
          contentStyle={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="male" name="남" stackId="a" fill="var(--foreground)" />
        <Bar
          dataKey="female"
          name="여"
          stackId="a"
          fill="var(--muted-foreground)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
