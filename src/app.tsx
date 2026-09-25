import { Route, Routes } from "react-router";
import { HomePage } from "./pages/home-page.tsx";
import { BillableHoursPage } from "./pages/billable-hours-page.tsx";
import { NotFoundPage } from "./pages/not-found-page.tsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/apps/billable-hours" element={<BillableHoursPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
