import { useState } from "react";
import { createPostAction } from "@/app/actions/post-actions";

export function useCreatePostViewModel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    
    // Calls the Server Action
    const result = await createPostAction(formData);

    setIsSubmitting(false);
    setMessage(result.message);
    setSuccess(result.success);

    if (result.success) {
      e.currentTarget.reset();
    }
  };

  return {
    isSubmitting,
    message,
    success,
    handleSubmit,
  };
}
