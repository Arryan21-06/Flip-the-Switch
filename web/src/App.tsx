import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { MissionControl } from './pages/MissionControl';
import { MorningBrief } from './pages/MorningBrief';
import { ProposalsBoard } from './pages/ProposalsBoard';
import { EarlyWarning } from './pages/EarlyWarning';
import { RulesView } from './pages/RulesView';
import { AuditTrail } from './pages/AuditTrail';
import { Scoreboard } from './pages/Scoreboard';
import { HowItWorks } from './pages/HowItWorks';
import { SystemHealth } from './pages/SystemHealth';
import { SwitchSimulator } from './pages/SwitchSimulator';
import { Connectors } from './pages/Connectors';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<MissionControl />} />
        <Route path="connectors" element={<Connectors />} />
        <Route path="brief" element={<MorningBrief />} />
        <Route path="proposals" element={<ProposalsBoard />} />
        <Route path="early-warning" element={<EarlyWarning />} />
        <Route path="rules" element={<RulesView />} />
        <Route path="audit" element={<AuditTrail />} />
        <Route path="scoreboard" element={<Scoreboard />} />
        <Route path="simulator" element={<SwitchSimulator />} />
        <Route path="architecture" element={<HowItWorks />} />
        <Route path="health" element={<SystemHealth />} />
        {/* Catch-all redirect to Mission Control */}
        <Route path="*" element={<MissionControl />} />
      </Route>
    </Routes>
  );
};

export default App;

