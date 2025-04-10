import React from "react";
import { formateDate } from "@/lib/utils";

const QuizHeroSection = ({ post }: { post: Quiz }) => {
  const { createdAt, title, description } = post;

  return (
    <section className="primary_container !min-w-[230px] !max-h-[230px] blue-gradient">
      <p className="tag">{formateDate(createdAt.toString())}</p>
      <h1 className="text-3xl heading rounded-4xl">{title}</h1>
      <p className="sub-heading !max-w-5xl">{description}</p>
    </section>
  );
};
export default QuizHeroSection;
