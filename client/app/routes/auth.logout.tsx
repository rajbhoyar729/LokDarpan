import type { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
    return logout(request);
}

// Also handle GET requests for direct navigation
export async function loader({ request }: ActionFunctionArgs) {
    return logout(request);
}
