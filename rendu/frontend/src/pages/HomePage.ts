export const HomePage = (): string => `
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
    <h1 class="text-6xl font-bold mb-8 animate-bounce">Viiiiite, un Pong vite fait !</h1>
    <nav class="flex flex-col space-y-4">
      <a href="#" data-route="/choice-game" class="btn btn-primary">Jouer</a>
      <a href="#" data-route="/tournament" class="btn btn-secondary">Tournois</a>
      <a href="#" data-route="/profile" class="btn btn-secondary">Profil</a>
      <a href="#" data-route="/leaderboard" class="btn btn-secondary">Classement</a>
      <a href="#" data-route="/about" class="btn btn-secondary">À propos</a>
      <a href="#" data-route="/login" class="btn btn-outline">Se connecter</a>
      <a href="#" data-route="/register" class="btn btn-outline">S'inscrire</a>
    </nav>
  </div>
`;