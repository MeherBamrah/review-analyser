const fetch = require("node-fetch");

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = { status: 200, body: "" };
    return;
  }

  const text = req.body && req.body.text;
  const KEY = process.env.LANGUAGE_KEY;
  const ENDPOINT = process.env.LANGUAGE_ENDPOINT;

  try {
    const rawRes = await fetch(
      `${ENDPOINT}language/:analyze-text?api-version=2023-04-01`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kind: "SentimentAnalysis",
          analysisInput: {
            documents: [{ id: "1", language: "en", text }]
          }
        })
      }
    );

    const rawText = await rawRes.text(); // read as plain text, not JSON

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { debug: rawText, status: rawRes.status }
    };

  } catch (e) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { error: e.message }
    };
  }
};
