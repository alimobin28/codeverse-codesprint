import { RoundTemplate } from "./RoundTemplate";

const Round1 = () => {
  return (
    <RoundTemplate
      roundNumber={1}
      title="Fragmented Logic Recovery"
      contestId="779643"
      backgroundImage="/e2.png"
      allowedProblems={["A", "B", "C", "D", "E"]}
      showHints={true} // Round 1 has hints
    />
  );
};

export default Round1;