import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { Compass, Home, Search, Shuffle, UserRound } from "lucide-react";

import { CatalogProvider } from "./contexts/CatalogContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { de } from "./i18n/de";

const TodayPage = lazy(() => import("./pages/TodayPage"));
const WheelPage = lazy(() => import("./pages/WheelPage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const EpisodeDetailPage = lazy(() => import("./pages/EpisodeDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const navItems = [
  { to: "/", icon: <Home aria-hidden="true" size={18} />, label: de.nav.today },
  {
    to: "/zufallsauswahl",
    icon: <Shuffle aria-hidden="true" size={18} />,
    label: de.nav.random,
  },
  {
    to: "/swipen",
    icon: <Compass aria-hidden="true" size={18} />,
    label: de.nav.swipe,
  },
  { to: "/suche", icon: <Search aria-hidden="true" size={18} />, label: de.nav.search },
  {
    to: "/profil",
    icon: <UserRound aria-hidden="true" size={18} />,
    label: de.nav.profile,
  },
];

export function App() {
  return (
    <CatalogProvider>
      <ProfileProvider>
        <HashRouter>
          <div className="app-shell">
            <header className="app-header">
              <div>
                <p className="eyebrow">{de.eyebrow}</p>
                <h1>{de.appName}</h1>
                <p>{de.subtitle}</p>
              </div>
              <nav className="main-nav" aria-label={de.nav.ariaLabel}>
                {navItems.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
                ))}
              </nav>
            </header>
            <main>
              <Suspense fallback={<p className="loading">{de.loading.catalog}</p>}>
                <Routes>
                  <Route path="/" element={<TodayPage />} />
                  <Route path="/zufallsauswahl" element={<WheelPage />} />
                  <Route path="/swipen" element={<DiscoverPage />} />
                  <Route path="/suche" element={<SearchPage />} />
                  <Route path="/folge/:episodeId" element={<EpisodeDetailPage />} />
                  <Route path="/profil" element={<ProfilePage />} />
                  <Route path="/ueber" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            <footer className="app-footer">{de.unofficialNotice}</footer>
          </div>
        </HashRouter>
      </ProfileProvider>
    </CatalogProvider>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "active" : undefined)}
      end={to === "/"}
    >
      {icon}
      {label}
    </NavLink>
  );
}
