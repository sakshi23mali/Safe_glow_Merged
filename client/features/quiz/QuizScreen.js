import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUESTIONS = [
  {
    id: "q1",
    q: "How does your skin feel a few hours after washing?",
    options: [
      { id: "a", text: "Tight or dry", value: "dry" },
      { id: "b", text: "Comfortable", value: "normal" },
      { id: "c", text: "Shiny / oily", value: "oily" },
      { id: "d", text: "Dry in some places, oily in others", value: "combination" },
    ],
  },
  {
    id: "q2",
    q: "Do you get acne or breakouts often?",
    options: [
      { id: "a", text: "Rarely", value: "normal" },
      { id: "b", text: "Sometimes", value: "combination" },
      { id: "c", text: "Often", value: "oily" },
    ],
  },
  {
    id: "q3",
    q: "How sensitive is your skin to new products?",
    options: [
      { id: "a", text: "Very sensitive", value: "sensitive" },
      { id: "b", text: "Somewhat sensitive", value: "normal" },
      { id: "c", text: "Not sensitive", value: "oily" },
    ],
  },
  {
    id: "q4",
    q: "How visible are your pores?",
    options: [
      { id: "a", text: "Small / barely visible", value: "dry" },
      { id: "b", text: "Visible on T-zone only", value: "combination" },
      { id: "c", text: "Large / visible everywhere", value: "oily" },
    ],
  },
  {
    id: "q5",
    q: "How does your skin feel during the day?",
    options: [
      { id: "a", text: "Tight / flaky", value: "dry" },
      { id: "b", text: "Comfortable", value: "normal" },
      { id: "c", text: "Greasy or shiny", value: "oily" },
    ],
  },
  {
    id: "q6",
    q: "After waking up in the morning, how does your skin look?",
    options: [
      { id: "a", text: "Dry and dull", value: "dry" },
      { id: "b", text: "Shiny on forehead/nose", value: "combination" },
      { id: "c", text: "Oily everywhere", value: "oily" },
      { id: "d", text: "Normal and fresh", value: "normal" },
    ],
  },
  {
    id: "q7",
    q: "How often does your skin feel itchy or irritated?",
    options: [
      { id: "a", text: "Very often", value: "sensitive" },
      { id: "b", text: "Sometimes", value: "combination" },
      { id: "c", text: "Rarely / never", value: "normal" },
    ],
  },
  {
    id: "q8",
    q: "Does your makeup last throughout the day?",
    options: [
      { id: "a", text: "It fades quickly / patches", value: "dry" },
      { id: "b", text: "Lasts on cheeks but oily on T-zone", value: "combination" },
      { id: "c", text: "Gets shiny quickly", value: "oily" },
      { id: "d", text: "Lasts normally", value: "normal" },
    ],
  },
  {
    id: "q9",
    q: "How does your skin react to sun exposure?",
    options: [
      { id: "a", text: "Burns / turns red easily", value: "sensitive" },
      { id: "b", text: "Tans slowly", value: "normal" },
      { id: "c", text: "No reaction / gets oily", value: "oily" },
    ],
  },
  {
    id: "q10",
    q: "End of day skin condition?",
    options: [
      { id: "a", text: "Feels rough or flaky", value: "dry" },
      { id: "b", text: "Shiny nose/forehead only", value: "combination" },
      { id: "c", text: "Very oily overall", value: "oily" },
      { id: "d", text: "Feels normal", value: "normal" },
    ],
  },
];

export default function QuizScreen({ navigation }) {
  const [answers, setAnswers] = useState({});

  const setAnswer = (qid, val) => setAnswers((s) => ({ ...s, [qid]: val }));

  const finishQuiz = () => {
    let tally = {};
    Object.values(answers).forEach((v) => (tally[v] = (tally[v] || 0) + 1));
    const top =
      Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || "normal";
    navigation.replace("Camera", { skinType: top });
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skin Type Quiz</Text>

      <FlatList
        data={QUESTIONS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.qBox}>
            <Text style={styles.qText}>{item.q}</Text>
            {item.options.map((opt) => {
              const selected = answers[item.id] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.opt, selected && styles.optSel]}
                  onPress={() => setAnswer(item.id, opt.value)}
                >
                  <Text style={[styles.optText, selected && { fontWeight: "700" }]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.finishBtn, !allAnswered && { opacity: 0.5 }]}
        disabled={!allAnswered}
        onPress={finishQuiz}
      >
        <Text style={styles.finishText}>Finish Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  qBox: { marginBottom: 20 },
  qText: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  opt: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
  },
  optSel: {
    backgroundColor: "#b388ff",
    borderColor: "#6200ee",
  },
  optText: { fontSize: 16 },
  finishBtn: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  finishText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

