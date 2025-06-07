import axios from 'axios';
import * as qrcode from 'qrcode-terminal';

// const API_URL = 'http://localhost:8000';
const API_URL = 'https://message-manager-production.up.railway.app';

async function testInvitation() {
  try {
    console.log('\n=== Testing Issuance Flow with Schema ===');

    const credentialSchema = {
      types: ['SampleCredential'],
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'name',
          required: false,
          description: '',
        },
        {
          name: 'startup',
          type: 'text',
          label: 'startup',
          required: false,
          description: '',
        },
      ],
      heroImage: 'https://i.imgur.com/3rb67qx.jpeg',
      oneTimeUse: true,
      displayOptions: {
        textColor: '#000000',
        backgroundColor: '#ffffff',
      },
      expirationDays: 30,
    };

    // Mock data based on the schema fields
    const mockCredentialSubject: any = {};
    credentialSchema.fields.forEach((field) => {
      // Provide sample mock data based on field name or type
      if (field.name === 'name') {
        mockCredentialSubject[field.name] = 'Mock User Name';
      } else if (field.name === 'startup') {
        mockCredentialSubject[field.name] = 'Mock Startup Name';
      } else {
        mockCredentialSubject[field.name] = `Mock ${field.type} data`;
      }
    });

    // Construct credentialData based on the schema and mocked data
    const credentialData = {
      // issuerDid: 'did:quarkid:EiAio855zQwqHqcJOPx5NrM_sKWaqfZJ8Efs552cb9A7aQ',
      nameDid: 'Mock Issuer Name',
      credentialSubject: mockCredentialSubject,
      options: {
        expirationDays: credentialSchema.expirationDays,
        oneTimeUse: credentialSchema.oneTimeUse,
        displayTitle:
          credentialSchema.types.length > 0
            ? credentialSchema.types[0]
            : 'Credential',
        displaySubtitle: 'Issued by Mock Issuer',
        displayDescription: 'This is a mock credential based on a schema.',
        type: credentialSchema.types,
        heroImage: credentialSchema.heroImage,
      },
      styles: {
        background: { color: credentialSchema.displayOptions.backgroundColor },
        thumbnail: {
          uri: 'https://example.com/mock_thumb.png',
          alt: 'Mock Thumb',
        }, // Mock thumbnail
        hero: { uri: credentialSchema.heroImage, alt: 'Hero' }, // Use schema heroImage
        text: { color: credentialSchema.displayOptions.textColor },
      },
      issuer: {
        name: 'Mock Issuer Name', // Use mock issuer name
        styles: {
          // Mock issuer styles
          thumbnail: {
            uri: 'https://example.com/mock_issuer_thumb.png',
            alt: 'Mock Issuer Thumb',
          },
          hero: {
            uri: 'https://example.com/mock_issuer_hero.png',
            alt: 'Mock Issuer Hero',
          },
          background: { color: '#cccccc' },
          text: { color: '#333333' },
        },
      },
    };

    const issuanceResponse = await axios.post(
      `${API_URL}/message`,
      {
        goalCode: 'streamlined-vc',
        credentialData: credentialData,
      },
      {
        headers: {
          'x-api-key': 'a2Fpem9rdcWNIG5pIG9yZSB3YSBuYXJ1',
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
