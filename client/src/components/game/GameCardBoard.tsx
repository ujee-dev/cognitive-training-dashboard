import backImage from "../../assets/game/cards/BACK.png";
import type { CardItem } from '../../types/game';

interface Props {
  cards: CardItem[];
  onCardClick: (id: number) => void;
}

export default function GameCard({ cards, onCardClick }: Props) {
  if (!Array.isArray(cards)) return null;

  if (cards.length === 0) {
    return <div>NO CARDS YET</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map(card => (
        <button
          key={card.id}
          className="p-0 border-0"
          onClick={() => onCardClick(card.id)}
        >
          <img
            src={card.isFlipped || card.isMatched ? card.image : backImage}
            alt="card"
            className="bg-[#ffffff]"
          />
        </button>
      ))}
    </div>
  );
}