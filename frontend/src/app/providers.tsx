import { AuthProvider } from "../features/auth/context/authContext";
import { WatchlistProvider } from "../features/watchlists/context/watchlistContext";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <AuthProvider>
      <WatchlistProvider>
        {children}
      </WatchlistProvider>
    </AuthProvider>
  );
}