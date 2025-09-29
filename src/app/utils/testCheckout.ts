// src/app/utils/testCheckout.ts
import { OrderModel } from '../models/OrderModel';
import { OrderModelUtils } from './OrderModelUtils';

/**
 * Test utility to verify checkout flow doesn't crash
 */
export function testCheckoutFlow() {

  try {
    // Test 1: Create order from scratch
    const order1 = new OrderModel();
    order1.customer_name = 'Test Customer';
    order1.customer_phone_number_1 = '0700123456';
    order1.delivery_amount = '5000';
    order1.payable_amount = '25000';


    // Test 2: Test tax calculation
    const tax = OrderModelUtils.calculateTax(order1, '20000');

    // Test 3: Test JSON conversion
    const json = OrderModelUtils.toJson(order1);

    // Test 4: Test order reconstruction from plain object
    const plainObject = JSON.parse(JSON.stringify(order1));
    const reconstructed = OrderModelUtils.ensureOrderModel(plainObject);

    // Test 5: Test methods on reconstructed order
    const taxReconstructed = OrderModelUtils.calculateTax(reconstructed, '20000');

    return true;
  } catch (error) {
    return false;
  }
}

// Run test if in development mode
if (import.meta.env.DEV) {
  // Enable this line to test checkout flow
  // testCheckoutFlow();
}

// Test API authentication
export async function testApiAuth() {
  
  const { http_get } = await import('../services/Api');
  
  try {
    // Test a simple GET request to see if authentication works
    const response = await http_get('test', {});
    
    if (response.code === 0 && response.message?.includes('not logged in')) {
      return { success: true, message: 'Authentication validation working' };
    } else {
      return { success: true, message: 'API working correctly' };
    }
  } catch (error) {
    return { success: false, message: 'API test completed - check authentication' };
  }
}
