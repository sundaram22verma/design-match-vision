import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:1010';

async function testBackend() {
  console.log('🧪 Testing Figma-to-Code Comparison Backend\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check Response:', healthData);
    console.log('');

    // Test 2: Compare Images (with sample data)
    console.log('2️⃣ Testing Image Comparison...');
    const compareData = {
      figmaImageUrl: 'hhttps://www.figma.com/design/sL3BXjIxnX2Zaqbta4e1NE/Loan-CalcD?node-id=0-1&t=15ph90yweftOGITr-0',
      pageUrl: 'https://hindi.economictimes.com/about-personal-loan-emi-calculator'
    };

    console.log('📤 Sending comparison request...');
    console.log('Figma URL:', compareData.figmaImageUrl);
    console.log('Page URL:', compareData.pageUrl);

    const compareResponse = await fetch(`${BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compareData)
    });

    if (compareResponse.ok) {
      const compareResult = await compareResponse.json();
      console.log('✅ Comparison Result:', compareResult);
      console.log('');
      
      // Test 3: Access generated images
      console.log('3️⃣ Testing Image Access...');
      
      const images = ['figma.png', 'code.png', 'diff.png'];
      for (const image of images) {
        try {
          const imageResponse = await fetch(`${BASE_URL}/${image}`);
          if (imageResponse.ok) {
            console.log(`✅ ${image} accessible`);
          } else {
            console.log(`❌ ${image} not accessible (${imageResponse.status})`);
          }
        } catch (error) {
          console.log(`❌ Error accessing ${image}:`, error.message);
        }
      }
    } else {
      const errorData = await compareResponse.json();
      console.log('❌ Comparison failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('💡 Make sure the backend server is running on port 1010');
    console.log('   Run: cd backend && npm start');
  }

  console.log('');
  console.log('🏁 Test completed!');
}

// Run the test
testBackend(); 