
import React from "react";
import AgentManager from "@/components/agent/AgentManager";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";

const AgentDashboard: React.FC = () => {
  return (
    <div>
      <SectionHeading
        tag="AI Agents"
        subheading="Create, manage, and run AI agents for your tasks"
      >
        AI Agent Dashboard
      </SectionHeading>
      <Container>
        <AgentManager />
      </Container>
    </div>
  );
};

export default AgentDashboard;
