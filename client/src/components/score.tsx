import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  currentScore: {
    label: "currentScore",
    color: "var(--chart-1)",
  },
  totalScore: {
    label: "totalScore",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartRadialScore({ score }: { score: number }) {
  const chartData = [{ currentScore: score, totalScore: 100 - score }];
  const totalScores = chartData[0].currentScore;

  return (
    <ChartContainer config={chartConfig} className="h-28 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={chartData}
          startAngle={180}
          endAngle={0}
          innerRadius={50}
          outerRadius={70}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  const cx = viewBox.cx;
                  const cy = viewBox.cy || 0;
                  return (
                    <text x={cx} y={cy} textAnchor="middle">
                      <tspan
                        x={cx}
                        y={cy - 8}
                        className="fill-foreground text-lg font-bold"
                      >
                        {totalScores.toLocaleString()}/100
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 12}
                        className="fill-muted-foreground text-xs"
                      >
                        Score
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </PolarRadiusAxis>

          <RadialBar
            dataKey="currentScore"
            stackId="a"
            cornerRadius={6}
            fill="var(--chart-1)"
            className="stroke-transparent stroke-2"
          />
          <RadialBar
            dataKey="totalScore"
            fill="var(--chart-2)"
            stackId="a"
            cornerRadius={6}
            className="stroke-transparent stroke-2"
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
