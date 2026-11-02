"use client";
import { useTranslation } from "react-i18next";
import { Check, History, BookText, ArrowUpRight } from "lucide-react";
import { useTaskStore } from "@/store/task";
import { useGlobalStore } from "@/store/global";
import { getResearchStage } from "@/utils/research-stage";

const stages = ["topic", "feedback", "searchResult", "finalReport"] as const;
export default function ResearchOverview() {
  const { t } = useTranslation();
  const task = useTaskStore();
  const current = getResearchStage(task);
  const { setOpenHistory, setOpenKnowledge } = useGlobalStore();
  return (
    <div className="research-overview print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="workspace-eyebrow">{t("workspace.eyebrow")}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t("workspace.heading")}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t("workspace.description")}</p></div>
        <div className="flex gap-2 sm:hidden">
          <button className="workspace-shortcut" onClick={() => setOpenHistory(true)}><History className="h-4 w-4" />{t("history.title")}</button>
          <button className="workspace-shortcut" onClick={() => setOpenKnowledge(true)}><BookText className="h-4 w-4" />{t("knowledge.title")}</button>
        </div>
      </div>
      <nav className="mt-6" aria-label={t("workspace.progress")}>
        <ol className="research-steps">
          {stages.map((stage, index) => <li key={stage}><a href={`#research-${stage}`} className={`research-step ${index === current ? "is-current" : ""}`} aria-current={index === current ? "step" : undefined}><span className="step-number">{index < current ? <Check className="h-3.5 w-3.5" /> : `0${index + 1}`}</span><span className="min-w-0"><span className="block truncate text-sm font-medium">{t(`research.${stage}.title`)}</span><span className="mt-0.5 block text-xs text-muted-foreground">{t(`workspace.step${index + 1}`)}</span></span><ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-40" /></a></li>)}
        </ol>
      </nav>
    </div>
  );
}
