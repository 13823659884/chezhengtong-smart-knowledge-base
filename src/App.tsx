import { Routes, Route } from 'react-router-dom';
import PersonalCenter from '@/pages/PersonalCenter';
import KnowledgeBase from '@/pages/KnowledgeBase';
import SmartRepairKB from '@/pages/SmartRepairKB';
import CircuitDiagramKB from '@/pages/CircuitDiagramKB';
import SmartDiagnosis from '@/pages/SmartDiagnosis';
import DiagnosisPlanDetail from '@/pages/DiagnosisPlanDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PersonalCenter />} />
      <Route path="/personal" element={<PersonalCenter />} />
      <Route path="/knowledge" element={<KnowledgeBase />} />
      <Route path="/smart-repair" element={<SmartRepairKB />} />
      <Route path="/circuit-diagram" element={<CircuitDiagramKB />} />
      <Route path="/smart-diagnosis" element={<SmartDiagnosis />} />
      <Route path="/diagnosis-plan" element={<DiagnosisPlanDetail />} />
      {/* Fallback redirects */}
      <Route path="*" element={<PersonalCenter />} />
    </Routes>
  );
}

export default App;
