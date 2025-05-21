import axios from 'axios';
import * as qrcode from 'qrcode-terminal';

const API_URL = 'http://localhost:8000';
// const API_URL = 'https://message-manager-production.up.railway.app';

async function testInvitation() {
  try {
    console.log('\n=== Testing Issuance Flow ===');
    const issuanceResponse = await axios.post(`${API_URL}/message`, {
      goalCode: 'streamlined-vc',
      credentialData: { // Add sample credential data
        issuerDid: 'did:example:issuer123',
        nameDid: 'Example Issuer',
        credentialSubject: {
          firstName: 'Alice',
          lastName: 'Smith',
          degree: 'Computer Science',
        },
        options: {
          expirationDays: 30,
          oneTimeUse: true,
          displayTitle: 'University Degree! !!!',
          displaySubtitle: 'Verified by Example University',
          displayDescription: 'This credential verifies the holder\'s degree.',
          type: ['UniversityDegreeCredential'],
          heroImage: 'https://example.com/hero.png',
        },
        styles: {
          background: { color: '#abcdef' },
          thumbnail: { uri: 'https://example.com/thumb.png', alt: 'Thumb' },
          hero: { uri: 'https://example.com/hero.png', alt: 'Hero' },
          text: { color: '#123456' },
        },
        issuer: {
          name: 'Example University',
          styles: {
            thumbnail: { uri: 'https://example.com/issuer_thumb.png', alt: 'Issuer Thumb' },
            hero: { uri: 'https://example.com/issuer_hero.png', alt: 'Issuer Hero' },
            background: { color: '#fedcba' },
            text: { color: '#654321' },
          },
        },
      },
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
