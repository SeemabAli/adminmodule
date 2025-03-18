import useSWR from "swr";

export const useService = <Response>(
  service: (...args: unknown[]) => Promise<Response>,
) => {
  const response = useSWR<Response>("null", service);
  return response;
};
