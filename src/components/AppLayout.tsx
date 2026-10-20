import TopNav from "./TopNav";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-hero">
    <TopNav />
    <main>{children}</main>
  </div>
);

export default AppLayout;
