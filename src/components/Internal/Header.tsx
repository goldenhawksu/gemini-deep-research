"use client";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Settings, History, BookText, Languages, Sun, Moon, Monitor, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";
import locales from "@/constants/locales";

function Header() {
  const { t } = useTranslation();
  const { setOpenSetting, setOpenHistory, setOpenKnowledge } = useGlobalStore();
  const { language, theme, update } = useSettingStore();
  const { setTheme } = useTheme();
  const control = "h-11 w-11 shrink-0 rounded-xl";
  return (
    <header className="workspace-header print:hidden">
      <a href="#main-content" className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight" aria-label={t("title")}>
        <span className="brand-mark"><Orbit className="h-5 w-5" /></span>
        <span className="truncate text-base sm:text-lg">{t("title")}</span>
      </a>
      <nav className="flex shrink-0 items-center gap-0.5" aria-label={t("workspace.tools")}>
        <Button className={`${control} max-sm:hidden`} variant="ghost" size="icon" aria-label={t("history.title")} title={t("history.title")} onClick={() => setOpenHistory(true)}><History className="h-4 w-4" /></Button>
        <Button className={`${control} max-sm:hidden`} variant="ghost" size="icon" aria-label={t("knowledge.title")} title={t("knowledge.title")} onClick={() => setOpenKnowledge(true)}><BookText className="h-4 w-4" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button className={control} variant="ghost" size="icon" aria-label={t("workspace.language")} title={t("workspace.language")}><Languages className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(locales).map(([code, label]) => <DropdownMenuItem key={code} lang={code} onSelect={() => update({ language: code })}>{label}<span className="ml-auto pl-5">{language === code ? "✓" : ""}</span></DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button className={control} variant="ghost" size="icon" aria-label={t("workspace.theme")} title={t("workspace.theme")}><Sun className="h-4 w-4 dark:hidden" /><Moon className="hidden h-4 w-4 dark:block" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([value, Icon]) => <DropdownMenuItem key={value} onSelect={() => { update({ theme: value }); setTheme(value); }}><Icon className="h-4 w-4" />{t(`workspace.${value}`)}<span className="ml-auto pl-5">{theme === value ? "✓" : ""}</span></DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className={control} variant="ghost" size="icon" aria-label={t("setting.title")} title={t("setting.title")} onClick={() => setOpenSetting(true)}><Settings className="h-4 w-4" /></Button>
      </nav>
    </header>
  );
}
export default Header;
