"use client";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createQuizAction } from "@/lib/actions/createQuiz";
import { toast } from "sonner";
import { CATEGORIES } from "@/constants/categories";

const quizSchema = () => {
  return z.object({
    title: z.string().min(3, "Title required."),
    description: z.string().min(10, "Description is too short"),
    category: z.string().min(3, "Category is too short"),
    questions: z
      .array(
        z.object({
          question: z.string().min(3, "Question is too short."),
          answers: z
            .array(
              z.object({
                text: z.string().min(2, "Answer is too short."),
                isCorrect: z.boolean(),
                description: z.string().optional(),
              }),
            )
            .length(4, "Each question must have 4 answers."),
        }),
      )
      .min(1, "At least one question is required."),
  });
};

const QuizForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formSchema = quizSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      questions: [
        {
          question: "",
          answers: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(data: any) {
    //Todo : fix type
    setSubmitting(true);
    setError(null);

    try {
      const result = await createQuizAction(data);

      if (!result?.success) {
        setError(result?.error || "Failed to create quiz");
      }

      toast.success("Quiz created successfully");

      router.push("/");

      return result;
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card lg:mx-50 mx-20 my-20 p-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">Title</FormLabel>
                <FormControl>
                  <Input
                    className="input"
                    placeholder="Quiz-Title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">Description</FormLabel>
                <FormControl>
                  <Input
                    className="input"
                    placeholder="Short description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="input">
                      <SelectValue
                        className="text-light-100"
                        placeholder="Select a category"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {questionFields.map((question, qIndex) => (
            <div key={question.id} className="p-4 border rounded space-y-3">
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name={`questions.${qIndex}.question`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">
                        Question {qIndex + 1}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="input"
                          placeholder="Question"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {questionFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2 mt-6 text-light-100"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {form.watch(`questions.${qIndex}.answers`).map((_, aIndex) => (
                <div key={aIndex} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`questions.${qIndex}.answers.${aIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            className="input"
                            placeholder={`Answer ${aIndex + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`questions.${qIndex}.answers.${aIndex}.isCorrect`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs label">
                          Correct?
                        </FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const otherAnswers = [0, 1, 2, 3].filter(
                                  (i) => i !== aIndex,
                                );

                                otherAnswers.forEach((i) => {
                                  form.setValue(
                                    `questions.${qIndex}.answers.${i}.isCorrect`,
                                    false,
                                  );
                                });
                              }
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          ))}

          <Button
            className="btn"
            type="button"
            onClick={() =>
              appendQuestion({
                question: "",
                answers: [
                  { text: "", isCorrect: true },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                ],
              })
            }
          >
            ➕ New Question
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="!bg-green-600 !hover:bg-green-700 !text-white w-full rounded-full"
          >
            {submitting ? "Generating..." : "✅ Generate Quiz"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default QuizForm;
