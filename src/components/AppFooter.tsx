export default function AppFooter() {
  return (
    <footer className="border-t bg-card/50 py-4 px-6">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} AeroFarm Simulator — Indoor Aeroponic Farming Capstone Project</p>
        <p>Built with 🌱 for sustainable farming</p>
      </div>
    </footer>
  );
}
