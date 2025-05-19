import { useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QuizFormValues } from "./QuizForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import AnswerInput from "@/components/QuizForm/AnswerInput";

const QuestionField = ({
  questionIndex,
  form,
  onRemove,
  showRemoveButton,
}: {
  questionIndex: number;
  form: ReturnType<typeof useForm<QuizFormValues>>;
  onRemove: () => void;
  showRemoveButton: boolean;
}) => {
  return (
    <div className="p-4 border rounded space-y-3">
      <div className="flex items-center justify-between">
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="label">
                Question {questionIndex + 1}
              </FormLabel>
              <FormControl>
                <Input className="input" placeholder="Question" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showRemoveButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2 mt-6 text-light-100"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, answerIndex) => (
          <AnswerInput
            key={answerIndex}
            questionIndex={questionIndex}
            answerIndex={answerIndex}
            form={form}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionField;
