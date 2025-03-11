
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar seu cadastro.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Você será redirecionado para o dashboard.",
        });
      }
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro durante a autenticação";
      
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha inválidos";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado";
      }
      
      toast({
        title: "Erro de autenticação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-8 text-center">
          {/* Logo adicionada aqui */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Logo da empresa" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">First View Platform</h1>
          <p className="text-gray-400">
            {isSignUp
              ? "Crie sua conta para gerenciar seus recursos"
              : "Faça login na sua conta para continuar"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Crie uma senha" : "Sua senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                minLength={6}
              />
            </div>
            {!isSignUp && (
              <div className="text-right">
                <a href="#" className="text-sm text-red-500 hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (
              "Processando..."
            ) : isSignUp ? (
              "Criar Conta"
            ) : (
              "Entrar"
            )}
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-red-500 hover:underline"
            >
              {isSignUp ? "Faça login" : "Cadastre-se"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
