import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

export async function askStylist(
  message: string,
  wardrobe: any[]
) {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: `
You are StyleAI.
Only recommend clothes that exist in the user's wardrobe.
Explain your reasoning.
`,
      },
      {
        role: "user",
        content: `
Wardrobe:
${JSON.stringify(wardrobe)}

Question:
${message}
`,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}