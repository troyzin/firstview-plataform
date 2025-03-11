
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Key, User } from "lucide-react";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      if (!user) return;

      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!password || password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast.error("Erro ao atualizar senha");
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      setUploading(true);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      if (!data) throw new Error("Failed to get public URL");
      
      // Update the user profile with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      toast.success("Avatar atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      toast.error("Erro ao fazer upload do avatar");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!fullName) return "U";
    
    const nameParts = fullName.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Perfil do Usuário</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24 mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar do usuário" />
                ) : null}
                <AvatarFallback className="bg-red-600 text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-red-600 rounded-full p-2 cursor-pointer hover:bg-red-700 transition-colors"
              >
                <Upload size={16} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUploadAvatar} 
                  disabled={uploading}
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-gray-400">{uploading ? "Enviando..." : "Clique no ícone para alterar sua foto"}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center"><User size={18} className="mr-2" /> Informações Pessoais</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <Input value={user?.email || ""} disabled className="bg-gray-800 border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="bg-gray-800 border-gray-700" 
                  />
                </div>
                <Button onClick={handleUpdateProfile} className="w-full">Salvar Informações</Button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center"><Key size={18} className="mr-2" /> Alterar Senha</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nova Senha</label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-gray-800 border-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar Nova Senha</label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="bg-gray-800 border-gray-700" 
                  />
                </div>
                <Button onClick={handleUpdatePassword} className="w-full">Atualizar Senha</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
