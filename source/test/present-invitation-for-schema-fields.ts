import axios from 'axios';
import * as qrcode from 'qrcode-terminal';

const API_URL = 'http://localhost:8000';
// const API_URL = 'https://message-manager-production.up.railway.app';

async function testInvitation() {
  try {
    console.log('\n=== Testing Presentation Flow for Schema Fields ==='); // Updated log message
    const issuanceResponse = await axios.post(
      `${API_URL}/message`,
      {
        goalCode: 'streamlined-vp',
        presentationData: [
          // Data for schema fields
          {
            id: 'schema-fields-verification', // Unique ID for this descriptor
            name: 'Schema Fields Verification', // Descriptive name
            purpose: 'To verify the name and startup fields from a credential.', // Purpose
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.name'],
                  filter: {
                    type: 'string',
                  },
                },
                {
                  path: ['$.credentialSubject.startup'],
                  filter: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        ],
      },
      {
        headers: {
          'x-api-key': process.env.TOKEN_SECRET,
        },
      },
    );

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
      'Presentation Response:', // Updated log message
      JSON.stringify(formattedResponse, null, 2),
    );

    console.log('\n=== QR Code ===');
    qrcode.generate(formattedResponse.oobContentData, { small: true });
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
