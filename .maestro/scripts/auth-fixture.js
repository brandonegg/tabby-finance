const response = http.post(`${API_BASE_URL}/api/test/maestro-auth-user`, {
  body: JSON.stringify({
    action: AUTH_FIXTURE_ACTION,
    name: AUTH_NAME,
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  }),
  headers: {
    "Content-Type": "application/json",
    "x-tabby-e2e-fixture": "maestro",
  },
});

if (!response.ok) {
  throw new Error(`Fixture request failed with status ${response.status}: ${response.body}`);
}

output.fixture = json(response.body);
