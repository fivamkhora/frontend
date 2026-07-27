import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL, jsonError, parseJsonSafely } from "@/lib/bff";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MemberRaw = {
  id: string;
  classroomId: string;
  userId: number | string;
  role: string;
  createdAt: string;
};

type UserAuthData = {
  id: number | string;
  username?: string;
  role?: string;
  name?: string;
  email?: string;
};

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return jsonError("Não autenticado.", 401);
  }

  const { id } = await params;

  if (!id) {
    return jsonError("ID da turma não informado.", 400);
  }

  try {
    const resMembers = await fetch(
      `${BFF_BASE_URL}/api/v1/turma/classrooms/${encodeURIComponent(id)}/classrooms`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        cache: "no-store",
      },
    );

    const membersText = await resMembers.text();
    const membersData: MemberRaw[] = parseJsonSafely(membersText);

    if (!resMembers.ok || !Array.isArray(membersData)) {
      return Response.json([]);
    }

    const membersWithUserData = await Promise.all(
      membersData.map(async (member) => {
        const fallbackUser = {
          name: `Usuário ${member.userId}`,
          email: "E-mail indisponível",
          username: `user_${member.userId}`,
        };

        if (!member?.userId) {
          return {
            ...member,
            user: fallbackUser,
          };
        }

        try {
          const resUser = await fetch(
            `${BFF_BASE_URL}/api/v1/auth/user/${member.userId}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.token}`,
              },
              cache: "no-store",
            },
          );

          if (resUser.ok) {
            const userText = await resUser.text();
            const userData: UserAuthData = parseJsonSafely(userText);

            return {
              ...member,
              user: {
                name: userData?.name || fallbackUser.name,
                email: userData?.email || fallbackUser.email,
                username: userData?.username || fallbackUser.username,
              },
            };
          }
        } catch {}

        return {
          ...member,
          user: fallbackUser,
        };
      }),
    );

    return Response.json(membersWithUserData);
  } catch {
    return jsonError("Erro ao buscar dados dos membros da turma.", 500);
  }
}
