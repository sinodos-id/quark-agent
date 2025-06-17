import 'dotenv/config';
import axios from 'axios';
import * as qrcode from 'qrcode-terminal';

const isProduction =
  process.argv.includes('--production') || process.argv.includes('-p');

const API_URL = isProduction
  ? 'https://message-manager-production.up.railway.app'
  : 'http://localhost:3000';

console.log(`Using API URL: ${API_URL}`);

async function testInvitation() {
  try {
    console.log('\n=== Testing Presentation Flow for Schema Fields ===');
    const issuanceResponse = await axios.post(
      `${API_URL}/message`,
      {
        goalCode: 'streamlined-vp',
        presentationData: [
          {
            id: 'schema-fields-verification',
            name: 'Schema Fields Verification',
            purpose: 'To verify the name and startup fields from a credential.',
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
      .replace(/=/g, '');

    const formattedResponse = {
      invitationId: invitationData.id,
      oobContentData: `didcomm://?_oob=${base64Invitation}`,
    };
    console.log(
      'Presentation Response:',
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

testInvitation();
