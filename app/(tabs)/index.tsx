import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

/** --- Data (du kan legge til flere senere) --- */
type Q = {
  id: number;
  message: { from: string; subject: string; link: string };
  isPhishing: boolean;
  difficulty: "lett" | "middels" | "vanskelig";
  explanation: string;
};

const DATA: Q[] = [
  {
    id: 1,
    message: {
      from: "support@paypall.com",
      subject: "Din konto er sperret! Klikk for å bekrefte.",
      link: "http://paypall-login-secure.com",
    },
    isPhishing: true,
    difficulty: "lett",
    explanation: "Feilstavet domene (paypall ≠ paypal).",
  },
  {
    id: 2,
    message: {
      from: "no-reply@spotify.com",
      subject: "Kvittering for ditt abonnement",
      link: "https://www.spotify.com/account",
    },
    isPhishing: false,
    difficulty: "lett",
    explanation: "Ekte domenenavn og HTTPS.",
  },
  {
    id: 3,
    message: {
      from: "security@microsoft.com",
      subject: "[VIKTIG] Kontoen din er låst – bekreft nå",
      link: "https://microsoft365-security.com-login.xyz",
    },
    isPhishing: true,
    difficulty: "middels",
    explanation: "Mistenkelig domene som etterligner Microsoft.",
  },
  {
    id: 4,
    message: {
      from: "no-reply@altinn.no",
      subject: "Ny melding i Altinn",
      link: "https://www.altinn.no/",
    },
    isPhishing: false,
    difficulty: "lett",
    explanation: "Offisielt domene (altinn.no).",
  },
  {
    id: 5,
    message: {
      from: "noreply@dhl.com",
      subject: "Pakke på vei – betal tollavgift",
      link: "http://dhl-fee.net",
    },
    isPhishing: true,
    difficulty: "lett",
    explanation:
      "Ikke ekte DHL-domene. Seriøse aktører bruker https og eget domene.",
  },
  {
    id: 6,
    message: {
      from: "info@skatteetaten.no",
      subject: "Du har krav på skatterefusjon",
      link: "https://skatteetaten-refund.com",
    },
    isPhishing: true,
    difficulty: "middels",
    explanation: "Ikke skatteetaten.no – etterligning.",
  },
  {
    id: 7,
    message: {
      from: "appleid@id.apple.com",
      subject: "Varsel om innlogging",
      link: "https://appleid.apple.com/",
    },
    isPhishing: false,
    difficulty: "middels",
    explanation: "Korrekt Apple-domene.",
  },
  {
    id: 8,
    message: {
      from: "billing@netflix.com",
      subject: "Betaling mislyktes – oppdater kort",
      link: "https://netflix-billing.update-pay.com",
    },
    isPhishing: true,
    difficulty: "middels",
    explanation: "Ikke netflix.com – langt og mistenkelig domene.",
  },
  {
    id: 9,
    message: {
      from: "no-reply@slack.com",
      subject: "Du er invitert til et Slack-område",
      link: "https://join.slack.com/t/acme/shared_invite/123",
    },
    isPhishing: false,
    difficulty: "lett",
    explanation: "Typisk Slack-invitasjonslenke på slack.com.",
  },
  {
    id: 10,
    message: {
      from: "it-support@company.com",
      subject: "Ny sikkerhetsoppdatering – installer her",
      link: "https://bit.ly/4abCDEF",
    },
    isPhishing: true,
    difficulty: "vanskelig",
    explanation: "URL-forkorter skjuler destinasjonen.",
  },
];

/** --- Hjelp --- */
function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Stage = "start" | "play" | "result";

