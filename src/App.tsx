/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/layout/FilterBar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Modals
import { DeviceDetailModal } from './components/modals/DeviceDetailModal';
import { CVEDetailModal } from './components/modals/CVEDetailModal';
import { ReleaseDetailModal } from './components/modals/ReleaseDetailModal';
import { JiraDetailModal } from './components/modals/JiraDetailModal';

// Views
import { ExecutiveOverviewView } from './components/views/ExecutiveOverviewView';
import { ProductsDevicesView } from './components/views/ProductsDevicesView';
import { PlatformsView } from './components/views/PlatformsView';
import { ReleaseCalendarView } from './components/views/ReleaseCalendarView';
import { ReleaseComparisonView } from './components/views/ReleaseComparisonView';
import { SecurityCenterView } from './components/views/SecurityCenterView';
import { FixesChangesView } from './components/views/FixesChangesView';
import { LifecycleView } from './components/views/LifecycleView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { AlertsCenterView } from './components/views/AlertsCenterView';
import { AdminDataSyncView } from './components/views/AdminDataSyncView';

const MainContent: React.FC = () => {
  const { activeTab } = usePlatform();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 min-h-[calc(100vh-120px)]">
      {activeTab === 'executive' && <ExecutiveOverviewView />}
      {activeTab === 'products' && <ProductsDevicesView />}
      {activeTab === 'platforms' && <PlatformsView />}
      {activeTab === 'calendar' && <ReleaseCalendarView />}
      {activeTab === 'comparison' && <ReleaseComparisonView />}
      {activeTab === 'cve' && <SecurityCenterView />}
      {activeTab === 'fixes' && <FixesChangesView />}
      {activeTab === 'lifecycle' && <LifecycleView />}
      {activeTab === 'reports' && <ReportsAnalyticsView />}
      {activeTab === 'alerts' && <AlertsCenterView />}
      {activeTab === 'admin' && <AdminDataSyncView />}
    </main>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
        {/* Collapsible Enterprise Sidebar */}
        <Sidebar />

        {/* Right Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <FilterBar />
          <MainContent />
        </div>

        {/* Global Modals & Detail Drawers */}
        <GlobalSearchModal />
        <DeviceDetailModal />
        <CVEDetailModal />
        <ReleaseDetailModal />
        <JiraDetailModal />
      </div>
    </PlatformProvider>
  );
}
