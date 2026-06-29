interface Props {
  score: number;
}

const Scoreboard = ({ score }: Props) => {
  return (
    <div className="font-bold text-primary">
      Score: {score}
    </div>
  );
};

export default Scoreboard;