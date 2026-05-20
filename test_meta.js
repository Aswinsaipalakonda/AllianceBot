require('dotenv').config({ path: '.env.local' });

async function run() {
  const phoneId = process.env.META_PHONE_NUMBER_ID;
  const token = process.env.META_PERMANENT_TOKEN;
  const to = '917093664846'; // The user's active test phone number from URL
  const text = 'Hello from Alliance College admissions support! This is a manual test message to verify connectivity.';

  console.log('Phone ID:', phoneId);
  console.log('Token starts with:', token ? token.substring(0, 10) + '...' : 'none');

  if (!phoneId || !token) {
    console.error('Credentials missing');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const responseData = await response.json();
    console.log('Status code:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

run();
