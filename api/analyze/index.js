const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const { text } = req.body;
  const endpoint = process.env.LANGUAGE_ENDPOINT;
  const key = process.env.LANGUAGE_KEY;
  const call = (kind) => fetch(`${endpoint}language/:analyze-text?api-version=2023-04-01`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, analysisInput: { documents: [{ id: '1', language: 'en', text }] } })
  }).then(r => r.json());

  const sentimentRes = await call('SentimentAnalysis');
  const keyPhraseRes = await call('KeyPhraseExtraction');

  context.res = {
    body: {
      sentiment: sentimentRes.results.documents[0].sentiment,
      keyPhrases: keyPhraseRes.results.documents[0].keyPhrases
    }
  };
};
