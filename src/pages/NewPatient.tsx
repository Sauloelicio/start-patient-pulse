import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { toast } from "sonner";

const NewPatient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('patient-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('patient-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase.from("patients").insert({
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        pathology: formData.get("pathology") as string,
        treatment_start_date: formData.get("treatment_start_date") as string,
        session_package: formData.get("session_package") as string,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success("Paciente cadastrado com sucesso!");
      navigate("/patients");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/patients")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="max-w-2xl mx-auto shadow-elevated animate-fade-in">
          <CardHeader className="bg-gradient-primary text-primary-foreground">
            <CardTitle className="text-2xl">Novo Paciente</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4 border-4 border-primary">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback className="bg-muted">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity">
                    <Camera className="h-4 w-4" />
                    <span>Adicionar Foto</span>
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pathology">Patologia *</Label>
                  <Input
                    id="pathology"
                    name="pathology"
                    required
                    placeholder="Ex: Lesão no joelho"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment_start_date">Início do Tratamento *</Label>
                  <Input
                    id="treatment_start_date"
                    name="treatment_start_date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="session_package">Pacote de Sessões *</Label>
                  <Input
                    id="session_package"
                    name="session_package"
                    required
                    placeholder="Ex: 10 sessões"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Cadastrar Paciente"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPatient;
