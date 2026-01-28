import React, { memo } from 'react';
import { AgentState } from '../types/agent';

interface DashboardProps {
    state: AgentState;
}

export const Dashboard = memo(({ state }: DashboardProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {/* Date Card */}
            <div className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Current Date</h3>
                <p className="text-3xl font-bold text-slate-800 tabular-nums">
                    {state.current_date || "Fetching..."}
                </p>
            </div>

            {/* Location Card */}
            <div className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Location</h3>
                <p className="text-3xl font-bold text-slate-800">
                    {state.location || "Global"}
                </p>
            </div>

            {/* Weather Card */}
            <div className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-7.07 7.07c-.39-.39-1.02-.39-1.41 0l-1.8 1.8 1.41 1.41 1.8-1.8c.39-.39.39-1.02 0-1.41z" /></svg>
                </div>
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Temperature</h3>
                <p className="text-5xl font-extrabold text-slate-800 tabular-nums">
                    {state.temperature !== undefined ? `${state.temperature}°` : "--"}
                </p>
            </div>

            {/* Time Card */}
            <div className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02]">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Local Time</h3>
                <p className="text-5xl font-mono font-bold text-white tabular-nums tracking-tight">
                    {state.time || "00:00:00"}
                </p>
                <div className="mt-6 flex items-center space-x-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs text-slate-400 font-medium">Real-time sync active</span>
                </div>
            </div>
        </div>
    );
});

Dashboard.displayName = 'Dashboard';
