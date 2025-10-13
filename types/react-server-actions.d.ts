// Make TS accept function-based <form action={...}> (Server Actions)
import "react";

declare module "react" {
  interface FormHTMLAttributes<T> {
    action?:
      | string
      | ((formData: FormData) => void | Promise<void>);
  }
}
