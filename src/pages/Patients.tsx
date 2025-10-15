import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientCard from "@/components/PatientCard";

const Patients = () => {
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Pacientes
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus pacientes e acompanhe a evolução
            </p>
          </div>
          <Button
            onClick={() => navigate("/patients/new")}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Paciente
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-card rounded-lg animate-pulse shadow-card"
              />
            ))}
          </div>
        ) : patients && patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-card rounded-lg p-12 shadow-card max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Nenhum paciente cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Comece adicionando seu primeiro paciente
              </p>
              <Button
                onClick={() => navigate("/patients/new")}
                className="bg-gradient-primary"
              >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Paciente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
