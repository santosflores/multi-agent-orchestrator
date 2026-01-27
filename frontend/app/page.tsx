"use client";

import "@copilotkit/react-ui/styles.css";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { RenderMessage } from "../components/Chat/RenderMessage";

export interface AgentState {

  // Metadata
  location?: string;
  temperature?: number;
  current_date?: string;
  time?: string;
}

export default function Home() {
  const { state } = useCoAgent<AgentState>({
    name: "default",
  });

  useCoAgentStateRender<AgentState>({
    name: "default",
    render: ({ state }) => {
      return (
        <div>
          {state.location}
        </div>
      );
    }
  });
  return (
    <CopilotSidebar
      defaultOpen={true}
      clickOutsideToClose={false}
      RenderMessage={RenderMessage}
    >
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Agents
            </h1>
            <p className="text-gray-600">
              Powered by Google ADK + Gemini 3 | Multi-Agent Web Application
            </p>
          </header>
          Current Date:&nbsp;{state.current_date}
          <br />
          Location:&nbsp;{state.location}
          <br />
          Temperature:&nbsp;{state.temperature}
          <br />
          Current Time:&nbsp;{state.time}
        </div>

      </main>
    </CopilotSidebar>
  );
}
