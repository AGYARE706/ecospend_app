const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function getExpenses(userId) {
  const url = userId ? `${API_BASE_URL}/expenses?userId=${userId}` : `${API_BASE_URL}/expenses`;
  const response = await fetch(url);
  return response.json();
}

export async function createExpense(expense) {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return response.json();
}

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  return response.json();
}
