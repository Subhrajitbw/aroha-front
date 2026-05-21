import { useQuery } from "@tanstack/react-query";
import { medusaApi } from "../lib/react-query";

export const useRegion = () => {
  return useQuery({
    queryKey: ['region'],
    queryFn: () => medusaApi.getRegion(),
  });
};
