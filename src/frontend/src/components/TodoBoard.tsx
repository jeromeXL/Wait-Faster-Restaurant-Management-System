import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { JSX } from "react/jsx-runtime";

export const TodoBoard = () => {
  return (
    <div className="w-full bg-transparent text-neutral-50 flex justify-center items-start">
      <Board />
    </div>
  );
};

const Board = () => {
  const [cards, setCards] = useState(() => {
    const savedCards = localStorage.getItem("cards");
    return savedCards ? JSON.parse(savedCards) : DEFAULT_CARDS;
  });

  useEffect(() => {
    localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  return (
    <div className="flex flex-col md:flex-row max-w-6xl w-full gap-3 overflow-auto p-4 md:p-12">
      {["todo", "doing", "done"].map(status => (
        <Column
          key={status}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
          column={status}
          headingColor={`text-${status === "todo" ? "yellow-200" : status === "doing" ? "blue-200" : "emerald-200"}`}
          cards={cards}
          setCards={setCards}
        />
      ))}
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

const Column = ({ title, headingColor, cards, column, setCards }: any) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: { dataTransfer: { setData: (arg0: string, arg1: any) => void; }; }, card: { id: any; }) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: { dataTransfer: { getData: (arg0: string) => any; }; }) => {
    const cardId = e.dataTransfer.getData("cardId");
    setActive(false);
    clearHighlights();
    const newCards = cards.filter((card: { id: any; }) => card.id !== cardId);
    const movedCard = cards.find((card: { id: any; }) => card.id === cardId);
    if (movedCard) {
      movedCard.column = column;
      newCards.push(movedCard);
    }
    setCards(newCards);
  };

  const handleDragOver = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setActive(true);
  };

  const clearHighlights = () => {
    document.querySelectorAll(`[data-column="${column}"]`).forEach((indicator) => {
      if (indicator instanceof HTMLElement) {
        indicator.style.opacity = "0";
      }
    });
  };

  const filteredCards = cards.filter((card: { column: any; }) => card.column === column);

  return (
    <div className="flex flex-col w-full sm:w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={() => setActive(false)}
        className={`flex-1 min-h-40 transition-colors overflow-auto ${active ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}
      >
        {filteredCards.map((card: JSX.IntrinsicAttributes & { title: any; id: any; column: any; handleDragStart: any; }) => (
          <Card key={card.id} {...card} handleDragStart={handleDragStart} />
        ))}
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

const Card = ({ title, id, handleDragStart }: any) => (
  <motion.div
    layout
    layoutId={id.toString()}
    draggable="true"
    onDragStart={(e) => handleDragStart(e, { id })}
    className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
  >
    <p className="text-sm text-neutral-100">{title}</p>
  </motion.div>
);

const BurnBarrel = ({ setCards }: any) => {
  const [active, setActive] = useState(false);

  const handleDragEnd = (e: { dataTransfer: { getData: (arg0: string) => any; }; }) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev: any[]) => prev.filter((card: { id: any; }) => card.id !== cardId));
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={(e) => { e.preventDefault(); setActive(true); }}
      onDragLeave={() => setActive(false)}
      className={`mt-10 grid place-content-center rounded border text-3xl
                  ${active ? "border-red-800 bg-red-800/20 text-red-500" : "border-neutral-500 bg-neutral-500/20 text-neutral-500"}
                  md:h-56 md:w-56 h-36 w-90`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, setCards }: any) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newCard = { title: text.trim(), id: Math.random().toString(), column };
    setCards((prev: any) => [...prev, newCard]);
    setText("");
    setAdding(false);
  };

  return (
    adding ? (
      <motion.form layout onSubmit={handleSubmit}>
        <textarea onChange={(e) => setText(e.target.value)} autoFocus placeholder="Add new task..." className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0" />
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50">Close</button>
          <button type="submit" className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"><FiPlus /><span>Add</span></button>
        </div>
      </motion.form>
    ) : (
      <motion.button layout onClick={() => setAdding(true)} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50">
        <FiPlus /><span>Add card</span>
      </motion.button>
    )
  );
};

const DEFAULT_CARDS = [
  // TODO
  { title: "Close restaurant cleanup", id: "6", column: "todo" },
  { title: "Finalize Menu Design", id: "11", column: "todo" },
  { title: "Establish Supplier Agreements", id: "12", column: "todo" },

  // DOING
  { title: "Order knives for kitchen", id: "8", column: "doing" },

  // DONE
  { title: "Open restaurant preparations", id: "10", column: "done" },
  { title: "Health and Safety Inspection Passed", id: "13", column: "done" },
  { title: "Staff Training Completed", id: "14", column: "done" }
];
