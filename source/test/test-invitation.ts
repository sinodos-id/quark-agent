import axios from 'axios';

const API_URL = 'http://localhost:8000';

async function testInvitation() {
  try {
    // Test Issuance Flow
    console.log('\n=== Testing Issuance Flow ===');
    const issuanceResponse = await axios.post(`${API_URL}/message`, {
      goalCode: 'streamlined-vc',
    });
    console.log(
      'Issuance Response:',
      JSON.stringify(issuanceResponse.data, null, 2),
    );

    // Test Presentation Flow
    console.log('\n=== Testing Get Credentials Flow ===');
    const presentationResponse = await axios.get(`${API_URL}/issued-vcs`);
    console.log(
      'vc:: >>>>',
      JSON.stringify(presentationResponse.data, null, 2),
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the test
testInvitation();
