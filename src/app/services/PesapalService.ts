// src/app/services/PesapalService.ts
import { http_post, http_get } from './Api';
import ToastService from './ToastService';

export interface PesapalInitializeRequest {
  order_id: number;
  amount: number;
  currency: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  callback_url?: string;
  description?: string;
}

export interface PesapalInitializeResponse {
  success: boolean;
  data?: {
    order_tracking_id: string;
    redirect_url: string;
    merchant_reference: string;
  };
  message: string;
}

export interface PesapalStatusResponse {
  success: boolean;
  data?: {
    payment_status: string;
    payment_method?: string;
    payment_status_description?: string;
    amount?: number;
    currency?: string;
    is_paid?: boolean;
    order_state?: string;
    order_id?: number;
    order_tracking_id?: string;
    merchant_reference?: string;
  };
  message: string;
}

export interface PesapalPaymentGateway {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

class PesapalService {
  private static readonly BASE_PATH = 'pesapal';

  /**
   * Initialize a payment with Pesapal
   */
  static async initializePayment(request: PesapalInitializeRequest): Promise<PesapalInitializeResponse> {
    try {
      console.log('PesapalService: Initializing payment', request);
      
      const response = await http_post(`${this.BASE_PATH}/initialize`, request);
      
      console.log('PesapalService: Initialize response', response);
      
      if (response.code === 1 && response.data) {
        ToastService.info('Redirecting to payment gateway...', { autoClose: 3000 });
        return {
          success: true,
          data: response.data,
          message: response.message || 'Payment initialized successfully'
        };
      } else {
        const errorMessage = response.message || 'Failed to initialize payment';
        ToastService.paymentError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (error: any) {
      console.error('PesapalService: Initialize payment error', error);
      
      // Extract server message from response if available
      let errorMessage = 'Failed to initialize payment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && !error.message.includes('status code')) {
        errorMessage = error.message;
      }
      
      ToastService.paymentError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(orderId: number): Promise<PesapalStatusResponse> {
    try {
      console.log('PesapalService: Checking payment status for order', orderId);
      
      const response = await http_get(`${this.BASE_PATH}/status/${orderId}`);
      
      console.log('PesapalService: Status response', response);
      
      if (response.code === 1) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Payment status retrieved successfully'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to check payment status'
        };
      }
    } catch (error: any) {
      console.error('PesapalService: Check payment status error', error);
      return {
        success: false,
        message: error.message || 'Failed to check payment status'
      };
    }
  }

  /**
   * Test Pesapal connectivity
   */
  static async testConnectivity(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('PesapalService: Testing connectivity');
      
      const response = await http_post(`${this.BASE_PATH}/test`, {});
      
      console.log('PesapalService: Test response', response);
      
      return {
        success: response.code === 1,
        message: response.message || 'Connectivity test completed'
      };
    } catch (error: any) {
      console.error('PesapalService: Test connectivity error', error);
      return {
        success: false,
        message: error.message || 'Failed to test connectivity'
      };
    }
  }

  /**
   * Get available payment methods/gateways
   */
  static async getPaymentGateways(): Promise<PesapalPaymentGateway[]> {
    try {
      const response = await http_get(`${this.BASE_PATH}/config`);
      
      if (response.code === 1 && response.data?.payment_gateways) {
        return response.data.payment_gateways;
      }
      
      // Return default payment gateways if not configured
      return [
        {
          id: 'pesapal',
          name: 'Pesapal',
          description: 'Pay with Mobile Money, Credit Card, or Bank Transfer',
          enabled: true,
          icon: 'bi-credit-card'
        }
      ];
    } catch (error) {
      console.error('PesapalService: Get payment gateways error', error);
      return [
        {
          id: 'pesapal',
          name: 'Pesapal',
          description: 'Pay with Mobile Money, Credit Card, or Bank Transfer',
          enabled: true,
          icon: 'bi-credit-card'
        }
      ];
    }
  }

  /**
   * Process payment callback (for internal use)
   */
  static handlePaymentCallback(
    orderTrackingId: string, 
    merchantReference: string, 
    onSuccess?: (data: any) => void,
    onError?: (error: string) => void
  ) {
    // This would typically be handled by the backend
    // Frontend just needs to detect when user returns from payment
    console.log('PesapalService: Handling payment callback', { orderTrackingId, merchantReference });
    
    // You can implement additional logic here to handle post-payment actions
    if (onSuccess) {
      onSuccess({ orderTrackingId, merchantReference });
    }
  }

  /**
   * Redirect to Pesapal payment page
   */
  static redirectToPayment(redirectUrl: string) {
    console.log('PesapalService: Redirecting to payment', redirectUrl);
    
    // Open in same window for mobile compatibility
    window.location.href = redirectUrl;
  }

  /**
   * Open payment in new tab/window (for desktop)
   */
  static openPaymentWindow(redirectUrl: string, width: number = 800, height: number = 600) {
    console.log('PesapalService: Opening payment window', redirectUrl);
    
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    const popup = window.open(
      redirectUrl,
      'pesapal_payment',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (!popup) {
      ToastService.error('Popup blocked. Please allow popups and try again, or use direct payment.');
      // Fallback to direct redirect
      this.redirectToPayment(redirectUrl);
    }
    
    return popup;
  }

  /**
   * Create callback URL based on current location
   */
  static createCallbackUrl(orderId: number): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/callback/${orderId}`;
  }

  /**
   * Format payment amount for display
   */
  static formatAmount(amount: number, currency: string = 'UGX'): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get payment status color for UI
   */
  static getPaymentStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'warning';
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get payment status icon for UI
   */
  static getPaymentStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'bi-check-circle-fill';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'bi-clock-fill';
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle-fill';
    }
  }
}

export default PesapalService;
