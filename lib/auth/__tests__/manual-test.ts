// lib/auth/__tests__/manual-test.ts

/**
 * Manual Test Script for Password Utilities
 * 
 * Run with: npx tsx lib/auth/__tests__/manual-test.ts
 */

import {
  hashPassword,
  verifyPassword,
  validatePassword,
  validateAndHashPassword,
} from '../password';

async function runTests() {
  console.log('🧪 Testing Password Utilities\n');

  // Test 1: Password Validation
  console.log('Test 1: Password Validation');
  console.log('----------------------------');
  
  const testPasswords = [
    { password: '12345678', shouldPass: true },
    { password: 'abcdefgh', shouldPass: true },
    { password: 'P@ssw0rd!', shouldPass: true },
    { password: '1234567', shouldPass: false },
    { password: '', shouldPass: false },
    { password: 'short', shouldPass: false },
  ];

  for (const { password, shouldPass } of testPasswords) {
    const result = validatePassword(password);
    const status = result.isValid === shouldPass ? '✅' : '❌';
    console.log(
      `${status} "${password}" (${password.length} chars): ${
        result.isValid ? 'VALID' : 'INVALID - ' + result.errors.join(', ')
      }`
    );
  }

  console.log('\n');

  // Test 2: Password Hashing
  console.log('Test 2: Password Hashing');
  console.log('------------------------');
  
  const password = 'mySecurePassword123';
  console.log(`Original: ${password}`);
  
  const hash1 = await hashPassword(password);
  console.log(`Hash 1:   ${hash1}`);
  
  const hash2 = await hashPassword(password);
  console.log(`Hash 2:   ${hash2}`);
  
  console.log(
    `${hash1 !== hash2 ? '✅' : '❌'} Hashes are different (salt randomization)`
  );

  console.log('\n');

  // Test 3: Password Verification
  console.log('Test 3: Password Verification');
  console.log('------------------------------');
  
  const correctPassword = 'correctPassword123';
  const wrongPassword = 'wrongPassword123';
  const hash = await hashPassword(correctPassword);
  
  const isCorrect = await verifyPassword(correctPassword, hash);
  const isWrong = await verifyPassword(wrongPassword, hash);
  
  console.log(`${isCorrect ? '✅' : '❌'} Correct password verified: ${isCorrect}`);
  console.log(`${!isWrong ? '✅' : '❌'} Wrong password rejected: ${!isWrong}`);

  console.log('\n');

  // Test 4: Validate and Hash
  console.log('Test 4: Validate and Hash');
  console.log('-------------------------');
  
  try {
    const validHash = await validateAndHashPassword('validPassword');
    console.log(`✅ Valid password hashed successfully`);
    console.log(`   Hash: ${validHash.substring(0, 20)}...`);
  } catch (error) {
    console.log(`❌ Unexpected error: ${error}`);
  }

  try {
    await validateAndHashPassword('short');
    console.log(`❌ Invalid password should have thrown error`);
  } catch (error) {
    console.log(`✅ Invalid password rejected: ${(error as Error).message}`);
  }

  console.log('\n');

  // Test 5: Special Characters and Unicode
  console.log('Test 5: Special Characters and Unicode');
  console.log('---------------------------------------');
  
  const specialPasswords = [
    'P@ssw0rd!#$%',
    'pass word 123',
    'pässwörd',
    '密码12345678',
  ];

  for (const pwd of specialPasswords) {
    const hash = await hashPassword(pwd);
    const verified = await verifyPassword(pwd, hash);
    console.log(
      `${verified ? '✅' : '❌'} "${pwd}" - Hash and verify: ${verified}`
    );
  }

  console.log('\n✨ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
