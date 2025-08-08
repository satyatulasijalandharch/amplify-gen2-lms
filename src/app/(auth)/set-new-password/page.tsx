import { Suspense } from "react";
import { NewPassword } from "../_components/NewPassword";

export default function CreateNewPasswordPage() {
  return (
    <Suspense>
      <NewPassword />
    </Suspense>
  );
}
