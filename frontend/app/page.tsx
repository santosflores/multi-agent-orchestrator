"use client";

import { CopilotSidebar, useAgent } from "@copilotkitnext/react";
import { useEffect } from 'react';
// import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";

export interface AgentState {
  location?: string;
  temperature?: number;
  current_date?: string;
  time?: string;
}

export default function Home() {
  const { agent } = useAgent({
    agentId: "default",
  });

  const state = (agent?.state as unknown as AgentState) || {};

  // Debug logging for agent state
  useEffect(() => {
    console.log('[Frontend] Agent updated:', agent);
    console.log('[Frontend] Agent state:', agent?.state);
    console.log('[Frontend] Derived state:', state);
  }, [agent, agent?.state, state]);

  /*
  // TODO: Migrate to useRenderActivityMessage or similar v2 pattern for in-chat custom UI
  useCoAgentStateRender<AgentState>({
    name: "default",
    render: ({ state }) => {
      return (
        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Agent State</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Location</span>
              <span className="font-medium text-slate-700">{state.location || "Searching..."}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Temperature</span>
              <span className="font-medium text-slate-700">{state.temperature !== undefined ? `${state.temperature}°C` : "N/A"}</span>
            </div>
          </div>
        </div>
      );
    }
  });
  */

  return (
    <>
      <CopilotSidebar
        agentId="default"
        defaultOpen={true}
      />
      <main className="min-h-screen bg-[#fafafa] selection:bg-blue-100">
        <div className="max-w-4xl mx-auto p-12">
          {/* Hero Section */}
          <header className="mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Next-Gen Architecture Enabled</span>
            </div>

            <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Multi-Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Orchestrator</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              Experience the power of Google ADK and Gemini. This intelligent hub seamlessly
              coordinates specialized sub-agents to handle weather, time, and more.
            </p>
          </header>

          {/* Dashboard Grid */}
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
        </div>
      </main>
    </>
  );
}
