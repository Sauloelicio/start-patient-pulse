import { supabase } from "@/integrations/supabase/client";

export interface BackupData {
  patients: any[];
  sessions: any[];
  evaluations: any[];
  exportDate: string;
}

export const fetchAllData = async (): Promise<BackupData> => {
  const [patientsResult, sessionsResult, evaluationsResult] = await Promise.all([
    supabase.from("patients").select("*").order("created_at", { ascending: false }),
    supabase.from("sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("evaluations").select("*").order("created_at", { ascending: false }),
  ]);

  if (patientsResult.error) throw patientsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (evaluationsResult.error) throw evaluationsResult.error;

  return {
    patients: patientsResult.data || [],
    sessions: sessionsResult.data || [],
    evaluations: evaluationsResult.data || [],
    exportDate: new Date().toISOString(),
  };
};

export const exportToJSON = async () => {
  const data = await fetchAllData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = async () => {
  const data = await fetchAllData();
  
  // Converter pacientes para CSV
  const patientsCSV = convertToCSV(data.patients, [
    "id", "name", "phone", "pathology", "session_package", 
    "treatment_start_date", "created_at", "photo_url"
  ]);

  // Converter sessões para CSV
  const sessionsCSV = convertToCSV(data.sessions, [
    "id", "patient_id", "session_date", "evolution", "created_at"
  ]);

  // Combinar tudo em um único CSV
  const combinedCSV = `PACIENTES\n${patientsCSV}\n\nSESSÕES\n${sessionsCSV}`;
  
  const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const convertToCSV = (data: any[], columns: string[]): string => {
  if (!data || data.length === 0) return "";
  
  // Cabeçalho
  const header = columns.join(",");
  
  // Linhas de dados
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col];
      // Escapar aspas e vírgulas
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(",");
  });
  
  return [header, ...rows].join("\n");
};
