
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, User, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeValidationError, setCodeValidationError] = useState("");
  const [codeValidationSuccess, setCodeValidationSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (user && !authLoading) {
      console.log('[AUTH PAGE] User already authenticated, redirecting');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  // Validate auth code when it changes
  useEffect(() => {
    if (isSignUp && authCode.trim().length >= 6) {
      validateAuthCode(authCode.trim())
        .then(isValid => {
          setCodeValidationSuccess(isValid);
          setCodeValidationError(isValid ? "" : "Código de autenticação inválido");
        })
        .catch(error => {
          console.error('[AUTH PAGE] Error validating auth code:', error);
          setCodeValidationSuccess(false);
          setCodeValidationError("Erro ao validar código");
        });
    } else {
      setCodeValidationSuccess(false);
      setCodeValidationError("");
    }
  }, [authCode, isSignUp]);

  const validateAuthCode = async (code) => {
    try {
      console.log('[AUTH PAGE] Validating auth code:', code);
      const { data, error } = await supabase.rpc('validate_registration_code', { code });
      
      if (error) {
        console.error('[AUTH PAGE] Error validating auth code:', error);
        return false;
      }
      
      console.log('[AUTH PAGE] Auth code validation result:', data);
      return data;
    } catch (error) {
      console.error('[AUTH PAGE] Unexpected error validating auth code:', error);
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      if (isSignUp) {
        console.log('[AUTH PAGE] Attempting signup for:', email);
        
        // Validate auth code for registration
        if (!authCode.trim()) {
          setCodeValidationError("Código de autenticação é obrigatório");
          setLoading(false);
          return;
        }
        
        const isCodeValid = await validateAuthCode(authCode.trim());
        if (!isCodeValid) {
          console.log('[AUTH PAGE] Invalid auth code provided:', authCode);
          setCodeValidationError("Código de autenticação inválido. Apenas funcionários da empresa podem se registrar.");
          setLoading(false);
          return;
        }
        
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
        
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar seu cadastro.");
      } else {
        console.log('[AUTH PAGE] Attempting login for:', email);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro durante a autenticação";
      
      console.error('[AUTH PAGE] Authentication error:', error);
      
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha inválidos";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff3335]"></div>
        <p className="ml-2 text-white">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#141414] p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Logo da empresa" 
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {isSignUp ? "Criar nova conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-gray-400">
            {isSignUp
              ? "Crie sua conta para gerenciar seus recursos"
              : "Faça login na sua conta para continuar"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="pl-10 bg-black border-gray-800 focus-visible:ring-[#ff3335] focus-visible:ring-offset-black text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-black border-gray-800 focus-visible:ring-[#ff3335] focus-visible:ring-offset-black text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Crie uma senha" : "Sua senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-black border-gray-800 focus-visible:ring-[#ff3335] focus-visible:ring-offset-black text-white"
                minLength={6}
              />
            </div>
            {!isSignUp && (
              <div className="text-right">
                <a href="#" className="text-sm text-[#ff3335] hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="authCode" className="text-white">Código de Autenticação</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="authCode"
                  type="text"
                  placeholder="Digite o código de autenticação"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  required={isSignUp}
                  className={`pl-10 bg-black border-gray-800 focus-visible:ring-[#ff3335] focus-visible:ring-offset-black text-white ${
                    codeValidationSuccess ? "border-green-500" : codeValidationError ? "border-red-500" : ""
                  }`}
                />
                {codeValidationSuccess && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="text-green-500">✓</div>
                  </div>
                )}
              </div>
              {codeValidationError && (
                <p className="text-sm text-[#ff3335]">{codeValidationError}</p>
              )}
              {codeValidationSuccess && (
                <p className="text-sm text-green-500">Código válido!</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                O código de autenticação padrão é "123456". Se necessário, solicite um novo código ao administrador.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#ff3335] hover:bg-[#ff3335]/90 text-white gap-2"
            disabled={loading || (isSignUp && !codeValidationSuccess)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                Processando...
              </span>
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
              onClick={() => {
                setIsSignUp(!isSignUp);
                setCodeValidationError("");
                setCodeValidationSuccess(false);
                setAuthCode("");
              }}
              className="ml-2 text-[#ff3335] hover:underline"
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
