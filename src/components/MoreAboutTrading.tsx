import React from "react";
import { Card, Carousel } from "./ui/CardsCarousel";
import { generateRandomId } from "@/lib/utils";

const MoreAboutTrading = () => {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return <Carousel items={cards} />;
};

export default MoreAboutTrading;

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                The first rule of Apple club is that you boast about Apple club.
              </span>{" "}
              Keep a journal, quickly jot down a grocery list, and take amazing
              class notes. Want to convert those notes to text? No problem.
              Langotiya jeetu ka mara hua yaar is ready to capture every
              thought.
            </p>
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    id: generateRandomId(),
    category: "Artificial Intelligence",
    title: "Academy",
    src: "/assets/moreAboutTrading/Academy.webp",
    content: <DummyContent />,
  },
  {
    id: generateRandomId(),
    category: "Productivity",
    title: "Charts",
    src: "/assets/moreAboutTrading/Charts.webp",
    content: <DummyContent />,
  },
  {
    id: generateRandomId(),
    category: "Product",
    title: "Trading Tools",
    src: "/assets/moreAboutTrading/TradingTools.webp",
    content: <DummyContent />,
  },

  {
    id: generateRandomId(),
    category: "Product",
    title: "Academy",
    src: "/assets/moreAboutTrading/Academy.webp",
    content: <DummyContent />,
  },
  {
    id: generateRandomId(),
    category: "iOS",
    title: "Productivity",
    src: "/assets/moreAboutTrading/Charts.webp",
    content: <DummyContent />,
  },
  {
    id: generateRandomId(),
    category: "Hiring",
    title: "Trading",
    src: "/assets/moreAboutTrading/TradingTools.webp",
    content: <DummyContent />,
  },
];
