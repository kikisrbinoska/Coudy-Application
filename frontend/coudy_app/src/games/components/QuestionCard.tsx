import { QuestionDto } from "@/games/api/gameSessionApi";

interface Props {
  question: QuestionDto;
}

const QuestionCard = ({ question }: Props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {question.text}
      </h2>
    </div>
  );
};

export default QuestionCard;