import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-violet-400">
            Login Admin
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Entre com suas credenciais para gerenciar licenças
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@exemplo.com" 
              className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-violet-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-zinc-300">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              className="border-zinc-800 bg-zinc-950 text-zinc-100 focus-visible:ring-violet-500"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-violet-600 text-zinc-100 hover:bg-violet-700">
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
