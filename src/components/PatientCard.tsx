import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Phone, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
  id: string;
  name: string;
  phone: string;
  pathology: string;
  treatment_start_date: string;
  session_package: string;
  photo_url: string | null;
}

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      onClick={() => navigate(`/patients/${patient.id}`)}
      className="cursor-pointer hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] animate-scale-in"
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={patient.photo_url || undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{patient.name}</h3>
            <Badge variant="secondary" className="font-normal">
              <Activity className="h-3 w-3 mr-1" />
              {patient.pathology}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2 text-accent" />
            {patient.phone}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-accent" />
            Início: {format(new Date(patient.treatment_start_date), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Package className="h-4 w-4 mr-2 text-accent" />
            {patient.session_package}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