export default function Index() {
  const [stage, setStage] = useState<Stage>("start");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const current = questions[idx];
  const progress = questions.length ? Math.round(((idx + 1) / questions.length) * 100) : 0;

  function startGame() {
    setQuestions(shuffle(DATA));
    setIdx(0);
    setScore(0);
    setFeedback(null);
    setStage("play");
  }

  function chipColor(d: Q["difficulty"]) {
    if (d === "lett") return { bg: "#dbeafe", fg: "#1e3a8a" };
    if (d === "middels") return { bg: "#fef9c3", fg: "#92400e" };
    return { bg: "#f3e8ff", fg: "#6b21a8" }; // vanskelig
  }

  function handle(choice: boolean) {
    if (!current) return;
    const correct = choice === current.isPhishing;
    const newScore = correct ? score + 1 : score;
    setScore(newScore);

    setFeedback({
      correct,
      text: (correct ? "Riktig! " : "Feil. ") + current.explanation,
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFeedback(null);
      if (idx + 1 < questions.length) {
        setIdx((i) => i + 1);
      } else {
        setStage("result");
      }
    }, 1400);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /** --- STARTSKJERM --- */
  if (stage === "start") {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#f1f5f9" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 12 }}>
          🎮 Phishing Awareness
        </Text>
        <Text style={{ textAlign: "center", color: "#334155", marginBottom: 24 }}>
          Trykk start og avgjør om meldinger er 🚨 Phishing eller ✅ Trygge.
        </Text>
        <TouchableOpacity onPress={startGame} style={{ backgroundColor: "#2563eb", padding: 16, borderRadius: 14 }}>
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Start spillet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /** --- RESULTAT --- */
  if (stage === "result") {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f1f5f9" }}>
        <Text style={{ fontSize: 28, fontWeight: "900", textAlign: "center" }}>Game Over 🎉</Text>
        <Text style={{ textAlign: "center", marginTop: 8, color: "#334155" }}>
          Du fikk <Text style={{ fontWeight: "800" }}>{score}</Text> av{" "}
          <Text style={{ fontWeight: "800" }}>{questions.length}</Text> riktige.
        </Text>
        <Text style={{ textAlign: "center", marginTop: 6, color: "#475569" }}>
          Tips: sjekk domener, stavefeil og mistenkelige lenker.
        </Text>
        <TouchableOpacity onPress={startGame} style={{ marginTop: 20, backgroundColor: "#16a34a", padding: 16, borderRadius: 14 }}>
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "800" }}>Spill igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /** --- SPILL --- */
  const diff = chipColor(current?.difficulty ?? "middels");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 20 }}>
      {/* Progress bar */}
      <View style={{ height: 8, backgroundColor: "#e2e8f0", borderRadius: 999 }}>
        <View style={{ width: `${progress}%`, height: 8, backgroundColor: "#2563eb", borderRadius: 999 }} />
      </View>

      {/* Kort */}
      <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginTop: 16, elevation: 2 }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "800", flex: 1 }}>E-post #{idx + 1}</Text>
          <View style={{ backgroundColor: diff.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: diff.fg, fontWeight: "700", fontSize: 12 }}>
              {(current?.difficulty || "middels").toUpperCase()}
            </Text>
          </View>
        </View>

        <Text><Text style={{ fontWeight: "700" }}>Fra: </Text>{current?.message.from}</Text>
        <Text><Text style={{ fontWeight: "700" }}>Emne: </Text>{current?.message.subject}</Text>
        <Text><Text style={{ fontWeight: "700" }}>Lenke: </Text>{current?.message.link}</Text>

        {/* Knapper */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => handle(true)}
            style={{ flex: 1, backgroundColor: "#dc2626", padding: 14, borderRadius: 12 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>🚨 Phishing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handle(false)}
            style={{ flex: 1, backgroundColor: "#16a34a", padding: 14, borderRadius: 12 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>✅ Trygg</Text>
          </TouchableOpacity>
        </View>

        {/* Tilbakemelding */}
        {feedback && (
          <View
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              backgroundColor: feedback.correct ? "#dcfce7" : "#fee2e2",
              borderWidth: 1,
              borderColor: feedback.correct ? "#86efac" : "#fecaca",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  backgroundColor: feedback.correct ? "#16a34a" : "#dc2626",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {feedback.correct ? "RIKTIG" : "FEIL"}
                </Text>
              </View>
              <Text>{feedback.text}</Text>
            </View>

            {/* Fasit-badge */}
            <View
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                backgroundColor: current?.isPhishing ? "#fee2e2" : "#dcfce7",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: current?.isPhishing ? "#b91c1c" : "#166534",
                  fontWeight: "700",
                }}
              >
                FASIT: {current?.isPhishing ? "Phishing" : "Trygg"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={{ textAlign: "center", marginTop: 12, color: "#334155" }}>Score: {score}</Text>
    </ScrollView>
  );
}

