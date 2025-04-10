"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import { signInWithCredentials, signUp } from "@/lib/actions/auth";

const authFormSchema = (type: FormType) => {
  return z.object({
    fullName:
      type === "sign-up"
        ? z.string().min(3, {
            message: "Username must be at least 3 characters.",
          })
        : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  });
};
const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const result = await signUp(data as AuthCredentials);
        if (result.error) toast.error(result.error);
      } else {
        const result = await signInWithCredentials(data);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Signed in successfully.");
          router.push("/");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image
            src="/logo.ico"
            alt="logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <h2 className="text-primary-100">Quiz Master</h2>
        </div>
        <h3 className="text-primary-100">Practice with Gamification</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="fullName"
                label="Name"
                placeholder="Your Name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email adress"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            <Button className="btn" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>

          <p className="text-center">
            {isSignIn ? "No account yet?" : "Have an account?"}
            <Link
              href={!isSignIn ? "/sign-in" : "/sign-up"}
              className="font-bold text-user-primary ml-1"
            >
              {!isSignIn ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};
export default AuthForm;
