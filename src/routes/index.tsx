import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LivestockCopilotLanding,
});

function LivestockCopilotLanding() {
  useEffect(() => {
    window.location.replace("/livestock-copilot.html");
  }, []);

  return null;
}
