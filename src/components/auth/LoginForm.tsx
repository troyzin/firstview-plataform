
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    
    // For demo purposes, simulate a login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login realizado com sucesso");
      navigate('/dashboard');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Simulate Google login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login com Google realizado");
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-produflow-gray-900 rounded-lg border border-gray-800 shadow-2xl animate-scale-in">
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
          <svg className="w-12 h-12 text-produflow-red" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold">ProduFlow</h2>
        <p className="text-gray-400 mt-2">Gerenciamento de produções audiovisuais</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-produflow-gray-800 border-gray-700"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Senha</Label>
            <a href="#" className="text-sm text-produflow-red hover:underline">
              Esqueceu a senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-produflow-gray-800 border-gray-700"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-produflow-red hover:bg-red-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Processando...' : 'Entrar'}
        </Button>
        
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700"></span>
          </div>
          <div className="relative px-4 bg-produflow-gray-900 text-sm text-gray-400">
            ou continue com
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-gray-700 hover:bg-gray-800 text-white"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Google
        </Button>
      </form>
      
      <div className="text-center text-sm text-gray-400">
        Não tem uma conta?{" "}
        <a href="#" className="text-produflow-red hover:underline">
          Fale com seu administrador
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
