import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const emojis = ["😀", "😍", "😊", "😐", "😢", "😠", "🥳", "💪", "🙌", "❤️"];

const feedbackPhrases = [
  "Parabéns, ótimo atendimento!",
  "Fui muito bem atendido(a)!",
  "Sessão excelente!",
  "Equipe muito atenciosa!",
  "Senti melhora hoje!",
  "Adoro vir aqui!",
  "Foi ótimo!",
  "Muito bom!",
  "Excelente profissional!",
  "Recomendo a START!",
];

const Evaluation = () => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [currentEvalIndex, setCurrentEvalIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: evaluations } = useQuery({
    queryKey: ["evaluations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const submitEvaluation = useMutation({
    mutationFn: async () => {
      if (!selectedEmoji) return;
      
      const { error } = await supabase.from("evaluations").insert({
        emoji: selectedEmoji,
        feedback_text: selectedPhrase,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        setSelectedEmoji(null);
        setSelectedPhrase(null);
      }, 3000);
    },
  });

  useEffect(() => {
    if (evaluations && evaluations.length > 0) {
      const interval = setInterval(() => {
        setCurrentEvalIndex((prev) => (prev + 1) % evaluations.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [evaluations]);

  const handleSubmit = () => {
    if (!selectedEmoji) {
      toast.error("Por favor, selecione um emoji");
      return;
    }
    submitEvaluation.mutate();
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-8">
        <div className="text-center animate-scale-in">
          <h2 className="text-6xl font-bold text-primary-foreground mb-4">
            Obrigado por avaliar a START!
          </h2>
          <p className="text-3xl text-primary-foreground/90">
            Sua opinião é muito importante ❤️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-8 text-center animate-fade-in">
          Como foi sua sessão de hoje na START?
        </h1>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-4 mb-12 animate-scale-in">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-6xl md:text-7xl p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${
                selectedEmoji === emoji
                  ? "bg-accent scale-110 shadow-elevated"
                  : "bg-primary-foreground/20 hover:bg-primary-foreground/30"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12 w-full animate-slide-up">
          {feedbackPhrases.map((phrase) => (
            <Button
              key={phrase}
              onClick={() => setSelectedPhrase(phrase)}
              variant={selectedPhrase === phrase ? "default" : "secondary"}
              className={`text-sm md:text-base h-auto py-4 px-6 transition-all duration-300 ${
                selectedPhrase === phrase
                  ? "bg-accent hover:bg-accent/90 scale-105 shadow-elevated"
                  : "bg-primary-foreground hover:bg-primary-foreground/90"
              }`}
            >
              {phrase}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedEmoji || submitEvaluation.isPending}
          size="lg"
          className="text-2xl px-16 py-8 bg-accent hover:bg-accent/90 shadow-elevated animate-scale-in"
        >
          Enviar minha avaliação
        </Button>
      </div>

      {evaluations && evaluations.length > 0 && (
        <div className="mt-12 bg-primary-foreground/10 rounded-3xl p-8 backdrop-blur-sm animate-fade-in">
          <h3 className="text-2xl font-semibold text-primary-foreground mb-6 text-center">
            Avaliações Recentes
          </h3>
          <div className="flex items-center justify-center min-h-[100px]">
            <div className="text-center transition-all duration-500 animate-fade-in">
              <div className="text-6xl mb-4">{evaluations[currentEvalIndex].emoji}</div>
              {evaluations[currentEvalIndex].feedback_text && (
                <p className="text-2xl text-primary-foreground/90">
                  "{evaluations[currentEvalIndex].feedback_text}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <p className="text-primary-foreground/70 text-lg">
          START – Fisioterapia Ortopédica e Esportiva
        </p>
      </div>
    </div>
  );
};

export default Evaluation;
