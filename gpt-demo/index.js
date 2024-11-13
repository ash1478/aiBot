import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Set up OpenAI API configuration
const openai = new OpenAI({
  apiKey: ""
})
// Dummy knowledge base for RAG if-else logic
const knowledgeBase = {
  "phlebotomist status": "Phlebotomy (phlebo) appointments are generally expected to be completed within 60 minutes of the scheduled time. However, in some cases, this time may be extended to a maximum of 120 minutes due to factors such as scheduling adjustments, lab capacity, or operational delays. While efforts are made to adhere to the initial time frame, users should be aware that phlebotomist availability or logistical constraints could cause slight delays. If the scheduled time is exceeded, updates will be provided to keep users informed. If you have questions, please contact customer service.",
  "report download": "Report generation typically takes up to 48 hours but can be extended to 72 hours depending on various factors. In some cases, the report may contain partial data if certain tests are still pending completion. Once the full report is ready, it can be accessed and downloaded from the 'Reports' page under the corresponding booking. Delays in report generation are not uncommon and may occur due to factors such as testing schedules, lab processes, or unforeseen circumstances at the lab. While this may cause temporary inconvenience, users are encouraged to check the Reports page for updates on the status of their report.",
};

// Helper function for RAG-based retrieval
function retrieveContext(query) {
  if (query.toLowerCase().includes("appointment confirmation")) {
    return knowledgeBase["appointment confirmation"];
  } else if (query.toLowerCase().includes("phlebotomist") || query.toLowerCase().includes("phlebo")) {
    return knowledgeBase["phlebotomist status"];
  } else if (query.toLowerCase().includes("report")) {
    return knowledgeBase["report download"];
  } else if (query.toLowerCase().includes("cancel")) {
    return knowledgeBase["cancel appointment"];
  }
  return "";  // Default empty context if no match is found
}

// Route for handling queries
app.post('/query', async (req, res) => {
  const { userQuery } = req.body;

  // Retrieve relevant context based on the user query
  const context = retrieveContext(userQuery);

  // Formulate the prompt for OpenAI with the retrieved context
  const prompt = `Context:${context}\nUser query: ${userQuery}\nResponse:`;

  const message = {
    role: "user",
    content: prompt,
  }
  console.log({message})


  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [ { role: "system", content: "You are a helpful assistant. Be an advocate for patience. Formulate an answer based on the context given, and try to be short and straight, dont give any additional info" },message],
      temperature: 0.9,
      // max_completion_tokens: 100,
    });

    console.log(completion.choices)
    // Send the response from OpenAI
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
