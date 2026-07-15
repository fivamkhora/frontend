import {
  type ClassroomMemberRouteContext,
  updateClassroomMember,
} from "@/app/api/secretaria/classes/_lib/updateClassroomMember";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: ClassroomMemberRouteContext,
) {
  return updateClassroomMember(request, context, "POST", "teachers");
}

export async function DELETE(
  request: Request,
  context: ClassroomMemberRouteContext,
) {
  return updateClassroomMember(request, context, "DELETE", "teachers");
}
