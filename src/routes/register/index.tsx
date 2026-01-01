import Loading from "@/components/Loading";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Base64 } from "js-base64";
import { useTransition } from "react";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();

  function Form() {
    function action(form: FormData) {
      startTransition(async () => {
        const email = form.get("email");
        if (!email) {
          throw new Error("invalid form data");
        }

        let res = await fetch("/api/passkey/register/start", {
          method: "POST",
          body: form,
        });
        if (res.status !== 200) {
          throw new Error(`status ${res.status}:${res.statusText}`);
        }

        const op = await res.json();
        op.user.id = Base64.toUint8Array(op.user.id);
        op.challenge = Base64.toUint8Array(op.challenge);

        const rawCred = (await navigator.credentials.create({
          publicKey: op,
        })) as PublicKeyCredential | null;
        if (!rawCred) {
          throw new Error("failed to create public key credential");
        }

        const attest = rawCred.response as AuthenticatorAttestationResponse;
        form = new FormData();
        form.set("email", email);
        form.set("id", rawCred.id);
        form.set("type", rawCred.type);
        form.set(
          "attestationObject",
          Base64.fromUint8Array(new Uint8Array(attest.attestationObject), true),
        );
        form.set(
          "clientDataJson",
          Base64.fromUint8Array(new Uint8Array(attest.clientDataJSON), true),
        );
        if (rawCred.authenticatorAttachment) {
          form.set("authenticatorAttachment", rawCred.authenticatorAttachment);
        }

        res = await fetch("/api/passkey/register/finish", {
          method: "POST",
          body: form,
        });
        if (res.status !== 200) {
          throw new Error(`status ${res.status}:${res.statusText}`);
        }

        navigate({ to: "/" });
      });
    }

    return (
      <div className="text-center">
        <form action={action}>
          <label htmlFor="name">
            <input
              className="input validator w-70"
              type="text"
              name="name"
              id="name"
              aria-label="name"
              required
              disabled={pending}
              placeholder="your name"
            />
            <div className="validator-hint">Enter name</div>
          </label>
          <label htmlFor="email">
            <input
              className="input validator w-70 mt-3"
              type="email"
              name="email"
              id="email"
              aria-label="email"
              required
              disabled={pending}
              placeholder="your@email.com"
            />
            <div className="validator-hint">Enter email address</div>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-40 mt-5"
          >
            Register
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {pending ? <Loading /> : <Form />}
    </main>
  );
}
