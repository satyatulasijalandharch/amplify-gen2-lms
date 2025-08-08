import { Suspense } from "react";
import { ResetPassword } from "../_components/ResetPassword";

export default async function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
