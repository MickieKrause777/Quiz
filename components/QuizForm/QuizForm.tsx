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
import { createQuizAction } from "@/lib/actions/createQuiz";
import { toast } from "sonner";
import { CATEGORIES } from "@/constants/categories";
import QuestionField from "@/components/QuizForm/QuestionField";

const quizSchema = () => {
  return z.object({
    title: z.string().min(3, "Title required."),
    description: z
      .string()
      .min(10, "Description is too short, minimum 10 characters."),
    category: z.string().min(3, "Please choose a category"),
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
      .min(6, "At least six question is required."),
  });
};

const getDefaultQuestion = () => ({
  question: "",
  answers: [
    { text: "", isCorrect: true, description: "" },
    { text: "", isCorrect: false, description: "" },
    { text: "", isCorrect: false, description: "" },
    { text: "", isCorrect: false, description: "" },
  ],
});

export type QuizFormValues = z.infer<ReturnType<typeof quizSchema>>;

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
      questions: [getDefaultQuestion()],
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

  async function onSubmit(data: QuizFormValues) {
    setSubmitting(true);
    setError(null);

    // ➕ NEU: Validierung, ob mindestens 6 Fragen vorhanden sind
    if (data.questions.length < 6) {
      setError(
        "A quiz must contain at least 6 questions. Please add more questions.",
      );
      setSubmitting(false);
      return;
    }

    try {
      const result = await createQuizAction(data);

      if (!result?.success) {
        setError(result?.error || "An error occurred while creating the quiz.");
        return;
      }

      toast.success("Quiz created successfully!");
      router.push("/");

      return result;
    } catch (err) {
      setError("An unexpected error has occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const questionsError = form.formState.errors.questions?.message;

  return (
    <div className="card lg:mx-50 mx-20 my-20 p-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form">
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

          <div>
            {questionFields.map((field, index) => (
              <QuestionField
                key={field.id}
                questionIndex={index}
                form={form}
                onRemove={() => removeQuestion(index)}
                showRemoveButton={questionFields.length > 1}
              />
            ))}
          </div>

          {questionsError && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {questionsError}
            </div>
          )}

          <Button
            className="btn"
            type="button"
            onClick={() => appendQuestion(getDefaultQuestion())}
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
