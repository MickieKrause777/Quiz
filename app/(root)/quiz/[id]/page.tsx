import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import QuizHeroSection from "@/components/QuizHeroSection";
import { questionByQuizIdQuery } from "@/database/queries";
import { Lightbulb, Play } from "lucide-react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const _id = (await params).id;
  const post = await questionByQuizIdQuery(_id);
  const { questions, users, category, id } = post;
  const { fullName: name } = users;

  return (
    <>
      <QuizHeroSection post={post} />

      <section className="section_container ">
        <div className="rounded-full px-10 py-3 max-sm:px-16 my-3 blue-gradient">
          <div className="relative z-10 text-center mb-8">
            <div className="inline-flex items-center gap-3 m-3">
              <div className="p-3 bg-white rounded-full backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-light-400" />
              </div>
              <h2 className="text-2xl font-bold text-light-400">
                Questions Examples
              </h2>
            </div>
            <hr className="divider !my-4 w-24" />

            <ul className="grid md:grid-cols-2 sm:grid-cols-1 gap-5 mt-7 mb-6">
              {questions?.slice(0, 2).map((question: Question) => (
                <p className="text-16-medium tag text-white" key={question?.id}>
                  {question?.question}
                </p>
              ))}
            </ul>
          </div>
        </div>

        <hr className="divider" />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${name}`}
              className="flex gap-2 items-center mb-3"
            >
              <div>
                <p className="text-20-medium text-white">Created by: {name}</p>
                <p className="text-16-medium text-white">@{name}</p>
              </div>
            </Link>

            <Link href={`/quiz/${_id}/play`} className="w-80">
              <Button className="group relative overflow-hidden btn-primary font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 w-full h-15">
                <Play className="w-5 h-5 group-hover:animate-pulse" />
                <span className="relative z-10">Play Quiz</span>
              </Button>
            </Link>

            <p className="category-tag">{category}</p>
          </div>
        </div>

        <hr className="divider" />

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
};
export default Page;
