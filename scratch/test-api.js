// scratch/test-api.js
async function runTests() {
  const API_URL = 'http://localhost:4000';
  console.log("Starting API integration tests against:", API_URL);

  try {
    // 1. Authenticate with mock development mode
    console.log("\n1. Testing /auth/telegram...");
    const authRes = await fetch(`${API_URL}/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: 'mock_development_mode' })
    });
    
    if (!authRes.ok) throw new Error(`Auth failed with status ${authRes.status}`);
    const { token, user } = await authRes.data ?? await authRes.json();
    console.log("Authenticated successfully!");
    console.log("Token:", token.substring(0, 15) + "...");
    console.log("User:", user);

    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    };

    // 2. Create Exam Session
    console.log("\n2. Testing POST /exam-sessions...");
    const sessionRes = await fetch(`${API_URL}/exam-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subject: 'Herrega' })
    });
    if (!sessionRes.ok) throw new Error(`Session creation failed: ${sessionRes.status}`);
    const session = await sessionRes.json();
    console.log("Session created successfully:", session);

    // 3. Get Questions for the session
    console.log("\n3. Hydrating questions from session...");
    const hydratedQuestions = [];
    for (const qId of session.questionIds) {
      const qRes = await fetch(`${API_URL}/questions/${qId}`, { headers });
      if (qRes.ok) hydratedQuestions.push(await qRes.json());
    }
    console.log(`Successfully fetched ${hydratedQuestions.length} questions.`);
    console.log("First question:", hydratedQuestions[0].questionText);

    // 4. Save Answer
    console.log("\n4. Testing PATCH /exam-sessions/:id/answer...");
    const answerRes = await fetch(`${API_URL}/exam-sessions/${session.id}/answer`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        questionId: session.questionIds[0],
        selectedIndex: 1
      })
    });
    if (!answerRes.ok) throw new Error(`Save answer failed: ${answerRes.status}`);
    console.log("Answer saved successfully:", await answerRes.json());

    // 5. Submit Exam
    console.log("\n5. Testing POST /exam-sessions/:id/submit...");
    const submitRes = await fetch(`${API_URL}/exam-sessions/${session.id}/submit`, {
      method: 'POST',
      headers
    });
    if (!submitRes.ok) throw new Error(`Submit failed: ${submitRes.status}`);
    const submitData = await submitRes.json();
    console.log("Exam submitted successfully. Score:", submitData.score);

    console.log("\n✅ ALL BACKEND ENDPOINTS ARE WORKING PERFECTLY!");
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error(error.message);
  }
}

runTests();
