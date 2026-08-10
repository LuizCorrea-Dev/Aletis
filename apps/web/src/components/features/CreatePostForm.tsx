"use client";

import { useCreatePostViewModel } from "@/hooks/view-models/useCreatePostViewModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CreatePostForm() {
  const { isSubmitting, message, success, handleSubmit } = useCreatePostViewModel();

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Desabafo</CardTitle>
          <CardDescription>Compartilhe o que está sentindo. O ambiente é seguro e anônimo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            name="content"
            placeholder="O que está pesando no seu coração hoje?" 
            rows={4}
            required
            disabled={isSubmitting}
          />
          <input type="hidden" name="type" value="post" />
          
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${success ? 'bg-mint-500/10 text-mint-500 border border-mint-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Compartilhar Vibe"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
