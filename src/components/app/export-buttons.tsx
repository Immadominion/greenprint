"use client";

import { jsPDF } from "jspdf";
import { FileDown, Sheet } from "lucide-react";
import { toast } from "sonner";
import type { AnalysisReport } from "@/lib/analysis";
import { LANGUAGE_LABELS } from "@/lib/analysis";
import { formatCo2, formatDuration, formatEnergy } from "@/lib/format";
import { Button } from "@/components/ui/button";

function download(filename: string, content: string | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "report";
}

function exportCsv(report: AnalysisReport, title: string) {
  const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const rows: unknown[][] = [
    ["Greenprint — Sustainability & Code Quality Report"],
    ["Title", title],
    ["Language", LANGUAGE_LABELS[report.language]],
    ["Generated", new Date().toISOString()],
    [],
    ["Metric", "Value"],
    ["EcoScore", `${report.ecoScore.score}/100 (${report.ecoScore.grade})`],
    ["Quality score", `${report.qualityScore}/100`],
    ["Maintainability", report.complexity.maintainabilityIndex],
    ["Complexity class", report.energy.complexityClass],
    ["Lines of code", report.size.codeLines],
    ["Functions", report.complexity.functionCount],
    ["Cyclomatic complexity", report.complexity.cyclomatic],
    ["Max loop nesting", report.complexity.maxLoopNesting],
    ["Est. runtime", formatDuration(report.energy.estimatedRuntimeMs)],
    ["Est. energy", formatEnergy(report.energy.estimatedEnergyJoules)],
    ["Est. CO2 per run", formatCo2(report.energy.estimatedCo2Grams)],
    ["CO2 savable", formatCo2(report.energy.potentialCo2SavingGrams)],
    [],
    ["Line", "Severity", "Category", "Rule", "Message", "Greener alternative"],
    ...report.issues.map((i) => [i.line, i.severity, i.category, i.ruleTitle, i.message, i.suggestion]),
  ];
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  download(`greenprint-${slug(title)}.csv`, csv, "text/csv");
  toast.success("CSV report downloaded");
}

function exportPdf(report: AnalysisReport, title: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  // Header band
  doc.setFillColor(232, 93, 12);
  doc.rect(0, 0, W, 74, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Greenprint", 40, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Sustainability & Code Quality Report", 40, 56);

  y = 104;
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`${LANGUAGE_LABELS[report.language]} · ${new Date().toLocaleString()}`, 40, y);
  y += 28;

  // EcoScore highlight
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text(`${report.ecoScore.score}`, 40, y + 24);
  doc.setFontSize(12);
  doc.text(`/100  ·  Grade ${report.ecoScore.grade}  ·  ${report.ecoScore.rating}`, 92, y + 24);
  y += 48;

  const line = (label: string, value: string) => {
    if (y > H - 60) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(label, 40, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(25, 25, 25);
    doc.text(value, 220, y);
    y += 17;
  };
  const heading = (t: string) => {
    if (y > H - 80) {
      doc.addPage();
      y = 50;
    }
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(232, 93, 12);
    doc.text(t, 40, y);
    y += 16;
  };

  heading("Summary");
  line("Quality score", `${report.qualityScore}/100`);
  line("Maintainability index", `${report.complexity.maintainabilityIndex}/100`);
  line("Complexity class", `${report.energy.complexityClass} (${report.energy.complexityLabel})`);
  line("Lines of code", `${report.size.codeLines}`);
  line("Functions", `${report.complexity.functionCount}`);
  line("Cyclomatic complexity", `${report.complexity.cyclomatic}`);
  line("Max loop nesting", `${report.complexity.maxLoopNesting}`);

  heading("Estimated impact (modelled)");
  line("Reference input size", `N = ${report.energy.referenceInputSize.toLocaleString()}`);
  line("Estimated runtime", formatDuration(report.energy.estimatedRuntimeMs));
  line("Estimated energy", formatEnergy(report.energy.estimatedEnergyJoules));
  line("Estimated CO2 / run", formatCo2(report.energy.estimatedCo2Grams));
  line("CO2 savable", formatCo2(report.energy.potentialCo2SavingGrams));

  heading(`Issues (${report.issues.length})`);
  doc.setFontSize(9.5);
  for (const issue of report.issues) {
    if (y > H - 70) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 25);
    doc.text(`• [${issue.severity.toUpperCase()}] ${issue.ruleTitle} (line ${issue.line})`, 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    const wrapped = doc.splitTextToSize(`Fix: ${issue.suggestion}`, W - 90);
    doc.text(wrapped, 52, y);
    y += wrapped.length * 12 + 6;
  }

  doc.save(`greenprint-${slug(title)}.pdf`);
  toast.success("PDF report downloaded");
}

export function ExportButtons({ report, title }: { report: AnalysisReport; title: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportPdf(report, title)}>
        <FileDown className="size-4" />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportCsv(report, title)}>
        <Sheet className="size-4" />
        CSV
      </Button>
    </div>
  );
}
