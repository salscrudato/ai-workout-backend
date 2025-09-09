const https = require('https');

// Test workout generation with the production URL
const testWorkoutGeneration = async () => {
  const data = JSON.stringify({
    experience: 'intermediate',
    goals: ['strength', 'muscle_building'],
    workoutType: 'strength',
    equipmentAvailable: ['dumbbells', 'bench'],
    duration: 30,
    constraints: []
  });

  const options = {
    hostname: 'ai-workout-backend-2024.web.app',
    port: 443,
    path: '/v1/workouts/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'Bearer test-token' // This will fail auth but we can see the structure
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

// Test the health endpoint first
const testHealth = async () => {
  const options = {
    hostname: 'ai-workout-backend-2024.web.app',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Health Check Status Code:', res.statusCode);
        console.log('Health Check Response:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Health check error:', error);
      reject(error);
    });

    req.end();
  });
};

// Run tests
const runTests = async () => {
  console.log('Testing AI Workout Backend...\n');
  
  try {
    console.log('1. Testing health endpoint...');
    await testHealth();
    
    console.log('\n2. Testing workout generation endpoint...');
    await testWorkoutGeneration();
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTests();
