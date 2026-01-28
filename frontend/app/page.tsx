"use client";

import { CopilotSidebar, useAgent } from "@copilotkitnext/react";
import { useEffect } from 'react';
import { AgentState } from "../types/agent";
import { Dashboard } from "../components/Dashboard";

export default function Home() {
  const { agent } = useAgent({
    agentId: "default",
  });

  const agentState = (agent?.state as unknown as AgentState) || {};

  // Debug logging for agent state updates
  useEffect(() => {
    if (agent?.state) {
      console.log('[Frontend] Agent state refreshed:', agent.state);
    }
  }, [agent?.state]);

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

          {/* Dashboard Section */}
          <Dashboard state={agentState} />
        </div>
      </main>
    </>
  );
}
