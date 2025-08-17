export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Racket Ladder</h1>
      
      <div className="max-w-3xl">
        <p className="text-lg mb-4">
          Racket Ladder is a comprehensive platform for managing tennis and racquet sport tournaments and leagues.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Features</h2>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Tournament and season management</li>
          <li>Player registration and management</li>
          <li>Match scheduling and results tracking</li>
          <li>Payment processing for entry fees</li>
          <li>Automated notifications and communications</li>
          <li>Real-time ladder rankings</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">How It Works</h2>
        <p className="mb-4">
          Club administrators can create seasons, manage players, and track matches. 
          Players can join seasons, view their matches, and track their progress on the ladder.
        </p>
        
        <p className="mb-4">
          Our platform handles everything from initial registration to final rankings, 
          making it easy for clubs to focus on what matters most - great tennis!
        </p>
      </div>
    </div>
  );
}
