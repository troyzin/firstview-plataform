
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, User, KeyRound, Loader2 } from "lucide-react";

const Profile = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar(e.target.files[0]);
      // Create a preview
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatar || !user) return null;

    const fileExt = avatar.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar);

      if (uploadError) {
        toast.error("Erro ao fazer upload da imagem");
        console.error("Error uploading avatar:", uploadError);
        return null;
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Unexpected error during avatar upload:", error);
      toast.error("Erro inesperado ao fazer upload da imagem");
      return null;
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    let newAvatarUrl = avatarUrl;

    try {
      // Upload avatar if a new one was selected
      if (avatar) {
        newAvatarUrl = await uploadAvatar();
      }

      // Update profile information
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        toast.error("Erro ao atualizar perfil");
        console.error("Error updating profile:", error);
        return;
      }

      // Update password if provided
      if (password && password === confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) {
          toast.error("Erro ao atualizar senha");
          console.error("Error updating password:", passwordError);
          return;
        }

        setPassword("");
        setConfirmPassword("");
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
      toast.error("Erro inesperado ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      return false;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return false;
      }
      if (password.length < 6) {
        return false;
      }
    }

    return true;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Perfil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-gray-800 text-xl">
                      {profile?.full_name ? getInitials(profile.full_name) : <User />}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 p-2 rounded-full cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Clique no ícone da câmera para fazer upload de uma nova foto
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    className="bg-gray-800 border-gray-700" 
                    disabled 
                  />
                  <p className="text-xs text-gray-400">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="bg-gray-800 border-gray-700" 
                    placeholder="Seu nome completo"
                  />
                </div>

                <Separator className="bg-gray-800 my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="new-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700" 
                          placeholder="Nova senha"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700" 
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                      {password !== confirmPassword && confirmPassword && (
                        <p className="text-xs text-red-500">As senhas não coincidem</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={updateProfile} 
                    disabled={!validateForm() || isLoading} 
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
