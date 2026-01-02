import Loading from "@/components/Loading";
import { createFileRoute } from "@tanstack/react-router";
import { Base64 } from "js-base64";
import { Suspense, use } from "react";

export const Route = createFileRoute("/verify/")({
  component: RouteComponent,
});

let __pkPromise: Promise<void> | null = null;

function RouteComponent() {
  async function login(): Promise<void> {
    function b64(a: ArrayBuffer): string {
      return Base64.fromUint8Array(new Uint8Array(a), true);
    }

    let res = await fetch("/api/passkey/verify/start");
    if (res.status != 200) {
      throw new Error(`status ${res.status}:${res.statusText}`);
    }

    const op = await res.json();
    op.challenge = Base64.toUint8Array(op.challenge);

    const cred = (await navigator.credentials.get({
      publicKey: op,
    })) as PublicKeyCredential | null;
    if (!cred) {
      throw new Error("failed to get public key credential");
    }

    const asse = cred.response as AuthenticatorAssertionResponse;
    const form = new FormData();
    form.set("id", cred.id);
    form.set("type", cred.type);
    form.set("clientDataJson", b64(asse.clientDataJSON));
    form.set("authenticatorData", b64(asse.authenticatorData));
    form.set("signature", b64(asse.signature));
    if (cred.authenticatorAttachment) {
      form.set("authenticatorAttachment", cred.authenticatorAttachment);
    }
    if (asse.userHandle) {
      form.set("userHandle", b64(asse.userHandle));
    }

    res = await fetch("/api/passkey/verify/finish", {
      method: "POST",
      body: form,
    });
    if (res.status !== 200) {
      throw new Error(`status: ${res.status}:${res.statusText}`);
    }
  }

  interface Props {
    promise: Promise<void>;
  }

  if (!__pkPromise) {
    __pkPromise = login();
  }

  function Login({ promise }: Props) {
    use(promise);

    return (
      <div>
        <p className="text-xl">Done</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Suspense fallback={<Loading />}>
        <Login promise={__pkPromise} />
      </Suspense>
    </main>
  );
}
