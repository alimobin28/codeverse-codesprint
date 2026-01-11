import { RoundTemplate } from "./RoundTemplate";

const Round1 = () => {
  // NO LOGIC HERE. NO useEffect. NO Checks.
  // All logic is now handled by RoundTemplate.
  return (
    <RoundTemplate
      roundNumber={1}
      title="Fragmented Logic Recovery"
      contestId="779643"
      durationSeconds={55 * 60} 
      backgroundImage="/e2.png" 
      allowedProblems={['A', 'B', 'C', 'D', 'E']}
    />
  );
};

export default Round1;