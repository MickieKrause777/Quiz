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
import { Checkbox } from "@/components/ui/checkbox";

const AnswerInput = ({
  questionIndex,
  answerIndex,
  form,
}: {
  questionIndex: number;
  answerIndex: number;
  form: ReturnType<typeof useForm<QuizFormValues>>;
}) => {
  return (
    <>
      <div className="my-3">
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.answers.${answerIndex}.text`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    className="input"
                    placeholder={`Answer ${answerIndex + 1}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${questionIndex}.answers.${answerIndex}.isCorrect`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs label">Correct?</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const otherAnswers = [0, 1, 2, 3].filter(
                          (i) => i !== answerIndex,
                        );

                        otherAnswers.forEach((i) => {
                          form.setValue(
                            `questions.${questionIndex}.answers.${i}.isCorrect`,
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

        <div className="my-1.5 px-5">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.answers.${answerIndex}.description`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="input-description"
                    placeholder={`Description for Answer ${answerIndex + 1}`}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};
export default AnswerInput;
