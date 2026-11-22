import { createContext, useContext, useEffect } from "react";

export const ShellContext = createContext({ setTitle: () => {} });

export const useShellTitle = (title) => {
  const { setTitle } = useContext(ShellContext);
  useEffect(() => {
    setTitle(title);
    document.title = title ? `${title} · NXTHREADS` : "NXTHREADS";
  }, [title, setTitle]);
};
