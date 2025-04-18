import axios from 'axios';
const API_URL = 'http://localhost:8000';

async function testInvitation() {
  try {
    console.log('\n=== Testing Issuance Flow ===');
    const issuanceResponse = await axios.post(`${API_URL}/message`, {
      goalCode: 'streamlined-vc',
    });

    // Get the original invitation data
    const invitationData = issuanceResponse.data;

    // Convert the invitation data to a string and then base64 encode it
    const invitationString = JSON.stringify(invitationData);
    const base64Invitation = Buffer.from(invitationString)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // URL-safe base64 encoding

    // Format the response in the expected format
    const formattedResponse = {
      invitationId: invitationData.id,
      oobContentData: `didcomm://?_oob=${base64Invitation}`,
    };

    console.log(
      'Issuance Response:',
      JSON.stringify(formattedResponse, null, 2),
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
