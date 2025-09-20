import { createFileRoute } from "@tanstack/react-router";
import "../App.css";
import { Button, Input } from "@chakra-ui/react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="App">
      <Input />
      <Button>名刺に移動</Button>
    </div>
  );
}
