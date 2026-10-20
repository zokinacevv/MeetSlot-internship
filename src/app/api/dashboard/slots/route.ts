import { failure, success } from "@/lib/api";
import { dashboardSlots } from "@/services/slot.service";
export async function GET() {
  try { return success({ slots: await dashboardSlots() }); }
  catch { return failure("DATABASE_ERROR", "Unable to load appointments right now.", 503); }
}
