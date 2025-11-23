import { AxiosError } from "axios";
import { toast } from "react-toastify";

export function handleApiError(
  err: unknown,
  navigate?: (path: string) => void,
  logout?: () => void
) {
  const error = err as AxiosError<{ message?: string }>;

  if (!error.response) {
    return toast.error("No server response");
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      toast.error(error.response.data?.message ?? "Invalid input");
      break;
    case 401:
      if (logout) logout();
      if (navigate) navigate("/");
      toast.error("Unauthorized");
      break;
    case 403:
      toast.error("Access denied");
      break;
    case 404:
      toast.error(error.response.data?.message ?? "Not found");
      break;
    case 409:
      toast.error("Already exists");
      break;
    case 500:
      toast.error("Server error");
      break;
    default:
      toast.error("Unexpected error occurred");
  }
}
