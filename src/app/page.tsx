"use client";
import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";

const Overview = dynamic(() => import("@/components/Research/Overview"));
const Header = dynamic(() => import("@/components/Internal/Header"));
const Setting = dynamic(() => import("@/components/Setting"));
const Topic = dynamic(() => import("@/components/Research/Topic"));
const Feedback = dynamic(() => import("@/components/Research/Feedback"));
const SearchResult = dynamic(
  () => import("@/components/Research/SearchResult")
);
const FinalReport = dynamic(() => import("@/components/Research/FinalReport"));
const History = dynamic(() => import("@/components/History"));
const Knowledge = dynamic(() => import("@/components/Knowledge"));

function Home() {
  const { t } = useTranslation();
  const {
    openSetting,
    setOpenSetting,
    openHistory,
    setOpenHistory,
    openKnowledge,
    setOpenKnowledge,
  } = useGlobalStore();

  const { theme } = useSettingStore();
  const { setTheme } = useTheme();

  useLayoutEffect(() => {
    const settingStore = useSettingStore.getState();
    setTheme(settingStore.theme);
  }, [theme, setTheme]);
  return (
    <div className="workspace-shell">
      <a href="#main-content" className="skip-link">{t("workspace.skip")}</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Overview />
        <Topic />
        <Feedback />
        <SearchResult />
        <FinalReport />
      </main>
      <footer className="my-4 text-center text-sm text-muted-foreground print:hidden">
        <a href="https://github.com/u14app/" target="_blank">
          {t("copyright", {
            name: "U14App",
          })}
        </a>
      </footer>
      <aside className="print:hidden">
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
        <History open={openHistory} onClose={() => setOpenHistory(false)} />
        <Knowledge
          open={openKnowledge}
          onClose={() => setOpenKnowledge(false)}
        />
      </aside>
    </div>
  );
}

export default Home;
