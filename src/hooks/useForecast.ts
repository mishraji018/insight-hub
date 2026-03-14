import { useQuery } from "@tanstack/react-query";
import { getPredictions } from "@/api/endpoints";

export function useForecast(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["predictions", params],
    queryFn: () => getPredictions(params),
  });
}
