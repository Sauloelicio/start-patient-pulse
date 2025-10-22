import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientCard from "@/components/PatientCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

const Patients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Query para contar total de pacientes
  const { data: totalCount } = useQuery({
    queryKey: ["patients-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query paginada
  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      return data;
    },
  });

  const filteredPatients = patients?.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.pathology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar por nome ou patologia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base shadow-card"
          />
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
        ) : filteredPatients && filteredPatients.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
            
            {!searchTerm && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : searchTerm ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-card rounded-lg p-12 shadow-card max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Tente pesquisar com outros termos
              </p>
            </div>
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
