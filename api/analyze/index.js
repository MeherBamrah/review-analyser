const fetch = require("node-fetch");

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = { status: 200, body: "" };
    return;
  }

  const text = req.body && req.body.text;
  if (!text) {
    context.res = { status: 400, body: { error: "No text provided" } };
    return;
  }

  const KEY = process.env.LANGUAGE_KEY;
  const ENDPOINT = process.env.LANGUAGE_ENDPOINT;

  if (!KEY || !ENDPOINT) {
    context.res = { status: 500, body: { error: "Missing environment variables" } };
    return;
  }

  const call = async (kind) => {
    const res = await fetch(
      `${ENDPOINT}language/:analyze-text?api-version=2023-04-01`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kind,
          analysisInput: {
            documents: [{ id: "1", language: "en", text }]
          }
        })
      }
    );
    return res.json();
  };

  const [sentimentRes, keyPhraseRes] = await Promise.all([
    call("SentimentAnalysis"),
    call("KeyPhraseExtraction")
  ]);

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      sentiment: sentimentRes.results.documents[0].sentiment,
      keyPhrases: keyPhraseRes.results.documents[0].keyPhrases
    }
  };
};
