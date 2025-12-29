import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div>
        <Link to="/register">
          <button className="btn btn-primary btn-lg w-50">Register</button>
        </Link>
      </div>
    </main>
  );
}
