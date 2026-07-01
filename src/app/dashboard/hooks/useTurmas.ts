import { useQuery } from "@tanstack/react-query";
import { getTurmas } from "../modules/getTurmas";

export function useTurmas() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turmas"],
    queryFn: getTurmas,
    staleTime: 1000 * 60 * 5,
  });

  return {
    turmas: data || [],
    isLoading,
    hasError: !!error,
    atualizarTurmas: refetch,
  };
}
