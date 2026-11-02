// Read-only projection of the existing workflow; never starts or mutates research.
export function getResearchStage(task: {
  questions: string; reportPlan: string; tasks: { state: string }[]; finalReport: string;
}): number {
  if (task.finalReport || (task.tasks.length > 0 && task.tasks.every(item => item.state === "completed"))) return 3;
  if (task.tasks.length > 0) return 2;
  if (task.questions || task.reportPlan) return 1;
  return 0;
}
