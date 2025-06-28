"use client";
import React, { useState } from "react";
import { EyeIcon, Users } from "lucide-react";
import { formateDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { joinMatchmaking } from "@/lib/actions/matchmaking";

const QuizCard = ({ post }: { post: QuizTypeCard }) => {
  const { quizzes, users: author } = post;
  const router = useRouter();

  // State für das Anzeigen des Tooltips
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMatchmaking = async () => {
    try {
      toast.loading("Finding opponents...");

      const result = await joinMatchmaking(quizzes.category);

      if (result.success) {
        toast.dismiss();
        toast.success("Opponents found! Starting game");
        router.push(`/multiplayer/${result.matchId}`);
      } else {
        toast.dismiss();
        toast.error(
          result?.message ||
            "Failed to find opponents, check Matchmaking for status",
        );
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Something wen wrong. Please try again");
    }
  };

  return (
    <>
      <li className="quiz-card group">
        <div className="flex-between">
          <p className="quiz_card_date text-light-600">
            {formateDate(quizzes.createdAt.toString())}
          </p>
          <div className="flex gap-1.5">
            <EyeIcon className="size-6 text-black" />
            <span className="text-16-medium">{quizzes.views}</span>
          </div>
        </div>

        <div className="flex-between mt-5 gap-5">
          <div className="flex-1">
            <Link href={`/?query=${author?.fullName.toLowerCase()}`}>
              <p className="text-16-medium line-clamp-1">
                Created by: {author?.fullName}
              </p>
            </Link>

            <Link href={`/quiz/${quizzes.id}`}>
              <h3 className="text-26-semibold line-clamp-1">{quizzes.title}</h3>
            </Link>
          </div>
        </div>

        <Link href={`/quiz/${quizzes.id}`}>
          <p className="quiz-card_desc">{quizzes.description}</p>
        </Link>

        <div className="flex-between gap-3 mt-5">
          <div className="relative flex-between gap-1">
            {/* Multiplayer-Button mit Tooltip */}
            <Button
              className="btn-secondary relative group"
              onClick={handleMatchmaking}
              onMouseEnter={() => setShowTooltip(true)} // Tooltip anzeigen bei Hover
              onMouseLeave={() => setShowTooltip(false)} // Tooltip verstecken
            >
              <Users size={16} />
              {/* Tooltip für den Button */}
              {showTooltip && (
                <span className="absolute -top-[50px] left-3 transform -translate-x-3 bg-black text-white text-2xl px-2 py-1 rounded shadow-lg z-10">
                  Click to start Multiplayer
                </span>
              )}
            </Button>

            <Link href={`/?query=${quizzes.category?.toLowerCase()}`}>
              <p className="text-16-medium">{quizzes.category}</p>
            </Link>
          </div>

          <Button className="btn-primary">
            <Link href={`/quiz/${quizzes.id}`}>Details</Link>
          </Button>
        </div>
      </li>
    </>
  );
};
export default QuizCard;
