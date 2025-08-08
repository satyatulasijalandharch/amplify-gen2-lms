import { Suspense } from "react";
import { VerifyRequest } from "../_components/VerifyRequest";

export default async function VerifyPage() {
  return (
    <Suspense>
      <VerifyRequest />
    </Suspense>
  );
}
